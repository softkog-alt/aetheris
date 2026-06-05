/**
 * AETHERIS - Modular Entry Point
 * 
 * Body-centric visualization: central body model with nodes clustered around the
 * organs they influence most (higher vitality = closer + larger). Each node shows
 * Longevity (L), QoL (Q), and overall vitality. Works for both Supplements and Habits.
 */

import { supplements, categories, organMeta } from "./data/supplements.js";
import { habits, habitCategories } from "./data/habits.js";
import { exercises, exerciseCategories } from "./data/exercises.js";
import { foods, foodCategories } from "./data/foods.js";
import { SupplementTree } from "./trees/SupplementTree.js";
import { HabitsTree } from "./trees/HabitsTree.js";
import { ExerciseTree } from "./trees/ExerciseTree.js";
import { FoodsTree } from "./trees/FoodsTree.js";
import { HoverPopup } from "./components/HoverPopup.js";
import { ExplorerModal } from "./components/ExplorerModal.js";

// Import Tailwind + custom styles (processed by Vite)
import './style.css';

// Expose organ meta globally for components that need it
window.AETHERIS_ORGAN_META = organMeta;

console.log("%c[AETHERIS Modular] Bootstrapping Supplements tree...", "color:#64748b");

// Lightweight runtime validation (no Zod, keeps deps zero). Warns on missing/inconsistent fields.
function validateTreeData(data, label = 'data') {
  if (!Array.isArray(data)) {
    console.warn(`[AETHERIS] ${label} is not an array`);
    return;
  }
  const seen = new Set();
  let missing = 0;
  data.forEach((n, i) => {
    if (!n || !n.id || !n.name || !n.cat) {
      missing++;
      if (missing < 4) console.warn(`[AETHERIS] ${label}[${i}] missing id/name/cat`, n);
    }
    if (n && n.id) {
      if (seen.has(n.id)) console.warn(`[AETHERIS] ${label} duplicate id: ${n.id}`);
      seen.add(n.id);
    }
    if (n && typeof n.vitality !== 'number' && typeof n.longevity !== 'number') {
      if (missing < 3) console.warn(`[AETHERIS] ${label} ${n.id || i} lacks vitality/longevity score`);
    }
  });
  if (missing) console.warn(`[AETHERIS] ${label}: ${missing} entries with basic field issues (of ${data.length})`);
}

