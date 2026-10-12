import { ClientsListView } from "@/components/practice/views/clients-list";

/** Browser coach session — not eligible for instant navigations. */
export const instant = false;

export default function Page() {
  return <ClientsListView />;
}
