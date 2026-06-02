/**
 * HabitsTree
 *
 * Top 30 Habits Constellation.
 * Reuses the entire rich rendering, camera, interaction, and collision system
 * from SupplementTree for maximum UI reuse and consistency.
 *
 * Only the data, colors, categories, and a few labels are customized.
 */

import { SupplementTree } from "./SupplementTree.js";
import { calcVitality } from "../core/ScoringEngine.js";

export class HabitsTree extends SupplementTree {
  constructor(canvas, options = {}) {
    super(canvas, options);

    // Different color palette — earthier, more grounded than the golden supplement theme
    this.organColors = {
      brain:   '#a78bfa',
      heart:   '#fb7185',
      immune:  '#4ade80',
      mito:    '#fbbf24',
      muscle:  '#fb923c',
      joints:  '#f472b6',
      liver:   '#a3e635',
      gut:     '#34d399',
      sleep:   '#6366f1',
      mind:    '#c084fc',
      nutrition: '#f59e0b',
      recovery: '#14b8a6',
      social:  '#ec4899',
      vices:   '#ef4444',
      productivity: '#3b82f6'
    };

    // Sequence for horizontal arc (from habit data categories, excluding 'all')
    this.sequenceOrder = [
      'movement', 'sleep', 'mind', 'nutrition', 'recovery', 'social', 'vices', 'productivity'
    ];
  }

  loadData(habitsArray) {
    this.rawSupplements = habitsArray;

    this.nodes = habitsArray.map(h => {
      const vitality = calcVitality(h);
      return {
        ...h,
        vitality,
        radius: this._calcNodeRadius({ ...h, vitality }, 0.5),
        _isHabit: true
      };
    });

    this.enabledGroups = new Set(this.nodes.map(n => n.cat).filter(Boolean));
    this.computeLayout();
  }

  // We can reuse the exact same computeLayout + collision from parent,
  // but we override the core label in draw by monkey-patching a tiny bit.
  // For cleanliness, we just accept the parent draw and override the one label.

  // In the new horizontal bottom arc model we don't have a central core label,
  // so we just delegate to the parent rich drawing (sequence labels already show "HABITS" vibe via category tags).
  // If you want a small title at top of map, it can be added in main or via a DOM overlay.
}
