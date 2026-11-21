"use client";

import { useEffect, useState } from "react";
import {
  ClipboardList,
  GitBranch,
  CheckCircle2,
  ShieldCheck,
  FileWarning,
  Users,
  Layers,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "../../api";
import { useLang } from "../../i18n";
import { MetricCard } from "../../ui-bits";
import { SCAM_CATEGORIES } from "@/lib/types";

interface Metrics {
  reports: {
    total: number;
    byStatus: Record<string, number>;
    queueDepth: number;
    syntheticCount: number;
    citizenCount: number;
  };
  patterns: { total: number; approved: number; candidate: number; rejected: number; withdrawn: number; trustedActive: number };
  reviews: { total: number; outcomes: { action: string; count: number }[] };
  audit: { total: number };
  trend: { date: string; count: number; synthetic: number; citizen: number }[];
  categories: { category: string; count: number }[];
  computedAt: string;
}

const PIE_COLORS = ["#2F5746", "#A44435", "#8A5B28", "#7D9C8B", "#59665F", "#C9A36A"];

export default function AnalystDashboard() {
  const bn = useLang() === "bn";
  const [m, setM] = useState<Metrics | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .get<Metrics>("/api/v1/analyst/metrics")
      .then(setM)
      .catch(() => setError(true));
  }, []);

  if (error) return <p className="text-[#A44435] bn-text">{bn ? "মেট্রিক্স লোড করা যায়নি।" : "Failed to load metrics."}</p>;
  if (!m)
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-[#EDEAE1] animate-pulse" />
        ))}
      </div>
    );

  const trendData = m.trend.map((t) => ({
    ...t,
    label: new Date(t.date).toLocaleDateString(bn ? "bn-BD" : "en-GB", { day: "numeric", month: "short" }),
  }));

  const outcomeData = m.reviews.outcomes.filter((o) => o.count > 0);
  const catData = m.categories.slice(0, 7).map((c) => ({
    name: SCAM_CATEGORIES[c.category]?.[bn ? "bn" : "en"] ?? c.category,
    count: c.count,
  }));

  return (
    <div className="space-y-6">
      {/* metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label={bn ? "মোট রিপোর্ট" : "Total reports"} value={m.reports.total} icon={<ClipboardList className="h-5 w-5" aria-hidden />} hint={`${m.reports.citizenCount} ${bn ? "নাগরিক" : "citizen"} · ${m.reports.syntheticCount} ${bn ? "সিন্থেটিক" : "synthetic"}`} />
        <MetricCard label={bn ? "রিভিউ-কিউ" : "Review queue"} value={m.reports.queueDepth} icon={<Layers className="h-5 w-5" aria-hidden />} tone="warn" hint={bn ? "জমা + প্রার্থী + চলমান" : "submitted + candidate + under review"} />
        <MetricCard label={bn ? "প্যাটার্ন (মোট/প্রার্থী)" : "Patterns (total/candidate)"} value={`${m.patterns.total} / ${m.patterns.candidate}`} icon={<GitBranch className="h-5 w-5" aria-hidden />} />
        <MetricCard label={bn ? "সক্রিয় বিশ্বস্ত ইন্টেলিজেন্স" : "Active trusted intelligence"} value={m.patterns.trustedActive} icon={<ShieldCheck className="h-5 w-5" aria-hidden />} tone="good" hint={bn ? "অনুমোদিত ও অ-মেয়াদোত্তীর্ণ" : "approved & non-expired"} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label={bn ? "অনুমোদিত প্যাটার্ন" : "Approved patterns"} value={m.patterns.approved} icon={<CheckCircle2 className="h-5 w-5" aria-hidden />} />
        <MetricCard label={bn ? "বাতিল প্যাটার্ন" : "Rejected patterns"} value={m.patterns.rejected} icon={<FileWarning className="h-5 w-5" aria-hidden />} />
        <MetricCard label={bn ? "মানব-রিভিউ" : "Human reviews"} value={m.reviews.total} icon={<Users className="h-5 w-5" aria-hidden />} />
        <MetricCard label={bn ? "অডিট ইভেন্ট" : "Audit events"} value={m.audit.total} icon={<Layers className="h-5 w-5" aria-hidden />} />
      </div>

      {/* trend + outcomes */}
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card className="border-[#D8DED5] bg-[#FFFEFA]">
          <CardContent className="p-5">
            <p className="mb-4 font-bold text-[#202C26] bn-text">
              {bn ? "রিপোর্ট ট্রেন্ড (১৪ দিন)" : "Report trend (14 days)"}
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
                  <defs>
                    <linearGradient id="gCitizen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2F5746" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#2F5746" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gSynthetic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C9A36A" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#C9A36A" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDEAE1" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#59665F" }} tickLine={false} axisLine={{ stroke: "#D8DED5" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#59665F" }} tickLine={false} axisLine={{ stroke: "#D8DED5" }} />
                  <Tooltip
                    contentStyle={{
                      background: "#FFFEFA",
                      border: "1px solid #D8DED5",
                      borderRadius: 10,
                      fontSize: 13,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="citizen" name={bn ? "নাগরিক রিপোর্ট" : "Citizen reports"} stackId="1" stroke="#2F5746" fill="url(#gCitizen)" />
                  <Area type="monotone" dataKey="synthetic" name={bn ? "সিন্থেটিক (ডেমো)" : "Synthetic (demo)"} stackId="1" stroke="#C9A36A" fill="url(#gSynthetic)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#D8DED5] bg-[#FFFEFA]">
          <CardContent className="p-5">
            <p className="mb-4 font-bold text-[#202C26] bn-text">{bn ? "রিভিউয়ের ফলাফল" : "Review outcomes"}</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={outcomeData.map((o) => ({
                      name:
                        o.action === "approve" ? (bn ? "অনুমোদন" : "Approve")
                        : o.action === "reject" ? (bn ? "বাতিল" : "Reject")
                        : o.action === "split" ? (bn ? "বিভাজন" : "Split")
                        : o.action === "withdraw" ? (bn ? "প্রত্যাহার" : "Withdraw")
                        : o.action,
                      value: o.count,
                    }))}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {outcomeData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#FFFEFA", border: "1px solid #D8DED5", borderRadius: 10, fontSize: 13 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* category distribution */}
      <Card className="border-[#D8DED5] bg-[#FFFEFA]">
        <CardContent className="p-5">
          <p className="mb-4 font-bold text-[#202C26] bn-text">{bn ? "প্রতারণার শ্রেণিবিন্যাস" : "Scam categories"}</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catData} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDEAE1" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#59665F" }} tickLine={false} axisLine={{ stroke: "#D8DED5" }} interval={0} angle={-18} textAnchor="end" height={58} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#59665F" }} tickLine={false} axisLine={{ stroke: "#D8DED5" }} />
                <Tooltip contentStyle={{ background: "#FFFEFA", border: "1px solid #D8DED5", borderRadius: 10, fontSize: 13 }} />
                <Bar dataKey="count" name={bn ? "রিপোর্ট" : "reports"} fill="#2F5746" radius={[6, 6, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-[#7D9C8B] bn-text">
        {bn ? "সব সংখ্যা ডেটাবেজ থেকে সরাসরি গণনাকৃত —" : "All figures are computed live from the database —"}{" "}
        {new Date(m.computedAt).toLocaleString(bn ? "bn-BD" : "en-GB")}.{" "}
        {bn ? "সিন্থেটিক ডেটা স্পষ্টভাবে চিহ্নিত (ডেমো সিমুলেশন)।" : "Synthetic data is clearly labeled (demo simulation)."}
      </p>
    </div>
  );
}
