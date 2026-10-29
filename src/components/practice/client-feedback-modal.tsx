"use client";

import { useEffect, useState } from "react";

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
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !client?.clientCode) return null;

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
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(17, 24, 39, 0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 9999,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 20,
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          width: "100%",
          maxWidth: 520,
          overflow: "hidden",
          border: "1px solid #e5e7eb",
          animation: "scaleIn 0.15s ease-out",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: "#f3effd",
                color: "#7c3aed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              <i className="fas fa-comment-dots" />
            </div>
            <div>
              <h3
                id="feedback-modal-title"
                style={{
                  margin: 0,
                  fontSize: 17,
                  fontWeight: 700,
                  color: "#111827",
                }}
              >
                Client Feedback Link
              </h3>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: 13,
                  color: "#6b7280",
                }}
              >
                For {client.name || "Client"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#9ca3af",
              cursor: "pointer",
              fontSize: 18,
              padding: 6,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Close"
          >
            <i className="fas fa-times" />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px" }}>
          {/* Link Section */}
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: "#374151",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 8,
              }}
            >
              Feedback Form URL
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "#f9fafb",
                border: "1.5px solid #e5e7eb",
                borderRadius: 12,
                padding: "6px 8px 6px 12px",
              }}
            >
              <input
                type="text"
                readOnly
                value={feedbackUrl}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: 13,
                  color: "#1f2937",
                  fontFamily: "monospace",
                }}
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  backgroundColor: copied ? "#10b981" : "#7c3aed",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 14px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  flexShrink: 0,
                }}
              >
                <i className={copied ? "fas fa-check" : "fas fa-copy"} />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Share on WhatsApp */}
          {whatsAppUrl ?
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#374151",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: 8,
                }}
              >
                Direct Share
              </label>
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  backgroundColor: "#25D366",
                  color: "#ffffff",
                  borderRadius: 12,
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: 14,
                  boxShadow: "0 2px 8px rgba(37, 211, 102, 0.25)",
                }}
              >
                <span
                  style={{ display: "flex", alignItems: "center", gap: 10 }}
                >
                  <i className="fab fa-whatsapp" style={{ fontSize: 20 }} />
                  Send to {client.name} (+91 {client.mobileNo})
                </span>
                <i
                  className="fas fa-external-link-alt"
                  style={{ fontSize: 12 }}
                />
              </a>
            </div>
          : null}

          {/* Form Preview info */}
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "#f9fafb",
              borderRadius: 12,
              border: "1px solid #f3f4f6",
              fontSize: 12.5,
              color: "#4b5563",
              lineHeight: 1.5,
            }}
          >
            <div style={{ fontWeight: 600, color: "#1f2937", marginBottom: 2 }}>
              How it works
            </div>
            Clients open this secure link in their mobile or desktop browser to
            rate your sessions, share testimonials, and give honest feedback.
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 24px",
            backgroundColor: "#f9fafb",
            borderTop: "1px solid #f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <a
            href={feedbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#7c3aed",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            Preview form{" "}
            <i className="fas fa-external-link-alt" style={{ fontSize: 11 }} />
          </a>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "8px 18px",
              backgroundColor: "#ffffff",
              border: "1px solid #d1d5db",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: "#374151",
              cursor: "pointer",
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
