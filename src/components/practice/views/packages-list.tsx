"use client";

import { useEffect, useState } from "react";

import type { CoachPackage, CoachProfile } from "@/types/coach";

import { useAuth } from "@/components/auth-provider";
import { ListEmpty } from "@/components/list-empty";
import { CoverImageField } from "@/components/media/cover-image-field";
import { PracticePageHeader } from "@/components/practice/page-header";
import { PackageCardsSkeleton } from "@/components/skeletons/packages-events-skeleton";
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

function savablePackages(list: CoachPackage[]): CoachPackage[] {
  return list
    .map((pkg) => ({
      ...pkg,
      name: pkg.name.trim(),
      price: pkg.price.trim(),
      duration: pkg.duration.trim(),
      description: pkg.description.trim(),
      imageUrl: pkg.imageUrl?.trim() || undefined,
    }))
    .filter((pkg) => pkg.name);
}

function packagesKey(list: CoachPackage[]) {
  return JSON.stringify(
    savablePackages(list).map((pkg) => ({
      name: pkg.name,
      price: pkg.price,
      duration: pkg.duration,
      description: pkg.description,
      imageUrl: pkg.imageUrl ?? "",
    })),
  );
}

export function PackagesListView() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<CoachProfile | null>(null);
  const [packages, setPackages] = useState<CoachPackage[]>([]);
  const [baseline, setBaseline] = useState("[]");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const dirty = !loading && !!profile && packagesKey(packages) !== baseline;

  useEffect(() => {
    let cancelled = false;
    void fetchAuthedCoachProfile()
      .then((p) => {
        if (cancelled || !p) return;
        setProfile(p);
        const next = p.packages ?? [];
        setPackages(next);
        setBaseline(packagesKey(next));
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

  function edit(updater: (prev: CoachPackage[]) => CoachPackage[]) {
    setMessage(null);
    setPackages(updater);
  }

  async function save() {
    if (!profile || !dirty) return;
    const cleaned = savablePackages(packages);
    if (packagesKey(cleaned) === baseline) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await saveCoachPackagesEvents({ profile, packages: cleaned });
      setPackages(cleaned);
      setBaseline(packagesKey(cleaned));
      setMessage("Packages saved. They appear on your public profile.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save packages.");
    } finally {
      setBusy(false);
    }
  }

  function addPackage() {
    if (packages.length >= MAX_COACH_PACKAGES) return;
    edit((prev) => [...prev, emptyPackage()]);
  }

  const canAdd = !loading && packages.length < MAX_COACH_PACKAGES;

  return (
    <div className="min-w-0">
      <PracticePageHeader
        title="Packages"
        description={`Up to ${MAX_COACH_PACKAGES} offers on your public coach page.`}
        icon={<i className="fas fa-box" style={{ fontSize: 20 }} aria-hidden />}
        action={
          (canAdd && packages.length > 0) || dirty ?
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end">
              {canAdd && packages.length > 0 ?
                <button
                  type="button"
                  className={
                    dirty ?
                      "mc-btn-secondary w-full sm:w-auto"
                    : "mc-btn-primary w-full sm:w-auto"
                  }
                  onClick={addPackage}
                >
                  Add package
                </button>
              : null}
              {dirty ?
                <button
                  type="button"
                  className="mc-btn-primary w-full sm:w-auto"
                  disabled={busy}
                  aria-busy={busy}
                  onClick={() => void save()}
                >
                  {busy ? "Saving" : "Save packages"}
                </button>
              : null}
            </div>
          : null
        }
      />

      {error ?
        <AlertBanner tone="error">{error}</AlertBanner>
      : null}
      {message ?
        <AlertBanner tone="success">{message}</AlertBanner>
      : null}

      {loading ?
        <PackageCardsSkeleton />
      : !packages.length ?
        <ListEmpty
          icon="fas fa-box"
          title="No packages yet"
          action={
            <button
              type="button"
              className="clt-btn clt-btn-primary"
              onClick={addPackage}
            >
              Add package
            </button>
          }
        />
      : null}

      <div className="grid gap-4">
        {packages.map((pkg) => (
          <div key={pkg.id} className="clt-card min-w-0">
            <div className="clt-card-header">
              <h2>
                <i className="fas fa-box" /> {pkg.name.trim() || "New package"}
              </h2>
              <button
                type="button"
                className="clt-total-badge"
                onClick={() =>
                  edit((prev) => prev.filter((p) => p.id !== pkg.id))
                }
              >
                Remove
              </button>
            </div>
            <div className="clt-card-body grid gap-3 sm:grid-cols-2">
              {session?.coachCode ?
                <CoverImageField
                  imageUrl={pkg.imageUrl}
                  coachCode={session.coachCode}
                  savedBy={session.coachId}
                  docType={COACH_PACKAGE_IMAGE_DOC_TYPE}
                  disabled={busy}
                  onError={setError}
                  onChange={(imageUrl) =>
                    edit((prev) =>
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
                  edit((prev) =>
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
                  edit((prev) =>
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
                  edit((prev) =>
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
                  edit((prev) =>
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
    </div>
  );
}
