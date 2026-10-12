"use client";

type Option = { code: string; label: string };

type ServiceMultiSelectProps = {
  label?: string;
  hint?: string;
  options: Option[];
  selected: string[];
  onChange: (codes: string[]) => void;
  disabled?: boolean;
  loading?: boolean;
};

export function ServiceMultiSelect({
  label = "Services",
  hint,
  options,
  selected,
  onChange,
  disabled,
  loading,
}: ServiceMultiSelectProps) {
  const selectedSet = new Set(selected);

  function toggle(code: string) {
    if (selectedSet.has(code)) {
      onChange(selected.filter((c) => c !== code));
    } else {
      onChange([...selected, code]);
    }
  }

  return (
    <fieldset className="block" disabled={disabled}>
      <legend className="mc-field-label">{label}</legend>
      {hint ?
        <p className="mc-field-hint mb-2">{hint}</p>
      : null}
      {loading ?
        <div className="space-y-2" aria-busy="true">
          <span className="sr-only">Loading services</span>
          <div className="mc-skeleton h-8 w-full" />
          <div className="mc-skeleton h-8 w-4/5" />
          <div className="mc-skeleton h-8 w-3/5" />
        </div>
      : !options.length ?
        <p className="text-sm text-ink-muted">
          Choose a coach category to load services.
        </p>
      : <ul className="mt-1 max-h-56 space-y-2 overflow-y-auto rounded-[var(--radius-sm)] border border-line bg-surface p-3">
          {options.map((opt) => (
            <li key={opt.code}>
              <label className="flex cursor-pointer items-start gap-2.5 text-sm text-ink">
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 rounded border-line text-mc-secondary focus:ring-mc-secondary"
                  checked={selectedSet.has(opt.code)}
                  onChange={() => toggle(opt.code)}
                />
                <span>{opt.label}</span>
              </label>
            </li>
          ))}
        </ul>
      }
      {selected.length ?
        <p className="mt-1.5 text-xs text-ink-muted">
          {selected.length} selected
        </p>
      : null}
    </fieldset>
  );
}
