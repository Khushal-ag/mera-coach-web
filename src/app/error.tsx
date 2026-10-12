"use client";

import Link from "next/link";

import { StatusHomeLink, StatusPanel } from "@/components/status-panel";
import { siteConfig } from "@/config/site";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <StatusPanel
      code="Error"
      title="Something went wrong"
      description="An unexpected error occurred. You can try again or return home."
    >
      <button type="button" onClick={reset} className="mc-btn-primary">
        Try again
      </button>
      <StatusHomeLink variant="secondary" />
      <Link
        href={siteConfig.links.coaches}
        className="text-sm font-semibold text-mc-secondary hover:underline"
      >
        Find a coach
      </Link>
    </StatusPanel>
  );
}
