// GET    /api/v1/analyses/{id} — session metadata + full validated result
// DELETE /api/v1/analyses/{id} — soft-delete (owner visitor only)
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, getVisitor } from "@/lib/api";
import { rateLimit, clientKey } from "@/lib/rate-limit";

const CASE_ID_RX = /^BS-[A-Z0-9]{8}$/;

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!CASE_ID_RX.test(id)) return fail("invalid-id", "ভুল কেস আইডি।", 400);

  const rl = rateLimit(clientKey(req, `case-read:${id}`), 200, 10 * 60_000);
  if (!rl.ok) return fail("rate-limited", "অনেক বেশি অনুরোধ। কিছুক্ষণ পরে চেষ্টা করুন।", 429);

  const session = await db.analysisSession.findUnique({
    where: { id },
    include: { evidence: true, report: { select: { id: true, status: true } } },
  });
  if (!session || session.deletedAt) return fail("not-found", "কেসটি খুঁজে পাওয়া যায়নি।", 404);

  return ok({
    id: session.id,
    modality: session.modality,
    status: session.status,
    stage: session.stage,
    engine: session.engine,
    riskCategory: session.riskCategory,
    scamCategory: session.scamCategory,
    createdAt: session.createdAt.toISOString(),
    completedAt: session.completedAt?.toISOString() ?? null,
    result: session.result ?? null,
    extractedText: session.extractedText,
    hasReport: Boolean(session.report),
    report: session.report ? { id: session.report.id, status: session.report.status } : null,
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!CASE_ID_RX.test(id)) return fail("invalid-id", "ভুল কেস আইডি।", 400);

  const visitor = getVisitor(req);
  if (!visitor) return fail("visitor-required", "সেশন শনাক্ত হয়নি।", 400);

  const session = await db.analysisSession.findUnique({ where: { id } });
  if (!session) return fail("not-found", "কেসটি খুঁজে পাওয়া যায়নি।", 404);

  // IDOR protection: only the creating visitor may delete.
  if (session.visitorId !== visitor) {
    return fail("forbidden", "এই কেসটি মুছার অনুমতি আপনার নেই।", 403);
  }

  await db.evidenceItem.deleteMany({ where: { sessionId: id } });
  await db.analysisSession.update({
    where: { id },
    data: { deletedAt: new Date(), status: "failed", stage: null, result: null, extractedText: null },
  });
  await db.auditEvent.create({
    data: {
      actorType: "citizen",
      action: "analysis.deleted",
      entityType: "AnalysisSession",
      entityId: id,
      detail: { by: "visitor" } as unknown as object,
    },
  });

  return ok({ deleted: true, id });
}
