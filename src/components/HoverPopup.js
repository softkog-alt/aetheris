/**
 * HoverPopup — minimal floating card on node hover (read-only).
 */

export class HoverPopup {
  constructor() {
    this.el = null;
    this.currentId = null;
  }

  init() {
    this.el = document.getElementById('node-hover-popup');
    if (!this.el) {
      console.warn('HoverPopup: #node-hover-popup element not found in DOM');
    }
    return this;
  }

  show(node, clientX, clientY) {
    if (!this.el || !node) return;

    this.currentId = node.id;

    // Always clear any stale high-dose notes before building new content
    const oldNotes = this.el.querySelectorAll('.popup-high-dose-note');
    oldNotes.forEach(n => n.remove());

    const pad = 16;
    const cardW = 260;
    const cardH = 140;
    this.el.style.left = Math.min(clientX + 18, window.innerWidth - cardW - pad) + 'px';
    this.el.style.top = Math.max(pad, Math.min(clientY - 16, window.innerHeight - cardH - pad)) + 'px';

    const nameEl = document.getElementById('popup-name');
    if (nameEl) nameEl.textContent = node.name || '';

    const vitEl = document.getElementById('popup-vitality');
    if (vitEl) vitEl.textContent = String(node.vitality ?? '');

    const catEl = document.getElementById('popup-cat');
    if (catEl) catEl.textContent = (node.cat || '').toUpperCase();

    const scoresEl = document.getElementById('popup-scores');
    if (scoresEl) {
      scoresEl.textContent = `L${node.longevity ?? '—'} · Q${node.qol ?? '—'}`;
    }

    const blurbEl = document.getElementById('popup-blurb');
    if (blurbEl) blurbEl.textContent = node.blurb || '';

    const organsEl = document.getElementById('popup-organs');
    if (organsEl) {
      organsEl.innerHTML = '';
      (node.organs || []).slice(0, 4).forEach(key => {
        const meta = window.AETHERIS_ORGAN_META?.[key];
        if (!meta) return;
        const chip = document.createElement('span');
        chip.className = 'px-1.5 py-0.5 rounded-lg text-[10px] border';
        chip.style.borderColor = meta.color + '44';
        chip.style.background = meta.color + '12';
        chip.style.color = meta.color;
        chip.textContent = meta.label;
        organsEl.appendChild(chip);
      });
    }

    // Subtle note for high dose risk supps (referenced on map hover)
    const hasHighDose = !!(node.highDoseRisks);
    const isNegHover = !!(node.impact === 'negative' || node._isNegative);
    if (hasHighDose && !isNegHover) {
      const note = document.createElement('div');
      note.className = 'text-[9px] text-orange-400/80 mt-1 flex items-center gap-1 popup-high-dose-note popup-blink';
      note.innerHTML = '<span class="popup-blink">⚠ High dose risks documented</span>';
      organsEl.parentNode.appendChild(note);
    }

    this.el.style.display = 'block';
    this.el.classList.remove('hidden');
  }

  hide() {
    if (this.el) {
      this.el.style.display = 'none';
      this.el.classList.add('hidden');
    }
    this.currentId = null;
  }
}