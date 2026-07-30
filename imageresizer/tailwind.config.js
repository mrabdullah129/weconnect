/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        glow: '0 20px 80px rgba(37, 99, 235, 0.18)'
      },
      backgroundImage: {
        mesh: 'radial-gradient(circle at top left, rgba(20,184,166,.22), transparent 30%), radial-gradient(circle at 80% 10%, rgba(59,130,246,.25), transparent 32%), linear-gradient(135deg, #f8fafc, #eef6ff 45%, #f7fee7)',
        'mesh-dark': 'radial-gradient(circle at top left, rgba(20,184,166,.16), transparent 30%), radial-gradient(circle at 80% 10%, rgba(96,165,250,.16), transparent 32%), linear-gradient(135deg, #0f172a, #111827 50%, #052e2b)'
      }
    }
  },
  plugins: []
};
