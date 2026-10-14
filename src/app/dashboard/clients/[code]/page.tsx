import { Suspense } from "react";

import { ClientDetailView } from "@/components/practice/views/client-detail";
import { ClientProfilePageSkeleton } from "@/components/skeletons/client-profile-skeleton";

/** Browser coach session — not eligible for instant navigations. */
export const instant = false;

export default function Page() {
  return (
    <Suspense fallback={<ClientProfilePageSkeleton />}>
      <ClientDetailView />
    </Suspense>
  );
}
