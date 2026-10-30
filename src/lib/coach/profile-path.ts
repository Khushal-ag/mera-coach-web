/** Public profile path: the friendly name ("harish-bali-health-coach-mathura") when the coach has one, else the coach code. */
export function coachProfilePath(coach: {
  urlFriendlyName?: string | null;
  coachCode?: string | null;
  coachId?: number;
}): string {
  const slug = coach.urlFriendlyName?.trim() || coach.coachCode?.trim();
  return slug ?
      `/coach/${encodeURIComponent(slug)}`
    : `/coach/${coach.coachId}`;
}
