import type { CoachSession } from "@/lib/auth/types";
import type { CoachLoginInput, CoachLoginResult } from "@/types/auth";

import { isSubscriptionRequired } from "@/config/practice";
import { apiFetch } from "@/lib/api/client";
import { firstApiError, isApiSuccess } from "@/lib/api/normalize";
import { ApiRequestError } from "@/lib/api/types";
import { hashPassword } from "@/lib/auth/hash";
import { ensurePremiumStatus } from "@/lib/auth/premium-status";
import { saveSession } from "@/lib/auth/session";
import { sessionFromLoginResult } from "@/lib/auth/session-from-login";

type WebLoginResult = {
  error: string | null;
  session: CoachSession | null;
};

/**
 * Coach login against meracoachapi `/Auth/login` (same as Expo app).
 * Password is SHA-256 hex hashed client-side before send.
 */
export async function loginCoach(
  body: CoachLoginInput,
): Promise<WebLoginResult> {
  const userName = body.userName.trim();
  const password = body.password;
  if (!userName || !password) {
    return {
      error: "Email or mobile and password are required.",
      session: null,
    };
  }

  try {
    const hashedPassword = await hashPassword(password);
    const envelope = await apiFetch<CoachLoginResult>("/Auth/login", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({
        userName,
        password: hashedPassword,
        userType: "COACH",
      }),
    });

    if (!isApiSuccess(envelope)) {
      return {
        error: firstApiError(envelope) ?? "Login failed.",
        session: null,
      };
    }

    const session = sessionFromLoginResult(envelope.responseObj);
    if (!session) {
      return {
        error: "Login succeeded but no session token was returned.",
        session: null,
      };
    }

    saveSession(session);
    if (isSubscriptionRequired()) {
      void ensurePremiumStatus().catch(() => undefined);
    }
    return { error: null, session };
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return { error: error.message, session: null };
    }
    return {
      error: error instanceof Error ? error.message : "Login failed.",
      session: null,
    };
  }
}
