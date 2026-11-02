# White Label Studio - Design Overview

This document defines the neutral UI direction for the starter. Future products can replace tokens
and brand assets while keeping the responsive layout, accessibility, and component conventions.

## Principles

- **Neutral by default.** Use quiet, utilitarian surfaces that suit internal application workflows.
- **Two themes, one layout.** Light and dark themes share structure and spacing; only tokens swap.
- **Mobile-first responsive.** The same web app should work well in narrow browser or WebView
  contexts.
- **Accessible controls.** Visible focus states, semantic elements, and touch-friendly targets are
  required for visible UI changes.

## Theming Tokens

Use CSS custom properties or Tailwind theme values for these semantic roles.

| Token | Role |
|-------|------|
| `--bg` | App background |
| `--surface` | Cards, sidebar, panels |
| `--surface-raised` | Elevated and hover surfaces |
| `--border` | Card, input, and divider borders |
| `--text-primary` | Headings and key values |
| `--text-secondary` | Supporting copy and metadata |
| `--text-muted` | Disabled text and placeholders |
| `--accent` | Primary CTA, active nav, and key emphasis |
| `--accent-contrast` | Text/icon on accent |
| `--success` | Success and completed states |
| `--info` | Informational states |
| `--danger` | Error and destructive states |
| `--track` | Progress or skeleton track backgrounds |

Avoid baking product colors, brand names, or domain-specific semantic colors into shared UI.

## Spacing, Radius, Type

- **Spacing scale:** 4, 8, 16, 24, 40, 80.
- **Radius:** buttons and inputs `6px`; cards `8px` unless an existing component requires more.
- **Type:** keep page headings restrained inside app surfaces; reserve display-scale type for real
  hero contexts.
- **Touch targets:** interactive controls should be at least `44px` tall/wide on mobile.

## Core Starter Components

| Component | Spec |
|-----------|------|
| Sidebar | `--surface` background, icon + label nav rows, active item uses accent/surface treatment, collapsible on desktop and off-canvas on mobile. |
| Header | Slim top bar for global actions; do not fetch data directly in the partial. |
| Card | Use for repeated items, settings panels, and framed tools; avoid card-in-card layouts. |
| PageHeader | Shared title/action row for app pages. |
| EmptyState | Neutral placeholder for pages whose product behavior has not shipped. |
| Skeleton | Match the eventual page structure for full-page loading states. |
| Button/Input/Form | Reuse shared form primitives and keep labels, errors, and focus states accessible. |

## Responsive Layout

Breakpoints: mobile `<640px`, tablet `640-1024px`, desktop `>1024px`.

| Region | Desktop | Tablet | Mobile |
|--------|---------|--------|--------|
| Sidebar | Persistent or collapsed rail | Persistent/collapsible | Off-canvas drawer |
| Header | Slim bar above content | Same | Same with accessible menu toggle |
| Dashboard cards | 3 across where space allows | 2 across | 1 across |
| Forms | Constrained readable width | Constrained | Single-column, no horizontal overflow |
| Tables/future dense views | Wide container if needed | Scroll or responsive rows | Stacked cards or horizontal scroll only when unavoidable |

Visible frontend changes should be checked at `375x812`, `390x844`, `768x1024`, and a desktop width
such as `1280x800`.

## Accessibility

- Maintain WCAG AA contrast in both themes.
- Do not encode meaning in color alone.
- Use buttons for actions and links for navigation.
- Preserve keyboard access for forms, modals, menus, and route navigation.
- Do not rely on hover-only controls.
