"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AlertBanner } from "@/components/ui/alert-banner";
import { TextAreaField, TextField } from "@/components/ui/field";
import {
  firstApiError,
  isApiSuccess,
  registerCoach,
  updateCoachMedia,
  uploadCoachDocument,
} from "@/lib/api";
import {
  fileToBase64DataUrl,
  REGISTER_IMAGE_ACCEPT,
  REGISTER_IMAGE_MAX_BYTES,
  validateRegisterImage,
} from "@/lib/media/image-file";

type ImageSlot = "logo" | "photo";

type PickedImage = {
  file: File;
  previewUrl: string;
};

export function RegisterForm() {
  const router = useRouter();
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [logo, setLogo] = useState<PickedImage | null>(null);
  const [photo, setPhoto] = useState<PickedImage | null>(null);
  const logoRef = useRef<PickedImage | null>(null);
  const photoRef = useRef<PickedImage | null>(null);

  useEffect(() => {
    logoRef.current = logo;
    photoRef.current = photo;
  }, [logo, photo]);

  useEffect(() => {
    return () => {
      if (logoRef.current?.previewUrl) {
        URL.revokeObjectURL(logoRef.current.previewUrl);
      }
      if (photoRef.current?.previewUrl) {
        URL.revokeObjectURL(photoRef.current.previewUrl);
      }
    };
  }, []);

  function setSlot(slot: ImageSlot, file: File | null) {
    setMessage(null);
    setStatus("idle");

    const clear = () => {
      if (slot === "logo") {
        setLogo((prev) => {
          if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
          return null;
        });
      } else {
        setPhoto((prev) => {
          if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
          return null;
        });
      }
    };

    if (!file) {
      clear();
      return;
    }

    const invalid = validateRegisterImage(file);
    if (invalid) {
      setStatus("error");
      setMessage(invalid.message);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const next: PickedImage = { file, previewUrl };
    if (slot === "logo") {
      setLogo((prev) => {
        if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
        return next;
      });
    } else {
      setPhoto((prev) => {
        if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
        return next;
      });
    }
  }

  async function onSubmit(formData: FormData) {
    setStatus("loading");
    setMessage(null);

    const coachName = String(formData.get("coachName") ?? "").trim();
    const mobile = String(formData.get("mobile") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();

    if (!coachName || !mobile || !email) {
      setStatus("error");
      setMessage("Coach name, mobile, and email are required.");
      return;
    }

    if (logo) {
      const invalid = validateRegisterImage(logo.file);
      if (invalid) {
        setStatus("error");
        setMessage(invalid.message);
        return;
      }
    }
    if (photo) {
      const invalid = validateRegisterImage(photo.file);
      if (invalid) {
        setStatus("error");
        setMessage(invalid.message);
        return;
      }
    }

    try {
      const response = await registerCoach({
        coachName,
        mobile,
        email,
        businessName:
          String(formData.get("businessName") ?? "").trim() || undefined,
        add_Line: String(formData.get("address") ?? "").trim() || undefined,
        city_Cd: String(formData.get("city") ?? "").trim() || undefined,
        state_Cd: String(formData.get("state") ?? "").trim() || undefined,
        pinCode: String(formData.get("pin") ?? "").trim() || undefined,
        coachDesc:
          String(formData.get("description") ?? "").trim() || undefined,
        coachTypeCode: "HEALTH",
      });

      if (!isApiSuccess(response)) {
        setStatus("error");
        setMessage(firstApiError(response) ?? "Registration failed.");
        return;
      }

      const created = response.responseObj;
      if (!created?.coachId || !created.coachCode) {
        setStatus("error");
        setMessage(
          "Registration succeeded but coach identity was not returned. Try logging in with the email credentials.",
        );
        return;
      }

      let mediaWarning: string | null = null;
      if (logo || photo) {
        try {
          let logoUrl: string | undefined;
          let profilePicUrl: string | undefined;

          if (logo) {
            const dataUrl = await fileToBase64DataUrl(logo.file);
            const uploaded = await uploadCoachDocument({
              base64DataUrl: dataUrl,
              coachCode: created.coachCode,
              refCode: created.coachCode,
              refType: "COACH",
              docType: "LOGO",
              savedBy: created.coachId,
            });
            logoUrl = uploaded.url;
          }

          if (photo) {
            const dataUrl = await fileToBase64DataUrl(photo.file);
            const uploaded = await uploadCoachDocument({
              base64DataUrl: dataUrl,
              coachCode: created.coachCode,
              refCode: created.coachCode,
              refType: "COACH",
              docType: "PROFILE_PIC",
              savedBy: created.coachId,
            });
            profilePicUrl = uploaded.url;
          }

          const mediaRes = await updateCoachMedia({
            coachId: created.coachId,
            logo_Url: logoUrl,
            profile_Pic_Url: profilePicUrl,
          });
          if (!isApiSuccess(mediaRes)) {
            mediaWarning =
              firstApiError(mediaRes) ??
              "Account created, but profile images could not be saved. You can add them later in the app.";
          }
        } catch (error) {
          mediaWarning =
            error instanceof Error ?
              `Account created, but image upload failed: ${error.message}`
            : "Account created, but image upload failed. You can add photos later in the app.";
        }
      }

      setStatus(mediaWarning ? "error" : "success");
      setMessage(
        mediaWarning ??
          "Registration successful. Check your email for login credentials.",
      );
      if (!mediaWarning) {
        setTimeout(() => router.push("/coach-login"), 2500);
      }
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Registration failed.",
      );
    }
  }

  const busy = status === "loading";

  return (
    <form action={onSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          name="coachName"
          label="Coach name"
          required
          disabled={busy}
        />
        <TextField name="businessName" label="Business name" disabled={busy} />
        <TextField
          name="mobile"
          label="Mobile"
          required
          type="tel"
          disabled={busy}
        />
        <TextField
          name="email"
          label="Email"
          required
          type="email"
          disabled={busy}
        />
        <TextField name="pin" label="PIN code" disabled={busy} />
        <TextField name="state" label="State" disabled={busy} />
        <TextField name="city" label="City" disabled={busy} />
        <TextField name="address" label="Address" disabled={busy} />
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-mc-secondary">
          Media &amp; profile
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <ImagePicker
            label="Logo"
            hint="JPG, PNG, or WebP · max 2 MB"
            value={logo}
            onChange={(file) => setSlot("logo", file)}
            disabled={busy}
          />
          <ImagePicker
            label="Profile photo"
            hint="JPG, PNG, or WebP · max 2 MB"
            value={photo}
            onChange={(file) => setSlot("photo", file)}
            disabled={busy}
          />
        </div>
        <p className="mt-2 text-xs text-ink-muted">
          Optional. Photos upload after your account is created.
        </p>
      </div>

      <TextAreaField
        name="description"
        label="Description"
        rows={4}
        disabled={busy}
        placeholder="Tell clients about your coaching style…"
      />

      <button
        type="submit"
        disabled={busy}
        className="mc-btn-primary w-full sm:w-auto"
      >
        {busy ? "Submitting…" : "Create coach account"}
      </button>

      {message ?
        <AlertBanner tone={status === "success" ? "success" : "error"}>
          {message}{" "}
          {status === "success" ?
            <Link href="/coach-login" className="font-semibold underline">
              Go to login
            </Link>
          : null}
          {status === "error" && message.startsWith("Account created") ?
            <>
              {" "}
              <Link href="/coach-login" className="font-semibold underline">
                Go to login
              </Link>
            </>
          : null}
        </AlertBanner>
      : null}

      {/* Keep max size in the DOM for accessibility / tooling; unused at runtime. */}
      <span className="sr-only" aria-hidden>
        Max image bytes {REGISTER_IMAGE_MAX_BYTES}
      </span>
    </form>
  );
}

function ImagePicker({
  label,
  hint,
  value,
  onChange,
  disabled,
}: {
  label: string;
  hint: string;
  value: PickedImage | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}) {
  const inputId = useId();

  return (
    <div className="block">
      <span className="mc-field-label">{label}</span>
      <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3 shadow-sm">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-mc-secondary-light/40 ring-1 ring-mc-secondary/15">
          {value ?
            // eslint-disable-next-line @next/next/no-img-element -- local blob preview
            <img
              src={value.previewUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          : <span className="flex h-full w-full items-center justify-center text-[10px] font-semibold tracking-wide text-mc-secondary uppercase">
              Add
            </span>
          }
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-ink">
            {value ? value.file.name : "No file chosen"}
          </p>
          <p className="mt-0.5 text-xs text-ink-muted">{hint}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <label
              htmlFor={inputId}
              className={`inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-mc-header-bottom px-3 text-xs font-semibold text-white ${
                disabled ? "pointer-events-none opacity-60" : "hover:opacity-90"
              }`}
            >
              Choose
            </label>
            {value ?
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(null)}
                className="inline-flex min-h-11 items-center rounded-lg px-3 text-xs font-semibold text-mc-destructive hover:underline disabled:opacity-60"
              >
                Remove
              </button>
            : null}
          </div>
          <input
            id={inputId}
            type="file"
            accept={REGISTER_IMAGE_ACCEPT}
            disabled={disabled}
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              onChange(file);
              e.target.value = "";
            }}
          />
        </div>
      </div>
    </div>
  );
}
