/**
 * Feature-wise API surface for the Mera Coach website.
 * Prefer importing from `@/lib/api/coach` (etc.) in new code; this barrel
 * keeps existing call sites tidy.
 */

export { apiFetch } from "@/lib/api/client";
export { firstApiError, isApiSuccess } from "@/lib/api/normalize";
export {
  ApiRequestError,
  type ApiError,
  type GenericResponse,
} from "@/lib/api/types";

export {
  fetchCoachProfile,
  fetchPublicCities,
  fetchPublicCoaches,
  normalizePublicList,
  registerCoach,
  submitCoachEnquiry,
  updateCoachMedia,
} from "@/lib/api/coach";

export { loginCoach } from "@/lib/api/auth";

export {
  confirmPremiumOrder,
  createPremiumOrder,
  fetchPremiumPlans,
} from "@/lib/api/premium";

export { fetchFeedbackContext, submitFeedback } from "@/lib/api/feedback";

export { uploadCoachDocument } from "@/lib/api/document";

export type {
  CoachEnquiryInput,
  CoachMediaUpdateInput,
  CoachProfile,
  CoachPublicListItem,
  CoachPublicPagedResult,
  CoachRegisterInput,
  CoachRegisterResult,
} from "@/types/coach";

export type {
  CoachCatalogPlan,
  CoachPremiumCatalog,
  CoachPremiumOrder,
  CoachSuggestedPromo,
  ConfirmPremiumOrderInput,
  CreatePremiumOrderInput,
} from "@/types/premium";

export type { CoachLoginInput, CoachLoginResult } from "@/types/auth";
export type { FeedbackContext, FeedbackSubmitInput } from "@/types/feedback";
export type {
  CoachDocType,
  UploadDocumentInput,
  UploadDocumentResult,
} from "@/types/document";
