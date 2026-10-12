import { AuthShell } from "@/components/auth-shell";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { photography } from "@/config/photography";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata({
  title: "Forgot password",
  description: "Reset your Mera Coach coach account password.",
  path: "/forgot-password",
});

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      layout="single"
      panel="light"
      image={photography.authLogin}
      imageAlt="Someone walking into a neighbourhood gym at dusk"
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Coach Login", href: "/coach-login" },
        { label: "Forgot password" },
      ]}
      title={
        <>
          Forgot{" "}
          <span className="text-[color:var(--mc-brand-coach)]">password</span>
        </>
      }
      subtitle="Enter the email or mobile you use to sign in, then confirm with the reset code."
      panelHeading="Reset password"
      panelSubheading="A code is sent when the account matches"
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
