import { Nunito, Poppins } from "next/font/google";

/** Headings and buttons: meracoachweb Poppins. */
export const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

/** Body copy: meracoachweb Nunito. */
export const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});
