/** @type {import('tailwindcss').Config} */
export default {  // Change 'module.exports =' to 'export default'
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EDE9FE', 
          600: '#7C3AED', 
        },
        secondary: {
          50: '#CFFAFE', 
          500: '#06B6D4', 
        },
        slate: {
          50: '#F8FAFC', 
          900: '#1E293B', 
        }
      }
    }
  },
  plugins: [],
}