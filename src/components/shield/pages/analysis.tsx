"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, useReducedMotion } from "framer-motion";
import {
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  Eye,
  HelpCircle as UnknownIcon,
  ListChecks,
  AlertTriangle,
  ShieldHalf,
  ArrowRight,
  Trash2,
  Siren,
  Flag,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  XCircle,
  Info,
  Ban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api, ShieldApiError } from "../api";
import { useLang, useT } from "../i18n";
import { Link, useHashRoute } from "../router";
import { RiskBadge, RiskBanner, EngineTag, EvidenceCard, SectionTitle, InfoNote, SpeakButton, CopyButton } from "../ui-bits";
import { SCAM_CATEGORIES, STAGE_LABELS, type AnalysisResult, type PipelineStage, type SessionStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CaseData {
  id: string;
  modality: string;
  status: SessionStatus;
  stage: string | null;
  engine: string | null;
  riskCategory: "high" | "uncertain" | "none" | null;
  createdAt: string;
  completedAt: string | null;
  result: AnalysisResult | null;
  hasReport: boolean;
  report: { id: string; status: string } | null;
}

const STAGE_ORDER: PipelineStage[] = ["validating", "redacting", "detecting", "ai_analyzing", "safety_gate", "completed"];

export default function AnalysisPage({ caseId }: { caseId: string }) {
  const bn = useLang() === "bn";
  const t = useT();
  const prefersReduced = useReducedMotion();
  const { navigate } = useHashRoute();
  const [data, setData] = useState<CaseData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [feedbackSent, setFeedbackSent] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get<CaseData>(`/api/v1/analyses/${caseId}`);
      setData(res);
      setLoadError(null);
      return res;
    } catch (err) {
      setLoadError(
        err instanceof ShieldApiError ? err.apiError.message : "Network or server error"
      );
      return null;
    }
  }, [caseId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  // Poll for real progress while processing. Stops on completion OR failure
  // so a transient error never creates a request loop.
  useEffect(() => {
    if (!data || data.status !== "processing") return;
    let stopped = false;
    const id = setInterval(async () => {
      if (stopped) return;
      const res = await load();
      if (!res || res.status !== "processing") {
        stopped = true;
        clearInterval(id);
      }
    }, 2000);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [data, load]);

  const deleteCase = async () => {
    try {
      await api.del(`/api/v1/analyses/${caseId}`);
      toast.success(bn ? "কেসটি মুছে ফেলা হয়েছে" : "Case deleted");
      navigate("/privacy");
    } catch (err) {
      toast.error(err instanceof ShieldApiError ? err.apiError.message : t("common.error"));
    }
  };

  const sendFeedback = async (helpful: boolean) => {
    try {
      await api.post("/api/v1/feedback", { sessionId: caseId, helpful });
      setFeedbackSent(true);
      toast.success(bn ? "ধন্যবাদ! মতামত রেকর্ড হয়েছে" : "Thank you! Feedback recorded");
    } catch {
      toast.error(t("common.error"));
    }
  };

  if (loadError) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Card className="border-[#A44435]/40 bg-[#FFFEFA]">
          <CardContent className="p-8 text-center space-y-4">
            <XCircle className="mx-auto h-10 w-10 text-[#A44435]" aria-hidden />
            <h1 className="text-xl font-bold text-[#202C26] bn-text">{bn ? "কেসটি খুঁজে পাওয়া যায়নি" : "Case not found"}</h1>
            <p className="text-[#59665F] bn-text">{loadError}</p>
            <Link to="/check">
              <Button className="bg-[#2F5746] text-[#FFFEFA] hover:bg-[#24453A]">
                {bn ? "নতুন যাচাই শুরু করুন" : "Start a new check"}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 space-y-4" aria-busy>
        <div className="h-24 rounded-2xl bg-[#EDEAE1] animate-pulse" />
        <div className="h-40 rounded-2xl bg-[#EDEAE1] animate-pulse" />
        <div className="h-64 rounded-2xl bg-[#EDEAE1] animate-pulse" />
      </div>
    );
  }

  // -------- processing view --------
  if (data.status === "processing" || (data.status !== "completed" && data.status !== "failed")) {
    const stageIdx = Math.max(0, STAGE_ORDER.indexOf((data.stage ?? "validating") as PipelineStage));
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-2xl font-bold text-[#202C26] text-center bn-text">
          {bn ? "বিশ্লেষণ চলছে…" : "Analysis in progress…"}
        </h1>
        <p className="mt-2 text-center text-[#59665F] bn-text">
          {bn ? `কেস আইডি: ${data.id}` : `Case ID: ${data.id}`}
        </p>
        <Card className="mt-8 border border-[#D8DED5] bg-[#FFFEFA]">
          <CardContent className="p-6 md:p-8 space-y-6">
            <ol className="space-y-1" aria-live="polite">
              {STAGE_ORDER.map((stage, i) => {
                const done = i < stageIdx;
                const active = i === stageIdx;
                const label = STAGE_LABELS[stage][bn ? "bn" : "en"];
                return (
                  <li key={stage} className="flex items-center gap-4">
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold",
                        done && "border-[#2F5746] bg-[#2F5746] text-[#FFFEFA]",
                        active && cn("border-[#2F5746] text-[#2F5746] bg-[#DDE8DF]", !prefersReduced && "pulse-soft"),
                        !done && !active && "border-[#D8DED5] text-[#59665F] bg-[#FFFEFA]"
                      )}
                      aria-hidden
                    >
                      {done ? <ShieldCheck className="h-4 w-4" /> : i + 1}
                    </span>
                    <span
                      className={cn(
                        "text-[15px] bn-text",
                        active ? "font-bold text-[#202C26]" : done ? "text-[#59665F]" : "text-[#59665F]/60"
                      )}
                    >
                      {label}
                    </span>
                  </li>
                );
              })}
            </ol>
            <InfoNote>
              {bn
                ? "এই অগ্রগতি প্রকৃত পাইপলাইন অবস্থা দেখায় — সাজানো অ্যানিমেশন নয়। এআই বিশ্লেষণে কিছু সময় লাগতে পারে, পাতাটি খুলে রাখুন।"
                : "This progress reflects the real pipeline state — not a canned animation. AI analysis can take a moment; please keep this page open."}
            </InfoNote>
          </CardContent>
        </Card>
      </div>
    );
  }

  // -------- failed view --------
  if (data.status === "failed" || !data.result) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Card className="border-[#A44435]/40 bg-[#FFFEFA]">
          <CardContent className="p-8 text-center space-y-4">
            <XCircle className="mx-auto h-10 w-10 text-[#A44435]" aria-hidden />
            <h1 className="text-xl font-bold text-[#202C26] bn-text">
              {bn ? "বিশ্লেষণ সম্পন্ন করা যায়নি" : "The analysis could not complete"}
            </h1>
            <p className="text-[#59665F] bn-text">
              {bn
                ? "দুঃখিত। আবার চেষ্টা করুন অথবা ভয়েস/মেসেজ পদ্ধতিতে নতুন যাচাই দিন। জরুরি হলে সরাসরি জরুরি সহায়তা দেখুন।"
                : "Sorry. Please retry or start a new check. If urgent, open the emergency guidance."}
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              <Button onClick={() => load()} variant="outline" className="border-[#2F5746] text-[#2F5746]">
                {t("common.retry")}
              </Button>
              <Link to="/check">
                <Button className="bg-[#2F5746] text-[#FFFEFA] hover:bg-[#24453A]">
                  {bn ? "নতুন যাচাই" : "New check"}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const r = data.result;
  const catLabel = SCAM_CATEGORIES[r.scamCategory]?.[bn ? "bn" : "en"] ?? r.scamCategory;
  const resourceKeys = r.resources ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 md:py-12 space-y-8">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wide text-[#59665F] uppercase">
            {bn ? "কেস আইডি" : "Case ID"} · {data.id}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-[#202C26] bn-text">
            {bn ? "আপনার যাচাইয়ের ফলাফল" : "Your verification result"}
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <EngineTag engine={r.engine} />
          <CopyButton value={data.id} label={bn ? "আইডি কপি" : "Copy ID"} />
        </div>
      </div>

      {/* risk banner */}
      <RiskBanner risk={r.riskCategory} title={t(`risk.${r.riskCategory}`)} />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] items-start">
        <div className="space-y-6">
          {/* 1. What happened */}
          <motion.section
            initial={prefersReduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            aria-labelledby="q-what"
          >
            <SectionTitle id="q-what" icon={<Info className="h-5 w-5" aria-hidden />} title={bn ? "১. কী হয়েছে?" : "1. What happened?"} />
            <Card className="border-[#D8DED5] bg-[#FFFEFA]">
              <CardContent className="p-5 space-y-2">
                <p className="text-[17px] text-[#202C26] leading-relaxed bn-text">{r.summary[bn ? "bn" : "en"]}</p>
                <Badge variant="outline" className="border-[#2F5746]/40 text-[#2F5746] bn-text">
                  {catLabel}
                </Badge>
                <div className="pt-1">
                  <SpeakButton text={r.summary[bn ? "bn" : "en"]} />
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* 2. Why dangerous */}
          <motion.section
            initial={prefersReduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            aria-labelledby="q-why"
          >
            <SectionTitle
              id="q-why"
              icon={<ShieldAlert className="h-5 w-5" aria-hidden />}
              title={bn ? "২. কেন বিপজ্জনক হতে পারে?" : "2. Why might it be dangerous?"}
            />
            <Card className="border-[#D8DED5] bg-[#FFFEFA]">
              <CardContent className="p-5">
                <p className="text-[17px] text-[#202C26] leading-relaxed bn-text">{r.why[bn ? "bn" : "en"]}</p>
              </CardContent>
            </Card>
          </motion.section>

          {/* 3. Evidence */}
          <motion.section
            initial={prefersReduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            aria-labelledby="q-evidence"
          >
            <SectionTitle
              id="q-evidence"
              icon={<Eye className="h-5 w-5" aria-hidden />}
              title={bn ? "৩. কোন প্রমাণ এই সিদ্ধান্তের ভিত্তি?" : "3. What evidence supports this?"}
              desc={bn ? "প্রতিটি সূচক আপনার দেওয়া বার্তা থেকেই নেওয়া — কোনো বানানো তথ্য নয়।" : "Every indicator comes from your own submission — nothing invented."}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {r.evidence.length > 0 ? (
                r.evidence.map((e) => <EvidenceCard key={e.key} evidence={e} />)
              ) : (
                <p className="text-[#59665F] bn-text">
                  {bn ? "কোনো সূচক পাওয়া যায়নি।" : "No indicators were found."}
                </p>
              )}
            </div>
          </motion.section>

          {/* 4. Unknowns */}
          <motion.section
            initial={prefersReduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            aria-labelledby="q-unknown"
          >
            <SectionTitle
              id="q-unknown"
              icon={<UnknownIcon className="h-5 w-5" aria-hidden />}
              title={bn ? "৪. এখনো কী কী অজানা?" : "4. What is still unknown?"}
            />
            <Card className="border-dashed border-[#8A5B28]/50 bg-[#F2E8D5]/40">
              <CardContent className="p-5">
                <ul className="space-y-2.5">
                  {r.unknowns.map((u, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[15px] text-[#202C26] bn-text">
                      <HelpCircle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[#8A5B28]" aria-hidden />
                      {u[bn ? "bn" : "en"]}
                    </li>
                  ))}
                  {r.unknowns.length === 0 && (
                    <li className="text-[15px] text-[#59665F] bn-text">
                      {bn ? "উল্লেখযোগ্য কোনো অজানা বিষয় নেই।" : "No significant unknowns noted."}
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </motion.section>

          {/* 5. Next steps */}
          <motion.section
            initial={prefersReduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            aria-labelledby="q-next"
          >
            <SectionTitle
              id="q-next"
              icon={<ListChecks className="h-5 w-5" aria-hidden />}
              title={bn ? "৫. এখন কী করবেন?" : "5. What should you do next?"}
            />
            <div className="space-y-3">
              {[...r.recommendations]
                .sort((a, b) => (a.priority === b.priority ? 0 : a.priority === "now" ? -1 : b.priority === "now" ? 1 : a.priority === "soon" ? -1 : 1))
                .map((rec, i) => (
                  <Card key={rec.id} className="border-[#D8DED5] bg-[#FFFEFA]">
                    <CardContent className="p-4 md:p-5 flex gap-4">
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                          rec.priority === "now" && "bg-[#A44435] text-[#FFFEFA]",
                          rec.priority === "soon" && "bg-[#F2E8D5] text-[#8A5B28]",
                          rec.priority === "know" && "bg-[#DDE8DF] text-[#2F5746]"
                        )}
                        aria-hidden
                      >
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-bold text-[#202C26] bn-text">
                          {rec.title[bn ? "bn" : "en"]}
                          {rec.priority === "now" && (
                            <Badge className="ml-2 bg-[#F4E1DA] text-[#A44435] hover:bg-[#F4E1DA] border-0 bn-text">
                              {bn ? "এখনই" : "Now"}
                            </Badge>
                          )}
                        </p>
                        <p className="mt-1 text-[15px] text-[#59665F] leading-relaxed bn-text">{rec.detail[bn ? "bn" : "en"]}</p>
                        {rec.evidenceRefs && rec.evidenceRefs.length > 0 && (
                          <p className="mt-1.5 text-xs text-[#7D9C8B]">
                            {bn ? "প্রমাণ:" : "Evidence:"} {rec.evidenceRefs.join(", ")}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </motion.section>

          {/* limitations */}
          <motion.section
            initial={prefersReduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            aria-labelledby="q-limits"
          >
            <SectionTitle
              id="q-limits"
              icon={<Ban className="h-5 w-5" aria-hidden />}
              title={bn ? "এই বিশ্লেষণের সীমাবদ্ধতা" : "Limitations of this analysis"}
            />
            <Card className="border-[#D8DED5] bg-[#FFFEFA]">
              <CardContent className="p-5">
                <ul className="space-y-2.5">
                  {r.limitations.map((l, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-[#59665F] leading-relaxed bn-text">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#8A5B28]" aria-hidden />
                      {l[bn ? "bn" : "en"]}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.section>
        </div>

        {/* ------- side rail: journey + actions ------- */}
        <aside className="space-y-4 lg:sticky lg:top-20">
          {/* journey tracker */}
          <Card className="border-[#D8DED5] bg-[#FFFEFA]">
            <CardContent className="p-5">
              <p className="text-sm font-bold text-[#202C26] mb-3 bn-text">
                {bn ? "আপনার সুরক্ষা-যাত্রা" : "Your protection journey"}
              </p>
              <ol className="space-y-2.5">
                {[
                  { label: bn ? "সন্দেহজনক কনটেন্ট জমা" : "Content submitted", done: true },
                  { label: bn ? "বিশ্লেষণ দেখা" : "Review analysis", done: true },
                  { label: bn ? "প্রমাণ বোঝা" : "Understand evidence", done: true },
                  { label: bn ? "Shield Lens দেখা" : "Explore Shield Lens", done: false, to: `/shield-lens/${caseId}` },
                  { label: bn ? "নিরাপদ পদক্ষেপ বাছাই" : "Choose a safe action", done: false },
                  { label: bn ? "ফলাফল জানানো (ঐচ্ছিক)" : "Report outcome (optional)", done: false },
                ].map((step, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm">
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold",
                        step.done ? "border-[#2F5746] bg-[#2F5746] text-[#FFFEFA]" : "border-[#D8DED5] text-[#59665F]"
                      )}
                      aria-hidden
                    >
                      {step.done ? "✓" : i + 1}
                    </span>
                    {step.to ? (
                      <Link to={step.to} className="text-[#2F5746] font-semibold hover:underline focus-ring bn-text">
                        {step.label} →
                      </Link>
                    ) : (
                      <span className={cn(step.done ? "text-[#202C26]" : "text-[#59665F]", "bn-text")}>{step.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Shield Lens CTA */}
          <Link to={`/shield-lens/${caseId}`} className="block rounded-2xl focus-ring">
            <Card className="border-2 border-[#2F5746] bg-[#2F5746] text-[#FFFEFA] hover:bg-[#24453A] transition-colors">
              <CardContent className="p-5 flex items-center gap-4">
                <ShieldHalf className="h-10 w-10 shrink-0" aria-hidden />
                <div>
                  <p className="font-bold bn-text">{bn ? "Shield Lens খুলুন" : "Open Shield Lens"}</p>
                  <p className="text-sm text-[#DDE8DF] bn-text">
                    {bn ? "আক্রমণের ধাপগুলো সময়রেখায় দেখুন" : "See the attack stages on a timeline"}
                  </p>
                </div>
                <ArrowRight className="ml-auto h-5 w-5" aria-hidden />
              </CardContent>
            </Card>
          </Link>

          {/* report CTA */}
          {data.report ? (
            <Card className="border-[#D8DED5] bg-[#FFFEFA]">
              <CardContent className="p-5 flex items-center gap-3">
                <Flag className="h-5 w-5 text-[#2F5746]" aria-hidden />
                <p className="text-sm text-[#59665F] bn-text">
                  {bn ? "রিপোর্ট জমা হয়েছে — রেফারেন্স: " : "Report submitted — ref: "}
                  <span className="font-bold text-[#202C26]">{data.report.id}</span>
                </p>
              </CardContent>
            </Card>
          ) : (
            <Link to={`/report?case=${caseId}`} className="block rounded-2xl focus-ring">
              <Card className="border-[#D8DED5] bg-[#FFFEFA] hover:border-[#2F5746]/50 transition-colors">
                <CardContent className="p-5 flex items-center gap-4">
                  <Flag className="h-8 w-8 text-[#2F5746]" aria-hidden />
                  <div className="flex-1">
                    <p className="font-bold text-[#202C26] bn-text">{bn ? "অন্যদের বাঁচাতে রিপোর্ট করুন" : "Report to protect others"}</p>
                    <p className="text-sm text-[#59665F] bn-text">{bn ? "বেনামে · ঐচ্ছিক" : "Anonymous · optional"}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-[#2F5746]" aria-hidden />
                </CardContent>
              </Card>
            </Link>
          )}

          {/* emergency (high risk) */}
          {r.riskCategory === "high" && (
            <Link to="/recovery" className="block rounded-2xl focus-ring">
              <Card className="border-2 border-[#A44435] bg-[#F4E1DA] hover:bg-[#F4E1DA]/80 transition-colors">
                <CardContent className="p-5 flex items-center gap-4">
                  <Siren className="h-8 w-8 text-[#A44435]" aria-hidden />
                  <div className="flex-1">
                    <p className="font-bold text-[#8C382B] bn-text">{bn ? "কিছু দিয়ে ফেলেছেন?" : "Already shared/paid?"}</p>
                    <p className="text-sm text-[#8C382B]/80 bn-text">{bn ? "জরুরি পদক্ষেপ দেখুন" : "See emergency steps"}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}

          {/* feedback */}
          <Card className="border-[#D8DED5] bg-[#FFFEFA]">
            <CardContent className="p-5">
              <p className="text-sm font-bold text-[#202C26] bn-text">
                {bn ? "ফলাফলটি কি কাজে লেগেছে?" : "Was this result helpful?"}
              </p>
              {feedbackSent ? (
                <p className="mt-2 text-sm text-[#2F5746] flex items-center gap-2 bn-text">
                  <ShieldCheck className="h-4 w-4" aria-hidden /> {bn ? "ধন্যবাদ!" : "Thanks!"}
                </p>
              ) : (
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sendFeedback(true)}
                    className="border-[#2F5746]/50 text-[#2F5746] hover:bg-[#DDE8DF] gap-1.5"
                  >
                    <ThumbsUp className="h-4 w-4" aria-hidden /> {bn ? "হ্যাঁ" : "Yes"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sendFeedback(false)}
                    className="border-[#A44435]/40 text-[#A44435] hover:bg-[#F4E1DA] gap-1.5"
                  >
                    <ThumbsDown className="h-4 w-4" aria-hidden /> {bn ? "না" : "No"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* delete */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full border-[#D8DED5] text-[#59665F] hover:text-[#A44435] hover:border-[#A44435]/40 gap-2"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                {bn ? "এই কেসটি মুছে ফেলুন" : "Delete this case"}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#FFFEFA] border-[#D8DED5]">
              <DialogHeader>
                <DialogTitle className="bn-text">{bn ? "কেস মুছে ফেলবেন?" : "Delete this case?"}</DialogTitle>
                <DialogDescription className="bn-text">
                  {bn
                    ? "ফলাফল ও সংরক্ষিত লেখা স্থায়ীভাবে মুছে যাবে (রিপোর্ট জমা থাকলে সেটি বহাল থাকবে)।"
                    : "The result and stored text will be permanently removed (a submitted report, if any, remains)."}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" className="border-[#D8DED5]">
                  {t("common.cancel")}
                </Button>
                <Button onClick={deleteCase} className="bg-[#A44435] text-[#FFFEFA] hover:bg-[#8C382B]">
                  {bn ? "হ্যাঁ, মুছে দিন" : "Yes, delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </aside>
      </div>
    </div>
  );
}
