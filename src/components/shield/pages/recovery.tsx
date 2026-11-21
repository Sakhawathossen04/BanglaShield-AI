"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Siren,
  Banknote,
  KeyRound,
  AppWindow,
  IdCard,
  MessageSquareWarning,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  PhoneCall,
  ExternalLink,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "../api";
import { useLang } from "../i18n";
import { Link } from "../router";
import { WarnNote } from "../ui-bits";
import { cn } from "@/lib/utils";

interface Resource {
  key: string;
  name: { bn: string; en: string };
  category: string;
  description: { bn: string; en: string };
  guidance: { bn: string; en: string };
  url: string;
  phone: string | null;
  sourceUrl: string;
  verifiedAt: string;
}

type SituationKey = "money" | "otp" | "app" | "info" | "threat";

interface Step {
  title: { bn: string; en: string };
  detail: { bn: string; en: string };
  priority: "now" | "soon";
}

const SITUATIONS: {
  key: SituationKey;
  icon: React.ReactNode;
  question: { bn: string; en: string };
  steps: Step[];
}[] = [
  {
    key: "money",
    icon: <Banknote className="h-6 w-6" aria-hidden />,
    question: {
      bn: "আপনি কি ইতিমধ্যেই কারও কাছে টাকা পাঠিয়ে ফেলেছেন?",
      en: "Have you already sent money to someone?",
    },
    steps: [
      {
        title: { bn: "এখনই ব্যাংক/এমএফএস-এ কল করুন (নিজে থেকে)", en: "Call your bank/MFS provider right now (yourself)" },
        detail: {
          bn: "অ্যাপের ভেতরের হেল্প সেকশন বা কার্ডের পেছনে ছাপা নম্বর থেকে নিজে কল করুন। লেনদেনটি ব্লক বা ফেরতের অনুরোধ (chargeback/withdrawal hold) জানান। যত দ্রুত জানাবেন, থামানোর সম্ভাবনা তত বাড়ে।",
          en: "Call yourself using in-app support or the number printed on your card. Ask them to block or attempt reversal of the transaction. The sooner you report, the better the chance of stopping it.",
        },
        priority: "now",
      },
      {
        title: { bn: "লেনদেনের প্রমাণ সংরক্ষণ করুন", en: "Preserve transaction evidence" },
        detail: {
          bn: "সেন্ড মানির এসএমএস/রসিদ, প্রাপকের নম্বর, সময় ও পরিমাণ লিখে রাখুন বা স্ক্রিনশট নিন। পরে অভিযোগে কাজে লাগবে।",
          en: "Keep the send-money SMS/receipt, recipient number, time and amount — screenshots help the complaint later.",
        },
        priority: "soon",
      },
      {
        title: { bn: "অভিযোগ করুন — ৯৯৯ বা সাইবার ট্রাইব্যুনাল", en: "File a complaint — 999 or the Cyber Tribunal" },
        detail: {
          bn: "বড় ক্ষতি হলে ৯৯৯-এ জানান এবং নিকটবর্তী থানা/সাইবার ট্রাইব্যুনালে লিখিত অভিযোগ করুন। জিডির কপি সংরক্ষণ করুন।",
          en: "For significant loss inform 999 and file a written complaint at your police station or the Cyber Tribunal. Keep a copy of the GD.",
        },
        priority: "soon",
      },
    ],
  },
  {
    key: "otp",
    icon: <KeyRound className="h-6 w-6" aria-hidden />,
    question: {
      bn: "আপনি কি কারও সাথে OTP, PIN বা পাসওয়ার্ড শেয়ার করে ফেলেছেন?",
      en: "Have you shared an OTP, PIN or password with anyone?",
    },
    steps: [
      {
        title: { bn: "এক মিনিটও দেরি নয় — এখনই পিন বদলান", en: "Change your PIN immediately — not a minute later" },
        detail: {
          bn: "নিজের অ্যাপে ঢুকে পিন/পাসওয়ার্ড এখনই পরিবর্তন করুন। কোড দিয়ে দিলে প্রতারক সেটি দিয়ে ঢুকতে পারে — নতুন পিন দিলে পুরনো কোড অচল।",
          en: "Open your own app and change the PIN/password right now. A new PIN invalidates the code you shared.",
        },
        priority: "now",
      },
      {
        title: { bn: "একাউন্টের লেনদেন দেখুন", en: "Check recent transactions" },
        detail: {
          bn: "অ্যাপে ব্যালেন্স ও সাম্প্রতিক লেনদেন দেখুন। অজানা লেনদেন দেখলে সাথে সাথে ব্যাংক/এমএফএস-কে জানান ও একাউন্ট ব্লকের অনুরোধ করুন।",
          en: "Check balance and recent activity. If anything looks unfamiliar, tell your bank/MFS immediately and ask for an account block.",
        },
        priority: "now",
      },
      {
        title: { bn: "সতর্কতা চালু রাখুন", en: "Stay alert for follow-ups" },
        detail: {
          bn: "প্রতারক হয়তো আবার ফোন করে 'সমাধানের নামে' নতুন কোড চাইবে — আর কোনো কোড কাউকে দেবেন না।",
          en: "The scammer may call again posing as 'support' asking for new codes — never share codes again.",
        },
        priority: "soon",
      },
    ],
  },
  {
    key: "app",
    icon: <AppWindow className="h-6 w-6" aria-hidden />,
    question: {
      bn: "আপনি কি কারও বলায় কোনো অ্যাপ ইনস্টল করেছেন বা স্ক্রিন শেয়ার করেছেন?",
      en: "Have you installed an app on someone's request or shared your screen?",
    },
    steps: [
      {
        title: { bn: "অ্যাপটি আনইনস্টল করুন", en: "Uninstall the app" },
        detail: {
          bn: "AnyDesk, TeamViewer বা অজানা APK ইনস্টল করে থাকলে এখনই সরিয়ে ফেলুন। ফোনের সেটিংস → অ্যাপস থেকে অন্যান্য সম্প্রতি-ইনস্টল হওয়া অজানা অ্যাপও দেখুন।",
          en: "Remove AnyDesk, TeamViewer or unknown APKs immediately. Also check Settings → Apps for other recently-installed unknown apps.",
        },
        priority: "now",
      },
      {
        title: { bn: "পরিষ্কার ডিভাইস থেকে পাসওয়ার্ড বদলান", en: "Change passwords from a clean device" },
        detail: {
          bn: "সন্দেহজনক ফোনটি বাদ দিয়ে অন্য বিশ্বস্ত ডিভাইস থেকে ব্যাংক/এমএফএস পাসওয়ার্ড ও পিন পরিবর্তন করুন।",
          en: "From a different trusted device, change your bank/MFS passwords and PINs.",
        },
        priority: "now",
      },
      {
        title: { bn: "অ্যাপ পারমিশন পরীক্ষা করুন", en: "Review app permissions" },
        detail: {
          bn: "অজানা অ্যাপকে দেওয়া অ্যাক্সেসিবিলিটি/স্ক্রিন পারমিশন বাতিল করুন। প্রয়োজনে ফোন রিস্টার্ট করুন।",
          en: "Revoke accessibility/screen permissions granted to unknown apps. Restart the phone if needed.",
        },
        priority: "soon",
      },
    ],
  },
  {
    key: "info",
    icon: <IdCard className="h-6 w-6" aria-hidden />,
    question: {
      bn: "আপনি কি ব্যক্তিগত তথ্য (এনআইডি, ছবি, ঠিকানা) কারও সাথে শেয়ার করেছেন?",
      en: "Have you shared personal information (NID, photos, address) with anyone?",
    },
    steps: [
      {
        title: { bn: "পরবর্তী ঠকলাফাঁদের জন্য প্রস্তুত থাকুন", en: "Prepare for follow-up phishing" },
        detail: {
          bn: "তথ্য হাতে থাকলে প্রতারকরা 'যাচাইয়ের' নামে ফোন/মেসেজ দিয়ে আরও তথ্য বা টাকা চাইবে। ফোনে কেউ তথ্য যাচাইয়ের নামে কিছু চাইলে সেটি ফাঁদই ধরুন।",
          en: "With your data in hand, scammers will call 'to verify' and ask for more. Any verification call asking for data is a trap.",
        },
        priority: "now",
      },
      {
        title: { bn: "প্রতারণামূলক ব্যবহারের জন্য সতর্ক থাকুন", en: "Watch for misuse" },
        detail: {
          bn: "আপনার নামে জাল একাউন্ট বা লেনদেনের খোঁজ পেলে সাথে সাথে সংশ্লিষ্ট প্রতিষ্ঠান ও পুলিশকে জানান।",
          en: "If you learn of fake accounts or transactions in your name, inform the institution and police immediately.",
        },
        priority: "soon",
      },
      {
        title: { bn: "কথোপকথনের প্রমাণ রাখুন", en: "Keep records of the exchange" },
        detail: {
          bn: "কী তথ্য কাকে দিলেন — স্ক্রিনশট বা নোট হিসেবে রেখে দিন।",
          en: "Note down or screenshot exactly what was shared with whom.",
        },
        priority: "soon",
      },
    ],
  },
  {
    key: "threat",
    icon: <MessageSquareWarning className="h-6 w-6" aria-hidden />,
    question: {
      bn: "আপনি কি হুমকি, ব্ল্যাকমেইল বা হয়রানির শিকার হচ্ছেন?",
      en: "Are you experiencing threats, blackmail or harassment?",
    },
    steps: [
      {
        title: { bn: "সাড়া দেবেন না, টাকাও না", en: "Do not respond, do not pay" },
        detail: {
          bn: "হুমকির সাড়া দিলে বা টাকা দিলে হুমকি বাড়ে — একবার দিলে বারবার চাইবে। সংযোগ বন্ধ রাখুন।",
          en: "Responding or paying escalates the threats — one payment invites endless demands. Cut contact.",
        },
        priority: "now",
      },
      {
        title: { bn: "প্রমাণ সংরক্ষণ করে ৯৯৯-এ জানান", en: "Preserve evidence and inform 999" },
        detail: {
          bn: "হুমকির মেসেজ/কলের স্ক্রিনশট, নম্বর ও সময় রাখুন (মুছবেন না) এবং ৯৯৯-এ বা থানায় অভিযোগ করুন। সাইবার হয়রানির জন্য সাইবার ট্রাইব্যুনাল প্রযোজ্য।",
          en: "Screenshot the threats (do not delete), keep numbers and times, and report via 999 or your police station. Cyber harassment falls under the Cyber Tribunal.",
        },
        priority: "now",
      },
      {
        title: { bn: "একা না ভুলে পরিবারকে জানান", en: "Tell your family — do not face it alone" },
        detail: {
          bn: "লজ্জার ভয়ে নীরব থাকবেন না — পরিবারের কারো জানা থাকলে চাপ কমে ও সঠিক পদক্ষেপ নেওয়া সহজ হয়।",
          en: "Do not stay silent out of shame — a family member's support reduces pressure and helps you act correctly.",
        },
        priority: "soon",
      },
    ],
  },
];

