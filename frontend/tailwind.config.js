/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      // Espacement amélioré pour l'accessibilité
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      // Tailles de police optimisées pour la lisibilité
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5' }],
        'sm': ['0.875rem', { lineHeight: '1.5' }],
        'base': ['1rem', { lineHeight: '1.6' }],
        'lg': ['1.125rem', { lineHeight: '1.6' }],
        'xl': ['1.25rem', { lineHeight: '1.6' }],
        '2xl': ['1.5rem', { lineHeight: '1.5' }],
        '3xl': ['1.875rem', { lineHeight: '1.4' }],
        '4xl': ['2.25rem', { lineHeight: '1.3' }],
        '5xl': ['3rem', { lineHeight: '1.2' }],
      },
      // Focus ring amélioré pour l'accessibilité
      ringWidth: {
        '3': '3px',
      },
      ringColor: {
        'focus': '#3b82f6',
      },
      // Contrastes élevés pour l'accessibilité
      contrast: {
        '25': '.25',
        '75': '.75',
        '125': '1.25',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class', // only generate classes
    }),
    require('@tailwindcss/typography'),
    // Plugin personnalisé pour l'accessibilité
    function ({ addUtilities, theme }) {
      const newUtilities = {
        '.focus-visible-ring': {
          '&:focus-visible': {
            outline: 'none',
            boxShadow: `0 0 0 3px ${theme('colors.blue.500')}`,
            borderRadius: theme('borderRadius.md'),
          },
        },
        '.sr-only-focusable': {
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: '0',
          '&:focus, &:active': {
            position: 'static',
            width: 'auto',
            height: 'auto',
            padding: 'inherit',
            margin: 'inherit',
            overflow: 'visible',
            clip: 'auto',
            whiteSpace: 'normal',
          },
        },
        '.skip-link': {
          position: 'absolute',
          top: '-40px',
          left: '6px',
          background: theme('colors.blue.600'),
          color: theme('colors.white'),
          padding: '8px',
          textDecoration: 'none',
          zIndex: '1000',
          '&:focus': {
            top: '6px',
          },
        },
        '.high-contrast': {
          filter: 'contrast(150%)',
        },
        '.reduced-motion': {
          '@media (prefers-reduced-motion: reduce)': {
            animation: 'none',
            transition: 'none',
          },
        },
      };
      addUtilities(newUtilities);
    },
  ],
}