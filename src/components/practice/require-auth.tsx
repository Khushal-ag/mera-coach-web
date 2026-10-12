"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/components/auth-provider";

/** Redirects unsigned visitors to coach login, preserving return path. */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;
    if (session) return;
    const next = encodeURIComponent(pathname || "/dashboard");
    router.replace(`/coach-login?next=${next}`);
  }, [ready, session, router, pathname]);

  if (!ready) {
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
