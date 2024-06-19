/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          main: "#000000",
          contrastText: "white",
        },
        secondary: {
          main: "#a9f901",
          contrastText: "#000000",
        },
      },
    },
  },
  plugins: [],
};
