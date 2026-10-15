/** Client-side image validation + data-URL helpers for Document upload. */

import { ALLOWED_MIME, REGISTER_IMAGE_MAX_BYTES } from "@/constants/media";

type ImageValidationError = {
  message: string;
};

export function validateRegisterImage(file: File): ImageValidationError | null {
  const mime = file.type.toLowerCase();
  if (!ALLOWED_MIME.has(mime)) {
    return {
      message: `"${file.name}" must be a JPG, PNG, or WebP image.`,
    };
  }
  if (file.size <= 0) {
    return { message: `"${file.name}" is empty.` };
  }
  if (file.size > REGISTER_IMAGE_MAX_BYTES) {
    return {
      message: `"${file.name}" is too large. Maximum size is 2 MB.`,
    };
  }
  return null;
}

/** Read a File as a `data:<mime>;base64,...` URL for `/v1/Document/upload`. */
export function fileToBase64DataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string" || !result.startsWith("data:")) {
        reject(new Error(`Could not encode ${file.name}.`));
        return;
      }
      resolve(result);
    };
    reader.readAsDataURL(file);
  });
}
