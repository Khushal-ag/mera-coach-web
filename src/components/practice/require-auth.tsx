"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { DashboardShellSkeleton } from "@/components/skeletons/dashboard-skeleton";
import { useMounted } from "@/hooks/use-mounted";

/**
 * Client session lives in sessionStorage: the server never sees it.
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
