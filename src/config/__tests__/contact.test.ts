import { describe, expect, it } from "bun:test";

import {
  CONTACT_WHATSAPP,
  CONTACT_WHATSAPP_DISPLAY,
  contactWhatsAppUrl,
  SUPPORT_EMAIL,
} from "../contact";

describe("contact config", () => {
  it("exposes email and WhatsApp-only support channels", () => {
    expect(SUPPORT_EMAIL).toBe("info@mera-coach.com");
    expect(CONTACT_WHATSAPP).toBe("917017730688");
    expect(CONTACT_WHATSAPP_DISPLAY).toBe("+91 70177 30688");
    expect(contactWhatsAppUrl()).toBe("https://wa.me/917017730688");
  });
});
