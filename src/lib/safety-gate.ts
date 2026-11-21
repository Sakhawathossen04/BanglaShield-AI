// ---------------------------------------------------------------------------
// Agent Safety Gate (mandatory security boundary).
// Validates every AI-produced payload through schema checks + policy rules
// BEFORE anything is shown to a citizen. Application-level enforcement, not
// prompt-based. If validation fails twice, the pipeline falls back to the
// deterministic rule-based engine.
// ---------------------------------------------------------------------------

import { z } from "zod";
import type {
  Bilingual,
  Evidence,
  Recommendation,
  ReplayStage,
  RiskCategory,
} from "./types";
import { SCAM_CATEGORIES } from "./types";
import { assessRisk } from "./heuristics";

// --- Curated recommendation templates (the ONLY advice wording we trust) ----

export interface RecTemplate {
  id: string;
  title: Bilingual;
  detail: Bilingual;
  priority: "now" | "soon" | "know";
  resourceKeys?: string[];
}

export const REC_TEMPLATES: Record<string, RecTemplate> = {
  T_STOP_NO_OTP: {
    id: "T_STOP_NO_OTP",
    title: { bn: "ওটিপি/পিন কাউকে দেবেন না", en: "Never share OTP/PIN with anyone" },
    detail: {
      bn: "ব্যাংক, বিকাশ, নগদ বা পুলিশ — কেউই কখনো আপনার ওটিপি বা পিন চায় না। চাইলেই সেটি প্রতারণা। কোডটি কাউকে না বলে নিজের অ্যাপে লিখুন।",
      en: "Banks, bKash, Nagad and police never ask for your OTP or PIN. Anyone who does is a scam. Enter codes only in your own app.",
    },
    priority: "now",
  },
  T_VERIFY_OFFICIAL: {
    id: "T_VERIFY_OFFICIAL",
    title: { bn: "নিজে থেকে অফিসিয়াল অ্যাপ/হেল্পলাইনে যাচাই করুন", en: "Verify yourself via the official app/helpline" },
    detail: {
      bn: "বার্তায় দেওয়া নম্বরে ফোন না করে নিজে অ্যাপ খুলে ব্যালেন্স/নোটিফিকেশন দেখুন, কিংবা কার্ডের পেছনে ছাপা নম্বরে কল করুন।",
      en: "Do not call numbers from the message. Open the official app yourself to check notifications/balance, or call the number printed on your card.",
    },
    priority: "now",
    resourceKeys: ["bkash", "nagad", "bangladesh-bank"],
  },
  T_DO_NOT_TRANSFER: {
    id: "T_DO_NOT_TRANSFER",
    title: { bn: "এখনই কোনো টাকা পাঠাবেন না", en: "Do not send money right now" },
    detail: {
      bn: "যাচাই না হওয়া পর্যন্ত কোনো 'পার্সোনাল নম্বরে' টাকা পাঠানো বন্ধ রাখুন। অগ্রিম ফি/চার্জ চাওয়া প্রায় সবসময়ই প্রতারণার লক্ষণ।",
      en: "Stop any transfer to a 'personal number' until fully verified. Requests for advance fees are almost always a scam.",
    },
    priority: "now",
  },
  T_DO_NOT_CLICK: {
    id: "T_DO_NOT_CLICK",
    title: { bn: "লিংকে ক্লিক করবেন না", en: "Do not click the link" },
    detail: {
      bn: "লিংকে ক্লিক না করে নিজে ব্রাউজারে প্রতিষ্ঠানের অফিসিয়াল ঠিকানা লিখে ঢুকুন। লগইন/ওটিপি চায় এমন লিংক কখনো বিশ্বাস করবেন না।",
      en: "Instead of clicking, type the institution's official web address yourself. Never trust links that ask for logins or OTPs.",
    },
    priority: "now",
  },
  T_NO_APP_INSTALL: {
    id: "T_NO_APP_INSTALL",
    title: { bn: "অজানা অ্যাপ/স্ক্রিন শেয়ার বন্ধ করুন", en: "Refuse unknown apps / screen sharing" },
    detail: {
      bn: "কারও বলায় AnyDesk, TeamViewer বা অজানা APK ইনস্টল করবেন না, স্ক্রিন শেয়ার করবেন না — এতে আপনার অ্যাকাউন্ট পুরো নিয়ন্ত্রণে চলে যেতে পারে।",
      en: "Never install AnyDesk, TeamViewer or unknown APKs, or share your screen on request — it can give full control of your account away.",
    },
    priority: "now",
  },
  T_CONTACT_PROVIDER: {
    id: "T_CONTACT_PROVIDER",
    title: { bn: "সাথে সাথে ব্যাংক/এমএফএস-এ জানান", en: "Contact your bank/MFS immediately" },
    detail: {
      bn: "অ্যাপের ভেতরের হেল্প সেকশন বা কার্ডের পেছনের নম্বর ব্যবহার করে নিজে যোগাযোগ করুন; বার্তার নম্বর নয়।",
      en: "Contact them yourself using in-app support or the number on your card — never a number from the message.",
    },
    priority: "now",
    resourceKeys: ["bkash", "nagad", "bangladesh-bank"],
  },
  T_PRESERVE_EVIDENCE: {
    id: "T_PRESERVE_EVIDENCE",
    title: { bn: "প্রমাণ সংরক্ষণ করুন", en: "Preserve the evidence" },
    detail: {
      bn: "বার্তার স্ক্রিনশট রাখুন, নম্বর ও সময় লিখে রাখুন, কিছু মুছবেন না — পরে অভিযোগ করতে কাজে লাগবে।",
      en: "Screenshot the messages, note numbers and times, and do not delete anything — it helps when you report.",
    },
    priority: "soon",
  },
  T_BLOCK_REPORT: {
    id: "T_BLOCK_REPORT",
    title: { bn: "নম্বর ব্লক ও রিপোর্ট করুন", en: "Block and report the number" },
    detail: {
      bn: "নম্বরটি ব্লক করুন এবং মেসেজিং অ্যাপের 'রিপোর্ট' অপশন ব্যবহার করুন। বাংলাদেশে সাইবার অপরাধ জানাতে হেল্পলাইন ৯৯৯ আছে।",
      en: "Block the number and use the messaging app's 'report' option. Cybercrime can be reported via the 999 helpline.",
    },
    priority: "soon",
    resourceKeys: ["police"],
  },
  T_INDEPENDENT_VERIFY: {
    id: "T_INDEPENDENT_VERIFY",
    title: { bn: "স্বাধীনভাবে যাচাই করুন", en: "Verify independently" },
    detail: {
      bn: "প্রেরকের দাবি অন্য কোনো উৎস থেকে নিশ্চিত না হলে বিশ্বাস করবেন না — পরিচিত কারও নামে এলে পুরনো নম্বরে ফোন করে জিজ্ঞেস করুন।",
      en: "Do not trust the claim until confirmed from another source — if it claims to be a contact, call their old number to check.",
    },
    priority: "now",
  },
  T_TALK_TO_FAMILY: {
    id: "T_TALK_TO_FAMILY",
    title: { bn: "একা সিদ্ধান্ত নেবেন না", en: "Do not decide alone" },
    detail: {
      bn: "চাপের মধ্যে বড় কোনো সিদ্ধান্ত নেওয়ার আগে পরিবারের বিশ্বস্ত কারও সাথে কথা বলুন।",
      en: "Before making any big decision under pressure, talk to a trusted family member.",
    },
    priority: "soon",
  },
  T_RECOVERY_CENTER: {
    id: "T_RECOVERY_CENTER",
    title: { bn: "জরুরি পদক্ষেপগুলো দেখুন", en: "See the emergency recovery steps" },
    detail: {
      bn: "যদি ইতিমধ্যেই টাকা পাঠিয়ে থাকেন, ওটিপি দিয়ে থাকেন বা অ্যাপ ইনস্টল করে থাকেন — 'জরুরি সহায়তা' অংশের ধাপগুলো এখনই দেখুন।",
      en: "If you already sent money, shared an OTP, or installed an app — open the Emergency Recovery steps right now.",
    },
    priority: "now",
  },
  T_STAY_ALERT: {
    id: "T_STAY_ALERT",
    title: { bn: "সতর্ক থাকুন, তবে নিশ্চিন্ত থাকতে পারেন", en: "Stay alert, but no action needed" },
    detail: {
      bn: "এই বার্তায় প্রতারণার স্পষ্ট প্রমাণ পাওয়া যায়নি। তবে ভবিষ্যতে টাকা বা কোড চাইলে সেটি যাচাই করেই করবেন।",
      en: "No clear scam indicators were found in this message. Still, verify any future request for money or codes.",
    },
    priority: "know",
  },
};

