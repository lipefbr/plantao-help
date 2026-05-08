# Task 2: Bug Fix & Refactor Agent

## Summary
Completed all 5 sub-tasks for code deduplication and utility consolidation.

## Changes Made

### 1. Deduplicated `getProfessionalTypeColor`
- Added function to `src/lib/utils.ts` with ADMIN key included (most complete variant)
- Updated imports in 5 files to import from `@/lib/utils`:
  - `src/components/home-tab.tsx`
  - `src/components/plantoes-tab.tsx`
  - `src/components/shift-detail.tsx`
  - `src/components/admin-tab.tsx`
  - `src/components/concursos-tab.tsx`
- Removed local function definitions from all 5 files

### 2. Fixed toast import in perfil-tab.tsx
- Moved `import { toast } from 'sonner'` from line 436 (bottom of file) to line 18 (top import section)

### 3. Added `formatTimeAgo` utility
- Added to `src/lib/utils.ts`
- Returns relative time strings: "agora", "Xmin atrás", "Xh atrás", "Xd atrás", or falls back to `formatDate()`

### 4. Added `formatPhone` utility
- Added to `src/lib/utils.ts`
- Formats 11-digit phones as (XX) XXXXX-XXXX and 10-digit as (XX) XXXX-XXXX

### 5. Added `shareShiftLink` and `shareToWhatsApp` utilities
- Added both to `src/lib/utils.ts`
- `shareShiftLink` generates `window.location.origin?shift={shiftId}` (client-side only)
- `shareToWhatsApp` generates WhatsApp share URL with encoded text and link

## Lint Status
`bun run lint` passes cleanly with no errors.
