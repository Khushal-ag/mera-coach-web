/**
 * Language codes a coach can pick for the translated copy of diet plans and reports.
 * The API stores the code (for example "hi"). Same list as the app's `src/data/localLanguages.ts`.
 */
export const LOCAL_LANGUAGE_OPTIONS = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "mr", label: "Marathi" },
  { code: "gu", label: "Gujarati" },
  { code: "bn", label: "Bengali" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "kn", label: "Kannada" },
  { code: "ml", label: "Malayalam" },
  { code: "pa", label: "Punjabi" },
] as const;
