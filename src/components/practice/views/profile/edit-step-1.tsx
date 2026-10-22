"use client";

import type { ProfileEditor } from "./use-profile-editor";

import { cn } from "@/lib/utils";

export function ProfileEditStep1({ editor }: { editor: ProfileEditor }) {
  const { editStep, setEditStep, coachName, setCoachName } = editor;
  return (
    <div className={cn("rg-panel", editStep === 1 ? "" : "rg-hidden")}>
      <div className="rg-section-head">
        <div className="rg-sh-icon rg-sh-green">
          <i className="fas fa-user-check" />
        </div>
        <div>
          <h2>Your name</h2>
          <p>Your name appears on your public card</p>
        </div>
      </div>
      <div className="rg-grid">
        <div className="rg-field rg-col-2">
          <label>
            <i className="fas fa-user" /> Display name
            <span className="rg-req" aria-hidden>
              *
            </span>
          </label>
          <input
            value={coachName}
            onChange={(e) => setCoachName(e.target.value)}
            aria-required="true"
          />
        </div>
      </div>
      <div className="rg-nav">
        <button
          type="button"
          className="btn rg-btn-next"
          onClick={() => setEditStep(2)}
        >
          Next: Professional details <i className="fas fa-arrow-right" />
        </button>
      </div>
    </div>
  );
}
