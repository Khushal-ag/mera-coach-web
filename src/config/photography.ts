/**
 * One photograph per surface. Do not point a second page at the same file.
 * Coach login and forgot-password share `authLogin` because they are one door.
 */
export const photography = {
  homeHero: "/mc-images/home-hero.jpg",
  homeFloor: "/mc-images/home-floor.jpg",
  services: "/mc-images/services-session.jpg",
  findCoach: "/mc-images/find-consult.jpg",
  premium: "/mc-images/premium-quiet.jpg",
  bmi: "/mc-images/bmi-height.jpg",
  authLogin: "/mc-images/auth-arrival.jpg",
  authRegister: "/mc-images/auth-setup.jpg",
  practiceHero: "/mc-images/practice-notes.jpg",
  emptyClients: "/mc-images/empty-roster.jpg",
  emptyLeads: "/mc-images/empty-enquiry.jpg",
  emptyEvents: "/mc-images/empty-session.jpg",
} as const;
