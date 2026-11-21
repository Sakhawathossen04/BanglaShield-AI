// POST /api/v1/reports — voluntary, consented community scam report
// GET  /api/v1/reports?ref=RPT-XXXX — look up own report by reference id
import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { newReportId } from "@/lib/crypto";
import { ok, fail, readJson } from "@/lib/api";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { redactPII } from "@/lib/redact";

const ReportBody = z.object({
  sessionId: z.string().regex(/^BS-[A-Z0-9]{8}$/).optional(),
  category: z.string().min(2).max(40),
  content: z.string().min(10).max(4000),
  consentReport: z.literal(true),
  consentContact: z.boolean().default(false),
});

/** Extract safe correlation indicators (already-redacted content). */
function extractIndicators(text: string) {
  const phoneTails = Array.from(text.matchAll(/•(\d{4})\]|••(\d{4})\]/g)).map((m) => `****${m[1] ?? m[2]}`);
  const domains = Array.from(text.matchAll(/\b(?:[\w-]+\.)(?:com|net|org|xyz|top|club|online|site|icu|shop|info|buzz)\b/gi)).map((m) => m[0].toLowerCase());
  const phrases: string[] = [];
  const phraseSeeds = ["ওটিপি", "পিন", "লটারি", "জিতেছেন", "রেজিস্ট্রেশন ফি", "নতুন নম্বর", "AnyDesk", "অ্যাডভান্স", "ডেলিভারি চার্জ", "গ্রেপ্তার"];
  for (const s of phraseSeeds) if (text.includes(s)) phrases.push(s);
  return {
    phones: Array.from(new Set(phoneTails)).slice(0, 3),
    domains: Array.from(new Set(domains)).slice(0, 3),
    phrases: phrases.slice(0, 5),
  };
}

export async function POST(req: NextRequest) {
  const rl = rateLimit(clientKey(req, "reports"), 6, 60 * 60_000);
  if (!rl.ok) return fail("rate-limited", "অনেক বেশি রিপোর্ট এসেছে, একটু পরে চেষ্টা করুন।", 429, { retryAfterSec: rl.retryAfterSec });

  const body = await readJson<unknown>(req, 64 * 1024);
  const parsed = ReportBody.safeParse(body);
  if (!parsed.success) {
    return fail("invalid-input", "রিপোর্ট গ্রহণযোগ্য নয় — সম্মতি ও বিষয়বস্তু পরীক্ষা করুন।", 422);
  }

  const { text: redacted } = redactPII(parsed.data.content);
  const indicators = extractIndicators(redacted);
  const id = newReportId();

  // If tied to a session, link it (session must exist and not be deleted)
  let sessionId: string | null = null;
  if (parsed.data.sessionId) {
    const session = await db.analysisSession.findUnique({
      where: { id: parsed.data.sessionId },
      include: { report: { select: { id: true } } },
    });
    if (session && !session.deletedAt && !session.report) sessionId = session.id;
  }

  await db.report.create({
    data: {
      id,
      sessionId,
      category: parsed.data.category,
      riskCategory: null,
      contentRedacted: redacted,
      indicators: {
        phone: indicators.phones[0] ?? null,
        domain: indicators.domains[0] ?? null,
        phrases: indicators.phrases,
      } as unknown as object,
      status: "submitted",
      synthetic: false,
    },
  });
  if (sessionId) {
    await db.consentRecord.create({
      data: { sessionId, purpose: "reporting", granted: true },
    });
  }
  await db.auditEvent.create({
    data: {
      actorType: "citizen",
      action: "report.submitted",
      entityType: "Report",
      entityId: id,
      detail: { category: parsed.data.category, consentContact: parsed.data.consentContact } as unknown as object,
    },
  });

  return ok({ id, status: "submitted", note: "রিপোর্ট সংরক্ষিত হয়েছে (বেনামে)।" }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get("ref");
  if (!ref || !/^RPT-[A-Z0-9]{8}$/.test(ref)) {
    return fail("invalid-ref", "সঠিক রেফারেন্স আইডি দিন (RPT-…)।", 400);
  }
  const report = await db.report.findUnique({ where: { id: ref } });
  if (!report) return fail("not-found", "এই রেফারেন্সে কোনো রিপোর্ট নেই।", 404);
  return ok({
    id: report.id,
    status: report.status,
    category: report.category,
    submittedAt: report.submittedAt.toISOString(),
    contentRedacted: report.contentRedacted,
  });
}
