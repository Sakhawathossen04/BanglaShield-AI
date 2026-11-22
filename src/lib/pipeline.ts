// ---------------------------------------------------------------------------
// Analysis pipeline (deterministic orchestration) — V3.
// validate → redact → heuristics → LLM analyst → Safety Gate → persist.
// Updates session.stage in the DB so the UI can show REAL progress.
//
// V3:
//   - Agent activity events with real timestamps (AI Agent Activity Explorer).
//   - Cancellation checks between stages (POST /analyses/{id}/cancel).
//   - Versioned V3 result contract (immediate action + visualization graph).
//   - Bounded AI attempts with honest fallback labeling.
// ---------------------------------------------------------------------------

import { db } from "@/lib/db";
import { redactPII } from "@/lib/redact";
import { detectScamIndicators } from "@/lib/heuristics";
import { runAnalystAgent } from "@/lib/agent";
import { runSafetyGate, GateError, REC_TEMPLATES } from "@/lib/safety-gate";
import { buildFallbackResult } from "@/lib/fallback";
import { buildGraph } from "@/lib/graph";
import type {
  AgentEvent,
  AnalysisResultV3,
  Bilingual,
  Evidence,
  Modality,
  PipelineStage,
} from "@/lib/types";
import { LIMIT_FALLBACK_NOTES } from "@/lib/pipeline-constants";

/** Lightweight activity recorder shared by all pipeline runs. */
class ActivityLog {
  private events: AgentEvent[] = [];
  private t0 = Date.now();
  private lastT = Date.now();
  constructor() {
    this.push("input.accepted", { bn: "ইনপুট গৃহীত", en: "Input accepted" });
  }
  push(event: string, label: Bilingual, outcome?: AgentEvent["outcome"], detail?: string) {
    const now = Date.now();
    this.events.push({
      event,
      label,
      t: new Date(now).toISOString(),
      ms: now - this.lastT,
      ...(outcome ? { outcome } : {}),
      ...(detail ? { detail } : {}),
    });
    this.lastT = now;
  }
  finish(event = "result.generated", mode: string) {
    const now = Date.now();
    this.events.push({
      event,
      label: { bn: "ফলাফল তৈরি সম্পন্ন", en: "Result generated" },
      t: new Date(now).toISOString(),
      ms: now - this.lastT,
      outcome: "ok" as const,
      detail: mode,
    });
    this.lastT = now;
  }
  get list(): AgentEvent[] {
    return this.events;
  }
  get totalMs(): number {
    return this.lastT - this.t0;
  }
}

async function setStage(sessionId: string, stage: PipelineStage, patch: Record<string, unknown> = {}) {
  await db.analysisSession.update({
    where: { id: sessionId },
    data: { stage, ...patch },
  });
}

async function isCanceled(sessionId: string): Promise<boolean> {
  const s = await db.analysisSession.findUnique({ where: { id: sessionId }, select: { status: true } });
  return s?.status === "canceled";
}

export interface RunPipelineArgs {
  sessionId: string;
  modality: Modality;
  /** Redacted text under review (already privacy-scrubbed). */
  redactedText: string;
  /** Raw URL for link modality (never visited). */
  url?: string;
  /** Sanitized visual observations from VLM (image modality). */
  visualNotes?: string[];
  /** OFFLINE_DEMO preset runs skip the AI call and are labeled synthetic. */
  demo?: boolean;
  detectedLanguage?: "bn" | "en" | "mixed" | "unknown";
}

export class PipelineCanceledError extends Error {
  constructor() {
    super("canceled");
  }
}

