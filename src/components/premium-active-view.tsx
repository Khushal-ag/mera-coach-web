"use client";

import { useState } from "react";
import Link from "next/link";

import type {
  CoachPaymentHistoryItem,
  CoachSubscriptionDetails,
} from "@/types/practice";
import type { CoachCatalogPlan, CoachSuggestedPromo } from "@/types/premium";

import { PremiumCheckout } from "@/components/premium-checkout";
import { formatInr } from "@/lib/premium-pricing";
import { describeValidity } from "@/lib/validity";

type Props = {
  subscription?: CoachSubscriptionDetails;
  history: CoachPaymentHistoryItem[];
  displayName: string;
  coachCode: string;
  coachId: number;
  plans: CoachCatalogPlan[];
  promo?: CoachSuggestedPromo | null;
  initialPlanId?: string;
};

const PREMIUM_FEATURES = [
  "Unlimited clients & health profile management",
  "Complete progress tracking & recheck-up schedules",
  "Public coach profile, services showcase & client reviews",
  "Diet and workout plan builder with food library",
  "All Mera Coach web and mobile practice tools included",
] as const;

function formatDisplayDate(raw?: string | null): string {
  if (!raw) return "-";
  const parsed = describeValidity(raw);
  if (parsed?.dateLabel) return parsed.dateLabel;
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function calculateElapsedPercent(
  startedOn?: string | null,
  endsOn?: string | null,
): number | null {
  if (!startedOn || !endsOn) return null;
  const start = new Date(startedOn).getTime();
  const end = new Date(endsOn).getTime();
  const now = Date.now();
  if (isNaN(start) || isNaN(end) || end <= start) return null;
  const ratio = (now - start) / (end - start);
  return Math.max(5, Math.min(100, Math.round(ratio * 100)));
}

export function PremiumActiveView({
  subscription,
  history,
  displayName,
  coachCode,
  coachId,
  plans,
  promo,
  initialPlanId = "",
}: Props) {
  const [showPlans, setShowPlans] = useState(false);

  // The API refuses the plan that is already last in line, and every plan while one is lined up. Offer only what it
  // will sell, so a coach is never sent to checkout to be turned away.
  const buyablePlans =
    subscription?.hasUpcomingPlan ? []
    : subscription?.blockedPlanId ?
      plans.filter((plan) => plan.planId !== subscription.blockedPlanId)
    : plans;

  const planName =
    subscription?.planName ||
    (subscription?.durationMonths ?
      `${subscription.durationMonths} Month Plan`
    : "Premium Plan");

  const expiresOn = subscription?.expiresOn ?? null;
  const validity = describeValidity(expiresOn);
  const startedFormatted = formatDisplayDate(subscription?.startedOn);
  const expiresFormatted = formatDisplayDate(expiresOn);
  const elapsedPercent = calculateElapsedPercent(
    subscription?.startedOn,
    expiresOn,
  );

  const daysLeft = validity?.daysLeft ?? null;
  const daysBadge =
    daysLeft != null ?
      daysLeft > 0 ? `${daysLeft} days remaining`
      : daysLeft === 0 ? "Expires today"
      : "Expired"
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* ── Active Subscription Card ── */}
      <div
        style={{
          border: "1.5px solid #d6ede5",
          borderRadius: 20,
          background: "linear-gradient(180deg, #f7fbf9 0%, #ffffff 100%)",
          padding: 24,
          boxShadow: "0 8px 30px rgba(23, 134, 118, 0.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            paddingBottom: 16,
            borderBottom: "1px solid #e7efe9",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "#eef8f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#178676",
                fontSize: 18,
              }}
            >
              <i className="fas fa-crown" style={{ color: "#e8a317" }} />
            </div>
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#5c6b64",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Current Membership
              </div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#1c2e24",
                }}
              >
                {displayName ?
                  `${displayName}'s Premium`
                : "Mera Coach Premium"}
              </h2>
            </div>
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#d6ede5",
              color: "#11685c",
              padding: "6px 14px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            <i className="fas fa-check-circle" /> Active
          </div>
        </div>

        {/* Plan Details & Progress Bar */}
        <div style={{ marginTop: 20 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div>
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#1c2e24",
                  marginRight: 8,
                }}
              >
                {planName}
              </span>
              {subscription?.amount ?
                <span
                  style={{ fontSize: 15, color: "#6b756f", fontWeight: 500 }}
                >
                  ({formatInr(subscription.amount)})
                </span>
              : null}
            </div>

            {daysBadge ?
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: daysLeft && daysLeft <= 15 ? "#b45309" : "#178676",
                  background:
                    daysLeft && daysLeft <= 15 ? "#fef3c7" : "#eef8f5",
                  padding: "4px 10px",
                  borderRadius: 6,
                }}
              >
                {daysBadge}
              </span>
            : null}
          </div>

          {elapsedPercent != null ?
            <div
              style={{
                width: "100%",
                height: 8,
                background: "#e5ece7",
                borderRadius: 4,
                overflow: "hidden",
                marginTop: 12,
              }}
            >
              <div
                style={{
                  width: `${elapsedPercent}%`,
                  height: "100%",
                  background:
                    "linear-gradient(90deg, #178676 0%, #2f8f62 100%)",
                  borderRadius: 4,
                  transition: "width 0.4s ease",
                }}
              />
            </div>
          : null}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 16,
              marginTop: 16,
              padding: 14,
              borderRadius: 12,
              background: "#ffffff",
              border: "1px solid #edf2ee",
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: "#7a8a81", fontWeight: 600 }}>
                Started On
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#223129",
                  marginTop: 2,
                }}
              >
                {startedFormatted}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#7a8a81", fontWeight: 600 }}>
                Valid Through
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#223129",
                  marginTop: 2,
                }}
              >
                {expiresFormatted}
              </div>
            </div>
          </div>
        </div>

        {/* Next Queued Plan (if any) */}
        {subscription?.hasUpcomingPlan && subscription?.nextPlanName ?
          <div
            style={{
              marginTop: 16,
              padding: "12px 16px",
              borderRadius: 12,
              background: "#f0f7f4",
              border: "1px solid #cfe5db",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <i className="fas fa-forward" style={{ color: "#178676" }} />
            <div style={{ fontSize: 13, color: "#1b382b" }}>
              <strong>Up Next:</strong> {subscription.nextPlanName} starts
              automatically when your current plan completes.
            </div>
          </div>
        : null}

        {/* Benefits Checklist */}
        <div style={{ marginTop: 22 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#3d4e45",
              marginBottom: 10,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Unlocked Premium Features
          </div>
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: "none",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 10,
            }}
          >
            {PREMIUM_FEATURES.map((feature) => (
              <li
                key={feature}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  fontSize: 13,
                  color: "#33453b",
                }}
              >
                <i
                  className="fas fa-check-circle"
                  style={{ color: "#178676", marginTop: 2, flexShrink: 0 }}
                />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginTop: 24,
            paddingTop: 18,
            borderTop: "1px solid #edf2ee",
          }}
        >
          <Link
            href="/practice"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#d05c26",
              color: "#ffffff",
              padding: "11px 22px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Go to Coach Dashboard <i className="fas fa-arrow-right" />
          </Link>

          {buyablePlans.length > 0 ?
            <button
              type="button"
              onClick={() => setShowPlans(!showPlans)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: showPlans ? "#edf2ee" : "#ffffff",
                color: "#1c2e24",
                border: "1.5px solid #d5ddd8",
                padding: "11px 20px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <i className="fas fa-sync-alt" />
              {showPlans ? "Hide Available Plans" : "Renew or Change Plan"}
            </button>
          : <span
              style={{ fontSize: 13, color: "#5c6b64", alignSelf: "center" }}
            >
              {subscription?.renewalOpensOn ?
                `Your next plan is already lined up. You can renew or change it from ${formatDisplayDate(subscription.renewalOpensOn)}.`
              : "There is nothing to change right now."}
            </span>
          }
        </div>
      </div>

      {/* ── Expandable Plan Renewal / Change Section ── */}
      {showPlans ?
        <div
          style={{
            border: "1px dashed #178676",
            borderRadius: 18,
            padding: 20,
            background: "#fafdfb",
          }}
        >
          <div
            style={{
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#11685c",
            }}
          >
            <i className="fas fa-info-circle" />
            <span style={{ fontSize: 14, fontWeight: 600 }}>
              Extend your subscription early. Any plan purchased will follow
              your current term ending {expiresFormatted}.
            </span>
          </div>

          <PremiumCheckout
            key={`${coachId}:${coachCode}:${displayName}:renewal`}
            plans={buyablePlans}
            promo={promo}
            initialCoachId={coachId}
            initialCoachCode={coachCode}
            displayName={displayName}
            initialPlanId={initialPlanId}
          />
        </div>
      : null}

      {/* ── Payment History Section (Modern Redesign) ── */}
      {history.length > 0 ?
        <div
          style={{
            border: "1px solid #e5ece7",
            borderRadius: 20,
            background: "#ffffff",
            padding: 24,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "#eef8f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#178676",
                fontSize: 15,
              }}
            >
              <i className="fas fa-receipt" />
            </div>
            <h3
              style={{
                margin: 0,
                fontSize: 17,
                fontWeight: 700,
                color: "#1c2e24",
              }}
            >
              Payment History
            </h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {history.map((item, index) => {
              const start = formatDisplayDate(item.periodStart);
              const end = formatDisplayDate(item.periodEnd);
              const ordered = formatDisplayDate(item.orderedOn);
              const periodText =
                start !== "-" && end !== "-" ? `${start} – ${end}`
                : ordered !== "-" ? `Paid on ${ordered}`
                : null;
              const isRefunded = item.status.toLowerCase() === "refunded";
              const isRefunding = item.status.toLowerCase() === "refunding";

              return (
                <div
                  key={item.orderId || index}
                  style={{
                    border: "1px solid #eaf0eb",
                    borderRadius: 14,
                    background: "#fbfcfb",
                    padding: "14px 18px",
                  }}
                >
                  {/* Top Row: Plan Name + Paid Badge + Amount */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "#1c2e24",
                        }}
                      >
                        {item.planName || "Premium"}
                      </span>

                      {isRefunded ?
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#dc2626",
                            background: "#fee2e2",
                            padding: "2px 8px",
                            borderRadius: 999,
                          }}
                        >
                          Refunded
                        </span>
                      : isRefunding ?
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#996500",
                            background: "#fef3c7",
                            padding: "2px 8px",
                            borderRadius: 999,
                          }}
                        >
                          Refunding
                        </span>
                      : <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#11685c",
                            background: "#d6ede5",
                            padding: "2px 8px",
                            borderRadius: 999,
                          }}
                        >
                          <i
                            className="fas fa-check"
                            style={{ fontSize: 10 }}
                          />
                          Paid
                        </span>
                      }
                    </div>

                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 800,
                        color: isRefunded ? "#8a968f" : "#1c2e24",
                        textDecoration: isRefunded ? "line-through" : "none",
                      }}
                    >
                      {formatInr(item.amount)}
                    </div>
                  </div>

                  {/* Validity / Date Row */}
                  {periodText ?
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginTop: 6,
                        fontSize: 12,
                        color: "#6b756f",
                      }}
                    >
                      <i
                        className="far fa-calendar-alt"
                        style={{ fontSize: 12 }}
                      />
                      <span>{periodText}</span>
                    </div>
                  : null}

                  {/* Bottom Tags: Ref + Promo */}
                  {item.paymentReference || item.promoCode ?
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 8,
                        marginTop: 8,
                        paddingTop: 8,
                        borderTop: "1px solid #edf2ee",
                      }}
                    >
                      {item.paymentReference ?
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            background: "#edf2ee",
                            color: "#4a5750",
                            padding: "2px 8px",
                            borderRadius: 6,
                            fontSize: 11,
                            fontFamily: "monospace",
                          }}
                        >
                          <span style={{ fontWeight: 600, color: "#7a8a81" }}>
                            Ref:
                          </span>
                          {item.paymentReference}
                        </span>
                      : null}

                      {item.promoCode ?
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            background: "#fef3c7",
                            color: "#b45309",
                            padding: "2px 8px",
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          <i className="fas fa-tag" style={{ fontSize: 10 }} />
                          {item.promoCode}
                        </span>
                      : null}
                    </div>
                  : null}
                </div>
              );
            })}
          </div>
        </div>
      : null}
    </div>
  );
}
