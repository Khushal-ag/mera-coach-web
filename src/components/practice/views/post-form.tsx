"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { ClientSummary } from "@/types/practice";
import type {
  CoachPost,
  PostCategoryOption,
  SavePostInput,
} from "@/types/showcase";

import { useAuth } from "@/components/auth-provider";
import { ClientPicker } from "@/components/practice/views/client-picker";
import { AlertBanner } from "@/components/ui/alert-banner";
import { TextAreaField, TextField } from "@/components/ui/field";
import {
  POST_CATEGORY,
  POST_DESCRIPTION_MAX,
  POST_LOCATION_MAX,
  POST_MEDIA_ACCEPT,
  POST_MEDIA_DOC_TYPE,
  POST_TITLE_MAX,
} from "@/constants/showcase";
import { uploadDocument } from "@/lib/api/document";
import { fetchClientDetail } from "@/lib/api/practice";
import { resolveMediaUrl } from "@/lib/media/media-url";
import { fileToDataUrl, validatePostMedia } from "@/lib/media/post-media";
import { cn } from "@/lib/utils";

type Props = {
  categories: PostCategoryOption[];
  /** Post being edited, or null for a new one. */
  initial: CoachPost | null;
  onPublish: (input: SavePostInput) => Promise<void>;
  onCancel: () => void;
};

