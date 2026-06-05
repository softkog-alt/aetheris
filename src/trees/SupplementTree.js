/**
 * SupplementTree (and HabitsTree via inheritance)
 * 
 * Body-centric layout: the body silhouette is central on the canvas.
 * Nodes are placed near the organs they influence, with the most influential
 * (by vitality) being closest to the organ and rendered largest.
 * Longevity (L), QoL (Q), and overall vitality are shown on every node.
 * Central body organ highlights on selection (detail via HoverPopup).
 */

import { BaseTree } from "./BaseTree.js";
import { calcVitality } from "../core/ScoringEngine.js";

export class SupplementTree extends BaseTree {
  /** Matches _drawCentralBody scale; used for keep-out ellipse. */
  static BODY_SCALE = 3.15;
  static BODY_RX = 105;
  static BODY_RY = 245;
  /** Extra clearance beyond node circle (labels + stroke) in layout space. */
  static NODE_HALO = 7;
  /** Safety margin on body ellipse so nodes never clip the silhouette. */
  static BODY_MARGIN = 1.12;

  constructor(canvas, options = {}) {
    super(canvas, options);
    this.data = [];
    this.rawSupplements = [];

    // Camera: pan in world space (0,0 = body center), scale = zoom
    this.view = {
      panX: 0,
      panY: 0,
      scale: 0.92
    };

    /** Active category keys (nodes outside these are hidden + excluded from layout). */
    this.enabledGroups = new Set();

    // Premium color palette for organ groups (harmonious with dark celestial theme)
    // Each organ gets a distinct but elegant color for clear visual grouping
    this.organColors = {
      brain:   '#c084fc',   // soft purple
      eyes:    '#60a5fa',   // clear blue
      nerves:  '#a78bfa',   // light violet
      heart:   '#f87171',   // warm red
      lungs:   '#67e8f9',   // cyan
      liver:   '#a3e635',   // lime green
      gut:     '#4ade80',   // fresh green
      immune:  '#e879f9',   // magenta
      skin:    '#fbbf24',   // gold/amber
      muscle:  '#fb923c',   // orange
      joints:  '#f472b6',   // pink
      bones:   '#d1d5db',   // cool gray
      mito:    '#facc15',   // bright yellow (energy)
      thyroid: '#fb7185'    // coral
    };

    // Sequence (kept for compatibility / future horizontal views; body-centric layout uses organ positions instead)
    this.sequenceOrder = [
      'brain', 'eyes', 'nerves',
      'heart', 'lungs',
      'liver', 'gut',
      'immune', 'skin',
      'muscle', 'joints', 'bones',
      'mito', 'thyroid'
    ];
  }

  loadData(supplementsArray) {
    this.rawSupplements = supplementsArray;

    // Always give every node a proper initial radius based on its vitality + disease coverage.
    // This ensures nodes have different sizes even before/without layout.
    this.nodes = supplementsArray.map(s => {
      const vitality = calcVitality(s);
      return {
        ...s,
        vitality,
        radius: this._calcNodeRadius({ ...s, vitality }, 0.5)
      };
    });

    const cats = [...new Set(this.nodes.map(n => n.cat).filter(Boolean))];
    this.enabledGroups = new Set(cats);
    this.maxNodes = 0; // 0 = unlimited (top N via slider). Sorted by vitality for limits.

    this.computeLayout();
  }

  setMaxNodes(n) {
    this.maxNodes = Math.max(0, Math.min(200, n | 0));
    this._afterGroupChange();
  }

  _getVisibleNodes() {
    let vis = (!this.enabledGroups || this.enabledGroups.size === 0)
      ? this.nodes
      : this.nodes.filter(n => this.enabledGroups.has(n.cat));

    if (this.maxNodes > 0 && vis.length > this.maxNodes) {
      // Highest vitality first; layout + orbit math already places top vitality closer to center within clusters.
      vis = [...vis].sort((a, b) => (b.vitality || 0) - (a.vitality || 0)).slice(0, this.maxNodes);
    }
    return vis;
  }

  isGroupEnabled(key) {
    return this.enabledGroups.has(key);
  }

  setGroupEnabled(key, enabled = true) {
    if (!key || key === 'all') return;
    if (enabled) this.enabledGroups.add(key);
    else if (this.enabledGroups.size > 1) this.enabledGroups.delete(key);
    this._afterGroupChange();
  }

  toggleGroup(key) {
    if (!key || key === 'all') return;
    if (this.enabledGroups.has(key)) {
      if (this.enabledGroups.size <= 1) return;
      this.enabledGroups.delete(key);
    } else {
      this.enabledGroups.add(key);
    }
    this._afterGroupChange();
  }

  enableAllGroups() {
    const cats = [...new Set(this.nodes.map(n => n.cat).filter(Boolean))];
    this.enabledGroups = new Set(cats);
    this._afterGroupChange();
  }

  /** Toggle between all groups enabled and all groups disabled (for ALL chip + 'f' key quick reset). */
  toggleAllGroups() {
    const cats = [...new Set(this.nodes.map(n => n.cat).filter(Boolean))];
    const allOn = cats.length > 0 && this.enabledGroups.size === cats.length;
    if (allOn) {
      this.enabledGroups = new Set();
    } else {
      this.enabledGroups = new Set(cats);
    }
    this._afterGroupChange();
  }

  _afterGroupChange() {
    // Deselect if the current selection is no longer in the visible set (group filter OR maxNodes limit)
    if (this.selectedId) {
      const vis = this._getVisibleNodes();
      if (!vis.some(n => n.id === this.selectedId)) {
        this.selectedId = null;
        this.hoveredId = null;
      }
    }
    this.computeLayout();
    this.draw();
  }

  /** Radius from vitality (+ optional rank boost within organ cluster). */
  _calcNodeRadius(node, rankInfluence = 0.5) {
    const vitality = node.vitality ?? 70;
    const diseaseBonus = Math.min(0.18, (node.diseases || 4) / 80);
    const norm = Math.pow(vitality / 100, 1.05);
    const baseR = 9 + norm * 18;
    const r = baseR * (1 + diseaseBonus * 0.9) * (0.9 + rankInfluence * 0.22);
    return Math.max(9, Math.min(28, r));
  }

  /** Orbit distance: larger nodes closer to body, smaller farther; scales with cluster density. */
  _calcOrbitDistance(edge, node, group) {
    const radii = group.map(n => n.radius || 16);
    const minR = Math.min(...radii);
    const maxR = Math.max(...radii);
    const r = node.radius || 16;
    const sizeNorm = maxR > minR ? (maxR - r) / (maxR - minR) : 0;

    const density = group.length;
    const bodyPad = 18 + Math.min(14, density * 1.1);
    const ringSpread = 22 + density * 8 + maxR * 0.45;

    return edge + r + bodyPad + sizeNorm * ringSpread;
  }

