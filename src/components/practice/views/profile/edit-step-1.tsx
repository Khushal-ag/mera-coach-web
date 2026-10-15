"use client";

import type { ProfileEditor } from "./use-profile-editor";

import { MenuSelect } from "@/components/ui/menu-select";
import { cn } from "@/lib/utils";

export function ProfileEditStep1({ editor }: { editor: ProfileEditor }) {
  const {
    categories,
    editStep,
    setEditStep,
    coachName,
    setCoachName,
    coachTypeCode,
    setCoachTypeCode,
    setServiceCodes,
    mobile,
    setMobile,
    email,
    setEmail,
  } = editor;
  return (
    <div className={cn("rg-panel", editStep === 1 ? "" : "rg-hidden")}>
      <div className="rg-section-head">
        <div className="rg-sh-icon rg-sh-green">
          <i className="fas fa-user-check" />
        </div>
        <div>
          <h2>Basic Information</h2>
          <p>Core identity and login details</p>
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
        <div className="rg-field rg-col-2">
          <label>
            <i className="fas fa-layer-group" /> Coach category
            <span className="rg-req" aria-hidden>
              *
            </span>
          </label>
          <MenuSelect
            skin="public"
            className="ui-select"
            value={coachTypeCode}
            options={[
              { value: "", label: "-- Select a category --" },
              ...categories.map((c) => ({
                value: c.code,
                label: c.label,
              })),
            ]}
            onChange={(e) => {
              setCoachTypeCode(e.target.value);
              setServiceCodes([]);
            }}
          />
        </div>
        <div className="rg-field rg-col-2">
          <label>
            <i className="fas fa-mobile-alt" /> Mobile number
            <span className="rg-req" aria-hidden>
              *
            </span>
          </label>
          <input
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            maxLength={10}
          />
        </div>
        <div className="rg-field rg-col-2">
          <label>
            <i className="fas fa-envelope" /> Email address
            <span className="rg-req" aria-hidden>
              *
            </span>
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />
        </div>
      </div>
      <div className="rg-nav">
        <button
          type="button"
          className="btn rg-btn-next"
          onClick={() => setEditStep(2)}
        >
          Next: Coach Details <i className="fas fa-arrow-right" />
        </button>
      </div>
    </div>
  );
}
