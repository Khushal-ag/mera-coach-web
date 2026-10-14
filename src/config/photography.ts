/**
 * One photograph per surface. Do not point a second page at the same file.
 * Coach login and forgot password share `authLogin` because they are one door.
 * Register and member login each use their own photograph.
 */
export const photography = {
  homeHero: "/mc-images/home-hero.jpg",
  homeFloor: "/mc-images/home-floor.jpg",
  pathMember: "/mc-images/path-member.jpg",
  ctaPractice: "/mc-images/cta-practice.jpg",
  services: "/mc-images/services-session.jpg",
  findCoach: "/mc-images/find-consult.jpg",
  premium: "/mc-images/premium-quiet.jpg",
  bmi: "/mc-images/bmi-height.jpg",
  authLogin: "/mc-images/auth-arrival.jpg",
  authRegister: "/mc-images/auth-setup.jpg",
  bannerFitness: "/mc-images/banner-fitness.jpg",
  bannerYoga: "/mc-images/banner-yoga.jpg",
  bannerNutrition: "/mc-images/banner-nutrition.jpg",
  bannerWellness: "/mc-images/banner-wellness.jpg",
} as const;
