/**
 * Signed-in coach identity for the website.
 * JWT is kept in memory + localStorage (same spirit as app SecureStore),
 * and sent as Authorization: Bearer on meracoachapi calls: not via a Next BFF.
 */
export type CoachSession = {
  token: string;
  coachId: number;
  coachCode: string;
  fullName: string;
  email?: string;
  /** Subscription end date as returned by login (`validUpto`). */
  validUpto?: string;
  /** Profile photo path/URL as returned by login (`profileUrl`). */
  profileUrl?: string;
  /**
   * Cached GET /Coach/premium `isPaid`.
   * Undefined until the first load after login or session restore.\n   */
  premiumPaid?: boolean;
};
