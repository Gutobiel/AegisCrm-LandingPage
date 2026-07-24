# Project: Aegis CRM Landing Page Redesign

## Architecture
- Static landing page: HTML + CSS + JS (vanilla)
- Served via node server.js on http://localhost:3000
- Single-page: index.html (~945 lines), style.css (~51KB), app.js (~42KB)
- All copy in Brazilian Portuguese

## Design Rules (.cursorrules)
1. NO GENERIC SYMMETRY — use intentional asymmetry, bento grids
2. NO DEFAULT STYLES — refined tailored palettes, no Tailwind defaults
3. EMBRACE WHITESPACE — generous padding, spacing over borders
4. TYPOGRAPHY IS KING — editorial layouts, distinct font weights
5. ANALOG & ORGANIC FEEL — micro-interactions, fluid hover states
6. No AI jargon in copy ("revolutionary", "seamless", "synergy", etc.)
7. Production-ready, modular, accessible (WCAG 2.1 AA)

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Brainstorm Document | R1: Create comprehensive anti-AI-slop redesign brainstorm | none | PLANNED |
| 2 | Full Code Redesign | R2+R3+R5: Copy, layout, palette, animations | M1 | PLANNED |
| 3 | Visual Assets | R4: Generate images (product screenshots, avatars, og:image) | M2 | PLANNED |

## Interface Contracts
### M1 Output → M2 Input
- brainstorm.md artifact with: section structure, copy direction, visual direction, palette hex values, animation specs
- Must reference .cursorrules rules per section

### M2 Output → M3 Input
- Updated index.html with <img> tags ready for generated images
- Image filenames defined in HTML (e.g., screenshot-pipeline.png, avatar-*.jpg, og-image.png)

## Code Layout
- `/index.html` — Main page structure and content
- `/style.css` — All styles (dark mode, animations, responsive)
- `/app.js` — Interactions (kanban, calculator, carousel, scroll effects)
- `/server.js` — Static file server (DO NOT MODIFY)
- `/.cursorrules` — Design rules (READ ONLY)
- `/brainstorm.md` — Brainstorm document (M1 output)

## Acceptance Criteria
### R1 Brainstorm
- [x] 5+ sections: structure, copy, visual, palette, interactivity
- [x] Each proposal references .cursorrules rules

### R2 Copy
- [ ] Zero banned AI jargon terms
- [ ] Testimonials with specific unfabricatable details
- [ ] Max 3 emojis (except WhatsApp simulator)
- [ ] FOMO bar without artificial urgency

### R3 Layout
- [ ] Pain-points: NOT symmetric 3-column grid
- [ ] Pricing: NOT 3 identical cards same height
- [ ] Before/After: NOT ✕/✓ side-by-side pattern

### R4 Visual
- [ ] NO Tailwind default hexes (#2563EB, #3B82F6, #EF4444, #10B981, #F59E0B)
- [ ] 3+ generated images served correctly
- [ ] Photographic avatars for testimonials

### R5 Organic
- [ ] 3+ elements with different timing/easing
- [ ] Page works at http://localhost:3000
