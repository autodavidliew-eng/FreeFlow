/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(var(--md-sys-color-primary) / <alpha-value>)',
        onPrimary: 'hsl(var(--md-sys-color-on-primary) / <alpha-value>)',
        primaryContainer:
          'hsl(var(--md-sys-color-primary-container) / <alpha-value>)',
        onPrimaryContainer:
          'hsl(var(--md-sys-color-on-primary-container) / <alpha-value>)',
        secondary: 'hsl(var(--md-sys-color-secondary) / <alpha-value>)',
        onSecondary: 'hsl(var(--md-sys-color-on-secondary) / <alpha-value>)',
        secondaryContainer:
          'hsl(var(--md-sys-color-secondary-container) / <alpha-value>)',
        onSecondaryContainer:
          'hsl(var(--md-sys-color-on-secondary-container) / <alpha-value>)',
        tertiary: 'hsl(var(--md-sys-color-tertiary) / <alpha-value>)',
        onTertiary: 'hsl(var(--md-sys-color-on-tertiary) / <alpha-value>)',
        surface: 'hsl(var(--md-sys-color-surface) / <alpha-value>)',
        surfaceContainer:
          'hsl(var(--md-sys-color-surface-container) / <alpha-value>)',
        surfaceContainerHigh:
          'hsl(var(--md-sys-color-surface-container-high) / <alpha-value>)',
        surfaceContainerHighest:
          'hsl(var(--md-sys-color-surface-container-highest) / <alpha-value>)',
        surfaceVariant:
          'hsl(var(--md-sys-color-surface-variant) / <alpha-value>)',
        onSurface: 'hsl(var(--md-sys-color-on-surface) / <alpha-value>)',
        onSurfaceVariant:
          'hsl(var(--md-sys-color-on-surface-variant) / <alpha-value>)',
        outline: 'hsl(var(--md-sys-color-outline) / <alpha-value>)',
        outlineVariant:
          'hsl(var(--md-sys-color-outline-variant) / <alpha-value>)',
        background: 'hsl(var(--md-sys-color-background) / <alpha-value>)',
        error: 'hsl(var(--md-sys-color-error) / <alpha-value>)',
        onError: 'hsl(var(--md-sys-color-on-error) / <alpha-value>)',
      },
      borderRadius: {
        'm3-xs': 'var(--md-sys-shape-corner-xs)',
        'm3-sm': 'var(--md-sys-shape-corner-sm)',
        'm3-md': 'var(--md-sys-shape-corner-md)',
        'm3-lg': 'var(--md-sys-shape-corner-lg)',
        'm3-xl': 'var(--md-sys-shape-corner-xl)',
        'm3-full': 'var(--md-sys-shape-corner-full)',
      },
      boxShadow: {
        'm3-1': 'var(--md-sys-elevation-1)',
        'm3-2': 'var(--md-sys-elevation-2)',
        'm3-3': 'var(--md-sys-elevation-3)',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
