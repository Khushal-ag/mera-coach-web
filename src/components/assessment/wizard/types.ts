import type {
  PracticeBackLink,
  PracticeCrumb,
} from "@/components/practice/page-header";
import type { AssessmentFormState, AssessmentIds } from "@/types/practice";

export type WizardFlow = "add" | "checkup" | "dietPlan";

export type WizardProps = {
  flow: WizardFlow;
  coachCode: string;
  savedBy: string;
  countryCd?: string;
  initialForm?: AssessmentFormState;
  initialIds?: AssessmentIds;
  title: string;
  description?: string;
  crumbs?: PracticeCrumb[];
  back?: PracticeBackLink;
  finishRedirect?: (ids: AssessmentIds) => string;
  onFinished?: (ids: AssessmentIds) => void;
  /** Skip the page title so a parent shell (client profile tabs) stays put. */
  embedded?: boolean;
};

export type PhaseId =
  "identity" | "lifestyle" | "meals" | "bmi" | "diet" | "complete";
