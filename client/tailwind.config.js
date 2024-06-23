/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          main: "#000000",
          light: "#202933",
          lighter: "#384657",
          contrastText: "white",
        },
        secondary: {
          main: "#a9f901",
          light: "#dcfce7",
          contrastText: "#000000",
        },
      },
    },
  },
  plugins: [],
};
