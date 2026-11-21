// GET /api/v1/analyses/{id}/status — polling endpoint for real progress
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail } from "@/lib/api";

const CASE_ID_RX = /^BS-[A-Z0-9]{8}$/;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!CASE_ID_RX.test(id)) return fail("invalid-id", "ভুল কেস আইডি।", 400);

  const session = await db.analysisSession.findUnique({
    where: { id },
    select: { id: true, status: true, stage: true, riskCategory: true, error: true, deletedAt: true },
  });
  if (!session || session.deletedAt) return fail("not-found", "কেসটি খুঁজে পাওয়া যায়নি।", 404);

  return ok({
    id: session.id,
    status: session.status,
    stage: session.stage,
    riskCategory: session.riskCategory,
    error: session.error,
  });
}
