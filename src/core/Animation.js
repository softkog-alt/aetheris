/**
 * Animation utilities
 * Shared RAF-based helpers for smooth node transitions, pulses, etc.
 * Will be heavily used once we implement the improved collision + interaction animations.
 */

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// Simple spring-like animator (expand later)
export class AnimatedValue {
  constructor(initial = 0) {
    this.value = initial;
    this.target = initial;
    this.velocity = 0;
  }

  setTarget(newTarget, immediate = false) {
    this.target = newTarget;
    if (immediate) this.value = newTarget;
  }

  update(dt = 0.016) {
    const diff = this.target - this.value;
    this.velocity = this.velocity * 0.7 + diff * 8.0 * dt;
    this.value += this.velocity * dt;

    if (Math.abs(diff) < 0.001 && Math.abs(this.velocity) < 0.01) {
      this.value = this.target;
      this.velocity = 0;
    }
    return this.value;
  }
}
