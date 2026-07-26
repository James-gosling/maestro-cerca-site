# Maestro Cerca Refactored — Photo Upload Feature

- [x] Basic homepage layout with asymmetric hero
- [x] WorkerCard with avatar-anchored badges and skill tags
- [x] SearchBar with Zero Input State
- [x] FilterPills with live counts
- [x] OnboardingWizard (4-step native wizard)
- [x] WorkerDetailModal with reordered layout
- [x] PricingComparison with fixed copy inconsistency
- [x] EmptyState with recovery CTAs
- [x] Upgrade to full-stack (web-db-user) for S3 storage
- [x] Create maestros database table with photo_gallery field
- [x] Create backend upload endpoint via tRPC
- [x] Add photo upload step to OnboardingWizard with S3 upload
- [x] Display uploaded photos in WorkerDetailModal gallery (photos now served via /manus-storage/ paths natively)
- [x] Fix Home.tsx broken auto-merge from upgrade (restore useAuth import)
- [x] Write vitest test for upload endpoint
