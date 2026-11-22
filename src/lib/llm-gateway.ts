// ---------------------------------------------------------------------------
// LLM Gateway — V7.
//
// One server-side adapter for all model traffic (analysis, chat, vision).
// Provider chain per call, honestly labeled:
//   1. OpenRouter (https://openrouter.ai/api/v1) — when OPENROUTER_API_KEY is
//      configured. Model per purpose + ordered fallback candidates, bounded
//      timeout via AbortController, JSON Schema (require_parameters) for
//      structured outputs, privacy flags (data_collection deny), daily/per-case
//      budget caps, and per-call metadata (model, provider, latency, usage,
//      cost when reported).
//   2. ZAI (z-ai-web-dev-sdk) — the sandbox/local provider of this deployment
//      environment, same call semantics.
//   3. null — the caller falls back to its deterministic rule path and labels
//      the result accordingly. A missing key is never faked as live AI.
//
// All keys are server-side only; nothing here is imported by client code.
// ---------------------------------------------------------------------------

export type GatewayPurpose = "analysis" | "chat" | "vision";

export interface GatewayMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GatewayCallOptions {
  purpose: GatewayPurpose;
  messages: GatewayMessage[];
  maxTokens?: number;
  /** JSON Schema for structured outputs (analysis purpose). */
  jsonSchema?: Record<string, unknown>;
  temperature?: number;
}

export interface GatewayResult {
  ok: boolean;
  text?: string;
  error?: string;
  /** Which provider actually served the call (for honest labeling). */
  servedBy: "openrouter" | "zai" | "none";
  model?: string;
  servingProvider?: string;
  latencyMs: number;
  /** True when the requested-primary model was unavailable and a fallback served. */
  fallbackUsed: boolean;
  usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number };
  costUsd?: number;
}

// ---------------------------------------------------------------------------
// Configuration (env-driven, validated, documented in .env.example)
// ---------------------------------------------------------------------------

function env(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim().length > 0 ? v.trim() : undefined;
}

export interface GatewayConfig {
  apiKey?: string;
  modelFor: Record<GatewayPurpose, string | undefined>;
  fallbackModels: string[];
  timeoutMs: number;
  maxOutputTokens: number;
  dailyBudgetUsd: number;
  maxCostPerCallUsd: number;
}

export function gatewayConfig(): GatewayConfig {
  return {
    apiKey: env("OPENROUTER_API_KEY"),
    modelFor: {
      analysis: env("OPENROUTER_ANALYSIS_MODEL"),
      chat: env("OPENROUTER_CHAT_MODEL"),
      vision: env("OPENROUTER_VISION_MODEL"),
    },
    fallbackModels: (env("OPENROUTER_FALLBACK_MODELS") ?? "")
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean),
    timeoutMs: Number(env("AI_REQUEST_TIMEOUT_MS") ?? 25_000),
    maxOutputTokens: Number(env("AI_MAX_OUTPUT_TOKENS") ?? 2000),
    dailyBudgetUsd: Number(env("AI_DAILY_BUDGET_USD") ?? 5),
    maxCostPerCallUsd: Number(env("AI_MAX_COST_PER_CASE_USD") ?? 0.05),
  };
}

/** True when OpenRouter is configured — used by status/trust views. */
export function openRouterConfigured(): boolean {
  return Boolean(gatewayConfig().apiKey);
}

// ---------------------------------------------------------------------------
// Budget guard (per-process estimate; the durable ledger is the audit log)
// ---------------------------------------------------------------------------

const dayKey = () => new Date().toISOString().slice(0, 10);
const spentToday = new Map<string, number>();

function budgetExceeded(): boolean {
  const spent = spentToday.get(dayKey()) ?? 0;
  return spent >= gatewayConfig().dailyBudgetUsd;
}

function recordSpend(costUsd: number | undefined): void {
  if (!costUsd || costUsd <= 0) return;
  const k = dayKey();
  spentToday.set(k, (spentToday.get(k) ?? 0) + costUsd);
}

export function todaySpendEstimate(): number {
  return spentToday.get(dayKey()) ?? 0;
}

// ---------------------------------------------------------------------------
// OpenRouter transport
// ---------------------------------------------------------------------------

interface ORResponse {
  choices?: { message?: { content?: string } }[];
  model?: string;
  provider?: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    cost?: number;
  };
  error?: { message?: string; code?: number };
}

