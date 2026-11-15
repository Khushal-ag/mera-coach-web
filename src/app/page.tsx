import { Suspense } from "react";

import { HomeAppPromo } from "@/components/home/home-app-promo";
import { HomeBlog } from "@/components/home/home-blog";
import { HomeBmi } from "@/components/home/home-bmi";
import { HomeCoachCta } from "@/components/home/home-coach-cta";
import { HomeHero } from "@/components/home/home-hero";
import {
  HomeCategories,
  HomeFeaturedCoaches,
  HomeSearchSection,
  HomeStories,
} from "@/components/home/home-live";
import { HomePath } from "@/components/home/home-path";
import {
  HomeHowItWorks,
  HomePlatformFeatures,
} from "@/components/home/home-platform";
import { HomeStats } from "@/components/home/home-stats";
import { siteConfig } from "@/config/site";
import { HOME_SEO } from "@/constants/home";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata({
  ...HOME_SEO,
  path: siteConfig.links.home,
  absolute: true,
});

export default function HomePage() {
  return (
    <div className="mc-public">
      <HomeHero />

      <Suspense
        fallback={
          <div className="search-section">
            <div className="container">
              <div className="search-box" />
            </div>
          </div>
        }
      >
        <HomeSearchSection />
      </Suspense>

      {/* Choose Your Path comes first; the cards then show the coach or the member sections. */}
      <HomePath
        coachPanel={
          <>
            <HomePlatformFeatures />
            <HomeHowItWorks />
            <HomeAppPromo />
          </>
        }
        memberPanel={
          <>
            <Suspense fallback={null}>
              <HomeFeaturedCoaches />
            </Suspense>
            <Suspense fallback={null}>
              <HomeCategories />
            </Suspense>
            <HomeBmi />
          </>
        }
      />

      <HomeStats />

      <Suspense fallback={null}>
        <HomeStories />
      </Suspense>

      <HomeBlog />

      <HomeCoachCta />
    </div>
  );
}
