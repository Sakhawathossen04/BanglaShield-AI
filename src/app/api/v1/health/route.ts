// GET /api/v1/health — system health & readiness (no sensitive details).
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok } from "@/lib/api";

export async function GET(_req: NextRequest) {
  const started = Date.now();
  let dbOk = false;
  try {
    await db.verifiedResource.count({ where: { active: true } });
    dbOk = true;
  } catch {
    dbOk = false;
  }

  return ok({
    status: dbOk ? "ok" : "degraded",
    checks: {
      database: dbOk ? "ok" : "fail",
      // AI provider is never probed here (no cost / no secrets); it is
      // exercised per-analysis and honestly labeled on failure.
      aiProvider: "per-case",
    },
    latencyMs: Date.now() - started,
    time: new Date().toISOString(),
  });
}
