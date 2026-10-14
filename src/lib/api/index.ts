/** Public reads for server pages. Client code imports `@/lib/api/<feature>`. */

export { firstApiError, isApiSuccess } from "@/lib/api/normalize";

export { fetchCoachProfile, fetchPublicCoaches } from "@/lib/api/coach";

export { fetchPremiumPlans } from "@/lib/api/premium";

export { fetchFeedbackContext } from "@/lib/api/feedback";
