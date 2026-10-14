import { Suspense } from "react";
import { cacheLife } from "next/cache";

import { ContactPageView } from "@/components/contact/contact-page";
import { fetchCoachCategories } from "@/lib/api/master";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata({
  title: "Contact Us | Mera Coach",
  description:
    "Whether you're a coach ready to grow, a client seeking guidance, or a brand looking to partner — we'd love to hear from you.",
  path: "/contact",
  absolute: true,
});

async function loadCoachTypes() {
  "use cache";
  cacheLife("minutes");
  try {
    const items = await fetchCoachCategories();
    return items.map((item) => item.label);
  } catch {
    return [] as string[];
  }
}

export default function ContactPage() {
  return (
    <Suspense fallback={null}>
      <ContactBody />
    </Suspense>
  );
}

async function ContactBody() {
  const coachTypes = await loadCoachTypes();
  return <ContactPageView coachTypes={coachTypes} />;
}
