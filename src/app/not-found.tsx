import Link from "next/link";

import type { Metadata } from "next";

import { StatusHomeLink, StatusPanel } from "@/components/status-panel";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <StatusPanel
      code="404"
      title="Page not found"
      description="The page you requested does not exist or has been moved. Head home or browse coaches on Mera Coach."
    >
      <StatusHomeLink />
      <Link href={siteConfig.links.coaches} className="mc-btn-secondary">
        Find a coach
      </Link>
    </StatusPanel>
  );
}