export const TEMPLATE_IDS = Object.keys(REC_TEMPLATES);

// --- Zod schema for the LLM payload -------------------------------------------

const BilingualZ = z.object({ bn: z.string().min(1).max(900), en: z.string().min(1).max(900) });

export const LlmPayloadZ = z.object({
  riskCategory: z.enum(["high", "uncertain", "none"]),
  scamCategory: z.string(),
  summary: BilingualZ,
  why: BilingualZ,
  unknowns: z.array(BilingualZ).max(6).default([]),
  recommendations: z
    .array(
      z.object({
        templateId: z.string(),
        detail: BilingualZ.optional(),
        evidenceRefs: z.array(z.string()).max(6).default([]),
      })
    )
    .min(1)
    .max(6),
  replay: z
    .array(
      z.object({
        type: z.enum(["observed", "inferred", "hypothetical"]),
        title: BilingualZ,
        description: BilingualZ,
        evidenceRefs: z.array(z.string()).max(6).default([]),
        intervention: z
          .object({
            question: BilingualZ,
            safe: BilingualZ,
            unsafe: BilingualZ,
          })
          .optional(),
      })
    )
    .min(1)
    .max(6),
});

export type LlmPayload = z.infer<typeof LlmPayloadZ>;

// --- Sanitizers ----------------------------------------------------------------

