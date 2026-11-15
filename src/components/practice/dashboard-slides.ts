import type { ValidityInfo } from "@/lib/validity";
import type { CoachPost } from "@/types/showcase";

import { isSubscriptionRequired } from "@/config/practice";
import { siteConfig } from "@/config/site";
import { DASHBOARD_CAROUSEL } from "@/constants/ui";

export type SlideCta = {
  icon: string;
  label: string;
  href?: string;
  action?: "addClient";
};

export type Slide = {
  id: string;
  /** 1 forest, 2 gold, 3 rust: the colour carries urgency. */
  tone: 1 | 2 | 3;
  tag: { icon: string; label: string };
  title: string;
  em: string;
  text: string;
  cta: SlideCta;
  icon?: string;
  ring?: number;
};

/** How many gallery, event and success posts the coach has published. */
export type PostCounts = { gallery: number; event: number; success: number };

export function countPosts(posts: CoachPost[]): PostCounts {
  const counts: PostCounts = { gallery: 0, event: 0, success: 0 };
  for (const post of posts) {
    if (post.categoryCode === "GALLERY") counts.gallery += 1;
    else if (post.categoryCode === "EVENT") counts.event += 1;
    else if (post.categoryCode === "SUCCESS") counts.success += 1;
  }
  return counts;
}

export type SlideInput = {
  /** False until the counts and profile have loaded. */
  ready: boolean;
  completion: number | null;
  missing: string[];
  clientCount: number;
  openLeadCount: number;
  dueCount: number;
  packageCount: number | null;
  postCounts: PostCounts | null;
  validity: ValidityInfo | null | undefined;
  profileHref: string;
};

/**
 * Highlights for the dashboard carousel, most urgent first, then guidance.
 * Pure so it can be tested without rendering.
 */
