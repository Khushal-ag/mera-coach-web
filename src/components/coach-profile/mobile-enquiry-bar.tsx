import { ShareProfileButton } from "@/components/coach-profile/share-profile-button";

type MobileEnquiryBarProps = {
  coachFirstName: string;
  coachName: string;
  whatsappUrl: string | null;
};

export function MobileEnquiryBar({
  coachFirstName,
  coachName,
  whatsappUrl,
}: MobileEnquiryBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--mc-secondary)]/15 bg-[color:var(--mc-explore-canvas)]/95 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:px-4 lg:hidden">
      <div className="mx-auto flex max-w-lg gap-2">
        <a
          href="#enquiry"
          className="mc-btn-primary min-h-11 min-w-0 flex-1 px-3 text-sm sm:px-4"
        >
          Enquire{coachFirstName ? ` · ${coachFirstName}` : ""}
        </a>
        {whatsappUrl ?
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mc-btn-secondary min-h-11 min-w-0 flex-1 px-3 text-sm sm:px-4"
          >
            WhatsApp
          </a>
        : null}
        <ShareProfileButton
          coachName={coachName}
          label="Share"
          variant="secondary"
          className="min-h-11 shrink-0 !px-3 text-sm sm:!px-4"
        />
      </div>
    </div>
  );
}
