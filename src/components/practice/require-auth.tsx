"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { useMounted } from "@/hooks/use-mounted";

/**
 * Client session lives in sessionStorage — the server never sees it.
 * SSR and the first client paint share this shell skeleton. After mount, a
 * stored session reveals the dashboard; otherwise we leave for login.
 * Dashboard routes export `instant = false` because this layout omits
 * `{children}` until auth resolves (Cache Components / Partial Prefetching).
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, ready } = useAuth();
  const mounted = useMounted();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!mounted || !ready) return;
    if (session) return;
    const next = encodeURIComponent(pathname || "/dashboard");
    router.replace(`/coach-login?next=${next}`);
  }, [mounted, ready, session, router, pathname]);

  // Same tree for SSR + hydration. Session is applied only after mount.
  if (!mounted || !ready || !session) {
    return <DashboardShellSkeleton />;
  }

  return <>{children}</>;
}

function DashboardShellSkeleton() {
  return (
    <div
      className="flex min-h-dvh bg-paper text-ink"
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      <aside className="sticky top-0 hidden h-dvh w-[252px] shrink-0 flex-col border-r border-line bg-white px-3 py-5 lg:flex">
        <div className="mb-4 h-10 w-40 animate-pulse rounded-lg bg-line" />
        <div className="mx-2 mb-3 h-px bg-line" />
        <div className="flex flex-1 flex-col gap-1">
          {Array.from({ length: 7 }, (_, index) => (
            <div
              key={index}
              className="h-11 animate-pulse rounded-xl bg-line/80"
            />
          ))}
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-line bg-white shadow-[0_2px_12px_rgba(23,134,118,0.1)]">
          <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="h-4 w-40 animate-pulse rounded bg-line" />
            <div className="size-10 animate-pulse rounded-full bg-line" />
          </div>
        </header>
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-7 lg:px-8">
          <div className="mx-auto w-full max-w-7xl space-y-4">
            <div className="h-28 animate-pulse rounded-[18px] bg-line" />
            <div className="grid gap-4 md:grid-cols-3">
              <div className="h-28 animate-pulse rounded-[18px] bg-line" />
              <div className="h-28 animate-pulse rounded-[18px] bg-line" />
              <div className="h-28 animate-pulse rounded-[18px] bg-line" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
