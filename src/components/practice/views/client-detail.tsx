"use client";

import { Children, isValidElement, useEffect, useMemo, useState } from "react";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import type { MasterOption } from "@/lib/api/master";
import type { ClientDetail } from "@/types/practice";

import { useAuth } from "@/components/auth-provider";
import { ClientAvatar } from "@/components/practice/client-avatar";
import { PracticePageHeader } from "@/components/practice/page-header";
import { PhotoGallery } from "@/components/practice/photo-gallery";
import { ClientBmiReportView } from "@/components/practice/views/client-bmi-report";
import { ClientCheckupView } from "@/components/practice/views/client-checkup";
import { ClientDietPlanView } from "@/components/practice/views/client-diet-plan";
import { ClientProfileSkeleton } from "@/components/skeletons/client-profile-skeleton";
import { AlertBanner } from "@/components/ui/alert-banner";
import { fetchParamList, resolveParamLabel } from "@/lib/api/master";
import { fetchClientDetail } from "@/lib/api/practice";
import { formatBmi, getBmi, getBmiCategory } from "@/lib/bmi";
import { buildFeedbackWebUrl } from "@/lib/feedback-url";
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

const SECTION_ICONS: Record<string, string> = {
  Contact: "fas fa-address-card",
  Lifestyle: "fas fa-heartbeat",
  "Health notes": "fas fa-notes-medical",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const hasValue = Children.toArray(children).some(
    (child) =>
      isValidElement<{ value?: string | number }>(child) &&
      child.props.value !== undefined &&
      child.props.value !== null &&
      child.props.value !== "",
  );
  if (!hasValue) return null;
  return (
    <section className="ac-card">
      <h5 className="ac-card-title">
        <i className={SECTION_ICONS[title] ?? "fas fa-user"} /> {title}
      </h5>
      <dl className="grid gap-x-6 gap-y-5 px-5 pb-5 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </dl>
    </section>
  );
}

type ClientTab = "overview" | "checkup" | "bmi" | "diet";

function tabFromParam(value: string | null): ClientTab {
  if (value === "diet") return "diet";
  if (value === "checkup") return "checkup";
  if (value === "bmi") return "bmi";
  return "overview";
}

const clientTabs: { id: ClientTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "checkup", label: "Checkup" },
  { id: "bmi", label: "BMI" },
  { id: "diet", label: "Diet" },
];

