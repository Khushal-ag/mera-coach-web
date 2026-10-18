/** The rule for a password a coach chooses (registration, reset, change). The API enforces the same rule. */
export const PASSWORD_RULE =
  "Password must be at least 8 characters and include a letter and a number.";

/** Returns the message to show, or null when the password is fine. */
export function passwordPolicyError(value: string): string | null {
  if (value.length < 8) return PASSWORD_RULE;
  if (value.length > 100) return "Password is too long.";
  return /[A-Za-z]/.test(value) && /\d/.test(value) ? null : PASSWORD_RULE;
}
