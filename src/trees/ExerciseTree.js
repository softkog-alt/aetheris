/**
 * ExerciseTree
 *
 * Top 30 Exercise Protocols & Modalities (types + cardio intensity levels).
 * Reuses the entire rich rendering, camera, interaction, and collision system
 * from SupplementTree for maximum UI reuse and consistency.
 *
 * Only the data, colors, categories, and a few labels are customized.
 */

import { SupplementTree } from "./SupplementTree.js";
import { calcVitality } from "../core/ScoringEngine.js";

export class ExerciseTree extends SupplementTree {
  constructor(canvas, options = {}) {
    super(canvas, options);

    // Energetic, performance-oriented palette — fire, blood, sky, earth for movement
    this.organColors = {
      brain:   '#a78bfa',
      heart:   '#fb7185',
      lungs:   '#67e8f9',
      muscle:  '#fb923c',
      joints:  '#f472b6',
      bones:   '#d1d5db',
      mito:    '#facc15',
      nerves:  '#c084fc',
      immune:  '#4ade80',
      liver:   '#a3e635',
      gut:     '#34d399',
      sleep:   '#6366f1',
      mind:    '#c084fc',
      nutrition: '#f59e0b',
      recovery: '#14b8a6',
      social:  '#ec4899',
      vices:   '#ef4444',
      productivity: '#3b82f6',
      // Exercise-specific emphasis
      power:   '#f97316',
      cardio:  '#06b6d4'
    };

    // Sequence for potential horizontal views (exercise categories)
    this.sequenceOrder = [
      'strength', 'power', 'zone2', 'threshold', 'hiit', 'mobility', 'stability', 'mixed', 'recovery'
    ];
  }

  loadData(exercisesArray) {
    this.rawSupplements = exercisesArray;

    this.nodes = exercisesArray.map(ex => {
      const vitality = calcVitality(ex);
      return {
        ...ex,
        vitality,
        radius: this._calcNodeRadius({ ...ex, vitality }, 0.5),
        _isExercise: true
      };
    });

    this.enabledGroups = new Set(this.nodes.map(n => n.cat).filter(Boolean));
    this.computeLayout();
  }
}
