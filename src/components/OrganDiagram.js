/**
 * OrganDiagram
 *
 * Beautiful simplified human body silhouette with highlightable organs.
 * Ported & cleaned from the original monolith (drawBodySVG + pulseSpecificOrgan)
 * for visual parity in the modular detail panel.
 *
 * Supports:
 *  - render(activeOrgans: string[]) — draws + highlights
 *  - pulse(organKey) — temporary bright pulse (clickable organs)
 *  - Future: subscribe to globalOrganSystem for cumulative +/- state
 */

export class OrganDiagram {
  constructor(containerId = 'body-diagram') {
    this.container = document.getElementById(containerId);
    this.ns = 'http://www.w3.org/2000/svg';
    this.activeOrgans = [];
  }

  render(activeOrgans = []) {
    if (!this.container) return;
    this.activeOrgans = activeOrgans;
    this.container.innerHTML = '';

    const svg = this.container;
    const ns = this.ns;
    const has = (k) => activeOrgans.includes(k);

    // Subtle outer skin / body glow
    const skinGlow = document.createElementNS(ns, 'path');
    skinGlow.setAttribute('d', 'M85 18 Q68 50 74 98 Q77 138 70 176 Q85 192 100 176 Q92 138 97 98 Q103 50 85 18');
    skinGlow.setAttribute('fill', 'none');
    skinGlow.setAttribute('stroke', has('skin') ? '#fbbf24' : '#334155');
    skinGlow.setAttribute('stroke-width', has('skin') ? '15' : '9');
    skinGlow.setAttribute('stroke-linecap', 'round');
    skinGlow.setAttribute('opacity', has('skin') ? '0.35' : '0.18');
    if (has('skin')) skinGlow.classList.add('organ', 'active');
    svg.appendChild(skinGlow);

    // Background soft body silhouette
    const body = document.createElementNS(ns, 'path');
    body.setAttribute('d', 'M 85 10 C 70 30, 65 70, 70 120 C 75 160, 75 180, 85 180 C 95 180, 95 160, 100 120 C 105 70, 100 30, 85 10');
    body.setAttribute('fill', 'none');
    body.setAttribute('stroke', '#475569');
    body.setAttribute('stroke-width', '4');
    body.setAttribute('stroke-linecap', 'round');
    body.setAttribute('opacity', '0.6');
    svg.appendChild(body);

    // Head (more proportional)
    const head = document.createElementNS(ns, 'circle');
    head.setAttribute('cx', '85');
    head.setAttribute('cy', '18');
    head.setAttribute('r', '10');
    head.setAttribute('fill', 'none');
    head.setAttribute('stroke', '#475569');
    head.setAttribute('stroke-width', '4');
    head.setAttribute('opacity', '0.6');
    svg.appendChild(head);

    // Brain (inside head)
    const brain = document.createElementNS(ns, 'ellipse');
    brain.setAttribute('id', 'organ-brain');
    brain.setAttribute('cx', '85');
    brain.setAttribute('cy', '26');
    brain.setAttribute('rx', '8.5');
    brain.setAttribute('ry', '7.5');
    brain.setAttribute('fill', has('brain') ? '#c084fc' : '#374151');
    brain.setAttribute('fill-opacity', has('brain') ? '0.75' : '0.2');
    brain.setAttribute('stroke', has('brain') ? '#c084fc' : '#4b5563');
    brain.setAttribute('stroke-width', has('brain') ? '1.6' : '0.9');
    if (has('brain')) brain.classList.add('organ', 'active');
    svg.appendChild(brain);

    // Eyes
    const eyeL = document.createElementNS(ns, 'circle');
    eyeL.setAttribute('id', 'organ-eyes');
    eyeL.setAttribute('cx', '79');
    eyeL.setAttribute('cy', '25');
    eyeL.setAttribute('r', '1.8');
    eyeL.setAttribute('fill', has('eyes') ? '#60a5fa' : '#4b5563');
    if (has('eyes')) eyeL.classList.add('organ', 'active');
    svg.appendChild(eyeL);

    const eyeR = document.createElementNS(ns, 'circle');
    eyeR.setAttribute('id', 'organ-eyes');
    eyeR.setAttribute('cx', '91');
    eyeR.setAttribute('cy', '25');
    eyeR.setAttribute('r', '1.8');
    eyeR.setAttribute('fill', has('eyes') ? '#60a5fa' : '#4b5563');
    if (has('eyes')) eyeR.classList.add('organ', 'active');
    svg.appendChild(eyeR);

    // Torso base
    const torso = document.createElementNS(ns, 'path');
    torso.setAttribute('d', 'M74 46 Q66 78 70 115 Q85 125 100 115 Q104 78 96 46');
    torso.setAttribute('fill', 'none');
    torso.setAttribute('stroke', '#374151');
    torso.setAttribute('stroke-width', '13');
    torso.setAttribute('stroke-linecap', 'round');
    torso.setAttribute('opacity', '0.5');
    svg.appendChild(torso);

    // Heart (anatomical left = screen right, more realistic curved shape)
    const heart = document.createElementNS(ns, 'path');
    heart.setAttribute('id', 'organ-heart');
    heart.setAttribute('d', 'M88 68 Q96 72 98 80 Q95 88 88 90 Q82 85 80 76 Q84 70 88 68');
    heart.setAttribute('fill', has('heart') ? '#f87171' : '#374151');
    heart.setAttribute('fill-opacity', has('heart') ? '0.85' : '0.3');
    heart.setAttribute('stroke', has('heart') ? '#f87171' : '#4b5563');
    heart.setAttribute('stroke-width', has('heart') ? '1.8' : '1');
    if (has('heart')) heart.classList.add('organ', 'active');
    svg.appendChild(heart);

    // Lungs - actual lobed (asymmetric)
    // Anatomical right lung (screen left, larger)
    const lungL = document.createElementNS(ns, 'path');
    lungL.setAttribute('id', 'organ-lungs');
    lungL.setAttribute('d', 'M71 55 Q62 58 61 72 Q58 80 63 82 Q57 92 60 105 Q67 112 78 108 Q81 95 79 78 Q80 62 71 55');
    lungL.setAttribute('fill', has('lungs') ? '#67e8f9' : '#374151');
    lungL.setAttribute('fill-opacity', has('lungs') ? '0.55' : '0.22');
    if (has('lungs')) lungL.classList.add('organ', 'active');
    svg.appendChild(lungL);

    // Anatomical left lung (screen right, smaller + notch)
    const lungR = document.createElementNS(ns, 'path');
    lungR.setAttribute('id', 'organ-lungs');
    lungR.setAttribute('d', 'M99 56 Q107 59 106 70 Q108 74 103 75 Q109 82 102 95 Q97 94 94 85 Q95 62 99 56');
    lungR.setAttribute('fill', has('lungs') ? '#67e8f9' : '#374151');
    lungR.setAttribute('fill-opacity', has('lungs') ? '0.55' : '0.22');
    if (has('lungs')) lungR.classList.add('organ', 'active');
    svg.appendChild(lungR);

    // Liver - actual lobed (screen left = anatomical right)
    const liver = document.createElementNS(ns, 'path');
    liver.setAttribute('id', 'organ-liver');
    liver.setAttribute('d', 'M60 86 Q55 88 56 96 Q62 100 78 99 Q82 95 80 88 Q72 85 60 86');
    liver.setAttribute('fill', has('liver') ? '#a3e635' : '#374151');
    liver.setAttribute('fill-opacity', has('liver') ? '0.65' : '0.25');
    if (has('liver')) liver.classList.add('organ', 'active');
    svg.appendChild(liver);

    // Stomach (screen right, J-shaped sac) + intestines (coils)
    const stomach = document.createElementNS(ns, 'path');
    stomach.setAttribute('id', 'organ-gut');
    stomach.setAttribute('d', 'M88 88 Q95 86 101 90 Q100 97 94 100 Q89 98 88 92');
    stomach.setAttribute('fill', has('gut') ? '#4ade80' : '#374151');
    stomach.setAttribute('fill-opacity', has('gut') ? '0.55' : '0.22');
    if (has('gut')) stomach.classList.add('organ', 'active');
    svg.appendChild(stomach);

    // Intestinal coils (multiple for realistic look)
    const gutCoils = [
      {cx:83, cy:108, rx:4, ry:3.5},
      {cx:88, cy:112, rx:4.5, ry:3},
      {cx:82, cy:116, rx:5, ry:3.2},
      {cx:90, cy:118, rx:3.5, ry:2.8}
    ];
    gutCoils.forEach((c, i) => {
      const coil = document.createElementNS(ns, 'ellipse');
      coil.setAttribute('cx', c.cx);
      coil.setAttribute('cy', c.cy);
      coil.setAttribute('rx', c.rx);
      coil.setAttribute('ry', c.ry);
      coil.setAttribute('fill', has('gut') ? '#4ade80' : '#374151');
      coil.setAttribute('fill-opacity', has('gut') ? (0.45 - i*0.05) : '0.18');
      if (has('gut')) coil.classList.add('organ', 'active');
      svg.appendChild(coil);
    });

    // Muscles / Arms (abstract)
    const armL = document.createElementNS(ns, 'path');
    armL.setAttribute('id', 'organ-muscle');
    armL.setAttribute('d', 'M68 58 Q52 78 55 115');
    armL.setAttribute('fill', 'none');
    armL.setAttribute('stroke', has('muscle') ? '#fb923c' : '#374151');
    armL.setAttribute('stroke-width', has('muscle') ? '5.5' : '4');
    armL.setAttribute('stroke-linecap', 'round');
    armL.setAttribute('stroke-opacity', has('muscle') ? '0.9' : '0.45');
    if (has('muscle')) armL.classList.add('organ', 'active');
    svg.appendChild(armL);

    const armR = document.createElementNS(ns, 'path');
    armR.setAttribute('id', 'organ-muscle');
    armR.setAttribute('d', 'M102 58 Q118 78 115 115');
    armR.setAttribute('fill', 'none');
    armR.setAttribute('stroke', has('muscle') ? '#fb923c' : '#374151');
    armR.setAttribute('stroke-width', has('muscle') ? '5.5' : '4');
    armR.setAttribute('stroke-linecap', 'round');
    armR.setAttribute('stroke-opacity', has('muscle') ? '0.9' : '0.45');
    if (has('muscle')) armR.classList.add('organ', 'active');
    svg.appendChild(armR);

    // Lower body hint (legs)
    const legL = document.createElementNS(ns, 'path');
    legL.setAttribute('d', 'M77 123 Q71 155 74 177');
    legL.setAttribute('fill', 'none');
    legL.setAttribute('stroke', '#374151');
    legL.setAttribute('stroke-width', '5');
    legL.setAttribute('stroke-linecap', 'round');
    legL.setAttribute('opacity', '0.4');
    svg.appendChild(legL);

    const legR = document.createElementNS(ns, 'path');
    legR.setAttribute('d', 'M93 123 Q99 155 96 177');
    legR.setAttribute('fill', 'none');
    legR.setAttribute('stroke', '#374151');
    legR.setAttribute('stroke-width', '5');
    legR.setAttribute('stroke-linecap', 'round');
    legR.setAttribute('opacity', '0.4');
    svg.appendChild(legR);

    // Spine hint
    const spine = document.createElementNS(ns, 'path');
    spine.setAttribute('d', 'M85 40 L85 120');
    spine.setAttribute('fill', 'none');
    spine.setAttribute('stroke', '#475569');
    spine.setAttribute('stroke-width', '1.8');
    spine.setAttribute('opacity', '0.6');
    svg.appendChild(spine);

    // Bones (knees abstract)
    const kneeL = document.createElementNS(ns, 'circle');
    kneeL.setAttribute('cx', '74');
    kneeL.setAttribute('cy', '153');
    kneeL.setAttribute('r', '3');
    kneeL.setAttribute('fill', (has('bones') || has('joints')) ? '#f3e8d8' : '#374151');
    kneeL.setAttribute('fill-opacity', (has('bones') || has('joints')) ? '0.9' : '0.35');
    if (has('bones') || has('joints')) kneeL.classList.add('organ', 'active');
    svg.appendChild(kneeL);

    const kneeR = document.createElementNS(ns, 'circle');
    kneeR.setAttribute('cx', '96');
    kneeR.setAttribute('cy', '153');
    kneeR.setAttribute('r', '3');
    kneeR.setAttribute('fill', (has('bones') || has('joints')) ? '#f3e8d8' : '#374151');
    kneeR.setAttribute('fill-opacity', (has('bones') || has('joints')) ? '0.9' : '0.35');
    if (has('bones') || has('joints')) kneeR.classList.add('organ', 'active');
    svg.appendChild(kneeR);

    // Joints (shoulders / hips)
    const jointShoulderL = document.createElementNS(ns, 'circle');
    jointShoulderL.setAttribute('cx', '68');
    jointShoulderL.setAttribute('cy', '55');
    jointShoulderL.setAttribute('r', '2.2');
    jointShoulderL.setAttribute('fill', has('joints') ? '#f472b6' : '#475569');
    jointShoulderL.setAttribute('fill-opacity', has('joints') ? '0.95' : '0.5');
    if (has('joints')) jointShoulderL.classList.add('organ', 'active');
    svg.appendChild(jointShoulderL);

    const jointShoulderR = document.createElementNS(ns, 'circle');
    jointShoulderR.setAttribute('cx', '102');
    jointShoulderR.setAttribute('cy', '55');
    jointShoulderR.setAttribute('r', '2.2');
    jointShoulderR.setAttribute('fill', has('joints') ? '#f472b6' : '#475569');
    jointShoulderR.setAttribute('fill-opacity', has('joints') ? '0.95' : '0.5');
    if (has('joints')) jointShoulderR.classList.add('organ', 'active');
    svg.appendChild(jointShoulderR);

    // Mitochondria abstract glow (near heart)
    const mito = document.createElementNS(ns, 'circle');
    mito.setAttribute('cx', '88');
    mito.setAttribute('cy', '78');
    mito.setAttribute('r', has('mito') ? '5.2' : '3.8');
    mito.setAttribute('fill', has('mito') ? '#facc15' : '#475569');
    mito.setAttribute('fill-opacity', has('mito') ? '0.65' : '0.18');
    mito.setAttribute('stroke', has('mito') ? '#facc15' : '#334155');
    mito.setAttribute('stroke-width', has('mito') ? '1.8' : '0.6');
    if (has('mito')) mito.classList.add('organ', 'active');
    svg.appendChild(mito);

    // Make organs clickable for pulse feedback (nice UX parity with original)
    svg.querySelectorAll('[id^="organ-"]').forEach((el) => {
      const key = el.id.replace('organ-', '');
      el.style.cursor = 'pointer';
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.pulse(key);
      });
    });
  }

  /**
   * Temporary bright pulse on a specific organ (or organs sharing the key prefix).
   * Used for click feedback in the body diagram and detail badges.
   */
  pulse(organKey) {
    if (!this.container) return;
    const els = this.container.querySelectorAll(`#organ-${organKey}, [id="organ-${organKey}"]`);
    els.forEach((el) => {
      el.style.transition = 'all .12s ease';
      el.setAttribute('fill-opacity', '0.95');
      el.style.filter = 'brightness(1.8) saturate(1.6)';

      setTimeout(() => {
        el.style.filter = '';
        const isActive = el.classList.contains('active');
        el.setAttribute('fill-opacity', isActive ? '0.75' : '0.3');
      }, 680);
    });
  }

  /** Optional: clear highlights (future use with OrganSystem reset) */
  clear() {
    if (this.container) this.container.innerHTML = '';
    this.activeOrgans = [];
  }
}
