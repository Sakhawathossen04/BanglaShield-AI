# BanglaShield AI — AI Safety for Every Bangladeshi

**বাংলাশিল্ড এআই — প্রতিটি বাংলাদেশির জন্য এআই নিরাপত্তা**

BanglaShield AI helps ordinary Bangladeshis verify suspicious calls, messages, links, QR codes and screenshots **before** money or personal information is lost. It is built for people without technical knowledge — rural workers, elderly citizens, first-time smartphone users.

> **Mission: protect people, protect families, protect livelihoods.**

---

## What it does

| Capability | Description |
|---|---|
| **Multimodal scam checker** | Verify via voice (Bangla/Banglish ASR + editable transcript), SMS/chat text, screenshot (VLM OCR + review), or URL/QR (structure analysis — links are never opened) |
| **Evidence-grounded analysis** | Deterministic bilingual scam-indicator detectors + an AI analyst module, producing observed evidence, unknowns and honest risk categories (`উচ্চ ঝুঁকি` / `নিশ্চিত নয়` / `ঝুঁকির প্রমাণ পাওয়া যায়নি`) |
| **Agent Safety Gate** | Every AI output passes schema + policy validation (template-whitelisted advice, evidence-grounding, no-contact-leak, no-guarantee language, injection-resistant) before a citizen sees it; failing twice falls back to a deterministic rule-based result that is honestly labeled |
| **Shield Lens 2.0** | Interactive attack replay: play/pause, prev/next, 0.5×/1×/2× speed, timeline scrubbing, clickable evidence cards, and the animated **Decision Branch Explorer** — an evidence-grounded comparison of the protective path (stop → verify independently → keep codes private) vs the unsafe path (share → access risk → possible loss), every step labeled hypothetical. Accessible text-list alternative included |
| **Emergency Recovery Center** | Situation triage → step-by-step checklist, verified official contacts (bKash, Nagad, Bangladesh Bank, Police 999, BGD e-GOV CIRT) with source URLs + verification dates, recovery-scam warnings. Works independently of the AI provider and even if the database is unreachable (bundled verified-directory fallback) |
| **Community reporting** | Anonymous, consented, auto-redacted reports with reference IDs and withdrawal |
| **Fraud Intelligence Workspace** | Analyst-only (server-enforced auth): DB-computed metrics + charts, interactive relationship graph (React Flow) with evidence-backed edges and an accessible table view, human review lifecycle (approve/reject/split/withdraw with expiry), immutable audit log |
| **ScamAcademy 2.0** | 8 bilingual interactive lessons with instant, non-contradictory feedback, progress tracking, incorrect-answer review (scenario + your answer + safe answer + reason), plus a **Simulation Lab** — safe practice scenarios (OTP call, fake job, QR payment) with hypothetical consequences and protective takeaways. Device-only progress; completely separate from real reports |
| **Privacy & accessibility center** | Bangla/English, large text, reduced motion, experimental narration, low-bandwidth mode, view/delete own data, honest privacy statements |


## What's new in 2.0 (production hardening)

Every critical defect observed on the v1 deployment was root-caused and fixed (not hidden):

1. **"Network or server error" on message analysis (incl. the built-in sample)** — three stacked root causes: (a) the Safety Gate's imperative-compliance regex false-positived on legitimate hypothetical education text ("যদি ওটিপি পাঠানো হয়…"), rejecting *every* AI analysis; (b) two ~17s LLM attempts with no timeout always exceeded serverless limits; (c) the input endpoint awaited the whole pipeline. Fixed: sentence-level compliance policy with conditional/negation/quotation safe-framing (hypothetical stages exempt by design), 25s/45s hard timeouts on AI calls, and background processing — the input endpoint now returns in <0.3s while the client polls real pipeline stages. Verified end-to-end: the OTP sample completes with `engine=ai_assisted`.
2. **Empty official-contacts directory** — the seed had never run. Added `bun run db:seed` and a bundled verified-directory fallback so the section always renders entries.
3. **Publicly exposed demo credentials on the analyst login** — removed; documented here instead.
4. **Contradictory quiz feedback** — explanations no longer open with congratulations after a wrong answer; wrong answers also display the safe answer explicitly.
5. **English mode leaving Bangla labels** — splash, 404 and stray strings made bilingual; full sweep during browser verification.
6. **Entrance animations hiding sections** — replaced gating `whileInView` opacity-0 patterns with a safe `<Reveal>` primitive: content is visible by default, a one-time CSS keyframe enhancement plays on scroll-in, with a 1.5s safety net and reduced-motion support. If JS/animation fails, nothing is ever hidden.
7. **Shield Lens lacking a rich decision-path comparison** — the new Decision Branch Explorer (see above).
8. **Type-safety/privacy hardening** — all `tsc --noEmit` errors fixed (Prisma `DbNull`, relation includes, SDK vision typing), Prisma query logging disabled so citizen content never echoes into logs.

