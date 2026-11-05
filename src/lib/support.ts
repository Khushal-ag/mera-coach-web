import {
  supportEmail as getSupportEmail,
  mailtoSupport,
  SUPPORT_EMAIL,
} from "@/config/contact";

/** Match mera-coach-app `SUPPORT_EMAIL` / support mailto helpers. */

export const supportEmail = getSupportEmail();

export function supportMailto(subject = "Mera Coach Support"): string {
  return mailtoSupport(subject);
}

export function accountDeletionMailto(): string {
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    "Account deletion request",
  )}&body=${encodeURIComponent(
    "Please delete my Mera Coach coach account and associated data.\n\nRegistered email or mobile:\n",
  )}`;
}
