/** Copy for the home page "Coach Stories" carousel. */

import { portrait, PORTRAITS } from "@/constants/images";

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
      "The client management dashboard on Mera Coach saves me at least 3 hours every week. Tracking health data, managing leads and following up, all from one clean interface. Absolutely brilliant!",
  },
  {
    badge: "🌐 Clients from across India",
    icon: "fas fa-globe-asia",
    quote:
      "I am based in a small city but Mera Coach gave me a national presence. I now consult clients from Mumbai, Delhi and Bangalore, all online. This platform broke every geographical barrier for me.",
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
      "The WhatsApp integration on Mera Coach is a game changer. Clients see my profile, tap the button and they are directly chatting with me. No middlemen, no delays. Pure direct connection!",
  },
];

export const FALLBACK_STORIES = [
  {
    coachName: "Rahul Sharma",
    coachCode: "rahul-sharma",
    label: "Fitness Trainer, Delhi",
    avatar: portrait(PORTRAITS.rahul, 600),
    rating: 5,
  },
  {
    coachName: "Priya Mehta",
    coachCode: "priya-mehta",
    label: "Yoga Trainer, Mumbai",
    avatar: portrait(PORTRAITS.priya, 600),
    rating: 5,
  },
  {
    coachName: "Dr. Ananya Singh",
    coachCode: "dr-ananya-singh",
    label: "Clinical Nutritionist, Bangalore",
    avatar: portrait(PORTRAITS.ananya, 600),
    rating: 5,
  },
  {
    coachName: "Vikram Nair",
    coachCode: "vikram-nair",
    label: "Health Coach, Pune",
    avatar: portrait(PORTRAITS.vikram, 600),
    rating: 5,
  },
  {
    coachName: "Sunita Rao",
    coachCode: "sunita-rao",
    label: "Women's Health Expert, Chennai",
    avatar: portrait(PORTRAITS.sunita, 600),
    rating: 5,
  },
  {
    coachName: "Arjun Kapoor",
    coachCode: "arjun-kapoor",
    label: "Lifestyle Mentor, Hyderabad",
    avatar: portrait(PORTRAITS.arjun, 600),
    rating: 5,
  },
];
