/** Premium catalog and checkout shapes (meracoachapi Coach premium endpoints). */

export type CoachCatalogPlan = {
  planId: number;
  planName: string;
  durationMonths: number;
  basePrice: number;
  discountPercent: number;
  finalPrice: number;
};

export type CoachSuggestedPromo = {
  code: string;
  description: string;
  discountType: string;
  discountValue: number;
};

export type CoachPremiumCatalog = {
  plans: CoachCatalogPlan[];
  promo?: CoachSuggestedPromo | null;
  /** Optional feature bullets from the catalog (app Subscription screen). */
  features?: string[];
};

export type CoachPremiumOrder = {
  orderId: string;
  coachId: number;
  planId: number;
  planName: string;
  durationMonths: number;
  amount: number;
  currency: string;
  promoCode?: string | null;
  status: string;
  periodStart?: string | null;
  periodEnd?: string | null;
  isPaid: boolean;
  razorpayOrderId?: string | null;
  keyId?: string | null;
  error?: string | null;
};

export type CreatePremiumOrderInput = {
  coachId: number;
  coachCode?: string;
  planId: number;
  promoCode?: string;
  amount?: number;
};

export type ConfirmPremiumOrderInput = {
  orderId: string;
  coachId: number;
  coachCode?: string;
  planId: number;
  amount: number;
  promoCode?: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};
