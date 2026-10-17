/** Gallery / Events / Client Success posts and product packages. */

/** Category codes from the post category master. */
export const POST_CATEGORY = {
  gallery: "GALLERY",
  event: "EVENT",
  success: "SUCCESS",
} as const;

/** Document type for a post's photo or video. */
export const POST_MEDIA_DOC_TYPE = "POST_MEDIA" as const;

/** A post's photo or video may be up to this size. */
export const POST_MEDIA_MAX_BYTES = 10 * 1024 * 1024;

export const POST_MEDIA_ACCEPT =
  "image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm,.jpg,.jpeg,.png,.webp,.mp4,.mov,.webm";

export const POST_TITLE_MAX = 150;
export const POST_DESCRIPTION_MAX = 1000;
export const POST_LOCATION_MAX = 200;

export const PACKAGE_NAME_MAX = 100;
export const PACKAGE_MAX_ITEMS = 30;
export const PACKAGE_MAX_AMOUNT = 99_999_999;

/** Public profile: show this many of each before "Show all". */
export const SHOWCASE_PREVIEW = {
  packages: 3,
  gallery: 12,
  events: 3,
  stories: 3,
} as const;
