import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Light Mode Colors
        light: {
          primary: '#00BFFF', // Deep Sky Blue
          secondary: '#1E90FF', // Dodger Blue
          background: '#F5F5F5', // White Smoke
          surface: '#FFFFFF', // White
          text: '#333333', // Dark Charcoal
          secondaryText: '#666666', // Dim Gray
          border: '#DDDDDD', // Light Gray
        },
        // Dark Mode Colors
        dark: {
          primary: '#1E90FF', // Dodger Blue
          secondary: '#00BFFF', // Deep Sky Blue
          background: '#121212', // Very Dark Gray
          surface: '#1E1E1E', // Dark Gray
          text: '#E0E0E0', // Light Gray
          secondaryText: '#B0B0B0', // Gray
          border: '#333333', // Charcoal
        },
      },  
    },
    keyframes: {
      shimmer: {
        '100%': {
          transform: 'translateX(100%)',
        },
      },
    },
  },
  plugins: [],
};
export default config;
