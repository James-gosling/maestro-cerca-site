# Maestro Cerca — Refactored SPA

A production-ready, conversion-optimized marketplace for hiring local trade workers (maestros) in Mexico. This refactored version implements all P0–P2 UX audit recommendations plus a full photo upload feature for worker portfolios.

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

## Photo Upload Feature (NEW)

Workers can now upload real project photos during registration. The OnboardingWizard includes two new steps:

| Step | Feature | Details |
|------|---------|---------|
| Step 4 — Tu Portafolio | Project photo upload | Drag-and-drop, multi-file, 5MB limit, 5 max, JPG/PNG/WebP |
| Step 5 — Sello Maestro | ID document upload | Single document for verification badge |
| Backend | S3 storage via tRPC | `storagePut` to `/manus-storage/maestro-photos/` |
| Gallery | Lightbox in modal | Full-screen viewer with prev/next navigation |

### Upload Flow

1. Worker opens "Registra tu Oficio" → OnboardingWizard modal
2. Steps 1–3: Name, phone, trade, experience, zone
3. **Step 4 — Tu Portafolio**: Click upload zone, select photos, add captions, drag-and-drop reorder
4. **Step 5 — Sello Maestro**: Upload ID document for verification
5. Submit → All pending photos upload to S3 → Registration completes

### Backend Endpoints (tRPC)

| Procedure | Type | Description |
|-----------|------|-------------|
| `maestros.register` | Mutation | Register new worker with optional gallery |
| `maestros.uploadPhoto` | Mutation | Upload single photo to S3 (base64 input) |
| `maestros.list` | Query | List all approved maestros |

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
│   ├── WorkerDetailModal.tsx    # Reordered: reviews first, sticky mobile CTA, gallery lightbox
│   ├── OnboardingWizard.tsx     # 5-step native wizard + photo uploads
│   ├── PricingComparison.tsx    # Fixed feature matrix
│   └── EmptyState.tsx           # Recovery CTAs for zero results
├── pages/
│   └── Home.tsx                 # Asymmetric hero + all sections
├── index.css                    # Design tokens (OKLCH color system)
└── App.tsx                      # Router + ThemeProvider

server/
├── routers/
│   └── maestros.ts              # register, uploadPhoto, list procedures
├── storage.ts                   # S3 helpers (storagePut, storageGet)
├── maestros.test.ts             # Vitest coverage (8 tests)
└── db.ts                        # Drizzle query helpers

drizzle/
└── schema.ts                    # maestros table with galleryImages JSON column
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Run tests
pnpm test          # 9 tests passing

# TypeScript check
pnpm check
```

## Database Schema

```sql
CREATE TABLE maestros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name TEXT NOT NULL,
  phone VARCHAR(20) NOT NULL,
  trade TEXT NOT NULL,
  experience INT DEFAULT 0,
  workType ENUM('independiente', 'empresa') DEFAULT 'independiente',
  zone TEXT NOT NULL,
  galleryImages JSON,
  verificationStatus ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  idDocumentKey TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
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

## Next Steps (Recommended)

1. **WhatsApp deep-link** — Replace "Desbloquear" CTA with `wa.me/{phone}` link
2. **Location radius filter** — Add "within X km" geo-search using the Map component
3. **Admin review dashboard** — Add a pending-approval queue for new registrations
4. **Worker profile page** — Dedicated `/maestro/:id` route with full gallery and reviews

## Tech Stack

- React 19 (Functional Components + Hooks)
- Vite 7
- Tailwind CSS 4 (OKLCH color system)
- Lucide React (icons)
- Wouter (routing)
- Sonner (toasts)
- shadcn/ui (dialog, button, card primitives)
- tRPC 11 (type-safe API)
- Drizzle ORM + MySQL (database)
- AWS S3 via Forge (file storage)
- Vitest (testing)

## License

MIT
