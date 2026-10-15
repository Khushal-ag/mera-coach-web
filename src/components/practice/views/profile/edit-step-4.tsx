"use client";

import type { ProfileEditor } from "./use-profile-editor";

import { ImagePicker } from "@/components/media/image-picker";
import { TextAreaField } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export function ProfileEditStep4({ editor }: { editor: ProfileEditor }) {
  const {
    profile,
    busy,
    editStep,
    setEditStep,
    coachName,
    coachDesc,
    setCoachDesc,
    bmiTemplate,
    setBmiTemplate,
    dietTemplate,
    setDietTemplate,
    logoUrl,
    profilePicUrl,
    coverUrl,
    logoPick,
    photoPick,
    coverPick,
    cancelEdit,
    setSlot,
    completion,
    profileDirty,
  } = editor;
  return (
    <div className={cn("rg-panel", editStep === 4 ? "" : "rg-hidden")}>
      <div className="rg-section-head">
        <div className="rg-sh-icon rg-sh-red">
          <i className="fas fa-id-card" />
        </div>
        <div>
          <h2>Profile & Media</h2>
          <p>Photos and what clients read about you</p>
        </div>
      </div>
      <div className="space-y-4">
        <ImagePicker
          label="Cover image"
          hint="Wide banner for your public profile. JPG, PNG, or WebP · max 2 MB"
          value={coverPick}
          currentUrl={coverUrl}
          onChange={(file) => setSlot("cover", file)}
          disabled={busy}
          aspectClassName="h-20 w-36"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <ImagePicker
            label="Logo"
            value={logoPick}
            currentUrl={logoUrl}
            onChange={(file) => setSlot("logo", file)}
            disabled={busy}
          />
          <ImagePicker
            label="Profile photo"
            name={coachName}
            value={photoPick}
            currentUrl={profilePicUrl}
            onChange={(file) => setSlot("photo", file)}
            disabled={busy}
          />
        </div>

        <TextAreaField
          label="About"
          required
          value={coachDesc}
          onChange={(e) => setCoachDesc(e.target.value)}
        />
        <TextAreaField
          label="BMI report template notes"
          value={bmiTemplate}
          onChange={(e) => setBmiTemplate(e.target.value)}
        />
        <TextAreaField
          label="Diet chart template notes"
          value={dietTemplate}
          onChange={(e) => setDietTemplate(e.target.value)}
        />
        <div className="rounded-[var(--radius-sm)] border border-line bg-paper px-4 py-3">
          <p className="text-sm font-semibold text-ink">
            Find a Coach visibility
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">
            {profile?.isProfileVisible ?
              "Listed. It stays on Find a Coach while the required public fields are filled in."
            : completion.missingLabels.length ?
              `Not listed yet. Still needed: ${completion.missingLabels.join(", ")}.`
            : "Not listed yet. Save again once the required public fields are filled in."
            }
          </p>
        </div>
      </div>
      <div className="rg-nav">
        <button
          type="button"
          className="btn rg-btn-back"
          onClick={() => setEditStep(3)}
        >
          <i className="fas fa-arrow-left" /> Back
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            className="btn rg-btn-back"
            onClick={cancelEdit}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn rg-btn-next"
            disabled={busy || !profileDirty}
            aria-busy={busy}
          >
            {busy ? "Saving…" : "Save Profile"} <i className="fas fa-check" />
          </button>
        </div>
      </div>
    </div>
  );
}
