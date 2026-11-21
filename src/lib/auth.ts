// ---------------------------------------------------------------------------
// Analyst session helpers (server-enforced role-based authorization).
// Signed httpOnly cookie — no client-trustable role flags.
// ---------------------------------------------------------------------------

import { cookies } from "next/headers";
import { signSession, verifySession } from "./crypto";
import { db } from "./db";

export const ANALYST_COOKIE = "bs_analyst";

export interface AnalystSession {
  userId: string;
  role: string;
  name?: string;
  email?: string;
}

export async function getAnalystSession(): Promise<AnalystSession | null> {
  const store = await cookies();
  const token = store.get(ANALYST_COOKIE)?.value;
  const verified = verifySession(token);
  if (!verified || (verified.role !== "analyst" && verified.role !== "admin")) return null;
  const user = await db.user.findUnique({ where: { id: verified.userId } });
  if (!user || !user.active) return null;
  return { userId: user.id, role: user.role, name: user.name ?? undefined, email: user.email };
}

export async function createAnalystCookie(userId: string, role: string) {
  const store = await cookies();
  store.set(ANALYST_COOKIE, signSession(userId, role), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 12 * 60 * 60,
  });
}

export async function clearAnalystCookie() {
  const store = await cookies();
  store.delete(ANALYST_COOKIE);
}
