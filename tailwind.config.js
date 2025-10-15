// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Point this to your JS file(s) where you use Tailwind classes
    "./src/content-script.js", 
    // Include any other HTML files you generate or use
  ],
  theme: {
    extend: {
      // Custom shadow for better native Chrome look
      boxShadow: {
        'chrome': '0 4px 6px rgba(0, 0, 0, 0.12), 0 10px 20px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}