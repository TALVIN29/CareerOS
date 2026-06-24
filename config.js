window.__APP_TOKEN__ = window.__APP_TOKEN__ || '';
window.__API_URL__ = window.__API_URL__ || 'https://signalpath-demo.local';

tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: '#04060f',
        surface: '#090e1c',
        card: '#0d1527',
        border: 'rgba(6,182,212,0.15)',
        accent: '#06b6d4',
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
    },
  },
};
