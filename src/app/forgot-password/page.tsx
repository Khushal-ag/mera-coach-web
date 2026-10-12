import { AuthShell } from "@/components/auth-shell";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata({
  title: "Forgot password",
  description: "Reset your Mera Coach coach account password.",
  path: "/forgot-password",
});

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      layout="split"
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
      sideTitle={
        <>
          Reset access to your{" "}
          <span className="text-[color:var(--mc-brand-coach)]">coaching</span>
        </>
      }
      sideBody="Same flow as the app: request a code, set a new password, then sign in on the web dashboard."
      panelHeading="Reset password"
      panelSubheading="Code is sent when the account matches"
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
