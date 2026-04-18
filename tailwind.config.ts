import type { Config } from "tailwindcss";
import { legacyTokens } from "./src/styles/legacy/tokens";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./packages/modules/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: legacyTokens.colors.brand.primary,
          dark: legacyTokens.colors.brand.dark,
        },
        surface: {
          bg: legacyTokens.colors.surface.bg,
          card: legacyTokens.colors.surface.card,
          border: legacyTokens.colors.surface.border,
        },
      },
      fontFamily: {
        sans: ["Montserrat", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
};
export default config;
