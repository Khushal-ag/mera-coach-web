/**
 * Public support and contact details for the Mera Coach website.
 * Edit values here. Social URLs stay in `env.ts`.
 */

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/** Public contact inbox (app-aligned). */
export const SUPPORT_EMAIL = "info@mera-coach.com";

/** WhatsApp wa.me digits (country code + number, no +). */
export const CONTACT_WHATSAPP = digitsOnly("917017730688");

export const CONTACT_WHATSAPP_DISPLAY = "+91 70177 30688";

export const CONTACT_ADDRESS_LINE1 = "Mera Coach HQ,";

export const CONTACT_ADDRESS_LINE2 = "New Delhi, India";

export const SUPPORT_HOURS = "Mon–Sat: 9am – 6pm";

export const CONTACT_RESPONSE_TIME = "Within 24 hours";

export const CONTACT_BASED_IN = "India, serving globally";

export function supportEmail(): string {
  return SUPPORT_EMAIL;
}

export function contactWhatsAppDisplay(): string {
  return CONTACT_WHATSAPP_DISPLAY;
}

export function mailtoSupport(subject = "Mera Coach Support"): string {
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

export function contactWhatsAppUrl(): string {
  return `https://wa.me/${CONTACT_WHATSAPP}`;
}
