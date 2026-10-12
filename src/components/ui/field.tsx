import { cn } from "@/lib/utils";

type Tone = "light" | "dark";

type FieldShellProps = {
  label: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
};

export function FieldShell({
  label,
  htmlFor,
  required,
  hint,
  error,
  tone = "light",
  className,
  children,
}: FieldShellProps) {
  return (
    <div className={cn("block", className)}>
      <label
        htmlFor={htmlFor}
        className={cn(
          "mc-field-label",
          tone === "dark" && "mc-field-label-dark",
        )}
      >
        {label}
        {required ?
          <span className="text-mc-brand-coach"> *</span>
        : null}
      </label>
      {children}
      {error ?
        <p className="mc-field-error-text" role="alert">
          {error}
        </p>
      : hint ?
        <p className="mc-field-hint">{hint}</p>
      : null}
    </div>
  );
}

type InputProps = Omit<React.ComponentPropsWithoutRef<"input">, "className"> & {
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  tone?: Tone;
  className?: string;
  inputClassName?: string;
};

export function TextField({
  label,
  hint,
  error,
  tone = "light",
  className,
  inputClassName,
  id,
  required,
  ...props
}: InputProps) {
  const fieldId =
    id ?? (typeof props.name === "string" ? props.name : undefined);
  return (
    <FieldShell
      label={label}
      htmlFor={fieldId}
      required={required}
      hint={hint}
      error={error}
      tone={tone}
      className={className}
    >
      <input
        id={fieldId}
        required={required}
        aria-invalid={error ? true : undefined}
        className={cn(
          "mc-field",
          tone === "dark" && "mc-field-dark",
          error && "mc-field-error",
          inputClassName,
        )}
        {...props}
      />
    </FieldShell>
  );
}

type TextAreaProps = Omit<
  React.ComponentPropsWithoutRef<"textarea">,
  "className"
> & {
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  tone?: Tone;
  className?: string;
  inputClassName?: string;
};

export function TextAreaField({
  label,
  hint,
  error,
  tone = "light",
  className,
  inputClassName,
  id,
  required,
  ...props
}: TextAreaProps) {
  const fieldId =
    id ?? (typeof props.name === "string" ? props.name : undefined);
  return (
    <FieldShell
      label={label}
      htmlFor={fieldId}
      required={required}
      hint={hint}
      error={error}
      tone={tone}
      className={className}
    >
      <textarea
        id={fieldId}
        required={required}
        aria-invalid={error ? true : undefined}
        className={cn(
          "mc-field",
          tone === "dark" && "mc-field-dark",
          error && "mc-field-error",
          inputClassName,
        )}
        {...props}
      />
    </FieldShell>
  );
}
