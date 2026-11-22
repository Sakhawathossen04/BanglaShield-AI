"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MessageSquareText,
  ImageIcon,
  Link2,
  ShieldHalf,
  ShieldCheck,
  ArrowRight,
  EyeOff,
  Cpu,
  BookOpen,
  Play,
  Pause,
  PhoneCall,
  Waves,
  Landmark,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "../router";
import { useT, useLang, useBi } from "../i18n";
import { cn } from "@/lib/utils";
import { LESSONS } from "../data/lessons";
import { Reveal, ResourceList } from "../ui-bits";

// ---------------------------------------------------------------------------
// Compact Shield Lens preview (clearly labeled demonstration) — V3 §5
// ---------------------------------------------------------------------------
const PREVIEW_STAGES = [
  {
    type: "observed" as const,
    chip: "প্রত্যক্ষ প্রমাণ",
    title: "১. পরিচয়ের দাবি",
    desc: "“আমি বিকাশ টিম থেকে বলছি…” — প্রেরক নিজেকে পরিচিত প্রতিষ্ঠান বলে পরিচয় দিচ্ছে (বার্তায় দেখা যায়)।",
  },
  {
    type: "inferred" as const,
    chip: "অনুমিত কৌশল",
    title: "২. ভয় ও তাড়াহুড়ো",
    desc: "“একাউন্ট সাসপেন্ড হবে… এখনই!” — ভয় দেখিয়ে ভাবনার সময় কেড়ে নেওয়া হচ্ছে।",
  },
  {
    type: "observed" as const,
    chip: "প্রত্যক্ষ প্রমাণ",
    title: "৩. কোড চাওয়া",
    desc: "“আপনার OTP টা দিয়ে দিন” — প্রকৃত প্রতিষ্ঠান কখনোই এমনটি চায় না। এই মুহূর্তটাই ফাঁদ।",
  },
  {
    type: "hypothetical" as const,
    chip: "সম্ভাব্য পথ",
    title: "৪. দুটি পথ",
    desc: "কোড দিলে অননুমোদিত লেনদেন হতে পারে; থেমে নিজে যাচাই করলে ক্ষতির পথ বন্ধ।",
  },
];

