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
    },
  },
  plugins: [require("daisyui")],
};
