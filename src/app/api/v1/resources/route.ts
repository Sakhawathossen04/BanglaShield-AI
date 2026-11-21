// GET /api/v1/resources — verified resource directory (trusted contacts only)
// Reads from the database; falls back to a bundled snapshot when the DB is
// empty or unreachable so the emergency directory ALWAYS works.
import { db } from "@/lib/db";
import { ok } from "@/lib/api";
import { BUNDLED_RESOURCES } from "@/lib/resources-fallback";

export async function GET() {
  let rows: Awaited<ReturnType<typeof fetchResources>> | null = null;
  try {
    rows = await fetchResources();
  } catch {
    rows = null; // DB unreachable → bundled fallback below
  }

  if (!rows || rows.length === 0) {
    return ok({ resources: BUNDLED_RESOURCES, source: "bundled-fallback" });
  }

  return ok({
    resources: rows.map((r) => ({
      key: r.key,
      name: r.name,
      category: r.category,
      description: r.description,
      guidance: r.guidance,
      url: r.url,
      phone: r.phone,
      sourceUrl: r.sourceUrl,
      verifiedAt: r.verifiedAt.toISOString(),
    })),
    source: "database",
  });
}

function fetchResources() {
  return db.verifiedResource.findMany({
    where: { active: true },
    orderBy: { sort: "asc" },
  });
}