const PREVENTION: Step[] = [
  {
    title: { bn: "কোনো কোড বা পিন কাউকে দেবেন না", en: "Never share codes or PINs with anyone" },
    detail: {
      bn: "ব্যাংক, বিকাশ, নগদ, পুলিশ — কেউই কখনো চায় না। চাইলেই সেটি প্রতারণা।",
      en: "Banks, bKash, Nagad, police — nobody legitimate ever asks. Anyone who does is a scammer.",
    },
    priority: "now",
  },
  {
    title: { bn: "টাকার বিষয়ে স্বাধীনভাবে যাচাই করুন", en: "Verify independently before any money moves" },
    detail: {
      bn: "নিজে অ্যাপ খুলে বা অফিসিয়াল নম্বরে কল করে দাবিটি যাচাই করুন — বার্তার নম্বরে নয়।",
      en: "Open the app yourself or call the official number — never a number from the message.",
    },
    priority: "now",
  },
  {
    title: { bn: "অজানা লিংক/অ্যাপ থেকে দূরে থাকুন", en: "Avoid unknown links and apps" },
    detail: {
      bn: "লগইন/ভেরিফাই চায় এমন লিংকে ক্লিক করবেন না; কারও বলায় অ্যাপ ইনস্টল বা স্ক্রিন শেয়ার করবেন না।",
      en: "Never click links asking for logins; never install apps or share screens on request.",
    },
    priority: "soon",
  },
];

