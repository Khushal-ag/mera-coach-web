import { Suspense } from "react";
import { cacheLife } from "next/cache";

import { RegisterForm } from "@/components/auth/register-form";
import { siteConfig } from "@/config/site";
import { fetchCoachCategories } from "@/lib/api/master";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata({
  title: "Register as a Coach | Mera Coach",
  description:
    "Create a free coach account on Mera Coach in a few minutes. Get a public profile, manage clients and receive enquiries from people looking for a coach.",
  path: siteConfig.links.register,
  absolute: true,
});

async function loadCategories() {
  "use cache";
  cacheLife("minutes");
  try {
    return await fetchCoachCategories();
  } catch {
    return [];
  }
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterBody />
    </Suspense>
  );
}

async function RegisterBody() {
  const categories = await loadCategories();
  return <RegisterForm categories={categories} />;
}
