"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";

import type { CoachOption } from "@/components/admin/coach-picker";
import type { CoachAd, CoachStatsRow } from "@/lib/api/admin";

import { AdminStatusChip } from "@/components/admin/admin-status-chip";
import { CoachPicker } from "@/components/admin/coach-picker";
import { CltPager, usePagedRows } from "@/components/practice/clt-list";
import { PracticePageHeader } from "@/components/practice/page-header";
import { AlertBanner } from "@/components/ui/alert-banner";
import { MenuSelect } from "@/components/ui/menu-select";
import { siteConfig } from "@/config/site";
import {
  deleteCoachAd,
  fetchAdminAds,
  fetchCoachStats,
  fetchLinkPreview,
  saveCoachAd,
  setCoachAdActive,
  uploadCoachAdImage,
} from "@/lib/api/admin";
import { resolveMediaUrl } from "@/lib/media/media-url";

type Draft = {
  adId: number;
  /** Empty = Global. Create may hold multiple codes → one row per coach. */
  coachCodes: string[];
  imageUrl: string;
  linkUrl: string;
  title: string;
  altText: string;
  sortOrder: number;
  isActive: boolean;
};

const ADS_PER_PAGE = 10;

type ScopeFilter = "all" | "global" | "coach";
type StatusFilter = "all" | "active" | "inactive";

const emptyDraft = (): Draft => ({
  adId: 0,
  coachCodes: [],
  imageUrl: "",
  linkUrl: "",
  title: "",
  altText: "",
  sortOrder: 0,
  isActive: true,
});

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
}

/** Same rule as the API: these URLs go into the public page, so only web schemes or site paths. */
function isWebUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value.trim());
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}

function isSitePath(value: string): boolean {
  const path = value.trim();
  return path.startsWith("/") && !path.startsWith("//");
}

function coachLabel(code: string, options: CoachOption[]): string {
  if (!code) return "Global";
  const hit = options.find((o) => o.coachCode === code);
  if (!hit) return code;
  return hit.coachName.trim() || code;
}

