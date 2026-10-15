import type { CoachSession } from "@/lib/auth/types";
import type { CoachLoginResult } from "@/types/auth";

import { pick } from "@/lib/api/normalize";

export function sessionFromLoginResult(
  raw: CoachLoginResult | Record<string, unknown> | null | undefined,
): CoachSession | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const token = String(pick(r, "token", "Token") ?? "").trim();
  const coachId = Number(pick(r, "coachId", "CoachId") ?? 0);
  const coachCode = String(pick(r, "coachCode", "CoachCode") ?? "").trim();
  const fullName = String(
    pick(r, "fullName", "FullName", "coachName", "CoachName") ?? "",
  ).trim();
  const email = String(pick(r, "email", "Email") ?? "").trim();
  const validUpto = String(pick(r, "validUpto", "ValidUpto") ?? "").trim();
  const profileUrl = String(
    pick(
      r,
      "profileUrl",
      "ProfileUrl",
      "profile_Pic_Url",
      "Profile_Pic_Url",
      "profilePicUrl",
      "ProfilePicUrl",
      "profilePic",
      "ProfilePic",
    ) ?? "",
  ).trim();
  if (!token || coachId <= 0) return null;
  return {
    token,
    coachId,
    coachCode,
    fullName: fullName || (coachCode ? `Coach ${coachCode}` : "Coach"),
    email: email || undefined,
    validUpto: validUpto || undefined,
    profileUrl: profileUrl || undefined,
  };
}
