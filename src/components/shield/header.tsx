"use client";

import { useState } from "react";
import { ShieldHalf, Menu, Languages, Siren, LogIn, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Link, useHashRoute } from "./router";
import { useT, useLang } from "./i18n";
import { useSettings } from "./store";
import { useMember, avatarColor } from "./member";
import { AuthDialog } from "./auth-panel";

// Primary navigation — five items, one section per concern (Support merged).
const NAV = [
  { to: "/", key: "nav.home" },
  { to: "/check", key: "nav.check" },
  { to: "/learn", key: "nav.learn" },
  { to: "/community", key: "nav.community" },
  { to: "/help", key: "nav.help" },
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

/** Member account button — sign in, or avatar chip → my dashboard. */
function AccountButton({ full = false }: { full?: boolean }) {
  const lang = useLang();
  const bn = lang === "bn";
  const member = useMember((s) => s.member);
  const [authOpen, setAuthOpen] = useState(false);

  if (member) {
    return (
      <Link
        to="/community?tab=mine"
        className={cn(
          "flex items-center gap-2 rounded-full border-2 border-[#D8DED5] bg-[#FFFEFA] pl-1.5 pr-3 py-1 hover:border-[#2F5746]/50 transition-colors focus-ring",
          full && "w-full py-2.5"
        )}
        aria-label={bn ? `আমার ড্যাশবোর্ড — ${member.name}` : `My dashboard — ${member.name}`}
      >
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full font-bold text-[#FFFEFA] text-sm bn-text"
          style={{ background: avatarColor(member.publicId) }}
          aria-hidden
        >
          {member.name.charAt(0).toUpperCase()}
        </span>
        <span className="text-left leading-tight">
          <span className="block text-xs font-bold text-[#202C26] bn-text max-w-24 truncate">{member.name}</span>
          <span className="block text-[10px] text-[#8A9B90] font-mono">{member.publicId}</span>
        </span>
        <LayoutDashboard className="h-4 w-4 text-[#8A9B90] ml-1 shrink-0" aria-hidden />
      </Link>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setAuthOpen(true)}
        className={cn(
          "border-[#D8DED5] bg-[#FFFEFA] text-[#2F5746] hover:bg-[#DDE8DF] gap-1.5 font-semibold h-11 px-3.5",
          full && "w-full"
        )}
      >
        <LogIn className="h-4 w-4" aria-hidden />
        {bn ? "সাইন-ইন" : "Sign in"}
      </Button>
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}

export function Header() {
  const t = useT();
  const lang = useLang();
  const bn = lang === "bn";
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
            <div className="hidden sm:block">
              <AccountButton />
            </div>
            <LangToggle />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden border-[#D8DED5] bg-[#FFFEFA] text-[#2F5746] h-11 w-11"
                  aria-label={bn ? "মেনু খুলুন" : "Open menu"}
                >
                  <Menu className="h-5 w-5" aria-hidden />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 border-[#D8DED5] bg-[#FFFEFA] p-0">
                <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                <SheetDescription className="sr-only">
                  {bn ? "বাংলাশিল্ডের সব পাতার লিংক" : "Links to all BanglaShield pages"}
                </SheetDescription>
                <nav className="flex flex-col gap-1 p-4 pt-14" aria-label="Mobile navigation">
                  {/* one-tap emergency action (not a separate section — Support page owns it) */}
                  <a
                    href="tel:999"
                    className="mb-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#A44435] px-4 py-3 text-base font-bold text-[#FFFEFA] focus-ring bn-text"
                  >
                    <Siren className="h-5 w-5" aria-hidden />
                    {bn ? "জরুরি: ৯৯৯ এ কল করুন" : "Emergency: call 999"}
                  </a>
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
                  <div className="px-1 pb-1">
                    <AccountButton full />
                  </div>
                  <Link
                    to="/privacy"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-4 py-3 text-base font-medium text-[#59665F] hover:bg-[#F4F1EB] focus-ring bn-text"
                  >
                    {t("nav.cases")} · {t("nav.privacy")}
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
