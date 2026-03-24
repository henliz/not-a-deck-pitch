// not-a-deck-pitch — Trove investor pitch
// rendered inside a 3D phone model on a Three.js canvas (see index.html)
//
// this file is now the orchestrator — it wires modules together and runs the sequence.
// all story content lives in the modules imported below.
//
// module map:
//   scoring.js          — archetype scoring + behavioral flags + recap data
//   data/archetypes.js  — ARCHETYPES pure data object
//   data/palette.js     — RING_COLORS, STAT_COLORS, BURST_SETS
//   share-card.js       — generateShareCard (canvas PNG generator)
//   components/pitch-ui.js    — scroll helpers, line, flash, reveal, coinTransition,
//                               decal, chapter, ringWipeChapter, contBtn, branchChoices
//   components/rich-elements.js — assetBurst, wavePunch, crtTicker, orbitingTextRing,
//                               curveText, typewriterLine, wordPop, testimonialReel,
//                               statsFormation, dimLines, statCard, spawnAmbientFloaters,
//                               pqReveal, statsBlockReveal, rlist, rlistReveal, askGrid
//   components/email.js       — emailCapture
//   scenes/intro.js           — opening sequence beats 1-5
//   scenes/branches.js        — sBranch0 + A/B/C paths + shared nodes + sAsk
//   scenes/archetype-reveal.js — recapScreen + sRevealArchetype
//
// deps: GSAP (SplitText, ScrambleTextPlugin, CustomEase) loaded via CDN in index.html
//       haptics.js for phone vibration on supported devices
//       Three.js lives in index.html — this file doesn't touch it directly

import { HAPTIC } from './haptics.js';
import { createScoring }          from './scoring.js';
import { generateShareCard }      from './share-card.js';
import { createPitchUI }          from './components/pitch-ui.js';
import { createRichElements }     from './components/rich-elements.js';
import { createEmail }            from './components/email.js';
import { createIntro }            from './scenes/intro.js';
import { createBranches }         from './scenes/branches.js';
import { createArchetypeReveal }  from './scenes/archetype-reveal.js';

window.tgSpeedMult = 2.5; // 1.0 = fast, 2.5 = normal, 5.0 = slow — controls pacing waits only

// particle disintegration — used when a choice gets eliminated
// 32 colored dots explode outward from the element, then it collapses and removes itself
function disintegrate(el) {
  HAPTIC.shatter();
  const rect    = el.getBoundingClientRect();
  const palette = ['#DBD59C','#88ABE3','#C3D9FF','#F9F9F2','#FFFBCD'];
  for (let i = 0; i < 32; i++) {
    const p   = document.createElement('div');
    const sz  = 1.5 + Math.random() * 4;
    const col = palette[Math.floor(Math.random() * palette.length)];
    const sx  = rect.left + Math.random() * rect.width;
    const sy  = rect.top  + Math.random() * rect.height;
    const ang = Math.random() * Math.PI * 2;
    const mag = 24 + Math.random() * 60;
    p.style.cssText =
      `position:fixed;width:${sz}px;height:${sz}px;border-radius:50%;` +
      `background:${col};left:${sx}px;top:${sy}px;` +
      `pointer-events:none;z-index:9999;opacity:0.75;` +
      `box-shadow:0 0 ${sz*2}px ${col}60;`;
    document.body.appendChild(p);
    if (window.gsap) {
      gsap.to(p, {
        x: Math.cos(ang)*mag, y: Math.sin(ang)*mag - 20,
        opacity: 0, scale: 0.1,
        duration: (380 + Math.random()*350) / 1000,
        ease: 'power2.out',
        onComplete: () => p.remove(),
      });
    } else {
      const dur = 380 + Math.random() * 350;
      p.style.transition = `transform ${dur}ms ease-out, opacity ${dur*0.75}ms ease-in`;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        p.style.transform = `translate(${Math.cos(ang)*mag}px,${Math.sin(ang)*mag-20}px) scale(0.1)`;
        p.style.opacity = '0';
      }));
      setTimeout(() => p.remove(), dur + 80);
    }
  }
  if (window.gsap) {
    gsap.to(el, { opacity: 0, scale: 0.94, height: 0, marginBottom: 0,
      duration: 0.4, ease: 'power2.inOut', onComplete: () => el.remove() });
  } else {
    el.style.overflow = 'hidden';
    el.style.height   = el.offsetHeight + 'px';
    el.style.transition = 'opacity 220ms ease, height 340ms 60ms ease, margin-bottom 340ms 60ms ease';
    requestAnimationFrame(() => {
      el.style.opacity = '0'; el.style.height = '0'; el.style.marginBottom = '0';
    });
    setTimeout(() => el.remove(), 460);
  }
}

