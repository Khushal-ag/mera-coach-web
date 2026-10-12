import type { GenericResponse } from "@/lib/api/types";
import type {
  CoachCatalogPlan,
  CoachPremiumCatalog,
  CoachPremiumOrder,
  CoachSuggestedPromo,
  ConfirmPremiumOrderInput,
  CreatePremiumOrderInput,
} from "@/types/premium";

import { apiFetch } from "@/lib/api/client";
import { pick } from "@/lib/api/normalize";

function normalizeCatalog(raw: unknown): CoachPremiumCatalog {
  if (!raw || typeof raw !== "object") {
    return { plans: [], promo: null };
  }
  const root = raw as Record<string, unknown>;
  const plansRaw = (pick<unknown[]>(root, "plans", "Plans") ?? []) as unknown[];
  const plans = plansRaw.map((row) => {
    const r = (row ?? {}) as Record<string, unknown>;
    return {
      planId: Number(pick(r, "planId", "PlanId") ?? 0),
      planName: String(pick(r, "planName", "PlanName") ?? ""),
      durationMonths: Number(pick(r, "durationMonths", "DurationMonths") ?? 0),
      basePrice: Number(pick(r, "basePrice", "BasePrice") ?? 0),
      discountPercent: Number(
        pick(r, "discountPercent", "DiscountPercent") ?? 0,
      ),
      finalPrice: Number(pick(r, "finalPrice", "FinalPrice") ?? 0),
    } satisfies CoachCatalogPlan;
  });
  const promoRaw = pick<Record<string, unknown> | null>(root, "promo", "Promo");
  const promoCode =
    promoRaw ? String(pick(promoRaw, "code", "Code") ?? "").trim() : "";
  const promo: CoachSuggestedPromo | null =
    promoRaw && promoCode ?
      {
        code: promoCode,
        description: String(pick(promoRaw, "description", "Description") ?? ""),
        discountType: String(
          pick(promoRaw, "discountType", "DiscountType") ?? "",
        ),
        discountValue: Number(
          pick(promoRaw, "discountValue", "DiscountValue") ?? 0,
        ),
      }
    : null;
  const featuresRaw = pick<unknown[]>(root, "features", "Features");
  const features =
    Array.isArray(featuresRaw) ?
      featuresRaw.map((f) => String(f).trim()).filter(Boolean)
    : undefined;
  return { plans, promo, features };
}

function normalizeOrder(raw: unknown): CoachPremiumOrder | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  return {
    orderId: String(pick(r, "orderId", "OrderId") ?? ""),
    coachId: Number(pick(r, "coachId", "CoachId") ?? 0),
    planId: Number(pick(r, "planId", "PlanId") ?? 0),
    planName: String(pick(r, "planName", "PlanName") ?? ""),
    durationMonths: Number(pick(r, "durationMonths", "DurationMonths") ?? 0),
    amount: Number(pick(r, "amount", "Amount") ?? 0),
    currency: String(pick(r, "currency", "Currency") ?? "INR"),
    promoCode: pick<string | null>(r, "promoCode", "PromoCode") ?? null,
    status: String(pick(r, "status", "Status") ?? ""),
    periodStart: pick<string | null>(r, "periodStart", "PeriodStart") ?? null,
    periodEnd: pick<string | null>(r, "periodEnd", "PeriodEnd") ?? null,
    isPaid: Boolean(pick(r, "isPaid", "IsPaid") ?? false),
    razorpayOrderId:
      pick<string | null>(r, "razorpayOrderId", "RazorpayOrderId") ?? null,
    keyId: pick<string | null>(r, "keyId", "KeyId") ?? null,
    error: pick<string | null>(r, "error", "Error") ?? null,
  };
}

export async function fetchPremiumPlans() {
  const response = await apiFetch<unknown>("/v1/Coach/premium-plans", {
    next: { revalidate: 120 },
  });
  return {
    ...response,
    responseObj: normalizeCatalog(response.responseObj),
  } satisfies GenericResponse<CoachPremiumCatalog>;
}

export async function createPremiumOrder(body: CreatePremiumOrderInput) {
  const response = await apiFetch<unknown>("/v1/Coach/premium-order", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return {
    ...response,
    responseObj: normalizeOrder(response.responseObj),
  } satisfies GenericResponse<CoachPremiumOrder>;
}

export async function confirmPremiumOrder(body: ConfirmPremiumOrderInput) {
  const response = await apiFetch<unknown>("/v1/Coach/premium-confirm", {
    method: "POST",
    body: JSON.stringify({
      orderId: body.orderId,
      coachId: body.coachId,
      coachCode: body.coachCode,
      planId: body.planId,
      amount: body.amount,
      promoCode: body.promoCode,
      razorpayOrderId: body.razorpayOrderId,
      razorpayPaymentId: body.razorpayPaymentId,
      razorpaySignature: body.razorpaySignature,
    }),
  });
  return {
    ...response,
    responseObj: normalizeOrder(response.responseObj),
  } satisfies GenericResponse<CoachPremiumOrder>;
}
