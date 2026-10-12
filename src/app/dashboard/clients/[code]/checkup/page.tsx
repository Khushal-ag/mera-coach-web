import { ClientCheckupView } from "@/components/practice/views/client-checkup";

/** Browser coach session — not eligible for instant navigations. */
export const instant = false;

export default function Page() {
  return <ClientCheckupView />;
}