export function buildDashboardSlides({
  ready,
  completion,
  missing,
  clientCount,
  openLeadCount,
  dueCount,
  packageCount,
  postCounts,
  validity,
  profileHref,
}: SlideInput): Slide[] {
  const list: Slide[] = [];
  if (!ready || completion == null) return list;
  if (validity && validity.tone !== "ok" && isSubscriptionRequired()) {
    const expired = validity.tone === "expired";
    list.push({
      id: "renew",
      tone: 3,
      tag: { icon: "fas fa-crown", label: "Subscription" },
      title: expired ? "Your plan has" : "Your plan ends",
      em: expired ? "expired" : `in ${validity.daysLeft} days`,
      text:
        expired ?
          "Renew to keep adding clients and keep your public page live."
        : "Renew before it ends so your clients, reports and public page stay available.",
      cta: {
        href: siteConfig.links.premium,
        icon: "fas fa-sync-alt",
        label: "Renew now",
      },
      icon: "fas fa-crown",
    });
  }
  if (clientCount === 0) {
    list.push({
      id: "first-client",
      tone: 1,
      tag: { icon: "fas fa-user-plus", label: "Get started" },
      title: "Add your",
      em: "first client",
      text: "Record height, weight and goals once. Mera Coach works out BMI, a diet plan and the progress report for you.",
      cta: {
        action: "addClient",
        icon: "fas fa-user-plus",
        label: "Add client",
      },
      icon: "fas fa-user-plus",
    });
  }
  if (completion < 100) {
    list.push({
      id: "profile",
      tone: 1,
      tag: { icon: "fas fa-user-circle", label: "Profile" },
      title: "Your profile is",
      em: `${completion}% complete`,
      text:
        missing.length ?
          `Still needed: ${missing.slice(0, 3).join(", ")}${missing.length > 3 ? " and more" : ""}. Clients see this on your public page.`
        : "Finish your profile so clients can find you.",
      cta: {
        href: "/dashboard/profile",
        icon: "fas fa-edit",
        label: "Complete profile",
      },
      ring: completion,
    });
  }
  if (openLeadCount > 0) {
    list.push({
      id: "leads",
      tone: 2,
      tag: { icon: "fas fa-bell", label: "New enquiries" },
      title:
        openLeadCount === 1 ? "1 person is" : `${openLeadCount} people are`,
      em: "waiting to hear from you",
      text: "Replying within a day makes an enquiry far more likely to become a client.",
      cta: {
        href: "/dashboard/leads",
        icon: "fas fa-comments",
        label: "View enquiries",
      },
      icon: "fas fa-filter",
    });
  }
  if (dueCount > 0) {
    list.push({
      id: "due",
      tone: 2,
      tag: { icon: "fas fa-clipboard-check", label: "Check-ups" },
      title: dueCount === 1 ? "1 client is" : `${dueCount} clients are`,
      em: "due for a re-checkup",
      text: "Regular check-ups show progress and keep clients coming back.",
      cta: {
        href: "/dashboard/checkups",
        icon: "fas fa-clipboard-list",
        label: "See who is due",
      },
      icon: "fas fa-clipboard-check",
    });
  }
  if (completion >= 100 && packageCount === 0) {
    list.push({
      id: "packages",
      tone: 2,
      tag: { icon: "fas fa-box", label: "Packages" },
      title: "Show clients",
      em: "what you offer",
      text: "Bundle the products you recommend into a package with its own price. It appears on your public page.",
      cta: {
        href: "/dashboard/packages",
        icon: "fas fa-plus",
        label: "Create a package",
      },
      icon: "fas fa-box",
    });
  }
  if (completion >= 100 && postCounts?.event === 0) {
    list.push({
      id: "events",
      tone: 1,
      tag: { icon: "fas fa-calendar-alt", label: "Posts" },
      title: "Share a workshop or",
      em: "free webinar",
      text: "Photos and videos of your workshops on your public page bring new people to you.",
      cta: {
        href: "/dashboard/events",
        icon: "fas fa-plus",
        label: "Add a post",
      },
      icon: "fas fa-calendar-alt",
    });
  }
  if (completion >= 100) {
    list.push({
      id: "share",
      tone: 2,
      tag: { icon: "fas fa-share-alt", label: "Grow" },
      title: "Your profile is ready.",
      em: "Share it",
      text: "Send your public page to existing clients and on social media so new clients can reach you directly.",
      cta: {
        href: profileHref,
        icon: "fas fa-share-alt",
        label: "Open public page",
      },
      icon: "fas fa-share-alt",
    });
  }
  // Evergreen help: always available so the carousel never shrinks to one card.
  if (clientCount > 0) {
    list.push({
      id: "diet",
      tone: 1,
      tag: { icon: "fas fa-utensils", label: "Diet plans" },
      title: "Give every client a",
      em: "diet plan",
      text: "Open a client, go to Diet plan and generate daily calories and meals from their assessment. Download it as a PDF to send.",
      cta: {
        href: "/dashboard/clients",
        icon: "fas fa-users",
        label: "Open clients",
      },
      icon: "fas fa-utensils",
    });
    list.push({
      id: "feedback",
      tone: 2,
      tag: { icon: "fas fa-star", label: "Reviews" },
      title: "Ask happy clients for",
      em: "feedback",
      text: "Open a client and tap Ask for feedback. Real ratings build trust on your public page.",
      cta: {
        href: "/dashboard/clients",
        icon: "fas fa-comment-dots",
        label: "Choose a client",
      },
      icon: "fas fa-star",
    });
    list.push({
      id: "progress",
      tone: 1,
      tag: { icon: "fas fa-camera", label: "Progress" },
      title: "Show results with",
      em: "progress photos",
      text: "Upload photos on a client's Overview tab after each check-up so you and they can see the change.",
      cta: {
        href: "/dashboard/clients",
        icon: "fas fa-images",
        label: "Open clients",
      },
      icon: "fas fa-camera",
    });
  }
  if (clientCount > 0 && postCounts?.success === 0) {
    list.push({
      id: "success",
      tone: 1,
      tag: { icon: "fas fa-trophy", label: "Success stories" },
      title: "Share a client's",
      em: "success story",
      text: "Pick a client, add their photo or video and a few words. With your confirmation it appears on your public page.",
      cta: {
        href: "/dashboard/events",
        icon: "fas fa-plus",
        label: "Add a success story",
      },
      icon: "fas fa-trophy",
    });
  }
  if (postCounts?.gallery === 0 || postCounts == null)
    list.push({
      id: "gallery",
      tone: 2,
      tag: { icon: "fas fa-images", label: "Public page" },
      title: "Make your page",
      em: "feel real",
      text: "Add photos or videos of your training sessions and results. Pages with photos get more enquiries.",
      cta: {
        href: "/dashboard/events",
        icon: "fas fa-image",
        label: "Add photos",
      },
      icon: "fas fa-images",
    });
  list.push({
    id: "refer",
    tone: 3,
    tag: { icon: "fas fa-gift", label: "Refer a coach" },
    title: "Know a coach who",
    em: "should be here?",
    text: "Refer a fellow coach to Mera Coach. We will reach out and help them get onboarded.",
    cta: {
      href: siteConfig.links.contact,
      icon: "fas fa-paper-plane",
      label: "Send referral",
    },
    icon: "fas fa-user-plus",
  });
  // Urgent items first, then guidance. Keep the carousel short enough to stay relevant.
  return list.slice(0, DASHBOARD_CAROUSEL.maxSlides);
}
