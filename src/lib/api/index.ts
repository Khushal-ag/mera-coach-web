/**
 * Feature-wise API surface for the Mera Coach website.
 * Prefer importing from `@/lib/api/coach` (etc.) in new code; this barrel
 * keeps existing call sites tidy.
 */

export { firstApiError, isApiSuccess } from "@/lib/api/normalize";

export {
  fetchCoachProfile,
  fetchPublicCities,
  fetchPublicCoaches,
  registerCoach,
  submitBmiLead,
  submitCoachEnquiry,
  updateCoachMedia,
} from "@/lib/api/coach";

export {
  fetchCoachCategories,
  fetchServicesForCategory,
  type MasterOption,
} from "@/lib/api/master";

export {
  confirmPremiumOrder,
  createPremiumOrder,
  fetchPremiumPlans,
} from "@/lib/api/premium";

export { fetchFeedbackContext, submitFeedback } from "@/lib/api/feedback";

export { uploadCoachDocument } from "@/lib/api/document";
