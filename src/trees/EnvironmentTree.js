/**
 * EnvironmentTree
 *
 * New "Environment / Exposures / Hazards" constellation.
 * Focuses exclusively on negative-impact nodes (toxins, pollutants, radiation, etc.).
 *
 * Reuses the entire rich rendering, layout, camera, interaction, and body highlighting
 * system from SupplementTree.
 *
 * Negative nodes use red damage theming and trigger red organ highlights on the body.
 * All nodes framed as "avoid / reduce exposure" with mitigation notes in inspector.
 *
 * Only data, colors, categories, and load logic are customized.
 */

import { SupplementTree } from "./SupplementTree.js";
import { calcVitality } from "../core/ScoringEngine.js";

export class EnvironmentTree extends SupplementTree {
  constructor(canvas, options = {}) {
    super(canvas, options);

    // Danger / hazard red-amber palette for exposures
    // Negative nodes will also hit the base _getNodeColor red override
    this.organColors = {
      brain:   '#c02626',
      heart:   '#b91c1c',
      lungs:   '#9f1239',
      liver:   '#854d0d',
      kidney:  '#7f1d1d',
      endocrine: '#9f1239',
      repro:   '#881337',
      skin:    '#9a3412',
      gut:     '#7c2d12',
      immune:  '#991b1b',
      vascular: '#b91c1c',
      thyroid: '#854d0d',
      nerves:  '#9f1239',
      // Exposure category accents (used for groups)
      "air-pollution": '#b91c1c',
      "heavy-metals": '#7f1d1d',
      plastics: '#9f1239',
      pesticides: '#854d0d',
      radiation: '#991b1b',
      "water-contam": '#7c2d12',
      household: '#9a3412'
    };

    // Sequence for any future horizontal or list views
    this.sequenceOrder = [
      'air-pollution', 'heavy-metals', 'plastics', 'pesticides',
      'radiation', 'water-contam', 'household'
    ];
  }

  loadData(envArray) {
    this.rawSupplements = envArray;

    this.nodes = envArray.map(item => {
      const vitality = calcVitality(item);  // will be low for these entries
      return {
        ...item,
        vitality,
        radius: this._calcNodeRadius({ ...item, vitality }, 0.55), // slightly smaller baseline for hazard nodes
        _isEnvironment: true,
        impact: item.impact || 'negative'   // ensure flag
      };
    });

    this.enabledGroups = new Set(this.nodes.map(n => n.cat).filter(Boolean));
    this.computeLayout();
  }

  // Environment can override node color more aggressively if desired (base already does red for negative)
  // _getNodeColor is inherited and will return #ef4444 for impact negative
}
