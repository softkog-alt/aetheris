/**
 * OrganSystem (Shared Core)
 * 
 * In the monolith this was implicit (per-supplement active organs list + SVG drawing).
 * 
 * Future responsibility:
 * - Maintain cumulative impact scores per organ across ALL trees
 *   (Supplements + Exercise positive, Habits + Toxins negative)
 * - Notify listeners (OrganDiagram, etc.) when state changes
 */

export class OrganSystem {
  constructor() {
    this.impacts = {}; // organKey -> totalImpact (positive or negative)
    this.listeners = [];
  }

  applyContribution(sourceId, organList = [], impactValue = 1) {
    organList.forEach(organ => {
      this.impacts[organ] = (this.impacts[organ] || 0) + impactValue;
    });
    this.notify();
  }

  getOrganState(organ) {
    return this.impacts[organ] || 0;
  }

  reset() {
    this.impacts = {};
    this.notify();
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.impacts));
  }
}

// Singleton for the current phase (easy to replace with DI later)
export const globalOrganSystem = new OrganSystem();