## Design system

Warm, human, public-safety aesthetic (no neon-cyber, no blue/purple gradients):

- Warm Ivory `#F4F1EB` · Surface White `#FFFEFA` · Forest Green `#2F5746` · Soft Sage `#DDE8DF` · Terracotta `#A44435` · Soft Blush `#F4E1DA` · Warm Amber `#8A5B28` · Sand `#F2E8D5` · Ink `#202C26` · Muted `#59665F` · Border `#D8DED5`
- Typography: **Hind Siliguri** (Bengali) + **DM Sans** (English)
- The SPA is served from `/` with hash-based routing (`/#/check`, `/#/analysis/BS-…`, `/#/analyst/…`).

## Architecture

```
Citizen SPA (/)  →  API Gateway (Next.js route handlers, /api/v1/*)
                 →  Input validation (Zod) + rate limiting
                 →  Privacy redaction engine (OTPs/PINs/phones/NIDs masked before storage or AI)
                 →  Deterministic heuristic detectors (BN/EN/Banglish)
                 →  AI analyst (LLM) — evidence wrapped as UNTRUSTED data, structured JSON output
                 →  Agent Safety Gate (schema + policy + evidence-grounding validation, 2 attempts)
                 →  [fallback] deterministic rule-based engine (honestly labeled)
                 →  SQLite (Prisma) — sessions, evidence, reports, patterns, reviews, audit, learning
Citizen reports  →  anonymized report DB  →  analyst review  →  approved pattern registry
```

**Security controls**: prompt-injection defense (untrusted-evidence delimiting, injection-attempt detector), SSRF-safe (links never fetched), IDOR protection (case deletion requires the creating visitor token), server-enforced analyst RBAC (signed httpOnly cookie), per-IP rate limits, safe file handling (type/size validation, in-memory only), privacy-preserving logs, output sanitization (no URLs/phones/long digits from AI), template-whitelisted recommendations.

## Run locally

Prerequisites: Node.js ≥ 20, Bun ≥ 1.1.

```bash
bun install          # install dependencies
cp .env.example .env # configure (see below)
bun run db:push      # create the SQLite schema
bun run db:seed      # seed analyst account + verified resources + labeled synthetic data
bun run dev          # start on http://localhost:3000
```

Open `http://localhost:3000` (in this sandbox: use the Preview Panel, not localhost).

**Demo analyst account** (clearly labeled demo): `analyst@banglashield.org` / `Shield#2025` — sign in at `/#/analyst`.

### Environment variables (`.env.example`)

```
DATABASE_URL="file:./db/custom.db"     # SQLite database location
# SESSION_SECRET="change-me-in-prod"   # HMAC key for analyst session cookies (falls back to a dev key)
# ANALYST_PASSCODE / SMTP etc. are not used by this build
```

