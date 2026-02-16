# Material 3 + Tailwind (FreeFlow)

## Overview

The FreeFlow Next.js app uses Tailwind utilities plus a Material 3-inspired token set.
Tokens are defined as CSS variables and mapped into Tailwind so components can use
`@apply` or utility classes without hard-coding values.

## Tokens

Defined in `apps/web/src/app/globals.css` under `:root`.

- Colors: `--md-sys-color-*`
- Shapes: `--md-sys-shape-corner-*`
- Elevation: `--md-sys-elevation-*`

Legacy `--ff-*` variables are mapped to the new tokens to keep existing styles
stable while migrating to M3 classes.

## Tailwind Mapping

`apps/web/tailwind.config.js` maps tokens to theme keys:

- Colors: `primary`, `secondary`, `surface`, `surfaceContainer`, `outline`, etc.
- Radius: `rounded-m3-*`
- Shadows: `shadow-m3-*`

PostCSS is configured in `apps/web/postcss.config.js` with `tailwindcss` and
`autoprefixer`.

Example utility usage:

- `bg-surface text-onSurface border-outline`
- `rounded-m3-lg shadow-m3-1`

## Component Layer

Defined in `apps/web/src/app/globals.css` under `@layer components`.

- `m3-card`
- `m3-button` (+ variants `m3-button--tonal`, `m3-button--outline`, `m3-button--text`)
- `m3-icon-button`
- `m3-input` (+ sizes `m3-input--sm`, `m3-input--lg`)

## Usage

In the Next.js app (`apps/web`):

- `CardPanel` -> `m3-card`
- `IconButton` -> `m3-icon-button`
- `Input` -> `m3-input`

The portal shell (TopBar/SideNav) now uses M3 surface colors and elevations.