// tgAPI — tiny public interface so index.html can drive progress bar + timing
// wait() is the key one: respects tgSpeedMult and tgPaused, so the whole
// pacing system flows through here
window.tgAPI = {

  setProgress(pct) {
    const fill = document.querySelector('#t-progress-fill');
    if (fill) fill.style.width = pct + '%';
  },

  wait(ms) {
    return new Promise(r => {
      const target = ms * (window.tgSpeedMult || 1);
      let elapsed = 0, last = performance.now();
      function tick() {
        const now = performance.now();
        if (!window.tgPaused) elapsed += now - last;
        last = now;
        if (elapsed >= target) r();
        else requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  },

  showEnd(message) {
    const slide = document.getElementById('tangle-slide');
    if (!slide) return;
    const el = document.createElement('div');
    el.className = 'tg-end-card';
    el.innerHTML = `
      <div class="tg-end-inner">
        <div class="tg-end-ornament">✦</div>
        <p class="tg-end-text">${message}</p>
        <button class="tg-end-btn" onclick="window.tClose()">close</button>
      </div>
    `;
    slide.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('visible')));
  },

};

// pause / speed controls — wired to the UI buttons in index.html
window.tgPaused = false;
window.tTogglePause = function () {
  window.HAPTIC?.tap?.();
  window.tgPaused = !window.tgPaused;
  if (window.gsap) gsap.globalTimeline.paused(window.tgPaused);
  const btn = document.getElementById('t-pause-btn');
  if (btn) btn.textContent = window.tgPaused ? '▶' : '⏸';
};

window.tToggleSpeedPanel = function () {
  window.HAPTIC?.tap?.();
  const panel = document.getElementById('t-speed-panel');
  if (panel) panel.classList.toggle('open');
};

window.tSetSpeed = function (mult) {
  window.HAPTIC?.tap?.();
  window.tgSpeedMult = mult;
  document.querySelectorAll('.t-speed-option').forEach(b => {
    b.classList.toggle('t-speed-active', parseFloat(b.dataset.speed) === mult);
  });
  const panel = document.getElementById('t-speed-panel');
  if (panel) panel.classList.remove('open');
};

// the whole pitch lives in this one function
// re-runs cleanly on replay — clears pitch, resets scores, re-registers plugins
window.tgInitGame = async function () {
  const pitch = document.getElementById('tg-pitch');
  if (!pitch) return;

  // fresh start — wipe previous run
  pitch.innerHTML = '';
  if (window.gsap) gsap.set(pitch, { opacity: 1, clearProps: 'opacity' });
  document.querySelectorAll('.tg-recap-overlay').forEach(el => el.remove());

  const hasGSAP  = !!(window.gsap && window.SplitText);
  const hasScrTx = !!(window.ScrambleTextPlugin);
  const hasCE    = !!(window.CustomEase);

  if (hasGSAP) {
    gsap.registerPlugin(SplitText);
    if (hasScrTx) gsap.registerPlugin(ScrambleTextPlugin);
    if (hasCE)    gsap.registerPlugin(CustomEase);
  }

  if (hasCE) {
    CustomEase.create('slam',    'M0,0 C0.08,0 0.12,1.3 0.32,1.08 0.52,0.86 0.52,1 1,1');
    CustomEase.create('unfurl',  'M0,0 C0.28,0 0.16,1 1,1');
    CustomEase.create('yank',    'M0,0 C0.6,0 0.4,1.6 1,1');
    CustomEase.create('hesitate','M0,0 C0.02,0 0.04,0.02 0.3,0.02 0.5,0.02 0.6,1 1,1');
    CustomEase.create('snap',    'M0,0 C0,0 0.05,0.9 0.1,1 0.15,1.1 0.25,0.95 1,1');
  }

  const w = ms => window.tgAPI.wait(ms);

  // context object — all modules share this, accessed lazily at call time
  const ctx = {
    pitch,
    scene:    pitch.closest('.tg-pitch-scene'),
    hasGSAP, hasCE, hasScrTx,
    w,
    HAPTIC,
    disintegrate,
    generateShareCard,
  };

  // register modules — each factory reads/writes ctx, returns methods merged back
  Object.assign(ctx, createScoring());
  Object.assign(ctx, createPitchUI(ctx));
  Object.assign(ctx, createRichElements(ctx));
  Object.assign(ctx, createEmail(ctx));
  Object.assign(ctx, createArchetypeReveal(ctx));
  Object.assign(ctx, createBranches(ctx));
  Object.assign(ctx, createIntro(ctx));

  await ctx.runIntro();
};
