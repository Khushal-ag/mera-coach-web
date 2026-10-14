import { Suspense } from "react";

import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata({
  title: "Forgot Password | Mera Coach",
  description: "Reset your Mera Coach coach account password.",
  path: "/forgot-password",
  absolute: true,
});

export default function ForgotPasswordPage() {
  return (
    <div className="mc-public">
      <div className="rg-page">
        <div className="rg-card">
          <div className="rg-card-head">
            <div className="rg-head-blobs">
              <div className="rg-hb rg-hb-1" />
              <div className="rg-hb rg-hb-2" />
            </div>
            <div className="rg-head-inner">
              <div className="rg-head-icon">
                <i className="fas fa-key" />
              </div>
              <div>
                <h1>Forgot Password</h1>
                <p>
                  Enter the email or mobile you use to sign in, then confirm
                  with the reset code.
                </p>
              </div>
            </div>
          </div>
          <div className="rg-card-body">
            <Suspense fallback={null}>
              <ForgotPasswordForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
