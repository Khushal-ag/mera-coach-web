import {
  AGE_MAX,
  AGE_MIN,
  EMAIL_REGEX,
  HEIGHT_CM_MAX,
  HEIGHT_CM_MIN,
  WEIGHT_KG_MAX,
  WEIGHT_KG_MIN,
} from "@/constants/validation";

/** Form rules shared with mera-coach-app `utils/validation`, so web and app accept the same input. */

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

export function validateEmail(value: string, required = false): string | null {
  const trimmed = value.trim();
  if (!trimmed) return required ? "Email address is required." : null;
  return isValidEmail(trimmed) ? null : "Please enter a valid email address.";
}

export function validateAge(value: string): string | null {
  if (!value.trim()) return "Age is required.";
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

export const CLIENT_PROFILE_PHOTO_REQUIRED =
  "Client profile photo is required.";

/** Add client and checkup (when no Document API PROFILE_PIC yet). */
export function validateClientProfilePhoto(options: {
  hasExistingProfilePhoto: boolean;
  hasPendingPhoto: boolean;
}): string | null {
  if (options.hasExistingProfilePhoto || options.hasPendingPhoto) return null;
  return CLIENT_PROFILE_PHOTO_REQUIRED;
}
