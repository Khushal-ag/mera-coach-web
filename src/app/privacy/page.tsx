import type { LegalSection } from "@/data/legal-content";

import { siteConfig } from "@/config/site";
import { LEGAL_UPDATED, PRIVACY_POLICY_SECTIONS } from "@/data/legal-content";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata({
  title: "Privacy Policy | Mera Coach",
  description:
    "How Mera Coach collects, uses and protects your personal information, and the choices you have over your data.",
  path: "/privacy",
  absolute: true,
});

export default function PrivacyPage() {
  const sections: LegalSection[] = PRIVACY_POLICY_SECTIONS;
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
                <i className="fas fa-user-shield" />
              </div>
              <div>
                <h1>Privacy Policy</h1>
                <p>
                  How we handle your information, on the website and in the Mera
                  Coach app.
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
              <a href={`mailto:${siteConfig.email.support}`}>
                {siteConfig.email.support}
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