## API (v1)

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/v1/analyses` | visitor token | Create a session (consent required) |
| GET | `/api/v1/analyses` | visitor token | List own sessions (privacy view) |
| POST | `/api/v1/analyses/{id}/input` | visitor token | `kind: text/link` analyze · `audio` ASR · `image` VLM OCR · `confirm` reviewed text |
| GET | `/api/v1/analyses/{id}` · `/status` · `/result` · `/replay` | case ID (capability) | Session data, real progress, result, Shield Lens stages |
| DELETE | `/api/v1/analyses/{id}` | creating visitor | Delete own case (IDOR-safe) |
| GET | `/api/v1/resources` | — | Verified resource directory |
| POST/GET | `/api/v1/reports` | — | Submit anonymous report / look up by reference |
| DELETE | `/api/v1/reports/{id}` | reference holder | Withdraw a report |
| POST | `/api/v1/feedback` | — | Was the result helpful? |
| GET/POST | `/api/v1/learn/progress` | learner token | ScamAcademy progress |
| POST | `/api/v1/tts` | — | Spoken guidance (experimental) |
| POST/GET/DELETE | `/api/v1/auth/analyst` | — | Analyst sign-in / session / sign-out |
| GET | `/api/v1/analyst/metrics` · `/graph` · `/reports` · `/patterns` · `/audit` | analyst | Intelligence workspace |
| POST | `/api/v1/analyst/reviews` · `/patterns/{id}/withdraw` | analyst | Review lifecycle (audit-logged) |

## Data & honesty notes

- Audio and images are **never stored** — processed in memory, discarded; only redacted text persists.
- Synthetic seed data (demo reports/patterns) is flagged `synthetic=true` and labeled “ডেমো ডেটা (সিমুলেশন)” everywhere it appears.
- All dashboard figures are live `COUNT`s from the database — nothing is fabricated.
- Voice transcription (ASR) is provider-dependent and currently unreliable for Bangla — the UI says so and always offers an editable transcript / typing path.
- BanglaShield is **not** a bank, law-enforcement, or emergency authority and does not promise fund recovery.

## Known limitations

- Single-process deployment: in-memory rate limiting and the dev session key need shared infrastructure for multi-instance production.
- No active URL fetching (by safety design); link analysis is structural.
- TTS narration is experimental; provider voices are not Bengali-native.
- Automated test suites are intentionally not included in this environment build; end-to-end verification was performed by browser automation (all core flows: message/voice/screenshot/URL-QR analysis, result + Shield Lens, recovery, ScamAcademy incl. the simulation lab, reporting + withdrawal, analyst workspace incl. login rejection without credentials) plus adversarial checks (prompt injection, IDOR, rate limits, risk-category consistency, safety-gate policy unit cases).
- Figma reference could not be accessed from this environment; the implementation follows the approved visual specification in the product brief (palette, typography, tone). It does not claim pixel parity with an uninspected design file.

## Project layout

```
prisma/schema.prisma          # 12-model data layer
prisma/seed.ts                # verified resources + labeled synthetic data
src/lib/                      # redaction, heuristics, agent, safety-gate, pipeline, auth, rate-limit, crypto
src/app/api/v1/               # versioned API
src/app/page.tsx              # SPA entry (single user-visible route)
src/components/shield/        # app shell, router, store, pages (citizen + analyst), decision-branch explorer, simulation lab, lessons data
public/                       # generated illustrations
```

## Final UI screenshots (2.0, browser-verified)

| View | Screenshot |
|---|---|
| Home (desktop, Bangla) | `docs/screenshots/desktop-home.png` |
| Analysis result (evidence + highlighted submission) | `docs/screenshots/desktop-result.png` |
| Shield Lens decision branch explorer | `docs/screenshots/desktop-shield-lens.png` |
| Home at 360px | `docs/screenshots/mobile-home.png` |
| Check at 360px | `docs/screenshots/mobile-check.png` |
| Result at 360px | `docs/screenshots/mobile-result.png` |

## Verification evidence (2026-11-21, dev server + headless browser)

- Message analysis (built-in OTP sample): completes with `engine=ai_assisted`, risk `উচ্চ ঝুঁকি`, category `otp_phishing`, 5 replay stages — the v1 "Network or server error" is resolved end-to-end through the real UI.
- Custom Bengali scam text: evidence-grounded high-risk result with 4 evidence cards (E1–E4) quoted from the submission.
- Benign family message: `ঝুঁকির প্রমাণ পাওয়া যায়নি` with cautious caveats (not a safety guarantee).
- URL `bkash-verify.xyz/login`: high risk `phishing_link` with 5 structural indicators (impersonation, lookalike domain, credential path, suspicious TLD, no TLS); the URL was never fetched.
- Shield Lens: timeline controls, scrubbing, evidence side-panel, and the Decision Branch Explorer with hypothetical labels, an observed-evidence chip (E1) and the grounding quote from the case.
- ScamAcademy: wrong answer shows "Think again" + the safe answer + a neutral explanation (no contradictory praise); Simulation Lab decision flow verified (safe/unsafe consequences labeled educational hypotheticals).
- Analyst workspace: unauthenticated API access → 401 on every `/api/v1/analyst/*` route; login page shows no credentials; demo login renders live DB metrics ("0 citizen · 15 synthetic"), the relationship graph with evidence-backed edges, the review queue and an approve-with-reason action (audit-logged).
- Client bundle scan: no credentials, tokens, or session secrets.
- 360px viewport: no horizontal overflow on home, check, result, and Shield Lens.
- Accessibility: large-text and reduced-motion toggles verified against `<html>` classes; all risk states communicate via icon + text, never color alone.
- `eslint` and `tsc --noEmit` both clean; zero browser console errors across the verification session.
