/** Document upload shapes (meracoachapi `/v1/Document/upload`). */

export type CoachDocType =
  | "LOGO"
  | "PROFILE_PIC"
  | "COVER"
  | "GALLERY"
  | "PACKAGE_IMAGE"
  | "EVENT_IMAGE"
  | "POST_MEDIA";

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
