/** Document upload shapes (meracoachapi `/v1/Document/upload`). */

export type CoachDocType =
  "LOGO" | "PROFILE_PIC" | "GALLERY" | "PACKAGE_IMAGE" | "EVENT_IMAGE";

type ClientDocType = "PROGRESS_PHOTO" | "PROFILE_PIC";

type DocRefType = "COACH" | "CLIENT";

export type UploadDocumentInput = {
  /** Full data URL: `data:image/jpeg;base64,...` */
  base64DataUrl: string;
  coachCode: string;
  refCode: string;
  refType: DocRefType;
  docType: CoachDocType | ClientDocType;
  savedBy: number;
};

export type UploadDocumentResult = {
  url: string;
  docId?: number;
};

export type DocumentListItem = {
  docId: number;
  filePath: string;
  fcdt?: string;
};

export const COACH_GALLERY_DOC_TYPE = "GALLERY" as const;
export const COACH_GALLERY_REF_TYPE = "COACH" as const;
export const COACH_GALLERY_MAX_PHOTOS = 12;
export const COACH_PACKAGE_IMAGE_DOC_TYPE = "PACKAGE_IMAGE" as const;
export const COACH_EVENT_IMAGE_DOC_TYPE = "EVENT_IMAGE" as const;
export const CLIENT_PROGRESS_DOC_TYPE = "PROGRESS_PHOTO" as const;
export const CLIENT_PROGRESS_REF_TYPE = "CLIENT" as const;
export const CLIENT_PROFILE_DOC_TYPE = "PROFILE_PIC" as const;
export const CLIENT_PROFILE_REF_TYPE = "CLIENT" as const;
