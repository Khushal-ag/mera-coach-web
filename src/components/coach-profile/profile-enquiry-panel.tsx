import { CoachEnquiryForm } from "@/components/coach-enquiry-form";

type ProfileEnquiryPanelProps = {
  coachCode: string;
  coachName: string;
  lookingForOptions: string[];
};

export function ProfileEnquiryPanel({
  coachCode,
  coachName,
  lookingForOptions,
}: ProfileEnquiryPanelProps) {
  return (
    <section
      id="contact"
      className="relative scroll-mt-24 overflow-hidden bg-[image:var(--mc-gradient)] py-16 sm:py-20"
    >
      <div className="container">
        <div
          id="enquiry"
          className="mx-auto max-w-3xl rounded-[24px] bg-white p-6 text-ink shadow-[0_20px_60px_rgba(0,0,0,0.18)] sm:p-8"
        >
          <p className="inline-flex rounded-full bg-[color:var(--mc-accent-light)] px-3 py-1 font-display text-xs font-bold text-[color:var(--mc-accent)]">
            Get in touch
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight">
            Book your{" "}
            <em className="text-[color:var(--mc-accent)] not-italic">free</em>{" "}
            consultation
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-muted">
            {coachName} gets this enquiry from the public page. There is no fee
            to send it.
          </p>
          <div className="mt-6">
            <CoachEnquiryForm
              coachCode={coachCode}
              coachName={coachName}
              lookingForOptions={lookingForOptions}
            />
          </div>
          <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-line pt-4 text-xs font-semibold text-ink-muted">
            <li>Free to send</li>
            <li>No account required</li>
            <li>No payment on this form</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