function today(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * One screen for Gallery, Workshop & Event and Client Success.
 * The client, and the right-to-share confirmation, apply to Client Success only.
 */
export function PostForm({ categories, initial, onPublish, onCancel }: Props) {
  const { session } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [categoryCode, setCategoryCode] = useState(
    initial?.categoryCode ?? categories[0]?.code ?? "",
  );
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [existingUrl, setExistingUrl] = useState(initial?.mediaUrl ?? "");
  const existingType = initial?.mediaType ?? "image";
  const [clientCode, setClientCode] = useState(initial?.clientCode ?? "");
  const [clientName, setClientName] = useState(initial?.clientName ?? "");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [postDate, setPostDate] = useState(initial?.postDate || today());
  const [location, setLocation] = useState(initial?.location ?? "");
  const [consent, setConsent] = useState(initial?.consentAccepted ?? false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const category = useMemo(
    () => categories.find((c) => c.code === categoryCode),
    [categories, categoryCode],
  );
  const isGallery = categoryCode === POST_CATEGORY.gallery;
  const needsClient = category?.requiresClient ?? false;
  const needsConsent = category?.requiresConsent ?? false;

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function chooseFile(next: File | undefined) {
    if (!next) return;
    const problem = validatePostMedia(next);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setFile(next);
    setPreview(URL.createObjectURL(next));
  }

  function clearMedia() {
    setFile(null);
    setPreview(null);
    setExistingUrl("");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function pickClient(client: ClientSummary) {
    setPickerOpen(false);
    setClientCode(client.clientCode ?? "");
    setClientName(client.name);
    // Success stories usually happen where the client lives: fill it in, but never overwrite what was typed.
    if (!location.trim() && client.clientCode) {
      try {
        const detail = await fetchClientDetail({
          clientCode: client.clientCode,
        });
        if (detail.location)
          setLocation((current) => current || detail.location!);
      } catch {
        // Location stays empty and the coach can type it.
      }
    }
  }

  async function submit() {
    setError(null);
    if (!category) return setError("Choose a category.");
    if (!file && !existingUrl) return setError("Add a photo or video.");
    if (needsClient && !clientCode) return setError("Select the client.");
    if (!title.trim()) return setError("Enter a title.");
    if (needsConsent && !consent) {
      return setError("Confirm that you have the right to share this content.");
    }
    if (!session?.coachCode) return setError("Sign in again to continue.");

    setBusy(true);
    try {
      let mediaUrl = existingUrl;
      if (file) {
        const uploaded = await uploadDocument({
          base64DataUrl: await fileToDataUrl(file),
          coachCode: session.coachCode,
          refCode: session.coachCode,
          refType: "COACH",
          docType: POST_MEDIA_DOC_TYPE,
          savedBy: session.coachId,
        });
        mediaUrl = uploaded.url;
      }
      await onPublish({
        postId: initial?.postId ?? 0,
        categoryCode,
        title: title.trim(),
        description: description.trim(),
        postDate,
        location: location.trim(),
        clientCode: needsClient ? clientCode : "",
        mediaUrl,
        consentAccepted: needsConsent && consent,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not publish.");
    } finally {
      setBusy(false);
    }
  }

  const shownSrc = preview ?? (existingUrl ? resolveMediaUrl(existingUrl) : "");
  const isVideo =
    file ? file.type.startsWith("video/") : existingType === "video";

  return (
    <section className="clt-card min-w-0" aria-label="Add post">
      <div className="clt-card-header">
        <h2>
          <i className="fas fa-images" /> {initial ? "Edit post" : "Add post"}
        </h2>
      </div>
      <div className="clt-card-body grid gap-5">
        {error ?
          <div
            ref={(el) =>
              el?.scrollIntoView({ behavior: "smooth", block: "center" })
            }
          >
            <AlertBanner tone="error">{error}</AlertBanner>
          </div>
        : null}

        <fieldset className="min-w-0">
          <legend className="mc-field-label mb-2">Category</legend>
          <div className="grid gap-2 sm:grid-cols-3" role="radiogroup">
            {categories.map((option) => {
              const on = option.code === categoryCode;
              return (
                <button
                  key={option.code}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setCategoryCode(option.code)}
                  className={cn(
                    "flex min-h-12 items-center gap-3 rounded-2xl border-2 px-4 text-left font-display text-sm font-semibold transition",
                    on ?
                      "border-mc-secondary bg-mc-secondary-light text-mc-secondary"
                    : "border-line bg-white text-ink hover:border-mc-secondary",
                  )}
                >
                  <i className={option.iconClass} aria-hidden />
                  {option.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div>
          <p className="mc-field-label mb-2">Add photo / video</p>
          {shownSrc ?
            <div className="relative overflow-hidden rounded-2xl border border-line bg-black/5">
              {
                isVideo ?
                  <video
                    src={shownSrc}
                    controls
                    preload="metadata"
                    className="max-h-72 w-full object-contain"
                  />
                  // eslint-disable-next-line @next/next/no-img-element
                : <img
                    src={shownSrc}
                    alt="Selected"
                    className="max-h-72 w-full object-contain"
                  />

              }
              <button
                type="button"
                onClick={clearMedia}
                className="absolute top-2 right-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-mc-destructive shadow"
              >
                Remove
              </button>
            </div>
          : <button
              type="button"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                chooseFile(e.dataTransfer.files[0]);
              }}
              className="grid w-full place-items-center gap-1 rounded-2xl border-2 border-dashed border-mc-secondary/40 bg-mc-secondary-light/40 px-4 py-10 text-center transition hover:bg-mc-secondary-light"
            >
              <i
                className="fas fa-cloud-upload-alt text-3xl text-mc-secondary"
                aria-hidden
              />
              <span className="font-display text-base font-bold text-ink">
                Click to upload
              </span>
              <span className="text-xs text-ink-muted">
                Photo or video (max 10 MB)
              </span>
            </button>
          }
          <input
            ref={fileRef}
            type="file"
            accept={POST_MEDIA_ACCEPT}
            className="sr-only"
            tabIndex={-1}
            aria-label="Choose photo or video"
            onChange={(e) => {
              chooseFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>

        {needsClient ?
          <div>
            <p className="mc-field-label mb-2">Client</p>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="mc-field flex min-h-11 w-full items-center justify-between gap-3 text-left"
            >
              <span className={cn(!clientName && "text-ink-muted")}>
                {clientName || "Select client"}
              </span>
              <i
                className="fas fa-chevron-down text-xs text-ink-muted"
                aria-hidden
              />
            </button>
          </div>
        : null}

        <TextField
          label={isGallery ? "Tag" : "Title"}
          required
          value={title}
          maxLength={POST_TITLE_MAX}
          hint={
            isGallery ?
              "What is this photo for? For example Morning batch."
            : undefined
          }
          placeholder={
            isGallery ? "Add a tag for this photo" : "Enter title here"
          }
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextAreaField
          label="Description"
          rows={3}
          value={description}
          maxLength={POST_DESCRIPTION_MAX}
          placeholder="Tell clients about it"
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Date"
            type="date"
            value={postDate}
            onChange={(e) => setPostDate(e.target.value)}
          />
          <TextField
            label="Location"
            value={location}
            maxLength={POST_LOCATION_MAX}
            placeholder="Enter location here"
            hint={
              needsClient ?
                "Filled in from the client's location. You can change it."
              : undefined
            }
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {needsConsent ?
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-mc-secondary-light/60 p-4 text-sm text-ink">
            <input
              type="checkbox"
              className="mt-0.5 size-5 shrink-0 accent-[#1b4332]"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            By publishing, you confirm that you have the right to share this
            content.
          </label>
        : null}

        <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row">
          <button
            type="button"
            className="mc-btn-primary w-full sm:w-auto sm:min-w-[11rem]"
            disabled={busy}
            aria-busy={busy}
            onClick={() => void submit()}
          >
            {busy ? "Publishing" : "Publish"}
            {busy ? null : <i className="fas fa-arrow-right" aria-hidden />}
          </button>
          <button
            type="button"
            className="mc-btn-secondary w-full sm:w-auto"
            disabled={busy}
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>

      <ClientPicker
        open={pickerOpen}
        coachCode={session?.coachCode ?? ""}
        onSelect={(client) => void pickClient(client)}
        onClose={() => setPickerOpen(false)}
      />
    </section>
  );
}