const URL_RX = /(?:https?:\/\/|www\.)\S+|\b[\w-]+\.(?:com|net|org|xyz|top|club|online|site|icu|shop|info|buzz)\b\S*/gi;
const LONG_DIGITS_RX = /(?<!\d)\d{6,}(?!\d)/g;
const GUARANTEE_RX =
  /(নিশ্চিতভাবে\s*নিরাপদ|সম্পূর্ণ\s*নিরাপদ|১০০%\s*নিরাপদ|একদম\s*নিরাপদ|guaranteed\s*safe|completely\s*safe|100%\s*safe)/i;

// Level 1 (strict — applied to ADVICE text): any imperative that could push
// the citizen to disclose a secret, even indirectly.
const STRICT_OTP_ADVICE_RX =
  /((ওটিপি|otp|পিন|pin|পাসওয়ার্ড|password)[^\n.!।]{0,30}(দিন|পাঠান|শেয়ার\s*কর|দিয়ে\s*দিন|share|send)\b|(?:share|send)\b[^\n.!।]{0,20}(?:your\s+)?(?:otp|pin))/i;

// Level 2 (applied to narrative/description text like replay stages): only
// SECOND-PERSON imperative compliance is forbidden. Describing the scammer's
// request ("প্রতারক ওটিপি চেয়েছে") is legitimate explanatory content.
const IMPERATIVE_COMPLIANCE_RX =
  /((আপনি|তুমি|তোমরা|you)[^\n.!।]{0,25}(ওটিপি|otp|পিন|pin|password|পাসওয়ার্ড|কোডটি|code)[^\n.!।]{0,25}(দিন|দিয়ে\s*দিন|পাঠান|পাঠিয়ে\s*দিন|শেয়ার\s*কর|share|send)|(ওটিপি|otp|পিন|pin|কোডটি)[^\n.!।]{0,15}(দিয়ে\s*দিন|পাঠিয়ে\s*দিন|শেয়ার\s*করুন|share\s*it|send\s*it))/i;

