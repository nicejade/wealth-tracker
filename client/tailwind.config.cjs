const { splitVendorChunkPlugin } = require('vite')
const defaultTheme = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: [
    './src/**/*.{html,js,svelte,ts}',
    './node_modules/flowbite/**/*.js',
    './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}',
  ],
  purge: {
    enabled: true,
    content: [
      './src/**/*.{html,js,svelte,ts}',
      './node_modules/flowbite/**/*.js',
      './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}',
    ],
  },
  theme: {
    screens: {
      sm: { max: '640px' },
      md: { max: '768px' },
      lg: { min: '1560px' },
    },
    borderRadius: {
      none: '0',
      sm: '0.375rem',
      DEFAULT: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.75rem',
      full: '9999px',
      large: '12px',
    },
    extend: {
      colors: {
        // Brand palette (kept for identity)
        brand: {
          DEFAULT: '#f59e0b',
          soft: '#FFF7ED',
          muted: '#FBBF24',
        },
        warn: {
          DEFAULT: '#f59e0b',
        },
        mark: {
          DEFAULT: '#ff4582',
        },
        error: {
          DEFAULT: '#ff4582',
        },
        success: {
          DEFAULT: '#2edfa3',
        },
        link: {
          DEFAULT: '#2edfa3',
        },
        grey: {
          DEFAULT: '#86868B',
        },
        silver: {
          DEFAULT: '#D2D2D7',
        },
        blue: {
          ...colors.blue,
          DEFAULT: '#0071E3',
          soft: '#E8F2FF',
        },
        // Apple-inspired semantic surfaces & text
        surface: {
          page: '#F5F5F7',
          card: '#FFFFFF',
          elevated: '#FFFFFF',
          muted: '#FBFBFD',
          glass: 'rgba(255, 255, 255, 0.72)',
        },
        ink: {
          primary: 'var(--color-ink)',
          secondary: 'var(--color-ink-secondary)',
          tertiary: 'var(--color-ink-tertiary)',
          // Alias so old quaternary usages collapse into tertiary
          quaternary: 'var(--color-ink-tertiary)',
        },
        line: {
          DEFAULT: 'var(--color-line)',
          strong: 'var(--color-line-strong)',
          hairline: 'var(--color-line)',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"SF Pro Display"',
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Noto Sans SC"',
          '"Helvetica Neue"',
          'Arial',
          ...defaultTheme.fontFamily.sans,
        ],
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        card: 'var(--shadow-card)',
        elevated: 'var(--shadow-elevated)',
        glass: 'var(--glass-shadow)',
        focus: '0 0 0 3px rgba(0, 113, 227, 0.28)',
        none: 'none',
      },
      transitionTimingFunction: {
        apple: 'cubic-bezier(0.32, 0.72, 0, 1)',
        spring: 'cubic-bezier(0.34, 1.15, 0.64, 1)',
      },
      transitionDuration: {
        180: '180ms',
        250: '250ms',
      },
      zIndex: {
        100: '100',
        1000: '1000',
        9999: '9999',
      },
      maxWidth: {
        tiny: '16rem',
      },
      aspectRatio: {
        '4/3': '4 / 3',
        '190/259': '190 / 259',
      },
      typography: {
        DEFAULT: {
          css: {
            h2: {
              fontSize: '1.4rem',
            },
            'li, pre, code': {
              margin: '0 !important',
              lineHeight: '1.5rem',
            },
            'dl, ul, ol': {
              margin: '0.5rem 0 !important',
              lineHeight: '0',
            },
            'ol li': {
              listStyleType: 'decimal',
              marginLeft: 0,
            },
            'ul li': {
              listStyleType: 'disc',
              marginLeft: 0,
            },
            'div p': {
              marginTop: '0.5rem !important',
              marginBottom: '0.5rem !important',
            },
            'li p': {
              marginTop: '0 !important',
              marginBottom: '0 !important',
            },
            'pre code::before': {
              paddingLeft: 'unset',
            },
            'pre code::after': {
              paddingRight: 'unset',
            },
            img: {
              marginTop: '1rem',
              marginBottom: '1rem',
            },
            a: {
              color: '#0071E3',
              textDecoration: 'none',
            },
            pre: {
              border: '1px solid #e8e8e8',
              borderRadius: '0.75rem',
            },
            'pre, code': {
              color: '#213547',
              backgroundColor: '#ffffff',
            },
            'p code': {
              backgroundColor: '#f3f4f6',
              color: '#f59e0b',
              fontWeight: '400',
              borderRadius: '0.375rem',
            },
            'code::before': {
              content: '""',
              paddingLeft: '0.25rem',
            },
            'code::after': {
              content: '""',
              paddingRight: '0.25rem',
            },
            table: {
              marginTop: '1rem !important',
              marginBottom: '1rem !important',
              'border-top-width': '1px',
              'border-bottom-width': '1px',
            },
            'thead tr th': {
              'padding-top': '0.5rem',
              'padding-bottom': '0.5rem',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('flowbite/plugin'),
    require('@tailwindcss/typography'),
    require('flowbite-typography'),
    ({ addUtilities, addComponents }) => {
      const newUtilities = {
        '.hide-scrollbar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.customized-scrollbar': {
          '-ms-overflow-style': 'thin',
          'scrollbar-width': 'thin',
          'scrollbar-color': '#A1A1A6 transparent',
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            'background-color': '#C7C7CC',
            'border-radius': '9999px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
        },
      }
      addUtilities(newUtilities)

      addComponents({
        '.surface-card': {
          borderRadius: 'var(--radius-shell)',
          borderWidth: '1px',
          borderColor: 'var(--color-line)',
          backgroundColor: '#ffffff',
          boxShadow: 'var(--shadow-soft)',
        },
        '.surface-card-accent': {
          borderRadius: 'var(--radius-shell)',
          borderWidth: '1px',
          borderColor: 'var(--color-line-accent)',
          backgroundImage: 'linear-gradient(165deg, #fffaf0 0%, #ffffff 55%)',
          boxShadow: 'var(--shadow-soft)',
        },
        '.surface-inset': {
          borderRadius: 'var(--radius-inset)',
          borderWidth: '1px',
          borderColor: 'var(--color-line)',
          backgroundColor: '#FBFBFD',
        },
        '.surface-glass': {
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderWidth: '1px',
          borderColor: 'var(--glass-border)',
          boxShadow: 'var(--glass-shadow)',
        },
      })
    },
  ],
}
