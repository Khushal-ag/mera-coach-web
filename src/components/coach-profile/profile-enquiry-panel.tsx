import { CoachEnquiryForm } from "@/components/coach-enquiry-form";

type ProfileEnquiryPanelProps = {
  coachCode: string;
  coachName: string;
  lookingForOptions: string[];
  whatsappUrl: string | null;
};

export function ProfileEnquiryPanel({
  coachCode,
  coachName,
  lookingForOptions,
  whatsappUrl,
}: ProfileEnquiryPanelProps) {
  const firstName = coachName.split(" ")[0] || coachName;

  return (
    <aside
      id="enquiry"
      className="scroll-mt-24 overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--mc-shadow-lg)] lg:sticky lg:top-24"
    >
      <div className="border-b border-line bg-mc-primary-light px-5 py-5 sm:px-7 sm:py-6">
        <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
          Start with {firstName}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          Share a few details. Coaches typically reply within 24 hours. No
          payment required to enquire.
        </p>
      </div>
      <div className="p-5 sm:p-7">
        <CoachEnquiryForm
          coachCode={coachCode}
          coachName={coachName}
          lookingForOptions={lookingForOptions}
        />

        {whatsappUrl ?
          <p className="mt-5 border-t border-line pt-4 text-center text-sm text-ink-muted">
            Prefer chat?{" "}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[color:var(--mc-whatsapp)] hover:underline"
            >
              Message on WhatsApp
            </a>
          </p>
        : null}
      </div>
    </aside>
  );
}
