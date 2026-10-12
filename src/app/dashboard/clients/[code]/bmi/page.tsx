import { ClientBmiReportView } from "@/components/practice/views/client-bmi-report";

/** Browser coach session — not eligible for instant navigations. */
export const instant = false;

export default function Page() {
  return <ClientBmiReportView />;
}
