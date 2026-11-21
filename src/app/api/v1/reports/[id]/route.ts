// DELETE /api/v1/reports/{id} — withdraw a community report by reference id
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail } from "@/lib/api";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^RPT-[A-Z0-9]{8}$/.test(id)) return fail("invalid-id", "ভুল রেফারেন্স আইডি।", 400);

  const rl = rateLimit(clientKey(req, "report-withdraw"), 10, 60 * 60_000);
  if (!rl.ok) return fail("rate-limited", "অনেক বেশি অনুরোধ।", 429);

  const report = await db.report.findUnique({ where: { id } });
  if (!report) return fail("not-found", "এই রেফারেন্সে কোনো রিপোর্ট নেই।", 404);
  if (report.status === "withdrawn") return ok({ id, status: "withdrawn", already: true });

  await db.report.update({
    where: { id },
    data: { status: "withdrawn", reviewedAt: new Date() },
  });
  await db.auditEvent.create({
    data: {
      actorType: "citizen",
      action: "report.withdrawn",
      entityType: "Report",
      entityId: id,
      detail: { by: "reference-id-holder" } as unknown as object,
    },
  });

  return ok({ id, status: "withdrawn" });
}
