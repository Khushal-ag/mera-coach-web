import type { LegalSection } from "@/constants/legal-content";

import { siteConfig } from "@/config/site";
import { LEGAL_UPDATED, TERMS_SECTIONS } from "@/constants/legal-content";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata({
  title: "Terms of Service | Mera Coach",
  description:
    "The terms that apply when you use Mera Coach as a coach, client or visitor, including accounts, premium subscriptions, content and liability.",
  path: "/terms",
  absolute: true,
});

export default function TermsPage() {
  const sections: LegalSection[] = TERMS_SECTIONS;
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
                  Please read these terms before using the Mera Coach website
                  and app.
                </p>
              </div>
            </div>
          </div>
          <div className="rg-card-body">
            <p className="rg-field-note">{LEGAL_UPDATED}</p>
            {sections.map((section) => (
              <section key={section.title}>
                <h2
                  className="section-title"
                  style={{ fontSize: 22, marginTop: 28 }}
                >
                  {section.title}
                </h2>
                <p>{section.body}</p>
              </section>
            ))}
            <p style={{ marginTop: 28 }}>
              Questions? Write to{" "}
              <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
