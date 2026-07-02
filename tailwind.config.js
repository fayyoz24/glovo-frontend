/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FBF3E4",
        ink: "#201A14",
        marigold: {
          DEFAULT: "#F0A202",
          dark: "#C97F00",
          light: "#FFD980",
        },
        pomegranate: {
          DEFAULT: "#B8272C",
          dark: "#8E1D22",
          light: "#F4D7D6",
        },
        ceramic: {
          DEFAULT: "#1B6E76",
          dark: "#12494F",
          light: "#D6E9E9",
        },
        sand: "#EFE3C8",
      },
      fontFamily: {
        display: ["Unbounded", "sans-serif"],
        body: ["Plus Jakarta Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        tile: "1.25rem",
      },
      boxShadow: {
        tile: "0 2px 0 0 rgba(32,26,20,0.08)",
        card: "0 8px 24px -12px rgba(32,26,20,0.25)",
      },
      backgroundImage: {
        "tile-pattern":
          "radial-gradient(circle at 1px 1px, rgba(32,26,20,0.06) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};
