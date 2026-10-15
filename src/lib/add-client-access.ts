export type AddClientAccess = "wizard" | "paywall";

/**
 * Same rule as the app: the paywall runs only when the subscription flag is on
 * and GET coach premium says the coach is not paid.
 */
export function resolveAddClientAccess(
  subscriptionRequired: boolean,
  isPaid: boolean,
): AddClientAccess {
  if (!subscriptionRequired) return "wizard";
  return isPaid ? "wizard" : "paywall";
}
