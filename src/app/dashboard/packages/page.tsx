import { PackagesListView } from "@/components/practice/views/packages-list";

/** Browser coach session — not eligible for instant navigations. */
export const instant = false;

export default function Page() {
  return <PackagesListView />;
}
