import { StatusPanel } from "@/components/status-panel";

export default function Loading() {
  return (
    <StatusPanel
      title="Loading"
      description="Fetching the latest from Mera Coach…"
      className="min-h-[40dvh] py-20"
    >
      <div
        className="mt-2 flex items-center gap-2"
        role="status"
        aria-live="polite"
        aria-label="Loading"
      >
        <span className="size-2.5 animate-pulse rounded-full bg-mc-secondary" />
        <span className="size-2.5 animate-pulse rounded-full bg-mc-brand-coach [animation-delay:150ms]" />
        <span className="size-2.5 animate-pulse rounded-full bg-mc-header-top [animation-delay:300ms]" />
      </div>
    </StatusPanel>
  );
}
