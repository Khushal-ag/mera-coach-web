"use client";

import { useEffect, useRef, useState } from "react";

import type { ClientSummary } from "@/types/practice";

import {
  buildFeedbackMessage,
  buildFeedbackWebUrl,
  buildFeedbackWhatsAppUrl,
} from "@/lib/feedback-url";

type Props = {
  client: ClientSummary | null;
  coachCode: string;
  coachName?: string;
  isOpen: boolean;
  onClose: () => void;
};

export function ClientFeedbackModal({
  client,
  coachCode,
  coachName = "",
  isOpen,
  onClose,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (isOpen && client?.clientCode && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen, client?.clientCode]);

  if (!client?.clientCode) return null;

  const feedbackUrl =
    buildFeedbackWebUrl({
      coachCode,
      clientCode: client.clientCode,
    }) ?? "";

  const message = buildFeedbackMessage({
    clientName: client.name,
    coachName,
    feedbackUrl,
  });

  const whatsAppUrl =
    client.mobileNo ? buildFeedbackWhatsAppUrl(client.mobileNo, message) : null;

  const handleCopy = async () => {
    if (!feedbackUrl) return;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(feedbackUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // fallback if clipboard fails
    }
  };

  return (
    <dialog
      ref={ref}
      className="mc-dialog mc-dialog--feedback"
      aria-labelledby="feedback-modal-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="mc-dialog-head">
        <div className="mc-dialog-head-title">
          <span className="mc-dialog-icon" aria-hidden>
            <i className="fas fa-comment-dots" />
          </span>
          <div className="min-w-0">
            <h3 id="feedback-modal-title">Client Feedback Link</h3>
            <p className="mc-dialog-sub">For {client.name || "Client"}</p>
          </div>
        </div>
        <button
          type="button"
          className="mc-dialog-close"
          onClick={onClose}
          aria-label="Close"
        >
          <i className="fas fa-times" aria-hidden />
        </button>
      </div>

      <div className="mc-dialog-body">
        <div className="mc-dialog-block">
          <span className="mc-dialog-section-label">Feedback form URL</span>
          <div className="mc-dialog-copy-row">
            <input
              type="text"
              readOnly
              value={feedbackUrl}
              aria-label="Feedback form URL"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              type="button"
              className={`mc-dialog-copy-btn${copied ? "is-copied" : ""}`}
              onClick={() => void handleCopy()}
            >
              <i
                className={copied ? "fas fa-check" : "fas fa-copy"}
                aria-hidden
              />
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {whatsAppUrl ?
          <div className="mc-dialog-block">
            <span className="mc-dialog-section-label">Direct share</span>
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mc-dialog-wa"
            >
              <span>
                <i className="fab fa-whatsapp" aria-hidden />
                Send to {client.name} (+91 {client.mobileNo})
              </span>
              <i className="fas fa-external-link-alt" aria-hidden />
            </a>
          </div>
        : null}

        <div className="mc-dialog-hint">
          <strong>How it works</strong>
          <p>
            Clients open this secure link in their mobile or desktop browser to
            rate your sessions, share testimonials, and give honest feedback.
          </p>
        </div>
      </div>

      <div className="mc-dialog-foot">
        <a
          href={feedbackUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mc-dialog-foot-link"
        >
          Preview form <i className="fas fa-external-link-alt" aria-hidden />
        </a>
        <button type="button" className="mc-dialog-foot-done" onClick={onClose}>
          Done
        </button>
      </div>
    </dialog>
  );
}
