/** Public reads for server pages. Client code imports `@/lib/api/<feature>`. */

export { firstApiError, isApiSuccess } from "@/lib/api/normalize";

export {
  fetchCoachProfile,
  fetchPublicCities,
  fetchPublicCoaches,
} from "@/lib/api/coach";

export { fetchCoachCategories } from "@/lib/api/master";

export { fetchPremiumPlans } from "@/lib/api/premium";

export { fetchFeedbackContext } from "@/lib/api/feedback";