export async function runAnalysisPipeline(args: RunPipelineArgs): Promise<AnalysisResultV3> {
  const { sessionId, modality } = args;
  const activity = new ActivityLog();

  await setStage(sessionId, "validating", { status: "processing" });
  if (!args.redactedText.trim() && !args.url) {
    throw new PipelineError("empty-input", "No analyzable content was provided.");
  }

  // Re-run redaction as defence in depth (input should already be redacted).
  await setStage(sessionId, "redacting");
  const { text: redactedText } = redactPII(args.redactedText);
  activity.push("privacy.redaction", { bn: "গোপনীয় তথ্য আড়ালীকরণ সম্পন্ন", en: "Redaction completed" });

  await setStage(sessionId, "detecting");
  const heuristic = detectScamIndicators(redactedText, args.url, modality);
  const evidence: Evidence[] = heuristic.evidence;
  activity.push("rules.evaluated", { bn: "নিরাধারণী নিয়ম মূল্যায়ন সম্পন্ন", en: "Deterministic rules evaluated" }, "ok", `${evidence.length} সূচক`);

  if (await isCanceled(sessionId)) throw new PipelineCanceledError();

  // ---- AI analyst attempt (max 2 tries, bounded timeout) -----------------
  let result: AnalysisResultV3 | null = null;
  let gateFeedback: string | undefined;
  let lastGateIssues: string[] = [];
  let providerFailed = false;

  if (args.demo) {
    // OFFLINE_DEMO: deterministic, clearly labeled, no AI call at all.
    activity.push("ai.provider", { bn: "এআই প্রদানকারী", en: "AI provider" }, "skipped", "OFFLINE_DEMO");
    result = buildFallbackResult({
      caseId: sessionId,
      modality,
      riskCategory: heuristic.riskCategory,
      scamCategory: heuristic.scamCategory,
      evidence,
      reason: "offline-demo",
      startedAt: Date.now() - activity.totalMs,
      detectedLanguage: args.detectedLanguage,
    });
  } else {
    await setStage(sessionId, "ai_analyzing");
    const aiStart = Date.now();
    for (let attempt = 0; attempt < 2; attempt++) {
      const outcome = await runAnalystAgent(
        {
          evidence,
          redactedText,
          modality,
          urlHost: heuristic.urlAssessment?.host,
          visualNotes: args.visualNotes,
        },
        gateFeedback
      );
      if (!outcome.ok) {
        providerFailed = true;
        activity.push("ai.provider", { bn: "এআই প্রদানকারী", en: "AI provider" }, "failed", outcome.error);
        break;
      }
      if (attempt > 0) {
        activity.push("ai.provider", { bn: "এআই প্রদানকারী (পুনঃচেষ্টা সফল)", en: "AI provider (retry succeeded)" }, "ok", `LIVE_AI, attempt ${attempt + 1}`);
      }
      await setStage(sessionId, "safety_gate");
      try {
        const payload = runSafetyGate(outcome.payload, { evidence, modality });
        activity.push("ai.provider", { bn: "এআই বিশ্লেষণ সম্পন্ন", en: "AI analysis completed" }, "ok", `LIVE_AI · ${Date.now() - aiStart}ms`);
        activity.push("safety.validation", { bn: "নিরাপত্তা যাচাই সম্পন্ন", en: "Safety validation completed" });
        result = assembleResult(sessionId, modality, payload, evidence, heuristic.urlAssessment?.host, activity, args.detectedLanguage);
        break;
      } catch (err) {
        if (err instanceof GateError) {
          lastGateIssues = err.issues;
          gateFeedback = err.issues.join("; ");
          activity.push("safety.validation", { bn: "নিরাপত্তা যাচাই প্রত্যাখ্যাত", en: "Safety validation rejected" }, "failed", err.issues.join("; "));
          continue; // retry once with feedback
        }
        providerFailed = true;
        break;
      }
    }
  }

  if (await isCanceled(sessionId)) throw new PipelineCanceledError();

  if (!result) {
    // Deterministic, honestly-labeled fallback — never fake AI output.
    const reason = providerFailed ? "provider-unavailable" : "gate-rejected";
    if (providerFailed) {
      activity.push("safety.validation", { bn: "নিরাপত্তা যাচাই সম্পন্ন (নিয়মভিত্তিক পথ)", en: "Safety validation completed (rule path)" });
    }
    result = buildFallbackResult({
      caseId: sessionId,
      modality,
      riskCategory: heuristic.riskCategory,
      scamCategory: heuristic.scamCategory,
      evidence,
      reason,
      startedAt: Date.now() - activity.totalMs,
      detectedLanguage: args.detectedLanguage,
    });
    // Merge real activity into the fallback result (keep genuine timing).
    result = { ...result, agentEvents: activity.list };
  }

  // ---- Persist -----------------------------------------------------------
  await setStage(sessionId, "completed", {
    status: "completed",
    engine: result.engine,
    riskCategory: result.riskCategory,
    scamCategory: result.scamCategory,
    result: result as unknown as object,
    extractedText: redactedText.slice(0, 8000),
    completedAt: new Date(),
    error: null,
  });

  // Persist evidence items (sanitized quotes only)
  await db.evidenceItem.deleteMany({ where: { sessionId } });
  for (const e of result.evidence) {
    await db.evidenceItem.create({
      data: {
        sessionId,
        key: e.key,
        kind: e.kind,
        quote: e.quote?.slice(0, 400) ?? null,
        interpretation: e.interpretation as unknown as object,
        tactic: e.tactic ?? null,
        source: e.source,
        weight: e.weight,
      },
    });
  }

  await db.auditEvent.create({
    data: {
      actorType: "system",
      action: "analysis.completed",
      entityType: "AnalysisSession",
      entityId: sessionId,
      detail: {
        engine: result.engine,
        analysisMode: result.analysisMode,
        risk: result.riskCategory,
        category: result.scamCategory,
        gateIssues: lastGateIssues.length ? lastGateIssues : undefined,
      } as unknown as object,
    },
  });

  return result;
}

