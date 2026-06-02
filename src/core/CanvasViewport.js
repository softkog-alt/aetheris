/**
 * CanvasViewport — HiDPI-aware canvas sizing and pointer coordinates.
 *
 * Keeps backing-store pixels in sync with CSS layout size × devicePixelRatio so
 * vector drawing and text stay sharp. All tree code should draw in logical
 * (CSS) pixels via applyLogicalTransform().
 */

export class CanvasViewport {
  constructor(canvas) {
    this.canvas = canvas;
    this.dpr = 1;
    this.width = 900;
    this.height = 720;
    this._onResize = null;
    this._observer = null;
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));

    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.dpr = dpr;
    this.width = w;
    this.height = h;

    if (this._onResize) this._onResize(w, h);
  }

  bind(onResize) {
    this._onResize = onResize;
    this.resize();
    const handler = () => this.resize();
    window.addEventListener('resize', handler);
    if (typeof ResizeObserver !== 'undefined') {
      this._observer = new ResizeObserver(handler);
      this._observer.observe(this.canvas);
    }
    this._unbind = () => {
      window.removeEventListener('resize', handler);
      this._observer?.disconnect();
    };
  }

  /** Map pointer event to logical canvas coordinates. */
  pointerFromEvent(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  /** Scale context so 1 unit = 1 CSS pixel (crisp on Retina). */
  applyLogicalTransform(ctx) {
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  dispose() {
    this._unbind?.();
  }
}