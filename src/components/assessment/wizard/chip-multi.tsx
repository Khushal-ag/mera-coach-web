"use client";

export function ChipMulti({
  label,
  options,
  values,
  onChange,
  required,
}: {
  required?: boolean;
  label: string;
  options: { code: string; label: string }[];
  values: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <fieldset>
      <legend className="mc-field-label mb-2">
        {label}
        {required ?
          <span className="text-mc-primary" aria-hidden>
            {" "}
            *
          </span>
        : null}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const opt = option.code;
          const isNone = (code: string) =>
            (options.find((o) => o.code === code)?.label ?? code)
              .toLowerCase()
              .includes("none of the");
          const on = values.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              className={
                on ?
                  "rounded-full border-2 border-mc-secondary bg-mc-secondary px-3 py-1.5 text-xs font-semibold text-white"
                : "rounded-full border-2 border-mc-secondary bg-white px-3 py-1.5 text-xs font-semibold text-mc-secondary hover:bg-mc-secondary hover:text-white"
              }
              aria-pressed={on}
              onClick={() => {
                if (isNone(opt)) {
                  onChange(on ? [] : [opt]);
                  return;
                }
                const withoutNone = values.filter((v) => !isNone(v));
                onChange(
                  on ?
                    withoutNone.filter((v) => v !== opt)
                  : [...withoutNone, opt],
                );
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
