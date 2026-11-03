/** Public coach directory and profile shapes (meracoachapi Coach responses). */

export type CoachPublicListItem = {
  coachId: number;
  coachCode: string;
  urlFriendlyName: string;
  coachName: string;
  coachTypeCode: string;
  coachTypeName: string;
  city_Cd: string;
  state_Cd: string;
  country_Cd: string;
  experienceYears: number;
  happyClientCount: number;
  profile_Pic_Url: string;
  /** Cover image for directory cards; empty when the coach has none. */
  cover_Url?: string;
  tagline: string;
  coachDesc: string;
  serviceCodes_Csv: string;
  serviceNames: string;
  rating: number;
  reviewCount: number;
  isProfileVisible: boolean;
};

export type CoachPublicPagedResult = {
  items: CoachPublicListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type CoachProfile = {
  coachId: number;
  coachCode: string;
  /** Public address segment, for example "harish-bali-health-coach-mathura". */
  urlFriendlyName?: string | null;
  coachName: string;
  businessName?: string | null;
  coachTypeCode?: string | null;
  coachTypeName?: string | null;
  /** Subscription end date (the coach ValidUpto). */
  validUpto?: string | null;
  city_Cd?: string | null;
  state_Cd?: string | null;
  country_Cd?: string | null;
  locality?: string | null;
  add_Line?: string | null;
  tagline?: string | null;
  coachDesc?: string | null;
  profile_Pic_Url?: string | null;
  logo_Url?: string | null;
  cover_Url?: string | null;
  serviceNames?: string | null;
  experienceYears?: number;
  happyClientCount?: number;
  certificationCount?: number;
  localLanguage?: string | null;
  /** Product brand for package catalog (MstProductBrand). */
  brandCode?: string | null;
  brandName?: string | null;
  bmiReportTemplate?: string | null;
  dietChartTemplate?: string | null;
  /** Days between client assessments. Defaults to 7. */
  recheckupDays?: number;
  rating?: number;
  reviewCount?: number;
  isProfileVisible?: boolean;
  email?: string | null;
  /** Present on profile-by-id; used for WhatsApp CTA. */
  mobile?: string | null;
  pinCode?: string | null;
  serviceCodes?: string[];
  missingPublicFields?: string[];
};

export type CoachRegisterResult = {
  coachId: number;
  coachCode: string;
  plainPassword?: string;
  /** Short-lived token from registration, used for photo uploads and the first profile save. */
  uploadToken?: string;
};

/** Patch media URLs after Document upload (CoachId > 0). */
export type CoachMediaUpdateInput = {
  coachId: number;
  logo_Url?: string;
  profile_Pic_Url?: string;
  cover_Url?: string;
};

export type CoachRegisterInput = {
  coachName: string;
  mobile: string;
  email: string;
  coachTypeCode: string;
  referrerMobile?: string;
};

/** Profile details saved right after registration (CoachId > 0, registration token). */
export type CoachRegisterDetailsInput = {
  coachId: number;
  businessName?: string;
  serviceCodes?: string[];
  experienceYears?: number;
  happyClientCount?: number;
  locality?: string;
  add_Line?: string;
  city_Cd?: string;
  state_Cd?: string;
  pinCode?: string;
  country_Cd?: string;
  coachDesc?: string;
  logo_Url?: string;
  profile_Pic_Url?: string;
};

export type CoachEnquiryInput = {
  coachCode: string;
  clientName: string;
  clientMobile: string;
  clientEmail?: string;
  lookingFor?: string;
};