export function sanitizeText(s: string): { text: string; changed: boolean } {
  let changed = false;
  let out = s;
  const before = out;
  out = out.replace(URL_RX, "[লিংক সরানো হয়েছে]");
  if (out !== before) changed = true;
  const b2 = out;
  out = out.replace(LONG_DIGITS_RX, "[নম্বর সরানো হয়েছে]");
  if (out !== b2) changed = true;
  return { text: out, changed };
}

export class GateError extends Error {
  issues: string[];
  constructor(issues: string[]) {
    super(`Safety Gate rejected payload: ${issues.join("; ")}`);
    this.issues = issues;
  }
}

// --- The gate -------------------------------------------------------------------

export interface GateContext {
  evidence: Evidence[]; // grounded evidence (from heuristics + user-provided)
  modality: string;
}

export function runSafetyGate(payload: unknown, ctx: GateContext): ValidatedPayload {
  const issues: string[] = [];

  const parsed = LlmPayloadZ.safeParse(payload);
  if (!parsed.success) {
    throw new GateError([`schema: ${parsed.error.issues.map((i) => i.path.join(".")).join(",")}`]);
  }
  const p = parsed.data;
  const evidenceKeys = new Set(ctx.evidence.map((e) => e.key));

  if (!SCAM_CATEGORIES[p.scamCategory]) issues.push("scamCategory:unknown");
  if (p.riskCategory === "none" && ctx.evidence.some((e) => e.weight === "strong"))
    issues.push("consistency:none-despite-strong-evidence");

  // Deterministic consistency override (documented policy):
  const det = assessRisk(ctx.evidence);
  const strongEvidence = ctx.evidence.some((e) => e.weight === "strong");
  let riskCategory: RiskCategory = p.riskCategory;
  if (p.riskCategory === "none" && strongEvidence) riskCategory = "uncertain";
  if (p.riskCategory === "high" && ctx.evidence.length === 0) riskCategory = "uncertain";
  if (p.riskCategory === "high" && det.riskCategory === "none" && !strongEvidence)
    riskCategory = "uncertain";

  // Sanitize free text fields
  const sanitizedSummary = sanitizeText(p.summary.bn);
  const sanitizedWhy = sanitizeText(p.why.bn);
  if (GUARANTEE_RX.test(p.summary.bn) || GUARANTEE_RX.test(p.summary.en))
    issues.push("forbidden:guarantee-language");

  const unknowns = p.unknowns.map((u) => {
    const a = sanitizeText(u.bn);
    const b = sanitizeText(u.en);
    return { bn: a.text, en: b.text };
  });

  // Recommendations: must use whitelisted templates
  const seen = new Set<string>();
  const recommendations: Recommendation[] = [];
  for (const r of p.recommendations) {
    const tpl = REC_TEMPLATES[r.templateId];
    if (!tpl) {
      issues.push(`recommendation:unknown-template:${r.templateId}`);
      continue;
    }
    if (seen.has(r.templateId)) continue;
    seen.add(r.templateId);
    let detail = tpl.detail;
    if (r.detail) {
      const d = {
        bn: sanitizeText(r.detail.bn).text.slice(0, 400),
        en: sanitizeText(r.detail.en).text.slice(0, 400),
      };
      // Level-1 check: advice must never push the citizen to disclose secrets.
      const requestsSecret =
        STRICT_OTP_ADVICE_RX.test(d.bn) || STRICT_OTP_ADVICE_RX.test(d.en);
      if (!requestsSecret && (d.bn.length > 10 || d.en.length > 10)) detail = d;
    }
    const refs = r.evidenceRefs.filter((k) => evidenceKeys.has(k));
    recommendations.push({
      id: `R${recommendations.length + 1}`,
      templateId: tpl.id,
      title: tpl.title,
      detail,
      priority: tpl.priority,
      evidenceRefs: refs.length ? refs : undefined,
    });
  }
  if (recommendations.length === 0) issues.push("recommendations:none-valid");

  // Replay stages: observed must be evidence-grounded
  const replay: ReplayStage[] = p.replay.map((s, i) => {
    let type = s.type;
    let refs = s.evidenceRefs.filter((k) => evidenceKeys.has(k));
    if (type === "observed" && refs.length === 0) type = "inferred";
    if (type === "inferred" && refs.length === 0 && ctx.evidence.length === 0) type = "hypothetical";
    const descBn = sanitizeText(s.description.bn).text;
    const descEn = sanitizeText(s.description.en).text;
    // Level-2 check: narrative may DESCRIBE the scammer's request, but must
    // never instruct the citizen to comply with it.
    if (IMPERATIVE_COMPLIANCE_RX.test(descBn) || IMPERATIVE_COMPLIANCE_RX.test(descEn))
      issues.push(`replay:${i}:instructs-compliance`);
    return {
      id: `S${i + 1}`,
      index: i,
      type,
      title: s.title,
      description: { bn: descBn, en: descEn },
      evidenceRefs: refs,
      intervention: s.intervention,
    };
  });

  // High-risk results must offer at least one protective intervention branch
  if (riskCategory === "high") {
    const hasIntervention = replay.some((s) => s.intervention);
    if (!hasIntervention) {
      replay.push({
        id: `S${replay.length + 1}`,
        index: replay.length,
        type: "hypothetical",
        title: { bn: "এখন আপনার সিদ্ধান্ত", en: "Your decision now" },
        description: {
          bn: "পরবর্তী ধাপটি সম্পূর্ণ আপনার হাতে। দুটি পথের তুলনা করুন।",
          en: "The next step is entirely in your hands. Compare the two paths.",
        },
        evidenceRefs: [],
        intervention: {
          question: { bn: "আপনি কী করবেন?", en: "What will you do?" },
          safe: {
            bn: "থেমে যান: কিছু না দিয়ে নিজে অফিসিয়াল অ্যাপ/হেল্পলাইনে যাচাই করলে ক্ষতির ঝুঁকি থাকে না।",
            en: "Stop: verify via the official app/helpline yourself and the risk of harm is avoided.",
          },
          unsafe: {
            bn: "এগিয়ে গেলে: কোড বা টাকা দিলে অ্যাকাউন্টে অননুমোদিত লেনদেন হতে পারে (অনুমান)।",
            en: "Proceed: sharing codes or money could enable unauthorized transactions (hypothetical).",
          },
        },
      });
    }
  }

  if (issues.length > 0) throw new GateError(issues);

  const validated: ValidatedPayload = {
    riskCategory,
    scamCategory: p.scamCategory,
    summary: {
      bn: sanitizedSummary.text,
      en: sanitizeText(p.summary.en).text,
    },
    why: {
      bn: sanitizedWhy.text,
      en: sanitizeText(p.why.en).text,
    },
    unknowns,
    recommendations,
    replay,
  };
  return validated;
}

/** The shape runSafetyGate actually returns after validation & policy fixes. */
export interface ValidatedPayload {
  riskCategory: RiskCategory;
  scamCategory: string;
  summary: Bilingual;
  why: Bilingual;
  unknowns: Bilingual[];
  recommendations: Recommendation[];
  replay: ReplayStage[];
}
