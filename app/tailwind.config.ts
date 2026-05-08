import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        arena: "#101416",
        panel: "#182127",
        neon: "#b72026",
        trophy: "#42515a",
        steel: "#42515a"
      }
    }
  },
  plugins: []
};

export default config;