  _layoutSpacingParams() {
    const n = this._getVisibleNodes().length || 1;
    const density = Math.sqrt(n / 20);
    // Dynamic for dense constellations (e.g. 100+ foods): more padding/iterations but cap to avoid jank
    const settleCap = n > 80 ? 110 : 140;
    return {
      collisionPadding: 14 + density * 7,
      settleIterations: Math.min(settleCap, 55 + Math.floor(n * 2.8)),
      bodyPadding: 18 + density * 5,
      labelMargin: SupplementTree.NODE_HALO
    };
  }

  _nodeHitRadius(node, labelMargin = SupplementTree.NODE_HALO) {
    return (node.radius || 18) + labelMargin;
  }

  /**
   * Organ anchors in the same world space as _drawCentralBody (hx/hy at BODY_SCALE).
   */
  _getOrganPositions() {
    const s = SupplementTree.BODY_SCALE;
    const wx = x => (x - 85) * s;
    const wy = y => (y - 100) * s;
    return {
      brain:   { x: wx(85), y: wy(26) },
      eyes:    { x: wx(79), y: wy(25) },
      nerves:  { x: wx(85), y: wy(55) },
      heart:   { x: wx(92), y: wy(78) },  // anatomical left (screen right) to match corrected body draw
      lungs:   { x: wx(71), y: wy(68) },  // anatomical right lung (larger, screen left)
      liver:   { x: wx(72), y: wy(92) },  // anatomical right (screen left) to match corrected body draw
      gut:     { x: wx(85), y: wy(112) },
      immune:  { x: wx(85), y: wy(100) },
      skin:    { x: wx(85), y: wy(55) },
      muscle:  { x: wx(55), y: wy(95) },
      joints:  { x: wx(68), y: wy(55) },
      bones:   { x: wx(74), y: wy(153) },
      mito:    { x: wx(88), y: wy(78) },
      thyroid: { x: wx(85), y: wy(40) },
      sleep:      { x: wx(85), y: wy(30) },
      mind:       { x: wx(85), y: wy(26) },
      nutrition:  { x: wx(85), y: wy(105) },
      recovery:   { x: wx(95), y: wy(85) },
      social:     { x: wx(110), y: wy(50) },
      vices:      { x: wx(72), y: wy(75) },
      productivity: { x: wx(85), y: wy(45) }
    };
  }

  /** Ellipse radius along a ray from body center (matches scaled silhouette). */
  _bodyEdgeRadius(angle) {
    const rx = SupplementTree.BODY_RX * SupplementTree.BODY_MARGIN;
    const ry = SupplementTree.BODY_RY * SupplementTree.BODY_MARGIN;
    const c = Math.cos(angle);
    const sn = Math.sin(angle);
    return (rx * ry) / Math.sqrt((ry * c) ** 2 + (rx * sn) ** 2);
  }

  _minDistFromCenter(node, bodyPadding = 14, labelMargin = SupplementTree.NODE_HALO) {
    const ang = Math.atan2(node.y || 0, node.x || 0.001);
    return this._bodyEdgeRadius(ang) + this._nodeHitRadius(node, labelMargin) + bodyPadding;
  }

  /** Hard push: node hull must sit outside the body ellipse. */
  _pushOutsideBody(node, padding = 14, labelMargin = SupplementTree.NODE_HALO) {
    let x = node.x || 0;
    let y = node.y || 0;
    let dist = Math.hypot(x, y);
    const r = this._nodeHitRadius(node, labelMargin);

    if (dist < 0.01) {
      const edge = this._bodyEdgeRadius(-Math.PI / 2);
      node.x = 0;
      node.y = -(edge + r + padding);
      return true;
    }

    const ang = Math.atan2(y, x);
    const minDist = this._bodyEdgeRadius(ang) + r + padding;
    if (dist < minDist) {
      const scale = minDist / dist;
      node.x = x * scale;
      node.y = y * scale;
      return true;
    }
    return false;
  }

  /**
   * Iterative settle: body constraint every step + node-node repulsion.
   * Outermost nodes absorb more separation force so clusters don't collapse inward.
   */
  _settleNodePositions(nodes, spacing = this._layoutSpacingParams()) {
    if (!nodes.length) return;

    const pad = spacing.collisionPadding;
    const bodyPad = spacing.bodyPadding;
    const halo = spacing.labelMargin ?? SupplementTree.NODE_HALO;
    const iterations = spacing.settleIterations ?? 80;

    for (let iter = 0; iter < iterations; iter++) {
      for (const n of nodes) {
        this._pushOutsideBody(n, bodyPad, halo);
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          let dx = b.x - a.x;
          let dy = b.y - a.y;
          let dist = Math.hypot(dx, dy);
          if (dist < 0.01) {
            const jitter = 0.5 + (iter % 7) * 0.05;
            dx = jitter;
            dy = 0;
            dist = jitter;
          }

          const ra = this._nodeHitRadius(a, halo);
          const rb = this._nodeHitRadius(b, halo);
          const minDist = ra + rb + pad;

          if (dist >= minDist) continue;

          const overlap = minDist - dist;
          const ux = dx / dist;
          const uy = dy / dist;
          const force = overlap * 0.52;

          const aCenter = Math.hypot(a.x, a.y);
          const bCenter = Math.hypot(b.x, b.y);
          const aBias = aCenter >= bCenter ? 0.58 : 0.42;
          const bBias = 1 - aBias;

          a.x -= ux * force * aBias;
          a.y -= uy * force * aBias;
          b.x += ux * force * bBias;
          b.y += uy * force * bBias;
        }
      }
    }

    const bodyIters = Math.min(12, 6 + Math.floor(nodes.length / 12));
    for (let k = 0; k < bodyIters; k++) {
      let any = false;
      for (const n of nodes) {
        if (this._pushOutsideBody(n, bodyPad, halo)) any = true;
      }
      if (!any) break;
    }

