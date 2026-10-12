"use client";

import { useState } from "react";

import { AlertBanner } from "@/components/ui/alert-banner";
import { TextAreaField, TextField } from "@/components/ui/field";
import { firstApiError, isApiSuccess, submitCoachEnquiry } from "@/lib/api";

export function CoachEnquiryForm({ coachCode }: { coachCode: string }) {
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
      setMessage("Enquiry sent. The coach will get in touch soon.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Could not send enquiry.",
      );
    }
  }

  const busy = status === "loading";

  return (
    <form action={onSubmit} className="space-y-4">
      <TextField
        name="clientName"
        label="Your name"
        required
        placeholder="Full name"
        disabled={busy}
      />
      <TextField
        name="clientMobile"
        label="Mobile"
        required
        placeholder="10-digit mobile"
        type="tel"
        disabled={busy}
      />
      <TextField
        name="clientEmail"
        label="Email"
        placeholder="you@example.com"
        type="email"
        disabled={busy}
      />
      <TextAreaField
        name="lookingFor"
        label="I'm looking for"
        required
        rows={3}
        placeholder="Weight loss, nutrition plan, strength training…"
        disabled={busy}
      />

      <button type="submit" disabled={busy} className="mc-btn-primary w-full">
        {busy ? "Sending…" : "Submit enquiry"}
      </button>

      {message ?
        <AlertBanner tone={status === "success" ? "success" : "error"}>
          {message}
        </AlertBanner>
      : null}
    </form>
  );
}
