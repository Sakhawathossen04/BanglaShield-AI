"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Mic,
  MessageSquareText,
  ImageIcon,
  Link2,
  ShieldHalf,
  ShieldCheck,
  Play,
  EyeOff,
  BookOpen,
  Users,
  PhoneCall,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Waves,
  PhoneCall as PhoneIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "../router";
import { useT, useLang, useBi } from "../i18n";
import { Reveal } from "../ui-bits";

// ---------------------------------------------------------------------------
// Home — purpose in five seconds, then the four core actions (V4 §11:
// simplified — every section earns its place, nothing duplicated).
// ---------------------------------------------------------------------------

function SoundWave({ animate }: { animate: boolean }) {
  const bars = [0.5, 0.9, 0.4, 1, 0.6, 0.85, 0.35, 0.75, 0.5, 0.95, 0.45, 0.7, 0.55, 0.9, 0.4];
  return (
    <div className="flex items-center gap-[3px] h-10" aria-hidden>
      {bars.map((b, i) => (
        <motion.span
          key={i}
          className="w-[4px] rounded-full bg-[#DDE8DF]/80"
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

export default function HomePage() {
  const t = useT();
  const lang = useLang();
  const bi = useBi();
  const prefersReduced = useReducedMotion();
  const [hover, setHover] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 md:py-14 space-y-12 md:space-y-16">
      {/* ================= HERO — purpose in 5 seconds ================= */}
      <section className="grid lg:grid-cols-[1fr_420px] gap-8 items-center">
        <div>
          <Badge variant="outline" className="mb-4 border-[#2F5746]/40 text-[#2F5746] bg-[#DDE8DF]/50">
            <ShieldCheck className="h-3.5 w-3.5 mr-1.5" aria-hidden />
            {lang === "bn" ? "বিনামূল্যে · বাংলায় · যাচাই করতে নাম-নম্বর লাগে না" : "Free · In Bangla · No sign-up to verify"}
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
              ? "সন্দেহজনক ফোন, মেসেজ, স্ক্রিনশট বা লিংক দিন — প্রমাণসহ বিশ্লেষণ পান। তারপর প্রতিষ্ঠানের আসল নম্বরে নিজে যাচাই করে সিদ্ধান্ত নিন।"
              : "Share a suspicious call, message, screenshot or link — get an evidence-based analysis. Then verify yourself through official channels."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/check">
              <Button size="lg" className="bg-[#2F5746] text-[#FFFEFA] hover:bg-[#24453A] h-12 px-7 text-base font-bold">
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
          {/* privacy chips — the how-it-works and privacy cards collapsed into one honest row */}
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
            {[
              { icon: <EyeOff className="h-4 w-4" aria-hidden />, bn: "নাম-নম্বর লাগে না", en: "No name or number needed" },
              { icon: <CheckCircle2 className="h-4 w-4" aria-hidden />, bn: "ওটিপি-পিন স্বয়ংক্রিয়ভাবে আড়াল", en: "OTPs & PINs auto-redacted" },
              { icon: <AlertTriangle className="h-4 w-4" aria-hidden />, bn: "এআই-ও ভুল করতে পারে", en: "AI can be wrong too" },
            ].map((c, i) => (
              <li key={i} className="flex items-center gap-1.5 text-sm text-[#59665F] bn-text">
                <span className="text-[#2F5746]">{c.icon}</span>
                {lang === "bn" ? c.bn : c.en}
              </li>
            ))}
          </ul>
        </div>
        {/* professional documentary hero image (replaces cartoon art) */}
        <figure className="rounded-3xl overflow-hidden border border-[#D8DED5] shadow-sm">
          { }
          <img
            src="/img/hero-main.png"
            alt={
              lang === "bn"
                ? "এক মা ও তাঁর ছেলে বাড়িতে বসে একসাথে ফোনের পর্দা দেখছেন — বাংলাশিল্ডের ভাবমূর্তি: পরিবার একসাথে নিরাপদ থাকে"
                : "A mother and her son at home looking at a phone screen together — families staying safe together"
            }
            className="w-full h-60 sm:h-72 lg:h-80 object-cover"
            width={1344}
            height={768}
          />
          <figcaption className="sr-only">
            {lang === "bn" ? "একসাথে যাচাই করা পরিবার — নিরাপত্তার প্রথম স্তম্ভ" : "Verifying together — the first pillar of safety"}
          </figcaption>
        </figure>
      </section>

      {/* ================= INPUT OPTIONS — the four core actions ================= */}
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
              desc: { bn: "মাইকে চেপে নিজের ভাষায় ঘটনা বলুন — সরাসরি বিশ্লেষণ", en: "Speak and it goes straight to analysis" },
            },
            {
              to: "/check/message",
              icon: <MessageSquareText className="h-6 w-6" aria-hidden />,
              title: { bn: "এসএমএস / চ্যাট", en: "SMS / chat" },
              desc: { bn: "সন্দেহজনক মেসেজটি কপি করে পেস্ট করুন", en: "Paste the suspicious message" },
            },
            {
              to: "/check/image",
              icon: <ImageIcon className="h-6 w-6" aria-hidden />,
              title: { bn: "স্ক্রিনশট", en: "Screenshot" },
              desc: { bn: "ছবি থেকে লেখা বের করে পরীক্ষা হবে", en: "Text is extracted and checked" },
            },
            {
              to: "/check/link",
              icon: <Link2 className="h-6 w-6" aria-hidden />,
              title: { bn: "লিংক / কিউআর", en: "Link / QR" },
              desc: { bn: "লিংক বা কিউআর কোডের গন্তব্য যাচাই করুন", en: "Check where a link or QR leads" },
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

      {/* ================= RAHELA STORY — why this exists ================= */}
      <Reveal>
        <Card className="border-[#D8DED5] bg-[#FFFEFA] overflow-hidden">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-[auto_1fr] gap-0">
              <div className="bg-[#2F5746] p-6 md:p-8 flex flex-col items-center justify-center gap-3 text-[#FFFEFA]">
                <PhoneIcon className="h-8 w-8" aria-hidden />
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
                  <p className="font-semibold text-[#202C26]">
                    {lang === "bn"
                      ? "কণ্ঠটি এআই দিয়ে নকল করা হতে পারে। রাহেলা থামলেন, ছেলের পুরনো নম্বরে নিজে কল করলেন — টাকা বেঁচে গেলো।"
                      : "The voice could be AI-cloned. Rahela paused, called her son's old number herself — the money was saved."}
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
                      {lang === "bn" ? "ঘটনাটি বিশ্লেষণ করুন" : "Analyze the case"}
                    </Button>
                  </Link>
                  <Link to="/learn?tab=videos">
                    <Button variant="outline" size="lg" className="border-[#D8DED5] text-[#2F5746] hover:bg-[#DDE8DF] h-12 px-6 text-base">
                      <Play className="h-5 w-5" aria-hidden />
                      {lang === "bn" ? "ভিডিওতে দেখুন" : "Watch the video"}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Reveal>

      {/* ================= LEARN + COMMUNITY — two doors, one row ================= */}
      <section className="grid gap-4 md:grid-cols-2">
        <Link
          to="/learn"
          className="group rounded-2xl border-2 border-[#D8DED5] bg-[#FFFEFA] overflow-hidden transition-all hover:border-[#2F5746]/50 hover:shadow-md focus-ring"
        >
          <div className="relative h-40">
            { }
            <img
              src="/img/academy-hero.png"
              alt={lang === "bn" ? "এক তরুণ চায়ের দোকানে বসে ফোনে শিখছেন" : "A young man learning on his phone at a tea stall"}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <span className="absolute top-3 left-3 rounded-full bg-[#2F5746]/90 px-3 py-1 text-xs font-bold text-[#FFFEFA] bn-text">
              ScamAcademy
            </span>
          </div>
          <div className="p-5">
            <h3 className="flex items-center gap-2 text-lg font-bold text-[#202C26] bn-text">
              <BookOpen className="h-5 w-5 text-[#2F5746]" aria-hidden />
              {lang === "bn" ? "৫ মিনিটে একটা কৌশল শিখুন" : "Learn one tactic in 5 minutes"}
            </h3>
            <p className="mt-1 text-sm text-[#59665F] leading-relaxed bn-text">
              {lang === "bn"
                ? "অ্যানিমেটেড ভিডিও, ইন্টারঅ্যাক্টিভ পাঠ ও সিমুলেশন ল্যাব — এআই নকল কণ্ঠ, কিউআর ফিশিংসহ"
                : "Animated videos, interactive lessons and a simulation lab — incl. AI voice clones and QR phishing"}
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#2F5746]">
              {lang === "bn" ? "ক্লাসে যান" : "Enter the academy"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          </div>
        </Link>

        <Link
          to="/community"
          className="group rounded-2xl border-2 border-[#D8DED5] bg-[#FFFEFA] overflow-hidden transition-all hover:border-[#2F5746]/50 hover:shadow-md focus-ring"
        >
          <div className="relative h-40">
            { }
            <img
              src="/img/community-hero.png"
              alt={lang === "bn" ? "মানুষজন একসাথে ফোনে কী দেখছে তা পরীক্ষা করছে" : "People checking something on a phone together"}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <span className="absolute top-3 left-3 rounded-full bg-[#2F5746]/90 px-3 py-1 text-xs font-bold text-[#FFFEFA] bn-text">
              {t("nav.community")}
            </span>
          </div>
          <div className="p-5">
            <h3 className="flex items-center gap-2 text-lg font-bold text-[#202C26] bn-text">
              <Users className="h-5 w-5 text-[#2F5746]" aria-hidden />
              {lang === "bn" ? "সবাই মিলে সাবধান হই" : "Stay alert, together"}
            </h3>
            <p className="mt-1 text-sm text-[#59665F] leading-relaxed bn-text">
              {lang === "bn"
                ? "সদস্যদের সতর্কতা ও অভিজ্ঞতা পড়ুন, নিজের ঘটনা শেয়ার করুন, সাহায্য চান — প্রতিটি পোস্টে এআই নিরাপত্তা নোটিশ"
                : "Read member alerts, share your own story, ask for help — every post carries an AI safety notice"}
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#2F5746]">
              {lang === "bn" ? "কমিউনিটিতে যান" : "Join the community"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          </div>
        </Link>
      </section>

      {/* ================= GUARDIAN DOOR — the assistant workspace ================= */}
      <Reveal>
        <Link
          to="/guardian"
          className="group flex flex-col gap-4 rounded-2xl bg-[#2F5746] p-5 md:flex-row md:items-center md:justify-between md:p-6 transition-all hover:bg-[#28493B] focus-ring"
        >
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#DDE8DF]">
              <ShieldHalf className="h-6 w-6 text-[#2F5746]" aria-hidden />
            </span>
            <div className="max-w-xl">
              <p className="text-xs font-bold uppercase tracking-widest text-[#9DB8A8]">Guardian</p>
              <h3 className="mt-0.5 text-lg font-bold text-[#FFFEFA] bn-text">
                {lang === "bn" ? "গার্ডিয়ান — আপনার নিরাপত্তা সহায়ক" : "Guardian — your safety assistant"}
              </h3>
              <p className="mt-1 text-sm text-[#DDE8DF] bn-text">
                {lang === "bn"
                  ? "শিল্ডএজেন্টের সাথে বাংলায় কথা বলুন, নিজের কেসগুলো দেখুন এবং প্রকৃত মাপা মূল্যায়ন জানুন — এক জায়গায়। কোনো ডিভাইস নজরদারি নেই, দাবিও করি না।"
                  : "Talk to ShieldAgent in Bangla, see your own cases and read real measured evaluation — in one place. No device surveillance, and we never claim it."}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 self-start rounded-xl bg-[#DDE8DF] px-5 py-3 text-sm font-bold text-[#2F5746] md:self-auto">
            {lang === "bn" ? "গার্ডিয়ান খুলুন" : "Open Guardian"}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
        </Link>
      </Reveal>

      {/* ================= TRUST STRIP — verified channels + 999 ================= */}
      <section className="rounded-2xl border border-[#D8DED5] bg-[#DDE8DF]/30 p-5 md:p-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="text-center sm:text-left">
          <p className="font-bold text-[#202C26] bn-text">
            {lang === "bn" ? "চূড়ান্ত সিদ্ধান্ত নিজে যাচাই করেই" : "Final decisions belong to your own verification"}
          </p>
          <p className="mt-1 text-sm text-[#59665F] bn-text">
            {lang === "bn"
              ? "বার্তায় আসা নম্বর নয় — প্রতিষ্ঠানের আসল ঠিকানা থেকে নিজে যোগাযোগ করুন। সব যাচাইকৃত ঠিকানা সহায়তা পাতায়।"
              : "Never use numbers from a message — contact institutions yourself. All verified contacts live on the Support page."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0 justify-center">
          <Link to="/help">
            <Button variant="outline" className="border-[#2F5746]/40 text-[#2F5746] hover:bg-[#DDE8DF] h-11 font-semibold">
              {lang === "bn" ? "যাচাইকৃত ঠিকানাসমূহ →" : "Verified contacts →"}
            </Button>
          </Link>
          <a
            href="tel:999"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-[#A44435] bg-[#FFFEFA] px-4 py-2.5 font-bold text-[#A44435] hover:bg-[#F4E1DA] transition-colors focus-ring bn-text"
          >
            <PhoneCall className="h-4 w-4" aria-hidden /> ৯৯৯
          </a>
        </div>
      </section>
    </div>
  );
}
