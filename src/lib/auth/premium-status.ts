import { isSubscriptionRequired } from "@/config/practice";
import { fetchCoachPremiumOffer } from "@/lib/api/practice";
import { getSession, saveSession } from "@/lib/auth/session";

/**
 * In-memory subscription flag on the coach session.
 * Same source as the app `coachPremium` query (`GET /v1/Coach/premium`).
 * Add Client reads the cache and does not wait on the network when it is set.
 * Profile, Premium, and a confirmed payment refresh it.
 */
let generation = 0;
let inflight: {
  token: string;
  promise: Promise<boolean | undefined>;
} | null = null;

export function refreshPremiumStatus(): Promise<boolean | undefined> {
  if (!isSubscriptionRequired()) return Promise.resolve(undefined);
  const token = getSession()?.token;
  if (!token) return Promise.resolve(undefined);
  const gen = ++generation;
  const promise = (async () => {
    try {
      const offer = await fetchCoachPremiumOffer();
      if (gen !== generation) return offer.isPaid;
      const session = getSession();
      if (!session || session.token !== token) return undefined;
      saveSession({ ...session, premiumPaid: offer.isPaid });
      return offer.isPaid;
    } finally {
      if (generation === gen) inflight = null;
    }
  })();
  inflight = { token, promise };
  return promise;
}

/** Use the cached flag. Fetch once only when this session has never loaded it. */
export function ensurePremiumStatus(): Promise<boolean | undefined> {
  if (!isSubscriptionRequired()) return Promise.resolve(undefined);
  const session = getSession();
  if (!session) return Promise.resolve(undefined);
  if (typeof session.premiumPaid === "boolean") {
    return Promise.resolve(session.premiumPaid);
  }
  if (inflight && inflight.token === session.token) return inflight.promise;
  return refreshPremiumStatus();
}
