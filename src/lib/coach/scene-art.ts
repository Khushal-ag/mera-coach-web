import { photography } from "@/config/photography";

/** Category cover for directory cards. Never a face used as an avatar. */
export function categoryScene(typeName: string): {
  src: string;
  accent: string;
} {
  const t = typeName.toLowerCase();
  if (/(yoga|zumba)/.test(t)) {
    return { src: photography.bannerYoga, accent: "#1b4332" };
  }
  if (/(nutri|diet)/.test(t)) {
    return { src: photography.bannerNutrition, accent: "#c9882a" };
  }
  if (/(gym|fitness|personal|weight|transform)/.test(t)) {
    return { src: photography.bannerFitness, accent: "#c04b2b" };
  }
  if (/(well|health|holistic|lifestyle)/.test(t)) {
    return { src: photography.bannerWellness, accent: "#1b4332" };
  }
  return { src: photography.bannerWellness, accent: "#c04b2b" };
}
