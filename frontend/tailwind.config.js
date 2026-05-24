/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ds-amber':   'var(--amber)',
        'ds-amber-dim': 'var(--amber-dim)',
        'ds-sage':    'var(--sage)',
        'ds-sage-dim':'var(--sage-dim)',
        'ds-sky':     'var(--sky)',
        'ds-sky-dim': 'var(--sky-dim)',
        'ds-crimson': 'var(--crimson)',
        'ds-crimson-dim': 'var(--crimson-dim)',
        'ds-violet':  'var(--violet)',
        'ds-ink-1':   'var(--ink-1)',
        'ds-ink-2':   'var(--ink-2)',
        'ds-ink-3':   'var(--ink-3)',
        'ds-ink-4':   'var(--ink-4)',
        'ds-bg-0':    'var(--bg-0)',
        'ds-bg-1':    'var(--bg-1)',
        'ds-bg-2':    'var(--bg-2)',
      },
      fontFamily: {
        display: 'var(--font-display)',
        tc:      'var(--font-tc)',
        mono:    'var(--font-mono)',
      },
      borderRadius: {
        's': 'var(--radius-s)',
        'm': 'var(--radius-m)',
        'l': 'var(--radius-l)',
        'xl': 'var(--radius-xl)',
      },
    },
  },
  plugins: [],
}
