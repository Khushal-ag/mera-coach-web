/** Document upload shapes (meracoachapi `/v1/Document/upload`). */

export type CoachDocType = "LOGO" | "PROFILE_PIC";

export type UploadDocumentInput = {
  /** Full data URL: `data:image/jpeg;base64,...` */
  base64DataUrl: string;
  coachCode: string;
  refCode: string;
  refType: "COACH";
  docType: CoachDocType;
  savedBy: number;
};

export type UploadDocumentResult = {
  url: string;
  docId?: number;
};
