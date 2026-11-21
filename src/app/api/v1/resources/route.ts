// GET /api/v1/resources — verified resource directory (trusted contacts only)
import { db } from "@/lib/db";
import { ok } from "@/lib/api";

export async function GET() {
  const resources = await db.verifiedResource.findMany({
    where: { active: true },
    orderBy: { sort: "asc" },
  });

  return ok({
    resources: resources.map((r) => ({
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
  });
}
