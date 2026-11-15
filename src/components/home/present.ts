import type { CoachPublicListItem } from "@/types/coach";

import {
  CAT_COUNT_COLOR,
  CAT_ICON_BG,
  COACH_TYPE_STYLES,
  DEFAULT_COACH_TYPE_STYLE,
} from "@/constants/home";
import { unsplash } from "@/constants/images";
import { coachProfilePath } from "@/lib/coach/profile-path";

export function categoryStyle(index: number) {
  return {
    iconBg: CAT_ICON_BG[index % CAT_ICON_BG.length],
    countColor: CAT_COUNT_COLOR[index % CAT_COUNT_COLOR.length],
  };
}

export function coachHref(coach: CoachPublicListItem) {
  return coachProfilePath(coach);
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
  const name = typeName.toLowerCase();
  const style =
    COACH_TYPE_STYLES.find((row) =>
      row.words.some((word) => name.includes(word)),
    ) ?? DEFAULT_COACH_TYPE_STYLE;
  const photo = style.banners[idx % style.banners.length] ?? style.banners[0];
  return { banner: unsplash(photo), color: style.color };
}