export default function RecoveryPage() {
  const bn = useLang() === "bn";
  const prefersReduced = useReducedMotion();
  const [answers, setAnswers] = useState<Record<SituationKey, boolean>>({
    money: false,
    otp: false,
    app: false,
    info: false,
    threat: false,
  });
  const [resources, setResources] = useState<Resource[]>([]);
  const [loadingRes, setLoadingRes] = useState(true);

  useEffect(() => {
    api
      .get<{ resources: Resource[] }>("/api/v1/resources")
      .then((r) => setResources(r.resources))
      .catch(() => setResources([]))
      .finally(() => setLoadingRes(false));
  }, []);

  const anyYes = Object.values(answers).some(Boolean);

  const checklist = anyYes
    ? SITUATIONS.filter((s) => answers[s.key]).flatMap((s) => s.steps)
    : PREVENTION;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 md:py-12 space-y-8">
      {/* header */}
      <div className="flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#A44435]">
          <Siren className="h-7 w-7 text-[#FFFEFA]" aria-hidden />
        </span>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#202C26] bn-text">
            {bn ? "জরুরি সহায়তা কেন্দ্র" : "Emergency Recovery Center"}
          </h1>
          <p className="mt-1 text-[#59665F] leading-relaxed bn-text">
            {bn
              ? "শান্ত হোন — আপনি একা নন। কয়েকটি প্রশ্নের উত্তর দিলেই আপনার পরিস্থিতি অনুযায়ী ধাপে ধাপে করণীয় পাবেন।"
              : "Stay calm — you are not alone. Answer a few questions and get steps tailored to your situation."}
          </p>
        </div>
      </div>

      {/* triage */}
      <Card className="border-[#D8DED5] bg-[#FFFEFA]">
        <CardContent className="p-5 md:p-6 space-y-3">
          <p className="font-bold text-[#202C26] bn-text">{bn ? "আপনার পরিস্থিতি বলুন:" : "Tell us your situation:"}</p>
          {SITUATIONS.map((s, i) => (
            <div
              key={s.key}
              className={cn(
                "rounded-xl border-2 p-4 transition-colors",
                answers[s.key] ? "border-[#A44435] bg-[#F4E1DA]/60" : "border-[#D8DED5] bg-[#FFFEFA] hover:border-[#8A5B28]/40"
              )}
            >
              <label className="flex items-start gap-4 cursor-pointer">
                <button
                  type="button"
                  role="switch"
                  aria-checked={answers[s.key]}
                  onClick={() => setAnswers((a) => ({ ...a, [s.key]: !a[s.key] }))}
                  className={cn(
                    "mt-0.5 flex h-7 w-12 shrink-0 items-center rounded-full border-2 transition-colors focus-ring",
                    answers[s.key] ? "border-[#A44435] bg-[#A44435]" : "border-[#D8DED5] bg-[#EDEAE1]"
                  )}
                >
                  <span
                    className={cn(
                      "ml-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                      answers[s.key] && "translate-x-5"
                    )}
                  />
                </button>
                <span className="flex items-start gap-3">
                  <span className={cn("shrink-0", answers[s.key] ? "text-[#A44435]" : "text-[#2F5746]")}>{s.icon}</span>
                  <span className={cn("font-medium bn-text", answers[s.key] ? "text-[#8C382B]" : "text-[#202C26]")}>
                    {s.question[bn ? "bn" : "en"]}
                  </span>
                </span>
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* checklist */}
      <section aria-labelledby="checklist-heading">
        <h2 id="checklist-heading" className="flex items-center gap-2.5 text-xl md:text-2xl font-bold text-[#202C26] bn-text">
          <ShieldCheck className="h-6 w-6 text-[#2F5746]" aria-hidden />
          {anyYes
            ? bn ? "আপনার জন্য জরুরি পদক্ষেপ" : "Your emergency steps"
            : bn ? "প্রতিরোধের ধাপগুলো" : "Prevention steps"}
        </h2>
        <div className="mt-4 space-y-3">
          {checklist.map((step, i) => (
            <motion.div
              key={i}
              initial={prefersReduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.3) }}
            >
              <Card className={cn("border-2 bg-[#FFFEFA]", step.priority === "now" ? "border-[#A44435]/60" : "border-[#D8DED5]")}>
                <CardContent className="p-4 md:p-5 flex gap-4">
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                      step.priority === "now" ? "bg-[#A44435] text-[#FFFEFA]" : "bg-[#DDE8DF] text-[#2F5746]"
                    )}
                    aria-hidden
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-bold text-[#202C26] bn-text">
                      {step.title[bn ? "bn" : "en"]}
                      {step.priority === "now" && (
                        <Badge className="ml-2 bg-[#F4E1DA] text-[#A44435] hover:bg-[#F4E1DA] border-0 bn-text">
                          {bn ? "এখনই" : "Now"}
                        </Badge>
                      )}
                    </p>
                    <p className="mt-1 text-[15px] text-[#59665F] leading-relaxed bn-text">{step.detail[bn ? "bn" : "en"]}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* recovery scam warning */}
      <WarnNote title={bn ? "দ্বিতীয় প্রতারণার সতর্কতা" : "Recovery-scam warning"}>
        {bn
          ? "ক্ষতির পর কেউ যদি বলে 'টাকা ফেরত পাইয়ে দেবো, আগে ফি/কমিশন দাও' — সেটি প্রায় নিশ্চিতভাবেই দ্বিতীয় প্রতারণা। বাংলাশিল্ড বা কোনো বৈধ প্রতিষ্ঠান টাকা ফেরতের নিশ্চয়তা দেয় না। কেউ 'হ্যাকার' বা 'সাইবার এক্সপার্ট' পরিচয়ে ফি চাইলে সরাসরি প্রত্যাখ্যান করুন।"
          : "If someone offers to 'recover your money for a fee' — that is almost certainly a second scam. Neither BanglaShield nor any legitimate institution guarantees fund recovery. Reject anyone posing as a 'hacker' or 'cyber expert' asking for fees."}
      </WarnNote>

      {/* verified resources */}
      <section aria-labelledby="contacts-heading">
        <h2 id="contacts-heading" className="text-xl md:text-2xl font-bold text-[#202C26] bn-text">
          {bn ? "যাচাইকৃত অফিসিয়াল যোগাযোগ" : "Verified official contacts"}
        </h2>
        <p className="mt-1 text-sm text-[#59665F] bn-text">
          {bn
            ? "নিচের ঠিকানা/নম্বরগুলো প্রতিষ্ঠানের অফিসিয়াল উৎস থেকে সংগৃহীত ও তারিখসহ যাচাইকৃত।"
            : "The following contacts come from each institution's official source, with verification dates."}
        </p>
        {loadingRes ? (
          <div className="mt-4 flex items-center gap-2 text-[#59665F]">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> {bn ? "লোড হচ্ছে…" : "Loading…"}
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {resources.map((r) => (
              <Card key={r.key} className="border-[#D8DED5] bg-[#FFFEFA]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-[#202C26] bn-text">{r.name[bn ? "bn" : "en"]}</p>
                    <CheckCircle2 className="h-4 w-4 text-[#2F5746] shrink-0" aria-label={bn ? "যাচাইকৃত" : "Verified"} />
                  </div>
                  <p className="mt-1 text-sm text-[#59665F] leading-relaxed bn-text">{r.guidance[bn ? "bn" : "en"]}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {r.phone && (
                      <a
                        href={`tel:${r.phone}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#2F5746] px-3 py-1.5 text-sm font-bold text-[#FFFEFA] hover:bg-[#24453A] focus-ring"
                      >
                        <PhoneCall className="h-3.5 w-3.5" aria-hidden /> {r.phone}
                      </a>
                    )}
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#D8DED5] px-3 py-1.5 text-sm font-semibold text-[#2F5746] hover:bg-[#DDE8DF] focus-ring"
                    >
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden /> {bn ? "ওয়েবসাইট" : "Website"}
                    </a>
                  </div>
                  <p className="mt-2 text-[11px] text-[#7D9C8B]">
                    {bn ? "যাচাই:" : "Verified:"} {new Date(r.verifiedAt).toLocaleDateString(bn ? "bn-BD" : "en-GB")} · {r.sourceUrl.replace(/^https?:\/\//, "").slice(0, 42)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* next: report */}
      <Card className="border-2 border-[#2F5746]/40 bg-[#FFFEFA]">
        <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="font-bold text-[#202C26] bn-text">
              {bn ? "ঘটনাটি রিপোর্ট করে অন্যদের সতর্ক করুন" : "Report the incident to warn others"}
            </p>
            <p className="text-sm text-[#59665F] bn-text">
              {bn ? "বেনামে, ঐচ্ছিক — আপনার দেওয়া তথ্য থেকে অন্য মানুষ সাবধান হতে পারবে।" : "Anonymous, optional — your report helps others stay alert."}
            </p>
          </div>
          <Link to="/report">
            <Button className="bg-[#2F5746] text-[#FFFEFA] hover:bg-[#24453A] gap-2 font-bold">
              {bn ? "রিপোর্ট করুন" : "Report now"} <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
