import type { CoachPublicListItem } from "@/types/coach";

const CAT_ICON_BG = [
  "",
  "purple-bg",
  "orange-bg",
  "yellow-bg",
  "blue-bg",
  "pink-bg",
  "teal-bg",
] as const;

const CAT_COUNT_COLOR = [
  "var(--primary)",
  "#9333ea",
  "#2d6a4f",
  "#f59e0b",
  "#3b82f6",
  "#ec4899",
  "#0d9488",
] as const;

export function categoryStyle(index: number) {
  return {
    iconBg: CAT_ICON_BG[index % CAT_ICON_BG.length],
    countColor: CAT_COUNT_COLOR[index % CAT_COUNT_COLOR.length],
  };
}

export function coachHref(coach: CoachPublicListItem) {
  return coach.coachCode ?
      `/coach/${encodeURIComponent(coach.coachCode)}`
    : `/coach/${coach.coachId}`;
}

export function serviceTags(names: string) {
  return names
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 3);
}

export function coachBio(desc: string, typeName: string) {
  const bio = desc.trim() || typeName;
  if (bio.length > 110) return `${bio.slice(0, 107)}...`;
  return bio;
}

export function coachTypeStyle(typeName: string, idx = 0) {
  const t = typeName.toLowerCase();

  if (t.includes("gym") || t.includes("fitness") || t.includes("personal")) {
    const imgs = [
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1581009137042-c552e485697a?w=600&auto=format&fit=crop&q=80",
    ];
    return { banner: imgs[idx % imgs.length] ?? imgs[0], color: "#c04b2b" };
  }
  if (t.includes("yoga") || t.includes("zumba")) {
    const imgs = [
      "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=600&auto=format&fit=crop&q=80",
    ];
    return { banner: imgs[idx % imgs.length] ?? imgs[0], color: "#9333ea" };
  }
  if (
    t.includes("nutrition") ||
    t.includes("diet") ||
    t.includes("lifestyle")
  ) {
    const imgs = [
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=80",
    ];
    return { banner: imgs[idx % imgs.length] ?? imgs[0], color: "#f59e0b" };
  }
  if (t.includes("weight") || t.includes("transform")) {
    const imgs = [
      "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&auto=format&fit=crop&q=80",
    ];
    return { banner: imgs[idx % imgs.length] ?? imgs[0], color: "#ec4899" };
  }
  if (
    t.includes("holistic") ||
    t.includes("wellness") ||
    t.includes("health")
  ) {
    const imgs = [
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&auto=format&fit=crop&q=80",
    ];
    return { banner: imgs[idx % imgs.length] ?? imgs[0], color: "#2d6a4f" };
  }
  const def = [
    "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1447452001602-7090c7ab2db3?w=600&auto=format&fit=crop&q=80",
  ];
  return { banner: def[idx % def.length] ?? def[0], color: "#1b4332" };
}

export const STORY_TEMPLATES = [
  {
    badge: "📈 3x more client enquiries",
    icon: "fas fa-chart-line",
    quote:
      "Since joining Mera Coach, my enquiry rate has tripled. The professional profile page and WhatsApp integration makes it so easy for clients to reach me directly. I wish I had joined sooner!",
  },
  {
    badge: "🚀 First client within 7 days",
    icon: "fas fa-rocket",
    quote:
      "I was skeptical at first, but Mera Coach proved me wrong. Within 7 days of setting up my profile, I had my first paid consultation booked. The platform truly delivers what it promises.",
  },
  {
    badge: "💼 Managing 40+ clients easily",
    icon: "fas fa-briefcase",
    quote:
      "The client management dashboard on Mera Coach saves me at least 3 hours every week. Tracking health data, managing leads and following up — all from one clean interface. Absolutely brilliant!",
  },
  {
    badge: "🌐 Clients from across India",
    icon: "fas fa-globe-asia",
    quote:
      "I am based in a small city but Mera Coach gave me a national presence. I now consult clients from Mumbai, Delhi and Bangalore — all online. This platform broke every geographical barrier for me.",
  },
  {
    badge: "⭐ Profile views doubled in 30 days",
    icon: "fas fa-star",
    quote:
      "My Mera Coach profile works for me 24/7. Even while I sleep, potential clients are viewing my page, reading my services and sending enquiries. It is like having a full-time marketing team!",
  },
  {
    badge: "📱 Direct WhatsApp leads daily",
    icon: "fas fa-mobile-alt",
    quote:
      "The WhatsApp integration on Mera Coach is a game changer. Clients see my profile, tap the button and they are directly chatting with me. No middlemen, no delays — pure direct connection!",
  },
] as const;
