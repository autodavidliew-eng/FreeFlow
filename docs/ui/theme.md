# FreeFlow UI Theme

This theme targets a dark operations portal aesthetic aligned with the provided reference screenshots.

## Typography

- Primary font: Space Grotesk (400/500/600)
- Tone: compact, technical, and readable at dense layouts

## Color Tokens

- Base background: `--ff-bg`
- Elevated background: `--ff-bg-elev`
- Panel background: `--ff-bg-panel`
- Soft panel background: `--ff-bg-soft`
- Text: `--ff-text`
- Muted text: `--ff-muted`
- Border: `--ff-border`
- Strong border: `--ff-border-strong`
- Accent (teal): `--ff-accent`
- Accent warm (orange): `--ff-accent-warm`
- Accent cool (blue): `--ff-accent-cool`

## Surface Styles

- Panels use subtle elevation and thin borders.
- Shadows are soft and deep to lift panels from the dark canvas.
- Hover states lift slightly and accent borders with teal.

## Component Primitives

- `PageContainer`: page scaffold and header block
- `CardPanel`: panel surface with variants (default, soft, outline)
- `SectionTitle`: uppercase, spaced section headers
- `IconButton`: compact icon-only buttons for the TopBar and tool actions

## Usage Notes

- Keep layouts information-dense and aligned to grid.
- Reserve the warm accent for alerts or callouts.
- Maintain consistent spacing between panels to preserve structure.
