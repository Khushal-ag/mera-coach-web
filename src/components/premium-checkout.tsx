"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

import type { CoachCatalogPlan, CoachSuggestedPromo } from "@/types/premium";

import { CoachPhoto } from "@/components/coach-photo";
import { AlertBanner } from "@/components/ui/alert-banner";
import { TextField } from "@/components/ui/field";
import { fetchCoachProfile } from "@/lib/api/coach";
import { firstApiError, isApiSuccess } from "@/lib/api/normalize";
import { confirmPremiumOrder, createPremiumOrder } from "@/lib/api/premium";
import { refreshPremiumStatus } from "@/lib/auth/premium-status";
import { resolveCoachPhotoUrl } from "@/lib/media/media-url";
import {
  formatInr,
  planDiscountOffPercent,
  planPayableMonthly,
  planShowsDiscount,
  quoteCheckout,
} from "@/lib/premium-pricing";

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
  /** Session display name. The code stays internal and is never edited. */
  displayName?: string;
  /** Plan id to start on, from the app's Pay Now link. */
  initialPlanId?: string;
};

type RazorpaySuccess = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type ResolvedCoach = {
  coachId: number;
  coachCode: string;
  coachName: string;
  photo: string;
};

/**
 * Resolve coach for checkout display.
 * Prefer coachId (app Pay Now) so a mismatched/stale code cannot swap coaches.
 * profile-by-id hides non-public profiles: callers must still allow checkout
 * via deep-link coachId / coachCode when enrichment fails.
 */
async function lookupCoach(params: {
  coachId?: number;
  coachCode?: string;
}): Promise<{ coach?: ResolvedCoach; error?: string }> {
  const coachId =
    params.coachId && params.coachId > 0 ? params.coachId : undefined;
  const coachCode = params.coachCode?.trim() || undefined;
  if (!coachId && !coachCode) {
    return { error: "Coach account is missing." };
  }

  async function tryFetch(query: {
    coachId?: number;
    coachCode?: string;
  }): Promise<ResolvedCoach | undefined> {
    const profileRes = await fetchCoachProfile(query);
    const profile = profileRes.responseObj;
    if (!isApiSuccess(profileRes) || !profile?.coachId) return undefined;
    return {
      coachId: profile.coachId,
      coachCode: profile.coachCode || query.coachCode || "",
      coachName: profile.coachName || "Coach",
      photo: resolveCoachPhotoUrl(profile),
    };
  }

  try {
    // One key at a time: API prefers code when both are sent, which can
    // resolve the wrong coach if id/code are mismatched.
    if (coachId) {
      const byId = await tryFetch({ coachId });
      if (byId) {
        if (coachCode && byId.coachCode && byId.coachCode !== coachCode) {
          // Trust numeric id from the app; ignore stale code for display.
        }
        return { coach: byId };
      }
    }
    if (coachCode) {
      const byCode = await tryFetch({ coachCode });
      if (byCode) return { coach: byCode };
    }
    return {
      error:
        "Could not load that coach profile. Payment can still continue for the account that opened this page.",
    };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Could not look up coach.",
    };
  }
}

function fallbackCoachLabel(): string {
  return "Your coach account";
}

/** Matches the app: shortest active plan until the coach picks another. */
function defaultPlanId(plans: CoachCatalogPlan[]): string {
  const shortest = plans.reduce<CoachCatalogPlan | undefined>((best, plan) => {
    if (!best || plan.durationMonths < best.durationMonths) return plan;
    return best;
  }, undefined);
  return shortest ? String(shortest.planId) : "";
}

