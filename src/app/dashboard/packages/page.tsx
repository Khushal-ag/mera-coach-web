"use client";

import { useEffect, useState } from "react";

import type { CoachPackage, CoachProfile } from "@/types/coach";

import { useAuth } from "@/components/auth-provider";
import { CoverImageField } from "@/components/media/cover-image-field";
import {
  PracticeEmpty,
  PracticePageHeader,
} from "@/components/practice/page-header";
import { AlertBanner } from "@/components/ui/alert-banner";
import { TextField } from "@/components/ui/field";
import {
  fetchAuthedCoachProfile,
  saveCoachPackagesEvents,
} from "@/lib/api/practice";
import { MAX_COACH_PACKAGES } from "@/lib/coach/packages";
import { COACH_PACKAGE_IMAGE_DOC_TYPE } from "@/types/document";

function emptyPackage(): CoachPackage {
  return {
    id: `pkg_${Date.now()}`,
    name: "",
    price: "",
    duration: "",
    description: "",
  };
}

export default function PackagesPage() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<CoachProfile | null>(null);
  const [packages, setPackages] = useState<CoachPackage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetchAuthedCoachProfile()
      .then((p) => {
        if (cancelled || !p) return;
        setProfile(p);
        setPackages(p.packages ?? []);
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Could not load packages.",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [session?.coachId]);

  async function save() {
    if (!profile) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const cleaned = packages
        .map((p) => ({
          ...p,
          name: p.name.trim(),
          price: p.price.trim(),
          duration: p.duration.trim(),
          description: p.description.trim(),
          imageUrl: p.imageUrl?.trim() || undefined,
        }))
        .filter((p) => p.name);
      await saveCoachPackagesEvents({ profile, packages: cleaned });
      setPackages(cleaned);
      setMessage("Packages saved. They appear on your public profile.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save packages.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PracticePageHeader
        title="Packages"
        description={`Up to ${MAX_COACH_PACKAGES} offers on your public coach page.`}
        action={
          <button
            type="button"
            className="mc-btn-primary"
            disabled={busy || loading || !profile}
            onClick={() => void save()}
          >
            {busy ? "Saving…" : "Save packages"}
          </button>
        }
      />

      {error ?
        <AlertBanner tone="error">{error}</AlertBanner>
      : null}
      {message ?
        <AlertBanner tone="success">{message}</AlertBanner>
      : null}

      {loading ?
        <p className="text-sm text-ink-muted">Loading packages…</p>
      : !packages.length ?
        <PracticeEmpty
          title="No packages yet"
          body="Add a package clients can see on your public profile."
        />
      : null}

      <div className="space-y-4">
        {packages.map((pkg, index) => (
          <div
            key={pkg.id}
            className="rounded-[var(--radius-md)] border border-line bg-surface p-4 sm:p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display font-bold text-ink">
                Package {index + 1}
              </p>
              <button
                type="button"
                className="text-sm font-semibold text-[color:var(--mc-destructive)]"
                onClick={() =>
                  setPackages((prev) => prev.filter((p) => p.id !== pkg.id))
                }
              >
                Remove
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {session?.coachCode ?
                <CoverImageField
                  imageUrl={pkg.imageUrl}
                  coachCode={session.coachCode}
                  savedBy={session.coachId}
                  docType={COACH_PACKAGE_IMAGE_DOC_TYPE}
                  disabled={busy}
                  onError={setError}
                  onChange={(imageUrl) =>
                    setPackages((prev) =>
                      prev.map((p) =>
                        p.id === pkg.id ?
                          { ...p, imageUrl: imageUrl || undefined }
                        : p,
                      ),
                    )
                  }
                />
              : null}
              <TextField
                label="Name"
                value={pkg.name}
                onChange={(e) =>
                  setPackages((prev) =>
                    prev.map((p) =>
                      p.id === pkg.id ? { ...p, name: e.target.value } : p,
                    ),
                  )
                }
              />
              <TextField
                label="Price"
                value={pkg.price}
                onChange={(e) =>
                  setPackages((prev) =>
                    prev.map((p) =>
                      p.id === pkg.id ? { ...p, price: e.target.value } : p,
                    ),
                  )
                }
              />
              <TextField
                label="Duration / sessions"
                value={pkg.duration}
                onChange={(e) =>
                  setPackages((prev) =>
                    prev.map((p) =>
                      p.id === pkg.id ? { ...p, duration: e.target.value } : p,
                    ),
                  )
                }
              />
              <TextField
                label="Description"
                value={pkg.description}
                onChange={(e) =>
                  setPackages((prev) =>
                    prev.map((p) =>
                      p.id === pkg.id ?
                        { ...p, description: e.target.value }
                      : p,
                    ),
                  )
                }
              />
            </div>
          </div>
        ))}
      </div>

      {packages.length < MAX_COACH_PACKAGES ?
        <button
          type="button"
          className="mc-btn-secondary mt-4"
          onClick={() => setPackages((prev) => [...prev, emptyPackage()])}
        >
          Add package
        </button>
      : null}
    </div>
  );
}
