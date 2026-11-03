/** Image upload rules shared by registration and profile uploads. */

export const REGISTER_IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";
export const REGISTER_IMAGE_MAX_BYTES = 5 * 1024 * 1024; // 5 MB, same as the API
export const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
