import {
  Inter,
  Libre_Baskerville,
  Poppins,
  Geist_Mono,
  Oxanium,
  Antic,
  Open_Sans,
} from "next/font/google";

export const inter = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
});

export const libre = Libre_Baskerville({
  variable: "--font-libre-baskerville",
  subsets: ["latin"],
  weight: "400",
});

export const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: "400",
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: "400",
});

export const oxanium = Oxanium({
  variable: "--font-oxanium",
  subsets: ["latin"],
  weight: "400",
});

export const antic = Antic({
  variable: "--font-antic",
  subsets: ["latin"],
  weight: "400",
});

export const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: "400",
});

export const fontClasses = [
  inter.variable,
  libre.variable,
  poppins.variable,
  geistMono.variable,
  oxanium.variable,
  antic.variable,
  openSans.variable,
].join(" ");
