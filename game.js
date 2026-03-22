import { HAPTIC } from './haptics.js';

window.tgSpeedMult = 1.0;

/* ══════════════════════════════════════════════════════════════
   GAME ENGINE
══════════════════════════════════════════════════════════════ */

/* Particle disintegration — palette colours + GSAP */
function disintegrate(el) {
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

/* ── tgAPI ── */
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

/* ── Pause control ── */
window.tgPaused = false;
window.tTogglePause = function () {
  window.tgPaused = !window.tgPaused;
  if (window.gsap) gsap.globalTimeline.paused(window.tgPaused);
  const btn = document.getElementById('t-pause-btn');
  if (btn) btn.textContent = window.tgPaused ? '▶' : '⏸';
};

/* ── Speed control ── */
window.tToggleSpeedPanel = function () {
  const panel = document.getElementById('t-speed-panel');
  if (panel) panel.classList.toggle('open');
};

window.tSetSpeed = function (mult) {
  window.tgSpeedMult = mult;
  if (window.gsap) gsap.globalTimeline.timeScale(1 / mult);
  document.querySelectorAll('.t-speed-option').forEach(b => {
    b.classList.toggle('t-speed-active', parseFloat(b.dataset.speed) === mult);
  });
  const panel = document.getElementById('t-speed-panel');
  if (panel) panel.classList.remove('open');
};

/* ══════════════════════════════════════════════════════════════
   PITCH — "What if you had xray vision?"
══════════════════════════════════════════════════════════════ */
window.tgInitGame = async function () {
  const pitch = document.getElementById('tg-pitch');
  if (!pitch) return;

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

  /* ── Wrapped-style palette constants ── */
  const RING_COLORS  = ['#DBD59C','#88ABE3','#C3D9FF','#FFFBCD'];
  const STAT_COLORS  = [
    { bg: '#DBD59C', fg: '#88ABE3' },  // dark yellow → cool blue text
    { bg: '#88ABE3', fg: '#FFFBCD' },  // cool blue   → light yellow text
    { bg: '#C3D9FF', fg: '#222222' },  // echo blue   → anchor text
    { bg: '#FFFBCD', fg: '#88ABE3' },  // light yellow → cool blue text
  ];
  let ringColorIdx = 0;
  let statColorIdx = 0;

  function scrollPitch() {
    if (hasGSAP) {
      gsap.to(pitch, { scrollTop: pitch.scrollHeight, duration: 0.6, ease: 'power3.out', overwrite: true });
    } else {
      pitch.scrollTop = pitch.scrollHeight;
    }
  }

  const TMARK = '<img src="./TroveLogo.png" class="tg-trove-mark" alt="Trove">';
  const tmark = s => s.replace(/\bTrove\b/g, TMARK);

  function line(html, cls, mt = 0) {
    const d = document.createElement('div');
    d.className = 'tg-pl ' + (cls || '');
    d.innerHTML = tmark(html);
    if (mt) d.style.marginTop = mt + 'px';
    pitch.appendChild(d);
    scrollPitch();
    return d;
  }

  /* Flash + scene shake — animate scene, not pitch (avoids clipping shift) */
  function flash(double = false) {
    if (window.HAPTIC) HAPTIC.impact('medium');
    const scene = pitch.closest('.tg-pitch-scene');
    if (!scene) return;
    scene.classList.add('tg-flash');
    if (hasGSAP) {
      gsap.fromTo(scene, { x: -10, rotation: -0.7 },
        { x: 0, rotation: 0, duration: 0.9, ease: 'elastic.out(1, 0.28)', overwrite: true });
      gsap.fromTo(scene, { y: -5 },
        { y: 0, duration: 0.6, ease: 'elastic.out(1, 0.35)', delay: 0.04, overwrite: false });
    }
    setTimeout(() => {
      scene.classList.remove('tg-flash');
      if (double) {
        setTimeout(() => {
          scene.classList.add('tg-flash');
          if (hasGSAP) {
            gsap.fromTo(scene, { x: 7, rotation: 0.5 },
              { x: 0, rotation: 0, duration: 0.75, ease: 'elastic.out(1, 0.35)', overwrite: true });
          }
          setTimeout(() => scene.classList.remove('tg-flash'), 60);
        }, 85);
      }
    }, 60);
  }

  /* GSAP reveal — SplitText + blur from-state + stagger with its own ease */
  function reveal(el, opts = {}) {
    if (!hasGSAP) return Promise.resolve();
    const splitType = opts.type || 'words';
    const split     = new SplitText(el, { type: splitType });
    const targets   = splitType === 'chars' ? split.chars : split.words;
    // Blur words-level by default, skip for chars (too heavy per-char)
    const applyBlur = opts.blur ?? (splitType === 'words');
    const defaultEase = hasCE
      ? (opts.impact ? 'slam' : 'unfurl')
      : (opts.impact ? 'back.out(3)' : 'back.out(2)');

    return new Promise(r =>
      gsap.from(targets, {
        opacity:  0,
        y:        opts.y        ?? 32,
        x:        opts.x        ?? 0,
        scale:    opts.scale    ?? 1,
        rotation: opts.rotation ?? 0,
        ...(applyBlur ? { filter: 'blur(10px)' } : {}),
        duration: opts.duration ?? 0.55,
        ease:     opts.ease     ?? defaultEase,
        stagger:  {
          each: opts.stagger      ?? 0.07,
          from: opts.from         ?? 'start',
          ease: opts.staggerEase  ?? 'power2.inOut',
        },
        onComplete: r,
        clearProps: 'transform,x,y,rotation,scale,filter',
      })
    );
  }

  const scene = pitch.closest('.tg-pitch-scene');

  /* coinTransition(walletEl, targetTextEl)
     Cinematic: slow build from wallet → covers whole screen → breathes →
     graceful arc to land inline beside the word "someone." in targetTextEl.
     The coin then stays permanently as an inline DOM element.             */
  function coinTransition(walletEl, targetTextEl) {
    return new Promise(resolve => {
      if (!hasGSAP || !scene) { resolve(); return; }

      const LAND_W    = 72;
      const SZ        = 96;   // moderate base — keeps upscale factor low at peak

      const sceneRect = scene.getBoundingClientRect();
      const wRect     = walletEl.getBoundingClientRect();

      const landScale  = LAND_W / SZ;
      // Fill ~90% of the narrower dimension — still dramatic, but ~3-4x not 7-8x
      const coverScale = (Math.min(sceneRect.width, sceneRect.height) * 0.9) / SZ;

      const sx = wRect.left - sceneRect.left + wRect.width  / 2 - SZ / 2;
      const sy = wRect.top  - sceneRect.top  + wRect.height / 2 - SZ / 2;
      const cx = sceneRect.width  / 2 - SZ / 2;
      const cy = sceneRect.height / 2 - SZ / 2;

      const coin = document.createElement('img');
      coin.src = './assets/coin.png';
      coin.style.cssText = `position:absolute;left:0;top:0;width:${SZ}px;height:${SZ}px;object-fit:contain;pointer-events:none;z-index:50;will-change:transform;`;
      scene.appendChild(coin);
      gsap.set(coin, { transformPerspective: 600 });

      // Place DOM coin hidden now so it's in the layout; reveal after flying coin lands
      const landed = document.createElement('img');
      landed.src = './assets/coin.png';
      landed.className = 'tg-inline-coin tg-decal--bob';
      landed.style.animationDelay = '-0.8s';
      landed.style.opacity = '0';
      targetTextEl.appendChild(landed);

      const tl = gsap.timeline({
        onComplete: () => {
          coin.remove();
          // Cross-fade: flying coin gone, DOM coin fades in at its natural layout spot
          gsap.to(landed, { opacity: 1, duration: 0.22, ease: 'power1.out' });
          resolve();
        },
      });

      tl
        .set(coin, { x: sx, y: sy, scale: 0.28, rotationY: 0, opacity: 1 })

        // ── APPROACH: surges toward center, spinning ──
        .to(coin, {
          x: cx, y: cy,
          scale: coverScale,
          rotationY: 720,
          duration: 1.85,
          ease: 'power1.in',
        })

        // ── PEAK: brief breathe. Flash IS the "full screen" beat — cheap CSS, not a scaled image ──
        .to(coin, { scale: coverScale * 1.06, rotationY: 720, duration: 0.28, ease: 'sine.inOut' })
        .call(() => {
          scene.classList.add('tg-flash');
          setTimeout(() => scene.classList.remove('tg-flash'), 110);
        })

        // ── RECEDE: lazy target evaluated when tween fires ──
        .to(coin, {
          x: () => {
            const r  = landed.getBoundingClientRect();
            const sr = scene.getBoundingClientRect();
            return r.left - sr.left + r.width / 2 - SZ / 2;
          },
          y: () => {
            const r  = landed.getBoundingClientRect();
            const sr = scene.getBoundingClientRect();
            return r.top - sr.top + r.height / 2 - SZ / 2;
          },
          scale: landScale,
          rotationY: 1440,
          duration: 1.55,
          ease: 'power3.out',
        })

        // ── SETTLE: fade out flying coin, DOM coin fades in via onComplete ──
        .to(coin, { opacity: 0, duration: 0.18, ease: 'power1.in' });
    });
  }

  /* ═══════════════════════════════════════════════════════
     SCORING + ARCHETYPES
  ═══════════════════════════════════════════════════════ */
  const scores = { cartographer: 0, contrarian: 0, architect: 0, operator: 0, storyteller: 0 };
  let moveCount = 0;
  let choiceCount = 0; // user branch choices only — drives progress bar
  function score(wts) {
    const keys = ['cartographer','contrarian','architect','operator','storyteller'];
    const mult = moveCount === 0 ? 1.5 : 1;
    keys.forEach((key, i) => { scores[key] += (wts[i] || 0) * mult; });
    moveCount++;
  }
  function getArchetype() {
    const e = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const top = e[0][1];
    if (top === 0) return 'storyteller';
    const tied = e.filter(([, v]) => v === top);
    return tied.length >= 2 ? 'storyteller' : e[0][0];
  }
  const ARCHETYPES = {
    cartographer: {
      name: 'The Cartographer',
      sub: 'you map before you move',
      desc: 'You don\'t back vibes — you back evidence of thinking. You want to see the model, the moat, and the reasoning behind both. You ask the questions other investors are embarrassed to ask. You\'re not slow. You\'re thorough. And the companies you back feel that difference.',
      together: 'You\'ll want the data room early. We\'ll send it. You\'ll push hard on the flywheel logic — <strong>good, that\'s exactly the right question for Trove.</strong>',
    },
    contrarian: {
      name: 'The Contrarian',
      sub: 'you were early on something everyone else passed on',
      desc: 'You back founders who can\'t be talked out of it, because conviction is the only thing that survives a hard year. You\'ve learned to trust the feeling of "this is weird but right" more than any spreadsheet. Your best investments didn\'t make sense to the room.',
      together: 'You already see it. The question is whether Helen\'s the kind of founder who gets more stubborn under pressure. <strong>She is.</strong>',
    },
    architect: {
      name: 'The Architect',
      sub: 'you think in infrastructure, not products',
      desc: 'You\'re not investing in what Trove is today. You\'re investing in what it makes inevitable — the behavioural layer that sits under hiring, dating, insurance, healthcare. You\'ve backed platforms before and you understand that the moat is the dataset, not the app.',
      together: 'You\'ll want to talk about the API strategy and B2B licensing before anyone else brings it up. <strong>We\'re ready for that conversation.</strong>',
    },
    operator: {
      name: 'The Operator',
      sub: 'you\'ve built something, and it shows',
      desc: 'You read the founder before you read the deck. You know what a person looks like when they\'re building from genuine obsession versus building to exit. You add more than capital — pattern recognition, intros, the three sentences that fix the pitch. Your portfolio companies call you on hard days.',
      together: 'You\'ll probably spot something in Helen\'s approach that she hasn\'t articulated yet. <strong>Tell her. She wants to hear it.</strong>',
    },
    storyteller: {
      name: 'The Storyteller',
      sub: 'you back things people will talk about',
      desc: 'You understand that the best consumer products are also cultural moments — they spread because they mean something. You\'ve backed companies before the market understood them because you could see the narrative before the numbers justified it. Trove is a story about what it means to actually know someone.',
      together: 'You\'ll have opinions on the product voice, the community, the cultural positioning. <strong>Those opinions are valuable. Bring them.</strong>',
    },
  };

  /* ═══════════════════════════════════════════════════════
     BRANCH HELPERS
  ═══════════════════════════════════════════════════════ */

  // Inline decal — attaches to any positioned tg-pl element
  function decal(src, cls = 'tg-decal--bob', opts = {}) {
    const img = document.createElement('img');
    img.src = `./assets/${src}`;
    img.className = `tg-inline-decal ${cls}`;
    img.style.cssText = `
      width: ${opts.w || 52}px; height: auto;
      position: absolute;
      ${opts.right !== undefined ? `right: ${opts.right}` : `left: ${opts.left || '-16px'}`};
      ${opts.top  !== undefined ? `top: ${opts.top}`    : 'top: -8px'};
      opacity: 0; pointer-events: none;
    `;
    if (hasGSAP) {
      gsap.fromTo(img,
        { opacity: 0, y: opts.fromY ?? -20, scale: opts.fromScale ?? 0.5, rotation: opts.fromRot ?? 0 },
        { opacity: 1, y: 0, scale: 1, rotation: opts.toRot ?? 0,
          duration: 0.65, ease: 'elastic.out(1, 0.48)', delay: opts.delay ?? 0.1,
          onComplete: () => img.classList.add(cls) }
      );
    } else { img.style.opacity = '1'; }
    return img;
  }

  function chapter(label) {
    const d = document.createElement('div');
    d.className = 'tg-ch';
    d.textContent = label;
    pitch.appendChild(d);
    return d;
  }

  /* ── Ring wipe chapter transition ─────────────────────────────────────────
     Full-screen colour circle expands → chapter label slams in at peak →
     circle contracts. Returns the DOM chapter label element.              */
  async function ringWipeChapter(label) {
    if (window.HAPTIC) HAPTIC.impact('heavy');

    /* All 4 palette colours cascade in sequence — gold→blue→soft→cream,
       rotated each chapter so the dominant (last/top) colour cycles.     */
    const startIdx  = ringColorIdx++ % 4;
    const ordered   = RING_COLORS.map((_, i) => RING_COLORS[(startIdx + i) % 4]);
    const topColor  = ordered[3]; // the ring left visible at peak
    const textColor = topColor === '#88ABE3' ? '#F9F9F2' : '#222222';

    /* 4 rings appended to scene (position:absolute, clipped inside phone) */
    const rings = ordered.map((c, i) => {
      const r = document.createElement('div');
      r.style.cssText =
        `position:absolute;left:50%;top:50%;` +
        `width:4px;height:4px;margin:-2px 0 0 -2px;` +
        `border-radius:50%;pointer-events:none;background:${c};` +
        `z-index:${200 + i};transform-origin:center center;`;
      scene.appendChild(r);
      return r;
    });

    /* Large bold label, absolutely positioned inside scene */
    const floatLbl = document.createElement('div');
    floatLbl.style.cssText =
      `position:absolute;z-index:210;left:50%;top:50%;` +
      `transform:translate(-50%,-50%);text-align:center;max-width:85%;` +
      `font-family:var(--font-display);font-size:clamp(20px,5.5vw,28px);` +
      `font-weight:700;line-height:1.15;letter-spacing:-0.01em;` +
      `pointer-events:none;opacity:0;color:${textColor};`;
    floatLbl.textContent = label;
    scene.appendChild(floatLbl);

    /* DOM label + background watermark (stay in scroll after wipe) */
    const bgLbl = document.createElement('div');
    bgLbl.className = 'tg-ch-bg-label';
    bgLbl.textContent = label;

    const d = document.createElement('div');
    d.className = 'tg-ch';
    d.textContent = label;
    d.style.position = 'relative';
    d.style.zIndex   = '1';

    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:relative;overflow:hidden;';
    wrap.appendChild(bgLbl);
    wrap.appendChild(d);
    pitch.appendChild(wrap);
    scrollPitch();

    if (hasGSAP) {
      /* Scale relative to scene so rings stay inside the phone */
      const maxSc = Math.ceil(
        Math.hypot(scene.offsetWidth || 320, scene.offsetHeight || 600) / 2
      ) + 6;

      gsap.set(rings, { scale: 0 });
      await new Promise(r =>
        gsap.timeline({ onComplete: r })
          /* Cascade expand: gold first, cream last */
          .to(rings, { scale: maxSc, duration: 0.52, ease: 'power2.inOut',
            stagger: 0.12 })
          /* Label slams in when cream ring is at peak */
          .fromTo(floatLbl,
            { opacity: 0, scale: 0.72 },
            { opacity: 1, scale: 1,   duration: 0.24, ease: 'back.out(3)' }, '-=0.1')
          /* Hold — long enough to actually read the label */
          .to({}, { duration: 0.65 })
          /* Cascade contract: cream first, gold last */
          .to([...rings].reverse(), { scale: 0, duration: 0.42,
            ease: 'power2.inOut', stagger: 0.1 })
          .to(floatLbl, { opacity: 0, duration: 0.22, ease: 'power2.in' }, '<+=0.05')
          .call(() => { rings.forEach(r => r.remove()); floatLbl.remove(); })
          /* Watermark slides in under the chapter divider */
          .fromTo(bgLbl,
            { opacity: 0, x: '-18%' },
            { opacity: 0.06, x: '0%', duration: 0.6, ease: 'power2.out' }, '-=0.2')
      );
    } else {
      rings.forEach(r => r.remove()); floatLbl.remove();
    }
    return d;
  }

  /* ── Orbiting SVG text ring around an element ──────────────────────────── */
  function orbitingTextRing(anchorEl, phrase) {
    phrase = phrase || '\u2736 TROVE \u2736 BEHAVIORAL LAYER \u2736 TROVE \u2736';
    const R  = 88;
    const D  = R * 2 + 28;
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width',   D);
    svg.setAttribute('height',  D);
    svg.setAttribute('viewBox', `0 0 ${D} ${D}`);
    svg.style.cssText =
      `position:absolute;pointer-events:none;z-index:30;opacity:0;` +
      `top:50%;left:50%;transform:translate(-50%,-50%);overflow:visible;`;

    const pid   = `op-${Math.random().toString(36).slice(2, 7)}`;
    const defs  = document.createElementNS(ns, 'defs');
    const circ  = document.createElementNS(ns, 'circle');
    circ.setAttribute('id', pid);
    circ.setAttribute('cx', D / 2); circ.setAttribute('cy', D / 2);
    circ.setAttribute('r', R);      circ.setAttribute('fill', 'none');
    defs.appendChild(circ);
    svg.appendChild(defs);

    const txt = document.createElementNS(ns, 'text');
    txt.style.cssText =
      `font-family:'DM Mono',monospace;font-size:10px;` +
      `fill:rgba(136,171,227,0.65);letter-spacing:1.5px;`;
    const tp = document.createElementNS(ns, 'textPath');
    tp.setAttribute('href', `#${pid}`);
    tp.textContent = phrase;
    txt.appendChild(tp);
    svg.appendChild(txt);

    anchorEl.style.position = 'relative';
    anchorEl.style.overflow = 'visible';
    anchorEl.appendChild(svg);

    if (hasGSAP) {
      gsap.fromTo(svg, { opacity: 0, scale: 0.7 },
        { opacity: 1, scale: 1, duration: 0.55, ease: 'back.out(2)',
          transformOrigin: '50% 50%' });
      gsap.to(svg, { rotation: 360, transformOrigin: '50% 50%',
        duration: 20, ease: 'none', repeat: -1 });
      gsap.to(svg, { opacity: 0, duration: 0.5, ease: 'power2.in', delay: 4.5,
        onComplete: () => svg.remove() });
    } else {
      svg.style.opacity = '1';
      setTimeout(() => svg.remove(), 5000);
    }
    return svg;
  }

  /* ── Single Wrapped-style stat card ──────────────────────────────────────
     Appends to `container`. Returns the card element.                     */
  async function statCard(stat, container) {
    const pal  = STAT_COLORS[statColorIdx % STAT_COLORS.length];
    const dir  = statColorIdx % 2 === 0 ? -1 : 1;   // alternating slam direction L/R
    statColorIdx++;
    const card = document.createElement('div');
    card.className = 'tg-stat-card';
    card.style.cssText = `background:${pal.bg};`;
    card.innerHTML =
      `<div class="tg-stat-n" style="opacity:0;transform:scale(0.1);color:${pal.fg}">${stat.n}</div>` +
      `<div class="tg-stat-l" style="opacity:0;color:${pal.fg}">${stat.l}</div>`;

    if (stat.asset) {
      const img = document.createElement('img');
      img.src = `./assets/${stat.asset}`;
      img.style.cssText =
        'position:absolute;right:18px;top:50%;transform:translateY(-50%);' +
        'width:68px;height:auto;opacity:0;pointer-events:none;';
      card.appendChild(img);
    }
    container.appendChild(card);
    scrollPitch();

    if (hasGSAP) {
      if (window.HAPTIC) HAPTIC.impact('medium');
      const numEl = card.querySelector('.tg-stat-n');
      const lblEl = card.querySelector('.tg-stat-l');
      const imgEl = card.querySelector('img');

      // Slam from alternating corners with tilt
      gsap.fromTo(card,
        { x: dir * 72, y: dir * 16, rotation: dir * 5, scale: 0.78, opacity: 0 },
        { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1,
          duration: 0.48, ease: hasCE ? 'slam' : 'back.out(2.5)',
          clearProps: 'rotation,transform' }
      );

      // Brightness flash on impact
      gsap.to(card, {
        filter: 'brightness(1.22)', duration: 0.12, delay: 0.36,
        ease: 'power2.out', yoyo: true, repeat: 1,
        onComplete: () => { card.style.filter = ''; },
      });

      // Number: ScrambleText if available, else elastic pop
      await new Promise(r => {
        if (hasScrTx) {
          gsap.set(numEl, { opacity: 1, scale: 1 });
          gsap.to(numEl, {
            duration: 0.9, delay: 0.14,
            scrambleText: { text: stat.n, chars: '0123456789%+KMmins/', revealDelay: 0.06, speed: 0.65 },
            ease: 'none', onComplete: r,
          });
        } else {
          gsap.to(numEl, { opacity: 1, scale: 1, duration: 0.62,
            ease: 'elastic.out(1, 0.38)', delay: 0.14, onComplete: r });
        }
      });

      // Label slides up
      gsap.fromTo(lblEl,
        { opacity: 0, y: 10 },
        { opacity: 0.84, y: 0, duration: 0.36, ease: 'power3.out' }
      );

      // Image: full-rotation explosive entrance
      if (imgEl) {
        gsap.fromTo(imgEl,
          { opacity: 0, scale: 0.04, rotation: dir * -400, x: dir * 48 },
          { opacity: 1, scale: 1,    rotation: dir * 6,    x: 0,
            duration: 1.1, ease: 'elastic.out(1, 0.38)', delay: 0.2,
            onComplete: () => {
              // Settle into a slow bob after explosive entrance
              gsap.to(imgEl, { y: -6, rotation: dir * 4, duration: 1.8,
                ease: 'sine.inOut', yoyo: true, repeat: -1 });
            },
          }
        );
      }

      // Mini confetti burst from card center after it lands
      if (window.confetti) {
        const rect = card.getBoundingClientRect();
        const ox = (rect.left + rect.width  * 0.5) / window.innerWidth;
        const oy = (rect.top  + rect.height * 0.5) / window.innerHeight;
        setTimeout(() => confetti({
          particleCount: 22, spread: 60, origin: { x: ox, y: oy },
          colors: [pal.bg, pal.fg, '#FFFBCD', '#88ABE3'],
          scalar: 0.65, ticks: 70,
        }), 380);
      }
    } else {
      card.querySelector('.tg-stat-n').style.cssText = `opacity:1;transform:none;color:${pal.fg}`;
      card.querySelector('.tg-stat-l').style.cssText = `opacity:0.84;color:${pal.fg}`;
    }
    return card;
  }

  /* ── Ambient background floaters ─────────────────────────────────────── */
  function spawnAmbientFloaters() {
    const srcs = ['flower.png','babystar.png','apple.png','starhehe.png'];
    srcs.forEach((src, i) => {
      const img  = document.createElement('img');
      img.src    = `./assets/${src}`;
      const pct  = 6 + i * 22 + Math.random() * 10;
      const sz   = 16 + Math.random() * 10;
      img.style.cssText =
        `position:absolute;left:${pct}%;top:${55 + i * 90}px;` +
        `width:${sz}px;height:auto;opacity:0;pointer-events:none;` +
        `z-index:1;will-change:transform;`;
      pitch.appendChild(img);
      if (hasGSAP) {
        gsap.to(img, { opacity: 0.10 + Math.random() * 0.09,
          duration: 1.4, delay: i * 0.25, ease: 'power2.out' });
        gsap.to(img, {
          y: -(32 + Math.random() * 48),
          rotation: (Math.random() - 0.5) * 18,
          duration: 2.6 + Math.random() * 2.8,
          ease: 'sine.inOut', yoyo: true, repeat: -1,
          delay: Math.random() * 2.5,
        });
      }
      setTimeout(() => {
        if (hasGSAP) gsap.to(img, { opacity: 0, duration: 1.5,
          onComplete: () => img.remove() });
        else img.remove();
      }, 28000);
    });
  }

  // Type C — pull quote: shimmer border + ScrambleText reveal
  async function pqReveal(text, assetSrc = null, assetOpts = {}, assetCls = 'tg-decal--bob') {
    await w(300);
    const shimmer = document.createElement('div');
    shimmer.className = 'tg-pl tg-pq-shimmer';
    shimmer.style.opacity = '0';
    const d = document.createElement('blockquote');
    d.className = 'tg-pq-inner';
    shimmer.appendChild(d);
    pitch.appendChild(shimmer);
    scrollPitch();

    if (hasGSAP && hasScrTx) {
      // Slide shimmer wrapper in, then ScrambleText the quote
      const textOnly = text.replace(/<[^>]*>/g, '');
      await new Promise(r => gsap.fromTo(shimmer,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.38, ease: 'power3.out', onComplete: r }
      ));
      await new Promise(r => gsap.to(d, {
        duration: 1.1,
        scrambleText: { text: textOnly, chars: '!<>-_\\/[]{}—=+*^?#░▒▓',
          revealDelay: 0.08, speed: 0.52 },
        ease: 'none', onComplete: r,
      }));
      d.innerHTML = tmark(text); // restore any HTML markup
    } else if (hasGSAP) {
      d.innerHTML = tmark(text);
      await new Promise(r => gsap.fromTo(shimmer,
        { opacity: 0, y: 20, filter: 'blur(5px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6,
          ease: 'power3.out', clearProps: 'filter', onComplete: r }
      ));
    } else {
      d.innerHTML = tmark(text);
      shimmer.style.opacity = '1';
    }

    if (assetSrc) {
      shimmer.style.position = 'relative'; shimmer.style.overflow = 'visible';
      shimmer.appendChild(decal(assetSrc, assetCls, assetOpts));
    }
    await w(800);
    return shimmer;
  }

  // Type E — Wrapped-style full-bleed stat cards, one per stat
  async function statsBlockReveal(stats) {
    const wrap = document.createElement('div');
    wrap.className = 'tg-pl';
    pitch.appendChild(wrap);
    for (const stat of stats) {
      await statCard(stat, wrap);
      await w(160);
    }
    return wrap;
  }

  // Type F — reveal list, word-by-word per item
  function rlist(items) {
    const d = document.createElement('div');
    d.className = 'tg-pl tg-rlist';
    items.forEach((item, i) => {
      const row = document.createElement('div');
      row.className = 'tg-ritem';
      row.dataset.m = item.m || '→';
      row.innerHTML = item.t;
      row.style.animationDelay = '0s'; // GSAP drives, not CSS
      d.appendChild(row);
    });
    pitch.appendChild(d);
    scrollPitch();
    return d;
  }
  async function rlistReveal(items) {
    const d = rlist(items);
    if (!hasGSAP) return d;
    const rows = d.querySelectorAll('.tg-ritem');
    for (const row of rows) {
      row.style.opacity = '1'; row.style.transform = 'none';
      const split = new SplitText(row, { type: 'words' });
      await new Promise(r => gsap.from(split.words, {
        opacity: 0, x: -12, filter: 'blur(4px)',
        duration: 0.38, ease: hasCE ? 'unfurl' : 'power2.out',
        stagger: 0.04, clearProps: 'filter,x', onComplete: r,
      }));
      await w(180);
    }
    return d;
  }

  function askGrid(cells) {
    const d = document.createElement('div');
    d.className = 'tg-pl tg-ask-grid';
    d.innerHTML = cells.map(c => `
      <div class="tg-ask-cell">
        <div class="tg-ask-lbl">${c.label}</div>
        <div class="tg-ask-val">${c.value}</div>
        ${c.sub ? `<div class="tg-ask-sub">${c.sub}</div>` : ''}
      </div>`).join('');
    pitch.appendChild(d);
    scrollPitch();
    return d;
  }

  function branchChoices(choices) {
    return new Promise(resolve => {
      const wrap = document.createElement('div');
      wrap.className = 'tg-pl tg-pitch-choices';
      wrap.innerHTML = choices.map((c, i) =>
        `<button class="tg-pitch-choice" onclick="window._bc(${i})">${c}</button>`
      ).join('');
      pitch.appendChild(wrap);
      scrollPitch();
      if (hasGSAP) {
        gsap.from([...wrap.querySelectorAll('.tg-pitch-choice')], {
          opacity: 0,
          x: (i) => i % 2 === 0 ? 48 : -28,
          scale: 0.88, filter: 'blur(4px)',
          duration: 0.52, ease: hasCE ? 'yank' : 'back.out(2)',
          stagger: { each: 0.09, ease: 'power2.inOut' },
          clearProps: 'filter,x,scale',
        });
      }
      window._bc = idx => {
        window._bc = () => {};
        [...wrap.querySelectorAll('.tg-pitch-choice')].forEach((b, i) => {
          b.disabled = true;
          if (i !== idx) disintegrate(b);
        });
        const sel = wrap.querySelectorAll('.tg-pitch-choice')[idx];
        sel.classList.add('selected');
        if (hasGSAP) {
          gsap.to(sel, { scale: 1.06, duration: 0.12, ease: 'power2.out',
            onComplete: () => gsap.to(sel, { scale: 1, duration: 0.9, ease: 'elastic.out(1, 0.38)' }) });
        }
        // Confetti burst from button position
        if (window.confetti) {
          const br = sel.getBoundingClientRect();
          confetti({
            particleCount: 55, spread: 72,
            origin: {
              x: (br.left + br.width  / 2) / window.innerWidth,
              y: (br.top  + br.height / 2) / window.innerHeight,
            },
            colors: ['#DBD59C','#88ABE3','#C3D9FF','#FFFBCD','#F9F9F2'],
            scalar: 0.85,
          });
        }
        // Brief ScrambleText on selected button text
        if (hasGSAP && hasScrTx) {
          const orig = sel.textContent;
          gsap.to(sel, { duration: 0.52,
            scrambleText: { text: orig, chars: '!<>-_\\/[]{}░▒▓', speed: 0.65 } });
        }
        // 3 branch choices per playthrough: 25%→50%→75%. sRevealArchetype sets 100%.
        choiceCount++;
        window.tgAPI.setProgress(25 + Math.min(choiceCount, 3) * 25);
        setTimeout(() => resolve(idx), 600);
      };
    });
  }

  // Canvas card generator — draws a shareable PNG
  function wrapTextCanvas(ctx, text, cx, y, maxW, lh) {
    const words = text.split(' ');
    let line = '', curY = y;
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, cx, curY);
        line = word; curY += lh;
      } else { line = test; }
    }
    if (line) ctx.fillText(line, cx, curY);
    return curY + lh;
  }

  async function generateShareCard(arch, id) {
    const W = 900, H = 1200;
    const cvs = document.createElement('canvas');
    cvs.width = W; cvs.height = H;
    const ctx = cvs.getContext('2d');

    const ARCH_COLORS = {
      cartographer: '#DBD59C', contrarian: '#88ABE3',
      architect: '#C3D9FF',   operator:   '#FFFBCD', storyteller: '#DBD59C',
    };
    const ARCH_ASSETS = {
      cartographer: 'camera.png',   contrarian: 'boomerang.png',
      architect:    'house.png',    operator:   'watch.png', storyteller: 'mic.png',
    };

    const accentColor = ARCH_COLORS[id] || '#DBD59C';
    const headerH = 460;

    // White base
    ctx.fillStyle = '#F9F9F2';
    ctx.fillRect(0, 0, W, H);

    // Coloured header block (Wrapped-style)
    ctx.fillStyle = accentColor;
    ctx.fillRect(0, 0, W, headerH);

    // Subtle large circle in header
    ctx.fillStyle = 'rgba(34,34,34,0.05)';
    ctx.beginPath(); ctx.arc(W / 2, headerH / 2, 280, 0, Math.PI * 2); ctx.fill();

    // Scattered decorative dots in header
    ctx.fillStyle = 'rgba(34,34,34,0.08)';
    [[80,55,22],[830,38,16],[145,390,20],[755,330,14],
     [455,28,18],[685,430,10],[115,205,12],[805,195,18],
     [345,415,14],[610,75,10]].forEach(([x,y,r]) => {
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    });

    // Sparkle dots
    ctx.fillStyle = 'rgba(34,34,34,0.22)';
    [[145,348,5],[762,130,4],[498,445,6],[198,108,3.5],[708,395,4.5]].forEach(([x,y,r]) => {
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    });

    // Character asset — centred in the coloured header
    const assetSrc = ARCH_ASSETS[id] || 'investor.png';
    await new Promise(res => {
      const img = new Image();
      img.onload = () => {
        const sz = 230;
        ctx.drawImage(img, W / 2 - sz / 2, headerH / 2 - sz / 2, sz, sz);
        res();
      };
      img.onerror = res;
      img.src = `./assets/${assetSrc}`;
    });

    // Ensure fonts ready
    try {
      await Promise.all([
        document.fonts.load('700 68px "Playfair Display"'),
        document.fonts.load('400 16px "DM Mono"'),
        document.fonts.load('500 22px "Syne"'),
      ]);
    } catch(e) {}

    ctx.textAlign = 'center'; ctx.textBaseline = 'top';

    // Tag — spaced letters
    ctx.fillStyle = '#88ABE3';
    ctx.font = '400 13px "DM Mono"';
    const tagStr = 'YOUR INVESTOR ARCHETYPE';
    let tx = W / 2 - ctx.measureText(tagStr).width / 2 - tagStr.length * 1.5;
    tagStr.split('').forEach(ch => { ctx.fillText(ch, tx, headerH + 26); tx += ctx.measureText(ch).width + 3; });

    // Name
    ctx.fillStyle = '#222222';
    ctx.font = '700 68px "Playfair Display"';
    ctx.fillText(arch.name, W / 2, headerH + 58);

    // Blue underline under name
    const nameW = ctx.measureText(arch.name).width;
    ctx.strokeStyle = '#88ABE3'; ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(W / 2 - nameW / 2, headerH + 142);
    ctx.lineTo(W / 2 + nameW / 2, headerH + 142);
    ctx.stroke();

    // Sub
    ctx.fillStyle = 'rgba(34,34,34,0.42)';
    ctx.font = '400 18px "DM Mono"';
    ctx.fillText(arch.sub, W / 2, headerH + 158);

    // Divider + gold accent
    ctx.strokeStyle = 'rgba(34,34,34,0.1)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(80, headerH + 206); ctx.lineTo(W - 80, headerH + 206); ctx.stroke();
    ctx.strokeStyle = '#DBD59C'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(W / 2 - 42, headerH + 210); ctx.lineTo(W / 2 + 42, headerH + 210); ctx.stroke();

    // Description
    ctx.fillStyle = 'rgba(34,34,34,0.72)';
    ctx.font = '500 22px "Syne"';
    const descBottom = wrapTextCanvas(ctx, arch.desc, W / 2, headerH + 236, W - 160, 34);

    // Together line
    const togetherText = arch.together.replace(/<\/?strong>/g, '');
    ctx.fillStyle = 'rgba(34,34,34,0.45)';
    ctx.font = '400 16px "DM Mono"';
    wrapTextCanvas(ctx, togetherText, W / 2, Math.max(descBottom + 22, headerH + 580), W - 200, 26);

    // Corner brackets
    ctx.strokeStyle = 'rgba(34,34,34,0.14)'; ctx.lineWidth = 1.5;
    const cm = 38;
    [[24,24,1,1],[W-24,24,-1,1],[24,H-24,1,-1],[W-24,H-24,-1,-1]].forEach(([x,y,sx,sy]) => {
      ctx.beginPath();
      ctx.moveTo(x, y); ctx.lineTo(x + cm * sx, y);
      ctx.moveTo(x, y); ctx.lineTo(x, y + cm * sy);
      ctx.stroke();
    });

    // trove.garden
    ctx.fillStyle = '#DBD59C';
    ctx.font = '400 16px "DM Mono"';
    ctx.fillText('trove.garden', W / 2, H - 48);

    return cvs;
  }

  function contBtn(label) {
    return new Promise(resolve => {
      const btn = document.createElement('button');
      btn.className = 'tg-pl tg-cont';
      btn.textContent = label;
      btn.onclick = () => { btn.disabled = true; disintegrate(btn); setTimeout(resolve, 350); };
      pitch.appendChild(btn);
      scrollPitch();
      if (hasGSAP) gsap.from(btn, { opacity: 0, y: 14, duration: 0.42, ease: 'power3.out' });
    });
  }

  /* ═══════════════════════════════════════════════════════
     BRANCH SCENES
  ═══════════════════════════════════════════════════════ */

  async function sBranch0() {
    await w(900); line('', 'tg-pl', 16);
    await ringWipeChapter('The Question');
    await w(200);
    await reveal(line('So.', 'tg-pl--impact'), {
      type: 'chars', y: 0,
      scale: () => gsap.utils.random(0.1, 0.5),
      rotation: () => gsap.utils.random(-20, 20),
      stagger: 0.06, from: 'center', duration: 0.62, ease: 'back.out(4)',
    });
    await w(400);
    const questionEl = line('What if the data existed? Not what they said about themselves — what they actually did when it mattered.', 'tg-pl--med');
    await reveal(questionEl, { y: 18, stagger: 0.05, duration: 0.44, blur: true, ease: hasCE ? 'unfurl' : 'power3.out' });
    questionEl.style.position = 'relative'; questionEl.style.overflow = 'visible';
    questionEl.appendChild(decal('id.png', 'tg-decal--bob', { right: '-20px', top: '0', w: 48, delay: 0.3 }));
    await w(300);
    const idx = await branchChoices([
      "That data doesn't exist. Show me why you think it can.",
      "I've seen a hundred behavioral tools. What makes this one different.",
      "I want to know who's building it before I read anything else.",
    ]);
    score([[1,2,0,0,1],[0,0,2,2,0],[0,1,0,3,0]][idx]);
    if (idx === 0) await sA1_curious();
    else if (idx === 1) await sB1_seen();
    else await sC1_founder();
  }

  // ── BRANCH A ──────────────────────────────────────────
  async function sA1_curious() {
    await w(900); line('', 'tg-pl', 16);
    await ringWipeChapter('The Signal Problem');
    await w(200);
    // Type B — narration
    await reveal(line('Every important decision about people runs on one type of data:', 'tg-pl--med'), {
      y: 16, stagger: 0.04, duration: 0.42, blur: true, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(200);
    // Type A — statement
    flash();
    await reveal(line('what they say about themselves.', 'tg-pl--big'), {
      type: 'chars', y: 0,
      scale: () => gsap.utils.random(0.1, 0.5),
      rotation: () => gsap.utils.random(-15, 15),
      stagger: 0.05, from: 'center', duration: 0.65, ease: hasCE ? 'slam' : 'back.out(3)',
    });
    await w(600);
    // Type F — rlist
    await rlistReveal([
      { t: 'Resumes. LinkedIn. Dating profiles. Self-reported.' },
      { t: 'Reference checks. Personality tests. 360s. Self-reported.' },
      { t: 'And now? AI can rewrite any of those in thirty seconds. Completely unverifiable.' },
    ]);
    await w(400);
    // Type D — the landing line
    const deadEl = line('Self-reporting isn\'t just noisy. It\'s <span class="tg-dead-word">dead.</span>', 'tg-pl--med tg-pl--italic', 8);
    await reveal(deadEl, { y: 14, stagger: 0.05, duration: 0.42, ease: hasCE ? 'unfurl' : 'power3.out' });
    // Heartbreak anchors right beside the word "dead."
    const deadWord = deadEl.querySelector('.tg-dead-word');
    if (deadWord) {
      deadWord.style.position = 'relative';
      deadWord.style.overflow = 'visible';
      deadWord.appendChild(decal('heartbreak.png', 'tg-decal--lubdub', { left: 'calc(100% + 4px)', top: '-6px', w: 52, fromY: -30, delay: 0.2 }));
    }
    await w(500);
    await reveal(line('40–80% of applicants now use AI to write about themselves. $8.8 trillion lost annually to employee disengagement — the cost of not actually knowing the people you hire.', 'tg-pl--dim'), {
      y: 10, stagger: 0.03, duration: 0.38, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(350);
    const idx = await branchChoices([
      "Okay. So what's the new signal?",
      "People have tried to solve this before. Why does this attempt survive contact with the real world?",
    ]);
    score([[2,0,0,1,1],[1,2,1,0,0]][idx]);
    if (idx === 0) await sA2_soWhat();
    else await sA2_beenTried();
  }

  async function sA2_soWhat() {
    await w(900); line('', 'tg-pl', 16);
    await ringWipeChapter('The New Signal');
    await w(200);
    // Type B — setup
    await reveal(line('You stop asking people who they are.', 'tg-pl--med'), {
      y: 16, stagger: 0.05, duration: 0.42, blur: true, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(600); // longer pause — next line is the answer
    flash();
    // Type D — the answer, word-by-word from center
    const watchEl = line('You watch them make decisions.', 'tg-pl--big', 8);
    if (hasGSAP) {
      const split = new SplitText(watchEl, { type: 'words' });
      await new Promise(r => gsap.from(split.words, {
        opacity: 0, scale: 0.7,
        duration: 0.5, ease: hasCE ? 'snap' : 'back.out(3)',
        stagger: { each: 0.12, from: 'center' },
        clearProps: 'transform,scale', onComplete: r,
      }));
    }
    // Camera beside "watch"
    watchEl.style.position = 'relative'; watchEl.style.overflow = 'visible';
    watchEl.appendChild(decal('camera.png', 'tg-decal--bob', { right: '-22px', top: '0', w: 46, delay: 0.2 }));
    await w(700);
    // Type B — narration
    const tanglesEl = line('Trove builds tangles — interactive, story-based scenarios that put you inside emotionally real moments. A first date. A workplace crisis. A creative standoff at midnight. You make choices. Real ones, under actual pressure.', 'tg-pl--med');
    await reveal(tanglesEl, {
      y: 14, stagger: 0.035, duration: 0.4, blur: true, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    tanglesEl.style.position = 'relative'; tanglesEl.style.overflow = 'visible';
    tanglesEl.appendChild(decal('gaming.png', 'tg-decal--bob', { right: '-26px', top: '-8px', w: 50, fromY: -25, delay: 0.2 }));
    await w(350);
    // Type C — pull quote
    await pqReveal('The scenario is the instrument. The choice is the data.');
    await reveal(line('Not "how would you handle conflict?" — a conflict. One you\'re actually inside. The way you move through it: what you push on, what you deflect, how long you hold ambiguity. Impossible to fake consistently across twelve different contexts.', 'tg-pl--dim'), {
      y: 10, stagger: 0.03, duration: 0.38, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(350);
    const idx = await branchChoices([
      "Has anyone actually played this? What did the data look like?",
      "What stops someone from building the same thing in six months?",
    ]);
    score([[2,0,0,1,1],[1,0,3,0,0]][idx]);
    if (idx === 0) await sShared_traction();
    else await sShared_moat();
  }

  async function sA2_beenTried() {
    await w(900); line('', 'tg-pl', 16);
    await ringWipeChapter('Why This Survives');
    await w(200);
    await reveal(line('Every previous attempt made the same mistake.', 'tg-pl--med'), {
      y: 16, stagger: 0.05, duration: 0.42, blur: true, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(350);
    await reveal(line('They still asked people to describe their behaviour. Personality tests — self-reported. 360 reviews — observer-reported. Assessment centres — performed. All gameable. All dead in an AI world.', 'tg-pl--dim'), {
      y: 10, stagger: 0.03, duration: 0.38, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(400);
    // Type A — statement
    flash();
    await reveal(line('Trove\'s fundamental move: you never ask.', 'tg-pl--big'), {
      type: 'chars', y: 0,
      scale: () => gsap.utils.random(0.1, 0.5),
      rotation: () => gsap.utils.random(-15, 15),
      stagger: 0.05, from: 'center', duration: 0.65, ease: hasCE ? 'slam' : 'back.out(3)',
    });
    await w(600);
    await reveal(line('You build a scenario. You watch what someone does. The measurement is invisible — they\'re too absorbed in the story to perform.', 'tg-pl--med'), {
      y: 14, stagger: 0.04, duration: 0.4, blur: true, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(350);
    // Type C — pull quote + phone decal
    await pqReveal(
      '"This game read me for absolute filth." — a Valentine\'s Day player. Completely unprompted.',
      'phone.png', { right: '-20px', top: '-4px', w: 42, delay: 0.5 }
    );
    const idx = await branchChoices([
      "Show me the numbers from early usage.",
      "I want to understand the moat. What compounds here?",
    ]);
    score([[2,0,0,1,1],[1,0,3,0,0]][idx]);
    if (idx === 0) await sShared_traction();
    else await sShared_moat();
  }

  // ── BRANCH B ──────────────────────────────────────────
  async function sB1_seen() {
    await w(900); line('', 'tg-pl', 16);
    await ringWipeChapter('Not a Tool. A Layer.');
    await w(200);
    await reveal(line('Most behavioural tools sit on top of existing workflows. You administer them. Someone takes the test. You get a report.', 'tg-pl--med'), {
      y: 14, stagger: 0.038, duration: 0.4, blur: true, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(350);
    // Type A — statement
    flash();
    const infraEl = line('Trove is infrastructure.', 'tg-pl--big');
    await reveal(infraEl, {
      type: 'chars', y: 0,
      scale: () => gsap.utils.random(0.1, 0.5),
      rotation: () => gsap.utils.random(-15, 15),
      stagger: 0.05, from: 'center', duration: 0.65, ease: hasCE ? 'slam' : 'back.out(3)',
    });
    infraEl.style.position = 'relative'; infraEl.style.overflow = 'visible';
    infraEl.appendChild(decal('house.png', 'tg-decal--bob', { right: '-26px', top: '-14px', w: 54, fromY: -30, delay: 0.3 }));
    await w(600);
    await reveal(line('Consumers play interactive stories — scenarios that feel like games. Underneath, a behavioural science engine builds a profile they own. When they apply for a job, go on a date, or authorize a landlord to screen them, they share that profile. The platform pays to read it.', 'tg-pl--med'), {
      y: 12, stagger: 0.032, duration: 0.38, blur: true, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(350);
    await pqReveal('Think Duolingo on the consumer side. Think Plaid on the B2B side. Behavioral data is the asset class.');
    await reveal(line('The moat is the dataset. Every play makes the models sharper. Sharper models make the profiles more accurate. More accurate profiles make the B2B product worth more. That loop doesn\'t have a ceiling.', 'tg-pl--dim'), {
      y: 10, stagger: 0.028, duration: 0.38, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(350);
    const idx = await branchChoices([
      "Walk me through the B2B licensing model specifically.",
      "Who owns the data? That's usually where these models break down.",
      "Show me proof the consumer side actually works first.",
    ]);
    score([[0,0,3,1,0],[1,0,2,1,0],[2,0,0,1,1]][idx]);
    if (idx === 0) await sB2_b2b();
    else if (idx === 1) await sB2_dataset();
    else await sShared_traction();
  }

  async function sB2_b2b() {
    await w(900); line('', 'tg-pl', 16);
    await ringWipeChapter('The B2B Model');
    await w(200);
    await reveal(line('Four companies reached out after the Valentine\'s Day campaign. None of them were pitched. They played the consumer product and saw the enterprise application themselves.', 'tg-pl--med'), {
      y: 14, stagger: 0.036, duration: 0.4, blur: true, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(350);
    askGrid([
      { label: 'Consumer',   value: 'Free → Premium', sub: 'Users build profiles they own across every tangle they play' },
      { label: 'Enterprise', value: '"Sign in with Trove"', sub: 'Platforms pay for authorized behavioural signal. Like Plaid for personality.' },
    ]);
    await w(500);
    await reveal(line('Hiring, dating, insurance, healthcare — every high-stakes people decision currently runs on self-report. Trove becomes the API layer that replaces it. The user authorizes the share. The platform pays. The data stays the user\'s.', 'tg-pl--dim'), {
      y: 10, stagger: 0.028, duration: 0.38, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(350);
    const idx = await branchChoices([
      "What does early consumer traction look like?",
      "I want to hear the ask.",
    ]);
    score([[2,0,0,1,1],[1,0,1,1,0]][idx]);
    if (idx === 0) await sShared_traction();
    else await sAsk();
  }

  async function sB2_dataset() {
    await w(900); line('', 'tg-pl', 16);
    await ringWipeChapter('Who Owns the Data');
    await w(200);
    flash();
    // Type A — statement, id.png pops in
    const userEl = line('The user does. Always.', 'tg-pl--big');
    await reveal(userEl, {
      type: 'chars', y: 0,
      scale: () => gsap.utils.random(0.1, 0.5),
      rotation: () => gsap.utils.random(-15, 15),
      stagger: 0.05, from: 'center', duration: 0.65, ease: hasCE ? 'slam' : 'back.out(3)',
    });
    userEl.style.position = 'relative'; userEl.style.overflow = 'visible';
    userEl.appendChild(decal('id.png', 'tg-decal--bob', { right: '-22px', top: '0', w: 48, delay: 0.2 }));
    await w(600);
    await reveal(line('This isn\'t a privacy policy nicety — it\'s the core of the business model. Trove profiles are assets users accumulate and choose to share. You authorize what gets seen and to whom. You can revoke it.', 'tg-pl--med'), {
      y: 14, stagger: 0.036, duration: 0.4, blur: true, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(350);
    await reveal(line('That consent architecture is what makes the B2B product valuable. An enterprise buyer is getting a signal that the person chose to share with them. That\'s a different conversation than a background check or a scraped LinkedIn.', 'tg-pl--dim'), {
      y: 10, stagger: 0.028, duration: 0.38, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(350);
    await pqReveal('The user\'s willingness to share their Trove profile is itself a behavioural signal. It tells you something about them before you\'ve even looked at the data.');
    const idx = await branchChoices([
      "Show me the early consumer numbers. Does this actually work?",
      "Tell me more about how the dataset compounds.",
    ]);
    score([[2,0,0,1,1],[1,0,3,0,0]][idx]);
    if (idx === 0) await sShared_traction();
    else await sShared_moat();
  }

  // ── BRANCH C ──────────────────────────────────────────
  async function sC1_founder() {
    await w(900); line('', 'tg-pl', 16);
    await ringWipeChapter('Helen Huang');
    await w(200);
    // Credentials with mic decal
    const credEl = line('Second-time founder. Former PM at Microsoft and Zynga. Bootstrapped a profitable edtech startup to seven figures. Forbes 30 Under 30.', 'tg-pl--med');
    await reveal(credEl, { y: 14, stagger: 0.033, duration: 0.4, blur: true, ease: hasCE ? 'unfurl' : 'power3.out' });
    credEl.style.position = 'relative'; credEl.style.overflow = 'visible';
    credEl.appendChild(decal('mic.png', 'tg-decal--bob', { right: '-22px', top: '0', w: 48, delay: 0.4 }));
    await w(400);
    // Type B — setup for the pivot
    await reveal(line('She didn\'t start Trove because it was a good market.', 'tg-pl--med tg-pl--italic'), {
      y: 14, stagger: 0.05, duration: 0.44, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(500); // hold — next line is the answer
    flash();
    // Type A — the answer
    const livedEl = line('She started it because she lived the problem.', 'tg-pl--big');
    await reveal(livedEl, {
      type: 'chars', y: 0,
      scale: () => gsap.utils.random(0.1, 0.5),
      rotation: () => gsap.utils.random(-15, 15),
      stagger: 0.05, from: 'center', duration: 0.65, ease: hasCE ? 'slam' : 'back.out(3)',
    });
    livedEl.style.position = 'relative'; livedEl.style.overflow = 'visible';
    livedEl.appendChild(decal('heartbreak.png', 'tg-decal--bob', { right: '-26px', top: '-4px', w: 50, fromY: -20, delay: 0.4 }));
    await w(400);
    // Type C — the quote that proves it
    await pqReveal(
      '"You\'re working on something important, you know? More importantly, you are doing it the right way." — unsolicited message from a player after launch.',
      'babystar.png', { right: '-20px', top: '-8px', w: 38, delay: 0.5 }
    );
    // The 30K context
    await reveal(line('She also built a 30,000-person tech audience before she needed it. That\'s not a vanity metric. That\'s a launch list.', 'tg-pl--dim'), {
      y: 10, stagger: 0.03, duration: 0.38, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(600);
    const idx = await branchChoices([
      "What does she know that nobody else in this space has figured out?",
      "I want to see what she's shipped. Show me the early numbers.",
    ]);
    score([[0,2,0,2,0],[2,0,0,1,1]][idx]);
    if (idx === 0) await sC2_conviction();
    else await sShared_traction();
  }

  async function sC2_conviction() {
    await w(900); line('', 'tg-pl', 16);
    await ringWipeChapter('The Insight');
    await w(200);
    await reveal(line('Everyone else trying to solve the "know people better" problem is building better questionnaires.', 'tg-pl--med'), {
      y: 14, stagger: 0.038, duration: 0.42, blur: true, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(350);
    flash();
    // Type A — statement
    await reveal(line('Helen\'s insight is that the questionnaire is the problem.', 'tg-pl--big'), {
      type: 'chars', y: 0,
      scale: () => gsap.utils.random(0.1, 0.5),
      rotation: () => gsap.utils.random(-15, 15),
      stagger: 0.05, from: 'center', duration: 0.65, ease: hasCE ? 'slam' : 'back.out(3)',
    });
    await w(600);
    await reveal(line('Not the form it takes — the entire model of asking people to describe themselves. The only behavioural data that isn\'t gameable is data captured when the person is too absorbed in something else to perform.', 'tg-pl--med'), {
      y: 12, stagger: 0.034, duration: 0.4, blur: true, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(350);
    await pqReveal('"It felt so deeply intimate from the beginning. Terrifying. Well done." — Valentine\'s Day player.');
    const idx = await branchChoices([
      "Show me what the first real launch looked like.",
      "What makes this defensible long-term?",
    ]);
    score([[2,0,0,1,1],[1,0,3,0,0]][idx]);
    if (idx === 0) await sShared_traction();
    else await sShared_moat();
  }

  // ── SHARED DEEP NODES ─────────────────────────────────
  async function sShared_traction() {
    await w(900); line('', 'tg-pl', 16);
    chapter("Valentine's Day. $0 Spend.");
    await w(200);
    flash(true);
    // Type A — statement
    const oneCampaignEl = line('One campaign.', 'tg-pl--big', 8);
    await reveal(oneCampaignEl, {
      type: 'chars', from: 'center', stagger: 0.06, duration: 0.6, ease: hasCE ? 'slam' : 'back.out(3)',
    });
    oneCampaignEl.style.position = 'relative'; oneCampaignEl.style.overflow = 'visible';
    oneCampaignEl.appendChild(decal('icecream.png', 'tg-decal--bob', { right: '-28px', top: '-10px', w: 46, fromY: -30, delay: 0.2 }));
    await w(300);
    await reveal(line('500 emails. No ads. No paid influencers. Nothing.', 'tg-pl--med'), {
      y: 14, stagger: 0.045, duration: 0.42, blur: true, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(350);
    const viralEl = line('8× organic amplification. People shared it because they wanted their friends to see their own results.', 'tg-pl--med');
    await reveal(viralEl, {
      y: 14, stagger: 0.04, duration: 0.42, blur: true, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    viralEl.style.position = 'relative'; viralEl.style.overflow = 'visible';
    viralEl.appendChild(decal('banana.png', 'tg-decal--bob', { right: '-26px', top: '-6px', w: 42, fromY: -28, delay: 0.15 }));
    await w(350);
    // Type E — stats with stagger
    const statsEl = await statsBlockReveal([
      { n: '78%',   l: 'returned day 3 — zero push notifications', asset: 'boomerand.png' },
      { n: '7 min', l: 'median session length',                    asset: 'watch.png'     },
      { n: '24K+',  l: 'behavioural data points, 2,100+ players',  asset: 'id.png'        },
      { n: '4',     l: 'unsolicited B2B inquiries — none pitched',  asset: 'waller.png'   },
    ]);
    // babystar pops in top-right after stats land
    statsEl.style.position = 'relative'; statsEl.style.overflow = 'visible';
    statsEl.appendChild(decal('babystar.png', 'tg-decal--bob', { right: '-18px', top: '-18px', w: 40, delay: 0.2 }));
    await w(500);
    // The human moment — therapist quote
    await pqReveal(
      '"Show it to my therapist. This is literally going to be the topic of our next session." — player, 4:44am',
      'phone.png', { right: '-20px', top: '-4px', w: 44, delay: 0.5 }
    );
    const discordEl = line('When the campaign ended, 60 complete strangers opted into a Discord to play the next one together. Nobody asked them to.', 'tg-pl--dim');
    await reveal(discordEl, {
      y: 10, stagger: 0.028, duration: 0.38, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    discordEl.style.position = 'relative'; discordEl.style.overflow = 'visible';
    discordEl.appendChild(decal('bubblublower.png', 'tg-decal--bob', { right: '-24px', top: '-8px', w: 44, fromY: -22, delay: 0.2 }));
    await w(400);
    // THE thesis line — needs the most air
    await pqReveal('That\'s not a retention metric. That\'s people who want to keep being seen.');

    // Fish swims the full pitch width — lives in scroll content, scrolls away naturally
    {
      // Wrapper: absolute in pitch (scroll content), handles X + flip
      const fishWrap = document.createElement('div');
      const fishImg  = document.createElement('img');
      fishImg.src = './assets/fish.png';
      fishImg.style.cssText = 'width:72px;height:auto;display:block;pointer-events:none;';
      fishWrap.style.cssText = `position:absolute;left:0;top:${pitch.scrollTop + pitch.clientHeight * 0.38}px;pointer-events:none;z-index:20;`;
      fishWrap.appendChild(fishImg);
      pitch.appendChild(fishWrap);

      const sw = pitch.clientWidth;

      gsap.set(fishWrap, { x: sw + 80 });

      // Y sine — bigger amplitude, mismatched period for natural feel
      gsap.to(fishWrap, { y: 55, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });

      // Two laps per cycle: Lap A = close (big, swims left), Lap B = far (small, swims right)
      gsap.timeline({ repeat: -1 })
        .to(fishWrap, { x: -80, duration: 5.5, ease: 'none',
          onStart() { gsap.set(fishWrap, { scaleX: -1 }); gsap.to(fishImg, { scale: 1.45, duration: 0.5, ease: 'power2.out' }); } })
        .to(fishWrap, { x: sw + 80, duration: 5.5, ease: 'none',
          onStart() { gsap.set(fishWrap, { scaleX: 1 });  gsap.to(fishImg, { scale: 0.65, duration: 0.5, ease: 'power2.out' }); } });
    }
    // 900ms hold already baked into pqReveal — add a beat before choices
    await w(200);
    const idx = await branchChoices([
      "What makes this compound? Walk me through the flywheel.",
      "I've heard enough. What's the ask?",
    ]);
    score([[1,0,3,0,0],[1,0,1,1,0]][idx]);
    if (idx === 0) await sShared_moat();
    else await sAsk();
  }

  async function sShared_moat() {
    await w(900); line('', 'tg-pl', 16);
    await ringWipeChapter('The Flywheel');
    await w(200);
    flash();
    // Type A — statement
    await reveal(line('The data is the moat. Not the app.', 'tg-pl--big'), {
      type: 'chars', y: 0,
      scale: () => gsap.utils.random(0.1, 0.5),
      rotation: () => gsap.utils.random(-15, 15),
      stagger: 0.05, from: 'center', duration: 0.65, ease: hasCE ? 'slam' : 'back.out(3)',
    });
    await w(600);
    // Type F — rlist with frog
    const rlistEl = await rlistReveal([
      { m: '01', t: 'More plays → sharper behavioural models' },
      { m: '02', t: 'Sharper models → more accurate profiles' },
      { m: '03', t: 'More accurate profiles → more B2B value' },
      { m: '04', t: 'More B2B value → more users → more plays' },
    ]);
    rlistEl.style.position = 'relative'; rlistEl.style.overflow = 'visible';
    const frogImg = decal('frog.png', 'tg-decal--bob', { right: '-22px', top: '0', w: 50, fromY: -30, fromScale: 0.3, delay: 0.3 });
    rlistEl.appendChild(frogImg);
    // Socks: unexpected wildcard on the list container
    rlistEl.appendChild(decal('socks.png', 'tg-decal--bob', { right: '-22px', top: '60px', w: 36, fromY: 20, fromRot: 15, toRot: -8, delay: 0.6 }));
    setTimeout(() => orbitingTextRing(frogImg, '\u2736 THE DATA IS THE MOAT \u2736 THE DATA IS THE MOAT \u2736'), 900);
    await w(400);
    const noGPUsEl = line('You can\'t shortcut this with GPUs. A competitor starting today would need years of real human behavioural data across diverse emotional contexts. Trove\'s head start is the dataset — and it compounds with every tangle played.', 'tg-pl--dim');
    await reveal(noGPUsEl, {
      y: 10, stagger: 0.028, duration: 0.38, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    noGPUsEl.style.position = 'relative'; noGPUsEl.style.overflow = 'visible';
    noGPUsEl.appendChild(decal('turtle.png', 'tg-decal--bob', { right: '-22px', top: '-4px', w: 46, fromY: -18, delay: 0.25 }));
    await w(350);
    await reveal(line('The comparable isn\'t another assessment tool. It\'s Plaid. $430M ARR from API access to data users already had. Trove is building the behavioural equivalent of that infrastructure layer.', 'tg-pl--dim'), {
      y: 10, stagger: 0.028, duration: 0.38, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(700);
    await contBtn("What's the ask? →");
    await sAsk();
  }

  // ── THE ASK ───────────────────────────────────────────
  async function sAsk() {
    await w(900); line('', 'tg-pl', 16);
    await ringWipeChapter('The Ask');
    await w(200);
    score([1,0,1,1,0]);
    flash(true);
    // Type A — huge statement
    await reveal(line('$525K already in.', 'tg-pl--huge'), {
      type: 'chars', y: 0,
      scale: () => gsap.utils.random(0.1, 0.5),
      rotation: () => gsap.utils.random(-15, 15),
      stagger: 0.05, from: 'center', duration: 0.65, ease: hasCE ? 'slam' : 'back.out(2.5)',
    });
    await w(800);
    await reveal(line('Betaworks, True Ventures, Slack Fund.', 'tg-pl--dim'), {
      y: 12, stagger: 0.04, duration: 0.38, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(350);
    await reveal(line('We\'re financing the next phase: 100K active behavioural profiles, 1–2 paid B2B pilots, retention across verticals beyond dating.', 'tg-pl--med'), {
      y: 14, stagger: 0.036, duration: 0.4, blur: true, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(350);
    askGrid([
      { label: 'Already closed', value: '$525K', sub: 'Formation capital, SAFEs' },
      { label: 'Raising now',    value: '$1.5M',  sub: '18–25 months runway · 7 people' },
    ]);
    await w(500);
    await reveal(line('We\'re looking for investors who think in platforms, not products. Who understand that the moat is the dataset and the app is just how you fill it.', 'tg-pl--med'), {
      y: 12, stagger: 0.036, duration: 0.4, blur: true, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(700);
    await contBtn('See your investor profile →');
    await sRevealArchetype();
  }

  // ── ARCHETYPE REVEAL ──────────────────────────────────
  async function sRevealArchetype() {
    await w(900); line('', 'tg-pl', 16);
    window.tgAPI.setProgress(100);
    await ringWipeChapter('you just told us something');
    await w(300);
    // Type B — setup
    await reveal(line('Not about Trove.', 'tg-pl--med'), {
      y: 16, stagger: 0.05, duration: 0.44, blur: true, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(500); // hold — let them wonder
    // Type A — landing line
    flash();
    await reveal(line('About how you think.', 'tg-pl--big'), {
      type: 'chars', y: 0,
      scale: () => gsap.utils.random(0.1, 0.5),
      rotation: () => gsap.utils.random(-15, 15),
      stagger: 0.05, from: 'center', duration: 0.65, ease: hasCE ? 'slam' : 'back.out(2.5)',
    });
    await w(600);
    await reveal(line('The order you explored. The questions you needed answered first. What made you lean forward and what made you push back.', 'tg-pl--dim'), {
      y: 10, stagger: 0.026, duration: 0.38, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(300);
    await reveal(line('That\'s a Trove profile. You built one just now — without filling out a single form.', 'tg-pl--med tg-pl--italic'), {
      y: 14, stagger: 0.04, duration: 0.42, blur: true, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(600);

    // ── TroveOh → TroveLogo animation ──
    await new Promise(resolve => {
      const wrap = document.createElement('div');
      wrap.className = 'tg-pl tg-hero-logo';
      const wordImg = document.createElement('img');
      wordImg.src = './TroveLogo.png';
      wordImg.className = 'tg-hero-word';
      wordImg.style.opacity = '0';
      const ohImg = document.createElement('img');
      ohImg.src = './TroveOh.png';
      ohImg.className = 'tg-hero-oh';
      wrap.append(wordImg, ohImg);
      pitch.appendChild(wrap);
      scrollPitch();

      // Wait for images to load before measuring
      let loaded = 0;
      const onLoad = () => { if (++loaded < 2) return; go(); };
      wordImg.onload = onLoad; ohImg.onload = onLoad;
      if (wordImg.complete) onLoad();
      if (ohImg.complete)   onLoad();

      function go() {
        const W    = wordImg.offsetWidth  || 88;
        const ohW  = ohImg.offsetWidth    || 24;
        const gap  = 14;
        const startX      = W + gap;
        const endX        = Math.round(W * 0.48 - ohW / 2);
        const totalDur    = 2100;
        const crossfadeAt = 0.62;
        const crossfadeDur= 620;
        const totalRot    = 720;

        ohImg.style.transform = `translateX(${startX}px)`;
        const ease = p => p < 0.5 ? 2*p*p : 1 - Math.pow(-2*p+2,2)/2;

        let startTime = null;
        function frame(ts) {
          if (!startTime) startTime = ts;
          const elapsed = ts - startTime;
          const p  = Math.min(1, elapsed / totalDur);
          const e  = ease(p);
          ohImg.style.transform = `translateX(${startX + (endX - startX) * e}px) rotate(${e * totalRot}deg)`;
          const cp = Math.max(0, Math.min(1, (elapsed - totalDur * crossfadeAt) / crossfadeDur));
          ohImg.style.opacity   = String(1 - cp);
          wordImg.style.opacity = String(cp);
          if (p < 1) requestAnimationFrame(frame);
          else { ohImg.remove(); resolve(); }
        }
        requestAnimationFrame(frame);
      }
    });
    await w(500); // hold on the wordmark

    // ── Email capture — gate before archetype reveal ───────────────────────
    await new Promise(resolveEmail => {
      const emailDiv = document.createElement('div');
      emailDiv.className = 'tg-pl';
      emailDiv.innerHTML = `
        <div class="tg-email-hero" id="tg-email-hero" style="opacity:0">curious?</div>
        <div class="tg-email-sub" id="tg-email-sub" style="opacity:0">stay up to date with upcoming drops</div>
        <div class="tg-email-list-lbl" id="tg-email-lbl" style="opacity:0">first-look list — one note when it's real</div>
        <div class="tg-email-form" id="tg-email-form" style="opacity:0">
          <input class="tg-email-in" id="tg-email-in" type="email" placeholder="you@somewhere.com" autocomplete="email">
          <button class="tg-email-send" id="tg-email-send">→</button>
        </div>
        <button class="tg-e-no" id="tg-email-skip" style="opacity:0">skip →</button>
        <span class="tg-email-fine" id="tg-email-fine" style="opacity:0">no spam. just signal — you'll hear first when trove is ready.</span>
      `;
      pitch.appendChild(emailDiv);
      scrollPitch();

      const submit = () => {
        const val = document.getElementById('tg-email-in')?.value?.trim();
        if (!val || !val.includes('@')) {
          const inp = document.getElementById('tg-email-in');
          if (inp) { inp.style.outline = '1px solid var(--shift)'; setTimeout(() => { inp.style.outline = ''; }, 1200); }
          return;
        }
        try {
          const leads = JSON.parse(localStorage.getItem('tg-leads') || '[]');
          leads.push({ email: val, archetype: getArchetype(), ts: Date.now() });
          localStorage.setItem('tg-leads', JSON.stringify(leads));
        } catch (e) {}
        if (hasGSAP) {
          gsap.to(['#tg-email-form','#tg-email-skip','#tg-email-fine'], { opacity: 0, y: -6, duration: 0.25, stagger: 0.06 });
          setTimeout(() => {
            emailDiv.innerHTML = `<div style="font-family:var(--font-label);font-size:12px;color:var(--trace);letter-spacing:0.08em;padding:6px 0;opacity:0" id="tg-email-ok">you're on the list ✓</div>`;
            gsap.to('#tg-email-ok', { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' });
            setTimeout(resolveEmail, 800);
          }, 350);
        } else {
          emailDiv.innerHTML = `<div class="tg-email-fine" style="opacity:0.8;font-size:13px;margin:6px 0">you're on the list ✓</div>`;
          setTimeout(resolveEmail, 700);
        }
      };

      if (hasGSAP) {
        const heroEl = document.getElementById('tg-email-hero');
        const subEl  = document.getElementById('tg-email-sub');
        const lblEl  = document.getElementById('tg-email-lbl');
        const formEl = document.getElementById('tg-email-form');
        const skipEl = document.getElementById('tg-email-skip');
        const fineEl = document.getElementById('tg-email-fine');

        // 1. Slam "curious?" char by char
        const split = new SplitText(heroEl, { type: 'chars' });
        gsap.set(heroEl, { opacity: 1 });
        gsap.from(split.chars, {
          opacity: 0, y: 36, scale: 0.5,
          rotation: i => (Math.sin(i * 1.4) * 18),
          duration: 0.55, ease: hasCE ? 'slam' : 'back.out(2.5)',
          stagger: { each: 0.07, ease: 'power2.out' },
          clearProps: 'transform,rotation',
        });

        // 2. Sub-text fades up
        gsap.fromTo(subEl,  { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out', delay: 0.52 });
        gsap.fromTo(lblEl,  { opacity: 0 },         { opacity: 1,       duration: 0.3, ease: 'power2.out', delay: 0.72 });

        // 3. Form + supporting copy slide up
        gsap.fromTo(formEl, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.38, ease: 'power3.out', delay: 0.88 });
        gsap.fromTo(skipEl, { opacity: 0 },         { opacity: 1,       duration: 0.25, delay: 1.05 });
        gsap.fromTo(fineEl, { opacity: 0 },         { opacity: 1,       duration: 0.25, delay: 1.15,
          onComplete: () => { document.getElementById('tg-email-in')?.focus(); },
        });
      } else {
        ['tg-email-hero','tg-email-sub','tg-email-lbl','tg-email-form','tg-email-skip','tg-email-fine']
          .forEach(id => { const el = document.getElementById(id); if (el) el.style.opacity = '1'; });
        document.getElementById('tg-email-in')?.focus();
      }

      setTimeout(() => {
        const inp = document.getElementById('tg-email-in');
        inp?.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
        document.getElementById('tg-email-send')?.addEventListener('click', submit);
        document.getElementById('tg-email-skip')?.addEventListener('click', resolveEmail);
      }, 80);
    });
    await w(400);

    // ── Screen takeover: blue flash before archetype ──
    if (hasGSAP && scene) {
      if (window.HAPTIC) HAPTIC.notification('success');
      const cover = document.createElement('div');
      cover.style.cssText =
        'position:absolute;inset:0;background:#88ABE3;z-index:100;pointer-events:none;opacity:0;';
      scene.appendChild(cover);
      await new Promise(r =>
        gsap.timeline({ onComplete: r })
          .to(cover, { opacity: 1, duration: 0.22, ease: 'power2.in' })
          .to(cover, { opacity: 0, duration: 0.42, ease: 'power2.out', delay: 0.18 })
          .call(() => cover.remove())
      );
    }

    const id   = getArchetype();
    const arch = ARCHETYPES[id];

    const archetypeAssets = {
      cartographer: { src: 'camera.png',    opts: { right: '-28px', top: '-12px', w: 56 } },
      contrarian:   { src: 'boomerang.png', opts: { right: '-24px', top: '-8px',  w: 52, fromRot: -45, toRot: 8 } },
      architect:    { src: 'house.png',     opts: { right: '-26px', top: '-14px', w: 54 } },
      operator:     { src: 'watch.png',     opts: { right: '-22px', top: '-6px',  w: 48 } },
      storyteller:  { src: 'mic.png',       opts: { right: '-24px', top: '-10px', w: 52 } },
    };

    const profileCard = document.createElement('div');
    profileCard.className = 'tg-pl tg-profile-card';
    profileCard.innerHTML = `
      <div class="tg-p-tag">your investor archetype</div>
      <div class="tg-p-name" id="tg-arch-name">${arch.name}</div>
      <div class="tg-p-sub">${arch.sub}</div>
      <div class="tg-p-desc">${arch.desc}</div>
      <div class="tg-p-together">${arch.together}</div>
    `;
    pitch.appendChild(profileCard);
    scrollPitch();
    if (hasGSAP) {
      await new Promise(r => gsap.from(profileCard, { opacity: 0, y: 26, scale: 0.96, duration: 0.55, ease: 'back.out(2)', clearProps: 'all', onComplete: r }));
    }

    // Confetti from both top corners
    if (window.confetti) {
      confetti({ particleCount: 55, angle: 58,  spread: 58,
        origin: { x: 0, y: 0.08 },
        colors: ['#DBD59C','#88ABE3','#C3D9FF','#FFFBCD'], scalar: 0.9 });
      setTimeout(() => confetti({ particleCount: 55, angle: 122, spread: 58,
        origin: { x: 1, y: 0.08 },
        colors: ['#DBD59C','#88ABE3','#C3D9FF','#FFFBCD'], scalar: 0.9 }), 120);
    }

    await w(350);

    // Archetype asset pops in on the profile card
    profileCard.style.position = 'relative'; profileCard.style.overflow = 'visible';
    const { src, opts } = archetypeAssets[id];
    profileCard.appendChild(decal(src, 'tg-decal--bob', { ...opts, delay: 0 }));
    // Orbiting ring around the profile card after asset lands
    setTimeout(() => orbitingTextRing(profileCard,
      `\u2736 ${arch.name.toUpperCase()} \u2736 TROVE INVESTOR \u2736 `), 700);

    await w(300);

    // Glitch on name + underline sweep
    const nameEl = document.getElementById('tg-arch-name');
    if (nameEl && hasGSAP) {
      const r2 = nameEl.cloneNode(true), b2 = nameEl.cloneNode(true);
      r2.style.cssText = 'position:absolute;top:0;left:0;color:var(--shift);mix-blend-mode:multiply;pointer-events:none;';
      b2.style.cssText = 'position:absolute;top:0;left:0;color:var(--trace);mix-blend-mode:multiply;pointer-events:none;';
      nameEl.style.position = 'relative';
      nameEl.appendChild(r2); nameEl.appendChild(b2);
      gsap.timeline()
        .to(r2, { x: () => (Math.random()-0.5)*14, duration: 0.05, ease: 'steps(1)', repeat: 6, yoyo: true })
        .to(b2, { x: () => (Math.random()-0.5)*14, duration: 0.05, ease: 'steps(1)', repeat: 6, yoyo: true }, '<')
        .call(() => {
          r2.remove(); b2.remove();
          nameEl.style.position = '';
          nameEl.style.textDecoration = 'underline';
          nameEl.style.textDecorationColor = 'var(--trace)';
          nameEl.style.textDecorationThickness = '2px';
          nameEl.style.textUnderlineOffset = '4px';
        });
    }
    await w(700);

    // Share button lives on the profile card — canvas generated silently on tap
    const shareBtn = document.createElement('button');
    shareBtn.className = 'tg-share-btn-main';
    shareBtn.textContent = 'share this →';
    shareBtn.onclick = async () => {
      shareBtn.textContent = 'generating…';
      shareBtn.disabled = true;
      try {
        const cvs = await generateShareCard(arch, id);
        const blob = await new Promise(r => cvs.toBlob(r, 'image/png'));
        const file = new File([blob], `trove-${id}.png`, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: arch.name,
            text: `${arch.name} — ${arch.sub}\n\ntrove.garden`,
            files: [file],
          });
        } else if (navigator.share) {
          await navigator.share({ title: arch.name, text: `${arch.name} — ${arch.sub}`, url: 'https://trove.garden' });
        } else {
          const link = document.createElement('a');
          link.download = `trove-${id}.png`;
          link.href = cvs.toDataURL('image/png');
          link.click();
          shareBtn.textContent = 'saved ✓';
          setTimeout(() => { shareBtn.textContent = 'share this →'; shareBtn.disabled = false; }, 2200);
          return;
        }
      } catch (e) { /* cancelled */ }
      shareBtn.textContent = 'share this →';
      shareBtn.disabled = false;
    };
    profileCard.appendChild(shareBtn);
    if (hasGSAP) gsap.from(shareBtn, { opacity: 0, y: 10, duration: 0.4, ease: 'power3.out', delay: 0.15 });

    const contact = document.createElement('div');
    contact.className = 'tg-pl tg-contact';
    contact.innerHTML = `<div>Helen Huang · Founder, Trove</div><div><a href="mailto:helen@trove.garden">helen@trove.garden</a></div>`;
    pitch.appendChild(contact);
    scrollPitch();
    if (hasGSAP) gsap.from(contact, { opacity: 0, y: 18, duration: 0.48, ease: 'back.out(2)' });
    setTimeout(() => { pitch.scrollTop = pitch.scrollHeight; }, 150);
  }

  window.tgAPI.setProgress(0);

  // ── Beat 1: text first, then investor + wallet appear below ───
  const investorEl = line('You\'re an<br><span class="tg-investor-word">investor.</span>', 'tg-pl--big');
  if (hasGSAP) {
    const split = new SplitText(investorEl, { type: 'chars' });
    await new Promise(r => gsap.from(split.chars, {
      opacity: 0,
      y: () => gsap.utils.random(60, 120),
      x: () => gsap.utils.random(-18, 18),
      rotation: () => gsap.utils.random(-22, 22),
      scale: () => gsap.utils.random(0.05, 0.35),
      duration: 0.85, ease: hasCE ? 'slam' : 'back.out(3)',
      stagger: { each: 0.055, from: 'center', ease: 'power3.in' },
      clearProps: 'transform,x,y,rotation,scale',
      onComplete: r,
    }));
  }

  // Investor + wallet pair: wallet floats above top-left of investor, both in scroll
  const pairEl = document.createElement('div');
  pairEl.className = 'tg-pl tg-decal-pair';
  const walletImg   = document.createElement('img');
  walletImg.src     = './assets/waller.png';
  walletImg.className = 'tg-decal-wallet';
  walletImg.style.opacity = '0';
  const investorImg = document.createElement('img');
  investorImg.src   = './assets/investor.png';
  investorImg.className = 'tg-decal-investor';
  investorImg.style.opacity = '0';
  pairEl.append(walletImg, investorImg);
  pitch.appendChild(pairEl);
  scrollPitch();

  if (hasGSAP) {
    // Investor drops from above with elastic bounce
    gsap.fromTo(investorImg,
      { opacity: 0, y: -50, rotation: 13, scale: 0.65 },
      { opacity: 1, y: 0, rotation: -3, scale: 1,
        duration: 0.88, ease: 'elastic.out(1, 0.52)', delay: 0.08 }
    );
    setTimeout(() => investorImg.classList.add('tg-decal--bob'), 1000);

    // Wallet slides in from the left a beat later, settles above investor's top-left
    gsap.fromTo(walletImg,
      { opacity: 0, x: -44, rotation: -22, scale: 0.7 },
      { opacity: 1, x: 0, rotation: 5, scale: 1,
        duration: 0.68, ease: 'back.out(2.4)', delay: 0.42 }
    );
    setTimeout(() => {
      walletImg.classList.add('tg-decal--bob');
      walletImg.style.animationDelay = '-0.9s';
    }, 1150);
  }
  spawnAmbientFloaters();
  await w(1300);

  // ── Beat 2: Wrong call — capture element so coin can land beside "someone." ──
  const someoneEl = line('You made the wrong call on someone.', 'tg-pl--med', 28);
  await reveal(someoneEl, {
    y: 24, stagger: 0.07, staggerEase: 'power2.out', duration: 0.52, blur: true,
    ease: hasCE ? 'unfurl' : 'power3.out',
  });
  await w(900);

  // ── Coin: launches from wallet, lands inline beside "someone." ──
  if (hasGSAP) {
    gsap.to(walletImg, { opacity: 0.35, scale: 0.9, duration: 0.3, ease: 'power2.in' });
  }
  await w(80);
  await coinTransition(walletImg, someoneEl);
  await w(220);

  // ── Beat 3: slot-spin through candidates → disintegrate ─────────────────
  await reveal(line('maybe they were a\u2026', 'tg-pl--dim', 28), { y: 18, duration: 0.45, blur: true });
  await w(300);

  const spinWords  = ['hire','co-founder','partner','date','friend'];
  const spinSeq    = [0,1,2,3,4,0,1,2,3,4,0,1,2]; // index 2 = 'partner'
  const spinDelays = [70,75,82,88,98,115,135,160,195,230,280,350];

  const spinEl = line(spinWords[0], 'tg-pl--big', 4);
  for (let i = 0; i < spinSeq.length; i++) {
    spinEl.textContent = spinWords[spinSeq[i]];
    HAPTIC.tap();
    if (i < spinDelays.length) await w(spinDelays[i]);
  }
  await w(900);

  // Sand-blows-away disintegration — tiny grains drift right, text crumbles in place
  await new Promise(resolve => {
    const rect = spinEl.getBoundingClientRect();
    const pal  = ['#DBD59C','#88ABE3','#C3D9FF','#FFFBCD','#aaaaaa'];
    for (let i = 0; i < 80; i++) {
      const delay = Math.random() * 900;
      const p   = document.createElement('div');
      const sz  = 1.5 + Math.random() * 3.5;
      const col = pal[Math.floor(Math.random() * pal.length)];
      // spawn from within the text bounding box
      const sx  = rect.left + Math.random() * rect.width;
      const sy  = rect.top  + Math.random() * rect.height;
      // drift: mostly rightward + slight vertical scatter, like wind
      const dx  = 40 + Math.random() * 110;
      const dy  = (Math.random() - 0.4) * 40;
      p.style.cssText = `position:fixed;width:${sz}px;height:${sz}px;border-radius:50%;`
        + `background:${col};left:${sx}px;top:${sy}px;pointer-events:none;z-index:9999;opacity:0;`;
      document.body.appendChild(p);
      const dur = 600 + Math.random() * 500;
      if (window.gsap) {
        gsap.fromTo(p,
          { opacity: 0.85, x: 0, y: 0 },
          { opacity: 0, x: dx, y: dy, duration: dur / 1000,
            ease: 'power1.out', delay: delay / 1000, onComplete: () => p.remove() });
      } else {
        setTimeout(() => {
          p.style.opacity = '0.85';
          p.style.transition = `transform ${dur}ms linear, opacity ${dur * 0.8}ms ease-in`;
          requestAnimationFrame(() => requestAnimationFrame(() => {
            p.style.transform = `translate(${dx}px,${dy}px)`;
            p.style.opacity = '0';
          }));
          setTimeout(() => p.remove(), dur + 80);
        }, delay);
      }
    }
    // Text fades out over ~1s, keeping its space
    if (window.gsap) {
      gsap.to(spinEl, { opacity: 0, duration: 0.9, ease: 'power2.in', onComplete: resolve });
    } else {
      spinEl.style.transition = 'opacity 0.9s ease-in';
      spinEl.style.opacity = '0';
      setTimeout(resolve, 950);
    }
  });

  await w(300);

  // New text fills the same space — mutate spinEl in place, no new element
  if (window.gsap) gsap.killTweensOf(spinEl);
  spinEl.className = 'tg-pl tg-pl--med';
  spinEl.style.marginTop = '8px';
  spinEl.style.opacity = '0';
  spinEl.textContent = "it doesn\u2019t matter who \u2014 we\u2019ve all been there.";
  if (window.gsap) {
    await new Promise(r => gsap.fromTo(spinEl,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out', onComplete: r }
    ));
  } else {
    spinEl.style.transition = 'opacity 0.55s ease';
    spinEl.style.opacity = '1';
    await w(600);
  }
  await w(1000);

  // ── Beat 4: What happened? — chars from center, blur, stagger ease ────
  flash();
  await reveal(line('What happened?', 'tg-pl--impact', 18), {
    type: 'chars', blur: false,
    y: 0,
    scale: () => gsap.utils.random(0.1, 0.5),
    rotation: () => gsap.utils.random(-30, 30),
    stagger: 0.05, from: 'center', staggerEase: 'power2.inOut',
    ease: 'back.out(3.5)', duration: 0.75,
  });
  await w(380);

  const choiceTexts = [
    "They couldn't deliver when it mattered.",
    'They were different in practice than in person.',
    "You ignored something you saw early. You wish you hadn't.",
    "Honestly? You still don't fully know.",
  ];

  const choiceWrap = document.createElement('div');
  choiceWrap.className = 'tg-pl tg-pitch-choices';
  choiceWrap.innerHTML = choiceTexts
    .map((c, i) => `<button class="tg-pitch-choice" onclick="window._pitchChoose(${i})">${c}</button>`)
    .join('');
  pitch.appendChild(choiceWrap);
  scrollPitch();

  if (hasGSAP) {
    // edgeReveal — buttons alternate from left/right edges
    gsap.from([...choiceWrap.querySelectorAll('.tg-pitch-choice')], {
      opacity: 0,
      x: (i) => i % 2 === 0 ? 48 : -28,
      scale: 0.88,
      filter: 'blur(4px)',
      duration: 0.52,
      ease: hasCE ? 'yank' : 'back.out(2)',
      stagger: { each: 0.09, ease: 'power2.inOut' },
      clearProps: 'filter,x,scale',
    });
  }

  window._pitchChosen = false;
  const chosen = await new Promise(resolve => {
    window._pitchChoose = idx => {
      if (window._pitchChosen) return;
      window._pitchChosen = true;
      const btns = [...choiceWrap.querySelectorAll('.tg-pitch-choice')];
      btns.forEach((b, i) => { b.disabled = true; if (i !== idx) disintegrate(b); });
      const sel = btns[idx];
      sel.classList.add('selected');
      if (hasGSAP) {
        gsap.to(sel, {
          scale: 1.06, duration: 0.12, ease: 'power2.out',
          onComplete: () => gsap.to(sel, { scale: 1, duration: 0.9, ease: 'elastic.out(1, 0.38)' }),
        });
      }
      window.tgAPI.setProgress(25);
      setTimeout(() => resolve(idx), 540);
    };
  });

  scrollPitch();
  await w(800);

  // ── Beat 5: xray vision ───────────────────────────────────────
  await reveal(line('What if you had', 'tg-pl--dim', 28), {
    y: 20, stagger: 0.07, duration: 0.42, blur: true,
    ease: hasCE ? 'unfurl' : 'power3.out',
  });
  await w(420);

  flash(true);
  const xrayEl = line('xray vision', 'tg-pl--huge');

  if (hasGSAP && hasScrTx) {
    xrayEl.textContent = '';
    await new Promise(r =>
      gsap.to(xrayEl, {
        duration: 1.7,
        scrambleText: {
          text: 'xray vision',
          chars: '!<>-_\\/[]{}—=+*^?#XR4YV1S10N@░▒▓',
          revealDelay: 0.32, speed: 0.42, newClass: 'tg-scramble-char',
        },
        ease: 'none', onComplete: r,
      })
    );
    // Bloom ring expanding outward
    const ring = document.createElement('div');
    ring.style.cssText = `position:fixed;left:50%;top:50%;width:4px;height:4px;
      margin:-2px 0 0 -2px;border-radius:50%;
      border:1px solid var(--trace);pointer-events:none;z-index:9999;`;
    document.body.appendChild(ring);
    gsap.to(ring, {
      width:'140vw', height:'140vw', marginTop:'-70vw', marginLeft:'-70vw',
      opacity:0, duration:1.1, ease:'power2.out', onComplete:()=>ring.remove(),
    });
    // Chromatic glitch on the element
    const r2 = xrayEl.cloneNode(true), b2 = xrayEl.cloneNode(true);
    r2.style.cssText = `position:absolute;top:0;left:0;color:var(--shift);mix-blend-mode:multiply;pointer-events:none;`;
    b2.style.cssText = `position:absolute;top:0;left:0;color:var(--trace);mix-blend-mode:multiply;pointer-events:none;`;
    xrayEl.style.position = 'relative';
    xrayEl.appendChild(r2); xrayEl.appendChild(b2);
    const steps = 8;
    gsap.timeline()
      .to(r2, { x: () => (Math.random()-0.5)*16, duration:0.05, ease:'steps(1)', repeat:steps, yoyo:true })
      .to(b2, { x: () => (Math.random()-0.5)*16, duration:0.05, ease:'steps(1)', repeat:steps, yoyo:true }, '<')
      .to(xrayEl, { skewX: () => (Math.random()-0.5)*3, duration:0.08, ease:'steps(1)', repeat:3, yoyo:true }, '<')
      .call(() => { r2.remove(); b2.remove(); xrayEl.style.position=''; });
  } else if (hasGSAP) {
    const xraySplit = new SplitText(xrayEl, { type: 'chars' });
    await new Promise(r =>
      gsap.from(xraySplit.chars, {
        opacity: 0,
        y: () => gsap.utils.random(-90, 90), x: () => gsap.utils.random(-28, 28),
        scale: () => gsap.utils.random(0.05, 0.45), rotation: () => gsap.utils.random(-70, 70),
        duration: 1.15, ease: 'elastic.out(1, 0.42)',
        stagger: { each: 0.075, from: 'random' },
        clearProps: 'transform,x,y,rotation,scale', onComplete: r,
      })
    );
  }

  // Decals: starhehe just above "vision", lightbulb floating above him having the idea
  xrayEl.style.position = 'relative';
  xrayEl.style.overflow = 'visible';
  {
    const decalGroup = document.createElement('div');
    decalGroup.className = 'tg-xray-decal-group';
    decalGroup.style.opacity = '0';
    const bulbImg = document.createElement('img');
    bulbImg.src = './assets/lightbulb.png';
    bulbImg.className = 'tg-xray-bulb';
    const starImg = document.createElement('img');
    starImg.src = './assets/starhehe.png';
    starImg.className = 'tg-xray-star';
    decalGroup.append(bulbImg, starImg);
    xrayEl.appendChild(decalGroup);
    if (hasGSAP) {
      gsap.fromTo(decalGroup,
        { opacity: 0, y: 18, scale: 0.5, rotation: -10 },
        { opacity: 1, y: 0, scale: 1, rotation: 0, duration: 0.7, ease: 'elastic.out(1, 0.48)',
          onComplete: () => orbitingTextRing(bulbImg, '\u2736 XRAY VISION \u2736 BEHAVIORAL SIGNAL \u2736') }
      );
    } else {
      decalGroup.style.opacity = '1';
    }
  }

  await w(400);
  await reveal(line('for how people actually behave?', 'tg-pl--med'), {
    y: 24, stagger: 0.065, staggerEase: 'power2.inOut', duration: 0.52, blur: true,
    ease: hasCE ? 'unfurl' : 'power3.out',
  });
  await w(1600);

  await w(1800);
  await sBranch0();
};
