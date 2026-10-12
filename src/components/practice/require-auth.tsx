"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/components/auth-provider";

const subscribeNever = () => () => {};

/** False on the server and during hydration; true only after mount. */
function useMounted() {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
}

/**
 * Client session lives in sessionStorage — the server never sees it.
 * SSR and the first client paint always show the same placeholder; only after
 * mount + auth restore do we render the shell or redirect.
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

  // Same tree for SSR + hydration — do not read session for this branch.
  if (!mounted || !ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[color:var(--mc-explore-canvas)] text-sm text-ink-muted">
        Checking session…
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[color:var(--mc-explore-canvas)] text-sm text-ink-muted">
        Redirecting to sign in…
      </div>
    );
  }

  return <>{children}</>;
}
