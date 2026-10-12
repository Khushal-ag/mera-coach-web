import type { CoachLoginInput, CoachLoginResult } from "@/types/auth";

import { apiFetch } from "@/lib/api/client";

export async function loginCoach(body: CoachLoginInput) {
  return apiFetch<CoachLoginResult>("/v1/Auth/login", {
    method: "POST",
    body: JSON.stringify({ ...body, userType: "COACH" }),
  });
}
