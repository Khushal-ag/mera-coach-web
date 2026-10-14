/** Form rules shared with mera-coach-app `utils/validation`, so web and app accept the same input. */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const HEIGHT_CM_MIN = 100;
const HEIGHT_CM_MAX = 250;
const WEIGHT_KG_MIN = 20;
const WEIGHT_KG_MAX = 200;
const AGE_MIN = 5;
const AGE_MAX = 100;

const isStrictInt = (value: string) => /^\d+$/.test(value.trim());
const isStrictNumber = (value: string) => /^\d+(\.\d+)?$/.test(value.trim());

function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

/** Indian mobile: 10 digits starting 6 to 9. */
export function isValidMobile(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 && /^[6-9]/.test(digits);
}

export function validateRequired(value: string, label: string): string | null {
  return value.trim() ? null : `${label} is required.`;
}

export function validateMobile(value: string, required = true): string | null {
  const trimmed = value.trim();
  if (!trimmed) return required ? "Mobile number is required." : null;
  return isValidMobile(trimmed) ? null : (
      "Please enter a valid 10-digit mobile number (starting with 6-9)."
    );
}

export function validateEmail(value: string, required = false): string | null {
  const trimmed = value.trim();
  if (!trimmed) return required ? "Email address is required." : null;
  return isValidEmail(trimmed) ? null : "Please enter a valid email address.";
}

export function validateAge(value: string): string | null {
  const message = `Please enter a valid age (${AGE_MIN}-${AGE_MAX}).`;
  if (!isStrictInt(value)) return message;
  const age = parseInt(value, 10);
  return age < AGE_MIN || age > AGE_MAX ? message : null;
}

export function validateHeight(value: string): string | null {
  if (!value.trim()) return "Height is required.";
  const message = `Please enter height between ${HEIGHT_CM_MIN}-${HEIGHT_CM_MAX} cm.`;
  if (!isStrictNumber(value)) return message;
  const h = parseFloat(value);
  return h < HEIGHT_CM_MIN || h > HEIGHT_CM_MAX ? message : null;
}

export function validateWeight(value: string): string | null {
  if (!value.trim()) return "Weight is required.";
  const message = `Please enter weight between ${WEIGHT_KG_MIN}-${WEIGHT_KG_MAX} kg.`;
  if (!isStrictNumber(value)) return message;
  const w = parseFloat(value);
  return w < WEIGHT_KG_MIN || w > WEIGHT_KG_MAX ? message : null;
}
