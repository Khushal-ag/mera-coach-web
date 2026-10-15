"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";

import { AuthProvider } from "@/components/auth-provider";
import { ScrollReveal } from "@/components/scroll-reveal";
import { ScrollTop } from "@/components/scroll-top";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

function HeaderFallback() {
  return (
    <div className="sticky top-0 z-50 h-[4.5rem] bg-[color:var(--paper)] shadow-[0_1px_20px_rgba(44,24,16,0.08)]" />
  );
}

function MarketingChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPractice = pathname.startsWith("/dashboard");

  if (isPractice) {
    return <>{children}</>;
  }

  const flushNav =
    pathname === "/" ||
    pathname === "/services" ||
    pathname === "/coach" ||
    pathname.startsWith("/coach/") ||
    pathname === "/coach-login" ||
    pathname === "/register" ||
    pathname === "/contact" ||
    pathname === "/privacy" ||
    pathname === "/terms" ||
    pathname === "/premium" ||
    pathname === "/feedback" ||
    pathname === "/forgot-password";

  return (
    <div className="flex min-h-dvh flex-col bg-paper text-ink">
      <a href="#main-content" className="mc-skip">
        Skip to main content
      </a>
      <Suspense fallback={<HeaderFallback />}>
        <SiteHeader />
      </Suspense>
      <main
        id="main-content"
        className={flushNav ? "min-h-svh flex-1" : "min-h-svh flex-1 pt-[90px]"}
      >
        {children}
      </main>
      <SiteFooter />
      <ScrollReveal />
      <ScrollTop />
    </div>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Suspense fallback={<>{children}</>}>
        <MarketingChrome>{children}</MarketingChrome>
      </Suspense>
    </AuthProvider>
  );
}
