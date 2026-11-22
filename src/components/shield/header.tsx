"use client";

import { useState } from "react";
import { ShieldHalf, Menu, Languages, Siren } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Link, useHashRoute } from "./router";
import { useT, useLang } from "./i18n";
import { useSettings } from "./store";

// V3 primary navigation — five items, one prominent emergency action.
const NAV = [
  { to: "/", key: "nav.home" },
  { to: "/check", key: "nav.check" },
  { to: "/learn", key: "nav.learn" },
  { to: "/community", key: "nav.community" },
  { to: "/help", key: "nav.help" },
];

// Secondary navigation — case history, settings, privacy, analyst, demo.
const SECONDARY = [
  { to: "/privacy", key: "nav.cases" },
  { to: "/settings", key: "nav.settings" },
  { to: "/privacy?tab=privacy" as never, key: "nav.privacy" },
  { to: "/demo", key: "nav.demo" },
  { to: "/analyst", key: "nav.analyst" },
];

function LangToggle() {
  const { lang, setLang } = useSettings();
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setLang(lang === "bn" ? "en" : "bn")}
      className="border-[#D8DED5] bg-[#FFFEFA] text-[#2F5746] hover:bg-[#DDE8DF] gap-1.5 font-semibold h-11 min-w-11 px-3"
      aria-label={lang === "bn" ? "Switch to English" : "বাংলায় দেখুন"}
    >
      <Languages className="h-4 w-4" aria-hidden />
      {lang === "bn" ? "EN" : "বাংলা"}
    </Button>
  );
}

export function Header() {
  const t = useT();
  const lang = useLang();
  const { path } = useHashRoute();
  const [open, setOpen] = useState(false);

  const isActive = (to: string) => (to === "/" ? path === "/" : path.startsWith(to));

  return (
    <header className="sticky top-0 z-50 border-b border-[#D8DED5] bg-[#F4F1EB]/95 backdrop-blur supports-[backdrop-filter]:bg-[#F4F1EB]/85">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2.5 focus-ring rounded-lg" ariaLabel="BanglaShield home">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2F5746]">
              <ShieldHalf className="h-5 w-5 text-[#FFFEFA]" aria-hidden />
            </span>
            <span className="leading-tight">
              <span className="block text-lg font-bold text-[#202C26] bn-text">বাংলাশিল্ড</span>
              <span className="hidden sm:block text-[11px] text-[#59665F]">{t("app.tagline")}</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "rounded-lg px-3 py-2 text-[15px] font-medium transition-colors focus-ring bn-text",
                  isActive(item.to)
                    ? "bg-[#DDE8DF] text-[#2F5746]"
                    : "text-[#59665F] hover:bg-[#EDEAE1] hover:text-[#202C26]"
                )}
                ariaCurrent={isActive(item.to)}
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* Single prominent emergency action */}
            <Link
              to="/help"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#A44435] px-4 py-2.5 text-sm font-bold text-[#FFFEFA] hover:bg-[#8C382B] transition-colors focus-ring bn-text"
            >
              <Siren className="h-4 w-4" aria-hidden />
              {lang === "bn" ? "জরুরি সহায়তা" : "Emergency"}
            </Link>
            <LangToggle />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden border-[#D8DED5] bg-[#FFFEFA] text-[#2F5746] h-11 w-11"
                  aria-label={lang === "bn" ? "মেনু খুলুন" : "Open menu"}
                >
                  <Menu className="h-5 w-5" aria-hidden />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 border-[#D8DED5] bg-[#FFFEFA] p-0">
                <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                <SheetDescription className="sr-only">
                  {lang === "bn" ? "বাংলাশিল্ডের সব পাতার লিংক" : "Links to all BanglaShield pages"}
                </SheetDescription>
                <nav className="flex flex-col gap-1 p-4 pt-14" aria-label="Mobile navigation">
                  <Link
                    to="/help"
                    onClick={() => setOpen(false)}
                    className="mb-2 inline-flex items-center gap-2 rounded-xl bg-[#A44435] px-4 py-3 text-base font-bold text-[#FFFEFA] focus-ring bn-text"
                  >
                    <Siren className="h-5 w-5" aria-hidden />
                    {lang === "bn" ? "জরুরি সহায়তা" : "Emergency help"}
                  </Link>
                  {NAV.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "rounded-lg px-4 py-3 text-base font-medium focus-ring bn-text",
                        isActive(item.to) ? "bg-[#DDE8DF] text-[#2F5746]" : "text-[#59665F] hover:bg-[#F4F1EB]"
                      )}
                    >
                      {t(item.key)}
                    </Link>
                  ))}
                  <div className="h-px bg-[#D8DED5] my-2" />
                  <p className="px-4 pb-1 text-xs font-semibold uppercase tracking-wide text-[#8A9B90]">
                    {lang === "bn" ? "আরও" : "More"}
                  </p>
                  <Link
                    to="/privacy"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-4 py-3 text-base font-medium text-[#59665F] hover:bg-[#F4F1EB] focus-ring bn-text"
                  >
                    {t("nav.cases")}
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-4 py-3 text-base font-medium text-[#59665F] hover:bg-[#F4F1EB] focus-ring bn-text"
                  >
                    {t("nav.settings")}
                  </Link>
                  <Link
                    to="/demo"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-4 py-3 text-base font-medium text-[#59665F] hover:bg-[#F4F1EB] focus-ring bn-text"
                  >
                    {t("nav.demo")}
                  </Link>
                  <Link
                    to="/analyst"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-4 py-3 text-base font-medium text-[#59665F] hover:bg-[#F4F1EB] focus-ring bn-text"
                  >
                    {t("nav.analyst")}
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
