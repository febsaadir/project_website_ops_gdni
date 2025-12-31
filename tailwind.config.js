/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom Palette untuk GDN3
        primary: {
          DEFAULT: '#ea580c', // Orange profesional (tidak 'ngejreng')
          hover: '#c2410c',   // Versi lebih gelap untuk hover
        },
        secondary: {
          DEFAULT: '#0ea5e9', // Sky Blue modern
          soft: '#e0f2fe',    // Versi pudar untuk background
        },
        dark: {
          DEFAULT: '#0f172a', // Slate 900 (Pengganti hitam pekat)
          surface: '#1e293b', // Untuk sidebar/card
        },
        light: {
          DEFAULT: '#ffffff',
          bg: '#f8fafc',      // Putih keabu-abuan dikit untuk background utama
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'], // Agar font tidak Times New Roman
      }
    },
  },
  plugins: [],
}