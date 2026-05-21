/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        bg: '#1c1917',
        surface: '#242018',
        border: '#2e2a26',
        'text-primary': '#f5f0e8',
        'text-secondary': '#7a716c',
        'text-muted': '#5a5450',
        accent: '#c4a882',
        'accent-hover': '#d4b892',
        'text-subtle': '#c5bfb8',
        error: '#c0392b',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
