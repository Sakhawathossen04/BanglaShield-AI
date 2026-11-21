"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Mic,
  MessageSquareText,
  ImageIcon,
  Link2,
  QrCode,
  Siren,
  ShieldHalf,
  ShieldCheck,
  ArrowRight,
  PhoneCall,
  Lock,
  EyeOff,
  Cpu,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  HeartHandshake,
  Landmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "../router";
import { useT, useLang } from "../i18n";
import { cn } from "@/lib/utils";
import { LESSONS } from "../data/lessons";
import { Reveal } from "../ui-bits";

// ---------------------------------------------------------------------------
// Sample Shield Lens preview data (clearly labeled demonstration)
// ---------------------------------------------------------------------------
const PREVIEW_STAGES = [
  {
    type: "observed" as const,
    title: { bn: "১. পরিচয়ের দাবি", en: "1. Identity claim" },
    desc: {
      bn: "“আমি বিকাশ টিম থেকে বলছি…” — প্রেরক নিজেকে পরিচিত প্রতিষ্ঠান বলে পরিচয় দিচ্ছে (বার্তায় দেখা যায়)।",
      en: "“This is the bKash team…” — the sender claims a familiar institution (visible in the message).",
    },
  },
  {
    type: "inferred" as const,
    title: { bn: "২. ভয় ও তাড়াহুড়ো", en: "2. Fear & urgency" },
    desc: {
      bn: "“একাউন্ট সাসপেন্ড হবে… এখনই!” — ভয় দেখিয়ে ভাবনার সময় কেড়ে নেওয়া হচ্ছে।",
      en: "“Your account will be suspended… right now!” — fear removes your time to think.",
    },
  },
  {
    type: "observed" as const,
    title: { bn: "৩. কোড চাওয়া", en: "3. The code request" },
    desc: {
      bn: "“আপনার OTP টা দিয়ে দিন” — প্রকৃত প্রতিষ্ঠান কখনোই এমনটি চায় না। এই মুহূর্তটিই ফাঁদ।",
      en: "“Give me your OTP” — a real institution never asks. This moment is the trap.",
    },
  },
  {
    type: "hypothetical" as const,
    title: { bn: "৪. দুটি পথ", en: "4. Two paths" },
    desc: {
      bn: "কোড দিলে অননুমোদিত লেনদেন হতে পারে; থেমে নিজে যাচাই করলে ক্ষতির পথ বন্ধ।",
      en: "Share the code: unauthorized transactions may follow. Stop and verify: the risk ends.",
    },
  },
];

