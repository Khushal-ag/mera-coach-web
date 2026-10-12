"use client";

import { useState } from "react";

import { AlertBanner } from "@/components/ui/alert-banner";
import { SelectField, TextAreaField, TextField } from "@/components/ui/field";
import { firstApiError, isApiSuccess, submitCoachEnquiry } from "@/lib/api";

type CoachEnquiryFormProps = {
  coachCode: string;
  coachName?: string;
  lookingForOptions?: string[];
  defaultLookingFor?: string;
};

export function CoachEnquiryForm({
  coachCode,
  coachName,
  lookingForOptions,
  defaultLookingFor,
}: CoachEnquiryFormProps) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setStatus("loading");
    setMessage(null);
    try {
      const response = await submitCoachEnquiry({
        coachCode,
        clientName: String(formData.get("clientName") ?? "").trim(),
        clientMobile: String(formData.get("clientMobile") ?? "").trim(),
        clientEmail:
          String(formData.get("clientEmail") ?? "").trim() || undefined,
        lookingFor:
          String(formData.get("lookingFor") ?? "").trim() || undefined,
      });
      if (!isApiSuccess(response)) {
        setStatus("error");
        setMessage(firstApiError(response) ?? "Could not send enquiry.");
        return;
      }
      setStatus("success");
      setMessage(
        coachName ?
          `Enquiry sent. ${coachName} will get in touch soon.`
        : "Enquiry sent. The coach will get in touch soon.",
      );
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Could not send enquiry.",
      );
    }
  }

  const busy = status === "loading";
  const useSelect = Boolean(lookingForOptions && lookingForOptions.length > 0);

  return (
    <form action={onSubmit} className="space-y-4">
      <TextField
        name="clientName"
        label="Your name"
        required
        placeholder="Full name"
        disabled={busy}
        autoComplete="name"
      />
      <TextField
        name="clientMobile"
        label="Mobile"
        required
        placeholder="10-digit mobile"
        type="tel"
        inputMode="numeric"
        disabled={busy}
        autoComplete="tel"
      />
      <TextField
        name="clientEmail"
        label="Email"
        placeholder="you@example.com"
        type="email"
        disabled={busy}
        autoComplete="email"
      />
      {useSelect ?
        <SelectField
          name="lookingFor"
          label="Enquiring for"
          required
          disabled={busy}
          defaultValue={defaultLookingFor || lookingForOptions![0]}
        >
          {lookingForOptions!.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </SelectField>
      : <TextAreaField
          name="lookingFor"
          label="I'm looking for"
          required
          rows={3}
          placeholder="Weight loss, nutrition plan, strength training…"
          disabled={busy}
          defaultValue={defaultLookingFor}
        />
      }

      <button type="submit" disabled={busy} className="mc-btn-primary w-full">
        {busy ? "Sending…" : "Send my request (it's free)"}
      </button>

      {message ?
        <AlertBanner tone={status === "success" ? "success" : "error"}>
          {message}
        </AlertBanner>
      : null}
    </form>
  );
}
