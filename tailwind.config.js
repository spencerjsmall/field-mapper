/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  daisyui: {
    themes: ["dark"],
  },
  theme: {
    extend: {
      fontFamily: {
        space: ["Space Grotesk", "sans-serif"],
      },
      backgroundImage: {
        ggp: "url('/images/ggp-aerial.jpg')",
        ob: "url('/images/ob-aerial.jpg')",
      },
      colors: {
        todo: "#3454D1",
        mandatory: "#EE6C4D",
        optional: "#FF69B4",
        done: "#8CB369",
        highlighted: "#FFB800",
        "mandatory-mobile": "#3454D1",
        "optional-mobile": "#add8e6",
        "done-mobile": "#8CB369",
      },
    },
  },
  plugins: [require("daisyui")],
};
