import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas:      '#0B0F1A',
        surface:     '#111827',
        'surface-alt': '#1A2235',
        border:      '#1E2D45',
        'text-primary': '#E2E8F0',
        'text-secondary': '#94A3B8',
        'text-dim':   '#4B5563',

        // Status
        'status-occupied':    '#22C55E',
        'status-arriving':    '#F59E0B',
        'status-delayed':     '#EF4444',
        'status-vacant':      '#334155',
        'status-scheduled':   '#6366F1',
        'status-maintenance': '#94A3B8',
        'status-departing':   '#3B82F6',

        // Accent
        accent:       '#3B82F6',
        'accent-dim': '#1D4ED8',

        // Alert
        'alert-critical': '#EF4444',
        'alert-warn':     '#F59E0B',
        'alert-info':     '#3B82F6',
      },
      fontFamily: {
        mono:  ['JetBrains Mono', 'IBM Plex Mono', 'Consolas', 'monospace'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['10px', '14px'],
        xs:    ['11px', '16px'],
        sm:    ['12px', '18px'],
        base:  ['13px', '20px'],
      },
      borderRadius: {
        DEFAULT: '2px',
        sm:  '2px',
        md:  '4px',
        lg:  '4px',
        xl:  '4px',
        full: '9999px',
      },
      boxShadow: {
        none: 'none',
      },
    },
  },
  plugins: [],
}

export default config
