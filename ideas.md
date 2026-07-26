# Maestro Cerca Refactored — Design Brainstorm

## Three Stylistic Approaches

### 1. "Artesanía Digital"
A warm, handcrafted aesthetic inspired by Mexican artisanal traditions — terracotta warmth, organic shapes, and generous whitespace. The UI feels like walking into a trusted local workshop: confident, welcoming, and human. Color palette built around warm earth tones (terracotta, sand, deep charcoal) with a signature "Maestro Gold" accent. Typography pairs a bold serif display font with a clean geometric sans-serif body.

**Probability:** 0.04

### 2. "Industrial Trust"
A no-nonsense, blueprint-inspired aesthetic that communicates reliability and precision. Cool slate grays, steel blue accents, and grid-based layouts that evoke engineering schematics and building plans. The feeling is "this platform is built by professionals for professionals." Typography uses a strong condensed sans-serif for headlines and a neutral geometric body.

**Probability:** 0.03

### 3. "Neighborhood Glow"
A community-first design with soft gradients, rounded geometry, and a vibrant but approachable color system. Inspired by neighborhood markets and community boards — friendly, colorful, and immediately legible. Uses a warm coral/emerald palette with playful micro-interactions.

**Probability:** 0.06

---

## Selected Approach: "Artesanía Digital"

### Design Movement
Mexican Modernism — drawing from Luis Barragán's use of warm color blocks, bold geometry, and the interplay of light and shadow. This is not folkloric decoration; it is sophisticated color theory applied to a functional marketplace.

### Core Principles
1. **Warm Authority** — The palette communicates trust through warmth, not coldness. Dark charcoal for text, terracotta for emphasis, sand for surfaces.
2. **Generous Breathing Room** — Whitespace is treated as a luxury. Sections breathe. Cards are never cramped.
3. **Material Honesty** — UI elements feel "solid" — buttons have weight, cards have depth, the page feels built, not assembled.
4. **Cultural Resonance** — Subtle nods to Mexican craft tradition without being kitsch. The brand feels local and authentic.

### Color Philosophy
- **Background:** `oklch(0.97 0.01 80)` — warm sand, not cold gray
- **Surface:** `oklch(0.95 0.015 80)` — slightly richer sand for cards
- **Primary:** `oklch(0.55 0.12 45)` — deep terracotta/burnt orange
- **Primary-foreground:** white
- **Accent:** `oklch(0.65 0.08 150)` — deep emerald green (trust/verification)
- **Text:** `oklch(0.2 0.02 45)` — warm charcoal, never pure black
- **Signature Brand Color:** Terracotta (#C65D3B) — the unmistakable Maestro Cerca warmth

### Layout Paradigm
Asymmetric hero with the search bar as the focal point. Content flows in a wide-column grid (max 1280px) with generous 32px gutters. Cards use a masonry-inspired stagger rather than rigid equal-height rows.

### Signature Elements
1. **Terracotta Gradient Borders** — subtle gradient borders on focused inputs and active cards
2. **Rounded Stone Corners** — `rounded-2xl` as the base radius, evoking smoothed river stone
3. **Warm Shadow System** — shadows with a warm tint (`shadow-[0_8px_32px_rgba(198,93,59,0.08)]`)

### Interaction Philosophy
Tactile and responsive. Buttons press down on click (`active:scale-[0.97]`). Cards lift on hover. Modal entrances slide up from below with a subtle scale. Nothing floats or bounces unnecessarily.

### Animation
- Page load: staggered fade-in of cards (30ms per card, max 400ms total)
- Hover: `translate-y-[-2px]` with shadow deepen, 200ms ease-out
- Modal: slide-up from 95% scale, 250ms, cubic-bezier(0.23, 1, 0.32, 1)
- Filter pill activation: background color fill from left, 150ms

### Typography System
- **Headlines:** "DM Serif Display" (400, 700) — warm, editorial weight
- **Body:** "DM Sans" (400, 500, 600) — geometric, clean, highly legible
- **Monospace/Data:** System monospace for phone numbers and codes

### Brand Essence
"Maestro Cerca connects Mexican homeowners with verified trade professionals through a warm, trustworthy digital experience that feels as reliable as a neighbor's recommendation."

**Personality:** Confident · Warm · Trustworthy

### Brand Voice
- Headlines: Direct, warm, action-oriented. Never generic.
  - "Encuentra al maestro perfecto para tu hogar"
  - "Profesionales verificados, confianza garantizada"
- CTAs: Specific and benefit-driven
  - "Ver perfil completo" (not "Ver más")
  - "Contactar ahora" (not "Enviar")
- Microcopy: Conversational, reassuring
  - "Tu primera consulta es siempre gratuita"
  - "Maestros verificados cerca de ti"

### Wordmark & Logo
A bold circular mark with a stylized "MC" monogram in terracotta on a warm sand circle. The circle evokes both a seal of approval and a community. No text in the icon itself.

### Signature Brand Color
**Terracotta (#C65D3B)** — used sparingly for CTAs, active states, and the primary brand moment. It is unmistakably Maestro Cerca's color.
