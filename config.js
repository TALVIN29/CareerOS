window.__APP_TOKEN__ = window.__APP_TOKEN__ || '';
window.__API_URL__ = window.__API_URL__ || 'https://signalpath-demo.local';

tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: '#050505',
        surface: '#101010',
        card: '#151515',
        border: 'rgba(220,38,38,0.15)',
        accent: '#ef4444',
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
    },
  },
};
