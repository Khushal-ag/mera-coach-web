import { Children, isValidElement, useId } from "react";

import type { ReactNode } from "react";

import type { MenuOption } from "@/components/ui/menu-select";

import { MenuSelect } from "@/components/ui/menu-select";
import { cn } from "@/lib/utils";

type Tone = "light" | "dark";

type FieldShellProps = {
  label: React.ReactNode;
  labelId?: string;
  htmlFor?: string;
  required?: boolean;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
};

function FieldShell({
  label,
  labelId,
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
        id={labelId}
        htmlFor={htmlFor}
        className={cn(
          "mc-field-label",
          tone === "dark" && "mc-field-label-dark",
        )}
      >
        {label}
        {required ?
          <span className="text-mc-primary"> *</span>
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
  const autoId = useId();
  const fieldId = id ?? (typeof props.name === "string" ? props.name : autoId);
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
  const autoId = useId();
  const fieldId = id ?? (typeof props.name === "string" ? props.name : autoId);
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

type SelectValue = string | number | readonly string[];

type SelectProps = {
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  tone?: Tone;
  className?: string;
  inputClassName?: string;
  id?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  value?: SelectValue;
  defaultValue?: SelectValue;
  onChange?: (event: { target: { value: string; name: string } }) => void;
  children: React.ReactNode;
};

function optionLabel(node: unknown): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(optionLabel).join("");
  return "";
}

function optionsFromChildren(children: ReactNode): MenuOption[] {
  const options: MenuOption[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child) || child.type !== "option") return;
    const props = child.props as {
      value?: string | number;
      disabled?: boolean;
      children?: ReactNode;
    };
    const label = optionLabel(props.children).trim();
    options.push({
      value: props.value == null ? label : String(props.value),
      label,
      disabled: props.disabled,
    });
  });
  return options;
}

function singleValue(value: SelectValue | undefined): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "string" || typeof value === "number")
    return String(value);
  return value[0] == null ? "" : String(value[0]);
}

export function SelectField({
  label,
  hint,
  error,
  tone = "light",
  className,
  inputClassName,
  id,
  name,
  required,
  disabled,
  value,
  defaultValue,
  onChange,
  children,
}: SelectProps) {
  const autoId = useId();
  const fieldId = id ?? name ?? autoId;
  const labelId = `${fieldId}-label`;
  return (
    <FieldShell
      label={label}
      labelId={labelId}
      htmlFor={fieldId}
      required={required}
      hint={hint}
      error={error}
      tone={tone}
      className={className}
    >
      <MenuSelect
        id={fieldId}
        aria-labelledby={labelId}
        name={name}
        required={required}
        disabled={disabled}
        tone={tone}
        invalid={Boolean(error)}
        className={inputClassName}
        options={optionsFromChildren(children)}
        value={singleValue(value)}
        defaultValue={singleValue(defaultValue)}
        onChange={onChange}
      />
    </FieldShell>
  );
}
