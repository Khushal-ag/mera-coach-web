import {
  POST_IMAGE_MAX_BYTES,
  POST_VIDEO_MAX_BYTES,
} from "@/constants/showcase";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);

/** Message to show when the file cannot be used, or null when it is fine. */
export function validatePostMedia(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return "Choose a JPG, PNG or WebP photo, or an MP4, MOV or WebM video.";
  }
  if (file.type.startsWith("video/")) {
    if (file.size > POST_VIDEO_MAX_BYTES)
      return "The video is larger than 25 MB. Choose a smaller one.";
  } else if (file.size > POST_IMAGE_MAX_BYTES) {
    return "The photo is larger than 5 MB. Choose a smaller one.";
  }
  return null;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.readAsDataURL(file);
  });
}
