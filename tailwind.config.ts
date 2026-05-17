import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        serif: ['var(--font-serif)', 'serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        fv: {
          black: '#0B0908',
          black2: '#15110D',
          black3: '#1E1813',
          ink: '#F1E9DA',
          ink2: '#C8BDA8',
          smoke: '#7A6F5E',
          smokeDim: '#54493B',
          rule: 'rgba(241,233,218,0.08)',
          ruleStrong: 'rgba(241,233,218,0.16)',
          ember: '#EE5A24',
          emberDeep: '#B83E0F',
          amber: '#F39C2C',
          amberPale: '#F5BC8B',
          brass: '#C8A969',
          brassDeep: '#8A6B2E',
        }
      },
      backgroundImage: {
        'fv-grid': 'linear-gradient(rgba(241,233,218,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(241,233,218,0.08) 1px, transparent 1px)',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
