"use client";

import dynamic from "next/dynamic";

import { PracticeRosterSkeleton } from "@/components/practice/page-header";

/** Checkup / diet / add-client wizard. Loaded only on those dashboard routes. */
export const AssessmentWizardLazy = dynamic(
  () =>
    import("@/components/assessment/assessment-wizard").then(
      (mod) => mod.AssessmentWizard,
    ),
  {
    loading: () => <PracticeRosterSkeleton rows={6} />,
  },
);
