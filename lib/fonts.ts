import { Chakra_Petch, JetBrains_Mono } from "next/font/google";

// next/font downloads and self-hosts these at build time: nothing to npm install,
// no request to Google from the visitor's browser, and a metric-matched fallback
// font is used while loading, so there is no layout jump.

// Squared, technical letterforms that sit close to the Wisscano logo lettering
export const display = Chakra_Petch({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Monospace for the cycling sector line (also keeps the scramble effect from
// changing the width of the text)
export const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});