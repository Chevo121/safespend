import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#101218",
        moss: "#425740",
        mint: "#9DE6BF",
        coral: "#F27F6F",
        lemon: "#F3D66B",
        cloud: "#F6F5EF"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(16, 18, 24, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
