export function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      {eyebrow ?
        <p className="text-xs font-bold tracking-[0.18em] text-mc-secondary uppercase">
          {eyebrow}
        </p>
      : null}
      <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-mc-accent-ink sm:text-[1.75rem]">
        {title}
      </h2>
      <div
        className="mt-2 h-1 w-11 rounded-full bg-mc-brand-coach"
        aria-hidden
      />
      {children ?
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
          {children}
        </p>
      : null}
    </div>
  );
}
