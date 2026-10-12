import { EventsListView } from "@/components/practice/views/events-list";

/** Browser coach session — not eligible for instant navigations. */
export const instant = false;

export default function Page() {
  return <EventsListView />;
}
