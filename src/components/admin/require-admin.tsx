"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { siteConfig } from "@/config/site";
import { useAdminSession } from "@/hooks/use-admin-session";
import { useMounted } from "@/hooks/use-mounted";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { session, ready } = useAdminSession();
  const mounted = useMounted();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!mounted || !ready) return;
    if (session) return;
    const next = encodeURIComponent(pathname || siteConfig.links.adminCoaches);
    router.replace(`${siteConfig.links.admin}?next=${next}`);
  }, [mounted, ready, session, router, pathname]);

  if (!mounted || !ready || !session) {
    return (
      <div className="mc-dash">
        <div className="cl-body flex min-h-dvh flex-col items-center justify-center gap-3 bg-[var(--cl-bg)] p-8 text-[var(--cl-text-lt)]">
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-mc-secondary-light text-mc-secondary">
            <i className="fas fa-spinner fa-spin text-lg" aria-hidden />
          </span>
          <p className="font-[family-name:var(--font-poppins)] text-sm font-semibold">
            Checking admin session…
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
