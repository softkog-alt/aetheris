# AETHERIS — Modular Longevity Constellation Platform

Refactored multi-file version of the original single-file AETHERIS experience.

## Current Status (v0.2.2)

**Map UX (Supplements + Habits):**
- Body-centric canvas: central human figure with nodes in organ rings
- HiDPI rendering via `CanvasViewport` (sharp nodes and labels)
- 2D pan (drag), zoom (wheel / +/-), recenter (`r`)
- Dynamic layout: larger nodes closer to body, collision + body keep-out settling
- Category group toggles on the map (show/hide supplement/habit categories)
- `HoverPopup` on hover and click (pinned until click away or Esc)
- Sidebar detail panel + Gorkipedia explorer modal

**Keyboard:** `Esc` reset · `+`/`-` zoom · `r` recenter · `f` show all groups

Run with `npm run dev` (recommended) or open `index.html` directly.

```bash
cd aetheris
npm install
npm run dev
```

## Architecture

| Area | Location |
|------|----------|
| Entry + input | [`src/main.js`](src/main.js) |
| Supplements / Habits trees | [`src/trees/SupplementTree.js`](src/trees/SupplementTree.js), [`src/trees/HabitsTree.js`](src/trees/HabitsTree.js) |
| HiDPI canvas | [`src/core/CanvasViewport.js`](src/core/CanvasViewport.js) |
| Data | [`src/data/supplements.js`](src/data/supplements.js), [`src/data/habits.js`](src/data/habits.js) |
| Hover card | [`src/components/HoverPopup.js`](src/components/HoverPopup.js) |
| Deep dive modal | [`src/components/ExplorerModal.js`](src/components/ExplorerModal.js) |
| Legacy layout helper | [`src/core/LayoutEngine.js`](src/core/LayoutEngine.js) (polar prototype; tree uses `_settleNodePositions`) |
| Optional sidebar SVG body | [`src/components/OrganDiagram.js`](src/components/OrganDiagram.js) (not wired; body drawn on canvas) |

## Building

```bash
npm run build   # output in dist/
npm run preview
```

## Roadmap

- Touch/pointer pan for mobile
- Zoom toward cursor
- ~~More constellations (Exercise added)~~, Nutrition, Toxins
- `OrganSystem` cumulative organ impact

Original monolith reference: `/home/tux/aetheris-longevity-tree.html`