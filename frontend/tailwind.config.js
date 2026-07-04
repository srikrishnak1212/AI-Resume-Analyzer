/** @type {import('tailwindcss').Config} */

export default {
  // Dark mode via class strategy — controlled by ThemeContext
  darkMode: 'class',

  // Scan all JS/JSX files for class names
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],

  theme: {
    extend: {
      // ── Color System ────────────────────────────────────────────────────────
      // Reference: UI-Guide.md §2 (Color System)
      // CSS variables are set in index.css via .light and .dark class selectors.
      colors: {
        // Primary
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          light: 'var(--color-primary-light)',
        },
        // Secondary
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          light: 'var(--color-secondary-light)',
        },
        // Semantic
        success: {
          DEFAULT: 'var(--color-success)',
          light: 'var(--color-success-light)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          light: 'var(--color-warning-light)',
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
          light: 'var(--color-danger-light)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
        },
        // Surfaces
        background: 'var(--color-background)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          alt: 'var(--color-surface-alt)',
        },
        // Borders
        border: {
          DEFAULT: 'var(--color-border)',
          strong: 'var(--color-border-strong)',
        },
        // Text
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',
        // Icons
        'icon-default': 'var(--color-icon-default)',
        'icon-active': 'var(--color-icon-active)',

        // Chart colors — consistent across light/dark (UI-Guide.md §2.3)
        chart: {
          1: '#4F46E5', // ATS Score
          2: '#0EA5E9', // Grammar Score
          3: '#22C55E', // Formatting Score
          4: '#F59E0B', // Skills Match
          5: '#EC4899', // Experience Score
          6: '#94A3B8', // Neutral/baseline
        },
      },

      // ── Typography ──────────────────────────────────────────────────────────
      // Reference: UI-Guide.md §3
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'IBM Plex Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        // Custom type scale from UI-Guide.md §3.1
        display: ['36px', { lineHeight: '44px', fontWeight: '700' }],
        h1: ['28px', { lineHeight: '36px', fontWeight: '700' }],
        h2: ['22px', { lineHeight: '30px', fontWeight: '600' }],
        h3: ['18px', { lineHeight: '26px', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        body: ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'body-sm': ['13px', { lineHeight: '18px', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '16px', fontWeight: '500' }],
        label: ['13px', { lineHeight: '16px', fontWeight: '600', letterSpacing: '0.02em' }],
        btn: ['14px', { lineHeight: '20px', fontWeight: '600' }],
        nav: ['14px', { lineHeight: '20px', fontWeight: '500' }],
      },

      // ── Spacing ─────────────────────────────────────────────────────────────
      // Reference: UI-Guide.md §5.1 (4px base unit)
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
        10: '40px',
        12: '48px',
        16: '64px',
      },

      // ── Border Radius ────────────────────────────────────────────────────────
      // Reference: UI-Guide.md §5.2
      borderRadius: {
        sm: '6px',
        DEFAULT: '6px',
        md: '10px',
        lg: '14px',
        xl: '20px',
        full: '9999px',
      },

      // ── Box Shadows ──────────────────────────────────────────────────────────
      // Reference: UI-Guide.md §5.3
      boxShadow: {
        xs: '0 1px 2px rgba(15, 23, 42, 0.04)',
        sm: '0 2px 6px rgba(15, 23, 42, 0.06)',
        DEFAULT: '0 2px 6px rgba(15, 23, 42, 0.06)',
        md: '0 6px 16px rgba(15, 23, 42, 0.08)',
        lg: '0 12px 28px rgba(15, 23, 42, 0.12)',
        focus: '0 0 0 3px rgba(79, 70, 229, 0.25)',
      },

      // ── Max Width ────────────────────────────────────────────────────────────
      // Reference: UI-Guide.md §5.4 (max content width 1440px)
      maxWidth: {
        content: '1440px',
        prose: '65ch',
      },

      // ── Animations ────────────────────────────────────────────────────────────
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'pulse-gentle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-in-right': 'slide-in-right 0.25s ease-out',
        'pulse-gentle': 'pulse-gentle 2s ease-in-out infinite',
        shimmer: 'shimmer 1.5s linear infinite',
      },
    },
  },

  plugins: [],
};
