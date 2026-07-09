/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B1220",
        surface: "#141B2E",
        surface2: "#1B2438",
        line: "#2A3450",
        trust: "#00A389", // IDBI Green Accent
        alert: "#F58220", // IDBI Orange Accent
        danger: "#E05252",
        fog: "#7C8695",
        paper: "#EDEFF4",
        idbi: {
          green: "#00836C",
          greenLight: "#00A389",
          orange: "#F58220",
          orangeLight: "#FF953F",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
