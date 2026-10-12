import type { Metadata } from "next";

import { PracticeShell } from "@/components/practice/practice-shell";
import { RequireAuth } from "@/components/practice/require-auth";

export const metadata: Metadata = {
  title: "Coach dashboard",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <PracticeShell>{children}</PracticeShell>
    </RequireAuth>
  );
}
