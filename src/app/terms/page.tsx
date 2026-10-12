import { PageHero } from "@/components/page-hero";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata({
  title: "Terms & Conditions",
  description: "Terms and conditions for using Mera Coach.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Terms" }]}
        title="Terms & Conditions"
        subtitle="Please read these terms carefully before using Mera Coach websites and services."
      />
      <section className="bg-paper py-14">
        <div className="prose prose-neutral container max-w-3xl space-y-6 text-sm leading-relaxed text-ink-muted">
          <p>
            By accessing mera-coach.com, related web pages, or connecting mobile
            experiences operated by Hench Solutions (&quot;Mera Coach&quot;),
            you agree to these terms. If you do not agree, do not use the
            service.
          </p>
          <h2 className="font-display text-xl font-bold text-ink">Accounts</h2>
          <p>
            Coach accounts created via registration must use accurate contact
            details. You are responsible for safeguarding credentials issued to
            you. Client accounts are managed through the coach and the Mera
            Coach app.
          </p>
          <h2 className="font-display text-xl font-bold text-ink">Premium</h2>
          <p>
            Premium subscriptions for coaches are sold on this website. Prices
            and plan duration are confirmed at checkout. Payments are processed
            securely by our payment partner. Chargebacks or disputes should be
            raised through the payment partner and support at
            Contact@mera-coach.com.
          </p>
          <h2 className="font-display text-xl font-bold text-ink">Content</h2>
          <p>
            You retain rights to content you upload. You grant Mera Coach a
            limited license to host and display that content as needed to
            operate the service. Public coach profiles may be indexed for
            discovery.
          </p>
          <h2 className="font-display text-xl font-bold text-ink">Liability</h2>
          <p>
            Mera Coach is a coaching operations platform. It does not provide
            medical advice. Wellness outcomes depend on coaches and clients.
            Services are provided as available, without warranties beyond those
            required by applicable law.
          </p>
          <h2 className="font-display text-xl font-bold text-ink">Changes</h2>
          <p>
            We may update these terms. Continued use after changes constitutes
            acceptance. For questions, email Contact@mera-coach.com.
          </p>
          <p className="text-xs text-ink-muted">Last updated: October 2026</p>
        </div>
      </section>
    </>
  );
}
