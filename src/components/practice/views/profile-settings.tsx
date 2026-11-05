"use client";

import { PracticePageHeader } from "@/components/practice/page-header";
import { ProfileCompletionCard } from "@/components/practice/profile-completion";
import { ProfileOverview } from "@/components/practice/views/profile-overview";
import {
  ProfileFormSkeleton,
  ProfileViewSkeleton,
} from "@/components/skeletons/profile-view-skeleton";
import { AlertBanner } from "@/components/ui/alert-banner";
import { cn } from "@/lib/utils";

import { ProfileEditStep1 } from "./profile/edit-step-1";
import { ProfileEditStep2 } from "./profile/edit-step-2";
import { ProfileEditStep3 } from "./profile/edit-step-3";
import { ProfileEditStep4 } from "./profile/edit-step-4";
import { useProfileEditor } from "./profile/use-profile-editor";

export function ProfileSettingsView() {
  const editor = useProfileEditor();
  const {
    session,
    profile,
    premiumLabel,
    error,
    message,
    editing,
    editStep,
    setEditStep,
    businessName,
    tagline,
    startEdit,
    cancelEdit,
    pageTopRef,
    publicUrl,
    completion,
    premiumLink,
    categoryLabel,
    serviceLabels,
    placeLabel,
    displayName,
    coverSrc,
    photoSrc,
    logoSrc,
    aboutText,
  } = editor;

  return (
    <div ref={pageTopRef} className={cn("min-w-0", editing && "cl-form-page")}>
      {editing ?
        <PracticePageHeader
          title="Edit profile"
          back={{
            href: "/dashboard/profile",
            label: "Back to profile",
            onClick: cancelEdit,
          }}
          icon={
            <i className="fas fa-user" style={{ fontSize: 20 }} aria-hidden />
          }
          description="Update the photo, name, services, and details on your public page."
        />
      : null}

      {error ?
        <AlertBanner tone="error" className="mb-[22px]">
          {error}
        </AlertBanner>
      : null}
      {message ?
        <AlertBanner tone="success" className="mb-[22px]">
          {message}
        </AlertBanner>
      : null}

      {!editing && !profile ?
        <ProfileViewSkeleton />
      : null}

      {!editing && profile ?
        <ProfileOverview
          profile={profile}
          displayName={displayName}
          businessName={businessName}
          categoryLabel={categoryLabel}
          placeLabel={placeLabel}
          tagline={tagline}
          aboutText={aboutText}
          serviceLabels={serviceLabels}
          coverSrc={coverSrc}
          photoSrc={photoSrc}
          logoSrc={logoSrc}
          publicUrl={publicUrl}
          session={session}
          premiumLabel={premiumLabel}
          premiumLink={premiumLink}
          completion={completion}
          onEdit={startEdit}
        />
      : null}
      {editing ?
        !profile ?
          <ProfileFormSkeleton />
        : <div className="mc-public">
            <div className="rg-page" style={{ padding: 0, maxWidth: 860 }}>
              <form className="rg-card" onSubmit={(e) => e.preventDefault()}>
                <div className="rg-card-head">
                  <div className="rg-head-blobs">
                    <div className="rg-hb rg-hb-1" />
                    <div className="rg-hb rg-hb-2" />
                  </div>
                  <div className="rg-head-inner">
                    <div className="rg-head-icon">
                      <i className="fas fa-chalkboard-teacher" />
                    </div>
                    <div>
                      <h1>My Profile</h1>
                      <p>
                        Keep your profile up to date to attract more clients
                      </p>
                    </div>
                  </div>
                  <div className="rg-steps" style={{ display: "flex" }}>
                    <button
                      type="button"
                      className={cn(
                        "rg-step",
                        editStep === 1 ? "rg-step-active" : "",
                        editStep > 1 ? "rg-step-complete" : "",
                      )}
                      onClick={() => setEditStep(1)}
                      aria-current={editStep === 1 ? "step" : undefined}
                    >
                      <div className="rg-step-circle">
                        <span className="rg-step-num">1</span>
                        <i className="fas fa-check rg-step-done" />
                      </div>
                      <span>Your name</span>
                    </button>
                    <div className="rg-step-line" aria-hidden />
                    <button
                      type="button"
                      className={cn(
                        "rg-step",
                        editStep === 2 ? "rg-step-active" : "",
                        editStep > 2 ? "rg-step-complete" : "",
                      )}
                      onClick={() => setEditStep(2)}
                      aria-current={editStep === 2 ? "step" : undefined}
                    >
                      <div className="rg-step-circle">
                        <span className="rg-step-num">2</span>
                        <i className="fas fa-check rg-step-done" />
                      </div>
                      <span>Professional details</span>
                    </button>
                    <div className="rg-step-line" aria-hidden />
                    <button
                      type="button"
                      className={cn(
                        "rg-step",
                        editStep === 3 ? "rg-step-active" : "",
                        editStep > 3 ? "rg-step-complete" : "",
                      )}
                      onClick={() => setEditStep(3)}
                      aria-current={editStep === 3 ? "step" : undefined}
                    >
                      <div className="rg-step-circle">
                        <span className="rg-step-num">3</span>
                        <i className="fas fa-check rg-step-done" />
                      </div>
                      <span>Contact</span>
                    </button>
                    <div className="rg-step-line" aria-hidden />
                    <button
                      type="button"
                      className={cn(
                        "rg-step",
                        editStep === 4 ? "rg-step-active" : "",
                        editStep > 4 ? "rg-step-complete" : "",
                      )}
                      onClick={() => setEditStep(4)}
                      aria-current={editStep === 4 ? "step" : undefined}
                    >
                      <div className="rg-step-circle">
                        <span className="rg-step-num">4</span>
                        <i className="fas fa-check rg-step-done" />
                      </div>
                      <span>Profile</span>
                    </button>
                  </div>
                </div>
                <div className="rg-card-body">
                  {!completion.isPublicReady || completion.percent < 100 ?
                    <div className="mb-5">
                      <ProfileCompletionCard
                        completion={completion}
                        variant="detailed"
                        showAction={false}
                      />
                    </div>
                  : null}
                  <ProfileEditStep1 editor={editor} />
                  <ProfileEditStep2 editor={editor} />
                  <ProfileEditStep3 editor={editor} />
                  <ProfileEditStep4 editor={editor} />
                </div>
              </form>
            </div>
          </div>

      : null}
    </div>
  );
}
