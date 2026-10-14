"use client";

import dynamic from "next/dynamic";

import { ClientCheckupSkeleton } from "@/components/skeletons/client-profile-skeleton";

/** Checkup / diet / add-client wizard. Loaded only on those dashboard routes. */
export const AssessmentWizardLazy = dynamic(
  () =>
    import("@/components/assessment/assessment-wizard").then(
      (mod) => mod.AssessmentWizard,
    ),
  {
    loading: () => <ClientCheckupSkeleton />,
  },
);
