"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import type { CoachShowcasePackage, SavePackageInput } from "@/types/showcase";

import { EmptyState } from "@/components/practice/empty-state";
import { PracticePageHeader } from "@/components/practice/page-header";
import { PackageEditor } from "@/components/practice/views/package-editor";
import { PackageCardsSkeleton } from "@/components/skeletons/packages-events-skeleton";
import { AlertBanner } from "@/components/ui/alert-banner";
import { fetchAuthedCoachProfile } from "@/lib/api/practice";
import {
  deletePackage,
  fetchMyPackages,
  savePackage,
  setPackageActive,
} from "@/lib/api/showcase";
import { formatMoney } from "@/lib/format";
import {
  getPackagesEmptyStateCopy,
  packagesPageDescription,
  PROFESSIONAL_DETAILS_PROFILE_HREF,
  shouldShowPackagesSubtitle,
} from "@/lib/packages-list-ui";

const MAX_PACKAGES = 10;

export function PackagesListView() {
  const [packages, setPackages] = useState<CoachShowcasePackage[]>([]);
  const [coachBrandCode, setCoachBrandCode] = useState("");
  const [coachBrandName, setCoachBrandName] = useState("");
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  /** null = list, 0 = new package, otherwise the package being edited. */
  const [editing, setEditing] = useState<number | null>(null);

  useEffect(() => {
    if (editing === null) return;
    let cancelled = false;
    void fetchAuthedCoachProfile()
      .then((profile) => {
        if (!cancelled) {
          setCoachBrandCode(profile?.brandCode?.trim() ?? "");
          setCoachBrandName(profile?.brandName?.trim() ?? "");
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [editing]);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([fetchMyPackages(), fetchAuthedCoachProfile()])
      .then(([mine, profile]) => {
        if (cancelled) return;
        setPackages(mine);
        setCoachBrandCode(profile?.brandCode?.trim() ?? "");
        setCoachBrandName(profile?.brandName?.trim() ?? "");
        setProfileLoaded(true);
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Could not load packages.",
          );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          setProfileLoaded(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function publish(input: SavePackageInput) {
    setBusy(true);
    setFormError(null);
    try {
      const saved = await savePackage(input);
      setPackages((prev) =>
        input.packageId ?
          prev.map((p) => (p.packageId === saved.packageId ? saved : p))
        : [saved, ...prev],
      );
      setEditing(null);
      setMessage(
        input.isActive === false ?
          "Package saved. It is hidden from your profile until you switch it on."
        : input.packageId ? "Package updated."
        : "Package published on your profile.",
      );
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Could not save the package.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function toggleVisible(pkg: CoachShowcasePackage) {
    const next = !pkg.isActive;
    setError(null);
    setMessage(null);
    setPackages((prev) =>
      prev.map((p) =>
        p.packageId === pkg.packageId ? { ...p, isActive: next } : p,
      ),
    );
    try {
      await setPackageActive(pkg.packageId, next);
      setMessage(
        next ?
          `"${pkg.packageName}" is now shown on your profile.`
        : `"${pkg.packageName}" is hidden from your profile.`,
      );
    } catch (err) {
      setPackages((prev) =>
        prev.map((p) =>
          p.packageId === pkg.packageId ? { ...p, isActive: !next } : p,
        ),
      );
      setError(
        err instanceof Error ? err.message : "Could not update the package.",
      );
    }
  }

  async function remove(pkg: CoachShowcasePackage) {
    if (!window.confirm(`Remove "${pkg.packageName}" from your profile?`))
      return;
    setError(null);
    setMessage(null);
    try {
      await deletePackage(pkg.packageId);
      setPackages((prev) => prev.filter((p) => p.packageId !== pkg.packageId));
      setMessage("Package removed.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not remove the package.",
      );
    }
  }

  const canAdd = !loading && !!coachBrandCode && packages.length < MAX_PACKAGES;
  const editingPackage =
    editing ? (packages.find((p) => p.packageId === editing) ?? null) : null;
  const hasBrand = !!coachBrandCode;
  const showPageDescription = shouldShowPackagesSubtitle(
    hasBrand,
    packages.length,
  );
  const emptyCopy = getPackagesEmptyStateCopy(hasBrand, coachBrandName);

  return (
    <div className="min-w-0">
      <PracticePageHeader
        title="Packages"
        description={
          showPageDescription ?
            packagesPageDescription(MAX_PACKAGES)
          : undefined
        }
        icon={<i className="fas fa-box" style={{ fontSize: 20 }} aria-hidden />}
        action={
          canAdd && editing === null && packages.length > 0 ?
            <button
              type="button"
              className="mc-btn-primary w-full sm:w-auto"
              onClick={() => {
                setFormError(null);
                setMessage(null);
                setEditing(0);
              }}
            >
              <i className="fas fa-plus" aria-hidden /> Create package
            </button>
          : null
        }
      />

      {coachBrandCode && coachBrandName && editing === null ?
        <p className="mb-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-mc-secondary-light px-3 py-1 text-xs font-semibold text-ink">
            <i className="fas fa-tag text-mc-secondary" aria-hidden />
            {coachBrandName}
          </span>
        </p>
      : null}

      {error ?
        <AlertBanner tone="error">{error}</AlertBanner>
      : null}
      {message ?
        <AlertBanner tone="success">{message}</AlertBanner>
      : null}

      {editing !== null ?
        <PackageEditor
          key={editing}
          coachBrandCode={coachBrandCode}
          coachBrandName={coachBrandName}
          initial={editingPackage}
          busy={busy}
          error={formError}
          onPublish={(input) => void publish(input)}
          onCancel={() => setEditing(null)}
        />
      : loading ?
        <PackageCardsSkeleton />
      : packages.length === 0 ?
        <EmptyState
          icon="fas fa-box"
          title={emptyCopy.title}
          description={emptyCopy.description}
          action={
            profileLoaded && !coachBrandCode ?
              <Link
                href={PROFESSIONAL_DETAILS_PROFILE_HREF}
                className="mc-btn-primary"
              >
                <i className="fas fa-user-pen" aria-hidden />{" "}
                {emptyCopy.actionLabel}
              </Link>
            : canAdd ?
              <button
                type="button"
                className="mc-btn-primary"
                onClick={() => {
                  setFormError(null);
                  setMessage(null);
                  setEditing(0);
                }}
              >
                <i className="fas fa-plus" aria-hidden />{" "}
                {emptyCopy.actionLabel}
              </button>
            : null
          }
        />
      : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {packages.map((pkg) => (
            <article
              key={pkg.packageId}
              className={`clt-card flex min-w-0 flex-col overflow-hidden ${pkg.isActive ? "" : "opacity-80"}`}
            >
              <div className="flex items-start justify-between gap-3 bg-mc-secondary px-4 py-3 text-white">
                <div className="min-w-0">
                  <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold">
                    {pkg.brandName}
                  </span>
                  <h2 className="mt-2 font-display text-lg leading-snug font-bold break-words">
                    {pkg.packageName}
                  </h2>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    aria-label={`Edit ${pkg.packageName}`}
                    title="Edit"
                    className="grid size-9 place-items-center rounded-full bg-white/90 text-[#2a4a3a] transition hover:bg-white"
                    onClick={() => {
                      setFormError(null);
                      setMessage(null);
                      setEditing(pkg.packageId);
                    }}
                  >
                    <i
                      className="fas fa-pen"
                      style={{ fontSize: 13 }}
                      aria-hidden
                    />
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove ${pkg.packageName}`}
                    title="Remove"
                    className="grid size-9 place-items-center rounded-full bg-white/90 text-[#b3361f] transition hover:bg-white"
                    onClick={() => void remove(pkg)}
                  >
                    <i
                      className="fas fa-trash"
                      style={{ fontSize: 13 }}
                      aria-hidden
                    />
                  </button>
                </div>
              </div>
              <ul className="divide-y divide-line px-4 text-sm">
                {pkg.items.map((item, index) => (
                  <li
                    key={`${item.itemName}-${index}`}
                    className="flex items-baseline justify-between gap-3 py-2"
                  >
                    <span className="min-w-0 break-words text-ink">
                      {item.itemName}
                    </span>
                    <span className="shrink-0 font-semibold text-ink-muted tabular-nums">
                      {formatMoney(item.amount)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex items-baseline justify-between border-t border-line bg-[#fdf8f2] px-4 py-3">
                <span className="text-sm font-semibold text-ink-muted">
                  Total
                </span>
                <span className="font-display text-xl font-bold text-ink tabular-nums">
                  {formatMoney(pkg.totalAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
                <span className="text-sm font-semibold text-ink">
                  {pkg.isActive ? "Shown on profile" : "Hidden from profile"}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={pkg.isActive}
                  aria-label={`Show ${pkg.packageName} on your public profile`}
                  onClick={() => void toggleVisible(pkg)}
                  className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ${pkg.isActive ? "bg-mc-secondary" : "bg-[#c9c2bb]"}`}
                >
                  <span
                    className={`inline-block size-5 rounded-full bg-white shadow transition-transform ${pkg.isActive ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </div>
            </article>
          ))}
        </div>
      }
    </div>
  );
}