let treeInstance = null;

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("tree-canvas");
  if (!canvas) {
    console.error("Tree canvas not found");
    return;
  }

  const detailPanel = document.getElementById("detail-panel");

  // === Initialize Components ===
  const hoverPopup = new HoverPopup().init();
  const explorerModal = new ExplorerModal().init();

  // Expose globally for inline onclick handlers in the HTML
  window.AETHERIS = {
    popup: hoverPopup,
    modal: explorerModal,
    tree: treeInstance,
    ORGAN_META: organMeta,
    currentConstellation: 'supplements',
    categories: categories
  };

  // === Constellation switching (modular) ===
  let currentTreeType = 'supplements';

  function switchConstellation(type) {
    if (type === currentTreeType) return;

    currentTreeType = type;
    hoverPopup.hide();

    if (treeInstance) {
      treeInstance.dispose();
    }

    const isSupplements = type === 'supplements';
    const isExercises = type === 'exercises';
    const isFoods = type === 'foods';

    // Create the right tree class
    if (isSupplements) {
      treeInstance = new SupplementTree(canvas);
      bindTreeViewport(treeInstance);
      treeInstance.loadData(supplements);
      validateTreeData(supplements, 'supplements');
      window.AETHERIS.categories = categories;
    } else if (isExercises) {
      treeInstance = new ExerciseTree(canvas);
      bindTreeViewport(treeInstance);
      treeInstance.loadData(exercises);
      validateTreeData(exercises, 'exercises');
      window.AETHERIS.categories = exerciseCategories;
    } else if (isFoods) {
      treeInstance = new FoodsTree(canvas);
      bindTreeViewport(treeInstance);
      treeInstance.loadData(foods);
      validateTreeData(foods, 'foods');
      window.AETHERIS.categories = foodCategories;
    } else {
      treeInstance = new HabitsTree(canvas);
      bindTreeViewport(treeInstance);
      treeInstance.loadData(habits);
      validateTreeData(habits, 'habits');
      window.AETHERIS.categories = habitCategories;
    }

    // Re-render and center body in the middle
    treeInstance.draw();
    if (typeof treeInstance.recenter === "function") {
      treeInstance.recenter();
    }

    // Update global reference
    window.AETHERIS.tree = treeInstance;
    window.AETHERIS.currentConstellation = type;

    // Update button active states
    updateConstellationButtons(type);

    // Clear detail panel
    if (detailPanel) {
      const label = isFoods ? 'foods' : (isExercises ? 'exercises' : (isSupplements ? 'supplements' : 'habits'));
      detailPanel.innerHTML = `<div class="text-white/60">Select a node on the ${label} map</div>`;
    }

    rewireMapControls();
    renderGroupFilters();
    renderNodeLimitControl();
  }

  function updateConstellationButtons(activeType) {
    const supBtn = document.getElementById('btn-constellation-supplements');
    const habBtn = document.getElementById('btn-constellation-habits');
    const exBtn = document.getElementById('btn-constellation-exercises');
    const foodBtn = document.getElementById('btn-constellation-foods');
    if (supBtn) supBtn.classList.toggle('active', activeType === 'supplements');
    if (habBtn) habBtn.classList.toggle('active', activeType === 'habits');
    if (exBtn) exBtn.classList.toggle('active', activeType === 'exercises');
    if (foodBtn) foodBtn.classList.toggle('active', activeType === 'foods');
  }

  function renderGroupFilters() {
    const container = document.getElementById('group-filters');
    if (!container || !treeInstance) return;

    const cats = (window.AETHERIS.categories || []).filter(c => c.key !== 'all');
    container.innerHTML = '';

    const allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.className = 'group-chip px-2.5 py-1 text-[10px] rounded-xl border border-amber-400/50 bg-amber-400/15 text-amber-200 hover:bg-amber-400/25 transition font-semibold tracking-wide';
    allBtn.textContent = 'ALL';
    allBtn.onclick = () => {
      if (typeof treeInstance.toggleAllGroups === 'function') {
        treeInstance.toggleAllGroups();
      } else {
        treeInstance.enableAllGroups();
      }
      syncGroupFilterChips();
      // Sync detail in case the ALL toggle (combined with active limit) culled the selection
      const currentSel = treeInstance.selectedId ? treeInstance.nodes.find(n => n.id === treeInstance.selectedId) : null;
      updateDetail(currentSel);
    };
    container.appendChild(allBtn);

    cats.forEach(cat => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.key = cat.key;
      btn.className = 'group-chip px-2.5 py-1 text-[10px] rounded-xl border transition flex items-center gap-1 font-medium tracking-wide';
      btn.innerHTML = `<i class="fa-solid ${cat.icon} opacity-80"></i><span>${cat.label}</span>`;
      btn.onclick = () => {
        treeInstance.toggleGroup(cat.key);
        syncGroupFilterChips();
        // Always sync detail: _afterGroupChange (or maxNodes) may have nulled selectedId if it fell outside visible set
        const currentSel = treeInstance.selectedId ? treeInstance.nodes.find(n => n.id === treeInstance.selectedId) : null;
        updateDetail(currentSel);
      };
      container.appendChild(btn);
    });

    syncGroupFilterChips();
  }

  function syncGroupFilterChips() {
    const container = document.getElementById('group-filters');
    if (!container || !treeInstance) return;
    container.querySelectorAll('.group-chip[data-key]').forEach(btn => {
      const on = treeInstance.isGroupEnabled(btn.dataset.key);
      btn.classList.toggle('border-white/25', on);
      btn.classList.toggle('bg-white/10', on);
      btn.classList.toggle('text-white/90', on);
      btn.classList.toggle('border-white/10', !on);
      btn.classList.toggle('bg-[#0a0d1a]/60', !on);
      btn.classList.toggle('text-white/35', !on);
      btn.classList.toggle('line-through', !on);
    });

    // Sync ALL chip state (amber when all explicitly on; dim/partial when mixed; line-through when all-off for quick-reset)
    const allBtn = container.querySelector('.group-chip:not([data-key])');
    if (allBtn) {
      const cats = (window.AETHERIS.categories || []).filter(c => c.key !== 'all');
      const total = cats.length;
      const onCount = cats.filter(c => treeInstance.isGroupEnabled(c.key)).length;
      const allOn = total > 0 && onCount === total;
      const noneOn = (treeInstance.enabledGroups?.size || 0) === 0;
      if (allOn) {
        allBtn.className = 'group-chip px-2.5 py-1 text-[10px] rounded-xl border border-amber-400/50 bg-amber-400/15 text-amber-200 hover:bg-amber-400/25 transition font-semibold tracking-wide';
      } else if (noneOn) {
        allBtn.className = 'group-chip px-2.5 py-1 text-[10px] rounded-xl border border-white/10 bg-[#0a0d1a]/60 text-white/35 hover:bg-white/10 transition font-semibold tracking-wide line-through';
      } else {
        // partial selection
        allBtn.className = 'group-chip px-2.5 py-1 text-[10px] rounded-xl border border-amber-400/30 bg-amber-400/5 text-amber-200/70 hover:bg-amber-400/15 transition font-semibold tracking-wide';
      }
    }
  }

  function rewireMapControls() {
    const btnZoomIn = document.getElementById('btn-zoom-in');
    const btnZoomOut = document.getElementById('btn-zoom-out');
    const btnRecenter = document.getElementById('btn-recenter');

    if (btnZoomIn) btnZoomIn.onclick = () => treeInstance && treeInstance.zoom(1);
    if (btnZoomOut) btnZoomOut.onclick = () => treeInstance && treeInstance.zoom(-1);
    if (btnRecenter) btnRecenter.onclick = () => treeInstance && treeInstance.recenter();
  }

  // Node Limit slider (UPGRADE 2.1): top N by vitality (in bottom bar above filters).
  // 0 = unlimited (shows all after group filters). Slider lets focus on most impactful without overload.
  function renderNodeLimitControl() {
    const mount = document.getElementById('node-limit-control');
    if (!mount || !treeInstance) return;
    // Clean any legacy absolute wrap from previous layout
    const legacy = document.getElementById('node-limit-wrap');
    if (legacy && legacy.parentNode) legacy.parentNode.removeChild(legacy);

    const current = treeInstance.maxNodes || 0;
    const val = current > 0 ? current : 80;
    mount.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="uppercase tracking-[1px] text-white/50">TOP</span>
        <input id="node-limit-range" type="range" min="5" max="150" step="5" value="${val}" class="w-28 accent-amber-400">
        <span id="node-limit-val" class="font-mono w-8 text-amber-300">${current > 0 ? current : 'ALL'}</span>
        <button id="node-limit-all" class="px-2 py-0.5 rounded-xl border text-[9px] border-amber-400/40 hover:bg-amber-400/10 text-amber-300/80">ALL</button>
      </div>
    `;
    const range = mount.querySelector('#node-limit-range');
    const valEl = mount.querySelector('#node-limit-val');
    const allBtn = mount.querySelector('#node-limit-all');
    if (range) {
      range.oninput = () => {
        const n = parseInt(range.value, 10);
        if (treeInstance) {
          treeInstance.setMaxNodes(n);
          valEl.textContent = n;
          // Sync inspector: if the limit culled the selected node, clear the detail panel
          if (!treeInstance.selectedId) {
            updateDetail(null);
          } else {
            const vis = (typeof treeInstance._getVisibleNodes === 'function') ? treeInstance._getVisibleNodes() : treeInstance.nodes;
            const sel = vis.find(n => n.id === treeInstance.selectedId);
            if (sel) updateDetail(sel);
          }
        }
      };
    }
    if (allBtn) {
      allBtn.onclick = () => {
        if (treeInstance) {
          treeInstance.setMaxNodes(0);
          valEl.textContent = 'ALL';
          if (range) range.value = 80;
          // Sync inspector after expanding back to all
          if (!treeInstance.selectedId) {
            updateDetail(null);
          } else {
            const vis = (typeof treeInstance._getVisibleNodes === 'function') ? treeInstance._getVisibleNodes() : treeInstance.nodes;
            const sel = vis.find(n => n.id === treeInstance.selectedId);
            if (sel) updateDetail(sel);
          }
        }
      };
    }
    // If currently unlimited, show ALL
    if (current === 0 && valEl) valEl.textContent = 'ALL';
  }

  function bindTreeViewport(tree) {
    if (!tree) return;
    tree.bindViewport(() => {
      if (typeof tree.computeLayout === 'function') tree.computeLayout();
      tree.draw();
    });
  }

  function canvasPointer(e) {
    if (treeInstance?.viewport) return treeInstance.viewport.pointerFromEvent(e);
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  // Create and load the initial Supplements tree
  treeInstance = new SupplementTree(canvas);
  bindTreeViewport(treeInstance);
  treeInstance.loadData(supplements);
  validateTreeData(supplements, 'supplements');
  window.AETHERIS.categories = categories;
  window.AETHERIS.currentConstellation = 'supplements';

  // Initial render
  treeInstance.draw();

  // Force viewport to measure the actual fullscreen container size
  // (important after removing fixed 720px + outer wrappers for full map+sidebar focus)
  requestAnimationFrame(() => {
    if (treeInstance?.viewport) {
      treeInstance.viewport.resize();
      if (typeof treeInstance.computeLayout === 'function') treeInstance.computeLayout();
      treeInstance.draw();
    }
  });

  // === Map Interaction (Pan + Zoom) ===
  const DRAG_THRESHOLD = 5;
  let pointerDown = false;
  let isPanning = false;
  let suppressNextClick = false;
  let downX = 0, downY = 0;
  let lastX = 0, lastY = 0;

  canvas.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    pointerDown = true;
    isPanning = false;
    downX = lastX = e.clientX;
    downY = lastY = e.clientY;
  });

  window.addEventListener('mouseup', () => {
    if (isPanning) suppressNextClick = true;
    pointerDown = false;
    isPanning = false;
    canvas.style.cursor = 'grab';
  });

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    treeInstance.zoom(e.deltaY);
  }, { passive: false });

  // === Touch support: drag pan + pinch-zoom (12 quick win) ===
  let touchStartDist = 0;
  let lastTouchX = 0, lastTouchY = 0;
  let touchCount = 0;

  function getTouchDist(e) {
    if (e.touches.length < 2) return 0;
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    return Math.hypot(dx, dy);
  }

  canvas.addEventListener('touchstart', (e) => {
    if (!treeInstance) return;
    e.preventDefault();
    touchCount = e.touches.length;
    pointerDown = true;
    isPanning = false;
    if (touchCount === 1) {
      downX = lastX = lastTouchX = e.touches[0].clientX;
      downY = lastY = lastTouchY = e.touches[0].clientY;
    } else if (touchCount === 2) {
      touchStartDist = getTouchDist(e);
      lastTouchX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      lastTouchY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    if (!treeInstance || !pointerDown) return;
    e.preventDefault();
    if (e.touches.length === 2 && touchStartDist > 10) {
      // Pinch zoom
      const newDist = getTouchDist(e);
      const factor = newDist / touchStartDist;
      // Map factor to zoom steps (tree.zoom expects deltaY-like sign/magnitude)
      const zoomAmt = (factor > 1 ? -1 : 1) * Math.min(60, Math.abs(Math.log(factor) * 80));
      treeInstance.zoom(zoomAmt);
      touchStartDist = newDist; // continuous
      return;
    }
    // Single touch pan
    const tx = e.touches[0].clientX;
    const ty = e.touches[0].clientY;
    const moved = Math.hypot(tx - downX, ty - downY);
    if (!isPanning && moved > DRAG_THRESHOLD) {
      isPanning = true;
      hoverPopup.hide();
    }
    if (isPanning) {
      treeInstance.pan(tx - lastTouchX, ty - lastTouchY);
      lastTouchX = tx;
      lastTouchY = ty;
    }
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    if (!treeInstance) return;
    const wasPanning = isPanning;
    if (wasPanning) suppressNextClick = true;
    pointerDown = false;
    isPanning = false;
    touchStartDist = 0;
    touchCount = 0;
    canvas.style.cursor = 'grab';
    // If it was a tap (no pan), treat as click on release
    if (!wasPanning && e.changedTouches && e.changedTouches.length) {
      const t = e.changedTouches[0];
      const fake = { clientX: t.clientX, clientY: t.clientY };
      const { x: mx, y: my } = canvasPointer(fake);
      const hit = treeInstance.getNodeAt(mx, my);
      if (hit) {
        hoverPopup.hide();
        treeInstance.select(hit.id);
        updateDetail(hit);
      } else {
        treeInstance.reset();
        updateDetail(null);
        hoverPopup.hide();
      }
    }
  }, { passive: false });

  // Also allow touchcancel to clean state
  canvas.addEventListener('touchcancel', () => {
    pointerDown = false;
    isPanning = false;
    touchStartDist = 0;
  });

  rewireMapControls();
  renderGroupFilters();
  renderNodeLimitControl();

  // Wire constellation switcher buttons (inside the map frame)
  const supBtn = document.getElementById('btn-constellation-supplements');
  const habBtn = document.getElementById('btn-constellation-habits');
  const exBtn = document.getElementById('btn-constellation-exercises');
  const foodBtn = document.getElementById('btn-constellation-foods');

  if (supBtn) supBtn.onclick = () => switchConstellation('supplements');
  if (habBtn) habBtn.onclick = () => switchConstellation('habits');
  if (exBtn) exBtn.onclick = () => switchConstellation('exercises');
  if (foodBtn) foodBtn.onclick = () => switchConstellation('foods');

  // Mark initial active state
  updateConstellationButtons('supplements');

  function updateDetail(node) {
    if (!detailPanel) return;
    if (!node) {
      const label = currentTreeType === 'habits' ? 'habits' : (currentTreeType === 'exercises' ? 'exercises' : (currentTreeType === 'foods' ? 'foods' : 'supplements'));
      detailPanel.innerHTML = `<div class="text-white/60">Select a node on the ${label} map</div>`;
      return;
    }

    const isNegative = (node.impact === 'negative' || node._isNegative);
    const scoreLabel = isNegative ? 'Harm / Damage' : 'Longevity';
    const scoreColor = isNegative ? 'text-red-400' : 'text-cyan-300';
    const overallColor = isNegative ? 'text-red-300' : 'text-amber-300';
    const supportsLabel = isNegative ? 'Damages / Negative Impact On' : 'Supports';

    // Richer inspector content (7.1): mechanisms + study + timing/bestForms + dosage in place.
    // "Read more" keeps full Gorkipedia in modal (6.4 spirit: inspector is now primary).
    let extraInfo = '';
    const mechs = (node.mechanisms || []).slice(0, 3);
    if (mechs.length) {
      extraInfo += `
        <div class="mt-3">
          <div class="text-[10px] uppercase tracking-widest ${isNegative ? 'text-red-400/70' : 'text-white/50'} mb-1">MECHANISMS ${isNegative ? '(HARM)' : '(BENEFIT)'}</div>
          <div class="text-[11px] text-white/80 leading-snug">${mechs.join(' • ')}</div>
        </div>`;
    }
    if (node.studies && node.studies.length) {
      const s = node.studies[0];
      extraInfo += `
        <div class="mt-2 text-[10px] text-white/70">
          <span class="font-mono text-amber-300/90">${s.year}</span> ${s.finding}
          ${s.source ? `<span class="text-white/50"> — ${s.source}</span>` : ''}
        </div>`;
    }
    if (node.dosage || node.timing || node.bestForms) {
      extraInfo += `
        <div class="mt-2">
          <div class="text-[10px] uppercase tracking-widest ${isNegative ? 'text-red-400/70' : 'text-white/50'} mb-0.5">SERVING / PROTOCOL</div>
          ${node.dosage ? `<div class="text-[11px] text-white/85">${node.dosage}</div>` : ''}
          ${node.timing ? `<div class="text-[10px] text-white/60 mt-0.5"><span class="uppercase tracking-widest text-[9px] text-white/45">TIMING:</span> ${node.timing}</div>` : ''}
          ${node.bestForms ? `<div class="text-[10px] text-white/60 mt-0.5"><span class="uppercase tracking-widest text-[9px] text-white/45">BEST FORMS:</span> ${node.bestForms}</div>` : ''}
        </div>`;
    }
    if (node.highDoseRisks || (isNegative && node.risks)) {
      const riskText = node.highDoseRisks || node.risks;
      extraInfo += `
        <div class="mt-2 p-1.5 rounded-lg bg-orange-950/30 border border-orange-500/30">
          <div class="text-[9px] uppercase tracking-widest text-orange-400 mb-0.5 flex items-center gap-1"><i class="fa-solid fa-exclamation-triangle"></i> ${isNegative ? 'RISKS' : 'HIGH DOSE / CAUTION'}</div>
          <div class="text-[10px] text-orange-200/90">${riskText}</div>
        </div>`;
    }

    // Organ chips now clickable for benefit explanations (6.2) — leverages mechanisms + static hints, no node schema changes.
    const organChips = (node.organs || []).map(key => {
      const meta = organMeta[key];
      if (!meta) return '';
      const col = isNegative ? '#ef4444' : meta.color;
      return `<button data-organ="${key}" class="organ-chip px-2 py-0.5 text-[10px] rounded-full border hover:scale-[1.02] active:scale-[0.98] transition" style="border-color:${col}44; background:${col}11; color:${col}">${meta.label}</button>`;
    }).join('');

    detailPanel.innerHTML = `
      <div class="text-left w-full">
        <div class="text-2xl font-semibold title-font tracking-tight ${isNegative ? 'text-red-300' : ''}">${node.name}</div>
        <div class="text-xs uppercase tracking-widest ${isNegative ? 'text-red-400' : 'text-amber-400'} mt-1">${node.cat.toUpperCase()} • ${node.short} ${isNegative ? '• HARMFUL' : ''}</div>
        
        <div class="mt-4 grid grid-cols-3 gap-2 text-sm">
          <div class="bg-[#0a0d1a] p-2 rounded-xl">${scoreLabel} <span class="font-mono ${scoreColor}">${node.longevity}</span></div>
          <div class="bg-[#0a0d1a] p-2 rounded-xl">QoL <span class="font-mono text-violet-300">${node.qol}</span></div>
          <div class="bg-[#0a0d1a] p-2 rounded-xl">Overall <span class="font-mono ${overallColor}">${node.vitality}</span></div>
        </div>

        <div class="mt-3 text-xs text-white/80 leading-snug">${node.blurb}</div>

        ${isNegative && node.risks && !node.highDoseRisks ? `
        <div class="mt-3 p-2 rounded-xl bg-red-950/40 border border-red-500/30">
          <div class="text-[10px] uppercase tracking-widest text-red-400 mb-1">NEGATIVE EFFECTS / RISKS</div>
          <div class="text-[11px] text-red-200/90">${node.risks}</div>
        </div>` : ''}

        <div class="mt-3">
          <div class="text-[10px] uppercase tracking-widest ${isNegative ? 'text-red-400/70' : 'text-white/50'} mb-1">${supportsLabel}</div>
          <div class="flex flex-wrap gap-1" id="inspector-organs">${organChips || '<span class="text-white/40 text-[10px]">—</span>'}</div>
          <div id="inspector-organ-benefit" class="hidden mt-2 p-2 text-[10px] bg-white/5 border border-white/10 rounded-xl text-white/80"></div>
        </div>

        ${extraInfo}

        <div class="mt-3 flex gap-2">
          <button id="open-explorer-btn" 
                  class="flex-1 text-xs py-2 rounded-2xl border ${isNegative ? 'border-red-400/40 bg-red-400/10 hover:bg-red-400/15 text-red-300' : 'border-violet-400/40 bg-violet-400/10 hover:bg-violet-400/15 text-violet-300'}">
            Read full monograph
          </button>
          <button id="share-btn" class="px-3 text-xs py-2 rounded-2xl border border-white/20 hover:bg-white/10 text-white/80 flex items-center gap-1" title="Share to X + copy">
            <i class="fa-brands fa-x-twitter"></i>
          </button>
          <button id="ext-link-btn" class="px-3 text-xs py-2 rounded-2xl border border-white/20 hover:bg-white/10 text-white/80" title="External sources">↗</button>
        </div>
      </div>
    `;

    // Organ click handlers (6.2) — derive explanation from mechanisms + hints (no node edits)
    const organsWrap = detailPanel.querySelector('#inspector-organs');
    const benefitBox = detailPanel.querySelector('#inspector-organ-benefit');
    const organHintMap = {
      brain: 'Supports cognition, neuroprotection & mood via BDNF, membrane fluidity, reduced inflammation, and neurotransmitter balance.',
      heart: 'Cardioprotective: improves endothelial function, lipid profiles, mitochondrial efficiency in cardiac muscle.',
      immune: 'Modulates inflammation & immune surveillance; supports cytokine balance and barrier integrity.',
      mito: 'Enhances mitochondrial biogenesis, ATP production, and reduces oxidative stress in energy centers.',
      muscle: 'Anabolic/anti-catabolic support, protein synthesis, recovery, and sarcopenia resistance.',
      metabolic: 'Improves insulin sensitivity, AMPK activation, glucose/lipid handling, and metabolic flexibility.',
      gut: 'Feeds microbiome, strengthens barrier, increases SCFA/butyrate, reduces endotoxemia.',
      joints: 'Cartilage matrix support, anti-inflammatory on connective tissue, collagen synthesis.',
      eyes: 'Protects macular pigment, reduces oxidative damage to retina, supports visual processing.',
      liver: 'Phase II detox, NF-κB/Nrf2 modulation, fat metabolism, and hepatocyte protection.'
    };
    if (organsWrap && benefitBox) {
      organsWrap.querySelectorAll('.organ-chip').forEach(chip => {
        chip.onclick = (e) => {
          const key = chip.dataset.organ;
          const meta = organMeta[key];
          const hint = organHintMap[key] || 'Key longevity organ system targeted by this molecule.';
          const relMechs = (node.mechanisms || []).filter(m => {
            const low = m.toLowerCase();
            return low.includes(key) || (key==='brain' && (low.includes('neuro')||low.includes('bdnf')||low.includes('cog'))) ||
                   (key==='heart' && (low.includes('cardio')||low.includes('endoth')||low.includes('vascular'))) || true;
          }).slice(0,2);
          benefitBox.innerHTML = `<span class="font-semibold text-[10px] text-white/60">${meta ? meta.label : key.toUpperCase()}:</span> ${hint} ${relMechs.length ? '<div class="mt-1 text-white/60">Via: ' + relMechs.join(' • ') + '</div>' : ''}`;
          benefitBox.classList.remove('hidden');
          // one-click closes
          benefitBox.onclick = () => benefitBox.classList.add('hidden');
        };
      });
    }

    // (Body highlight handled in canvas)

    const explorerBtn = detailPanel.querySelector('#open-explorer-btn');
    if (explorerBtn) {
      explorerBtn.onclick = () => {
        if (window.AETHERIS?.modal) {
          window.AETHERIS.modal.open(node, {
            onHighlight: (ids) => treeInstance.draw(ids, true),
            onStack: (ids) => treeInstance.draw(ids, true)
          });
        }
      };
    }

    // Share (8.1)
    const shareBtn = detailPanel.querySelector('#share-btn');
    if (shareBtn) {
      shareBtn.onclick = () => {
        const txt = `${node.name} scores ${node.vitality || node.longevity} on AETHERIS. ${node.blurb || ''} aetheris.app 🧬`;
        navigator.clipboard?.writeText(txt).catch(()=>{});
        const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(txt)}`;
        window.open(xUrl, '_blank', 'width=560,height=420');
      };
    }

    // External links (7.3) — ONLY to Gorkipedia article on the subject.
    // Nodes should provide `url` (e.g. "https://grokipedia.app/creatine-monohydrate"); fallback uses id.
    const extBtn = detailPanel.querySelector('#ext-link-btn');
    if (extBtn) {
      extBtn.onclick = () => {
        const grokUrl = node.url || node.grokipediaUrl || `https://grokipedia.app/${node.id}`;
        window.open(grokUrl, '_blank');
      };
      // Update title to reflect Gorkipedia-only
      extBtn.title = 'View Gorkipedia article';
    }
  }

  // =====================================================
  // 3.1 PERSONAL CORNER — Collapsible personalization section under inspector
  // Persisted in localStorage, generates BMI + rule-based supplement recs + risk flags.
  // All logic client-side per privacy note in UPGRADEME.
  // =====================================================
  let personalData = {};
  const PERSONAL_STORAGE_KEY = 'aetheris-personal-v1';

  function loadPersonalData() {
    try {
      const raw = localStorage.getItem(PERSONAL_STORAGE_KEY);
      personalData = raw ? JSON.parse(raw) : {};
    } catch (e) {
      personalData = {};
    }
  }

  function savePersonalData() {
    try {
      localStorage.setItem(PERSONAL_STORAGE_KEY, JSON.stringify(personalData));
    } catch (e) {}
  }

  function computeBMI(p = personalData) {
    if (!p.weight || !p.height) return null;
    const h = parseFloat(p.height) / 100;
    if (!h) return null;
    const val = parseFloat(p.weight) / (h * h);
    return isFinite(val) ? val.toFixed(1) : null;
  }

  function getPersonalInsights(p = personalData) {
    const out = { bmi: null, category: '', recs: [], risks: [] };
    const bmi = computeBMI(p);
    if (bmi) {
      out.bmi = bmi;
      const n = parseFloat(bmi);
      if (n < 18.5) out.category = 'Underweight';
      else if (n < 25) out.category = 'Normal';
      else if (n < 30) out.category = 'Overweight';
      else out.category = 'Obese';
      if (n >= 30) out.risks.push('BMI ≥30 associated with higher systemic inflammation & CV risk');
    }

    const age = parseInt(p.age, 10) || 0;
    const sys = parseInt(p.systolic, 10) || 0;
    const dia = parseInt(p.diastolic, 10) || 0;
    const sleep = (p.sleep || '').toLowerCase();
    const push = parseInt(p.pushups, 10) || 0;

    // BP rules (high BP examples from UPGRADEME)
    if (sys > 130 || dia > 85) {
      out.recs.push({ name: 'L-Citrulline', reason: 'Nitric oxide support for endothelial function & BP' });
      out.recs.push({ name: 'Coenzyme Q10', reason: 'Mitochondrial & cardio support for elevated BP' });
      out.recs.push({ name: 'Omega-3 EPA/DHA', reason: 'Lowers triglycerides & vascular inflammation' });
      out.risks.push('Elevated BP — Omega-3, Citrulline & CoQ10 frequently studied for support');
    }

    // Sleep / recovery
    if (sleep === 'poor' || sleep === 'fair') {
      out.recs.push({ name: 'Magnesium (Glycinate)', reason: 'Strong match for reported sleep quality & relaxation' });
      out.recs.push({ name: 'Taurine', reason: 'Supports inhibitory tone & overnight recovery' });
      out.risks.push('Poor sleep quality reported — magnesium & taurine commonly helpful');
    }

    // Age + strength markers (sarcopenia prevention)
    if (age > 50 && push < 25) {
      out.recs.push({ name: 'Creatine Monohydrate', reason: 'Age + lower strength markers prioritize sarcopenia prevention' });
      out.recs.push({ name: 'Vitamin D3', reason: 'Muscle function & bone support in older adults' });
    }

    // Low mood/energy quick flag (from the Mood/Energy select)
    if ((p.mood || '').toLowerCase() === 'low') {
      out.recs.push({ name: 'Vitamin D3', reason: 'Mood & energy support when levels or latitude are low' });
      out.recs.push({ name: 'Omega-3 EPA/DHA', reason: 'Brain membrane & mood pathways' });
    }

    // Dedup recs
    const seen = new Set();
    out.recs = out.recs.filter(r => !seen.has(r.name) && seen.add(r.name)).slice(0, 5);

    return out;
  }

  function updatePersonalField(key, value) {
    if (value === '' || value === null) {
      delete personalData[key];
    } else {
      personalData[key] = value;
    }
    savePersonalData();
    renderPersonalPanel(); // live update insights
  }

  function renderPersonalPanel() {
    const panel = document.getElementById('personal-panel');
    const header = document.getElementById('personal-header');
    if (!panel) return;

    const p = personalData;
    const insights = getPersonalInsights(p);
    const bmi = insights.bmi;
    const hasAnyData = Object.keys(p).some(k => p[k] !== '' && p[k] != null);

    let html = '';

    // Form (compact 2-col grid)
    html += `<div class="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px] mb-3">`;

    // Row 1: Age / Gender
    html += `
      <div>
        <div class="text-white/40 mb-0.5">Age</div>
        <input type="number" min="18" max="100" class="w-full bg-[#0a0d1a] border border-white/15 rounded-xl px-2 py-1 text-white/90 text-xs" 
               value="${p.age || ''}" placeholder="42" data-key="age" />
      </div>
      <div>
        <div class="text-white/40 mb-0.5">Gender</div>
        <select class="w-full bg-[#0a0d1a] border border-white/15 rounded-xl px-2 py-1 text-white/90 text-xs" data-key="gender">
          <option value="">—</option>
          <option value="male" ${p.gender === 'male' ? 'selected' : ''}>Male</option>
          <option value="female" ${p.gender === 'female' ? 'selected' : ''}>Female</option>
          <option value="other" ${p.gender === 'other' ? 'selected' : ''}>Other</option>
        </select>
      </div>`;

    // Row 2: Weight / Height → BMI live
    html += `
      <div>
        <div class="text-white/40 mb-0.5">Weight (kg)</div>
        <input type="number" step="0.5" class="w-full bg-[#0a0d1a] border border-white/15 rounded-xl px-2 py-1 text-white/90 text-xs" 
               value="${p.weight || ''}" placeholder="78" data-key="weight" />
      </div>
      <div>
        <div class="text-white/40 mb-0.5">Height (cm)</div>
        <input type="number" class="w-full bg-[#0a0d1a] border border-white/15 rounded-xl px-2 py-1 text-white/90 text-xs" 
               value="${p.height || ''}" placeholder="178" data-key="height" />
      </div>`;

    // Always show a live BMI preview row (updates while typing; saved value + category on change)
    const liveBmi = computeBMI(p);
    html += `<div class="col-span-2 text-[10px] text-amber-300/90 mt-0.5" id="personal-live-bmi">
      BMI: <span class="font-mono">${liveBmi || '—'}</span>
      ${liveBmi ? `<span class="text-white/50">(${insights.category})</span>` : '<span class="text-white/40">(enter weight + height)</span>'}
    </div>`;

    // BP
    html += `
      <div class="col-span-2">
        <div class="text-white/40 mb-0.5">Blood Pressure (mmHg)</div>
        <div class="flex gap-2">
          <input type="number" class="flex-1 bg-[#0a0d1a] border border-white/15 rounded-xl px-2 py-1 text-white/90 text-xs" 
                 value="${p.systolic || ''}" placeholder="Sys" data-key="systolic" />
          <input type="number" class="flex-1 bg-[#0a0d1a] border border-white/15 rounded-xl px-2 py-1 text-white/90 text-xs" 
                 value="${p.diastolic || ''}" placeholder="Dia" data-key="diastolic" />
        </div>
      </div>`;

    // Exercise metrics
    html += `
      <div>
        <div class="text-white/40 mb-0.5">Push-ups (max reps)</div>
        <input type="number" class="w-full bg-[#0a0d1a] border border-white/15 rounded-xl px-2 py-1 text-white/90 text-xs" 
               value="${p.pushups || ''}" placeholder="25" data-key="pushups" />
      </div>
      <div>
        <div class="text-white/40 mb-0.5">Sleep quality</div>
        <select class="w-full bg-[#0a0d1a] border border-white/15 rounded-xl px-2 py-1 text-white/90 text-xs" data-key="sleep">
          <option value="">—</option>
          <option value="poor" ${p.sleep === 'poor' ? 'selected' : ''}>Poor</option>
          <option value="fair" ${p.sleep === 'fair' ? 'selected' : ''}>Fair</option>
          <option value="good" ${p.sleep === 'good' ? 'selected' : ''}>Good</option>
        </select>
      </div>`;

    // Lifestyle quick selects
    html += `
      <div>
        <div class="text-white/40 mb-0.5">Mood / Energy</div>
        <select class="w-full bg-[#0a0d1a] border border-white/15 rounded-xl px-2 py-1 text-white/90 text-xs" data-key="mood">
          <option value="">—</option>
          <option value="low" ${p.mood === 'low' ? 'selected' : ''}>Low</option>
          <option value="ok" ${p.mood === 'ok' ? 'selected' : ''}>OK</option>
          <option value="good" ${p.mood === 'good' ? 'selected' : ''}>Good</option>
        </select>
      </div>
      <div>
        <div class="text-white/40 mb-0.5">Digestion / Skin</div>
        <select class="w-full bg-[#0a0d1a] border border-white/15 rounded-xl px-2 py-1 text-white/90 text-xs" data-key="digestion">
          <option value="">—</option>
          <option value="poor" ${p.digestion === 'poor' ? 'selected' : ''}>Issues</option>
          <option value="ok" ${p.digestion === 'ok' ? 'selected' : ''}>OK</option>
        </select>
      </div>`;

    html += `</div>`; // end grid

    // Insights / Recs
    if (hasAnyData) {
      html += `<div class="mt-2 pt-2 border-t border-white/10">`;
      if (insights.recs.length) {
        html += `<div class="text-[9px] uppercase tracking-widest text-emerald-400/80 mb-1">RECOMMENDED FOR YOU</div>`;
        insights.recs.forEach(r => {
          html += `<div class="text-[10px] text-white/85 mb-0.5">• <span class="text-emerald-300">${r.name}</span> — ${r.reason}</div>`;
        });
      }
      if (insights.risks.length) {
        html += `<div class="mt-2 text-[9px] uppercase tracking-widest text-orange-400/80 mb-0.5">RISK FLAGS</div>`;
        insights.risks.forEach(msg => {
          html += `<div class="text-[10px] text-orange-200/90 mb-0.5">⚠ ${msg}</div>`;
        });
      }
      html += `</div>`;
    } else {
      html += `<div class="text-[10px] text-white/40 mt-1">Fill in a few fields above to see personalized supplement matches and risk flags.</div>`;
    }

    // Footer actions
    html += `
      <div class="mt-3 pt-2 border-t border-white/10 flex gap-2 text-[9px]">
        <button id="personal-clear-btn" class="px-2 py-0.5 rounded-xl border border-white/15 hover:bg-white/5 text-white/60">Clear</button>
        <div class="flex-1 text-right text-white/30">Data stays in your browser</div>
      </div>`;

    panel.innerHTML = html;

    // Attach listeners (after innerHTML)
    // Use 'change' (not 'input') so we don't re-render + lose focus on every keystroke while typing.
    // User fills the value, then tabs/clicks away or picks select -> it commits, saves, and re-renders with live BMI/insights.
    panel.querySelectorAll('input[data-key], select[data-key]').forEach(el => {
      const key = el.dataset.key;
      el.addEventListener('change', () => updatePersonalField(key, el.value));
    });

    // Live BMI preview while typing weight/height (no full re-render, no focus loss)
    const liveBmiEl = panel.querySelector('#personal-live-bmi');
    const wEl = panel.querySelector('input[data-key="weight"]');
    const hEl = panel.querySelector('input[data-key="height"]');
    function refreshLiveBmi() {
      if (!liveBmiEl || !wEl || !hEl) return;
      const w = parseFloat(wEl.value);
      const h = parseFloat(hEl.value);
      if (w && h) {
        const val = (w / ((h / 100) ** 2)).toFixed(1);
        let cat = '';
        const n = parseFloat(val);
        if (n < 18.5) cat = 'Underweight';
        else if (n < 25) cat = 'Normal';
        else if (n < 30) cat = 'Overweight';
        else cat = 'Obese';
        liveBmiEl.innerHTML = `BMI: <span class="font-mono">${val}</span> <span class="text-white/50">(${cat})</span> <span class="text-[9px] text-white/30">(tab/click away to save)</span>`;
      } else {
        liveBmiEl.innerHTML = `BMI: <span class="font-mono">—</span> <span class="text-white/40">(enter weight + height)</span>`;
      }
    }
    if (wEl) wEl.addEventListener('input', refreshLiveBmi);
    if (hEl) hEl.addEventListener('input', refreshLiveBmi);

    const clearBtn = panel.querySelector('#personal-clear-btn');
    if (clearBtn) {
      clearBtn.onclick = () => {
        personalData = {};
        savePersonalData();
        renderPersonalPanel();
      };
    }
  }

  function initPersonalCorner() {
    loadPersonalData();

    const panel = document.getElementById('personal-panel');
    const header = document.getElementById('personal-header');
    const collapseBtn = document.getElementById('personal-collapse-btn');
    if (!panel || !header) return;

    // Start open (not collapsed) so the form/inputs are immediately visible and not "empty".
    // User can click the header to collapse the details if desired. (Still fully collapsible.)
    let isCollapsed = false;

    function toggleCollapse(forceOpen = false) {
      isCollapsed = forceOpen ? false : !isCollapsed;
      panel.classList.toggle('hidden', isCollapsed);
      if (collapseBtn) collapseBtn.textContent = isCollapsed ? '▾' : '▴';
      // Always ensure content is rendered when we show it (fixes initial empty panel)
      if (!isCollapsed) {
        renderPersonalPanel();
      }
    }

    header.onclick = () => toggleCollapse();
    if (collapseBtn) collapseBtn.onclick = (e) => { e.stopPropagation(); toggleCollapse(); };

    // Set initial visibility (open)
    panel.classList.toggle('hidden', isCollapsed);
    if (collapseBtn) collapseBtn.textContent = isCollapsed ? '▾' : '▴';

    // Always render the form + insights content (even if collapsed, content is ready to show)
    renderPersonalPanel();

    // If somehow collapsed, make sure we don't show it
    if (isCollapsed) {
      panel.classList.add('hidden');
    }

    // Expose for other modules / future green score (3.4 / 4.x)
    window.AETHERIS = window.AETHERIS || {};
    window.AETHERIS.personal = personalData;
    window.AETHERIS.getPersonalInsights = getPersonalInsights;
  }

  // Call init after other UI setup
  initPersonalCorner();

  window.AETHERIS.tree = treeInstance;

  canvas.addEventListener("mousemove", (e) => {
    if (pointerDown && treeInstance) {
      const moved = Math.hypot(e.clientX - downX, e.clientY - downY);
      if (!isPanning && moved > DRAG_THRESHOLD) {
        isPanning = true;
        hoverPopup.hide();
        canvas.style.cursor = 'grabbing';
      }
      if (isPanning) {
        treeInstance.pan(e.clientX - lastX, e.clientY - lastY);
        lastX = e.clientX;
        lastY = e.clientY;
        return;
      }
    }

    const { x: mx, y: my } = canvasPointer(e);

    const hit = treeInstance.getNodeAt(mx, my);
    treeInstance.setHover(hit ? hit.id : null);

    if (hit) {
      canvas.style.cursor = "pointer";
      hoverPopup.show(hit, e.clientX, e.clientY);
    } else {
      canvas.style.cursor = "crosshair";
      hoverPopup.hide();
    }
  });

  canvas.addEventListener("mouseleave", () => {
    hoverPopup.hide();
  });

  canvas.addEventListener("click", (e) => {
    if (suppressNextClick) {
      suppressNextClick = false;
      return;
    }

    const { x: mx, y: my } = canvasPointer(e);
    const hit = treeInstance.getNodeAt(mx, my);

    if (hit) {
      hoverPopup.hide();
      treeInstance.select(hit.id);
      updateDetail(hit);
    } else {
      treeInstance.reset();
      updateDetail(null);
      hoverPopup.hide();
    }
  });

  // === Keyboard shortcuts (polish + power user delight) ===
  window.addEventListener('keydown', (e) => {
    if (!treeInstance) return;
    if (e.key === 'Escape') {
      hoverPopup.hide();
      treeInstance.reset();
      updateDetail(null);
    } else if (e.key === '+' || e.key === '=') {
      treeInstance.zoom(1);
    } else if (e.key === '-' || e.key === '_') {
      treeInstance.zoom(-1);
    } else if (e.key.toLowerCase() === 'r') {
      treeInstance.recenter();
    } else if (e.key.toLowerCase() === 'f') {
      if (typeof treeInstance.toggleAllGroups === 'function') {
        treeInstance.toggleAllGroups();
      } else {
        treeInstance.enableAllGroups();
      }
      syncGroupFilterChips();
    }
  });

  setTimeout(() => {
    if (currentTreeType !== 'supplements' || !treeInstance) return;
    const omega = treeInstance.nodes.find(n => n.id === 'omega3');
    if (!omega) return;
    treeInstance.select('omega3');
    updateDetail(omega);
  }, 400);

  console.log("%c[AETHERIS Modular] Supplements tree + components initialized successfully.", "color:#4ade80");
});
