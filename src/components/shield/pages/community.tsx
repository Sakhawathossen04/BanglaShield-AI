"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Users,
  Megaphone,
  Flag,
  ShieldCheck,
  EyeOff,
  Clock,
  Loader2,
  Search,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, ShieldApiError } from "../api";
import { useLang, useT } from "../i18n";
import { Link, useHashRoute } from "../router";
import { InfoNote, StatusBadge } from "../ui-bits";
import { SCAM_CATEGORIES } from "@/lib/types";
import ReportPage from "./report";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Community Threat Watch (V3 §17) — published, human-reviewed alerts feed
// plus the voluntary anonymous reporting flow. Guest access always works.
// ---------------------------------------------------------------------------

interface CommunityAlert {
  id: string;
  category: string;
  title: string;
  body: string;
  synthetic: boolean;
  publishedAt: string | null;
}

function AlertsFeed() {
  const bn = useLang() === "bn";
  const [alerts, setAlerts] = useState<CommunityAlert[] | null>(null);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/v1/community/alerts?limit=30")
      .then((r) => r.json())
      .then((d) => {
        if (alive) setAlerts(d.alerts ?? []);
      })
      .catch(() => {
        if (alive) {
          setError(true);
          setAlerts([]);
        }
      });
    return () => {
      alive = false;
    };
  }, []);

  if (alerts === null) {
    return (
      <div className="grid gap-4" aria-busy>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-[#EDEAE1] animate-pulse" />
        ))}
      </div>
    );
  }

  const visible = alerts.filter(
    (a) =>
      !filter.trim() ||
      a.title.toLowerCase().includes(filter.toLowerCase()) ||
      a.body.toLowerCase().includes(filter.toLowerCase()) ||
      (SCAM_CATEGORIES[a.category]?.[bn ? "bn" : "en"] ?? a.category).toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={bn ? "সতর্কতায় খুঁজুন (যেমন: ওটিপি, বৃত্তি)…" : "Search alerts (e.g. OTP, scholarship)…"}
          className="bg-[#FFFEFA] border-[#D8DED5] focus-visible:ring-[#2F5746] bn-text"
          aria-label={bn ? "সতর্কতা অনুসন্ধান" : "Search alerts"}
        />
      </div>

      {error && (
        <InfoNote title={bn ? "সতর্কতা লোড হয়নি" : "Alerts failed to load"}>
          {bn ? "নেটওয়ার্ক সমস্যায় সতর্কতাগুলো আনা যায়নি। কিছুক্ষণ পরে আবার চেষ্টা করুন।" : "A network issue prevented loading. Please retry shortly."}
        </InfoNote>
      )}

      {visible.length === 0 && !error && (
        <Card className="border-[#D8DED5] bg-[#FFFEFA]">
          <CardContent className="p-8 text-center">
            <Megaphone className="mx-auto h-8 w-8 text-[#8A9B90]" aria-hidden />
            <p className="mt-3 font-semibold text-[#202C26] bn-text">
              {bn ? "এখনো কোনো প্রকাশিত সতর্কতা নেই" : "No published alerts yet"}
            </p>
            <p className="mt-1 text-sm text-[#59665F] bn-text">
              {bn
                ? "মানব-রিভিউ হওয়ার পরেই রিপোর্ট প্রকাশিত হয় — আপনিও নিচের ট্যাব থেকে রিপোর্ট করতে পারেন।"
                : "Reports are published only after human review — you can submit one from the other tab."}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {visible.map((a) => {
          const cat = SCAM_CATEGORIES[a.category];
          return (
            <Card key={a.id} className="border-[#D8DED5] bg-[#FFFEFA]">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F4E1DA] text-[#A44435]">
                      <Megaphone className="h-4.5 w-4.5" aria-hidden />
                    </span>
                    <div>
                      <p className="font-bold text-[#202C26] bn-text leading-snug">{a.title}</p>
                      <p className="text-xs text-[#8A9B90] flex items-center gap-1.5">
                        <Clock className="h-3 w-3" aria-hidden />
                        {a.publishedAt
                          ? new Date(a.publishedAt).toLocaleDateString(bn ? "bn-BD" : "en-GB", { day: "numeric", month: "short", year: "numeric" })
                          : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {cat && (
                      <Badge variant="outline" className="border-[#2F5746]/40 text-[#2F5746] bn-text text-[11px]">
                        {cat[bn ? "bn" : "en"]}
                      </Badge>
                    )}
                    {a.synthetic && (
                      <Badge variant="outline" className="border-[#8A5B28]/50 text-[#8A5B28] text-[11px]">
                        {bn ? "ডেমো ডেটা" : "Demo data"}
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="mt-3 text-[15px] text-[#59665F] leading-relaxed bn-text">{a.body}</p>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-[#7D9C8B]">
                  <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                  {bn
                    ? "মানব-মডারেটর যাচাই করেছেন · ব্যক্তিগত তথ্য থেকে মুক্ত"
                    : "Human-moderated · free of personal data"}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default function CommunityPage() {
  const bn = useLang() === "bn";
  const t = useT();
  const { path } = useHashRoute();
  const params = typeof window !== "undefined" ? new URLSearchParams((window.location.hash.split("?")[1] ?? "")) : null;
  const reportCase = params?.get("report") ?? params?.get("case") ?? "";
  const defaultTab = reportCase || path.includes("report") ? "report" : "alerts";

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 md:py-12 space-y-8">
      {/* header */}
      <div className="flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#2F5746]">
          <Users className="h-7 w-7 text-[#FFFEFA]" aria-hidden />
        </span>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#202C26] bn-text">
            {bn ? "কমিউনিটি থ্রেট ওয়াচ" : "Community Threat Watch"}
          </h1>
          <p className="mt-1 text-[#59665F] leading-relaxed bn-text">
            {bn
              ? "একসাথে সাবধান হই — যাচাইকৃত সতর্কতা দেখুন, নিজের অভিজ্ঞতা বেনামে জানান। কোনো অ্যাকাউন্ট লাগে না।"
              : "Stay alert together — read verified alerts and share your experience anonymously. No account needed."}
          </p>
        </div>
      </div>

      {/* privacy guarantee strip */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-[#D8DED5] bg-[#DDE8DF]/40 px-4 py-3">
        <span className="flex items-center gap-1.5 text-sm text-[#2F5746] font-semibold bn-text">
          <EyeOff className="h-4 w-4" aria-hidden />
          {bn ? "সম্পূর্ণ বেনামে" : "Fully anonymous"}
        </span>
        <span className="flex items-center gap-1.5 text-sm text-[#2F5746] font-semibold bn-text">
          <ShieldCheck className="h-4 w-4" aria-hidden />
          {bn ? "মানব-মডারেশন ছাড়া কিছু প্রকাশ হয় না" : "Nothing publishes without human moderation"}
        </span>
        <span className="flex items-center gap-1.5 text-sm text-[#2F5746] font-semibold bn-text">
          <Flag className="h-4 w-4" aria-hidden />
          {bn ? "যেকোনো সময় প্রত্যাহার করা যায়" : "Withdraw anytime"}
        </span>
      </div>

      <Tabs defaultValue={defaultTab} className="gap-6">
        <TabsList className="grid h-auto w-full grid-cols-2 bg-[#EDEAE1] p-1.5 rounded-xl">
          <TabsTrigger
            value="alerts"
            className="rounded-lg py-2.5 text-sm font-semibold data-[state=active]:bg-[#FFFEFA] data-[state=active]:text-[#2F5746] bn-text gap-2"
          >
            <Megaphone className="h-4 w-4" aria-hidden />
            {bn ? "প্রকাশিত সতর্কতা" : "Published alerts"}
          </TabsTrigger>
          <TabsTrigger
            value="report"
            className="rounded-lg py-2.5 text-sm font-semibold data-[state=active]:bg-[#FFFEFA] data-[state=active]:text-[#2F5746] bn-text gap-2"
          >
            <Flag className="h-4 w-4" aria-hidden />
            {bn ? "রিপোর্ট করুন" : "Submit a report"}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="alerts">
          <AlertsFeed />
        </TabsContent>
        <TabsContent value="report">
          <ReportPage initialCase={reportCase} embedded />
        </TabsContent>
      </Tabs>
    </div>
  );
}
