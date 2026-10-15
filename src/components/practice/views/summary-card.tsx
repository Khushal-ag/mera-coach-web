"use client";

import { resolveMediaUrl } from "@/lib/media/media-url";

export type SummaryCardProps = {
  title: string;
  icon: string;
  imageUrl?: string;
  lines: { icon?: string; text: string }[];
  note?: string;
  editLabel: string;
  onEdit: () => void;
  onRemove: () => void;
};

/** Read-only card for a package or event, with pencil and bin controls. */
export function SummaryCard({
  title,
  icon,
  imageUrl,
  lines,
  note,
  editLabel,
  onEdit,
  onRemove,
}: SummaryCardProps) {
  const image = resolveMediaUrl(imageUrl);
  return (
    <article className="clt-card flex min-w-0 flex-col overflow-hidden">
      <div className="relative aspect-[16/9] bg-[image:var(--mc-gradient)]">
        {image ?
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
        : <i
            className={`${icon} absolute inset-0 grid place-items-center text-3xl text-white/70`}
            style={{ display: "grid" }}
            aria-hidden
          />
        }
        <div className="absolute top-2 right-2 flex gap-2">
          <button
            type="button"
            onClick={onEdit}
            aria-label={editLabel}
            title={editLabel}
            className="grid size-9 place-items-center rounded-full bg-white/90 text-[#2a4a3a] shadow-md transition hover:bg-white"
          >
            <i className="fas fa-pen" style={{ fontSize: 13 }} aria-hidden />
          </button>
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove"
            title="Remove"
            className="grid size-9 place-items-center rounded-full bg-white/90 text-[#b3361f] shadow-md transition hover:bg-white"
          >
            <i className="fas fa-trash" style={{ fontSize: 13 }} aria-hidden />
          </button>
        </div>
      </div>
      <div className="grid min-w-0 gap-1.5 p-4">
        <h2 className="text-base leading-snug font-bold break-words">
          {title.trim() || "Untitled"}
        </h2>
        {lines.map((line) => (
          <p
            key={line.text}
            className="flex min-w-0 items-start gap-2 text-sm text-[color:var(--mc-muted,#7a6355)]"
          >
            {line.icon ?
              <i className={`${line.icon} mt-1 text-xs`} aria-hidden />
            : null}
            <span className="min-w-0 break-words">{line.text}</span>
          </p>
        ))}
        {note ?
          <p className="line-clamp-2 text-sm text-[color:var(--mc-muted,#7a6355)]">
            {note}
          </p>
        : null}
      </div>
    </article>
  );
}