function assembleResult(
  caseId: string,
  modality: Modality,
  payload: ReturnType<typeof runSafetyGate>,
  evidence: Evidence[],
  urlHost: string | undefined,
  activity: ActivityLog,
  detectedLanguage: "bn" | "en" | "mixed" | "unknown" = "bn"
): AnalysisResultV3 {
  const limitations = [...LIMIT_FALLBACK_NOTES];
  if (modality === "link") {
    limitations.push({
      bn: "লিংকটি স্বয়ংক্রিয়ভাবে খোলা হয়নি — ঠিকানার কাঠামো থেকে প্রাপ্ত সিদ্ধান্ত, গন্তব্য পৃষ্ঠার বাস্তব অবস্থা নয়।",
      en: "The link was never opened — findings come from the address structure, not the destination page.",
    });
  }
  const resources = Array.from(
    new Set(payload.recommendations.flatMap((r) => REC_TEMPLATES[r.templateId]?.resourceKeys ?? []))
  );

  // Immediate action = the highest-priority "now" recommendation (first wins).
  const nowRec = payload.recommendations.find((r) => r.priority === "now") ?? payload.recommendations[0];
  const immediateAction = nowRec
    ? { ...nowRec, id: "R0" }
    : {
        id: "R0",
        templateId: "T_STAY_ALERT",
        title: REC_TEMPLATES.T_STAY_ALERT.title,
        detail: REC_TEMPLATES.T_STAY_ALERT.detail,
        priority: "know" as const,
      };

  return {
    schemaVersion: 3,
    caseId,
    modality,
    analysisMode: "LIVE_AI",
    engine: "ai_assisted",
    inputType: modality,
    detectedLanguage,
    generatedAt: new Date().toISOString(),
    riskCategory: payload.riskCategory,
    scamCategory: payload.scamCategory,
    summary: payload.summary,
    why: payload.why,
    immediateAction,
    evidence,
    unknowns: payload.unknowns,
    recommendations: payload.recommendations,
    replay: payload.replay,
    graph: buildGraph(payload.replay),
    agentEvents: activity.list,
    limitations,
    policy: {
      validated: true,
      checks: ["schema", "template-whitelist", "evidence-grounding", "forbidden-content", "no-contact-leak"],
    },
    resources,
  };
}

export class PipelineError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

// ---------------------------------------------------------------------------
// Background execution + stale-session guard
// ---------------------------------------------------------------------------

/** Sessions currently executing in this process (double-submit guard). */
const running = new Set<string>();

const STALE_PROCESSING_MS = 120_000;

/**
 * Run the pipeline in the background. The HTTP request returns IMMEDIATELY
 * with status "processing" — the client polls GET /analyses/{id} and renders
 * the real stage progress. This removes the request-timeout failure mode.
 * Any failure is persisted as an honest "failed" session — never a hang.
 * Cancellation between stages lands in a terminal "canceled" state.
 */
export function runPipelineInBackground(args: RunPipelineArgs): void {
  if (running.has(args.sessionId)) return;
  running.add(args.sessionId);
  void (async () => {
    try {
      await runAnalysisPipeline(args);
    } catch (err) {
      const canceled = err instanceof PipelineCanceledError;
      const reason = canceled ? "canceled-by-user" : err instanceof PipelineError ? err.code : "pipeline-failure";
      try {
        await db.analysisSession.update({
          where: { id: args.sessionId },
          data: {
            status: canceled ? "canceled" : "failed",
            stage: null,
            error: reason,
            ...(canceled ? { completedAt: new Date() } : {}),
          },
        });
        await db.auditEvent.create({
          data: {
            actorType: "system",
            action: canceled ? "analysis.canceled" : "analysis.failed",
            entityType: "AnalysisSession",
            entityId: args.sessionId,
            detail: { reason } as unknown as object,
          },
        });
      } catch {
        /* best-effort persistence */
      }
    } finally {
      running.delete(args.sessionId);
    }
  })();
}

/**
 * If a session claims "processing" but nothing has progressed for 2 minutes,
 * mark it failed so citizens see an honest error instead of an eternal
 * spinner (e.g. after a server restart mid-analysis).
 */
export async function failIfStaleProcessing(session: {
  id: string;
  status: string;
  updatedAt: Date;
}): Promise<boolean> {
  if (session.status !== "processing") return false;
  if (Date.now() - session.updatedAt.getTime() < STALE_PROCESSING_MS) return false;
  if (running.has(session.id)) return false;
  try {
    await db.analysisSession.update({
      where: { id: session.id },
      data: { status: "failed", stage: null, error: "pipeline-stalled" },
    });
    return true;
  } catch {
    return false;
  }
}
