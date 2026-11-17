import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/admin-shell";
import { RequireAdmin } from "@/components/admin/require-admin";

export const metadata: Metadata = {
  title: "Admin",
};

/** Browser admin session: not eligible for instant navigations. */
export const instant = false;

export default function AdminAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAdmin>
      <AdminShell>{children}</AdminShell>
    </RequireAdmin>
  );
}
