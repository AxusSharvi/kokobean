import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  theme: {
    extend: {
      colors: {
        canvas: 'rgb(var(--color-bg) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        line: 'rgb(var(--color-border) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        muted: 'rgb(var(--color-ink-muted) / <alpha-value>)',
        sage: {
          DEFAULT: 'rgb(var(--color-sage) / <alpha-value>)',
          strong: 'rgb(var(--color-sage-strong) / <alpha-value>)'
        },
        accent: {
          DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
          strong: 'rgb(var(--color-accent-strong) / <alpha-value>)'
        }
      },
      fontFamily: {
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
        body: ['Karla', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Space Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace']
      },
      boxShadow: {
        soft: '0 1px 2px rgb(0 0 0 / 0.04), 0 6px 20px -6px rgb(0 0 0 / 0.10)',
        'soft-lg': '0 2px 4px rgb(0 0 0 / 0.04), 0 16px 36px -12px rgb(0 0 0 / 0.16)'
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        pop: {
          '0%': { transform: 'scale(0.6)', opacity: '0' },
          '60%': { transform: 'scale(1.08)', opacity: '1' },
          '100%': { transform: 'scale(1)' }
        }
      },
      animation: {
        'fade-up': 'fade-up 0.35s ease-out both',
        pop: 'pop 0.25s cubic-bezier(.34,1.56,.64,1) both'
      }
    }
  }
}
