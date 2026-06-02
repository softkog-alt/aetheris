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
      window.AETHERIS.categories = categories;
    } else if (isExercises) {
      treeInstance = new ExerciseTree(canvas);
      bindTreeViewport(treeInstance);
      treeInstance.loadData(exercises);
      window.AETHERIS.categories = exerciseCategories;
    } else if (isFoods) {
      treeInstance = new FoodsTree(canvas);
      bindTreeViewport(treeInstance);
      treeInstance.loadData(foods);
      window.AETHERIS.categories = foodCategories;
    } else {
      treeInstance = new HabitsTree(canvas);
      bindTreeViewport(treeInstance);
      treeInstance.loadData(habits);
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
      treeInstance.enableAllGroups();
      syncGroupFilterChips();
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
        if (treeInstance.selectedId) {
          const sel = treeInstance.nodes.find(n => n.id === treeInstance.selectedId);
          if (sel) updateDetail(sel);
          else updateDetail(null);
        }
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
  }

  function rewireMapControls() {
    const btnZoomIn = document.getElementById('btn-zoom-in');
    const btnZoomOut = document.getElementById('btn-zoom-out');
    const btnRecenter = document.getElementById('btn-recenter');

    if (btnZoomIn) btnZoomIn.onclick = () => treeInstance && treeInstance.zoom(1);
    if (btnZoomOut) btnZoomOut.onclick = () => treeInstance && treeInstance.zoom(-1);
    if (btnRecenter) btnRecenter.onclick = () => treeInstance && treeInstance.recenter();
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

  rewireMapControls();
  renderGroupFilters();

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

    let extraInfo = '';
    if (node.mechanisms && node.mechanisms.length) {
      extraInfo += `
        <div class="mt-3">
          <div class="text-[10px] uppercase tracking-widest ${isNegative ? 'text-red-400/70' : 'text-white/50'} mb-1">MECHANISMS ${isNegative ? '(HARM)' : '(BENEFIT)'}</div>
          <div class="text-[11px] text-white/75 leading-snug">${node.mechanisms.slice(0,3).join(' • ')}</div>
        </div>`;
    }
    if (node.studies && node.studies.length) {
      const s = node.studies[0];
      extraInfo += `
        <div class="mt-2 text-[10px] text-white/60">
          <span class="font-mono">${s.year}</span>: ${s.finding}
        </div>`;
    }
    if (node.dosage) {
      extraInfo += `
        <div class="mt-2">
          <div class="text-[10px] uppercase tracking-widest ${isNegative ? 'text-red-400/70' : 'text-white/50'} mb-0.5">SERVING / PROTOCOL</div>
          <div class="text-[11px] text-white/80">${node.dosage}</div>
        </div>`;
    }
    if (node.timing) {
      extraInfo += `
        <div class="mt-1 text-[10px] text-white/60">
          <span class="uppercase tracking-widest text-[9px] text-white/50">TIMING:</span> ${node.timing}
        </div>`;
    }
    if (node.highDoseRisks) {
      extraInfo += `
        <div class="mt-2 p-1.5 rounded-lg bg-orange-950/30 border border-orange-500/30">
          <div class="text-[9px] uppercase tracking-widest text-orange-400 mb-0.5 flex items-center gap-1"><i class="fa-solid fa-exclamation-triangle"></i> HIGH DOSE RISKS</div>
          <div class="text-[10px] text-orange-200/90">${node.highDoseRisks}</div>
        </div>`;
    }

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

        ${isNegative && node.risks ? `
        <div class="mt-3 p-2 rounded-xl bg-red-950/40 border border-red-500/30">
          <div class="text-[10px] uppercase tracking-widest text-red-400 mb-1">NEGATIVE EFFECTS / RISKS</div>
          <div class="text-[11px] text-red-200/90">${node.risks}</div>
        </div>` : ''}

        <div class="mt-3">
          <div class="text-[10px] uppercase tracking-widest ${isNegative ? 'text-red-400/70' : 'text-white/50'} mb-1">${supportsLabel}</div>
          <div class="flex flex-wrap gap-1">
            ${(node.organs || []).map(key => {
              const meta = organMeta[key];
              if (!meta) return '';
              const col = isNegative ? '#ef4444' : meta.color;
              return `<span class="px-2 py-0.5 text-[10px] rounded-full border" style="border-color:${col}44; background:${col}11; color:${col}">${meta.label}</span>`;
            }).join('')}
          </div>
        </div>

        ${extraInfo}
        
        <button id="open-explorer-btn" 
                class="mt-4 w-full text-xs py-2 rounded-2xl border ${isNegative ? 'border-red-400/40 bg-red-400/10 hover:bg-red-400/15 text-red-300' : 'border-violet-400/40 bg-violet-400/10 hover:bg-violet-400/15 text-violet-300'}">
          Open Full Gorkipedia Explorer
        </button>
      </div>
    `;

    // (Body highlight is now handled directly in the central canvas body drawing when a node is selected)

    // Attach event listener properly (avoids fragile inline onclick)
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
  }

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
      treeInstance.enableAllGroups();
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
