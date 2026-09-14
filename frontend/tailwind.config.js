export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#10B981", 400: "#34D399", 600: "#059669", 700: "#047857" },
        accent: { DEFAULT: "#F59E0B", 600: "#D97706" },
        dark: { DEFAULT: "#1F2937", lighter: "#374151", 600: "#4B5563", 700: "#374151" },
      },
      fontFamily: { sans: ["Inter", "Poppins", "sans-serif"] },
    },
  },
  plugins: [],
};