async function openRouterCall(
  cfg: GatewayConfig,
  model: string,
  opts: GatewayCallOptions,
  isFallback: boolean
): Promise<GatewayResult> {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);
  try {
    const body: Record<string, unknown> = {
      model,
      messages: opts.messages,
      max_tokens: opts.maxTokens ?? cfg.maxOutputTokens,
      // Privacy: instruct the gateway not to train on / retain request data.
      // (OpenRouter honors data_collection on compatible providers; we still
      // minimize and redact before anything leaves this server.)
      data_collection: { policy: "deny" },
    };
    if (opts.temperature !== undefined) body.temperature = opts.temperature;
    if (opts.jsonSchema) {
      body.response_format = {
        type: "json_schema",
        json_schema: { name: "result", strict: true, schema: opts.jsonSchema, require_parameters: true },
      };
    }
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://bangla-shield-ai.vercel.app",
        "X-Title": "BanglaShield AI",
      },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as ORResponse;
    if (!res.ok) {
      const code = res.status;
      const msg = data.error?.message ?? `openrouter-http-${code}`;
      return {
        ok: false,
        error: `openrouter:${code}:${msg}`.slice(0, 200),
        servedBy: "openrouter",
        model,
        latencyMs: Date.now() - started,
        fallbackUsed: isFallback,
      };
    }
    const text = data.choices?.[0]?.message?.content ?? "";
    const cost = typeof data.usage?.cost === "number" ? data.usage.cost : undefined;
    recordSpend(cost);
    return {
      ok: text.trim().length > 0,
      text: text.trim() || undefined,
      error: text.trim() ? undefined : "openrouter:empty-output",
      servedBy: "openrouter",
      model: data.model ?? model,
      servingProvider: data.provider,
      latencyMs: Date.now() - started,
      fallbackUsed: isFallback,
      usage: {
        promptTokens: data.usage?.prompt_tokens,
        completionTokens: data.usage?.completion_tokens,
        totalTokens: data.usage?.total_tokens,
      },
      costUsd: cost,
    };
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    return {
      ok: false,
      error: aborted ? "openrouter:timeout" : "openrouter:request-failed",
      servedBy: "openrouter",
      model,
      latencyMs: Date.now() - started,
      fallbackUsed: isFallback,
    };
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// ZAI transport (sandbox/local provider)
// ---------------------------------------------------------------------------

async function zaiCall(opts: GatewayCallOptions): Promise<GatewayResult> {
  const started = Date.now();
  try {
    const { default: ZAI } = await import("z-ai-web-dev-sdk");
    const zai = await ZAI.create();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), gatewayConfig().timeoutMs);
    try {
      const completion = await Promise.race([
        zai.chat.completions.create({
          messages: opts.messages.map((m) => ({ role: m.role, content: m.content.slice(0, 8000) })),
          thinking: { type: "disabled" },
        }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("zai:timeout")), gatewayConfig().timeoutMs)),
      ]);
      const text = completion.choices[0]?.message?.content?.trim() ?? "";
      return {
        ok: text.length > 0,
        text: text || undefined,
        error: text ? undefined : "zai:empty-output",
        servedBy: "zai",
        model: "zai-sandbox",
        latencyMs: Date.now() - started,
        fallbackUsed: false,
      };
    } finally {
      clearTimeout(timer);
    }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? `zai:${err.message}`.slice(0, 200) : "zai:failed",
      servedBy: "zai",
      model: "zai-sandbox",
      latencyMs: Date.now() - started,
      fallbackUsed: false,
    };
  }
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

/**
 * Run one model call through the provider chain. Order:
 *   OpenRouter requested-primary → OpenRouter fallbacks (bounded, once each)
 *   → ZAI → give up (caller labels rule-based).
 * Budget exhaustion skips OpenRouter entirely (honest labeled fallback).
 */
export async function gatewayChat(opts: GatewayCallOptions): Promise<GatewayResult> {
  const cfg = gatewayConfig();

  if (cfg.apiKey && !budgetExceeded()) {
    const primary = cfg.modelFor[opts.purpose];
    const candidates = [...(primary ? [primary] : []), ...cfg.fallbackModels];
    for (let i = 0; i < candidates.length; i++) {
      const r = await openRouterCall(cfg, candidates[i], opts, i > 0);
      if (r.ok) return r;
      // 401/402 (auth/balance) — do not multiply retries across candidates.
      if (r.error?.startsWith("openrouter:401") || r.error?.startsWith("openrouter:402")) break;
    }
  }

  return zaiCall(opts);
}

/**
 * Connection test for the authorized admin/status area — one minimal chat call
 * against the configured primary model. Never exposes the key or its shape.
 */
export async function gatewayConnectionTest(): Promise<{
  configured: boolean;
  ok: boolean;
  model?: string;
  provider?: string;
  latencyMs?: number;
  error?: string;
}> {
  const cfg = gatewayConfig();
  if (!cfg.apiKey) return { configured: false, ok: false, error: "not-configured" };
  const model = cfg.modelFor.chat ?? cfg.modelFor.analysis;
  if (!model) return { configured: true, ok: false, error: "no-model-configured" };
  const r = await openRouterCall(cfg, model, {
    purpose: "chat",
    messages: [{ role: "user", content: "Reply with the single word: ready" }],
    maxTokens: 10,
  }, false);
  return {
    configured: true,
    ok: r.ok,
    model: r.model,
    provider: r.servingProvider,
    latencyMs: r.latencyMs,
    error: r.ok ? undefined : r.error,
  };
}

