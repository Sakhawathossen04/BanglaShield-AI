// ---------------------------------------------------------------------------
// Shared API helpers: JSON responses, validation errors, visitor tokens,
// analyst authorization guard. Server-only.
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import { getAnalystSession } from "./auth";

export function ok(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function fail(code: string, message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: { code, message, ...extra } }, { status });
}

export function getVisitor(req: Request): string | null {
  const v = req.headers.get("x-shield-visitor");
  return v && /^[A-Za-z0-9_-]{16,64}$/.test(v) ? v : null;
}

export async function requireAnalyst() {
  const session = await getAnalystSession();
  if (!session) return { session: null, response: fail("unauthorized", "Analyst authentication required.", 401) };
  return { session, response: null };
}

export async function readJson<T>(req: Request, maxBytes = 12 * 1024 * 1024): Promise<T | null> {
  try {
    const text = await req.text();
    if (text.length > maxBytes) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
