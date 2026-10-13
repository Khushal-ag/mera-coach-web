import { photography } from "@/config/photography";

/** Category cover for directory cards. Never a face used as an avatar. */
export function categoryScene(typeName: string): {
  src: string;
  accent: string;
} {
  const t = typeName.toLowerCase();
  if (/(yoga|zumba)/.test(t)) {
    return { src: photography.bannerYoga, accent: "#178676" };
  }
  if (/(nutri|diet)/.test(t)) {
    return { src: photography.bannerNutrition, accent: "#e8a317" };
  }
  if (/(gym|fitness|personal|weight|transform)/.test(t)) {
    return { src: photography.bannerFitness, accent: "#d05c26" };
  }
  if (/(well|health|holistic|lifestyle)/.test(t)) {
    return { src: photography.bannerWellness, accent: "#178676" };
  }
  return { src: photography.bannerWellness, accent: "#d05c26" };
}
