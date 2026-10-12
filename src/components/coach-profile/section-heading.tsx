export function SectionHeading({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <h2 className="font-display text-2xl font-bold tracking-tight text-mc-accent-ink sm:text-[1.75rem]">
        {title}
      </h2>
      <div
        className="mt-2.5 h-1 w-11 rounded-full bg-mc-brand-coach"
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
