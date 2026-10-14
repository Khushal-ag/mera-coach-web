/**
 * Signed-in coach identity for the website.
 * JWT is kept in memory + sessionStorage (same spirit as app SecureStore),
 * and sent as Authorization: Bearer on meracoachapi calls — not via a Next BFF.
 */
export type CoachSession = {
  token: string;
  coachId: number;
  coachCode: string;
  fullName: string;
  email?: string;
  /**
   * Cached GET /v1/Coach/premium `isPaid`.
   * Undefined until the first load after login or session restore.
   */
  premiumPaid?: boolean;
};
