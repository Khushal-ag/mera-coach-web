import { describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { readHttpsUrl } from "@/config/env";

const PLAY =
  "https://play.google.com/store/apps/details?id=com.henchsolutions.meracoach";

async function render(appLinks: { playStore?: string; appStore?: string }) {
  mock.module("@/config/env", () => ({ env: { appLinks } }));
  const { AppStoreBadges } = await import(
    `../app-store-badges?case=${Math.random()}`
  );
  return renderToStaticMarkup(<AppStoreBadges />);
}

describe("readHttpsUrl", () => {
  it("keeps an https URL and trims it", () => {
    expect(readHttpsUrl(`  ${PLAY} `)).toBe(PLAY);
  });

  it("drops anything that is not https", () => {
    expect(readHttpsUrl("http://play.google.com/x")).toBeUndefined();
    expect(readHttpsUrl("javascript:alert(1)")).toBeUndefined();
    expect(readHttpsUrl("not a url")).toBeUndefined();
    expect(readHttpsUrl("   ")).toBeUndefined();
    expect(readHttpsUrl(undefined)).toBeUndefined();
  });
});

describe("AppStoreBadges", () => {
  it("links a configured store and marks the other as coming soon", async () => {
    const html = await render({ playStore: PLAY });
    expect(html).toContain(`href="${PLAY}"`);
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain("Get the Mera Coach app on Google Play");
    expect(html).toContain("Mera Coach app on App Store: coming soon");
    expect(html).not.toContain("javascript:");
  });

  it("shows both as coming soon, with no links, when nothing is configured", async () => {
    const html = await render({});
    expect(html).not.toContain("<a ");
    expect(html.match(/Coming soon/g)).toHaveLength(2);
  });
});
