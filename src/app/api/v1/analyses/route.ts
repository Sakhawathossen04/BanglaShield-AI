// POST /api/v1/analyses — create an analysis session (no account required)
// GET  /api/v1/analyses — list the visitor's own sessions (privacy view)
import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { newCaseId } from "@/lib/crypto";
import { ok, fail, getVisitor, readJson } from "@/lib/api";
import { rateLimit, clientKey } from "@/lib/rate-limit";

const CreateBody = z.object({
  modality: z.enum(["voice", "message", "image", "link"]),
  language: z.enum(["bn", "en"]).default("bn"),
  consentAnalysis: z.literal(true), // explicit consent to process content
  consentRetention: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const rl = rateLimit(clientKey(req, "analyses"), 10, 10 * 60_000);
  if (!rl.ok)
    return fail(
      "rate-limited",
      "অনেক বেশি অনুরোধ এসেছে, কিছুক্ষণ পরে চেষ্টা করুন।",
      429,
      { retryAfterSec: rl.retryAfterSec }
    );

  const visitor = getVisitor(req);
  if (!visitor) return fail("visitor-required", "ব্রাউজার সেশন শনাক্ত করা যায়নি। পেজটি নতুন করে খুলুন।", 400);

  const body = await readJson<unknown>(req, 64 * 1024);
  const parsed = CreateBody.safeParse(body);
  if (!parsed.success) {
    return fail("invalid-input", "অনুরোধটি গ্রহণযোগ্য নয়। সম্মতিসহ আবার চেষ্টা করুন।", 422);
  }

  const id = newCaseId();
  await db.analysisSession.create({
    data: {
      id,
      visitorId: visitor,
      modality: parsed.data.modality,
      language: parsed.data.language,
      status: "awaiting_input",
      stage: "created",
    },
  });
  await db.consentRecord.create({
    data: {
      sessionId: id,
      purpose: "analysis",
      granted: true,
    },
  });
  if (parsed.data.consentRetention) {
    await db.consentRecord.create({
      data: { sessionId: id, purpose: "retention", granted: true },
    });
  }

  return ok({ id, status: "awaiting_input" }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const visitor = getVisitor(req);
  if (!visitor) return ok({ sessions: [] });

  const sessions = await db.analysisSession.findMany({
    where: { visitorId: visitor, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { report: { select: { id: true, status: true } } },
  });

  return ok({
    sessions: sessions.map((s) => ({
      id: s.id,
      modality: s.modality,
      status: s.status,
      riskCategory: s.riskCategory,
      scamCategory: s.scamCategory,
      engine: s.engine,
      createdAt: s.createdAt.toISOString(),
      completedAt: s.completedAt?.toISOString() ?? null,
      hasReport: Boolean(s.report),
      reportStatus: s.report?.status ?? null,
    })),
  });
}
