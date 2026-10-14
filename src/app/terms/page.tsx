import { siteConfig } from "@/config/site";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata({
  title: "Terms of Service | Mera Coach",
  description: "Terms and conditions for using Mera Coach.",
  path: "/terms",
  absolute: true,
});

export default function TermsPage() {
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
                <i className="fas fa-file-contract" />
              </div>
              <div>
                <h1>Terms of Service</h1>
                <p>
                  Please read these terms carefully before using Mera Coach
                  websites and services.
                </p>
              </div>
            </div>
          </div>
          <div className="rg-card-body">
            <p>
              By accessing mera-coach.com, related web pages, or connecting
              mobile experiences operated by Hench Solutions (&quot;Mera
              Coach&quot;), you agree to these terms. If you do not agree, do
              not use the service.
            </p>
            <h2
              className="section-title"
              style={{ fontSize: 22, marginTop: 28 }}
            >
              Accounts
            </h2>
            <p>
              Coach accounts created via registration must use accurate contact
              details. You are responsible for safeguarding credentials issued
              to you. Client accounts are managed through the coach and the Mera
              Coach app.
            </p>
            <h2
              className="section-title"
              style={{ fontSize: 22, marginTop: 28 }}
            >
              Premium
            </h2>
            <p>
              Premium subscriptions for coaches are sold on this website. Prices
              and plan duration are confirmed at checkout. Payments are
              processed securely by our payment partner. Chargebacks or disputes
              should be raised through the payment partner and support at{" "}
              {siteConfig.email.team}.
            </p>
            <h2
              className="section-title"
              style={{ fontSize: 22, marginTop: 28 }}
            >
              Content
            </h2>
            <p>
              You retain rights to content you upload. You grant Mera Coach a
              limited license to host and display that content as needed to
              operate the service. Public coach profiles may be indexed for
              discovery.
            </p>
            <h2
              className="section-title"
              style={{ fontSize: 22, marginTop: 28 }}
            >
              Liability
            </h2>
            <p>
              Mera Coach is a coaching operations platform. It does not provide
              medical advice. Wellness outcomes depend on coaches and clients.
              Services are provided as available, without warranties beyond
              those required by applicable law.
            </p>
            <h2
              className="section-title"
              style={{ fontSize: 22, marginTop: 28 }}
            >
              Changes
            </h2>
            <p>
              We may update these terms. Continued use after changes constitutes
              acceptance. For questions, email {siteConfig.email.team}.
            </p>
            <p className="rg-field-note" style={{ marginTop: 24 }}>
              Last updated: October 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
