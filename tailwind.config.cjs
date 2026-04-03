/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  prefix: 'tu-',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#10C562',
          dark: '#0DA653',
          soft: '#F1F8F5',
          ink: '#0F9F57'
        },
        shell: '#F6F8FA',
        line: '#E1E3E5',
        ink: {
          DEFAULT: '#1A1C1E',
          muted: '#5C5F62',
          soft: '#8A9098'
        }
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        panel: '0 20px 45px rgba(26, 28, 30, 0.08)',
        glow: '0 18px 40px rgba(16, 197, 98, 0.16)'
      },
      borderRadius: {
        panel: '24px'
      },
      backgroundImage: {
        'brand-grid':
          'radial-gradient(circle at 1px 1px, rgba(16, 197, 98, 0.08) 1px, transparent 0)'
      }
    }
  },
  daisyui: {
    themes: [
      {
        productdash: {
          primary: '#10C562',
          'primary-focus': '#0DA653',
          'primary-content': '#FFFFFF',
          secondary: '#EAF7EF',
          'secondary-content': '#1A1C1E',
          accent: '#DFF5E7',
          'accent-content': '#0F9F57',
          neutral: '#1A1C1E',
          'neutral-content': '#FFFFFF',
          'base-100': '#FFFFFF',
          'base-200': '#F6F8FA',
          'base-300': '#E1E3E5',
          'base-content': '#1A1C1E',
          info: '#2563EB',
          success: '#10C562',
          warning: '#F59E0B',
          error: '#EF4444'
        }
      }
    ]
  },
  plugins: [require('daisyui')]
};
