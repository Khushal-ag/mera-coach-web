import type { CoachCatalogPlan, CoachSuggestedPromo } from "@/types/premium";

function groupIndianDigits(intPart: string): string {
  const negative = intPart.startsWith("-");
  const digits = negative ? intPart.slice(1) : intPart;
  if (digits.length <= 3) return intPart;
  const head = digits.slice(0, -3);
  const tail = digits.slice(-3);
  const groupedHead = head.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${negative ? "-" : ""}${groupedHead},${tail}`;
}

/** Rupee amount. Whole rupees omit paise; anything else shows two decimals. */
export function formatInr(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  const negative = rounded < 0;
  const abs = Math.abs(rounded);
  const parts = abs.toFixed(2).split(".");
  const whole = parts[0] ?? "0";
  const frac = parts[1] ?? "00";
  const grouped = groupIndianDigits(whole);
  const showFrac = frac !== "00";
  return `${negative ? "-" : ""}₹${grouped}${showFrac ? `.${frac}` : ""}`;
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function planMonthlyRate(plan: CoachCatalogPlan): number {
  const months = plan.durationMonths > 0 ? plan.durationMonths : 1;
  return plan.basePrice / months;
}

export function planPayableMonthly(plan: CoachCatalogPlan): number {
  const months = plan.durationMonths > 0 ? plan.durationMonths : 1;
  return plan.finalPrice / months;
}

export function planShowsDiscount(plan: CoachCatalogPlan): boolean {
  return plan.basePrice - plan.finalPrice > 0.009;
}

export function planDiscountOffPercent(plan: CoachCatalogPlan): number | null {
  if (!planShowsDiscount(plan) || plan.basePrice <= 0) return null;
  const computed = ((plan.basePrice - plan.finalPrice) / plan.basePrice) * 100;
  const fromPrices = Math.round(computed);
  if (fromPrices <= 0) return null;
  if (
    plan.discountPercent > 0 &&
    Math.abs(plan.discountPercent - computed) < 0.5
  ) {
    const fromApi = Math.round(plan.discountPercent);
    if (fromApi > 0) return fromApi;
  }
  return fromPrices;
}

export type CheckoutQuote = {
  /** Plan list price before plan discount (BasePrice). */
  originalAmount: number;
  /** Plan customer price before promo (FinalPrice). */
  planAmount: number;
  /** Amount charged after matching promo, else planAmount. */
  payableAmount: number;
  planDiscountAmount: number;
  planDiscountPercent: number | null;
  promoApplied: boolean;
  promoDiscountAmount: number;
  promoDiscountPercent: number | null;
  promoCode: string | null;
};

/** Mirror meracoachapi PremiumPricing.TryQuote for UI breakdown only. */
export function quoteCheckout(
  plan: CoachCatalogPlan | undefined,
  promo: CoachSuggestedPromo | null | undefined,
  promoCode: string,
): CheckoutQuote | null {
  if (!plan) return null;

  const planAmount = roundMoney(plan.finalPrice);
  const originalAmount = roundMoney(
    plan.basePrice > 0 ? plan.basePrice : plan.finalPrice,
  );
  const planDiscountAmount = roundMoney(
    Math.max(0, originalAmount - planAmount),
  );
  const planDiscountPercent = planDiscountOffPercent(plan);

  const code = promoCode.trim();
  let payableAmount = planAmount;
  let promoApplied = false;
  let promoDiscountAmount = 0;
  let promoDiscountPercent: number | null = null;
  let appliedCode: string | null = null;

  if (code && promo?.code && code.toUpperCase() === promo.code.toUpperCase()) {
    const type = promo.discountType.toUpperCase();
    if (
      type === "PERCENT" ||
      type === "PERCENTAGE" ||
      type === "PCT" ||
      type === "%"
    ) {
      payableAmount = roundMoney(
        (planAmount * (100 - promo.discountValue)) / 100,
      );
      promoDiscountPercent =
        promo.discountValue > 0 ? Math.round(promo.discountValue) : null;
    } else {
      payableAmount = roundMoney(planAmount - promo.discountValue);
    }
    promoDiscountAmount = roundMoney(Math.max(0, planAmount - payableAmount));
    if (promoDiscountAmount > 0.009) {
      promoApplied = true;
      appliedCode = promo.code;
      if (
        promoDiscountPercent == null &&
        planAmount > 0 &&
        promoDiscountAmount > 0
      ) {
        promoDiscountPercent = Math.round(
          (promoDiscountAmount / planAmount) * 100,
        );
      }
    }
  }

  return {
    originalAmount,
    planAmount,
    payableAmount,
    planDiscountAmount,
    planDiscountPercent,
    promoApplied,
    promoDiscountAmount,
    promoDiscountPercent,
    promoCode: appliedCode,
  };
}
