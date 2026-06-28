/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        field: "#16A34A",
        progress: "#22C55E",
        danger: "#DC2626",
        ink: "#0F172A",
        sun: "#F8FAF5",
        surface: "#FFFFFF",
      },
      boxShadow: {
        soft: "0 14px 34px rgba(15, 23, 42, 0.10)",
      },
    },
  },
  plugins: [],
};
