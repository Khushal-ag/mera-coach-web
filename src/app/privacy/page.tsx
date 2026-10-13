import { PageBanner } from "@/components/marketing/page-banner";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata({
  title: "Privacy Policy",
  description: "How Mera Coach collects and uses personal information.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <PageBanner
        crumbs={[{ label: "Home", href: "/" }, { label: "Privacy" }]}
        title="Privacy"
        emphasis="policy"
        subtitle="How we collect, use, and protect information on Mera Coach."
      />
      <section className="bg-[color:var(--mc-explore-canvas)] py-10 sm:py-14">
        <article className="container max-w-3xl space-y-6 rounded-[22px] border border-line bg-white p-6 text-sm leading-relaxed text-ink-muted shadow-[0_16px_40px_rgba(23,134,118,0.08)] sm:p-8">
          <p>
            Hench Solutions operates Mera Coach. This policy explains what we
            collect when you use the website, online forms, and related app
            experiences.
          </p>
          <h2 className="font-display text-xl font-bold text-ink">
            Information we collect
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Coach registration details (name, mobile, email, business and
              address fields you submit).
            </li>
            <li>
              Enquiry and feedback form data (name, contact, ratings, comments).
            </li>
            <li>
              Premium checkout details (coach account reference, plan selection,
              and payment confirmation references from our payment partner).
              Card data is handled by the payment partner, not stored by this
              website.
            </li>
            <li>
              Technical logs such as IP address and basic request metadata for
              security and abuse prevention.
            </li>
          </ul>
          <h2 className="font-display text-xl font-bold text-ink">
            How we use it
          </h2>
          <p>
            We use data to operate coach discovery, registration, enquiries,
            feedback, and premium billing; to send transactional email such as
            welcome credentials and enquiry notices; and to improve reliability
            and security.
          </p>
          <h2 className="font-display text-xl font-bold text-ink">Sharing</h2>
          <p>
            We share data with service providers required to run the product
            (hosting, email, payment). Enquiry details are shared with the coach
            you contact. We do not sell personal information.
          </p>
          <h2 className="font-display text-xl font-bold text-ink">
            Your choices
          </h2>
          <p>
            Contact Contact@mera-coach.com to request access, correction, or
            deletion where applicable. Coaches can update profile visibility and
            details through the app after signing in.
          </p>
          <p className="text-xs text-ink-muted">Last updated: October 2026</p>
        </article>
      </section>
    </>
  );
}