function ShieldLensPreview() {
  const lang = useLang();
  const prefersReduced = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing || prefersReduced) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % PREVIEW_STAGES.length), 2600);
    return () => clearInterval(id);
  }, [playing, prefersReduced]);

  const stage = PREVIEW_STAGES[idx];

  return (
    <Card className="border-2 border-[#2F5746]/25 bg-[#FFFEFA] overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center justify-between gap-2 bg-[#2F5746] px-4 py-3 text-[#FFFEFA]">
          <span className="flex items-center gap-2 text-sm font-bold">
            <ShieldHalf className="h-4 w-4" aria-hidden />
            Shield Lens
          </span>
          <Badge variant="outline" className="border-[#DDE8DF]/60 text-[#DDE8DF] border-dashed text-[11px]">
            {lang === "bn" ? "নমুনা সিমুলেশন" : "Sample simulation"}
          </Badge>
        </div>
        <div className="p-4 sm:p-5">
          <div className="flex gap-1.5 mb-3" aria-hidden>
            {PREVIEW_STAGES.map((s, i) => (
              <button
                key={s.title}
                onClick={() => {
                  setIdx(i);
                  setPlaying(false);
                }}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors",
                  i === idx ? "bg-[#2F5746]" : i < idx ? "bg-[#8A9B90]" : "bg-[#EDEAE1]"
                )}
                aria-label={`${s.title} দেখুন`}
              />
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={prefersReduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReduced ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={cn(
                    "text-[11px] font-semibold rounded-full px-2 py-0.5 border",
                    stage.type === "observed" && "bg-[#DDE8DF] text-[#2F5746] border-[#2F5746]/40",
                    stage.type === "inferred" && "bg-[#F2E8D5] text-[#8A5B28] border-[#8A5B28]/40",
                    stage.type === "hypothetical" && "bg-[#F4E1DA] text-[#A44435] border-[#A44435]/40 border-dashed"
                  )}
                >
                  {stage.chip}
                </span>
                <h3 className="text-[15px] font-bold text-[#202C26] bn-text">{stage.title}</h3>
              </div>
              <p className="text-sm text-[#59665F] leading-relaxed bn-text min-h-[3.5rem]">{stage.desc}</p>
            </motion.div>
          </AnimatePresence>
          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={() => setPlaying((p) => !p)}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#2F5746] hover:bg-[#DDE8DF] focus-ring"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause className="h-3.5 w-3.5" aria-hidden /> : <Play className="h-3.5 w-3.5" aria-hidden />}
              {playing ? "বিরতি" : "চালান"}
            </button>
            <Link to="/demo" className="text-xs font-semibold text-[#2F5746] underline-offset-4 hover:underline focus-ring rounded">
              {lang === "bn" ? "পুরো ডেমো দেখুন →" : "See full demo →"}
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Animated sound-wave illustration for the Rahela story (V3 §6)
// ---------------------------------------------------------------------------
function SoundWave({ animate }: { animate: boolean }) {
  const bars = [0.5, 0.9, 0.4, 1, 0.6, 0.85, 0.35, 0.75, 0.5, 0.95, 0.45, 0.7, 0.55, 0.9, 0.4];
  return (
    <div className="flex items-center gap-[3px] h-10" aria-hidden>
      {bars.map((b, i) => (
        <motion.span
          key={i}
          className="w-[4px] rounded-full bg-[#2F5746]/70"
          animate={
            animate
              ? { scaleY: [b * 0.5, b, b * 0.6, b * 0.9, b * 0.5], opacity: [0.5, 1, 0.6, 0.9, 0.5] }
              : { scaleY: b * 0.5, opacity: 0.6 }
          }
          transition={
            animate
              ? { duration: 1.6, repeat: Infinity, delay: i * 0.09, ease: "easeInOut" }
              : { duration: 0.3 }
          }
          style={{ height: "100%", originY: 0.5 }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Rahela story (fictional, clearly labeled) — V3 §6
// ---------------------------------------------------------------------------
function RahelaStory() {
  const lang = useLang();
  const prefersReduced = useReducedMotion();
  const [hover, setHover] = useState(false);

  return (
    <Reveal>
      <Card className="border-[#D8DED5] bg-[#FFFEFA] overflow-hidden">
        <CardContent className="p-0">
          <div className="grid md:grid-cols-[auto_1fr] gap-0">
            <div className="bg-[#2F5746] p-6 md:p-8 flex flex-col items-center justify-center gap-3 text-[#FFFEFA]">
              <PhoneCall className="h-8 w-8" aria-hidden />
              <SoundWave animate={!prefersReduced && (hover || false)} />
              <span className="text-[11px] font-semibold tracking-wide text-[#DDE8DF] text-center bn-text">
                {lang === "bn" ? "রাত ২টা · অচেনা নম্বর" : "2 AM · unknown number"}
              </span>
            </div>
            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <h2 className="text-xl md:text-2xl font-bold text-[#202C26] bn-text">
                  {lang === "bn" ? "রাহেলার গল্প — ছেলের কণ্ঠে এক ফোন" : "Rahela's story — one call in her son's voice"}
                </h2>
                <Badge variant="outline" className="border-[#8A5B28]/50 text-[#8A5B28] text-[11px] shrink-0">
                  {lang === "bn" ? "কাল্পনিক উদাহরণ" : "Fictional example"}
                </Badge>
              </div>
              <div className="mt-4 space-y-3 text-[15px] text-[#59665F] leading-relaxed bn-text">
                <p>
                  {lang === "bn"
                    ? "রাহেলা একজন প্রবাসীর মা। ছেলে দুবাইয়ে কাজ করে, তার পাঠানো টাকায় সংসার চলে।"
                    : "Rahela is a migrant worker's mother. Her son works in Dubai; his remittance runs the household."}
                </p>
                <p className="rounded-xl bg-[#F4F1EB] border border-[#D8DED5] px-4 py-3 text-[#202C26] italic">
                  {lang === "bn"
                    ? "“মা, আমি বিপদে পড়েছি, এখনই ৫০,০০০ টাকা পাঠাও — কাউকে বলো না।”"
                    : "“Mom, I'm in trouble — send 50,000 taka right now. Don't tell anyone.”"}
                </p>
                <p>
                  {lang === "bn"
                    ? "এই কাল্পনিক ঘটনায় কণ্ঠটি এআই দিয়ে তৈরি নকল কণ্ঠ। আজকাল অল্প কিছু নমুনা কণ্ঠ থেকেই কারও গলার নকল বানানো সম্ভব।"
                    : "In this fictional case the voice is an AI-generated clone. Today, a short voice sample is enough to imitate someone's voice."}
                </p>
                <p className="font-semibold text-[#202C26]">
                  {lang === "bn"
                    ? "বাংলাশিল্ড চায় প্রতিটি রাহেলা যেন টাকা পাঠানোর আগে একবার থেমে যাচাই করতে পারেন।"
                    : "BanglaShield wants every Rahela to pause and verify before the money leaves."}
                </p>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to="/check/voice?demo=rahela-voice">
                  <Button
                    size="lg"
                    className="bg-[#2F5746] text-[#FFFEFA] hover:bg-[#24453A] h-12 px-6 text-base"
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                    onFocus={() => setHover(true)}
                    onBlur={() => setHover(false)}
                  >
                    <Mic className="h-5 w-5" aria-hidden />
                    {lang === "bn" ? "রাহেলার ঘটনাটি বিশ্লেষণ করুন" : "Analyze Rahela's case"}
                  </Button>
                </Link>
                <Link to="/learn">
                  <Button variant="outline" size="lg" className="border-[#D8DED5] text-[#2F5746] hover:bg-[#DDE8DF] h-12 px-6 text-base">
                    <BookOpen className="h-5 w-5" aria-hidden />
                    {lang === "bn" ? "কীভাবে বাঁচবেন শিখুন" : "Learn to stay safe"}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Reveal>
  );
}

// ---------------------------------------------------------------------------
// Home page — V3 §5: purpose within five seconds, no repetition
// ---------------------------------------------------------------------------
export default function HomePage() {
  const t = useT();
  const lang = useLang();
  const bi = useBi();
  // Pick 3 representative lessons incl. the AI-voice one (stable derivation).
  const aiVoice = LESSONS.find((l) => l.id.includes("voice"));
  const rest = LESSONS.filter((l) => l.id !== aiVoice?.id);
  const featured = [aiVoice ?? rest[0], ...rest.slice(0, aiVoice ? 2 : 3)].filter(Boolean);
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 md:py-16 space-y-14 md:space-y-20">
      {/* ================= HERO — purpose in 5 seconds ================= */}
      <section className="grid lg:grid-cols-[1fr_400px] gap-8 items-center">
        <div>
          <Badge variant="outline" className="mb-4 border-[#2F5746]/40 text-[#2F5746] bg-[#DDE8DF]/50">
            <ShieldCheck className="h-3.5 w-3.5 mr-1.5" aria-hidden />
            {lang === "bn" ? "বিনামূল্যে · বাংলায় · নাম ছাড়াই" : "Free · In Bangla · No sign-up"}
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#202C26] leading-[1.25] bn-text">
            {lang === "bn" ? (
              <>
                প্রতারণার ফাঁদে পড়ার আগে,
                <br />
                <span className="text-[#2F5746]">একবার যাচাই করুন।</span>
              </>
            ) : (
              <>
                Before the scam trap closes,
                <br />
                <span className="text-[#2F5746]">verify it once.</span>
              </>
            )}
          </h1>
          <p className="mt-4 text-lg text-[#59665F] leading-relaxed bn-text max-w-xl">
            {lang === "bn"
              ? "সন্দেহজনক ফোন, মেসেজ, স্ক্রিনশট বা লিংক দিন — প্রমাণসহ বিশ্লেষণ পান। প্রতিষ্ঠানের আসল নম্বরে নিজে যাচাই করে সিদ্ধান্ত নিন।"
              : "Share a suspicious call, message, screenshot or link — get an evidence-based analysis. Then verify yourself through official channels."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/check">
              <Button size="lg" className="bg-[#2F5746] text-[#FFFEFA] hover:bg-[#24453A] h-13 px-7 text-base font-bold h-12">
                <ShieldHalf className="h-5 w-5" aria-hidden />
                {lang === "bn" ? "এখনই যাচাই করুন" : "Verify now"}
              </Button>
            </Link>
            <Link to="/demo">
              <Button variant="outline" size="lg" className="border-[#2F5746]/40 text-[#2F5746] hover:bg-[#DDE8DF] h-12 px-6 text-base">
                <Play className="h-5 w-5" aria-hidden />
                {lang === "bn" ? "ডেমো দেখুন" : "Watch demo"}
              </Button>
            </Link>
          </div>
          <p className="mt-3 text-sm text-[#8A9B90] flex items-center gap-1.5 bn-text">
            <EyeOff className="h-4 w-4" aria-hidden />
            {lang === "bn" ? "আপনার নাম-নম্বর জানা লাগে না · কণ্ঠস্বর ও ছবি সংরক্ষণ হয় না" : "No name or number needed · voice & images never stored"}
          </p>
        </div>
        <ShieldLensPreview />
      </section>

      {/* ================= RAHELA STORY ================= */}
      <RahelaStory />

      {/* ================= INPUT OPTIONS ================= */}
      <section aria-labelledby="q-modality">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h2 id="q-modality" className="text-2xl md:text-3xl font-bold text-[#202C26] bn-text">
              {lang === "bn" ? "আপনার সন্দেহটা কী নিয়ে?" : "What is your suspicion about?"}
            </h2>
            <p className="mt-1.5 text-[#59665F] bn-text">
              {lang === "bn" ? "যেটা পেয়েছেন সেটাই দিন — বাকিটা বাংলাশিল্ড দেখবে।" : "Give what you received — BanglaShield does the rest."}
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              to: "/check/voice",
              icon: <Mic className="h-6 w-6" aria-hidden />,
              title: { bn: "ভয়েসে বলুন", en: "Describe by voice" },
              desc: {
                bn: "মাইকে চেপে নিজের ভাষায় ঘটনা বলুন — বাংলা বা বাংলিশ",
                en: "Hold the mic and speak in Bangla or Banglish",
              },
            },
            {
              to: "/check/message",
              icon: <MessageSquareText className="h-6 w-6" aria-hidden />,
              title: { bn: "এসএমএস / চ্যাট", en: "SMS / chat" },
              desc: {
                bn: "সন্দেহজনক মেসেজটি কপি করে পেস্ট করুন",
                en: "Paste the suspicious message",
              },
            },
            {
              to: "/check/image",
              icon: <ImageIcon className="h-6 w-6" aria-hidden />,
              title: { bn: "স্ক্রিনশট", en: "Screenshot" },
              desc: {
                bn: "স্ক্রিনশট আপলোড করুন — লেখা বের করে পরীক্ষা হবে",
                en: "Upload a screenshot — text is extracted and checked",
              },
            },
            {
              to: "/check/link",
              icon: <Link2 className="h-6 w-6" aria-hidden />,
              title: { bn: "লিংক / কিউআর", en: "Link / QR" },
              desc: {
                bn: "লিংক বা কিউআর কোডের গন্তব্য যাচাই করুন",
                en: "Check where a link or QR code leads",
              },
            },
          ].map((m) => (
            <Link
              key={m.to}
              to={m.to}
              className="group rounded-2xl border-2 border-[#D8DED5] bg-[#FFFEFA] p-5 transition-all hover:border-[#2F5746]/50 hover:shadow-md focus-ring"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#DDE8DF] text-[#2F5746] transition-colors group-hover:bg-[#2F5746] group-hover:text-[#FFFEFA]">
                {m.icon}
              </span>
              <h3 className="mt-3.5 text-lg font-bold text-[#202C26] bn-text">{bi(m.title)}</h3>
              <p className="mt-1 text-sm text-[#59665F] leading-relaxed bn-text">{bi(m.desc)}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#2F5746]">
                {lang === "bn" ? "শুরু করুন" : "Start"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= HOW IT WORKS + TRUST (compact) ================= */}
      <section className="grid md:grid-cols-2 gap-6">
        <Reveal>
          <Card className="border-[#D8DED5] bg-[#FFFEFA] h-full">
            <CardContent className="p-6">
              <h2 className="flex items-center gap-2 text-xl font-bold text-[#202C26] bn-text">
                <Cpu className="h-5 w-5 text-[#2F5746]" aria-hidden />
                {lang === "bn" ? "কীভাবে কাজ করে" : "How it works"}
              </h2>
              <ol className="mt-4 space-y-3">
                {[
                  {
                    t: { bn: "সন্দেহজনক কনটেন্ট দিন", en: "Share the suspicious content" },
                    d: { bn: "মেসেজ, কলের বর্ণনা, স্ক্রিনশট বা লিংক", en: "A message, call description, screenshot or link" },
                  },
                  {
                    t: { bn: "প্রমাণভিত্তিক বিশ্লেষণ পান", en: "Get an evidence-based analysis" },
                    d: { bn: "নিয়ম-ইঞ্জিন + এআই বিশ্লেষণ, নিরাপত্তা-যাচাইসহ", en: "Rule engine + AI analysis, with safety validation" },
                  },
                  {
                    t: { bn: "নিরাপদ সিদ্ধান্ত নিন", en: "Make a safe decision" },
                    d: { bn: "আসল নম্বরে নিজে যাচাই করে অগ্রসর হোন", en: "Verify independently through official channels" },
                  },
                ].map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2F5746] text-[#FFFEFA] text-sm font-bold bn-text">
                      {["১", "২", "৩"][i]}
                    </span>
                    <div>
                      <p className="font-semibold text-[#202C26] bn-text">{bi(s.t)}</p>
                      <p className="text-sm text-[#59665F] bn-text">{bi(s.d)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </Reveal>
        <Reveal delayMs={80}>
          <Card className="border-[#D8DED5] bg-[#FFFEFA] h-full">
            <CardContent className="p-6">
              <h2 className="flex items-center gap-2 text-xl font-bold text-[#202C26] bn-text">
                <EyeOff className="h-5 w-5 text-[#2F5746]" aria-hidden />
                {lang === "bn" ? "আপনার গোপনীয়তা" : "Your privacy"}
              </h2>
              <ul className="mt-4 space-y-3">
                {[
                  {
                    icon: <EyeOff className="h-4 w-4" aria-hidden />,
                    t: { bn: "নাম-নম্বর লাগে না, কেস বেনামে", en: "No name or number; cases stay anonymous" },
                  },
                  {
                    icon: <CheckCircle2 className="h-4 w-4" aria-hidden />,
                    t: { bn: "ওটিপি-পিন-নম্বর স্বয়ংক্রিয়ভাবে আড়াল হয়", en: "OTPs, PINs and numbers are auto-redacted" },
                  },
                  {
                    icon: <CheckCircle2 className="h-4 w-4" aria-hidden />,
                    t: { bn: "কণ্ঠস্বর ও ছবি সংরক্ষণ হয় না", en: "Voice and images are never stored" },
                  },
                  {
                    icon: <AlertTriangle className="h-4 w-4" aria-hidden />,
                    t: { bn: "এআই-ও ভুল করতে পারে — ফলাফল নিশ্চয়তা নয়", en: "AI can be wrong — results are not guarantees" },
                  },
                ].map((s, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[15px] text-[#59665F] bn-text">
                    <span className="mt-0.5 text-[#2F5746]">{s.icon}</span>
                    <span>{bi(s.t)}</span>
                  </li>
                ))}
              </ul>
              <Link to="/privacy" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#2F5746] hover:underline focus-ring rounded">
                {lang === "bn" ? "গোপনীয়তা নীতি ও কেস ইতিহাস →" : "Privacy policy & case history →"}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </CardContent>
          </Card>
        </Reveal>
      </section>

      {/* ================= SCAMACADEMY ================= */}
      <section aria-labelledby="q-academy">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h2 id="q-academy" className="text-2xl md:text-3xl font-bold text-[#202C26] bn-text">
              {lang === "bn" ? "আজই ৫ মিনিটে একটা কৌশল শিখুন" : "Learn one tactic in 5 minutes today"}
            </h2>
            <p className="mt-1.5 text-[#59665F] bn-text">
              {lang === "bn"
                ? `${LESSONS.length} টি ইন্টারঅ্যাক্টিভ পাঠ — এআই নকল কণ্ঠ, কিউআর ফিশিং, বৃত্তি ও বিনিয়োগ প্রতারণাসহ`
                : `${LESSONS.length} interactive lessons — incl. AI voice clones, QR phishing, scholarship & investment fraud`}
            </p>
          </div>
          <Link to="/learn" className="hidden sm:block">
            <Button variant="outline" className="border-[#2F5746]/40 text-[#2F5746] hover:bg-[#DDE8DF]">
              {t("common.viewAll")}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((l) => (
            <Link
              key={l.id}
              to={`/learn?lesson=${l.id}`}
              className="group rounded-2xl border-2 border-[#D8DED5] bg-[#FFFEFA] p-5 transition-all hover:border-[#2F5746]/50 hover:shadow-md focus-ring"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DDE8DF] text-[#2F5746]">
                <BookOpen className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-3 font-bold text-[#202C26] bn-text">{bi(l.title)}</h3>
              <p className="mt-1 text-sm text-[#59665F] leading-relaxed bn-text line-clamp-2">{bi(l.summary)}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#8A5B28]">
                <HelpCircle className="h-3.5 w-3.5" aria-hidden />
                {l.minutes} {lang === "bn" ? "মিনিট · কুইজসহ" : "min · with quiz"}
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-4 sm:hidden">
          <Link to="/learn">
            <Button variant="outline" className="w-full border-[#2F5746]/40 text-[#2F5746] hover:bg-[#DDE8DF]">
              {t("common.viewAll")}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </Link>
        </div>
      </section>

      {/* ================= VERIFIED RESOURCES ================= */}
      <section aria-labelledby="q-resources">
        <div className="mb-6">
          <h2 id="q-resources" className="flex items-center gap-2.5 text-2xl md:text-3xl font-bold text-[#202C26] bn-text">
            <Landmark className="h-6 w-6 text-[#2F5746]" aria-hidden />
            {lang === "bn" ? "নিজে যাচাই করুন — প্রতিষ্ঠানের আসল ঠিকানায়" : "Verify yourself — through official channels"}
          </h2>
          <p className="mt-1.5 text-[#59665F] bn-text">
            {lang === "bn"
              ? "বার্তায় আসা নম্বর নয় — এই যাচাইকৃত ঠিকানাগুলো থেকে নিজে যোগাযোগ করুন।"
              : "Never use numbers from the message — contact institutions yourself through these verified channels."}
          </p>
        </div>
        <ResourceList />
      </section>
    </div>
  );
}
