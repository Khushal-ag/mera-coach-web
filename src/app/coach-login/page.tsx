import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata({
  title: "Login – Mera Coach",
  description:
    "Sign in to your Mera Coach account to continue your wellness journey.",
  path: "/coach-login",
  absolute: true,
});

export default function CoachLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
