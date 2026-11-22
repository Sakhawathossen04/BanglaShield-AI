"use client";

import { ShieldHalf, PhoneCall, ExternalLink } from "lucide-react";
import { Link } from "./router";
import { useT, useLang } from "./i18n";

export function Footer() {
  const t = useT();
  const bn = useLang() === "bn";
  return (
    <footer className="mt-auto border-t border-[#D8DED5] bg-[#EDEAE1] pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2F5746]">
                <ShieldHalf className="h-4 w-4 text-[#FFFEFA]" aria-hidden />
              </span>
              <span className="font-bold text-[#202C26] bn-text">বাংলাশিল্ড এআই</span>
            </div>
            <p className="text-sm text-[#59665F] leading-relaxed bn-text">{t("footer.mission")}</p>
            <p className="mt-3 text-xs text-[#59665F]/90 leading-relaxed bn-text">{t("footer.disclaimer")}</p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#202C26] mb-3 bn-text">{t("footer.links")}</h3>
            <ul className="space-y-2 text-sm">
              {[
                { to: "/check", key: "nav.check" },
                { to: "/community", key: "nav.community" },
                { to: "/learn", key: "nav.learn" },
                { to: "/help", key: "nav.help" },
                { to: "/demo", key: "nav.demo" },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-[#2F5746] hover:underline focus-ring bn-text">
                    {t(l.key)}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="text-sm font-bold text-[#202C26] mt-5 mb-3 bn-text">
              {bn ? "সেকেন্ডারি" : "Secondary"}
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { to: "/privacy", key: "nav.cases" },
                { to: "/settings", key: "nav.settings" },
                { to: "/privacy", key: "nav.privacy" },
                { to: "/analyst", key: "nav.analyst" },
              ].map((l, i) => (
                <li key={`${l.to}-${i}`}>
                  <Link to={l.to} className="text-[#59665F] hover:text-[#2F5746] hover:underline focus-ring bn-text">
                    {t(l.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#202C26] mb-3 bn-text">{t("footer.emergency")}</h3>
            <a
              href="tel:999"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-[#A44435] bg-[#FFFEFA] px-4 py-3 font-bold text-[#A44435] hover:bg-[#F4E1DA] transition-colors focus-ring"
            >
              <PhoneCall className="h-5 w-5" aria-hidden /> ৯৯৯
            </a>
            <p className="mt-2 text-xs text-[#59665F] bn-text">{t("footer.emergencyDesc")}</p>
            <a
              href="https://www.cirt.gov.bd/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-[#2F5746] hover:underline focus-ring bn-text"
            >
              BGD e-GOV CIRT <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          </div>
        </div>

        <div className="mt-8 border-t border-[#D8DED5] pt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="text-xs text-[#59665F] bn-text">
            © {new Date().getFullYear()} BanglaShield AI — {t("footer.copyright")}
          </p>
          <p className="text-xs text-[#59665F] bn-text">
            {t("footer.privacyNote")} · {bn ? "তথ্য যাচাই:" : "Data verified:"} {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
