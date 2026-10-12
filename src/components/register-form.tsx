"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { PickedImage } from "@/components/media/image-picker";
import type { MasterOption } from "@/lib/api/master";

import { ImagePicker } from "@/components/media/image-picker";
import { AlertBanner } from "@/components/ui/alert-banner";
import { SelectField, TextAreaField, TextField } from "@/components/ui/field";
import { usePinLocationLookup } from "@/hooks/use-pin-location-lookup";
import { registerCoach, updateCoachMedia } from "@/lib/api/coach";
import { uploadCoachDocument } from "@/lib/api/document";
import { firstApiError, isApiSuccess } from "@/lib/api/normalize";
import {
  fileToBase64DataUrl,
  REGISTER_IMAGE_MAX_BYTES,
  validateRegisterImage,
} from "@/lib/media/image-file";

type ImageSlot = "logo" | "photo";

export function RegisterForm({ categories }: { categories: MasterOption[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [logo, setLogo] = useState<PickedImage | null>(null);
  const [photo, setPhoto] = useState<PickedImage | null>(null);
  const [coachTypeCode, setCoachTypeCode] = useState(() =>
    categories.length === 1 ? (categories[0]?.code ?? "") : "",
  );
  const [pin, setPin] = useState("");
  const [city, setCity] = useState("");
  const [stateCd, setStateCd] = useState("");
  const logoRef = useRef<PickedImage | null>(null);
  const photoRef = useRef<PickedImage | null>(null);

  const pinLookup = usePinLocationLookup(pin, "IN", (loc) => {
    if (loc.city) setCity(loc.city);
    if (loc.state) setStateCd(loc.state);
  });

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
    const category = coachTypeCode.trim();

    if (!coachName || !mobile || !email) {
      setStatus("error");
      setMessage("Coach name, mobile, and email are required.");
      return;
    }
    if (!category) {
      setStatus("error");
      setMessage("Please select a coach category.");
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
        city_Cd: city.trim() || undefined,
        state_Cd: stateCd.trim() || undefined,
        pinCode: pin.trim() || undefined,
        coachDesc:
          String(formData.get("description") ?? "").trim() || undefined,
        coachTypeCode: category,
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
              "Account created, but profile images could not be saved. You can add them later from Profile.";
          }
        } catch (error) {
          mediaWarning =
            error instanceof Error ?
              `Account created, but image upload failed: ${error.message}`
            : "Account created, but image upload failed. You can add photos later from Profile.";
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
        <SelectField
          label="Coach category"
          name="coachTypeCode"
          required
          disabled={busy}
          value={coachTypeCode}
          onChange={(e) => setCoachTypeCode(e.target.value)}
        >
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </SelectField>
        <TextField
          name="pin"
          label="PIN code"
          disabled={busy}
          value={pin}
          inputMode="numeric"
          onChange={(e) => setPin(e.target.value)}
          hint={pinLookup.lookingUp ? "Looking up city…" : undefined}
          error={pinLookup.error || undefined}
        />
        <TextField
          name="state"
          label="State"
          disabled={busy}
          value={stateCd}
          onChange={(e) => setStateCd(e.target.value)}
        />
        <TextField
          name="city"
          label="City"
          disabled={busy}
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <TextField
          name="address"
          label="Address"
          disabled={busy}
          className="sm:col-span-2"
        />
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

      <span className="sr-only" aria-hidden>
        Max image bytes {REGISTER_IMAGE_MAX_BYTES}
      </span>
    </form>
  );
}
