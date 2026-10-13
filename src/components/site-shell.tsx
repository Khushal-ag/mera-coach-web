"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";

import { AuthProvider } from "@/components/auth-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

function HeaderFallback() {
  return (
    <div className="sticky top-0 z-50 h-[7.4rem] bg-[color:var(--paper)] shadow-[0_8px_24px_rgba(44,24,16,0.08)]" />
  );
}

function MarketingChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPractice = pathname.startsWith("/dashboard");

  if (isPractice) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-dvh flex-col bg-paper text-ink">
      <Suspense fallback={<HeaderFallback />}>
        <SiteHeader />
      </Suspense>
      <main className="flex-1">{children}</main>
      <SiteFooter />
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
