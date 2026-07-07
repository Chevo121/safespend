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
        ink: "#111318",
        cloud: "#F2F3F5"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(17, 19, 24, 0.10)",
        card: "0 1px 2px rgba(17, 19, 24, 0.05), 0 8px 24px rgba(17, 19, 24, 0.05)"
      }
    }
  },
  plugins: []
};

export default config;
