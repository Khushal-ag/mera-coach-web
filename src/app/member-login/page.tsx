import Link from "next/link";

import { AuthShell } from "@/components/auth-shell";
import { photography } from "@/config/photography";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata({
  title: "Member Login",
  description: "Member access for Mera Coach clients.",
  path: "/member-login",
});

export default function MemberLoginPage() {
  return (
    <AuthShell
      layout="split"
      panel="light"
      image={photography.findCoach}
      imageAlt="Someone walking into a neighbourhood gym at dusk"
      crumbs={[{ label: "Home", href: "/" }, { label: "Member Login" }]}
      title={
        <>
          Member{" "}
          <span className="text-[color:var(--mc-brand-coach)]">Login</span>
        </>
      }
      subtitle="Client access now lives in the Mera Coach mobile app."
      panelHeading="Open the app"
      panelSubheading="Plans, check-ins, and progress stay with your coach in the app."
    >
      <div className="space-y-5">
        <p className="text-sm leading-relaxed text-ink-muted">
          Website member login is now the Mera Coach app. If your coach invited
          you, open the app with the credentials they shared. This website is
          for discovering coaches and coach registration.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/coach" className="mc-btn-primary w-full">
            Find a Coach
          </Link>
          <Link href="/coach-login" className="mc-btn-secondary w-full">
            Coach Login
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
