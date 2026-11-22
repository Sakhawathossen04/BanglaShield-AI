"use client";

// Footer — compact single band with only essential links (task 12), plus a
// mobile bottom tab bar for an app-like experience (task 7). The footer stays
// glued to the bottom via the app's min-h-screen flex column + mt-auto.

import { ShieldHalf, PhoneCall, Home, ShieldQuestion, BookOpen, Users, LifeBuoy } from "lucide-react";
import { Link, useHashRoute } from "./router";
import { useT, useLang } from "./i18n";

export function Footer() {
  const t = useT();
  const bn = useLang() === "bn";
  return (
    <footer className="mt-auto border-t border-[#D8DED5] bg-[#EDEAE1] pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* brand + one-line mission */}
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2F5746]">
              <ShieldHalf className="h-4 w-4 text-[#FFFEFA]" aria-hidden />
            </span>
            <div className="leading-tight">
              <span className="block text-sm font-bold text-[#202C26] bn-text">বাংলাশিল্ড এআই</span>
              <span className="block text-[11px] text-[#59665F] bn-text">
                {bn ? "মানুষ রক্ষা, পরিবার রক্ষা, জীবিকা রক্ষা" : "Protect people, protect livelihoods"}
              </span>
            </div>
          </div>

          {/* essential links only */}
          <nav aria-label={bn ? "ফুটার লিংক" : "Footer links"} className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
            {[
              { to: "/check", key: "nav.check" },
              { to: "/learn", key: "nav.learn" },
              { to: "/community", key: "nav.community" },
              { to: "/help", key: "nav.help" },
              { to: "/privacy", key: "nav.privacy" },
            ].map((l) => (
              <Link key={l.to} to={l.to} className="text-[#2F5746] font-medium hover:underline focus-ring bn-text">
                {t(l.key)}
              </Link>
            ))}
          </nav>

          {/* emergency chip */}
          <a
            href="tel:999"
            className="inline-flex items-center gap-2 rounded-full border-2 border-[#A44435] bg-[#FFFEFA] px-4 py-2 font-bold text-[#A44435] hover:bg-[#F4E1DA] transition-colors focus-ring"
          >
            <PhoneCall className="h-4 w-4" aria-hidden /> ৯৯৯
          </a>
        </div>

        <div className="mt-4 border-t border-[#D8DED5] pt-4 text-center sm:text-left">
          <p className="text-[11px] leading-relaxed text-[#59665F] bn-text">
            © {new Date().getFullYear()} BanglaShield AI — {t("footer.copyright")} · {t("footer.privacyNote")}
          </p>
        </div>
      </div>
    </footer>
  );
}

// ---------------------------------------------------------------------------
// Mobile bottom tab bar — app-like primary navigation (hidden on lg+).
// ---------------------------------------------------------------------------

export function MobileTabBar() {
  const bn = useLang() === "bn";
  const { path } = useHashRoute();

  const tabs = [
    { to: "/", icon: Home, bn: "হোম", en: "Home" },
    { to: "/check", icon: ShieldQuestion, bn: "যাচাই", en: "Verify" },
    { to: "/learn", icon: BookOpen, bn: "শিখুন", en: "Learn" },
    { to: "/community", icon: Users, bn: "কমিউনিটি", en: "Community" },
    { to: "/help", icon: LifeBuoy, bn: "সহায়তা", en: "Support" },
  ];

  return (
    <nav
      aria-label={bn ? "মোবাইল নেভিগেশন" : "Mobile navigation"}
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden border-t border-[#D8DED5] bg-[#FFFEFA]/97 backdrop-blur supports-[backdrop-filter]:bg-[#FFFEFA]/92 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-5">
        {tabs.map((tab) => {
          const active = tab.to === "/" ? path === "/" : path.startsWith(tab.to);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`flex min-h-[3.5rem] flex-col items-center justify-center gap-0.5 px-1 py-2 transition-colors ${
                active ? "text-[#2F5746]" : "text-[#8A9B90] hover:text-[#59665F]"
              }`}
              ariaCurrent={active}
            >
              <Icon className="h-5 w-5" aria-hidden />
              <span className="text-[10px] font-semibold bn-text leading-none">{bn ? tab.bn : tab.en}</span>
              <span
                className={`h-1 w-6 rounded-full transition-colors ${active ? "bg-[#2F5746]" : "bg-transparent"}`}
                aria-hidden
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
