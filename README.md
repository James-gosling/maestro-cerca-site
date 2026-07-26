# Maestro Cerca — Refactored SPA

A production-ready, conversion-optimized marketplace for hiring local trade workers (maestros) in Mexico. This refactored version implements all P0–P2 UX audit recommendations.

## Design System

- **Theme:** "Artesanía Digital" — Mexican Modernism aesthetic
- **Palette:** Terracotta (#C46A3A), Sand (#F5EFE6), Warm Charcoal (#2D2A26), Emerald (#059669)
- **Typography:** DM Serif Display (headlines) + DM Sans (body)
- **Motifs:** Terracotta gradient borders, seal-like MC mark, warm rounded cards

## Audit Fixes Implemented

| Priority | Audit Finding | Implementation |
|----------|--------------|----------------|
| P0 | Paywall CTA before trust established | Reordered modal: reviews → gallery → CTA; sticky bottom bar on mobile |
| P0 | No Zero Input Search State | Debounced autocomplete with trending suggestions at 300ms |
| P0 | Pricing copy inconsistency | Free plan now shows "1 contacto gratis/sem" not "Contacto desbloqueado" |
| P1 | External Typebot redirect | Native multi-step onboarding wizard with progress bar |
| P1 | Text-heavy worker cards | Skill tags replace bio paragraphs; avatar-anchored Sello Maestro |
| P1 | No filter result counts | Live counts on each category pill |
| P2 | No empty state recovery | EmptyState component with clear/reset CTAs |
| P2 | Generic card layout | Asymmetric hero, varied card sizes, terracotta hover borders |

## Architecture

```
client/src/
├── data/
│   └── mockMaestros.ts          # Mock dataset (8 workers, reviews, gallery)
├── components/
│   ├── Navbar.tsx               # Transparent-to-opaque, MC seal mark
│   ├── SearchBar.tsx            # Zero-input state + autocomplete
│   ├── FilterPills.tsx          # Category filters with live counts
│   ├── WorkerCard.tsx           # Avatar-anchored badges, skill tags, dual CTA
│   ├── WorkerDetailModal.tsx    # Reordered: reviews first, sticky mobile CTA
│   ├── OnboardingWizard.tsx     # Native multi-step registration
│   ├── PricingComparison.tsx    # Fixed feature matrix
│   └── EmptyState.tsx           # Recovery CTAs for zero results
├── pages/
│   └── Home.tsx                 # Asymmetric hero + all sections
├── index.css                    # Design tokens (OKLCH color system)
└── App.tsx                      # Router + ThemeProvider
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Build for production
pnpm build
```

## Component Drop-In Guide

To integrate into the existing Maestro Cerca repository:

1. Copy `client/src/data/mockMaestros.ts` as a type reference.
2. Replace the existing `WorkerCard.tsx` with the refactored version.
3. Replace the existing search/filter components with `SearchBar.tsx` and `FilterPills.tsx`.
4. Replace the Typebot redirect link with `OnboardingWizard.tsx`.
5. Update `index.css` with the design tokens (search for `@theme inline` block).
6. Add the Google Fonts link to `index.html`:
   ```html
   <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet" />
   ```

## Key Component: WorkerCard.tsx

The primary refactored component implementing the top audit recommendation:

- **Avatar-anchored trust badges** — Sello Maestro overlaid on the profile image (TaskRabbit pattern)
- **Scannable skill tags** — replaces text-heavy bio paragraphs
- **Availability indicator** — color-coded dot with label
- **Dual CTA** — "Ver Perfil" (explore) vs "Contactar" (convert)
- **Hover micro-interaction** — subtle lift + terracotta border glow
- **Lazy image loading** — performance optimized
- **ARIA labels** — full accessibility support

## Tech Stack

- React 19 (Functional Components + Hooks)
- Vite 7
- Tailwind CSS 4 (OKLCH color system)
- Lucide React (icons)
- Wouter (routing)
- Sonner (toasts)
- shadcn/ui (dialog, button, card primitives)

## License

MIT
