# AETHERIS GitHub Issues → Todo / Implementation Status

Generated 2026-06-23 from live repo issues on softkog-alt/aetheris.

**13 Open Issues** (as of fetch). Many core ones (#1, #2, shares, links, personal scores, node slider, ALL filter) are **already implemented** in current codebase (see comments on GH).

## High Priority Fixes Implemented
- **#4 Bug: 'All' filter toggle** — ✅ Implemented + verified. `toggleAllGroups()` + sync. (Comment added)
- **#12 Performance: laggy canvas panning** — ✅ Major fix: RAF-batched pan/zoom via `_scheduleDraw()`, unified Pointer Events (mouse+touch), inertia/momentum panning on release, stopInertia on gestures/switches, cursor + hover unification. All trees benefit. Build clean. (Comment + code changes)

## Partial / In-Progress from Issues
- **#8 Feature: Interactive Dosage Bar** — ✅ Visual zone bar added (min/opt/megadose/caution colored segments + labels) in inspector + Explorer modal. Non-draggable yet (needs data fields like `dosageRanges`). (Comment added)
- **#9 Inspector Upgrades** — Mostly done:
  - Organ click → benefit desc (with mechanisms) ✅
  - Safety Profile card (dedup highDoseRisks + risks, collapsible) ✅ in modal
  - Gorkipedia content lives in main flow (no separate "tab" in current modal structure)
  - Custom scroll: native thin + max-h in places. Can enhance further.
- **#5 Node Limit + Rank layout** — Node limit slider + ALL control ✅ live (renderNodeLimitControl). Rank proximity in layout ✅.
- **#7 Green Personalized Score** — ✅ In HoverPopup + inspector + modal + bottom sheet. ScoringEngine.personalizedScore used.
- **#6 Personal Corner** — Core + onboarding hints + per-node impact live (see initPersonalCorner + populate). Onboarding wizard modal future.
- **#10/#11 Share + Deep Gorkipedia links** — ✅ Buttons present in inspector panel + Explorer modal. Pre-filled X share + external grokipedia.app fallback.

## Large Remaining (New Constellations)
- **#13 Environment constellation** (toxins/pollutants/radiation) — Open feature. Requires new data file + EnvironmentTree + main switch + red styling + negative framing.
- **#3 Blood panel tree** — Major new tab. Blood markers + ranges + predictors.

## Already Closed/Implemented via prior work (GH comments exist)
- #1 Bottom sheet + mobile progressive disclosure
- #2 PNG layered body (replaces vector)

## Quick Wins / Polish from UPGRADEME (some addressed)
- f key toggle ✅
- Touch pan/pinch improved ✅
- Canvas perf ✅ (this PR/work)
- Many data fields recommended for future personalization.

## Next Actions Recommended
1. Pinch-to-zoom now implemented on mobile (pointer multi-touch + focal). Panning confirmed smooth by user.
2. Close #4, #12 after final user testing.
3. For #8: extend data with numeric dosage min/opt fields + make bar draggable + live personal marker.
4. Tackle Environment (#13) or Blood (#3) for next major feature.
5. Consider closing low-activity open issues that are de-facto done (#5,7,9,10,11).

See also UPGRADEME.md for full detailed backlog.

Code changes in this session:
- src/trees/SupplementTree.js (schedule + pan/zoom/center)
- src/main.js (pointer events overhaul + inertia + dosage visual + guards)
- src/components/ExplorerModal.js (dosage bar)
- UPGRADEME.md (status notes)
- Comments posted to GH via tools.

Build: `npm run build` ✅ clean.
