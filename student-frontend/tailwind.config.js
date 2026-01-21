/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Your provided colors:
        'custom-blue-light': '#2563EB', // For your main accents (e.g., Sign In button)
        'custom-blue-dark': '#002F97',  // For deep shadows or primary headers
        
        // This is the approximate hex for the Tailwind default bg-blue-100 (for the light background)
        'brand-bg-light': '#DBEAFE', 
        
        // You can also redefine your main primary color for simplicity:
        'primary': '#2563EB',
      },
    },
  },
  plugins: [],
}