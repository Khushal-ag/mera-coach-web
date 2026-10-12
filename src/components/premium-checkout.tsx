"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

import type { CoachCatalogPlan, CoachSuggestedPromo } from "@/types/premium";

import { AlertBanner } from "@/components/ui/alert-banner";
import { TextField } from "@/components/ui/field";
import {
  confirmPremiumOrder,
  createPremiumOrder,
  fetchCoachProfile,
  firstApiError,
  isApiSuccess,
} from "@/lib/api";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}

type Props = {
  plans: CoachCatalogPlan[];
  promo?: CoachSuggestedPromo | null;
  initialCoachId?: number;
  initialCoachCode?: string;
};

type RazorpaySuccess = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

/** Mirror meracoachapi PremiumPricing.TryQuote for UI estimate only. */
function estimatePayable(
  plan: CoachCatalogPlan | undefined,
  promo: CoachSuggestedPromo | null | undefined,
  promoCode: string,
): number | null {
  if (!plan) return null;
  const code = promoCode.trim();
  let amount = plan.finalPrice;
  if (code && promo?.code && code.toUpperCase() === promo.code.toUpperCase()) {
    const type = promo.discountType.toUpperCase();
    if (type === "PERCENT" || type === "PCT" || type === "%") {
      amount = (plan.finalPrice * (100 - promo.discountValue)) / 100;
    } else {
      amount = plan.finalPrice - promo.discountValue;
    }
  }
  return Math.round(amount * 100) / 100;
}

async function resolveCoachId(
  coachIdInput: string,
  coachCodeInput: string,
): Promise<{ coachId: number; coachCode?: string; error?: string }> {
  const parsed = Number(coachIdInput);
  const code = coachCodeInput.trim();

  if (Number.isFinite(parsed) && parsed > 0) {
    return { coachId: Math.trunc(parsed), coachCode: code || undefined };
  }

  if (!code) {
    return {
      coachId: 0,
      error: "Enter your coach ID (from the app Pay Now link) or coach code.",
    };
  }

  try {
    const profileRes = await fetchCoachProfile({ coachCode: code });
    if (!isApiSuccess(profileRes) || !profileRes.responseObj?.coachId) {
      return {
        coachId: 0,
        error:
          firstApiError(profileRes) ??
          "Could not resolve that coach code. Open Pay Now from the app, or enter your numeric coach ID.",
      };
    }
    return {
      coachId: profileRes.responseObj.coachId,
      coachCode: profileRes.responseObj.coachCode || code,
    };
  } catch (error) {
    return {
      coachId: 0,
      error:
        error instanceof Error ?
          error.message
        : "Could not look up coach code.",
    };
  }
}

