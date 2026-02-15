# App Shell

The portal shell matches the reference UI with a dark top bar, sliding side navigation, and a two-column content grid.

## Structure

- TopBar
  - Hamburger toggle
  - Brand block
  - Page title chip
  - Quick icon strip + user menu
- SideNav
  - Collapsible list of primary navigation items
  - Active route highlight
- Content
  - Flexible main area for page content

## Behavior

- SideNav collapse reduces width and hides labels.
- TopBar toggle synchronizes with SideNav.
- Layout collapses into a single column on smaller screens.

## Components

- `TopBar`
- `SideNav`
- `QuickIcons`
- `UserMenu`
