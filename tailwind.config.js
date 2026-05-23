/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        field: "#15803d",
        ink: "#17211b",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(23, 33, 27, 0.08)",
      },
    },
  },
  plugins: [],
};
