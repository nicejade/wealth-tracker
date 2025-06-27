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
      sm: '0.125rem',
      DEFAULT: '0.25rem',
      DEFAULT: '4px',
      md: '0.375rem',
      lg: '0.5rem',
      full: '9999px',
      large: '12px',
    },
    colors: {
      brand: {
        DEFAULT: '#f59e0b',
      },
      warn: {
        DEFAULT: '#f59e0b',
      },
      mark: {
        DEFAULT: '#ff4582',
      },
      success: {
        DEFAULT: '#2edfa3',
      },
      link: {
        DEFAULT: '#f8d826',
      },
      grey: {
        DEFAULT: '#B7B8B9',
      },
      blue: {
        DEFAULT: '#0ea5e9',
      },
    },
    extend: {
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
              color: '#f8d826',
              textDecoration: 'none',
            },
            pre: {
              border: '1px solid #e8e8e8',
              borderRadius: '0.5rem',
            },
            'pre, code': {
              color: '#213547',
              backgroundColor: '#ffffff',
            },
            'p code': {
              backgroundColor: '#f3f4f6',
              color: '#f59e0b',
              fontWeight: '400',
              borderRadius: '0.25rem',
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
    ({ addUtilities }) => {
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
          'scrollbar-color': '#B7B8B9 #ffffff',
          '&::-webkit-scrollbar-thumb': {
            'background-color': '#ffffff',
          },
        },
      }
      addUtilities(newUtilities)
    },
  ],
}