export function PremiumCheckout({
  plans,
  promo,
  initialCoachId = 0,
  initialCoachCode = "",
  displayName = "",
  initialPlanId = "",
}: Props) {
  const router = useRouter();
  const identified = initialCoachId > 0 || Boolean(initialCoachCode.trim());
  const suggestedPromo = promo?.code?.trim() ? promo : null;
  const checkoutLock = useRef(false);
  const seededName = displayName.trim();

  const [coachId, setCoachId] = useState(
    initialCoachId > 0 ? initialCoachId : 0,
  );
  const [coachCode, setCoachCode] = useState(initialCoachCode.trim());
  const [resolvedCoach, setResolvedCoach] = useState<ResolvedCoach | null>(
    seededName ?
      {
        coachId: initialCoachId > 0 ? initialCoachId : 0,
        coachCode: initialCoachCode.trim(),
        coachName: seededName,
        photo: "",
      }
    : null,
  );
  const [coachLoading, setCoachLoading] = useState(identified);
  // The app can open checkout on the plan the coach picked there; anything that is not a live plan is ignored.
  const [planId, setPlanId] = useState(() =>
    plans.some((plan) => String(plan.planId) === initialPlanId) ? initialPlanId
    : defaultPlanId(plans),
  );
  const [promoCode, setPromoCode] = useState(suggestedPromo?.code ?? "");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

  const selected = useMemo(
    () => plans.find((p) => String(p.planId) === planId) ?? plans[0],
    [plans, planId],
  );

  const quote = useMemo(
    () => quoteCheckout(selected, suggestedPromo, promoCode),
    [selected, suggestedPromo, promoCode],
  );

  const canPay = coachId > 0 || Boolean(coachCode.trim());

  useEffect(() => {
    if (!identified) return;
    let cancelled = false;

    void lookupCoach({
      coachId: initialCoachId > 0 ? initialCoachId : undefined,
      coachCode: initialCoachCode.trim() || undefined,
    }).then((result) => {
      if (cancelled) return;
      setCoachLoading(false);
      if (result.coach) {
        setResolvedCoach(result.coach);
        setCoachId(result.coach.coachId);
        setCoachCode(result.coach.coachCode);
        return;
      }

      const code = initialCoachCode.trim();
      setResolvedCoach({
        coachId: initialCoachId > 0 ? initialCoachId : 0,
        coachCode: code,
        coachName: seededName || fallbackCoachLabel(),
        photo: "",
      });
      setMessage(null);
      setStatus("idle");
    });
    return () => {
      cancelled = true;
    };
  }, [identified, initialCoachId, initialCoachCode, seededName]);

  async function startCheckout() {
    if (checkoutLock.current) return;
    setStatus("loading");
    setMessage(null);

    if (!selected) {
      setStatus("error");
      setMessage("Select a premium plan.");
      return;
    }

    const resolvedId = coachId;
    const resolvedCode = coachCode.trim() || undefined;

    if (resolvedId <= 0 && !resolvedCode) {
      setStatus("error");
      setMessage(
        "Coach account is missing. Sign in, or open Pay Now from the app.",
      );
      return;
    }

    checkoutLock.current = true;

    try {
      const orderRes = await createPremiumOrder({
        coachId: resolvedId > 0 ? resolvedId : 0,
        coachCode: resolvedCode,
        planId: selected.planId,
        promoCode: promoCode.trim() || undefined,
      });

      if (!isApiSuccess(orderRes)) {
        checkoutLock.current = false;
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
        checkoutLock.current = false;
        setStatus("error");
        setMessage("Could not create order.");
        return;
      }
      if (order.error) {
        checkoutLock.current = false;
        setStatus("error");
        setMessage(order.error);
        return;
      }
      if (!order.razorpayOrderId || !order.keyId) {
        checkoutLock.current = false;
        setStatus("error");
        setMessage(
          "Payment could not start right now. Please try again in a moment.",
        );
        return;
      }
      if (!window.Razorpay || !scriptReady) {
        checkoutLock.current = false;
        setStatus("error");
        setMessage("Payment checkout failed to load. Refresh and try again.");
        return;
      }

      const amountPaise = Math.round(Number(order.amount) * 100);
      if (!Number.isFinite(amountPaise) || amountPaise < 100) {
        checkoutLock.current = false;
        setStatus("error");
        setMessage("Invalid payment amount. Please try again.");
        return;
      }

      // Prefer the coach id the order was created for.
      const paidCoachId = order.coachId > 0 ? order.coachId : resolvedId;
      if (paidCoachId > 0) setCoachId(paidCoachId);

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
              coachId: paidCoachId > 0 ? paidCoachId : order.coachId,
              coachCode: resolvedCode,
              planId: order.planId,
              amount: order.amount,
              promoCode: order.promoCode ?? undefined,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            if (!isApiSuccess(confirmRes) || !confirmRes.responseObj?.isPaid) {
              checkoutLock.current = false;
              setStatus("error");
              setMessage(
                firstApiError(confirmRes) ??
                  confirmRes.responseObj?.error ??
                  "Payment received but confirmation failed. Contact support with your payment reference.",
              );
              return;
            }
            const periodEnd = confirmRes.responseObj.periodEnd;
            const qs = new URLSearchParams({
              orderId: confirmRes.responseObj.orderId,
              plan: confirmRes.responseObj.planName,
            });
            if (periodEnd) qs.set("periodEnd", periodEnd);
            if (paidCoachId > 0) qs.set("coachId", String(paidCoachId));
            if (resolvedCode) qs.set("coachCode", resolvedCode);
            const coachName = resolvedCoach?.coachName || displayName;
            if (coachName && coachName !== "Coach") {
              qs.set("coachName", coachName);
            }
            try {
              await refreshPremiumStatus();
            } catch {
              // Success page retries. Checkout still continues.
            }
            router.push(`/premium/success?${qs.toString()}`);
          } catch (error) {
            checkoutLock.current = false;
            setStatus("error");
            setMessage(
              error instanceof Error ?
                error.message
              : "Payment confirmation failed.",
            );
          }
        },
        theme: { color: "#c04b2b" },
        modal: {
          ondismiss: () => {
            checkoutLock.current = false;
            setStatus("error");
            setMessage("Checkout was closed before payment completed.");
          },
        },
      });

      rzp.on("payment.failed", () => {
        checkoutLock.current = false;
        setStatus("error");
        setMessage("Payment was not completed. You can try again when ready.");
      });

      rzp.open();
      // Stay in loading so Pay now cannot double-submit while Razorpay is open.
      setMessage("Complete payment in the secure checkout window.");
    } catch (error) {
      checkoutLock.current = false;
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Checkout could not start.",
      );
    }
  }

  const busy = status === "loading" || coachLoading;

  return (
    <div className="min-w-0 space-y-6">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onError={() => {
          setScriptReady(false);
          setStatus("error");
          setMessage("Could not load payment checkout. Refresh and try again.");
        }}
      />

      {resolvedCoach ?
        <div className="flex min-w-0 items-center gap-3 rounded-[var(--radius-md)] border border-line bg-surface p-3 sm:p-4">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-full ring-1 ring-[color:var(--mc-secondary)]/20">
            <CoachPhoto
              src={resolvedCoach.photo}
              alt={resolvedCoach.coachName}
              name={resolvedCoach.coachName}
              className="object-cover"
              sizes="48px"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-mc-secondary">
              Paying for
            </p>
            <p className="truncate font-display text-lg font-bold text-ink">
              {resolvedCoach.coachName}
            </p>
          </div>
        </div>
      : identified && coachLoading ?
        <p className="text-sm text-ink-muted">Loading your coach profile…</p>
      : null}

      {plans.length === 0 ?
        <AlertBanner tone="info">
          No premium plans are available right now. Please try again later.
        </AlertBanner>
      : <div
          className="grid min-w-0 gap-4 md:grid-cols-2"
          role="radiogroup"
          aria-label="Premium plans"
        >
          {plans.map((plan) => {
            const active = String(plan.planId) === String(selected?.planId);
            const monthly = planPayableMonthly(plan);
            const discounted = planShowsDiscount(plan);
            const off = planDiscountOffPercent(plan);
            return (
              <button
                key={plan.planId}
                type="button"
                role="radio"
                aria-checked={active}
                tabIndex={active ? 0 : -1}
                onClick={() => setPlanId(String(plan.planId))}
                onKeyDown={(event) => {
                  const forward =
                    event.key === "ArrowRight" || event.key === "ArrowDown";
                  const backward =
                    event.key === "ArrowLeft" || event.key === "ArrowUp";
                  if (!forward && !backward) return;
                  event.preventDefault();
                  const index = plans.findIndex(
                    (item) => String(item.planId) === String(selected?.planId),
                  );
                  const delta = forward ? 1 : -1;
                  const next =
                    plans[(index + delta + plans.length) % plans.length];
                  if (!next) return;
                  setPlanId(String(next.planId));
                  const group = event.currentTarget.parentElement;
                  const target = group?.querySelector<HTMLButtonElement>(
                    `[data-plan-id="${next.planId}"]`,
                  );
                  target?.focus();
                }}
                data-plan-id={plan.planId}
                className={`relative min-h-11 min-w-0 cursor-pointer rounded-[var(--radius-md)] border-2 p-4 text-left transition focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-mc-primary active:scale-[0.99] sm:p-5 ${
                  active ?
                    "border-mc-secondary bg-[#d6ede5] shadow-[0_10px_24px_rgba(27,67,50,0.14)] ring-2 ring-mc-secondary"
                  : "border-line bg-white hover:border-mc-secondary/35"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-mc-secondary">
                    {plan.durationMonths}{" "}
                    {plan.durationMonths === 1 ? "month" : "months"}
                  </p>
                  {active ?
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-mc-secondary px-2 py-0.5 text-[11px] font-bold tracking-wide text-white">
                      <i
                        className="fas fa-check"
                        style={{ fontSize: 14 }}
                        aria-hidden
                      />
                      Selected
                    </span>
                  : null}
                </div>
                <h3 className="mt-1 truncate font-display text-xl font-bold text-ink">
                  {plan.planName}
                </h3>
                <p className="mt-3 flex flex-wrap items-baseline gap-x-1 font-display text-2xl font-bold sm:text-3xl">
                  <span className="tabular-nums">{formatInr(monthly)}</span>
                  <span className="text-base font-semibold text-mc-primary">
                    / month
                  </span>
                </p>
                {discounted ?
                  <p className="mt-1 text-sm text-ink-muted">
                    <span className="whitespace-nowrap tabular-nums line-through">
                      {formatInr(plan.basePrice)}
                    </span>{" "}
                    <span className="whitespace-nowrap tabular-nums">
                      {formatInr(plan.finalPrice)}
                    </span>
                    {off != null ?
                      <span className="ml-2 inline-flex rounded-full bg-[color:var(--mc-primary-light)] px-2 py-0.5 text-xs font-bold whitespace-nowrap text-mc-primary">
                        {off}% off
                      </span>
                    : null}
                  </p>
                : <p className="mt-1 text-sm text-ink-muted">
                    <span className="whitespace-nowrap tabular-nums">
                      {formatInr(plan.finalPrice)}
                    </span>{" "}
                    total
                  </p>
                }
              </button>
            );
          })}
        </div>
      }

      {suggestedPromo ?
        <AlertBanner tone="info" className="min-w-0 break-words">
          Use promo code{" "}
          <strong className="break-all">{suggestedPromo.code}</strong> to get
          early access discount. Limited period offer.
        </AlertBanner>
      : null}

      <TextField
        label="Promo code"
        value={promoCode}
        onChange={(e) => setPromoCode(e.target.value)}
        placeholder="Optional"
        disabled={busy}
        className="min-w-0"
      />

      {quote && selected ?
        <div className="min-w-0 rounded-[var(--radius-md)] border border-line bg-surface p-4 sm:p-5">
          <p className="text-xs font-semibold text-mc-secondary">
            Price breakdown
          </p>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex items-start justify-between gap-3">
              <dt className="min-w-0 text-ink-muted">Original amount</dt>
              <dd
                className={
                  quote.planDiscountAmount > 0.009 || quote.promoApplied ?
                    "shrink-0 whitespace-nowrap text-ink-muted tabular-nums line-through"
                  : "shrink-0 font-semibold whitespace-nowrap text-ink tabular-nums"
                }
              >
                {formatInr(quote.originalAmount)}
              </dd>
            </div>
            {quote.planDiscountAmount > 0.009 ?
              <div className="flex items-start justify-between gap-3">
                <dt className="min-w-0 text-ink-muted">
                  Plan discount
                  {quote.planDiscountPercent != null ?
                    <span className="whitespace-nowrap">
                      {` (${quote.planDiscountPercent}% off)`}
                    </span>
                  : null}
                </dt>
                <dd className="shrink-0 font-medium whitespace-nowrap text-mc-secondary tabular-nums">
                  -{formatInr(quote.planDiscountAmount)}
                </dd>
              </div>
            : null}
            {quote.promoApplied ?
              <>
                {quote.planDiscountAmount > 0.009 ?
                  <div className="flex items-start justify-between gap-3">
                    <dt className="min-w-0 text-ink-muted">Plan price</dt>
                    <dd className="shrink-0 whitespace-nowrap text-ink-muted tabular-nums line-through">
                      {formatInr(quote.planAmount)}
                    </dd>
                  </div>
                : null}
                <div className="flex items-start justify-between gap-3">
                  <dt className="min-w-0 text-ink-muted">
                    <span>
                      Promo
                      {quote.promoDiscountPercent != null ?
                        <span className="whitespace-nowrap">
                          {` · ${quote.promoDiscountPercent}% off`}
                        </span>
                      : null}
                    </span>
                    {quote.promoCode ?
                      <span className="mt-0.5 block text-xs tracking-wide break-all text-ink-muted/90 uppercase">
                        {quote.promoCode}
                      </span>
                    : null}
                  </dt>
                  <dd className="shrink-0 font-medium whitespace-nowrap text-mc-secondary tabular-nums">
                    -{formatInr(quote.promoDiscountAmount)}
                  </dd>
                </div>
              </>
            : null}
            <div className="flex items-start justify-between gap-3 border-t border-line pt-2">
              <dt className="min-w-0 font-semibold text-ink">Amount to pay</dt>
              <dd className="shrink-0 font-display text-xl font-bold whitespace-nowrap text-ink tabular-nums">
                {formatInr(quote.payableAmount)}
              </dd>
            </div>
          </dl>
        </div>
      : null}

      <button
        type="button"
        onClick={() => void startCheckout()}
        disabled={busy || plans.length === 0 || !canPay}
        className="mc-btn-primary mc-btn-pay w-full max-w-full sm:w-auto"
      >
        {status === "loading" ?
          message?.startsWith("Complete payment") ?
            "Waiting for payment…"
          : message?.startsWith("Confirming") ?
            "Confirming…"
          : "Starting checkout…"
        : "Pay now"}
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
