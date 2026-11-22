"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Mic,
  MessageSquareText,
  ImageIcon,
  Link2,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Phone,
  UserRound,
} from "lucide-react";
import { Link } from "../router";
import { useLang, useBi } from "../i18n";
import { useSettings } from "../store";
import { Reveal } from "../ui-bits";

// ---------------------------------------------------------------------------
// Home — per approved design (01-home.png): dark forest hero with the radar
// illustration, the four core check doors, and the Rahela story banner.
// Show the threat. Explain the evidence. Protect the person.
// ---------------------------------------------------------------------------

// Palette (sampled from the design): hero #153E32, rings #214D3D, mint #BCE6C3,
// highlight #DCE7D9, cards #FEFDF8 on cream #F7F6EF, banner #EDF0E5, red #9F3B32.

/** Radar illustration — decorative concentric rings with the Guardian badge,
 *  a scanning dot and two floating status cards. Entirely aria-hidden. */
function RadarArt() {
  const lang = useLang();
  const bn = lang === "bn";
  const prefersReduced = useReducedMotion();
  const reduceMotionSetting = useSettings((s) => s.reduceMotion);
  const still = prefersReduced || reduceMotionSetting;

  return (
    <div className="relative mt-4 lg:mt-0">
      <div
        className="relative mx-auto aspect-square w-full max-w-[290px] sm:max-w-[340px] lg:max-w-[400px]"
        aria-hidden
      >
        {/* concentric rings */}
        {[0, 1, 2, 3].map((i) => (
          <motion.span
            key={i}
            className="absolute rounded-full border border-[#214D3D]"
            style={{ inset: `${i * 12.5}%` }}
            animate={still ? undefined : { opacity: [0.65, 1, 0.65] }}
            transition={{ duration: 3.6, repeat: Infinity, delay: i * 0.45, ease: "easeInOut" }}
          />
        ))}

        {/* center Guardian badge */}
        <motion.span
          className="absolute left-1/2 top-1/2 flex h-[24%] w-[24%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#BCE6C3] shadow-[0_0_40px_rgba(188,230,195,0.25)]"
          animate={still ? undefined : { scale: [1, 1.04, 1] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ShieldCheck className="h-9 w-9 sm:h-10 sm:w-10 text-[#153E32]" />
        </motion.span>

        {/* amber scanning dot on the second ring */}
        <span className="absolute right-[21%] top-[14%] flex h-3 w-3">
          {!still && (
            <motion.span
              className="absolute inline-flex h-full w-full rounded-full bg-[#DDB36C]"
              animate={{ scale: [1, 2.4], opacity: [0.7, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
            />
          )}
          <span className="relative inline-flex h-3 w-3 rounded-full bg-[#DDB36C]" />
        </span>

        {/* quiet satellite dots */}
        <span className="absolute left-[5%] top-[50%] h-2 w-2 rounded-full bg-[#FEFDF8]/80" />
        <span className="absolute bottom-[16%] left-[28%] h-1.5 w-1.5 rounded-full bg-[#FEFDF8]/60" />

        {/* floating card — unknown call (top, white) */}
        <motion.div
          className="absolute -top-1 left-0 flex items-center gap-2.5 rounded-2xl bg-[#FEFDF8] px-3.5 py-2.5 shadow-[0_10px_28px_rgba(0,0,0,0.28)]"
          animate={still ? undefined : { y: [0, -6, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E7EEDF]">
            <Phone className="h-4 w-4 text-[#2E5B3C]" />
          </span>
          <span className="leading-tight">
            <span className="block text-[13px] font-bold text-[#153E32] bn-text">{bn ? "অচেনা কল" : "Unknown call"}</span>
            <span className="block text-[11px] text-[#7A8478] bn-text">{bn ? "পরিচয় যাচাই করুন" : "Verify the caller"}</span>
          </span>
        </motion.div>

        {/* floating card — safe steps (lower right, mint) */}
        <motion.div
          className="absolute -bottom-1 right-0 flex items-center gap-2.5 rounded-2xl bg-[#BCE6C3] px-3.5 py-2.5 shadow-[0_10px_28px_rgba(0,0,0,0.28)]"
          animate={still ? undefined : { y: [0, 6, 0] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FEFDF8]">
            <ShieldCheck className="h-4 w-4 text-[#2E5B3C]" />
          </span>
          <span className="leading-tight">
            <span className="block text-[13px] font-bold text-[#153E32] bn-text">{bn ? "নিরাপদ পদক্ষেপ" : "Safe next steps"}</span>
            <span className="block text-[11px] text-[#4A6355] bn-text">{bn ? "এখনই করণীয়" : "What to do now"}</span>
          </span>
        </motion.div>
      </div>

      {/* honest caption (real text, not decorative) */}
      <p className="mt-4 text-right text-[11px] md:text-xs text-[#8FA79B] bn-text">
        {bn ? "কাল্পনিক উদাহরণ · লাইভ নজরদারি নয়" : "Illustrative example · not live surveillance"}
      </p>
    </div>
  );
}

const CHECK_CARDS = [
  {
    to: "/check/voice",
    icon: Mic,
    title: { bn: "কল ও ভয়েস", en: "Call & voice" },
    desc: { bn: "কথার প্রতারণা ধরুন", en: "Catch voice deception" },
    highlighted: true,
  },
  {
    to: "/check/message",
    icon: MessageSquareText,
    title: { bn: "বার্তা", en: "Message" },
    desc: { bn: "এসএমএস বা চ্যাট পরীক্ষা করুন", en: "Check an SMS or chat" },
    highlighted: false,
  },
  {
    to: "/check/image",
    icon: ImageIcon,
    title: { bn: "ছবি", en: "Photo" },
    desc: { bn: "লেখা ও প্রমাণ বের করুন", en: "Pull out text and evidence" },
    highlighted: false,
  },
  {
    to: "/check/link",
    icon: Link2,
    title: { bn: "লিংক ও QR", en: "Link & QR" },
    desc: { bn: "খোলার আগে যাচাই করুন", en: "Verify before you open" },
    highlighted: false,
  },
];

export default function HomePage() {
  const lang = useLang();
  const bn = lang === "bn";
  const bi = useBi();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10 md:space-y-14">
      {/* ================= HERO — one dark panel, purpose in 5 seconds ================= */}
      <section className="relative overflow-hidden rounded-[24px] md:rounded-[28px] bg-[#153E32] px-6 py-10 sm:px-10 md:px-12 md:py-14 lg:px-14">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          <div>
            <span className="inline-flex items-center rounded-full bg-[#BCE6C3] px-3.5 py-1.5 text-[13px] font-bold text-[#153E32] bn-text">
              {bn ? "বিনামূল্যে · বাংলায় · প্রমাণভিত্তিক" : "Free · In Bangla · Evidence-based"}
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-[54px] font-extrabold leading-[1.16] text-[#FFFEFA] bn-text">
              {bn ? (
                <>
                  এক মুহূর্ত থামুন।
                  <br />
                  একটি পরিবার বাঁচান।
                </>
              ) : (
                <>
                  Pause for one moment.
                  <br />
                  Save a family.
                </>
              )}
            </h1>
            <p className="mt-4 max-w-lg text-base md:text-lg leading-relaxed text-[#B9CFC2] bn-text">
              {bn
                ? "সন্দেহজনক কল, বার্তা, ছবি বা লিংক? গার্ডিয়ান প্রমাণসহ ঝুঁকি দেখায় আর করণীয় নিরাপত্তা পদক্ষেপ বাংলায় বুঝিয়ে দেয়।"
                : "A suspicious call, message, photo or link? Guardian shows the evidence and explains each safety step in plain Bangla."}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/guardian"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-[#BCE6C3] px-6 text-base font-bold text-[#153E32] transition-colors hover:bg-[#A9DDB5] focus-ring bn-text"
              >
                <ShieldCheck className="h-5 w-5" aria-hidden />
                {bn ? "গার্ডিয়ান খুলুন" : "Open Guardian"}
              </Link>
              <Link
                to="/demo"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-[#FEFDF8] px-6 text-base font-bold text-[#153E32] transition-colors hover:bg-[#F0EFE4] focus-ring bn-text"
              >
                <Eye className="h-5 w-5" aria-hidden />
                {bn ? "কিভাবে কাজ করে" : "How it works"}
              </Link>
            </div>
            {/* privacy chips — honest limits, always visible */}
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
              {[
                { icon: EyeOff, text: { bn: "নাম-নম্বর লাগে না", en: "No name or number needed" } },
                { icon: CheckCircle2, text: { bn: "ওটিপি-পিন স্বয়ংক্রিয়ভাবে আড়াল", en: "OTPs & PINs auto-redacted" } },
                { icon: AlertTriangle, text: { bn: "এআই-ও ভুল করতে পারে", en: "AI can be wrong too" } },
              ].map((c, i) => (
                <li key={i} className="flex items-center gap-1.5 text-[13px] text-[#9FB8AA] bn-text">
                  <c.icon className="h-4 w-4 text-[#BCE6C3]" aria-hidden />
                  {bi(c.text)}
                </li>
              ))}
            </ul>
          </div>
          <RadarArt />
        </div>
      </section>

      {/* ================= INPUT OPTIONS — the four core doors ================= */}
      <Reveal>
        <section aria-labelledby="q-modality">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 id="q-modality" className="text-2xl md:text-3xl font-bold text-[#202C26] bn-text">
                {bn ? "আপনার সন্দেহটা কী নিয়ে?" : "What is your suspicion about?"}
              </h2>
              <p className="mt-1.5 text-[#59665F] bn-text">
                {bn ? "যেটা পেয়েছেন সেটাই দিন — বাকিটা বাংলাশিল্ড দেখবে।" : "Give what you received — BanglaShield does the rest."}
              </p>
            </div>
            <Link
              to="/check"
              className="hidden sm:inline-flex shrink-0 items-center gap-1 text-[15px] font-bold text-[#153E32] hover:underline focus-ring bn-text"
            >
              {bn ? "সব টুল দেখুন" : "All tools"}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 md:gap-5">
            {CHECK_CARDS.map((m) => {
              const Icon = m.icon;
              return (
                <Link
                  key={m.to}
                  to={m.to}
                  className={
                    "group relative block rounded-[18px] p-4 sm:p-5 transition-all focus-ring " +
                    (m.highlighted
                      ? "bg-[#DCE7D9] hover:shadow-md"
                      : "border border-[#E4E1D5] bg-[#FEFDF8] hover:border-[#2E5B3C]/40 hover:shadow-md")
                  }
                >
                  <div className="flex items-start justify-between">
                    <span
                      className={
                        "flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl " +
                        (m.highlighted ? "bg-[#FEFDF8]/80 text-[#2E5B3C]" : "bg-[#E7EEDF] text-[#2E5B3C]")
                      }
                    >
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
                    </span>
                    <ArrowRight
                      className="h-5 w-5 text-[#9AA79D] transition-all group-hover:translate-x-0.5 group-hover:text-[#2E5B3C]"
                      aria-hidden
                    />
                  </div>
                  <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-bold text-[#202C26] bn-text">{bi(m.title)}</h3>
                  <p className="mt-1 text-xs sm:text-sm text-[#59665F] leading-relaxed bn-text">{bi(m.desc)}</p>
                </Link>
              );
            })}
          </div>

          {/* mobile: the "all tools" link moves below the grid */}
          <div className="mt-4 sm:hidden">
            <Link
              to="/check"
              className="inline-flex items-center gap-1 text-[15px] font-bold text-[#153E32] hover:underline focus-ring bn-text"
            >
              {bn ? "সব টুল দেখুন" : "All tools"}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </section>
      </Reveal>

      {/* ================= RAHELA STORY — why this exists ================= */}
      <Reveal>
        <section className="rounded-[20px] bg-[#EDF0E5] p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-5">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FEFDF8] shadow-sm">
                <UserRound className="h-6 w-6 text-[#2E5B3C]" aria-hidden />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <h3 className="text-lg md:text-xl font-bold text-[#153E32] bn-text">
                    {bn ? "রাহেলার গল্প — ছেলের কণ্ঠে এক ফোন" : "Rahela's story — one call in her son's voice"}
                  </h3>
                  <span className="rounded-full border border-[#8A5B28]/50 px-2.5 py-0.5 text-[11px] font-semibold text-[#8A5B28] bn-text">
                    {bn ? "কাল্পনিক উদাহরণ" : "Fictional example"}
                  </span>
                </div>
                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[#59665F] bn-text">
                  {bn
                    ? "নকল কণ্ঠে টাকার অনুরোধ এলে প্রিয়জনের আসল নম্বরে নিজে যোগাযোগ করুন — এক মুহূর্তের সতর্কতাই বাঁচিয়ে দেয় সর্বস্ব।"
                    : "When a cloned voice asks for money, call your loved one's real number yourself — one careful moment can save everything."}
                </p>
              </div>
            </div>
            <Link
              to="/check/voice?demo=rahela-voice"
              className="inline-flex h-11 shrink-0 items-center gap-2 self-start rounded-full bg-[#153E32] px-5 text-[15px] font-bold text-[#FEFDF8] transition-colors hover:bg-[#1D4A3B] focus-ring bn-text md:self-center"
            >
              {bn ? "গল্পটি দেখুন" : "Read the story"}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