export function PremiumCheckout({
  plans,
  promo,
  initialCoachId = 0,
  initialCoachCode = "",
}: Props) {
  const router = useRouter();
  const fromApp = initialCoachId > 0 || Boolean(initialCoachCode.trim());
  const [coachId, setCoachId] = useState(
    initialCoachId > 0 ? String(initialCoachId) : "",
  );
  const [coachCode, setCoachCode] = useState(initialCoachCode);
  const [planId, setPlanId] = useState(plans[0] ? String(plans[0].planId) : "");
  const [promoCode, setPromoCode] = useState(promo?.code ?? "");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

  const selected = useMemo(
    () => plans.find((p) => String(p.planId) === planId) ?? plans[0],
    [plans, planId],
  );

  const estimated = estimatePayable(selected, promo, promoCode);

  async function startCheckout() {
    setStatus("loading");
    setMessage(null);

    if (!selected) {
      setStatus("error");
      setMessage("Select a premium plan.");
      return;
    }

    const resolved = await resolveCoachId(coachId, coachCode);
    if (resolved.error || resolved.coachId <= 0) {
      setStatus("error");
      setMessage(resolved.error ?? "Coach is required.");
      return;
    }

    // Keep UI in sync when we resolved code → id
    setCoachId(String(resolved.coachId));
    if (resolved.coachCode) setCoachCode(resolved.coachCode);

    try {
      // Do not send client amount — API quotes server-side (promo-safe).
      const orderRes = await createPremiumOrder({
        coachId: resolved.coachId,
        coachCode: resolved.coachCode,
        planId: selected.planId,
        promoCode: promoCode.trim() || undefined,
      });

      if (!isApiSuccess(orderRes)) {
        setStatus("error");
        setMessage(
          firstApiError(orderRes) ??
            orderRes.responseObj?.error ??
            "Could not create order.",
        );
        return;
      }

      const order = orderRes.responseObj;
      if (!order) {
        setStatus("error");
        setMessage("Could not create order.");
        return;
      }
      if (order.error) {
        setStatus("error");
        setMessage(order.error);
        return;
      }
      if (!order.razorpayOrderId || !order.keyId) {
        setStatus("error");
        setMessage(
          "Razorpay order was not returned. Ensure meracoachapi has Razorpay:KeyId and Razorpay:KeySecret configured.",
        );
        return;
      }
      if (!window.Razorpay || !scriptReady) {
        setStatus("error");
        setMessage("Razorpay Checkout failed to load. Refresh and try again.");
        return;
      }

      const amountPaise = Math.round(Number(order.amount) * 100);
      if (!Number.isFinite(amountPaise) || amountPaise < 100) {
        setStatus("error");
        setMessage("Invalid order amount from API.");
        return;
      }

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: amountPaise,
        currency: order.currency || "INR",
        name: "Mera Coach",
        description: `${order.planName} · ${order.durationMonths} months`,
        order_id: order.razorpayOrderId,
        handler: async (raw: unknown) => {
          const response = raw as RazorpaySuccess;
          setStatus("loading");
          setMessage("Confirming payment…");
          try {
            const confirmRes = await confirmPremiumOrder({
              orderId: order.orderId,
              coachId: order.coachId || resolved.coachId,
              coachCode: resolved.coachCode,
              planId: order.planId,
              amount: order.amount,
              promoCode: order.promoCode ?? undefined,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            if (!isApiSuccess(confirmRes) || !confirmRes.responseObj?.isPaid) {
              setStatus("error");
              setMessage(
                firstApiError(confirmRes) ??
                  confirmRes.responseObj?.error ??
                  "Payment received but confirmation failed. Contact support with your Razorpay payment ID.",
              );
              return;
            }
            const periodEnd = confirmRes.responseObj.periodEnd;
            const qs = new URLSearchParams({
              orderId: confirmRes.responseObj.orderId,
              plan: confirmRes.responseObj.planName,
            });
            if (periodEnd) qs.set("periodEnd", periodEnd);
            if (resolved.coachId) qs.set("coachId", String(resolved.coachId));
            if (resolved.coachCode) qs.set("coachCode", resolved.coachCode);
            router.push(`/premium/success?${qs.toString()}`);
          } catch (error) {
            setStatus("error");
            setMessage(
              error instanceof Error ?
                error.message
              : "Payment confirmation failed.",
            );
          }
        },
        theme: { color: "#f47f1e" },
        modal: {
          ondismiss: () => {
            setStatus("error");
            setMessage("Checkout was closed before payment completed.");
          },
        },
      });

      rzp.on("payment.failed", () => {
        setStatus("error");
        setMessage("Payment was not completed. You can try again when ready.");
      });

      rzp.open();
      setStatus("idle");
      setMessage("Complete payment in the Razorpay window.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Checkout could not start.",
      );
    }
  }

  return (
    <div className="space-y-6">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onError={() => {
          setScriptReady(false);
          setStatus("error");
          setMessage("Could not load Razorpay Checkout script.");
        }}
      />

      {fromApp ?
        <AlertBanner tone="info">
          Opened from the app
          {initialCoachId > 0 ? ` · coach #${initialCoachId}` : ""}
          {initialCoachCode ? ` · ${initialCoachCode}` : ""}. Choose a plan and
          pay with Razorpay.
        </AlertBanner>
      : null}

      {plans.length === 0 ?
        <AlertBanner tone="info">
          No premium plans are available from the API yet.
        </AlertBanner>
      : <div className="grid gap-4 md:grid-cols-2">
          {plans.map((plan) => {
            const active = String(plan.planId) === String(selected?.planId);
            return (
              <button
                key={plan.planId}
                type="button"
                onClick={() => setPlanId(String(plan.planId))}
                className={`min-h-11 rounded-2xl border p-4 text-left transition sm:p-5 ${
                  active ?
                    "border-mc-brand-coach bg-surface shadow-lg ring-2 ring-mc-brand-coach/25"
                  : "border-line bg-surface/80 hover:border-mc-secondary/40"
                }`}
              >
                <p className="text-xs font-semibold tracking-wide text-mc-secondary uppercase">
                  {plan.durationMonths} months
                </p>
                <h3 className="mt-1 font-display text-xl font-bold">
                  {plan.planName}
                </h3>
                <p className="mt-3 font-display text-3xl font-bold">
                  ₹{plan.finalPrice.toLocaleString("en-IN")}
                </p>
                {plan.discountPercent > 0 ?
                  <p className="mt-1 text-sm text-ink-muted">
                    <span className="line-through">
                      ₹{plan.basePrice.toLocaleString("en-IN")}
                    </span>{" "}
                    · {plan.discountPercent}% off
                  </p>
                : null}
              </button>
            );
          })}
        </div>
      }

      {promo ?
        <AlertBanner tone="info">
          Suggested promo: <strong>{promo.code}</strong>
          {promo.description ? ` · ${promo.description}` : ""}
        </AlertBanner>
      : null}

      {estimated != null && selected && estimated !== selected.finalPrice ?
        <p className="text-sm text-ink-muted">
          Estimated total with promo:{" "}
          <strong className="text-ink">
            ₹{estimated.toLocaleString("en-IN")}
          </strong>{" "}
          (final amount is always quoted by the API).
        </p>
      : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Coach ID"
          required
          value={coachId}
          onChange={(e) => setCoachId(e.target.value)}
          inputMode="numeric"
          placeholder="From the app / Pay Now link"
          readOnly={fromApp && initialCoachId > 0}
          disabled={status === "loading"}
        />
        <TextField
          label="Coach code"
          value={coachCode}
          onChange={(e) => setCoachCode(e.target.value)}
          placeholder="Used if Coach ID is missing"
          readOnly={fromApp && Boolean(initialCoachCode)}
          disabled={status === "loading"}
          hint="Resolved to a coach ID when needed"
        />
        <TextField
          className="sm:col-span-2"
          label="Promo code"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          placeholder="Optional"
          disabled={status === "loading"}
        />
      </div>

      <button
        type="button"
        onClick={startCheckout}
        disabled={status === "loading" || plans.length === 0}
        className="mc-btn-primary w-full sm:w-auto"
      >
        {status === "loading" ? "Starting checkout…" : "Pay with Razorpay"}
      </button>

      {message ?
        <AlertBanner
          tone={
            status === "success" ? "success"
            : status === "error" ?
              "error"
            : "info"
          }
        >
          {message}
        </AlertBanner>
      : null}
    </div>
  );
}
