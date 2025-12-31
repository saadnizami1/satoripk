import type { Config } from "tailwindcss";

const config: Config = {
 
  
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
      },
      colors: {
        matcha: {
          "50": "#f5f7f4",
          "100": "#e8ede5",
          "200": "#d1dbc9",
          "300": "#b0c2a4",
          "400": "#8da67d",
          "500": "#708d62",
          "600": "#5a7450",
          "700": "#475b3f",
          "800": "#3a4a35",
          "900": "#313e2d",
        },
        cream: {
          "50": "#fdfcfb",
          "100": "#faf8f5",
          "200": "#f5f1ea",
          "300": "#ede6db",
          "400": "#e3d6c5",
          "500": "#d4c3ad",
          "600": "#c0aa8f",
          "700": "#a68d71",
          "800": "#88735d",
          "900": "#6f5f4d",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;