function ProfileContact({
  phone,
  email,
  city,
}: {
  phone?: string;
  email?: string;
  city?: string;
}) {
  const rows = [
    { label: "Phone", value: phone, icon: "fa-phone" },
    { label: "Email", value: email, icon: "fa-envelope" },
    { label: "City", value: city, icon: "fa-map-marker-alt" },
  ].filter((row) => row.value);
  if (rows.length === 0) return null;
  return (
    <dl className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-3">
      {rows.map((row) => {
        return (
          <div key={row.label} className="flex min-w-0 items-start gap-2">
            <i
              className={`fas ${row.icon} mt-1 shrink-0 text-mc-secondary`}
              style={{ fontSize: 14 }}
              aria-hidden
            />
            <div className="min-w-0">
              <dt className="text-xs font-medium text-ink-muted">
                {row.label}
              </dt>
              <dd className="text-sm font-medium [overflow-wrap:anywhere] text-ink">
                {row.value}
              </dd>
            </div>
          </div>
        );
      })}
    </dl>
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
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = tabFromParam(searchParams.get("tab"));
  const { session } = useAuth();
  const [detail, setDetail] = useState<ClientDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackAction, setFeedbackAction] = useState<string | null>(null);
  const [paramLists, setParamLists] = useState<Record<string, MasterOption[]>>(
    {},
  );

  useEffect(() => {
    let cancelled = false;
    const codes = Array.from(
      { length: 10 },
      (_, i) => `PC${String(i + 1).padStart(3, "0")}`,
    );
    void Promise.all(codes.map((c) => fetchParamList(c))).then((lists) => {
      if (cancelled) return;
      setParamLists(Object.fromEntries(codes.map((c, i) => [c, lists[i]!])));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // The app saves master item codes; the web wizard saves labels. Show labels for both.
  const label = useMemo(
    () => (value: string | undefined, paramCode: string) =>
      resolveParamLabel(value, paramLists[paramCode] ?? []),
    [paramLists],
  );
  const labels = (value: string | undefined, paramCode: string) =>
    (value ?? "")
      .split(",")
      .map((part) => label(part, paramCode))
      .filter(Boolean)
      .join(", ");

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

  async function askForFeedback() {
    if (!feedbackUrl) {
      setError("Coach or client code is missing for the feedback link.");
      return;
    }
    setError(null);
    const ok = await copyText(feedbackUrl);
    setFeedbackAction(
      ok ? "Link copied. Send it to your client." : "Could not copy the link.",
    );
    window.setTimeout(() => setFeedbackAction(null), 3000);
  }

  function selectTab(next: ClientTab) {
    const query = new URLSearchParams(searchParams.toString());
    if (next === "overview") query.delete("tab");
    else query.set("tab", next);
    const qs = query.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <div className="min-w-0">
      <PracticePageHeader
        title={title}
        back={{ href: "/dashboard/clients", label: "Back to clients" }}
        description={
          detail?.mobileNo || detail?.emailId || detail?.location ?
            <ProfileContact
              phone={detail?.mobileNo}
              email={detail?.emailId}
              city={detail?.location}
            />
          : undefined
        }
        leading={
          session?.coachCode && detail?.clientCode ?
            <ClientAvatar
              coachCode={session.coachCode}
              clientCode={detail.clientCode}
              savedBy={session.coachId}
              name={detail.clientName}
              onError={(msg) => setError(msg)}
            />
          : loading ?
            <div className="mc-skeleton size-20 rounded-full" aria-hidden />
          : undefined
        }
        action={
          feedbackUrl ?
            <div className="flex flex-col gap-1 sm:items-end">
              <button
                type="button"
                className="mc-btn-secondary min-h-11 w-full sm:w-auto"
                onClick={() => void askForFeedback()}
              >
                <i
                  className="fas fa-comment-dots"
                  style={{ fontSize: 16 }}
                  aria-hidden
                />
                Ask for feedback
              </button>
              {feedbackAction ?
                <p
                  className="text-sm font-semibold text-mc-secondary"
                  role="status"
                >
                  {feedbackAction}
                </p>
              : null}
            </div>
          : undefined
        }
      />
      <div
        role="tablist"
        aria-label="Client profile"
        className="mb-6 flex flex-wrap items-center justify-start gap-3"
      >
        {clientTabs.map((item) => {
          const selected = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`client-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`client-panel-${item.id}`}
              className={selected ? "mc-btn-primary" : "mc-btn-secondary"}
              onClick={() => selectTab(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {error ?
        <AlertBanner tone="error">{error}</AlertBanner>
      : null}

      {tab === "checkup" ?
        <div
          role="tabpanel"
          id="client-panel-checkup"
          aria-labelledby="client-tab-checkup"
        >
          <ClientCheckupView embedded />
        </div>
      : tab === "bmi" ?
        <div
          role="tabpanel"
          id="client-panel-bmi"
          aria-labelledby="client-tab-bmi"
        >
          <ClientBmiReportView embedded />
        </div>
      : tab === "diet" ?
        <div
          role="tabpanel"
          id="client-panel-diet"
          aria-labelledby="client-tab-diet"
        >
          <ClientDietPlanView embedded />
        </div>
      : loading ?
        <ClientProfileSkeleton />
      : detail ?
        <div
          role="tabpanel"
          id="client-panel-overview"
          aria-labelledby="client-tab-overview"
          className="space-y-5"
        >
          <Section title="Contact">
            <Field label="Mobile" value={detail.mobileNo} />
            <Field label="Email" value={detail.emailId} />
            <Field label="Location" value={detail.location} />
            <Field label="Gender" value={detail.gender} />
            <Field label="Age" value={detail.age} />
            <Field label="Date of birth" value={detail.dob} />
          </Section>

          <section aria-labelledby="body-metrics" className="ac-card">
            <div className="grid lg:grid-cols-[minmax(0,16rem)_1fr]">
              <div className="bg-mc-secondary px-5 py-6 text-white sm:px-6">
                <p className="font-display text-sm font-semibold text-white/80">
                  BMI
                </p>
                <p className="mt-2 font-display text-5xl leading-none font-bold tabular-nums">
                  {bmi != null ? formatBmi(bmi) : "-"}
                </p>
                {bmiCat ?
                  <p className="mt-3 text-sm text-white/80">{bmiCat.label}</p>
                : null}
              </div>
              <div className="px-5 py-5 sm:px-6">
                <h2
                  id="body-metrics"
                  className="font-display text-lg font-bold tracking-tight text-ink"
                >
                  Body metrics
                </h2>
                <dl className="mt-4 grid gap-x-6 gap-y-5 border-t border-line pt-4 sm:grid-cols-2">
                  <Field label="Weight (kg)" value={detail.weight} />
                  <Field label="Height (cm)" value={detail.height} />
                  <Field
                    label="Primary goal"
                    value={label(detail.primaryGoal, "PC007")}
                  />
                  <Field
                    label="Target timeline"
                    value={label(detail.targetTimeline, "PC008")}
                  />
                  <Field
                    label="Assessment date"
                    value={detail.assessmentDate}
                  />
                </dl>
              </div>
            </div>
          </section>

          <Section title="Lifestyle">
            <Field
              label="Food preference"
              value={label(detail.foodPreference, "PC001")}
            />
            <Field
              label="Regional cuisine"
              value={label(detail.regionalCuisine, "PC002")}
            />
            <Field
              label="Activity"
              value={label(detail.physicalActivity, "PC003")}
            />
            <Field label="Work type" value={label(detail.workType, "PC004")} />
            <Field label="Sleep" value={label(detail.sleepDuration, "PC005")} />
            <Field label="Pregnancy" value={label(detail.pregnancy, "PC006")} />
          </Section>

          <Section title="Health notes">
            <Field
              label="Medical conditions"
              value={labels(detail.medicalConditions, "PC009")}
            />
            <Field
              label="Food allergies"
              value={labels(detail.foodAllergies, "PC010")}
            />
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
              showDates
              emptyHint="Upload progress photos for this client."
            />
          : null}

          <p className="max-w-[62ch] text-sm leading-relaxed text-ink-muted">
            Checkup, BMI, and Diet open on this page. Ask for feedback copies
            the web link so you can send it.
          </p>
        </div>
      : null}
    </div>
  );
}
