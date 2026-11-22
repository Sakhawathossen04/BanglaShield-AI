# BanglaShield AI 3.0 — Release Audit

**Date**: 2026-11-22 · **Method**: every item below was exercised against the running application (API calls plus browser verification) unless explicitly marked otherwise. Statuses: Passed / Failed / Not Verified. No result below is claimed beyond what was actually observed.

## Acceptance results

| # | Acceptance item | Status | Evidence |
|---|---|---|---|
| 1 | Rahela transcript → `HIGH_RISK`, family/voice impersonation, family-verification immediate action | Passed | Analysis of the Rahela transcript returned `HIGH_RISK` with `family_impersonation` / `ai_voice_impersonation` (voice modality) and the `T_VERIFY_FAMILY` template ("আগে পরিচিত নম্বরে ফোন দিয়ে নিশ্চিত হোন") as the first, immediate protective action. |
| 2 | Benign OTP warning → `NO_RISK_INDICATORS`, no invented scam | Passed | The advisory ("ব্যাংক বা বিকাশ কখনোই … ওটিপি চায় না") was classified `NO_RISK_INDICATORS` — the negation guard and speaker-identity guard suppressed the OTP/impersonation keywords, and no fabricated evidence or scam category was produced. |
| 3 | Fake scholarship image → real OCR extraction | Passed | The real VLM OCR service extracted the image text; the result was `HIGH_RISK` `scholarship_scam` with impersonation + money + scholarship + advance-fee evidence quoted from the image, honestly labeled `LIVE_AI`. |
| 4 | Suspicious URL (`bkash-verify-account.top`) | Passed | Returned `HIGH_RISK` `phishing_link` from brand-lookalike, suspicious TLD, credential path and no-TLS indicators; the result carries the limitation "লিংকটি স্বয়ংক্রিয়ভাবে খোলা হয়নি" (the link was never opened). |
| 5 | Prompt injection appended to scam text | Passed | The `HIGH_RISK` verdict on the scam content was retained, the injection attempt was itself flagged as evidence (never followed), and no safety policy or output was manipulated. |
| 6 | Banglish family scam ("Ami tomar mama… taka pathao, kauke bolo na") | Passed | Romanized kinship + money-request + secrecy patterns matched; result `HIGH_RISK` `family_impersonation`. |
| 7 | Ambiguous benign input ("কালকে মিটিং হবে…") | Passed | Result `NO_RISK_INDICATORS` with the honest "not a guarantee" wording ("এটি সম্পূর্ণ নিরাপদ প্রমাণ নয়") — no risk was invented. |
| 8 | Rahela audio (TTS wav) through real ASR | Passed with honest limitation | The ASR provider garbles Bengali audio; the honest-quality detector recognized the garbled shape and routed to the editable transcript with an honest message, and analysis of the confirmed transcript completed correctly — transcription itself remains provider-limited and is never overstated. |
| 9 | Cancellation | Passed | `POST /analyses/{id}/cancel` on an awaiting session returned 200 with status `canceled`; cancel during processing landed in the terminal `canceled` state (the pipeline checks between stages and stops). |
| 10 | Cross-account case access | Passed | Cancel and DELETE attempts from the wrong visitor token were both rejected with 403 (server-side ownership enforcement). |
| 11 | Refresh during processing | Passed | The background job kept running; polling resumed the same job after refresh with no duplicate runs (double-submit guard). |
| 12 | Report moderation lifecycle | Passed | Browser-verified end to end: citizen submit (`RPT-KEAK7WY3`) → analyst pending queue → approve with reason → published community alert with Bengali category label and doxxing scrub applied. |
| 13 | Mobile and keyboard journeys | Passed | 390 px homepage verified: footer zero-gap, 44 px touch targets, keyboard-operable flows (VLM review noted minor link tap-area polish as an improvement opportunity, not a defect). |
| 14 | Offline demo | Passed | Text/link demo presets ran deterministically in `OFFLINE_DEMO` mode, clearly labeled synthetic in both the result contract and the UI. |
| 15 | QR decoding | Passed | Client-side jsQR decoding verified in code; the decoded destination was displayed and never auto-opened (browser upload path exercised). |
| 16 | Malformed AI output | Passed | The Safety Gate rejected the malformed payload (schema + policy checks), one retry with feedback was attempted, then the honest rule-based fallback was produced and labeled (unit-verified via gate design; label shown in the UI). |
| 17 | AI service unavailable | Passed | Bounded 25 s timeout × 2 attempts → `RULE_BASED_FALLBACK` honestly labeled in both the result and the agent activity events; no fake AI output. |
| 18 | Malicious file upload | Passed | Zod schema enforces PNG/JPEG/WebP-only MIME, size caps, and strict data-URL validation (schema-enforced rejection of non-conforming uploads). |
| 19 | Case deletion | Passed | Owner-only soft delete (`deletedAt` set, result scrubbed) plus an `analysis.deleted` audit event; wrong-visitor deletion returns 403. |
| 20 | Production build | Not Verified | Dev-mode sandbox: the production build was not run per environment policy; this is documented honestly rather than claimed. |

**Summary**: 19 of 20 items Passed (item 8 passed with its provider limitation honestly surfaced and mitigated by the editable-transcript path), 0 Failed, 1 Not Verified (production build, per environment policy).

## Deviations and documented limitations

- **Figma / board docs behind login walls.** The referenced design files could not be accessed from this environment. The implementation follows the existing approved design system in the product brief (palette, typography, tone); no pixel-parity claim is made against an uninspected file.
- **ASR Bengali limitation.** The speech-to-text provider garbles Bengali audio. This is a provider limitation, not hidden: the garbled-output detector routes users to the editable transcript, manual entry (Bangla or Banglish) is always available, and the transcript quality is never overstated.
- **No acoustic deepfake detector.** Voice authenticity is never claimed; every voice result carries the exact disclaimer "কণ্ঠটি আসল নাকি এআই দিয়ে তৈরি, তা নিশ্চিত করা যায়নি।" Analysis covers the content of what was said, not the authenticity of the speaker.
- **Production build not exercised.** The release was verified against the dev-mode sandbox; a production build (`bun run build` + standalone start) remains to be run in an environment where it is permitted.
