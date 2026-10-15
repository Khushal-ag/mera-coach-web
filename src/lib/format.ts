/** Small display helpers shared across the public site and the coach area. */

type InitialsOptions = {
  /** Shown when the name has no letters. */
  fallback?: string;
  /** Letters used when the name is a single word. */
  singleWordLength?: 1 | 2;
};

/** "Khushal Agarwal" becomes "KA". Punctuation around words is ignored. */
export function initials(
  name: string | null | undefined,
  { fallback = "?", singleWordLength = 1 }: InitialsOptions = {},
): string {
  const parts = (name ?? "")
    .trim()
    .split(/\s+/)
    .map((part) => part.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ""))
    .filter(Boolean);
  if (!parts.length) return fallback;
  if (parts.length === 1) {
    return parts[0]!.slice(0, singleWordLength).toLocaleUpperCase();
  }
  return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toLocaleUpperCase();
}

/** API stores "M" or "F"; show the word. Anything else is returned as is. */
export function genderLabel(value?: string | null): string {
  if (value === "M") return "Male";
  if (value === "F") return "Female";
  return value ?? "";
}
