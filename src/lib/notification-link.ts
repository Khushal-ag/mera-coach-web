/** Where a notification should take the coach on the website. An unknown route opens the dashboard. */
export function notificationHref(route: string, refCode?: string): string {
  const code = (refCode ?? "").trim();
  switch (route) {
    case "leads":
      return "/dashboard/leads";
    case "client":
      return code ?
          `/dashboard/clients/${encodeURIComponent(code)}`
        : "/dashboard/clients";
    case "premium":
      return "/premium";
    case "packages":
      return "/dashboard/packages";
    case "posts":
      return "/dashboard/events";
    case "reviews":
      return "/dashboard/reviews";
    default:
      return "/dashboard";
  }
}

/** "Just now", "5 min ago", "3 h ago", "Yesterday", or a date, for the notification list. */
export function timeAgo(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return "";
  const minutes = Math.floor((now.getTime() - then.getTime()) / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return then.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
