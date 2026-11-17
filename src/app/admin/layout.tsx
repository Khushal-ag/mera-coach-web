import type { Metadata } from "next";

/** Keep the ops console out of search indexes. Manual URL only. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
