/**
 * BloodTree
 *
 * Blood biomarker constellation inspired by Bryan Johnson Blueprint.
 * Reuses core layout, rendering, interaction, and body integration from SupplementTree.
 *
 * Nodes represent blood markers. Placed near relevant organs where possible.
 * Display shows current value (or key metric) + color by status (optimal/sub/high-risk).
 * Age predictor impact used for sizing/importance (higher impact = larger, closer in layout).
 *
 * Inspector shows rich details: ranges, age impact, risks, links to other constellations.
 */

import { SupplementTree } from "./SupplementTree.js";
import { computeBloodScore } from "../data/blood.js";

export class BloodTree extends SupplementTree {
  constructor(canvas, options = {}) {
    super(canvas, options);

    // Blood-focused palette. Status will override per node.
    this.organColors = {
      heart:   '#fb7185',
      vascular: '#f87171',
      brain:   '#c084fc',
      liver:   '#a3e635',
      kidney:  '#67e8f9',
      mito:    '#facc15',
      immune:  '#4ade80',
      muscle:  '#fb923c',
      endocrine: '#f472b6',
      pancreas: '#f59e0b',
      // Blood categories
      inflammation: '#ef4444',
      metabolic: '#f59e0b',
      lipids: '#fb7185',
      hormones: '#c084fc',
      nutrients: '#4ade80',
      kidney: '#67e8f9',
      liver: '#a3e635',
      other: '#94a3b8'
    };

    this.sequenceOrder = [
      'inflammation', 'metabolic', 'lipids', 'hormones',
      'nutrients', 'kidney', 'liver', 'other'
    ];
  }

  loadData(bloodArray) {
    this.rawSupplements = bloodArray;

    this.nodes = bloodArray.map(m => {
      const vitality = computeBloodScore(m);  // drives size + layout importance
      return {
        ...m,
        vitality,
        radius: this._calcNodeRadius({ ...m, vitality }, 0.6),
        _isBlood: true,
        // Ensure a display value for node (current or age impact)
        displayValue: m.current != null ? String(m.current) : (m.age_impact != null ? (m.age_impact > 0 ? `+${m.age_impact}` : m.age_impact) : '?')
      };
    });

    this.enabledGroups = new Set(this.nodes.map(n => n.cat).filter(Boolean));
    this.computeLayout();
  }

  // Override node color: use status if present, else category, fallback to red for high risk
  _getNodeColor(node) {
    if (node.status === 'high') return '#ef4444';
    if (node.status === 'suboptimal') return '#f59e0b';
    if (node.status === 'optimal') return '#4ade80';
    // fallback to category or base
    return super._getNodeColor ? super._getNodeColor(node) : '#94a3b8';
  }

  // Custom node score display for blood: show current value or key metric instead of "vitality"
  _drawNodeScore(ctx, node, r, { isDimmed, isSelected, isHighValue }) {
    if (r < 10) return;

    const val = node.displayValue || String(node.vitality ?? '');
    const fsVit = Math.round(Math.max(7, Math.min(12, r * 0.48)));

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = `${isSelected ? 700 : 600} ${fsVit}px Inter, system-ui, sans-serif`;

    let color = '#e0f2fe';
    if (node.status === 'high') color = '#fecaca';
    else if (node.status === 'suboptimal') color = '#fef08c';
    else if (node.status === 'optimal') color = '#bbf7d0';

    ctx.fillStyle = isDimmed ? '#6b7280' : (isSelected ? '#e0f2fe' : color);
    ctx.fillText(val, node.x, node.y);
  }
}
