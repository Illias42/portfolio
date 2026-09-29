import { Geist, Geist_Mono, Herr_Von_Muellerhoff, Newsreader } from "next/font/google";

export const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

/** Display serif for editorial headings; the opsz axis keeps large sizes crisp. */
export const fontSerif = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  axes: ["opsz"],
  display: "swap",
});

/** Handwritten sign-off in the contact section; below the fold, so not preloaded. */
export const fontScript = Herr_Von_Muellerhoff({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
  display: "swap",
  preload: false,
});