export function AdsPage() {
  const [ads, setAds] = useState<CoachAd[]>([]);
  const [coachOptions, setCoachOptions] = useState<CoachOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [coachesLoading, setCoachesLoading] = useState(true);
  const [coachesError, setCoachesError] = useState("");
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const imageBusy = uploading || previewing;
  const [formError, setFormError] = useState("");
  const [query, setQuery] = useState("");
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [coachFilter, setCoachFilter] = useState("");
  const fileInputId = useId();

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await fetchAdminAds();
      setAds(rows);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ?
          err.message
        : "Could not load recommended creatives.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchAdminAds()
      .then((rows) => {
        if (cancelled) return;
        setAds(rows);
        setError("");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof Error ?
            err.message
          : "Could not load recommended creatives.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchCoachStats()
      .then((rows: CoachStatsRow[]) => {
        if (cancelled) return;
        const options = rows
          .map((r) => ({
            coachCode: r.coachCode,
            coachName: r.coachName,
          }))
          .sort((a, b) =>
            (a.coachName || a.coachCode).localeCompare(
              b.coachName || b.coachCode,
              "en",
              { sensitivity: "base" },
            ),
          );
        setCoachOptions(options);
        setCoachesError("");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setCoachesError(
          err instanceof Error ? err.message : "Could not load coach list.",
        );
      })
      .finally(() => {
        if (!cancelled) setCoachesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function openCreate() {
    setDraft(emptyDraft());
    setFormError("");
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startEdit(ad: CoachAd) {
    setDraft({
      adId: ad.adId,
      coachCodes: ad.coachCode ? [ad.coachCode] : [],
      imageUrl: ad.imageUrl,
      linkUrl: ad.linkUrl,
      title: ad.title,
      altText: ad.altText,
      sortOrder: ad.sortOrder,
      isActive: ad.isActive,
    });
    setFormError("");
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    setDraft(emptyDraft());
    setFormError("");
    setFormOpen(false);
  }

  async function onUpload(file: File | null) {
    if (!file) return;
    setUploading(true);
    setFormError("");
    try {
      const dataUrl = await fileToDataUrl(file);
      const url = await uploadCoachAdImage(dataUrl);
      setDraft((d) => ({ ...d, imageUrl: url }));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  /** A pasted website link with no image yet: use the preview image that website publishes. */
  async function onLinkBlur() {
    if (draft.imageUrl.trim() || !isWebUrl(draft.linkUrl)) return;
    setPreviewing(true);
    setFormError("");
    try {
      const url = await fetchLinkPreview(draft.linkUrl);
      setDraft((d) => (d.imageUrl.trim() ? d : { ...d, imageUrl: url }));
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Could not get a preview.",
      );
    } finally {
      setPreviewing(false);
    }
  }

  async function onSave(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.imageUrl.trim()) {
      setFormError(
        "Upload an image, or paste the website link to use its preview.",
      );
      return;
    }
    if (
      !isWebUrl(draft.imageUrl) &&
      !draft.imageUrl.trim().startsWith("/document/ads/")
    ) {
      setFormError(
        "Image URL must start with https:// or be an uploaded image.",
      );
      return;
    }
    if (
      draft.linkUrl.trim() &&
      !isWebUrl(draft.linkUrl) &&
      !isSitePath(draft.linkUrl)
    ) {
      setFormError("Link must start with https://, http:// or /.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const base = {
        imageUrl: draft.imageUrl.trim(),
        linkUrl: draft.linkUrl.trim() || undefined,
        title: draft.title.trim() || undefined,
        altText: draft.altText.trim() || undefined,
        sortOrder: Number(draft.sortOrder) || 0,
        isActive: draft.isActive,
      };

      if (draft.adId) {
        await saveCoachAd({
          ...base,
          adId: draft.adId,
          coachCode: draft.coachCodes[0]?.trim() || undefined,
        });
      } else if (draft.coachCodes.length === 0) {
        await saveCoachAd({ ...base, coachCode: undefined });
      } else {
        // One creative row per selected coach (schema: single CoachCode).
        for (const code of draft.coachCodes) {
          await saveCoachAd({
            ...base,
            coachCode: code.trim() || undefined,
          });
        }
      }
      closeForm();
      await reload();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Could not save creative.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(ad: CoachAd) {
    try {
      await setCoachAdActive(ad.adId, !ad.isActive);
      await reload();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update creative.",
      );
    }
  }

  async function removeAd(ad: CoachAd) {
    const label = ad.title?.trim() || `creative #${ad.adId}`;
    if (!window.confirm(`Delete “${label}”? This cannot be undone.`)) return;
    try {
      await deleteCoachAd(ad.adId);
      if (draft.adId === ad.adId) closeForm();
      await reload();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete creative.",
      );
    }
  }

  const filteredAds = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ads.filter((ad) => {
      if (statusFilter === "active" && !ad.isActive) return false;
      if (statusFilter === "inactive" && ad.isActive) return false;
      if (scopeFilter === "global" && ad.coachCode) return false;
      if (scopeFilter === "coach" && !ad.coachCode) return false;
      if (coachFilter && ad.coachCode !== coachFilter) return false;
      if (!q) return true;
      const hay = [ad.title, ad.altText, ad.coachCode, ad.linkUrl]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [ads, query, scopeFilter, statusFilter, coachFilter]);

  const paged = usePagedRows(filteredAds, ADS_PER_PAGE);
  const isEditing = draft.adId > 0;

  return (
    <div>
      <PracticePageHeader
        title="Recommended creatives"
        description="Shown on coach profiles under “Recommended by …”."
        crumbs={[
          { label: "Admin", href: siteConfig.links.adminCoaches },
          { label: "Creatives" },
        ]}
        icon={<i className="fas fa-thumbs-up text-lg" aria-hidden />}
        action={
          formOpen ? null : (
            <button
              type="button"
              className="clt-btn clt-btn-primary"
              onClick={openCreate}
            >
              <i className="fas fa-plus" aria-hidden /> New creative
            </button>
          )
        }
      />

      {error ?
        <AlertBanner tone="error" className="mb-4">
          {error}
        </AlertBanner>
      : null}

      {formOpen ?
        <form onSubmit={onSave} className="clt-card mb-5">
          <div className="clt-card-header">
            <h2>
              <i className={isEditing ? "fas fa-pen" : "fas fa-plus"} />{" "}
              {isEditing ? `Edit creative #${draft.adId}` : "New creative"}
            </h2>
            <button
              type="button"
              className="clt-btn clt-btn-secondary !h-9 !px-3 !text-xs"
              onClick={closeForm}
              disabled={saving || imageBusy}
            >
              Cancel
            </button>
          </div>
          <div className="clt-card-body space-y-5">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,220px)_1fr]">
              <div className="space-y-3">
                <p className="font-[family-name:var(--font-poppins)] text-xs font-semibold tracking-wide text-[var(--cl-text)] uppercase">
                  Preview
                </p>
                <div className="overflow-hidden rounded-[14px] border border-[var(--cl-border)] bg-[var(--cl-bg)]">
                  {draft.imageUrl ?
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resolveMediaUrl(draft.imageUrl) || draft.imageUrl}
                      alt={draft.altText || draft.title || "Creative preview"}
                      className="aspect-[16/10] w-full object-cover"
                    />
                  : <div className="flex aspect-[16/10] flex-col items-center justify-center gap-2 px-4 text-center text-sm text-[var(--cl-text-lt)]">
                      <i
                        className="fas fa-image text-2xl opacity-40"
                        aria-hidden
                      />
                      Preview appears after upload
                    </div>
                  }
                </div>
                <label
                  htmlFor={fileInputId}
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[14px] border-2 border-dashed border-[var(--cl-border)] bg-[#fdfaf7] px-4 py-5 text-center transition hover:border-[var(--cl-primary)] hover:bg-white"
                >
                  <span className="inline-flex size-10 items-center justify-center rounded-full bg-mc-secondary-light text-mc-secondary">
                    <i
                      className={
                        uploading ?
                          "fas fa-spinner fa-spin"
                        : "fas fa-cloud-upload-alt"
                      }
                      aria-hidden
                    />
                  </span>
                  <span className="font-[family-name:var(--font-poppins)] text-sm font-semibold text-[var(--cl-text)]">
                    {uploading ? "Uploading…" : "Upload image"}
                  </span>
                  <span className="text-xs text-[var(--cl-text-lt)]">
                    JPEG, PNG, or WebP
                  </span>
                  <input
                    id={fileInputId}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    disabled={imageBusy || saving}
                    onChange={(e) => void onUpload(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="clt-form-group sm:col-span-2">
                  <label htmlFor="creativeTitle">Title (optional)</label>
                  <input
                    id="creativeTitle"
                    value={draft.title}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, title: e.target.value }))
                    }
                    className="clt-form-control"
                    placeholder="IT tools for coaches"
                  />
                </div>
                <div className="clt-form-group">
                  <label htmlFor="creativeAlt">Alt text</label>
                  <input
                    id="creativeAlt"
                    value={draft.altText}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, altText: e.target.value }))
                    }
                    className="clt-form-control"
                    placeholder="Describe the image"
                  />
                </div>
                <div className="clt-form-group">
                  <label htmlFor="creativeLink">Website link (optional)</label>
                  <input
                    id="creativeLink"
                    value={draft.linkUrl}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, linkUrl: e.target.value }))
                    }
                    onBlur={() => void onLinkBlur()}
                    className="clt-form-control"
                    placeholder="https://…"
                  />
                  <p className="mt-1 text-xs text-[var(--cl-text-lt)]">
                    {previewing ?
                      "Getting the website’s preview…"
                    : "Used for the image if none is added."}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  {isEditing ?
                    <CoachPicker
                      mode="single"
                      id="creativeCoach"
                      label="Show on"
                      hint="Global shows on every profile, or pick one coach."
                      options={coachOptions}
                      value={draft.coachCodes[0] ?? ""}
                      onChange={(code) =>
                        setDraft((d) => ({
                          ...d,
                          coachCodes: code ? [code] : [],
                        }))
                      }
                      allowGlobal
                      globalLabel="Global — all coach profiles"
                      disabled={saving || imageBusy}
                      loading={coachesLoading}
                      error={coachesError}
                    />
                  : <CoachPicker
                      id="creativeCoach"
                      label="Assign to coaches"
                      hint="Leave empty for Global. Pick several coaches to add one copy each."
                      options={coachOptions}
                      selectedCodes={draft.coachCodes}
                      onChange={(codes) =>
                        setDraft((d) => ({ ...d, coachCodes: codes }))
                      }
                      selectAllMeansGlobal
                      disabled={saving || imageBusy}
                      loading={coachesLoading}
                      error={coachesError}
                    />
                  }
                </div>

                <div className="clt-form-group">
                  <label htmlFor="creativeSort">Sort order</label>
                  <input
                    id="creativeSort"
                    type="number"
                    value={draft.sortOrder}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        sortOrder: Number(e.target.value) || 0,
                      }))
                    }
                    className="clt-form-control"
                  />
                </div>
                <div className="clt-form-group">
                  <label htmlFor="creativeImageUrl">Image URL</label>
                  <input
                    id="creativeImageUrl"
                    value={draft.imageUrl}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, imageUrl: e.target.value }))
                    }
                    className="clt-form-control font-mono text-xs"
                    placeholder="/document/ads/… or https://…"
                  />
                </div>
                <label className="flex items-center gap-3 rounded-[12px] border border-[var(--cl-border)] bg-[#fdfaf7] px-4 py-3 text-sm font-semibold text-[var(--cl-text)] sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={draft.isActive}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, isActive: e.target.checked }))
                    }
                    className="size-4 accent-[var(--cl-primary)]"
                  />
                  Active — show on coach profiles
                </label>
              </div>
            </div>

            {formError ?
              <AlertBanner tone="error">{formError}</AlertBanner>
            : null}

            <div className="clt-btn-row">
              <button
                type="submit"
                disabled={saving || imageBusy}
                className="clt-btn clt-btn-primary"
              >
                {saving ?
                  <>
                    <i className="fas fa-spinner fa-spin" aria-hidden /> Saving…
                  </>
                : isEditing ?
                  <>
                    <i className="fas fa-save" aria-hidden /> Update creative
                  </>
                : draft.coachCodes.length > 1 ?
                  <>
                    <i className="fas fa-plus" aria-hidden /> Add{" "}
                    {draft.coachCodes.length} creatives
                  </>
                : <>
                    <i className="fas fa-plus" aria-hidden /> Add creative
                  </>
                }
              </button>
              <button
                type="button"
                className="clt-btn clt-btn-secondary"
                onClick={closeForm}
                disabled={saving || imageBusy}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      : null}

      <div className="clt-card">
        <div className="clt-card-header">
          <h2>
            <i className="fas fa-images" /> Library
          </h2>
        </div>
        <div className="clt-card-body space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="clt-form-group !mb-0">
              <label htmlFor="creativeSearch">Search</label>
              <input
                id="creativeSearch"
                type="search"
                className="clt-form-control"
                placeholder="Title, coach, link…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="clt-form-group !mb-0">
              <label htmlFor="creativeStatus">Status</label>
              <MenuSelect
                id="creativeStatus"
                skin="public"
                className="ui-select"
                value={statusFilter}
                options={[
                  { value: "all", label: "All statuses" },
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
                onChange={(e) =>
                  setStatusFilter(e.target.value as StatusFilter)
                }
              />
            </div>
            <div className="clt-form-group !mb-0">
              <label htmlFor="creativeScope">Scope</label>
              <MenuSelect
                id="creativeScope"
                skin="public"
                className="ui-select"
                value={scopeFilter}
                options={[
                  { value: "all", label: "All scopes" },
                  { value: "global", label: "Global only" },
                  { value: "coach", label: "Coach-specific" },
                ]}
                onChange={(e) => {
                  const next = e.target.value as ScopeFilter;
                  setScopeFilter(next);
                  if (next !== "coach") setCoachFilter("");
                }}
              />
            </div>
            <CoachPicker
              mode="single"
              id="creativeCoachFilter"
              label="Coach"
              options={coachOptions}
              value={coachFilter}
              onChange={(code) => {
                setCoachFilter(code);
                if (code) setScopeFilter("coach");
              }}
              allowGlobal
              globalLabel="Any coach"
              loading={coachesLoading}
              error={coachesError}
              disabled={scopeFilter === "global"}
            />
          </div>

          {(query ||
            statusFilter !== "all" ||
            scopeFilter !== "all" ||
            coachFilter) && (
            <button
              type="button"
              className="clt-btn clt-btn-secondary !h-8 !px-2.5 !text-[11px]"
              onClick={() => {
                setQuery("");
                setStatusFilter("all");
                setScopeFilter("all");
                setCoachFilter("");
              }}
            >
              <i className="fas fa-undo-alt" aria-hidden /> Clear filters
            </button>
          )}
        </div>
        <div className="clt-card-body !border-t !border-[var(--cl-border)] !p-0">
          {loading ?
            <p className="px-5 py-10 text-center text-[var(--cl-text-lt)]">
              <i className="fas fa-spinner fa-spin mr-2" aria-hidden />
              Loading creatives…
            </p>
          : ads.length === 0 ?
            <div className="px-5 py-12 text-center">
              <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-mc-secondary-light text-mc-secondary">
                <i className="fas fa-thumbs-up" aria-hidden />
              </div>
              <p className="font-[family-name:var(--font-poppins)] text-sm font-bold text-[var(--cl-text)]">
                No creatives yet
              </p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-[var(--cl-text-lt)]">
                Add 2–4 global creatives to show on every coach profile.
              </p>
            </div>
          : filteredAds.length === 0 ?
            <p className="px-5 py-10 text-center text-[var(--cl-text-lt)]">
              No creatives match your filters.
            </p>
          : <ul className="divide-y divide-[var(--cl-border)]">
              {paged.slice.map((ad) => (
                <li
                  key={ad.adId}
                  className="flex flex-wrap items-center gap-4 px-5 py-4"
                >
                  <div className="h-[72px] w-[128px] overflow-hidden rounded-[12px] border border-[var(--cl-border)] bg-[var(--cl-bg)] shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resolveMediaUrl(ad.imageUrl) || ad.imageUrl}
                      alt={ad.altText || ad.title || `Creative ${ad.adId}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-[180px] flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-[family-name:var(--font-poppins)] text-sm font-bold text-[var(--cl-text)]">
                        {ad.title || `Creative #${ad.adId}`}
                      </h3>
                      <AdminStatusChip
                        tone={ad.isActive ? "ok" : "muted"}
                        icon={ad.isActive ? "fa-circle-check" : "fa-pause"}
                      >
                        {ad.isActive ? "Active" : "Inactive"}
                      </AdminStatusChip>
                      <AdminStatusChip
                        tone={ad.coachCode ? "accent" : "muted"}
                        icon={ad.coachCode ? "fa-user" : "fa-globe"}
                      >
                        {ad.coachCode ?
                          coachLabel(ad.coachCode, coachOptions)
                        : "Global"}
                      </AdminStatusChip>
                    </div>
                    <p className="mt-1 text-xs text-[var(--cl-text-lt)]">
                      Sort {ad.sortOrder}
                      {ad.linkUrl ?
                        <>
                          {" "}
                          ·{" "}
                          <a
                            href={ad.linkUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-mc-secondary underline-offset-2 hover:underline"
                          >
                            Open link
                          </a>
                        </>
                      : null}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="clt-btn clt-btn-secondary !h-9 !px-3 !text-xs"
                      onClick={() => startEdit(ad)}
                    >
                      <i className="fas fa-pen" aria-hidden /> Edit
                    </button>
                    <button
                      type="button"
                      className="clt-btn clt-btn-secondary !h-9 !px-3 !text-xs"
                      onClick={() => void toggleActive(ad)}
                    >
                      <i
                        className={ad.isActive ? "fas fa-pause" : "fas fa-play"}
                        aria-hidden
                      />
                      {ad.isActive ? "Disable" : "Enable"}
                    </button>
                    <button
                      type="button"
                      className="clt-btn !h-9 !border !border-red-200 !bg-red-50 !px-3 !text-xs !text-red-700 hover:!bg-red-100"
                      onClick={() => void removeAd(ad)}
                    >
                      <i className="fas fa-trash" aria-hidden /> Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          }
          {!loading && filteredAds.length > 0 ?
            <div className="px-5 pb-4">
              <CltPager
                page={paged.page}
                pages={paged.pages}
                start={paged.start}
                end={paged.end}
                total={paged.total}
                onPage={paged.setPage}
              />
            </div>
          : null}
        </div>
      </div>
    </div>
  );
}
