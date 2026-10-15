/** Marketing content and display data for the home page. */

export const PROOF_AVATARS = [
  "https://randomuser.me/api/portraits/women/44.jpg",
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/women/68.jpg",
  "https://randomuser.me/api/portraits/men/75.jpg",
];

export const BLOG_POSTS = [
  {
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&auto=format&fit=crop&q=80",
    imageAlt: "Nutrition Blog",
    category: "Nutrition",
    categoryStyle: undefined,
    date: "May 20, 2026",
    title: "10 Superfoods That Can Transform Your Health in 30 Days",
    summary:
      "Discover science-backed superfoods that your nutrition coach recommends for improved energy, immunity and overall wellness...",
    authorAvatar: "https://randomuser.me/api/portraits/women/68.jpg",
    authorName: "Dr. Ananya Singh",
    readTime: "5 min read",
  },
  {
    image:
      "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&auto=format&fit=crop&q=80",
    imageAlt: "Yoga Blog",
    category: "Yoga",
    categoryStyle: { background: "#fdf3e0", color: "#b07520" },
    date: "May 18, 2026",
    title: "Morning Yoga Routine: 15 Minutes to a Productive Day",
    summary:
      "Start your day right with this expert-designed morning yoga sequence that boosts energy, reduces anxiety and sharpens focus...",
    authorAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
    authorName: "Priya Mehta",
    readTime: "4 min read",
  },
  {
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop&q=80",
    imageAlt: "Fitness Blog",
    category: "Fitness",
    categoryStyle: { background: "#fdf3e0", color: "#c9882a" },
    date: "May 15, 2026",
    title: "Beginner's Guide to Starting Your Fitness Journey at Any Age",
    summary:
      "Whether you're 25 or 65, it's never too late or too early. Here's your complete beginner-friendly guide to getting fit...",
    authorAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
    authorName: "Rahul Sharma",
    readTime: "6 min read",
  },
];

export const PHONE_DEMO_SCREENS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "add", label: "Add client" },
  { id: "bmi", label: "Body composition" },
  { id: "diet", label: "Diet plan" },
] as const;

export const PHONE_DEMO_SCREEN_MS = 8200;

export const CAT_ICON_BG = [
  "",
  "purple-bg",
  "orange-bg",
  "yellow-bg",
  "blue-bg",
  "pink-bg",
  "teal-bg",
] as const;

export const CAT_COUNT_COLOR = [
  "var(--primary)",
  "#b07520",
  "#2d6a4f",
  "#c9882a",
  "#2d6a4f",
  "#c04b2b",
  "#3b8a65",
] as const;
