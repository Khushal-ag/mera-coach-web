/**
 * Every stock photo on the marketing pages. To swap a picture, change its id here; nothing else needs to change.
 * (The one exception is the hero's faint background in `styles/public.css`, which CSS cannot import.)
 */

const UNSPLASH = "https://images.unsplash.com";

/** A photo at a given width. `quality` is the Unsplash `q` value. */
export function unsplash(
  id: string,
  { width = 600, quality = 80 }: { width?: number; quality?: number } = {},
) {
  return `${UNSPLASH}/photo-${id}?w=${width}&auto=format&fit=crop&q=${quality}`;
}

/** A square head-and-shoulders crop of a portrait. */
export function portrait(id: string, size = 160) {
  return `${UNSPLASH}/photo-${id}?w=${size}&h=${size}&auto=format&fit=crop&crop=faces&q=80`;
}

/** Page photos, by where they are used. */
export const PHOTOS = {
  hero: "1571019613454-1cb2f99b2d8b",
  coachCta: "1548438294-1ad5d5f4f063",
  pathCoach: "1593095948071-474c5cc2989d",
  pathMember: "1544367567-0f2fcb009e0b",
  servicesCoachCta: "1571019613454-1cb2f99b2d8b",
  servicesMemberCta: "1544367567-0f2fcb009e0b",
  blogNutrition: "1771541897176-44a3e01dc484",
  blogYoga: "1758797316894-c25b94e8426a",
  blogFitness: "1734873479012-30ff6bf773e3",
} as const;

/**
 * Author and coach portraits. The same person has the same face wherever the name appears: the blog, the
 * fallback coach stories and the hero.
 */
export const PORTRAITS = {
  ananya: "1655249493799-9cee4fe983bb",
  priya: "1726156619056-5de67024df67",
  rahul: "1649433658557-54cf58577c68",
  vikram: "1629425733761-caae3b5f2e50",
  sunita: "1547212371-eb5e6a4b590c",
  arjun: "1757744705465-ea08b0ddc38a",
  /** A client, not a coach: the sign-in page testimonial. */
  client: "1739785248579-cd43cdaac06b",
  /** A fourth face for the hero's row of coach avatars. */
  heroExtra: "1631606929991-200006582c09",
} as const;

/** Coach-card banners by kind of coach (see `COACH_TYPE_STYLES`). The three in a group are used in turn. */
export const COACH_BANNERS = {
  fitness: [
    "1534438327276-14e5300c3a48",
    "1517836357463-d25dfeac3438",
    "1581009137042-c552e485697a",
  ],
  yoga: [
    "1506629082955-511b1aa562c8",
    "1599901860904-17e6ed7083a0",
    "1575052814086-f385e2e2ad1b",
  ],
  nutrition: [
    "1490645935967-10de6ba17061",
    "1512621776951-a57141f2eefd",
    "1498837167922-ddd27525d352",
  ],
  weight: [
    "1552674605-db6ffd4facb5",
    "1571019613454-1cb2f99b2d8b",
    "1476480862126-209bfaa8edc8",
  ],
  wellness: [
    "1571019614242-c5c5dee9f50b",
    "1544367567-0f2fcb009e0b",
    "1559757175-5700dde675bc",
  ],
  fallback: [
    "1476480862126-209bfaa8edc8",
    "1518611012118-696072aa579a",
    "1447452001602-7090c7ab2db3",
  ],
} as const;