function ShieldLensPreview() {
  const t = useT();
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
            নমুনা সিমুলেশন / Sample
          </Badge>
        </div>

        <div className="p-4 md:p-6">
          {/* timeline */}
          <div className="relative mb-5" role="tablist" aria-label="Shield Lens sample timeline">
            <div className="absolute left-0 right-0 top-3 h-1 rounded bg-[#EDEAE1]" aria-hidden />
            <motion.div
              className="absolute top-3 h-1 rounded bg-[#2F5746]"
              animate={{ width: `${((idx + 1) / PREVIEW_STAGES.length) * 100}%` }}
              transition={{ duration: prefersReduced ? 0 : 0.5 }}
              aria-hidden
            />
            <div className="relative flex justify-between">
              {PREVIEW_STAGES.map((s, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === idx}
                  aria-label={s.title[lang === "bn" ? "bn" : "en"]}
                  onClick={() => {
                    setIdx(i);
                    setPlaying(false);
                  }}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold transition-all focus-ring",
                    i <= idx
                      ? cn("border-[#2F5746] bg-[#2F5746] text-[#FFFEFA]", i === idx && "scale-110 shadow-md")
                      : "border-[#D8DED5] bg-[#FFFEFA] text-[#59665F]"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-[110px]">
            <motion.div
              key={idx}
              initial={prefersReduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <Badge
                variant="outline"
                className={cn(
                  "mb-2",
                  stage.type === "observed" && "bg-[#DDE8DF] text-[#2F5746] border-[#2F5746]/40",
                  stage.type === "inferred" && "bg-[#F2E8D5] text-[#8A5B28] border-[#8A5B28]/40",
                  stage.type === "hypothetical" && "bg-[#F4E1DA] text-[#A44435] border-[#A44435]/40 border-dashed"
                )}
              >
                {stage.type === "observed" ? "প্রত্যক্ষ" : stage.type === "inferred" ? "অনুমিত" : "সম্ভাব্য"}
              </Badge>
              <h3 className="text-lg font-bold text-[#202C26] bn-text">{stage.title[lang === "bn" ? "bn" : "en"]}</h3>
              <p className="mt-1 text-[15px] text-[#59665F] leading-relaxed bn-text">{stage.desc[lang === "bn" ? "bn" : "en"]}</p>
            </motion.div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-[#D8DED5] text-[#2F5746]"
                aria-label="Previous stage"
                onClick={() => {
                  setIdx((i) => (i - 1 + PREVIEW_STAGES.length) % PREVIEW_STAGES.length);
                  setPlaying(false);
                }}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-[#D8DED5] text-[#2F5746]"
                aria-label="Next stage"
                onClick={() => {
                  setIdx((i) => (i + 1) % PREVIEW_STAGES.length);
                  setPlaying(false);
                }}
              >
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-[#D8DED5] text-[#2F5746]"
                aria-label={playing ? "Pause" : "Play"}
                onClick={() => setPlaying((p) => !p)}
              >
                {playing ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
              </Button>
            </div>
            <Link
              to="/check/message"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#2F5746] hover:underline focus-ring"
            >
              {lang === "bn" ? "নিজের বার্তা দিয়ে দেখুন" : "Try with your own message"}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Home page
// ---------------------------------------------------------------------------

export default function HomePage() {
  const t = useT();
  const lang = useLang();
  const prefersReduced = useReducedMotion();
  const bn = lang === "bn";


  const modalities = [
    {
      to: "/check/voice",
      icon: <Mic className="h-6 w-6" aria-hidden />,
      title: bn ? "ভয়েসে বলুন" : "Describe by voice",
      desc: bn
        ? "মাইকে চেপে নিজের ভাষায় ঘটনা বলুন — বাংলা বা বাংলিশ"
        : "Hold the mic and describe the situation — Bangla or Banglish",
      primary: true,
    },
    {
      to: "/check/message",
      icon: <MessageSquareText className="h-6 w-6" aria-hidden />,
      title: bn ? "এসএমএস / চ্যাট" : "SMS / chat",
      desc: bn ? "সন্দেহজনক মেসেজটি কপি করে পেস্ট করুন" : "Paste the suspicious message text",
    },
    {
      to: "/check/image",
      icon: <ImageIcon className="h-6 w-6" aria-hidden />,
      title: bn ? "স্ক্রিনশট" : "Screenshot",
      desc: bn ? "স্ক্রিনশট আপলোড করুন — লেখা বের করে পরীক্ষা হবে" : "Upload a screenshot — text is extracted and reviewed",
    },
    {
      to: "/check/link",
      icon: (
        <span className="relative">
          <Link2 className="h-6 w-6" aria-hidden />
          <QrCode className="absolute -right-2 -top-1.5 h-3.5 w-3.5" aria-hidden />
        </span>
      ),
      title: bn ? "লিংক / কিউআর" : "Link / QR",
      desc: bn ? "লিংক বা কিউআর কোডের গন্তব্য যাচাই করুন" : "Check a link or QR destination",
    },
  ];

  const steps = [
    {
      icon: <MessageSquareText className="h-6 w-6" aria-hidden />,
      title: bn ? "সন্দেহজনক কনটেন্ট দিন" : "Share the suspicious content",
      desc: bn ? "বার্তা, স্ক্রিনশট, লিংক বা ভয়েস — যেভাবে সুবিধা" : "Message, screenshot, link or voice — whichever is easier",
    },
    {
      icon: <Cpu className="h-6 w-6" aria-hidden />,
      title: bn ? "প্রমাণভিত্তিক বিশ্লেষণ পান" : "Get evidence-based analysis",
      desc: bn
        ? "নিরাপত্তা-যাচাই (Safety Gate) উত্তীর্ণ ফলাফলে প্রমাণ, অজানা বিষয় ও ধাপে ধাপে ব্যাখ্যা"
        : "Safety-Gate-validated results with evidence, unknowns and step-by-step explanation",
    },
    {
      icon: <ShieldCheck className="h-6 w-6" aria-hidden />,
      title: bn ? "নিরাপদ সিদ্ধান্ত নিন" : "Take the safe action",
      desc: bn
        ? "Shield Lens-এ আক্রমণের ধাপগুলো দেখে সঠিক পরবর্তী পদক্ষেপ জানুন"
        : "See the attack stages in Shield Lens and know the right next step",
    },
  ];

  return (
    <div>
      {/* ---------------- Hero ---------------- */}
      <section className="texture-paper border-b border-[#D8DED5]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 md:py-16 grid md:grid-cols-2 gap-8 md:gap-10 items-center">
          <Reveal delayMs={0}>
            <Badge className="mb-4 bg-[#DDE8DF] text-[#2F5746] hover:bg-[#DDE8DF] border-0 gap-1.5">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              {bn ? "এআই-চালিত প্রতারণা যাচাই" : "AI-powered scam verification"}
            </Badge>
            <h1 className="text-3xl md:text-[2.6rem] leading-[1.25] font-bold text-[#202C26] bn-text">
              {bn ? (
                <>
                  একটা ফোন কলই পারে <span className="text-[#A44435]">এক মাসের রোজগার</span> কেড়ে নিতে।
                  <br />
                  আগে যাচাই করুন — <span className="text-[#2F5746]">বাংলাশিল্ড</span> পাশে আছে।
                </>
              ) : (
                <>
                  One call can take away a month&apos;s income.
                  <br />
                  Verify first — <span className="text-[#2F5746]">BanglaShield</span> is beside you.
                </>
              )}
            </h1>
            <p className="mt-4 text-lg text-[#59665F] leading-relaxed bn-text">
              {bn
                ? "সন্দেহজনক কল, মেসেজ, লিংক বা স্ক্রিনশট — টাকা বা কোড দেওয়ার আগে বিনামূল্যে যাচাই করুন। কোনো অ্যাকাউন্ট লাগবে না।"
                : "Suspicious calls, messages, links or screenshots — verify for free before paying or sharing codes. No account needed."}
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link to="/check" className="focus-ring">
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg font-bold bg-[#2F5746] text-[#FFFEFA] hover:bg-[#24453A] rounded-xl shadow-sm gap-2"
                >
                  <ShieldCheck className="h-5 w-5" aria-hidden />
                  {bn ? "নিরাপত্তা যাচাই করুন" : "Verify safety now"}
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  const el = document.getElementById("lens-demo");
                  el?.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
                }}
                className="h-14 px-6 text-base font-bold border-2 border-[#2F5746]/60 text-[#2F5746] hover:bg-[#DDE8DF] rounded-xl gap-2"
              >
                <Play className="h-5 w-5" aria-hidden />
                {bn ? "প্রতারণা কেমন করে কাজ করে দেখুন" : "See how a scam works"}
              </Button>
              <Link to="/recovery" className="focus-ring">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-6 text-lg font-bold border-2 border-[#A44435] text-[#A44435] hover:bg-[#F4E1DA] rounded-xl gap-2"
                >
                  <Siren className="h-5 w-5" aria-hidden />
                  {bn ? "ক্ষতি হয়েছে?" : "Already harmed?"}
                </Button>
              </Link>
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm text-[#59665F]">
              <Lock className="h-4 w-4 shrink-0" aria-hidden />
              {bn
                ? "আপনার ভয়েস বা ছবি সংরক্ষণ করা হয় না · ফোন কল রেকর্ড করা হয় না"
                : "Your audio or images are never stored · phone calls are never recorded"}
            </p>
          </Reveal>

          <Reveal delayMs={120} className="relative">
            <img
              src="/hero-family.png"
              alt={bn ? "একটি বাংলাদেশি পরিবার নিরাপদে, বাংলাশিল্ড ব্যানার হাতে" : "A Bangladeshi family safe at home"}
              className="w-full rounded-2xl border border-[#D8DED5] bg-[#FFFEFA] object-cover shadow-sm"
            />
            <div className="absolute -bottom-4 left-4 right-4 sm:left-6 sm:right-auto rounded-xl border border-[#D8DED5] bg-[#FFFEFA] px-4 py-3 shadow-md flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#DDE8DF]">
                <HeartHandshake className="h-5 w-5 text-[#2F5746]" aria-hidden />
              </span>
              <p className="text-sm font-medium text-[#202C26] bn-text">
                {bn ? "মানুষ রক্ষা · পরিবার রক্ষা · জীবিকা রক্ষা" : "Protect people · families · livelihoods"}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- Saimon story ---------------- */}
      <section className="border-b border-[#D8DED5] bg-[#FFFEFA]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 md:py-14">
          <Reveal className="grid md:grid-cols-[auto_1fr] gap-6 md:gap-10 items-start">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F4E1DA] shrink-0" aria-hidden>
              <PhoneCall className="h-8 w-8 text-[#A44435]" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#202C26] bn-text">
                {bn ? "সাইমনের গল্প — এক মাসের রোজগার এক কলে" : "Saimon's story — a month's income in one call"}
              </h2>
              <div className="mt-4 max-w-3xl space-y-3 text-[17px] text-[#59665F] leading-relaxed bn-text">
                <p>
                  {bn
                    ? "সাইমন একজন গ্রামের কর্মী। মাসে ৩০,০০০ টাকা আয় করেন — সেই টাকায় চলে পরিবারের খাবার, সন্তানের পড়াশোনা, বাবার ওষুধ।"
                    : "Saimon is a rural worker earning Tk 30,000 a month — that money feeds his family, pays for his children's education and his father's medicine."}
                </p>
                <p>
                  {bn
                    ? "এক বিকেলে ফোন এলো: “আমি বিকাশ থেকে বলছি, আপনার একাউন্ট বন্ধ হবে — এখনই OTP টা বলুন।” ভয় পেয়ে সাইমন প্রায় কোডটা দিয়ে দিচ্ছিলেন। এক কোড — আর পুরো মাসের রোজগার হাওয়া।"
                    : "One afternoon a call came: “This is bKash, your account will be blocked — give me the OTP now.” Frightened, Saimon almost shared the code. One code — and a whole month's income gone."}
                </p>
                <p className="font-semibold text-[#2F5746]">
                  {bn
                    ? "বাংলাশিল্ড চায় প্রতিটি সাইমন যেন কোড দেওয়ার আগে একবার থেমে যাচাই করতে পারেন।"
                    : "BanglaShield exists so every Saimon can pause and verify before sharing anything."}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- Modality cards ---------------- */}
      <section className="border-b border-[#D8DED5]" aria-labelledby="modality-heading">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 md:py-14">
          <Reveal>
            <h2 id="modality-heading" className="text-2xl md:text-3xl font-bold text-[#202C26] text-center bn-text">
              {bn ? "আপনার সন্দেহটা কী নিয়ে?" : "What is your suspicion about?"}
            </h2>
            <p className="mt-2 text-center text-[#59665F] bn-text">
              {bn ? "যেভাবে সুবিধা হয়, সেভাবে জমা দিন — সব পদ্ধতিতে একই সতর্ক বিশ্লেষণ" : "Submit whichever way is easiest — every path gets the same careful analysis"}
            </p>
          </Reveal>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {modalities.map((m, i) => (
              <Reveal key={m.to} delayMs={i * 60}>
                <Link to={m.to} className="group block h-full rounded-2xl focus-ring">
                  <Card
                    className={cn(
                      "h-full border-2 bg-[#FFFEFA] transition-all group-hover:border-[#2F5746]/60 group-hover:shadow-md",
                      m.primary ? "border-[#2F5746]/50" : "border-[#D8DED5]"
                    )}
                  >
                    <CardContent className="p-5 md:p-6 flex flex-col h-full">
                      <span
                        className={cn(
                          "mb-4 flex h-12 w-12 items-center justify-center rounded-xl",
                          m.primary ? "bg-[#2F5746] text-[#FFFEFA]" : "bg-[#DDE8DF] text-[#2F5746]"
                        )}
                        aria-hidden
                      >
                        {m.icon}
                      </span>
                      <h3 className="text-lg font-bold text-[#202C26] bn-text">{m.title}</h3>
                      <p className="mt-1.5 text-sm text-[#59665F] leading-relaxed bn-text flex-1">{m.desc}</p>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#2F5746]">
                        {bn ? "শুরু করুন" : "Start"}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-5 text-center text-sm text-[#59665F] bn-text">
            {bn
              ? "* টাইপ করতে অসুবিধা হলে ভয়েস ব্যবহার করুন — পড়া-লেখা জানা লাগে না"
              : "* If typing is hard, use voice — no literacy required"}
          </Reveal>
        </div>
      </section>

      {/* ---------------- Shield Lens preview ---------------- */}
      <section id="lens-demo" className="border-b border-[#D8DED5] bg-[#EDEAE1]/50 scroll-mt-16" aria-labelledby="lens-heading">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 md:py-14 grid lg:grid-cols-2 gap-8 items-center">
          <Reveal>
            <Badge className="mb-4 bg-[#2F5746] text-[#FFFEFA] hover:bg-[#2F5746] border-0">
              <ShieldHalf className="h-3.5 w-3.5 mr-1.5" aria-hidden />
              Shield Lens
            </Badge>
            <h2 id="lens-heading" className="text-2xl md:text-3xl font-bold text-[#202C26] bn-text">
              {bn ? "প্রতারণাটি চোখের সামনে ভাঁজ হয়ে খুলে যায়" : "Watch the scam unfold — stage by stage"}
            </h2>
            <p className="mt-4 text-[17px] text-[#59665F] leading-relaxed bn-text">
              {bn
                ? "সন্দেহজনক বার্তাটি Shield Lens-এ একটি সময়রেখায় সাজানো হয় — কোনটা প্রত্যক্ষ প্রমাণ, কোনটা অনুমান, কোনটা সম্ভাব্য পরিণতি। প্রতিটি ধাপে দেখানো হয় নিরাপদ বনাম বিপজ্জনক পথের তুলনা।"
                : "Shield Lens turns a suspicious message into a timeline — what is directly observed, what is inferred, and what could happen. Each step contrasts the safe and unsafe paths."}
            </p>
            <ul className="mt-5 space-y-2.5">
              {[
                bn ? "প্লে / পজ / স্ক্রল — নিজের গতিতে দেখুন" : "Play, pause, scrub — explore at your own pace",
                bn ? "প্রমাণের কার্ডে ক্লিক করে উৎস দেখুন" : "Click evidence cards to see the source",
                bn ? "শেষ ধাপে দুই পথের সিদ্ধান্ত তুলনা" : "The final stage compares both decision paths",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[#202C26]">
                  <CheckCircle2 className="mt-1 h-4.5 w-4.5 shrink-0 text-[#2F5746]" aria-hidden />
                  <span className="bn-text">{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delayMs={100}>
            <ShieldLensPreview />
          </Reveal>
        </div>
      </section>

      {/* ---------------- How it works ---------------- */}
      <section className="border-b border-[#D8DED5]" aria-labelledby="how-heading">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 md:py-14">
          <Reveal className="text-2xl md:text-3xl font-bold text-[#202C26] text-center bn-text">
            <h2 id="how-heading">{bn ? "কীভাবে কাজ করে" : "How it works"}</h2>
          </Reveal>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal key={i} delayMs={i * 80}>
                <Card className="h-full border border-[#D8DED5] bg-[#FFFEFA]">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DDE8DF] text-[#2F5746]" aria-hidden>
                        {s.icon}
                      </span>
                      <span className="text-xs font-bold text-[#8A5B28] bn-text">
                        {bn ? `ধাপ ${i + 1}` : `Step ${i + 1}`}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[#202C26] bn-text">{s.title}</h3>
                    <p className="mt-1.5 text-sm text-[#59665F] leading-relaxed bn-text">{s.desc}</p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Privacy & honesty ---------------- */}
      <section className="border-b border-[#D8DED5] bg-[#FFFEFA]" aria-labelledby="privacy-heading">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 md:py-14">
          <Reveal>
            <h2 id="privacy-heading" className="text-2xl md:text-3xl font-bold text-[#202C26] text-center bn-text">
              {bn ? "আপনার গোপনীয়তা, আমাদের সীমাবদ্ধতা — খোলাখুলি" : "Your privacy, our limits — stated openly"}
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: <EyeOff className="h-6 w-6" aria-hidden />,
                title: bn ? "যা করি না" : "What we never do",
                items: bn
                  ? ["ফোন কল রেকর্ড বা আড়শোনা করি না", "ছবি/অডিও সার্ভারে জমা রাখি না", "ওটিপি-পিন জামাই রাখি না — বার্তা পাঠানোর আগেই আড়াল"]
                  : ["Never record or intercept calls", "Never store your images/audio", "Never keep OTPs/PINs — redacted before anything is saved"],
              },
              {
                icon: <Lock className="h-6 w-6" aria-hidden />,
                title: bn ? "যা সুরক্ষিত" : "What is protected",
                items: bn
                  ? ["বিশ্লেষণে ব্যবহারের আগেই সংবেদনশীল তথ্য মুছে ফেলা হয়", "কেস আইডি ছাড়া কেউ আপনার তথ্য দেখতে পারে না", "যেকোনো সময় নিজের তথ্য দেখুন ও মুছে ফেলুন"]
                  : ["Sensitive data is stripped before analysis", "Nobody sees your data without the case ID", "View and delete your data anytime"],
              },
              {
                icon: <Cpu className="h-6 w-6" aria-hidden />,
                title: bn ? "এআই-এর সীমা" : "AI limitations",
                items: bn
                  ? ["ফলাফল প্রমাণভিত্তিক, তবু ভবিষ্যদ্বাণী নয়", "নিরাপত্তা নীতির কারণে লিংক আমরা খুলে দেখি না", "নিশ্চিত না হলে ফলাফল 'নিশ্চিত নয়' — বানানো নিশ্চয়তা নয়"]
                  : ["Results are evidence-based, not predictions", "We never open links (safety policy)", "Uncertain cases are labeled uncertain — never fake certainty"],
              },
            ].map((c, i) => (
              <Reveal key={i} delayMs={i * 70}>
                <Card className="h-full border border-[#D8DED5]">
                  <CardContent className="p-6">
                    <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F2E8D5] text-[#8A5B28]" aria-hidden>
                      {c.icon}
                    </span>
                    <h3 className="text-lg font-bold text-[#202C26] bn-text">{c.title}</h3>
                    <ul className="mt-3 space-y-2">
                      {c.items.map((it) => (
                        <li key={it} className="flex items-start gap-2 text-sm text-[#59665F] leading-relaxed">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2F5746]" aria-hidden />
                          <span className="bn-text">{it}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- ScamAcademy teaser ---------------- */}
      <section className="border-b border-[#D8DED5]" aria-labelledby="learn-heading">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 md:py-14 grid md:grid-cols-[1fr_auto] gap-8 items-center">
          <Reveal>
            <Badge className="mb-4 bg-[#F2E8D5] text-[#8A5B28] hover:bg-[#F2E8D5] border-0 gap-1.5">
              <BookOpen className="h-3.5 w-3.5" aria-hidden /> ScamAcademy
            </Badge>
            <h2 id="learn-heading" className="text-2xl md:text-3xl font-bold text-[#202C26] bn-text">
              {bn ? "আজই ৫ মিনিটে একটা কৌশল শিখুন" : "Learn one tactic in 5 minutes"}
            </h2>
            <p className="mt-3 text-[#59665F] leading-relaxed bn-text max-w-2xl">
              {bn
                ? "ছোট ছোট বাস্তব পরিস্থিতিতে নিজের সিদ্ধান্ত পরীক্ষা করুন — সাথে সাথে বুঝে যাবেন কোথায় ফাঁদ। বাংলায়, সহজ ভাষায়।"
                : "Test your decisions in small realistic scenarios — instant feedback shows where the trap was. In simple Bangla."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {LESSONS.slice(0, 5).map((l) => (
                <Badge key={l.id} variant="outline" className="border-[#D8DED5] text-[#59665F] bn-text">
                  {l.title[bn ? "bn" : "en"]}
                </Badge>
              ))}
              <Badge variant="outline" className="border-[#D8DED5] text-[#59665F]">
                +{LESSONS.length - 5}
              </Badge>
            </div>
            <Link to="/learn" className="mt-6 inline-block focus-ring">
              <Button className="bg-[#2F5746] text-[#FFFEFA] hover:bg-[#24453A] gap-2 font-bold">
                <BookOpen className="h-4 w-4" aria-hidden />
                {bn ? "স্ক্যামএকাডেমি শুরু করুন" : "Open ScamAcademy"}
              </Button>
            </Link>
          </Reveal>
          <Reveal delayMs={100} className="hidden md:block">
            <img
              src="/hero-learn.png"
              alt={bn ? "দাদি সহজে ফোন ব্যবহার করে সচেতন হচ্ছেন" : "A grandmother learning safely on her phone"}
              className="w-64 lg:w-72 rounded-2xl border border-[#D8DED5] shadow-sm"
            />
          </Reveal>
        </div>
      </section>

      {/* ---------------- Verified official resources ---------------- */}
      <section className="border-b border-[#D8DED5] bg-[#FFFEFA]" aria-labelledby="resources-heading">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 md:py-14">
          <Reveal>
            <Badge className="mb-4 bg-[#DDE8DF] text-[#2F5746] hover:bg-[#DDE8DF] border-0 gap-1.5">
              <Landmark className="h-3.5 w-3.5" aria-hidden />
              {bn ? "যাচাইকৃত অফিসিয়াল চ্যানেল" : "Verified official channels"}
            </Badge>
            <h2 id="resources-heading" className="text-2xl md:text-3xl font-bold text-[#202C26] bn-text">
              {bn ? "নিজে যাচাই করুন — প্রতিষ্ঠানের আসল ঠিকানায়" : "Verify yourself — at the organization's real channels"}
            </h2>
            <p className="mt-2 max-w-3xl text-[#59665F] leading-relaxed bn-text">
              {bn
                ? "বার্তার ভেতরের নম্বর বা লিংকে ভরসা করবেন না। নিচের তালিকা থেকে নিজে কল করুন বা নিজে অ্যাপ/সাইট খুলে দেখুন — প্রতিটি এন্ট্রির উৎস ও যাচাইয়ের তারিখ দেওয়া আছে।"
                : "Never trust numbers or links inside a message. Call or visit independently using this directory — every entry lists its source and verification date."}
            </p>
          </Reveal>
          <HomeResourcesGrid />
        </div>
      </section>

      {/* ---------------- Emergency band ---------------- */}
      <section className="bg-[#2F5746]" aria-labelledby="emergency-heading">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 md:py-10 flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
          <div className="flex-1">
            <h2 id="emergency-heading" className="text-xl md:text-2xl font-bold text-[#FFFEFA] bn-text">
              {bn ? "ইতিমধ্যে টাকা পাঠিয়ে ফেলেছেন বা কোড দিয়েছেন?" : "Already sent money or shared a code?"}
            </h2>
            <p className="mt-1.5 text-[#DDE8DF] bn-text">
              {bn
                ? "সময় নষ্ট না করে জরুরি পদক্ষেপগুলো দেখুন — ক্ষতি আরও থামানো যেতে পারে।"
                : "See the emergency steps now — further harm can still be stopped."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="tel:999"
              className="inline-flex items-center gap-2 rounded-xl bg-[#A44435] px-5 py-3 font-bold text-[#FFFEFA] hover:bg-[#8C382B] transition-colors focus-ring"
            >
              <PhoneCall className="h-5 w-5" aria-hidden /> ৯৯৯
            </a>
            <Link
              to="/recovery"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-[#DDE8DF] px-5 py-3 font-bold text-[#DDE8DF] hover:bg-[#DDE8DF]/10 transition-colors focus-ring bn-text"
            >
              <Siren className="h-5 w-5" aria-hidden />
              {bn ? "জরুরি সহায়তা কেন্দ্র" : "Recovery center"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Verified official resources grid (DB-backed with bundled fallback — always
// renders entries even when the database or AI services are unavailable).
// ---------------------------------------------------------------------------

interface HomeResource {
  key: string;
  name: { bn: string; en: string };
  description: { bn: string; en: string };
  url: string;
  phone: string | null;
  sourceUrl: string;
  verifiedAt: string;
}

function HomeResourcesGrid() {
  const lang = useLang();
  const bn = lang === "bn";
  const [resources, setResources] = useState<HomeResource[] | null>(null);
  const [source, setSource] = useState<string>("database");

  useEffect(() => {
    let alive = true;
    fetch("/api/v1/resources")
      .then((r) => r.json())
      .then((d) => {
        if (alive) {
          setResources(d.resources ?? []);
          setSource(d.source ?? "database");
        }
      })
      .catch(() => {
        if (alive) setResources([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (resources === null) {
    return (
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-36 rounded-2xl bg-[#EDEAE1] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {resources.map((r, i) => (
          <Reveal key={r.key} delayMs={i * 60}>
            <Card className="h-full border border-[#D8DED5] bg-[#FFFEFA] hover:border-[#2F5746]/40 transition-colors">
              <CardContent className="p-5 flex flex-col h-full">
                <p className="font-bold text-[#202C26] bn-text">
                  {r.name[bn ? "bn" : "en"]}
                  {r.phone && (
                    <a
                      href={`tel:${r.phone}`}
                      className="ml-2 rounded bg-[#2F5746] px-1.5 py-0.5 text-[11px] font-bold text-[#FFFEFA] hover:bg-[#24453A]"
                      aria-label={`${bn ? "কল করুন" : "Call"} ${r.phone}`}
                    >
                      {r.phone}
                    </a>
                  )}
                </p>
                <p className="mt-1.5 flex-1 text-sm text-[#59665F] leading-relaxed bn-text">
                  {r.description[bn ? "bn" : "en"]}
                </p>
                <div className="mt-3 flex items-center justify-between gap-2 text-[11px]">
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="font-bold text-[#2F5746] hover:underline focus-ring rounded"
                  >
                    {bn ? "অফিসিয়াল সাইট ↗" : "Official site ↗"}
                  </a>
                  <span className="text-[#7D9C8B]">
                    {bn ? "যাচাই:" : "Verified:"} {new Date(r.verifiedAt).toLocaleDateString(bn ? "bn-BD" : "en-GB")}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
      <p className="mt-4 text-xs text-[#7D9C8B] bn-text">
        {source === "bundled-fallback"
          ? bn
            ? "এই মুহূর্তে ডেটাবেস থেকে নয় — অ্যাপে সংযুক্ত যাচাইকৃত নমুনা তালিকা দেখানো হচ্ছে।"
            : "Showing the verified list bundled inside the app (database unavailable)."
          : bn
            ? "উৎস: প্রতিষ্ঠানের অফিসিয়াল পাতা — নিয়মিত পুনঃযাচাই করা হয়।"
            : "Sources: the organizations' official pages — re-verified periodically."}
      </p>
    </>
  );
}