    this._fixRemainingOverlaps(nodes, spacing);
  }

  /** Final greedy pass until no node-node or node-body violations remain. */
  _fixRemainingOverlaps(nodes, spacing) {
    const pad = spacing.collisionPadding;
    const bodyPad = spacing.bodyPadding;
    const halo = spacing.labelMargin ?? SupplementTree.NODE_HALO;

    const maxAttempts = Math.min(38, 18 + Math.floor(nodes.length / 5));
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      let fixed = false;

      for (const n of nodes) {
        if (this._pushOutsideBody(n, bodyPad, halo)) fixed = true;
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          let dx = b.x - a.x;
          let dy = b.y - a.y;
          let dist = Math.hypot(dx, dy);
          if (dist < 0.01) {
            dx = 1;
            dy = 0;
            dist = 1;
          }
          const minDist = this._nodeHitRadius(a, halo) + this._nodeHitRadius(b, halo) + pad;
          if (dist < minDist) {
            const overlap = (minDist - dist) + 1;
            const ux = dx / dist;
            const uy = dy / dist;
            a.x -= ux * overlap * 0.5;
            a.y -= uy * overlap * 0.5;
            b.x += ux * overlap * 0.5;
            b.y += uy * overlap * 0.5;
            fixed = true;
          }
        }
      }

      if (!fixed) break;
    }
  }

  computeLayout() {
    const visible = this._getVisibleNodes();
    const spacing = this._layoutSpacingParams();
    const organPositions = this._getOrganPositions();

    const organGroups = {};
    Object.keys(organPositions).forEach(o => { organGroups[o] = []; });

    visible.forEach(node => {
      let assigned = false;
      for (const o of node.organs || []) {
        if (organGroups[o] !== undefined) {
          organGroups[o].push(node);
          assigned = true;
          break;
        }
      }
      if (!assigned) {
        (organGroups.mito = organGroups.mito || []).push(node);
      }
    });

    Object.keys(organGroups).forEach(organ => {
      const group = organGroups[organ] || [];
      if (!group.length) return;

      group.sort((a, b) => (b.vitality || 0) - (a.vitality || 0));

      const base = organPositions[organ] || { x: 0, y: 0 };
      const sectorAng = Math.atan2(base.y, base.x || 0.001);
      const edge = this._bodyEdgeRadius(sectorAng);
      const spread = Math.min(1.15, 0.16 * group.length + 0.14);

      group.forEach((node, i) => {
        const t = group.length > 1 ? i / (group.length - 1) : 0;
        const influence = 1 - t;
        node.radius = this._calcNodeRadius(node, influence);
        const idSpread = ((node.id?.length || 0) * 0.019 + (node.id?.charCodeAt(0) || 0) * 0.0008) % 0.12 - 0.06;
        const fan = (t - 0.5) * spread + idSpread;
        const ang = sectorAng + fan;
        const orbitDist = this._calcOrbitDistance(edge, node, group);

        node.x = Math.cos(ang) * orbitDist;
        node.y = Math.sin(ang) * orbitDist * 0.82;
      });
    });

    this._settleNodePositions(visible, spacing);

    if (!this.view) this.view = { panX: 0, panY: 0, scale: 0.92 };
    if (typeof this.view.panX !== 'number') this.view.panX = this.view.scrollX || 0;
    if (typeof this.view.panY !== 'number') this.view.panY = this.view.scrollY || 0;
    if (typeof this.view.scale !== 'number') this.view.scale = 0.92;
  }

  _enforceVisibleOutsideBody(padding = 14) {
    const nodes = this._getVisibleNodes();
    for (let k = 0; k < 8; k++) {
      let moved = false;
      for (const n of nodes) {
        if (this._pushOutsideBody(n, padding)) moved = true;
      }
      if (!moved) break;
    }
  }

  /**
   * L / Q / vitality in a triangle inside the node (vitality at top).
   */
  _drawNodeScoreTriangle(ctx, node, r, { isDimmed, isSelected, isHighValue }) {
    if (r < 10) return;

    const vit = String(node.vitality ?? '');
    const lLabel = String(node.longevity ?? '');
    const qLabel = String(node.qol ?? '');

    const fsVit = Math.round(Math.max(8, Math.min(13, r * 0.52)));
    const fsSide = Math.round(Math.max(6, Math.min(10, r * 0.4)));

    const topY = node.y - r * 0.34;
    const baseY = node.y + r * 0.32;
    const spreadX = r * 0.38;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = `${isSelected ? 800 : 700} ${fsVit}px Inter, system-ui, sans-serif`;
    ctx.fillStyle = isDimmed ? '#6b7280' : (isHighValue ? '#f4e9c8' : (isSelected ? '#e0f2fe' : '#a5d8ff'));
    ctx.fillText(vit, node.x, topY);

    ctx.font = `600 ${fsSide}px Inter, system-ui, sans-serif`;
    ctx.fillStyle = isDimmed ? '#4b5563' : '#67e8f9';
    ctx.fillText('L' + lLabel, node.x - spreadX, baseY);
    ctx.fillStyle = isDimmed ? '#4b5563' : '#c084fc';
    ctx.fillText('Q' + qLabel, node.x + spreadX, baseY);
  }

  draw(highlightIds = [], forceActiveConnections = false) {
    if (!this.ctx) return;

    const ctx = this.ctx;
    const { width: w, height: h } = this.getLogicalSize();
    const dpr = this.viewport?.dpr || 1;

    const v = this.view || { panX: 0, panY: 0, scale: 1 };
    const panX = v.panX ?? v.scrollX ?? 0;
    const panY = v.panY ?? v.scrollY ?? 0;
    const scale = v.scale || 1;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = true;
    if ('imageSmoothingQuality' in ctx) ctx.imageSmoothingQuality = 'high';

    // 1. FIXED screen-space celestial background (stars + nebula)
    ctx.fillStyle = "#05070f";
    ctx.fillRect(0, 0, w, h);

    // Starfield — keep some atmosphere but not too busy
    for (let i = 0; i < 110; i++) {
      const sx = ((i * 41 + 13) % (w - 20)) + 10;
      const sy = ((i * 57 + 9) % (h - 40)) + 10;
      const size = ((i % 4) === 0) ? 1.6 : 0.6;
      const alpha = ((i % 5) === 0) ? 0.85 : 0.35;
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fillRect(sx, sy, size, size);
    }

    // Subtle nebula (upper area lighter so focus stays on the central body + nodes)
    const nebula = ctx.createRadialGradient(w * 0.5, h * 0.25, 60, w * 0.5, h * 0.55, 380);
    nebula.addColorStop(0, "rgba(110, 130, 190, 0.028)");
    nebula.addColorStop(0.6, "rgba(90, 110, 170, 0.015)");
    nebula.addColorStop(1, "transparent");
    ctx.fillStyle = nebula;
    ctx.fillRect(0, 0, w, h);

    // 2. Body-centric layer: body in the middle, nodes clustered around the organs they affect.
    ctx.save();

    ctx.translate(w / 2, h / 2);
    ctx.scale(scale, scale);
    ctx.translate(-panX, -panY);

    // Draw the central body model (silhouette + organs) -- now larger
    // We highlight organs that the currently selected node influences.
    const visibleNodes = this._getVisibleNodes();
    const selectedNodeForBody = this.selectedId ? visibleNodes.find(n => n.id === this.selectedId) || null : null;
    const highlightOrgs = selectedNodeForBody ? (selectedNodeForBody.organs || []) : [];
    const isNegativeImpact = !!(selectedNodeForBody && (selectedNodeForBody.impact === 'negative' || selectedNodeForBody._isNegative));
    this._drawCentralBody(ctx, 0, 0, 3.15, highlightOrgs, isNegativeImpact);

    visibleNodes.forEach(node => {
      // visibleNodes already respects enabled groups + maxNodes limit; no extra filter needed

      const isSelected = this.selectedId === node.id;
      const isHovered = this.hoveredId === node.id;
      const isHighlighted = highlightIds.includes(node.id);
      const isDimmed = false;

      // Use the node's calculated radius as the base (this is what gives different sizes)
      const baseRadius = node.radius || 18;
      let r = isSelected || isHovered ? baseRadius * 1.18 : baseRadius;

      // Compute early to avoid TDZ (was causing ReferenceError on every draw)
      const isHighValue = node.vitality > 82;
      const groupColor = this._getNodeColor(node);
      const glowColor = groupColor;

      // Glow layers — tinted by the node's organ group for clear visual clustering
      if (isSelected || isHighlighted) {
        ctx.shadowBlur = 28;
        ctx.shadowColor = glowColor;
      } else if (isHovered) {
        ctx.shadowBlur = 18;
        ctx.shadowColor = glowColor;
      } else {
        ctx.shadowBlur = isHighValue ? 13 : 6;
        ctx.shadowColor = glowColor;
      }

      // Outer ring - stronger for high vitality nodes (body cluster emphasis)
      ctx.strokeStyle = isSelected || isHighlighted ? "#d4af37" : (isHighValue ? "#d4af37" : "#67e8f9");
      ctx.lineWidth = isSelected ? 4.5 : (isHovered ? 3.2 : (isHighValue ? 3.0 : 2.0));

      // === Premium Node Design with Group Color (clear differentiation by supplement group) ===

      ctx.fillStyle = isDimmed ? "#1f2437" : "#0f1424";

      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Rich layered inner gradient for depth
      const grad = ctx.createRadialGradient(
        node.x - r * 0.32, node.y - r * 0.32, r * 0.12,
        node.x, node.y, r * 1.08
      );
      grad.addColorStop(0, isDimmed ? "#3a3f52" : (isHighValue ? "#3a2f1f" : "#1f2a3f"));
      grad.addColorStop(0.5, isDimmed ? "#1f2437" : "#0f1424");
      grad.addColorStop(1, isDimmed ? "#15181f" : "#080b12");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(node.x, node.y, r - 1.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;

      // Use the organ group color for the outer ring — this is the key for visual grouping
      ctx.strokeStyle = isSelected || isHighlighted ? "#f4e9c8" : groupColor;
      ctx.lineWidth = isSelected ? 4.8 : (isHovered ? 3.8 : 2.8);
      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
      ctx.stroke();

      // Inner ring detail
      ctx.strokeStyle = isHighValue ? "rgba(212,175,55,0.75)" : "rgba(255,255,255,0.3)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(node.x, node.y, r - 5.2, 0, Math.PI * 2);
      ctx.stroke();

      // Scores inside node: vitality (top), L / Q (base corners)
      this._drawNodeScoreTriangle(ctx, node, r, { isDimmed, isSelected, isHighValue });

      // Short label above the node
      const labelSize = Math.round(Math.max(8, Math.min(11, r * 0.38)));
      ctx.fillStyle = isDimmed ? "#6b7280" : (isSelected ? "#f4e9c8" : "#e5e7eb");
      ctx.font = `${isSelected ? 700 : 600} ${labelSize}px Inter, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(node.short, node.x, node.y - r - 4);

      // Visual reference in map for supplements with documented high-dose risks (warning indicator)
      if (node.highDoseRisks) {
        const warnSize = Math.max(6, Math.min(9, r * 0.22));
        const wx = node.x + r * 0.65;
        const wy = node.y - r * 0.65;
        ctx.fillStyle = '#f59e0b'; // amber warning
        ctx.beginPath();
        ctx.moveTo(wx, wy - warnSize);
        ctx.lineTo(wx - warnSize * 0.9, wy + warnSize * 0.6);
        ctx.lineTo(wx + warnSize * 0.9, wy + warnSize * 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#111827';
        ctx.font = `700 ${Math.round(warnSize * 1.1)}px Inter, system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', wx, wy + warnSize * 0.15);
      }
    });

    ctx.restore(); // end map layer (pannable constellation)
    ctx.restore(); // end master save (fixed bg + map)
  }

  // Helper: get the primary organ color for a node (for coloring by group)
  _getNodeColor(node) {
    if (node.impact === 'negative' || node._isNegative) {
      return '#ef4444'; // red for damage / negative impact foods
    }
    for (const organ of node.organs || []) {
      if (this.organColors[organ]) return this.organColors[organ];
    }
    return '#d4af37';
  }

  /** Radial glow behind an organ when highlighted. */
  _drawOrganGlow(ctx, x, y, radius, color, active) {
    if (!active) return;
    const g = ctx.createRadialGradient(x, y, radius * 0.1, x, y, radius * 2.4);
    g.addColorStop(0, color + '66');
    g.addColorStop(0.45, color + '22');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, radius * 2.4, 0, Math.PI * 2);
    ctx.fill();
  }

  /** Filled ellipse organ with depth gradient. */
  _drawOrganEllipse(ctx, hx, hy, sx, sy, rx, ry, s, color, active, idleAlpha = 0.38) {
    const x = hx(sx);
    const y = hy(sy);
    const erx = rx * s;
    const ery = ry * s;
    const glowR = Math.max(erx, ery);
    this._drawOrganGlow(ctx, x, y, glowR, color, active);

    const grad = ctx.createRadialGradient(x - erx * 0.35, y - ery * 0.35, 0, x, y, glowR * 1.15);
    if (active) {
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.25, color);
      grad.addColorStop(0.75, color + 'bb');
      grad.addColorStop(1, color + '33');
    } else {
      grad.addColorStop(0, '#4a5568');
      grad.addColorStop(0.45, '#2a3142');
      grad.addColorStop(1, '#141820');
    }
    ctx.fillStyle = grad;
    ctx.globalAlpha = active ? 0.92 : idleAlpha;
    ctx.beginPath();
    ctx.ellipse(x, y, erx, ery, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = active ? color : '#4b5568';
    ctx.lineWidth = (active ? 2 : 0.9) * s;
    ctx.shadowBlur = active ? 12 * s : 0;
    ctx.shadowColor = active ? color : 'transparent';
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  /**
   * Premium body silhouette + organs (canvas). Matches organColors; highlights on selection.
   * Optimized: Set for active checks (O(1)), path reuse (trace once for torso/heart/legs/nerves),
   * precomputed hasXXX flags, closed-over vars in helpers.
   * Anatomically corrected + more realistic shapes (detailed paths for brain, heart, lungs (lobes + fissures),
   * liver (lobed), stomach (sac), intestines (coils), thyroid (butterfly)).
   *
   * Why vector paths instead of PNG images for "actual" organ shapes?
   * - Matches the existing abstract/stylized celestial vector aesthetic (silhouette is pure paths + gradients/glows).
   * - Perfect scalability with the map's pan/zoom (no pixelation on retina or high zoom).
   * - Dynamic theming: organColors, per-frame active glows, shadows, alpha, internal fold lines all trivial.
   * - No asset loading, no bundle bloat, no CORS/preload issues, works offline.
   * - Easy to keep in sync with the (optional) SVG OrganDiagram for parity.
   * PNGs would be better only for photorealistic medical viz (with baked lighting + separate highlight layers or filters);
   * here they would fight the UI style and add complexity for tinting/highlighting during selection.
   */
  _drawCentralBody(ctx, cx, cy, s, highlightOrgs = [], isNegative = false) {
    // Use a Set for O(1) lookups instead of calling .includes() repeatedly on an array
    const active = new Set(highlightOrgs);
    
    const hx = (x) => cx + (x - 85) * s;
    const hy = (y) => cy + (y - 100) * s;
    const organCol = (key) => this.organColors[key] || '#d4af37';
    // For negative impact (bad foods etc), use red for damaged organs instead of their normal color
    const getHighlightColor = (key) => (isNegative && active.has(key)) ? '#ef4444' : organCol(key);

    const traceOuterSilhouette = () => {
      ctx.beginPath();
      ctx.moveTo(hx(85), hy(18));
      ctx.quadraticCurveTo(hx(68), hy(50), hx(74), hy(98));
      ctx.quadraticCurveTo(hx(77), hy(138), hx(70), hy(176));
      ctx.quadraticCurveTo(hx(85), hy(192), hx(100), hy(176));
      ctx.quadraticCurveTo(hx(92), hy(138), hx(97), hy(98));
      ctx.quadraticCurveTo(hx(103), hy(50), hx(85), hy(18));
      ctx.closePath();
    };

    const traceInnerTorso = () => {
      ctx.beginPath();
      ctx.moveTo(hx(85), hy(22));
      ctx.quadraticCurveTo(hx(72), hy(48), hx(76), hy(92));
      ctx.quadraticCurveTo(hx(79), hy(130), hx(72), hy(170));
      ctx.quadraticCurveTo(hx(85), hy(184), hx(98), hy(170));
      ctx.quadraticCurveTo(hx(90), hy(130), hx(95), hy(92));
      ctx.quadraticCurveTo(hx(100), hy(48), hx(85), hy(22));
      ctx.closePath();
    };

    ctx.save();

    // Ambient halo behind the figure
    const coreX = hx(85);
    const coreY = hy(95);
    const amb = ctx.createRadialGradient(coreX, coreY, 8 * s, coreX, coreY, 130 * s);
    amb.addColorStop(0, active.has('skin') ? 'rgba(251, 191, 36, 0.14)' : 'rgba(103, 232, 249, 0.07)');
    amb.addColorStop(0.45, 'rgba(167, 139, 250, 0.05)');
    amb.addColorStop(1, 'transparent');
    ctx.fillStyle = amb;
    ctx.beginPath();
    ctx.arc(coreX, coreY, 130 * s, 0, Math.PI * 2);
    ctx.fill();

    // Skin aura (outer rim)
    traceOuterSilhouette();
    ctx.strokeStyle = active.has('skin') ? organCol('skin') : '#1e293b';
    ctx.lineWidth = (active.has('skin') ? 14 : 7) * s;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = active.has('skin') ? 0.35 : 0.14;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Body fill — soft vertical depth
    traceInnerTorso(); // Trace ONCE, apply multiple fills/strokes
    const bodyFill = ctx.createLinearGradient(coreX, hy(20), coreX, hy(180));
    bodyFill.addColorStop(0, 'rgba(30, 41, 59, 0.55)');
    bodyFill.addColorStop(0.35, 'rgba(15, 23, 42, 0.72)');
    bodyFill.addColorStop(0.7, 'rgba(12, 18, 32, 0.82)');
    bodyFill.addColorStop(1, 'rgba(8, 12, 22, 0.9)');
    ctx.fillStyle = bodyFill;
    ctx.fill();

    // Rim highlight + outline (Reusing the active Torso path)
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.2 * s;
    ctx.globalAlpha = 0.5;
    ctx.stroke();
    ctx.globalAlpha = 1;

    const rimGrad = ctx.createLinearGradient(hx(70), hy(50), hx(100), hy(50));
    rimGrad.addColorStop(0, '#334155');
    rimGrad.addColorStop(0.5, '#64748b');
    rimGrad.addColorStop(1, '#334155');
    ctx.strokeStyle = rimGrad;
    ctx.lineWidth = 2.2 * s;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Torso cavity outline
    ctx.strokeStyle = '#3d4a5c';
    ctx.lineWidth = 1.4 * s;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.moveTo(hx(74), hy(46));
    ctx.quadraticCurveTo(hx(66), hy(78), hx(70), hy(115));
    ctx.quadraticCurveTo(hx(85), hy(125), hx(100), hy(115));
    ctx.quadraticCurveTo(hx(104), hy(78), hx(96), hy(46));
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Spine
    const spineActive = active.has('bones') || active.has('joints');
    ctx.strokeStyle = spineActive ? '#e2e8f0' : '#475569';
    ctx.lineWidth = (spineActive ? 2.2 : 1.4) * s;
    ctx.globalAlpha = spineActive ? 0.75 : 0.35;
    ctx.beginPath();
    ctx.moveTo(hx(85), hy(40));
    ctx.lineTo(hx(85), hy(120));
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Neck
    ctx.strokeStyle = '#3d4a5c';
    ctx.lineWidth = 4.5 * s;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(hx(82), hy(38));
    ctx.quadraticCurveTo(hx(85), hy(42), hx(88), hy(38));
    ctx.stroke();

    // Head shell with gradient
    const headX = hx(85);
    const headY = hy(26);
    const headR = 13 * s;
    const headGrad = ctx.createRadialGradient(headX - 4 * s, headY - 5 * s, headR * 0.2, headX, headY, headR);
    headGrad.addColorStop(0, 'rgba(71, 85, 105, 0.5)');
    headGrad.addColorStop(0.6, 'rgba(30, 41, 59, 0.65)');
    headGrad.addColorStop(1, 'rgba(15, 23, 42, 0.85)');
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.arc(headX, headY, headR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2 * s;
    ctx.stroke();

    // Eyes (small and simple - keep as circles for clarity)
    const eyeCol = organCol('eyes');
    const hasEyes = active.has('eyes');
    [[79, 25], [91, 25]].forEach(([ex, ey]) => {
      const x = hx(ex);
      const y = hy(ey);
      if (hasEyes) this._drawOrganGlow(ctx, x, y, 4 * s, eyeCol, true);
      
      ctx.fillStyle = hasEyes ? eyeCol : '#4b5563';
      ctx.beginPath();
      ctx.arc(x, y, 2.2 * s, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = hasEyes ? '#e0f2fe' : '#1e293b';
      ctx.beginPath();
      ctx.arc(x - 0.4 * s, y - 0.3 * s, 0.9 * s, 0, Math.PI * 2);
      ctx.fill();
    });

    // Thyroid (butterfly shape - two lobes)
    const hasThyroid = active.has('thyroid');
    const thyroidCol = getHighlightColor('thyroid');
    const tcx = hx(85);
    const tcy = hy(40);
    if (hasThyroid) this._drawOrganGlow(ctx, tcx, tcy, 6 * s, thyroidCol, true);
    ctx.fillStyle = hasThyroid ? thyroidCol : '#3d4a5c';
    ctx.globalAlpha = hasThyroid ? 0.85 : 0.28;
    // Left lobe
    ctx.beginPath();
    ctx.ellipse(hx(80), tcy, 3.2 * s, 2.8 * s, -0.3, 0, Math.PI * 2);
    ctx.fill();
    // Right lobe
    ctx.beginPath();
    ctx.ellipse(hx(90), tcy, 3.2 * s, 2.8 * s, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = hasThyroid ? thyroidCol : '#4b5568';
    ctx.lineWidth = (hasThyroid ? 1.2 : 0.7) * s;
    ctx.beginPath();
    ctx.ellipse(hx(80), tcy, 3.2 * s, 2.8 * s, -0.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(hx(90), tcy, 3.2 * s, 2.8 * s, 0.3, 0, Math.PI * 2);
    ctx.stroke();

    // Brain - more realistic convoluted shape (wavy outline for cerebral cortex)
    const hasBrain = active.has('brain');
    const brainCol = getHighlightColor('brain');
    const bcx = hx(85);
    const bcy = hy(26);
    if (hasBrain) this._drawOrganGlow(ctx, bcx, bcy, 10 * s, brainCol, true);
    ctx.fillStyle = hasBrain ? brainCol : '#3d4a5c';
    ctx.globalAlpha = hasBrain ? 0.8 : 0.3;
    ctx.beginPath();
    // Wavy, lobed brain outline (approximates actual cerebral hemispheres)
    ctx.moveTo(hx(77), hy(21));
    ctx.quadraticCurveTo(hx(74), hy(18), hx(78), hy(15)); // left top indent
    ctx.quadraticCurveTo(hx(82), hy(17), hx(85), hy(14)); // top center cleft
    ctx.quadraticCurveTo(hx(89), hy(16), hx(93), hy(15));
    ctx.quadraticCurveTo(hx(96), hy(19), hx(93), hy(22)); // right upper
    ctx.quadraticCurveTo(hx(95), hy(27), hx(92), hy(32)); // right side
    ctx.quadraticCurveTo(hx(88), hy(35), hx(82), hy(34)); // bottom right
    ctx.quadraticCurveTo(hx(78), hy(33), hx(75), hy(30)); // bottom left
    ctx.quadraticCurveTo(hx(73), hy(25), hx(77), hy(21)); // left side back
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = hasBrain ? brainCol : '#4b5568';
    ctx.lineWidth = (hasBrain ? 1.4 : 0.8) * s;
    ctx.stroke();
    // Add a few fold lines (sulci) for "actual" texture when highlighted
    if (hasBrain) {
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 0.7 * s;
      ctx.beginPath();
      ctx.moveTo(hx(80), hy(20));
      ctx.quadraticCurveTo(hx(83), hy(24), hx(80), hy(28));
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(hx(90), hy(20));
      ctx.quadraticCurveTo(hx(87), hy(25), hx(89), hy(30));
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(hx(82), hy(17));
      ctx.quadraticCurveTo(hx(85), hy(22), hx(88), hy(18));
      ctx.stroke();
    }

    // Nerves (subtle arcs from brain) - single path + stroke
    if (active.has('nerves')) {
      ctx.strokeStyle = organCol('nerves');
      ctx.lineWidth = 1.2 * s;
      ctx.globalAlpha = 0.65;
      ctx.beginPath();
      ctx.moveTo(hx(85), hy(32));
      ctx.quadraticCurveTo(hx(72), hy(55), hx(68), hy(58));
      ctx.moveTo(hx(85), hy(32)); // Continuous path, single stroke call
      ctx.quadraticCurveTo(hx(98), hy(55), hx(102), hy(58));
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Lungs - actual-ish lobed shapes (not plain ellipses)
    const hasLungs = active.has('lungs');
    const lungCol = getHighlightColor('lungs');
    const drawLung = (baseX, baseY, isRightLung /* anatomical */) => {
      const lx = hx(baseX);
      const ly = hy(baseY);
      if (hasLungs) this._drawOrganGlow(ctx, lx, ly, 11 * s, lungCol, true);
      ctx.fillStyle = hasLungs ? lungCol : '#3d4a5c';
      ctx.globalAlpha = hasLungs ? 0.7 : 0.22;
      ctx.beginPath();
      if (isRightLung) {
        // Anatomical right lung (screen left) - 3 lobes, larger
        ctx.moveTo(hx(baseX), hy(baseY - 13)); // apex
        ctx.quadraticCurveTo(hx(baseX - 9), hy(baseY - 8), hx(baseX - 10), hy(baseY + 2)); // upper lobe left
        ctx.quadraticCurveTo(hx(baseX - 12), hy(baseY + 5), hx(baseX - 7), hy(baseY + 6)); // horizontal fissure
        ctx.quadraticCurveTo(hx(baseX - 13), hy(baseY + 12), hx(baseX - 8), hy(baseY + 16)); // lower lobe
        ctx.quadraticCurveTo(hx(baseX + 1), hy(baseY + 17), hx(baseX + 6), hy(baseY + 12)); // base
        ctx.quadraticCurveTo(hx(baseX + 7), hy(baseY + 4), hx(baseX + 4), hy(baseY - 2)); // right edge + cardiac space
        ctx.quadraticCurveTo(hx(baseX + 2), hy(baseY - 9), hx(baseX), hy(baseY - 13)); // back to apex
      } else {
        // Anatomical left lung (screen right) - 2 lobes, notched for heart
        ctx.moveTo(hx(baseX), hy(baseY - 12));
        ctx.quadraticCurveTo(hx(baseX + 8), hy(baseY - 7), hx(baseX + 7), hy(baseY + 1));
        ctx.quadraticCurveTo(hx(baseX + 9), hy(baseY + 4), hx(baseX + 4), hy(baseY + 5)); // notch
        ctx.quadraticCurveTo(hx(baseX + 10), hy(baseY + 10), hx(baseX + 3), hy(baseY + 15));
        ctx.quadraticCurveTo(hx(baseX - 2), hy(baseY + 14), hx(baseX - 5), hy(baseY + 8));
        ctx.quadraticCurveTo(hx(baseX - 4), hy(baseY - 2), hx(baseX), hy(baseY - 12));
      }
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = hasLungs ? lungCol : '#4b5568';
      ctx.lineWidth = (hasLungs ? 1.3 : 0.6) * s;
      ctx.stroke();
      // subtle internal fissure lines
      if (hasLungs) {
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 0.6 * s;
        if (isRightLung) {
          ctx.beginPath();
          ctx.moveTo(hx(baseX - 5), hy(baseY + 2));
          ctx.lineTo(hx(baseX - 8), hy(baseY + 12));
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(hx(baseX + 3), hy(baseY + 3));
          ctx.lineTo(hx(baseX + 1), hy(baseY + 10));
          ctx.stroke();
        }
      }
    };
    // Anatomical Right Lung (Screen Left position): larger 3-lobed
    drawLung(71, 68, true);
    // Anatomical Left Lung (Screen Right position): smaller notched
    drawLung(99, 68, false);

    // Heart (more realistic anatomical shape - tilted, with ventricles/atria suggestion)
    const heartCol = getHighlightColor('heart');
    const hasHeart = active.has('heart');
    const hcx = hx(92);
    const hcy = hy(78);
    
    this._drawOrganGlow(ctx, hcx, hcy, 14 * s, heartCol, hasHeart);
    const heartGrad = ctx.createRadialGradient(hcx - 2 * s, hcy - 2 * s, 0, hcx, hcy, 12 * s);
    if (hasHeart) {
      heartGrad.addColorStop(0, '#fecaca');
      heartGrad.addColorStop(0.4, heartCol);
      heartGrad.addColorStop(1, heartCol + '44');
    } else {
      heartGrad.addColorStop(0, '#4a5568');
      heartGrad.addColorStop(1, '#1e293b');
    }
    
    // Trace Heart ONCE - improved anatomical shape (right side of screen = patient's left)
    ctx.beginPath();
    ctx.moveTo(hx(88), hy(68)); // base (atria)
    ctx.quadraticCurveTo(hx(96), hy(72), hx(98), hy(80)); // right upper ventricle curve
    ctx.quadraticCurveTo(hx(95), hy(88), hx(88), hy(90)); // apex (points down-leftish)
    ctx.quadraticCurveTo(hx(82), hy(85), hx(80), hy(76)); // left lower
    ctx.quadraticCurveTo(hx(84), hy(70), hx(88), hy(68)); // back, slight cleft
    ctx.closePath();
    
    ctx.fillStyle = heartGrad;
    ctx.globalAlpha = hasHeart ? 0.9 : 0.4;
    ctx.fill();
    
    ctx.globalAlpha = 1;
    ctx.strokeStyle = hasHeart ? heartCol : '#4b5568';
    ctx.lineWidth = (hasHeart ? 2 : 1) * s;
    ctx.shadowBlur = hasHeart ? 10 * s : 0;
    ctx.shadowColor = heartCol;
    ctx.stroke();
    ctx.shadowBlur = 0;
    // small highlight on active for "actual" depth
    if (hasHeart) {
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 0.8 * s;
      ctx.beginPath();
      ctx.moveTo(hx(90), hy(71));
      ctx.quadraticCurveTo(hx(93), hy(78), hx(90), hy(83));
      ctx.stroke();
    }

    // Immune (thymus / upper chest) - keep ellipse but slightly shaped
    this._drawOrganEllipse(ctx, hx, hy, 85, 58, 5, 4, s, getHighlightColor('immune'), active.has('immune'), 0.25);

    // Liver - actual lobed shape (anatomical right = screen left, large right lobe)
    const hasLiver = active.has('liver');
    const liverCol = getHighlightColor('liver');
    const lvx = hx(72);
    const lvy = hy(92);
    if (hasLiver) this._drawOrganGlow(ctx, lvx, lvy, 12 * s, liverCol, true);
    ctx.fillStyle = hasLiver ? liverCol : '#3d4a5c';
    ctx.globalAlpha = hasLiver ? 0.72 : 0.28;
    ctx.beginPath();
    // Liver: wide left (screen), tapers right, inferior border curved, superior flatish
    ctx.moveTo(hx(60), hy(86)); // superior left
    ctx.quadraticCurveTo(hx(55), hy(88), hx(56), hy(96)); // left inferior (big lobe)
    ctx.quadraticCurveTo(hx(62), hy(100), hx(78), hy(99)); // inferior border
    ctx.quadraticCurveTo(hx(82), hy(95), hx(80), hy(88)); // right (smaller lobe + falciform)
    ctx.quadraticCurveTo(hx(72), hy(85), hx(60), hy(86)); // superior
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = hasLiver ? liverCol : '#4b5568';
    ctx.lineWidth = (hasLiver ? 1.4 : 0.7) * s;
    ctx.stroke();
    // hint of falciform ligament / division
    if (hasLiver) {
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 0.5 * s;
      ctx.beginPath();
      ctx.moveTo(hx(72), hy(87));
      ctx.lineTo(hx(73), hy(97));
      ctx.stroke();
    }

    // Gut + Stomach (actual shapes: stomach is a curved sac, intestines coiled)
    const hasGut = active.has('gut');
    const gutCol = getHighlightColor('gut');
    if (hasGut) this._drawOrganGlow(ctx, hx(90), hy(96), 8 * s, gutCol, true);
    ctx.fillStyle = hasGut ? gutCol : '#3d4a5c';
    ctx.globalAlpha = hasGut ? 0.7 : 0.25;
    
    // Stomach (J-shaped sac on screen-right under heart/left lung)
    ctx.beginPath();
    ctx.moveTo(hx(88), hy(88)); // cardia (top)
    ctx.quadraticCurveTo(hx(95), hy(86), hx(101), hy(90)); // greater curve out
    ctx.quadraticCurveTo(hx(100), hy(97), hx(94), hy(100)); // antrum/pylorus
    ctx.quadraticCurveTo(hx(89), hy(98), hx(88), hy(92)); // lesser curve back
    ctx.closePath();
    ctx.fill();
    
    // Small intestine coils (multiple overlapping loops for "actual" look)
    const coil = (ox, oy, rw, rh) => {
      ctx.beginPath();
      ctx.ellipse(hx(ox), hy(oy), rw * s, rh * s, 0, 0, Math.PI * 2);
      ctx.fill();
    };
    coil(83, 108, 4, 3.5);
    coil(88, 112, 4.5, 3);
    coil(82, 116, 5, 3.2);
    coil(90, 118, 3.5, 2.8);
    coil(85, 113, 3, 2.5); // center overlap
    
    ctx.globalAlpha = 1;
    ctx.strokeStyle = hasGut ? gutCol : '#4b5568';
    ctx.lineWidth = (hasGut ? 1.1 : 0.6) * s;
    // re-stroke stomach + coils (simple, for speed just re-do a couple)
    ctx.beginPath();
    ctx.moveTo(hx(88), hy(88));
    ctx.quadraticCurveTo(hx(95), hy(86), hx(101), hy(90));
    ctx.quadraticCurveTo(hx(100), hy(97), hx(94), hy(100));
    ctx.quadraticCurveTo(hx(89), hy(98), hx(88), hy(92));
    ctx.closePath();
    ctx.stroke();
    // coil strokes (simplified)
    ctx.beginPath(); ctx.ellipse(hx(83), hy(108), 4*s, 3.5*s, 0,0,Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(hx(88), hy(112), 4.5*s, 3*s, 0,0,Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(hx(82), hy(116), 5*s, 3.2*s, 0,0,Math.PI*2); ctx.stroke();

    // Mito — layered energy glow
    const mitoCol = getHighlightColor('mito');
    const mx = hx(88);
    const my = hy(78);
    const hasMito = active.has('mito');
    
    if (hasMito) {
      for (const [r, a] of [[9, 0.12], [6.5, 0.22], [4.2, 0.45]]) {
        const mg = ctx.createRadialGradient(mx, my, 0, mx, my, r * s);
        mg.addColorStop(0, mitoCol + 'aa');
        mg.addColorStop(1, 'transparent');
        ctx.fillStyle = mg;
        ctx.globalAlpha = a;
        ctx.beginPath();
        ctx.arc(mx, my, r * s, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = hasMito ? mitoCol : '#3d4a5c';
    ctx.globalAlpha = hasMito ? 0.75 : 0.25;
    ctx.beginPath();
    ctx.arc(mx, my, (hasMito ? 4.5 : 3.2) * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Arms
    const muscleCol = getHighlightColor('muscle');
    const hasMuscle = active.has('muscle');
    const drawArm = (x1, y1, cx1, cy1, x2, y2) => {
      ctx.strokeStyle = hasMuscle ? muscleCol : '#3d4a5c';
      ctx.lineWidth = (hasMuscle ? 5.5 : 4) * s;
      ctx.lineCap = 'round';
      ctx.globalAlpha = hasMuscle ? 0.9 : 0.5;
      if (hasMuscle) {
        ctx.shadowBlur = 8 * s;
        ctx.shadowColor = muscleCol;
      }
      ctx.beginPath();
      ctx.moveTo(hx(x1), hy(y1));
      ctx.quadraticCurveTo(hx(cx1), hy(cy1), hx(x2), hy(y2));
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    };
    drawArm(68, 58, 52, 78, 55, 115);
    drawArm(102, 58, 118, 78, 115, 115);

    // Legs (single path + stroke for both)
    const hasBones = active.has('bones');
    const bonesActiveColor = (isNegative && hasBones) ? '#ef4444' : '#e2e8f0';
    ctx.lineCap = 'round';
    ctx.strokeStyle = hasBones ? bonesActiveColor : '#3d4a5c';
    ctx.lineWidth = (hasBones ? 5 : 4.2) * s;
    ctx.globalAlpha = hasBones ? 0.65 : 0.42;
    ctx.beginPath();
    ctx.moveTo(hx(77), hy(123));
    ctx.quadraticCurveTo(hx(71), hy(155), hx(74), hy(177));
    ctx.moveTo(hx(93), hy(123)); // Continuous path, single stroke call
    ctx.quadraticCurveTo(hx(99), hy(155), hx(96), hy(177));
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Joints (shoulders + knees)
    const jointCol = getHighlightColor('joints');
    const boneCol = getHighlightColor('bones');
    const hasJoints = active.has('joints');
    
    [[68, 55, jointCol, hasJoints], 
     [102, 55, jointCol, hasJoints],
     [74, 153, boneCol, hasBones || hasJoints], 
     [96, 153, boneCol, hasBones || hasJoints]]
      .forEach(([sx, sy, color, isActive]) => {
        const x = hx(sx);
        const y = hy(sy);
        if (isActive) this._drawOrganGlow(ctx, x, y, 5 * s, color, true);
        ctx.fillStyle = isActive ? color : '#3d4a5c';
        ctx.globalAlpha = isActive ? 0.9 : 0.4;
        ctx.beginPath();
        ctx.arc(x, y, (isActive ? 3.2 : 2.6) * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

    ctx.restore();
  }

  // Hit testing for body-centric layout (body at center of transform)
  getNodeAt(screenX, screenY) {
    const v = this.view;
    const { width: w, height: h } = this.getLogicalSize();
    const panX = v.panX ?? v.scrollX ?? 0;
    const panY = v.panY ?? v.scrollY ?? 0;
    const scale = v.scale || 1;

    const worldX = (screenX - w / 2) / scale + panX;
    const worldY = (screenY - h / 2) / scale + panY;

    const visible = this._getVisibleNodes();
    for (let i = visible.length - 1; i >= 0; i--) {
      const n = visible[i];
      const dx = n.x - worldX;
      const dy = n.y - worldY;
      
      // Cache the dynamic padding radius computation
      const r = (n.radius || 18) + 10;
      
      // Performance optimization: Avoid repeating multiplication inside conditional check
      if ((dx * dx + dy * dy) < (r * r)) {
        return n;
      }
    }
    return null;
  }

  /** @deprecated Use toggleGroup / enableAllGroups */
  setFilter(filterKey) {
    if (filterKey === 'all') {
      this.enableAllGroups();
    } else {
      this.enabledGroups = new Set([filterKey]);
      this._afterGroupChange();
    }
  }

  zoom(delta) {
    const v = this.view;
    const factor = delta > 0 ? 1.18 : 0.82;
    v.scale = Math.max(0.55, Math.min(2.8, v.scale * factor));
    this.draw();
  }

  /** Pan map in screen pixels (drag right → view moves right). */
  pan(dx, dy = 0) {
    const v = this.view;
    const s = v.scale || 1;
    v.panX = (v.panX ?? v.scrollX ?? 0) - dx / s;
    v.panY = (v.panY ?? v.scrollY ?? 0) - dy / s;
    delete v.scrollX;
    delete v.scrollY;
    this.draw();
  }

  scroll(dx) {
    this.pan(dx, 0);
  }

  resetView() {
    this.view = { panX: 0, panY: 0, scale: 0.92 };
    this.draw();
  }

  centerOn(node) {
    if (!node) return;
    const v = this.view;
    v.panX = node.x || 0;
    v.panY = node.y || 0;
    v.scale = Math.max(v.scale, 1.12);
    this.draw();
  }

  recenter() {
    this.computeLayout();
    this.resetView();
  }
}
