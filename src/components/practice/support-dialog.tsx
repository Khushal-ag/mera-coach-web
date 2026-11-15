"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { siteConfig } from "@/config/site";
import { copyText } from "@/lib/clipboard";
import {
  accountDeletionMailto,
  supportEmail,
  supportMailto,
} from "@/lib/support";
import { cn } from "@/lib/utils";

type Kind = "help" | "delete";

const ROW =
  "flex min-h-11 w-full items-center gap-3 rounded-[10px] px-2 text-left text-[14px] font-semibold sm:px-3";
const TRIGGER =
  "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[10px] border-2 px-4 font-display text-[13px] font-semibold sm:w-auto";

/**
 * Help & Support and Delete account. A bare mailto link does nothing on a
 * device without a mail app, so each opens a dialog that always shows the
 * address, can copy it, and still offers the mail app as a shortcut.
 */
export function SupportActions({ list = false }: { list?: boolean }) {
  const [open, setOpen] = useState<Kind | null>(null);
  const ref = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  async function copy() {
    const ok = await copyText(supportEmail);
    setCopied(ok);
    if (ok) window.setTimeout(() => setCopied(false), 2000);
  }

  const isDelete = open === "delete";

  return (
    <>
      <button
        type="button"
        className={
          list ?
            cn(ROW, "text-ink hover:bg-mc-secondary-light")
          : cn(
              TRIGGER,
              "border-mc-secondary bg-white text-mc-secondary hover:bg-mc-secondary-light",
            )
        }
        onClick={() => setOpen("help")}
      >
        <i
          className={cn(
            "fas fa-life-ring",
            list && "w-4 text-center text-mc-secondary",
          )}
          style={{ fontSize: 16 }}
          aria-hidden
        />
        Help &amp; Support
      </button>
      <button
        type="button"
        className={
          list ?
            cn(ROW, "text-mc-destructive hover:bg-[var(--mc-destructive-soft)]")
          : cn(
              TRIGGER,
              "border-mc-destructive bg-[var(--mc-destructive-soft)] text-mc-destructive hover:bg-white",
            )
        }
        onClick={() => setOpen("delete")}
      >
        <i
          className={cn("fas fa-trash-alt", list && "w-4 text-center")}
          style={{ fontSize: 16 }}
          aria-hidden
        />
        Delete account
      </button>

      <dialog
        ref={ref}
        className="mc-dialog"
        aria-labelledby="mc-dialog-title"
        onClose={() => setOpen(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(null);
        }}
      >
        <div className="mc-dialog-body">
          <h2 id="mc-dialog-title" className="mc-dialog-title">
            {isDelete ? "Delete your account" : "Help & Support"}
          </h2>
          <p className="mc-dialog-text">
            {isDelete ?
              "Account deletion removes your coach profile, clients and reports permanently. Email us from your registered address and we will confirm and process the request."
            : "Questions about your account, clients or reports? Email us and we will get back to you."
            }
          </p>
          <div className="mc-dialog-email">
            <span>{supportEmail}</span>
            <button type="button" onClick={() => void copy()}>
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="mc-dialog-actions">
            <a
              href={isDelete ? accountDeletionMailto() : supportMailto()}
              className={isDelete ? "mc-dialog-danger" : "mc-dialog-primary"}
            >
              {isDelete ? "Request deletion by email" : "Open email app"}
            </a>
            {isDelete ? null : (
              <Link
                href={siteConfig.links.contact}
                className="mc-dialog-secondary"
              >
                Contact page
              </Link>
            )}
            <button
              type="button"
              className="mc-dialog-secondary"
              onClick={() => setOpen(null)}
            >
              Close
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
