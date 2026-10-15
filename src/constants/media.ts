/** Image upload rules shared by registration and profile uploads. */

export const REGISTER_IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";
export const REGISTER_IMAGE_MAX_BYTES = 2 * 1024 * 1024; // 2 MB
export const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
