import Link from "next/link";

import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata({
  title: "Member Login | Mera Coach",
  description:
    "Member sign in information for Mera Coach clients, who use the Mera Coach app with credentials shared by their coach.",
  path: "/member-login",
  noindex: true,
  absolute: true,
});

export default function MemberLoginPage() {
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
                <i className="fas fa-mobile-alt" />
              </div>
              <div>
                <h1>Member Login</h1>
                <p>Client access now lives in the Mera Coach mobile app.</p>
              </div>
            </div>
          </div>
          <div className="rg-card-body">
            <p>
              Website member login is now the Mera Coach app. If your coach
              invited you, open the app with the credentials they shared. This
              website is for discovering coaches and coach registration.
            </p>
            <div className="rg-nav" style={{ marginTop: 28 }}>
              <Link href="/coach" className="btn rg-btn-next">
                <i className="fas fa-search" /> Find a Coach
              </Link>
              <Link href="/coach-login" className="btn rg-btn-back">
                Coach Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
