# AETHERIS — Planned Upgrades & Improvements

> Comprehensive backlog of features, fixes, and UI enhancements for the Longevity Constellation platform.

---

## 1. Bug Fixes

### 1.1 High Dose Risk — Repeated Appends on Hover
fixed

### 1.2 "All" Filter Toggle — Should Turn All Off When All Are On
**File:** `src/main.js` — `renderGroupFilters()` & `SupplementTree.enableAllGroups()`
- **Problem:** The `ALL` chip currently calls `treeInstance.enableAllGroups()` unconditionally. When every category is already enabled, clicking `ALL` should toggle them *all off* for quick reset.
- **Fix:** Check `if (all currently enabled) -> disable all` else `enable all`. Update chip sync accordingly.
- **Status:** ✅ Implemented + verified (toggleAllGroups + chip styles + 'f' key; see issue #4 comments).

---

## 2. Node Visibility & Ranking

### 2.1 Node Limit Slider
- Add a slider control (e.g., `range: 5–100`) in the map UI (bottom-left or top bar) to control how many nodes are displayed.
- Sorting criteria: highest `vitality` first, then by proximity to body center (higher-ranked supplements closest to the middle).
- This lets users focus on the top N most impactful items without visual overload.

### 2.2 Rank-Based Proximity Layout (Already Partially Implemented)
- Ensure `computeLayout()` in `SupplementTree.js` strictly enforces: highest vitality = closest orbit to body center. Each organ cluster should already do this; verify the `influence` math is consistent across all trees.

---

## 3. Personal Health — "Personal Corner"

### 3.1 Inspector Tab Extension (Below Current Details)
**Status: implemented** (core form + live BMI + localStorage + rule-based insights; fixed initial empty panel by ensuring renderPersonalPanel always runs and content is pre-populated; starts visible by default for discoverability while remaining collapsible via header click. Inputs cover age/gender/BP/weight+height/BMI/pushups/sleep/mood/digestion with live preview + recommendations/risks.)

- Add a collapsible section at the bottom of the left inspector panel titled **"Personal Corner"**.
- **Inputs (manual entry):**
  - Blood pressure (systolic / diastolic)
  - Weight, height (auto-calculate BMI)
  - Age, gender
  - Exercise metrics: pushup max, running max (distance/time), squat max
  - Lifestyle markers: eyeglass use, hair fading/thinning, chronic injuries, recurring pains
  - Common issues: sleep quality, digestion, skin condition, mood/energy
- **Insights generated:**
  - BMI category + trend
  - Recommended supplements *based on your metrics* (e.g., high BP → citrulline, CoQ10; low vitamin D regions → D3; poor sleep → magnesium, glycine, melatonin)
  - Risk flags: e.g., "Your BMI + age profile correlates with higher cardiovascular risk — consider Omega-3 + aged garlic extract."

### 3.2 GadgetBridge / Habit Tracker Import - NOT IMPORTANT NOW


### 3.3 Settings / Onboarding Questionnaire when clicking on the personal tab bottom left for first time.
- A dedicated settings panel explaining:
  - **Why we ask:** how age, gender, BMI, and exercise metrics change nutrient needs.
  - **Research basis:** cite the studies/meta-analyses behind each recommendation factor.
  - **Privacy note:** all data stays local (no server upload unless explicitly configured).
- UI: wizard-style onboarding or a settings modal with categorized tabs (Body, Activity, Health Markers, Import).

### 3.4 Per-Node Personalized Impact - if nothing entered green flashing lights saying enter personal stats
- When a supplement node is selected, the Personal Corner below the inspector shows:
  - **"Impact on YOUR build"**: specific relevance of that supplement to the user's entered metrics.
  - Example: *"Magnesium — your high stress + reported poor sleep suggests strong need."*

---

## 4. Green Personalized Score (Hover & Detail UI)

### 4.1 Hover Popup Enhancement
- Add a **green score badge** to the hover popup (`HoverPopup.js`) and inspector:
  - `0-100` score indicating *how beneficial this is specifically for you*.
  - Factors: age, gender, BMI, blood pressure, exercise level, deficiencies, current symptoms.
  - Visual: gradient green bar or colored badge (green=high match, yellow=moderate, gray=low relevance).

### 4.2 Detail Panel & Modal Score
- Show the same green score prominently in:
  - Left inspector panel (selected node)
  - Explorer modal header (next to vitality badge)
- Include hover tooltip explaining *why* the score is what it is (e.g., *"Score: 87 — your age + low dietary fish intake makes this high-priority."*).

### 4.3 Data Strategy
- Build a lightweight **personalization matrix** in `src/core/ScoringEngine.js` that maps user metric ranges to supplement priority weights.
- Keep as much logic client-side and manually curated (research-backed) so it works offline.

---

## 5. Blood Constellation Tab

### 5.1 New Tab: "Blood"
- Add a fifth constellation tab alongside Supplements / Habits / Exercises / Foods.
- **Visual:** A stylized image/diagram of human blood (microscope view or abstract flowing blood vessel) as the central canvas element.
- **Nodes:** All blood-borne markers and molecules (e.g., LDL, HDL, triglycerides, glucose, HbA1c, hsCRP, homocysteine, ferritin, B12, Omega-3 Index, vitamin D, testosterone, estrogen, thyroid hormones, cortisol, etc.).
- **Interactivity:** Click a marker to see:
  - Optimal ranges (not just reference ranges)
  - Which supplements/foods/habits improve it
  - How your entered metrics map to expected values

---

## 6. Inspector / Detail Panel Upgrades

### 6.1 SERVING / PROTOCOL → Expand into Interactive Dosage Bar
- Replace the simple text dosage line with a rich **interactive dosage bar** in the inspector:
  - **Minimum effective dose** (left marker)
  - **Optimal dose** (center marker / sweet zone)
  - **Megadose threshold** (right marker, with warning if unsafe)
  - **Overdose symptoms zone** (red region beyond safe limit)
  - Visual: horizontal bar with draggable indicator or colored zones.
- When user enters their personal metrics (section 3), the bar can auto-suggest where on the scale they should aim.

### 6.2 Organ Tag Click → Organ Benefit Description
- In the detail panel and modal, clicking any organ tag (Brain, Heart, Immune, etc.) should expand a small section explaining:
  - *Why* this supplement benefits that organ specifically.
  - Key mechanisms relevant to that organ.
  - Example: click **"Brain"** on Omega-3 → show: *"DHA maintains neuronal membrane fluidity, supports BDNF, and reduces neuroinflammation."*
- Data source: leverage `node.mechanisms` and add per-organ `benefitText` fields to the data schema.

### 6.3 Inline High Dose / Risks UI (Explorer Modal)
- In `ExplorerModal.js`, the `modal-risks` and `modal-expanded` sections both render `highDoseRisks`. Deduplicate and move to a dedicated **"Safety Profile"** card in the modal with:
  - Warning icon + severity level
  - Collapsible long text
  - Interaction checker (future: cross-reference with user's other selected supplements)
### 6.4 Remove the grokipedia tab, just keep it in the inspector tab
### 6.5 Custom matching scrollball ui for longer entries 
---

## 7. Gorkipedia Integration

### 7.3 Link to Actual Gorkipedia Entries
- Add external deep-links to the real Gorkipedia entries (or authoritative sources) from each node detail panel.
- Use a "Read full monograph on Gorkipedia" external link button that opens the full article.
- Ensure fallback behavior: if no external link exists, open relevant PubMed / Examine.com / Linus Pauling Institute links.

---

## 8. Social Integration

### 8.1 Share to X (Twitter) Integration
- Add a share button on every node detail panel and modal:
  - One-tap share to X with pre-filled text including supplement name, vitality score, and a short tagline.
  - Example: *"Omega-3 EPA/DHA scores 92 on AETHERIS. The most robust dietary molecule for human longevity. aetheris.app 🧬"*
- Also add a generic "Copy share text" button for other platforms.
- Future: share your personal stack/protocol as a visual card (OG image generation).

---

## 9. Theming

### 9.1 OLED-First Dark Theme
- **Default:** pure OLED black (`#000000`) for the deepest possible blacks on OLED screens.
- **No light theme** — maintain a consistent dark, celestial aesthetic across all views.
- Subtle deep navy/grays (`#03050c`, `#020408`) for card panels to create soft contrast against pure black backgrounds.
- All UI elements should feel like they are floating in deep space. Or match the X.com and grok aesthetic

---

## 10. Exercise Self-Assessment — 'Fitness Profile' Card

### 10.1 Location
- A collapsible **"Fitness Profile"** panel pinned to the bottom-left of the map (below the existing inspector tab or in a dedicated widget next to the status hint).
- Tied to the **Exercises** constellation tab: when active, the panel glows to indicate relevance.

### 10.2 Input Metrics (manual entry)
- **Push-up max** (reps)
- **Squat max** (bodyweight / weighted)
- **Stretching test** (sit-and-reach or active hamstring flexibility — yes/no pass)
- **Jump test** (standing vertical jump in cm)
- **Balance test** (single-leg stance time in seconds, eyes closed)
- **Breath-hold time** (max static apnea in seconds)
- *(Future)* Grip strength, VO2 max estimate, 1-mile walk time

### 10.3 Visual Feedback on the Exercise Nodes
- Each exercise node in the constellation now reads the user's Fitness Profile on hover/selection.
- **Green glow** = user's test result is in the "good / longevity-optimal" range for that metric.  
  - Example: breath-hold >90s → nodes linked to hypoxic/CO₂ tolerance training glow green.
- **Red glow** = user's test result is below the "risk / needs improvement" threshold.  
  - Example: single-leg balance <20s → stability/fall-prevention exercises glow red.
- The glow intensity scales with how far the user is from the optimal zone.

### 10.4 Impact Text in Inspector / Modal
- When an exercise node is selected, the inspector shows:
  - **"Your Level: X"** with a small progress bar.
  - **"Benefit for YOUR profile:"** — e.g., *"Your push-up max (45 reps) puts you in the top 10% for your age. Maintenance dose recommended."* or *"Your push-up max (8 reps) correlates with higher all-cause mortality risk. Prioritize progressive overload."*
- Uses age- and gender-adjusted centiles (manually curated from research, not generated).

### 10.5 Scoring Strategy
- Keep the same **offline, manually curated** approach as supplement personalization.
- Lightweight lookup tables in `src/core/FitnessScoringEngine.js` mapping raw test values → percentile → color (green/yellow/red) and recommendation text.

---

## 7. Gorkipedia Integration (Continued)

### 7.1 More Gorkipedia Content in Side Tab
- The left inspector panel currently shows minimal info. Expand it to include:
  - First 2-3 mechanisms listed inline.
  - Key study year + finding snippet.
  - Timing and best forms (already partially there; make it richer).
  - A "Read more in Gorkipedia" link/button that opens the modal.
- This reduces the need to open the modal for quick info.

### 7.2 Explorer Modal Polish
- Add copy-to-clipboard for study citations.
- Add "Share monograph" button (copy link or text summary).
- Consider adding a "Similar to..." section based on shared mechanisms or synergies.

---

## 11. Data Schema Additions & Quality Improvements (Across All Trees)

To support the features above (Personal Corner, Green Personalized Score, Organ tag clicks, Blood tab, Fitness Profile, dosage bar, etc.), the following fields should be added to **supplement**, **food**, **habit**, and **exercise** data objects where applicable.

### 11.1 Core New Fields (Recommended for all nodes)

| Field | Type | Purpose | Example |
|-------|------|---------|---------|
| `priority` | `"core" \| "advanced" \| "optional" \| "avoid"` | Helps users build clean protocols without overwhelm | `"core"` for Omega-3, Magnesium, Vitamin D, Creatine |
| `targetPopulation` | `string[]` | Personalization & filtering | `["general", "over50", "athletes", "women", "vegans", "high-stress", "post-menopausal"]` |
| `contraindications` | `string[]` | Safety layer | `["on blood thinners", "kidney impairment", "autoimmune (use caution)", "pregnancy"]` |
| `monitoring` | `string[]` | Clinical practicality | `["25(OH)D", "Omega-3 Index", "homocysteine", "ferritin", "hsCRP"]` |
| `costLevel` | `"low" \| "medium" \| "high"` | Real-world decision making | `"low"` for most minerals & glycine; `"high"` for Urolithin A, Spermidine |
| `stackRole` | `string[]` | Protocol builder & constellation grouping | `["foundational", "mitochondrial", "inflammation", "sleep", "senolytic", "nootropic"]` |
| `flags` | `string[]` | Fast client-side filtering & visual tags | `["fat-soluble", "senolytic", "mitophagy", "hormone-modulating", "high-bioavailability-form-available"]` |
| `lastUpdated` | `string` (ISO date) | Data freshness & trust | `"2026-06-04"` |
| `evidenceQuality` | Object | More precise than simple "5/5" string | `{ score: 5, label: "Very Strong", humanRCTs: 47, metaAnalyses: 12, largestTrial: 2024 }` |

### 11.2 Existing Fields to Improve / Standardize

- **`evidence`**: Change from simple string `"5/5"` to the structured `evidenceQuality` object above (or keep both during transition).
- **`highDoseRisks`**: **Merge into `risks`** or make `risks` always dose-aware (e.g. use markdown sections: `### General Risks` + `### High-Dose / Chronic Risks`). This eliminates duplication and inconsistency across entries.
- **`diseases`** (the numeric field): Rename to `diseaseImpactScore` (0-100) or clearly document its meaning. Currently ambiguous.
- **`blurb`**: Keep but enforce **max 1-2 sentences**. Move longer narrative/explanation into `gorkipedia`.
- **`gorkipedia`**: Consider splitting into `gorkipedia: { short: "...", full: "..." }` for card vs detail views (optional but improves performance).
- **Harmful entries** (`impact: "negative"`): Add two new fields:
  - `commonMisconception`: Why people take it anyway
  - `whyItPersists`: Marketing / cultural reasons it stays popular despite evidence

### 11.3 Exercise-Specific Fields (for Fitness Profile feature)

- `fitnessThresholds`: Object defining age/gender-aware bands
  ```js
  fitnessThresholds: {
    pushup: { excellent: 40, good: 25, poor: 10 },
    squat: { excellent: 30, good: 15, poor: 5 },
    balance: { excellent: 45, good: 25, poor: 10 }, // seconds eyes closed
    breathHold: { excellent: 90, good: 60, poor: 30 },
    verticalJump: { excellent: 55, good: 40, poor: 25 } // cm
  }
  ```
  - Drive green/red glow intensity and "Your Level" text in inspector.

### 11.4 Dataset-Level Metadata (Add to supplements.js / main data file)

```js
export const dataMeta = {
  version: "2.1.0",
  lastUpdated: "2026-06-04",
  schemaVersion: "2026-06",
  totalNodes: 80,
  categories: [...],
  // ...
};
```

### 11.5 Implementation Notes

- Create a single source-of-truth **TypeScript interface** (or JSON Schema) in `src/core/types/Supplement.ts` (and equivalent for Exercise/Food) so all trees stay consistent.
- Add runtime validation on data import/load (Zod or simple checks) to catch missing fields early.
- All new scoring/personalization logic must remain **manually curated from research** (no LLM hallucination of health advice).
- Prioritize adding the fields to the **60 beneficial supplements** first, then the 20 harmful ones.

---

## 12. Other Quick Wins

- **Keyboard `f` behavior:** currently forces `enableAllGroups`; make it toggle on/off. ✅ (uses toggleAllGroups)
- **Touch/mobile:** add touch-drag pan and pinch-zoom for mobile devices. ✅ (unified pointer events + inertia + full multi-pointer pinch zoom with focal point)
- **Canvas panning perf (GitHub #12):** RAF batching, pointer events unification, inertia/momentum. ✅ Implemented 2026-06.
- **Node collision density:** with 100+ food nodes, the `_settleNodePositions` iterations may need dynamic scaling to prevent slow frames.
- **Social meta tags:** add Open Graph / Twitter Card meta tags in `index.html` so shared links render rich cards.
- **Data validation:** Add runtime schema validation (Zod or lightweight checks) when loading `supplements.js` and other tree data to catch missing/inconsistent fields early.
- **Evidence scoring audit:** Systematically review all 80 supplement entries and migrate `evidence` + add `evidenceQuality` object for consistency.

---

## Plan Meta

- **Target file location:** `/home/tux/aetheris/UPGRADEME.md` (project root, beside README.md)
- **Action on finalization:** Move this file from `.local/share/kilo/plans/` to the project root and name it `UPGRADEME.md` so it lives alongside `README.md` as a portable reference.

---

> **Status:** Updated with comprehensive data schema improvements (June 2026).

- All scoring and personalization should be **manually curated from research** so the app remains useful offline and avoids hallucinated health advice.
- The goal is to make AETHERIS feel like a **personal longevity consultant**, not just a static database.

---
