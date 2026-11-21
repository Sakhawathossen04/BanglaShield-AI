// POST /api/v1/tts — spoken Bengali guidance (narration support).
// Text is capped at 1024 chars per the TTS provider contract. Audio is
// streamed back and never stored.
import { NextRequest } from "next/server";
import { z } from "zod";
import ZAI from "z-ai-web-dev-sdk";
import { fail, readJson } from "@/lib/api";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { redactPII } from "@/lib/redact";

const TtsBody = z.object({
  text: z.string().min(2).max(1024),
  speed: z.number().min(0.5).max(2).default(1),
});

export async function POST(req: NextRequest) {
  const rl = rateLimit(clientKey(req, "tts"), 20, 10 * 60_000);
  if (!rl.ok) return fail("rate-limited", "অনেক বেশি অনুরোধ।", 429);

  const body = await readJson<unknown>(req, 8 * 1024);
  const parsed = TtsBody.safeParse(body);
  if (!parsed.success) return fail("invalid-input", "ধ্বনি তৈরির অনুরোধ গ্রহণযোগ্য নয়।", 422);

  try {
    const { text } = redactPII(parsed.data.text); // never speak sensitive digits
    const zai = await ZAI.create();
    const response = await zai.audio.tts.create({
      input: text.slice(0, 1024),
      voice: "tongtong",
      speed: parsed.data.speed,
      response_format: "wav",
      stream: false,
    });
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(new Uint8Array(arrayBuffer));
    return new Response(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": String(buffer.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return fail(
      "tts-failed",
      "ধ্বনি তৈরি করা যায়নি — লেখা সংস্করণটি ব্যবহার করুন।",
      503,
      { detail: err instanceof Error ? err.message : "unknown" }
    );
  }
}
