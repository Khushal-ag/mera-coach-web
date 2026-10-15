import { SUPPORT_EMAIL } from "@/constants/support";

/** Match mera-coach-app `SUPPORT_EMAIL` / support mailto helpers. */

export const supportEmail = SUPPORT_EMAIL;

export function supportMailto(subject = "Mera Coach Support"): string {
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

export function accountDeletionMailto(): string {
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    "Account deletion request",
  )}&body=${encodeURIComponent(
    "Please delete my Mera Coach coach account and associated data.\n\nRegistered email or mobile:\n",
  )}`;
}
