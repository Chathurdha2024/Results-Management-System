/** @type {import('tailwindcss').Config} */
export default {
  content:[
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary (Blues)
        primary: {
          DEFAULT: '#2563EB', // Standard Primary Blue
          light: '#DBEAFE',   // Light Blue background
          600: '#2563EB',     
          700: '#1D4ED8',     // Darker Blue for hovers
        },
        // Secondary (Greens)
        secondary: {
          DEFAULT: '#22C55E', // Standard Green
          light: '#DCFCE7',
        },
        // Layout Colors
        background: '#F8FAFC',
        card: '#FFFFFF',
        textPrimary: '#0F172A',
        textSecondary: '#64748B',
      },
    },
  },
  plugins:[],
}