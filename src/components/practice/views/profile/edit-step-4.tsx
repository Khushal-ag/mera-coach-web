"use client";

import { useEffect, useState } from "react";

import type { ProfileEditor } from "./use-profile-editor";

import type { ReportTemplate } from "@/lib/api/showcase";

import { ImagePicker } from "@/components/media/image-picker";
import { TextAreaField } from "@/components/ui/field";
import { MenuSelect } from "@/components/ui/menu-select";
import { fetchReportTemplates } from "@/lib/api/showcase";
import { cn } from "@/lib/utils";

export function ProfileEditStep4({ editor }: { editor: ProfileEditor }) {
  const {
    busy,
    editStep,
    setEditStep,
    coachName,
    coachDesc,
    setCoachDesc,
    logoUrl,
    profilePicUrl,
    coverUrl,
    logoPick,
    photoPick,
    coverPick,
    cancelEdit,
    save,
    setSlot,
    bmiTemplate,
    setBmiTemplate,
    dietTemplate,
    setDietTemplate,
  } = editor;
  const [bmiTemplates, setBmiTemplates] = useState<ReportTemplate[]>([]);
  const [dietTemplates, setDietTemplates] = useState<ReportTemplate[]>([]);
  useEffect(() => {
    let cancelled = false;
    void fetchReportTemplates("BMI").then((rows) => {
      if (!cancelled) setBmiTemplates(rows);
    });
    void fetchReportTemplates("DIET").then((rows) => {
      if (!cancelled) setDietTemplates(rows);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  // Blank means the coach never chose: show the list's default (the API uses its own default).
  const shownBmi =
    bmiTemplate ||
    (bmiTemplates.find((t) => t.isDefault) ?? bmiTemplates[0])?.code;
  const shownDiet =
    dietTemplate ||
    (dietTemplates.find((t) => t.isDefault) ?? dietTemplates[0])?.code;
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
          hint="Wide banner for your public profile. JPG, PNG, or WebP · max 5 MB"
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
        <div className="rg-grid">
          <div className="rg-field rg-col-2">
            <label htmlFor="peBmiTemplate">
              <i className="fas fa-file-medical" /> BMI report template
            </label>
            <MenuSelect
              id="peBmiTemplate"
              skin="public"
              className="ui-select"
              value={shownBmi ?? ""}
              options={bmiTemplates.map((item) => ({
                value: item.code,
                label: item.label,
              }))}
              onChange={(event) => setBmiTemplate(event.target.value)}
            />
          </div>
          <div className="rg-field rg-col-2">
            <label htmlFor="peDietTemplate">
              <i className="fas fa-utensils" /> Diet plan template
            </label>
            <MenuSelect
              id="peDietTemplate"
              skin="public"
              className="ui-select"
              value={shownDiet ?? ""}
              options={dietTemplates.map((item) => ({
                value: item.code,
                label: item.label,
              }))}
              onChange={(event) => setDietTemplate(event.target.value)}
            />
          </div>
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
            type="button"
            className="btn rg-btn-next"
            disabled={busy}
            aria-busy={busy}
            onClick={() => void save()}
          >
            {busy ? "Saving…" : "Save Profile"} <i className="fas fa-check" />
          </button>
        </div>
      </div>
    </div>
  );
}
