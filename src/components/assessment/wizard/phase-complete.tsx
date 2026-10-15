"use client";

export function PhaseComplete() {
  return (
    <div className="flex flex-col items-start gap-3 py-4">
      <span className="inline-flex size-12 items-center justify-center rounded-full bg-[color:var(--mc-secondary-light)] text-mc-secondary">
        <i className="fas fa-check" style={{ fontSize: 24 }} aria-hidden />
      </span>
      <p className="font-display text-xl font-bold text-ink">
        Assessment saved
      </p>
      <p className="text-sm text-ink-muted">
        You can open BMI and diet reports from the client profile.
      </p>
    </div>
  );
}
