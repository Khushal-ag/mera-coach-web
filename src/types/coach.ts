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

/** Coach-defined offer shown on the public digital profile. */
export type CoachPackage = {
  id: string;
  name: string;
  price: string;
  duration: string;
  description: string;
  imageUrl?: string;
};

/** Coach-hosted event for public showcase. */
export type CoachEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  link: string;
  imageUrl?: string;
};

export type CoachProfile = {
  coachId: number;
  coachCode: string;
  coachName: string;
  businessName?: string | null;
  coachTypeCode?: string | null;
  coachTypeName?: string | null;
  city_Cd?: string | null;
  state_Cd?: string | null;
  country_Cd?: string | null;
  locality?: string | null;
  add_Line?: string | null;
  tagline?: string | null;
  coachDesc?: string | null;
  profile_Pic_Url?: string | null;
  logo_Url?: string | null;
  serviceNames?: string | null;
  experienceYears?: number;
  happyClientCount?: number;
  certificationCount?: number;
  localLanguage?: string | null;
  rating?: number;
  reviewCount?: number;
  isProfileVisible?: boolean;
  email?: string | null;
  /** Present on profile-by-id; used for WhatsApp CTA. */
  mobile?: string | null;
  pinCode?: string | null;
  serviceCodes?: string[];
  bmiReportTemplate?: string | null;
  dietChartTemplate?: string | null;
  missingPublicFields?: string[];
  packages?: CoachPackage[];
  events?: CoachEvent[];
};

export type CoachRegisterResult = {
  coachId: number;
  coachCode: string;
  plainPassword?: string;
};

/** Patch media URLs after Document upload (CoachId > 0). */
export type CoachMediaUpdateInput = {
  coachId: number;
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

export type CoachRegisterInput = {
  coachName: string;
  mobile: string;
  email: string;
  coachTypeCode?: string;
  businessName?: string;
  add_Line?: string;
  city_Cd?: string;
  state_Cd?: string;
  pinCode?: string;
  coachDesc?: string;
};
