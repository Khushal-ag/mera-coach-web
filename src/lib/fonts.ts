import { Montserrat, Poppins } from "next/font/google";

/** Headings: matches mera-coach-app Montserrat weights. */
export const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700", "800"],
});

/** Body: matches mera-coach-app Poppins weights. */
export const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});
