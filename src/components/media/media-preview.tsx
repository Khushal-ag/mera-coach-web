import Image from "next/image";

type MediaPreviewProps = {
  src: string;
  alt?: string;
  sizes: string;
  className?: string;
};

/**
 * Remote coach/client photos go through `next/image`.
 * Blob and data URLs are local file previews — the optimizer rejects them.
 * Parent must be `relative` with a size (`fill`).
 */
export function MediaPreview({
  src,
  alt = "",
  sizes,
  className = "object-cover",
}: MediaPreviewProps) {
  if (!src) return null;

  if (src.startsWith("blob:") || src.startsWith("data:")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- local file preview
      <img src={src} alt={alt} className={`size-full ${className}`} />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      unoptimized={src.startsWith("http://")}
    />
  );
}
