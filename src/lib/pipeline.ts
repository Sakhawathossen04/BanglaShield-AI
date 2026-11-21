// ---------------------------------------------------------------------------
// Analysis pipeline (deterministic orchestration).
// validate → redact → heuristics → LLM analyst → Safety Gate → persist.
// Updates session.stage in the DB so the UI can show REAL progress.
// ---------------------------------------------------------------------------

import { db } from "@/lib/db";
import { redactPII } from "@/lib/redact";
import { detectScamIndicators, assessRisk } from "@/lib/heuristics";
import { runAnalystAgent } from "@/lib/agent";
import { runSafetyGate, GateError, REC_TEMPLATES } from "@/lib/safety-gate";
import { buildFallbackResult } from "@/lib/fallback";
import type { AnalysisResult, Evidence, Modality, PipelineStage } from "@/lib/types";
import { LIMIT_FALLBACK_NOTES } from "@/lib/pipeline-constants";

async function setStage(sessionId: string, stage: PipelineStage, patch: Record<string, unknown> = {}) {
  await db.analysisSession.update({
    where: { id: sessionId },
    data: { stage, ...patch },
  });
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
}

export async function runAnalysisPipeline(args: RunPipelineArgs): Promise<AnalysisResult> {
  const { sessionId, modality } = args;

  await setStage(sessionId, "validating", { status: "processing" });
  if (!args.redactedText.trim() && !args.url) {
    throw new PipelineError("empty-input", "No analyzable content was provided.");
  }

  // Re-run redaction as defence in depth (input should already be redacted).
  await setStage(sessionId, "redacting");
  const { text: redactedText } = redactPII(args.redactedText);

  await setStage(sessionId, "detecting");
  const heuristic = detectScamIndicators(redactedText, args.url);
  const evidence: Evidence[] = heuristic.evidence;

  // ---- AI analyst attempt (max 2 tries) --------------------------------
  await setStage(sessionId, "ai_analyzing");
  let result: AnalysisResult | null = null;
  let gateFeedback: string | undefined;
  let lastGateIssues: string[] = [];
  let providerFailed = false;

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
      break;
    }
    await setStage(sessionId, "safety_gate");
    try {
      const payload = runSafetyGate(outcome.payload, { evidence, modality });
      result = assembleResult(sessionId, modality, payload, evidence, heuristic.urlAssessment?.host);
      break;
    } catch (err) {
      if (err instanceof GateError) {
        lastGateIssues = err.issues;
        gateFeedback = err.issues.join("; ");
        continue; // retry once with feedback
      }
      providerFailed = true;
      break;
    }
  }

  if (!result) {
    // Deterministic, honestly-labeled fallback — never fake AI output.
    const reason = providerFailed ? "provider-unavailable" : "gate-rejected";
    result = buildFallbackResult({
      caseId: sessionId,
      modality,
      riskCategory: heuristic.riskCategory,
      scamCategory: heuristic.scamCategory,
      evidence,
      engine: "rule_based",
      reason,
    });
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
  urlHost?: string
): AnalysisResult {
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

  return {
    caseId,
    modality,
    engine: "ai_assisted",
    generatedAt: new Date().toISOString(),
    riskCategory: payload.riskCategory,
    scamCategory: payload.scamCategory,
    summary: payload.summary,
    why: payload.why,
    evidence,
    unknowns: payload.unknowns,
    recommendations: payload.recommendations,
    replay: payload.replay,
    limitations,
    policy: {
      validated: true,
      checks: ["schema", "template-whitelist", "evidence-grounding", "forbidden-content", "no-contact-leak"],
    },
    resources,
    ...(urlHost ? { analyzedHost: urlHost } : {}),
  } as AnalysisResult;
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
 * the real stage progress. This removes the request-timeout failure mode
 * (the v1 bug where a slow AI call surfaced as "Network or server error").
 * Any failure is persisted as an honest "failed" session — never a hang.
 */
export function runPipelineInBackground(args: RunPipelineArgs): void {
  if (running.has(args.sessionId)) return;
  running.add(args.sessionId);
  void (async () => {
    try {
      await runAnalysisPipeline(args);
    } catch (err) {
      const reason = err instanceof PipelineError ? err.code : "pipeline-failure";
      try {
        await db.analysisSession.update({
          where: { id: args.sessionId },
          data: { status: "failed", stage: null, error: reason },
        });
        await db.auditEvent.create({
          data: {
            actorType: "system",
            action: "analysis.failed",
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
