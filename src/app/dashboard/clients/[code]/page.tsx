import { ClientDetailView } from "@/components/practice/views/client-detail";

/** Browser coach session — not eligible for instant navigations. */
export const instant = false;

export default function Page() {
  return <ClientDetailView />;
}
