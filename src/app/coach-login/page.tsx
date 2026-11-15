import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { siteConfig } from "@/config/site";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata({
  title: "Coach Login | Mera Coach",
  description:
    "Sign in to your Mera Coach account to manage clients, check-ups, leads and your public coach profile.",
  path: siteConfig.links.coachLogin,
  noindex: true,
  absolute: true,
});

export default function CoachLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
