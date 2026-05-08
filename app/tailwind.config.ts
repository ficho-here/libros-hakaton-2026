import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        arena: "#080A12",
        panel: "#121827",
        neon: "#4ADE80",
        trophy: "#FACC15"
      }
    }
  },
  plugins: []
};

export default config;
