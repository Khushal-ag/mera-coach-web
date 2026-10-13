"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
  ArrowLeft,
  Copy,
  FileText,
  MessageSquareHeart,
  RefreshCw,
  Share2,
  Utensils,
} from "lucide-react";

import type { ClientDetail } from "@/types/practice";

import { useAuth } from "@/components/auth-provider";
import { ClientAvatar } from "@/components/practice/client-avatar";
import { PhotoGallery } from "@/components/practice/photo-gallery";
import { AlertBanner } from "@/components/ui/alert-banner";
import { fetchClientDetail } from "@/lib/api/practice";
import { formatBmi, getBmi, getBmiCategory } from "@/lib/bmi";
import {
  buildFeedbackShareBody,
  buildFeedbackWebUrl,
} from "@/lib/feedback-url";
import {
  CLIENT_PROGRESS_DOC_TYPE,
  CLIENT_PROGRESS_REF_TYPE,
} from "@/types/document";

function Field({ label, value }: { label: string; value?: string | number }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-ink-muted">{label}</dt>
      <dd className="mt-1 text-sm font-medium break-words text-ink">{value}</dd>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mc-panel border-l-4 border-l-mc-secondary px-5 py-5">
      <h2 className="font-display text-base font-bold text-ink">{title}</h2>
      <dl className="mt-4 grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </dl>
    </section>
  );
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function ClientDetailView() {
  const params = useParams<{ code: string }>();
  const code = decodeURIComponent(params.code ?? "");
  const { session } = useAuth();
  const [detail, setDetail] = useState<ClientDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackAction, setFeedbackAction] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      void fetchClientDetail({ clientCode: code })
        .then((data) => {
          if (!cancelled) setDetail(data);
        })
        .catch((err) => {
          if (!cancelled) {
            setError(err instanceof Error ? err.message : "Client not found.");
            setDetail(null);
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [code]);

  const feedbackUrl =
    session?.coachCode && detail?.clientCode ?
      buildFeedbackWebUrl({
        coachCode: session.coachCode,
        clientCode: detail.clientCode,
      })
    : null;

  const title = detail?.clientName || (loading ? "Client" : "Client");
  const bmi = getBmi(detail?.height ?? "", detail?.weight ?? "");
  const bmiCat = getBmiCategory(bmi);

  async function askForFeedback(mode: "share" | "copy") {
    if (!feedbackUrl) {
      setError("Coach or client code is missing for the feedback link.");
      return;
    }
    const body = buildFeedbackShareBody({
      clientName: detail?.clientName,
      coachName: session?.fullName,
      feedbackUrl,
    });
    setError(null);

    if (mode === "share") {
      try {
        if (typeof navigator.share === "function") {
          await navigator.share({
            title: "Ask for feedback",
            text: body,
            url: feedbackUrl,
          });
          setFeedbackAction("Shared");
          window.setTimeout(() => setFeedbackAction(null), 2000);
          return;
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }

    const ok = await copyText(`${body}`);
    setFeedbackAction(ok ? "Link copied" : "Could not copy");
    window.setTimeout(() => setFeedbackAction(null), 2500);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <nav className="mb-4" aria-label="Breadcrumb">
        <Link
          href="/dashboard/clients"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-mc-secondary hover:underline"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Clients
        </Link>
      </nav>

      <header className="mb-8">
        <div className="overflow-hidden rounded-[22px] bg-[image:var(--mc-gradient)] px-5 py-5 text-white shadow-[0_16px_40px_rgba(0,75,62,0.18)] sm:px-7 sm:py-6">
          <div className="flex min-w-0 items-start gap-4">
            {session?.coachCode && detail?.clientCode ?
              <ClientAvatar
                coachCode={session.coachCode}
                clientCode={detail.clientCode}
                savedBy={session.coachId}
                name={detail.clientName}
                onError={(msg) => setError(msg)}
              />
            : null}
            <div className="min-w-0">
              <h1 className="font-display text-[1.75rem] leading-[1.15] font-extrabold tracking-tight sm:text-[2rem]">
                {title}
              </h1>
              <div
                className="mt-3 h-1 w-12 rounded-full bg-[color:var(--mc-accent)]"
                aria-hidden
              />
              <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-white/75">
                {[
                  detail?.mobileNo,
                  detail?.emailId,
                  detail?.location,
                  detail?.clientCode ? `Code ${detail.clientCode}` : null,
                ]
                  .filter(Boolean)
                  .join(", ") || "Client profile from your latest assessment."}
              </p>
              {bmi != null ?
                <p className="mt-3 font-display text-lg font-bold text-[color:var(--mc-accent)] tabular-nums">
                  BMI {formatBmi(bmi)}
                  {bmiCat ?
                    <span className="ml-2 text-sm font-semibold text-white/75">
                      {bmiCat.label}
                    </span>
                  : null}
                </p>
              : null}
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
          <Link
            href={`/dashboard/clients/${encodeURIComponent(code)}/checkup`}
            className="mc-btn-primary min-h-11 w-full sm:w-auto"
          >
            <RefreshCw className="size-4" aria-hidden />
            Start checkup
          </Link>
          <Link
            href={`/dashboard/clients/${encodeURIComponent(code)}/bmi`}
            className="mc-btn-secondary min-h-11 w-full sm:w-auto"
          >
            <FileText className="size-4" aria-hidden />
            BMI report
          </Link>
          <Link
            href={`/dashboard/clients/${encodeURIComponent(code)}/diet`}
            className="mc-btn-secondary min-h-11 w-full sm:w-auto"
          >
            <Utensils className="size-4" aria-hidden />
            Diet plan
          </Link>
          {feedbackUrl ?
            <>
              <button
                type="button"
                className="mc-btn-secondary min-h-11 w-full sm:w-auto"
                onClick={() => void askForFeedback("share")}
              >
                <Share2 className="size-4" aria-hidden />
                {feedbackAction ?? "Ask for feedback"}
              </button>
              <button
                type="button"
                className="mc-btn-secondary min-h-11 w-full sm:w-auto"
                title={feedbackUrl}
                onClick={() => void askForFeedback("copy")}
              >
                <Copy className="size-4" aria-hidden />
                Copy link
              </button>
              <a
                href={feedbackUrl}
                target="_blank"
                rel="noreferrer"
                className="mc-btn-secondary min-h-11 w-full sm:w-auto"
              >
                <MessageSquareHeart className="size-4" aria-hidden />
                Open form
              </a>
            </>
          : null}
        </div>
      </header>

      {error ?
        <AlertBanner tone="error">{error}</AlertBanner>
      : null}

      {loading ?
        <div className="space-y-4" aria-busy="true" aria-live="polite">
          <span className="sr-only">Loading client</span>
          <div className="mc-panel space-y-3 p-5">
            <div className="mc-skeleton h-4 w-24" />
            <div className="mc-skeleton h-4 w-48" />
            <div className="mc-skeleton h-4 w-36" />
          </div>
          <div className="mc-panel space-y-3 p-5">
            <div className="mc-skeleton h-4 w-28" />
            <div className="mc-skeleton h-4 w-40" />
          </div>
        </div>
      : detail ?
        <div className="space-y-5">
          <Section title="Contact">
            <Field label="Mobile" value={detail.mobileNo} />
            <Field label="Email" value={detail.emailId} />
            <Field label="Location" value={detail.location} />
            <Field label="Gender" value={detail.gender} />
            <Field label="Age" value={detail.age} />
            <Field label="Date of birth" value={detail.dob} />
          </Section>

          <Section title="Body metrics">
            <Field label="Weight (kg)" value={detail.weight} />
            <Field label="Height (cm)" value={detail.height} />
            <Field
              label="BMI"
              value={bmi != null ? formatBmi(bmi) : undefined}
            />
            <Field label="Primary goal" value={detail.primaryGoal} />
            <Field label="Target timeline" value={detail.targetTimeline} />
            <Field label="Assessment date" value={detail.assessmentDate} />
          </Section>

          <Section title="Lifestyle">
            <Field label="Food preference" value={detail.foodPreference} />
            <Field label="Regional cuisine" value={detail.regionalCuisine} />
            <Field label="Activity" value={detail.physicalActivity} />
            <Field label="Work type" value={detail.workType} />
            <Field label="Sleep" value={detail.sleepDuration} />
            <Field label="Pregnancy" value={detail.pregnancy} />
          </Section>

          <Section title="Health notes">
            <Field
              label="Medical conditions"
              value={detail.medicalConditions}
            />
            <Field label="Food allergies" value={detail.foodAllergies} />
            <Field label="Additional notes" value={detail.additionalNotes} />
          </Section>

          {session?.coachCode && detail.clientCode ?
            <PhotoGallery
              coachCode={session.coachCode}
              refCode={detail.clientCode}
              refType={CLIENT_PROGRESS_REF_TYPE}
              docType={CLIENT_PROGRESS_DOC_TYPE}
              savedBy={session.coachId}
              maxPhotos={24}
              title="Progress photos"
              emptyHint="Upload progress photos for this client."
            />
          : null}

          <p className="max-w-[62ch] text-sm leading-relaxed text-ink-muted">
            A checkup refreshes lifestyle, meals, and BMI. Diet and BMI reports
            sit in the actions above. Ask for feedback uses the same web link
            the app sends by SMS.
          </p>
        </div>
      : null}
    </div>
  );
}
