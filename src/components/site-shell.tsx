"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";

import { AuthProvider } from "@/components/auth-provider";
import { ScrollTop } from "@/components/scroll-top";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/config/site";

function HeaderFallback() {
  return (
    <div className="sticky top-0 z-50 h-[4.5rem] bg-[color:var(--paper)] shadow-[0_1px_20px_rgba(44,24,16,0.08)]" />
  );
}

function MarketingChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPractice = pathname.startsWith(siteConfig.links.dashboard);
  const isAdmin = pathname.startsWith(siteConfig.links.admin);

  if (isPractice || isAdmin) {
    return <>{children}</>;
  }

  const flushNav =
    pathname === "/" ||
    pathname === siteConfig.links.services ||
    pathname === siteConfig.links.coaches ||
    pathname.startsWith("/coach/") ||
    pathname === siteConfig.links.coachLogin ||
    pathname === siteConfig.links.register ||
    pathname === siteConfig.links.contact ||
    pathname === siteConfig.links.privacy ||
    pathname === siteConfig.links.terms ||
    pathname === siteConfig.links.premium ||
    pathname === "/feedback" ||
    pathname === siteConfig.links.forgotPassword;

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
