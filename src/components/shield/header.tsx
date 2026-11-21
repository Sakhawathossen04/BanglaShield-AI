"use client";

import { useState } from "react";
import { ShieldHalf, Menu, X, Languages, Siren } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Link, useHashRoute } from "./router";
import { useT, useLang } from "./i18n";
import { useSettings } from "./store";

const NAV = [
  { to: "/", key: "nav.home" },
  { to: "/check", key: "nav.check" },
  { to: "/recovery", key: "nav.recovery" },
  { to: "/learn", key: "nav.learn" },
  { to: "/report", key: "nav.report" },
  { to: "/help", key: "nav.help" },
];

function LangToggle() {
  const { lang, setLang } = useSettings();
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setLang(lang === "bn" ? "en" : "bn")}
      className="border-[#D8DED5] bg-[#FFFEFA] text-[#2F5746] hover:bg-[#DDE8DF] gap-1.5 font-semibold"
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
            <Link
              to="/recovery"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#A44435] px-4 py-2 text-sm font-bold text-[#FFFEFA] hover:bg-[#8C382B] transition-colors focus-ring bn-text"
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
                  className="lg:hidden border-[#D8DED5] bg-[#FFFEFA] text-[#2F5746]"
                  aria-label={lang === "bn" ? "মেনু খুলুন" : "Open menu"}
                >
                  <Menu className="h-5 w-5" aria-hidden />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 border-[#D8DED5] bg-[#FFFEFA] p-0">
                <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                <nav className="flex flex-col gap-1 p-4 pt-14" aria-label="Mobile navigation">
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
                  <Link
                    to="/analyst"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-4 py-3 text-base font-medium text-[#59665F] hover:bg-[#F4F1EB] focus-ring bn-text"
                  >
                    {t("nav.analyst")}
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-4 py-3 text-base font-medium text-[#59665F] hover:bg-[#F4F1EB] focus-ring bn-text"
                  >
                    {t("nav.settings")}
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      <button
        onClick={() => setOpen(false)}
        className="hidden"
        aria-hidden
        tabIndex={-1}
      >
        <X aria-hidden />
      </button>
    </header>
  );
}
