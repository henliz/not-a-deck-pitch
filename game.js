import { HAPTIC } from './haptics.js';

window.tgSpeedMult = 2.5;  // default: Normal (1.0 = Fast/max, 2.5 = Normal, 5.0 = Slow)

/* ══════════════════════════════════════════════════════════════
   GAME ENGINE
══════════════════════════════════════════════════════════════ */

/* Particle disintegration — palette colours + GSAP */
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
  window.HAPTIC?.tap?.();
  window.tgPaused = !window.tgPaused;
  if (window.gsap) gsap.globalTimeline.paused(window.tgPaused);
  const btn = document.getElementById('t-pause-btn');
  if (btn) btn.textContent = window.tgPaused ? '▶' : '⏸';
};

/* ── Speed control ── */
window.tToggleSpeedPanel = function () {
  window.HAPTIC?.tap?.();
  const panel = document.getElementById('t-speed-panel');
  if (panel) panel.classList.toggle('open');
};

window.tSetSpeed = function (mult) {
  window.HAPTIC?.tap?.();
  window.tgSpeedMult = mult;
  // Only pacing (w() waits) changes — animations always stay snappy
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

  // Clear any previous run
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
  let pqColorIdx   = 0;

  const BURST_SETS = {
    celebrate: ['babystar.png','starhehe.png','flower.png','icecream.png','coin.png'],
    data:      ['id.png','camera.png','watch.png','apple.png','lightbulb.png'],
    viral:     ['banana.png','boomerand.png','bubbleblower.png','phone.png','headphones.png'],
    moat:      ['house.png','frog.png','bread.png','turtle.png','socks.png'],
    founder:   ['mic.png','gaming.png','caterpillar.png','flower.png','babystar.png'],
  };

  /* Spawn image assets exploding outward from originEl.
     setName matches a BURST_SETS key. count = number of imgs. */
  function assetBurst(originEl, setName = 'celebrate', count = 10) {
    if (!hasGSAP || !originEl) return;
    HAPTIC.burst();
    const set  = BURST_SETS[setName] || BURST_SETS.celebrate;
    const rect = originEl.getBoundingClientRect();
    const ox   = rect.left + rect.width  / 2;
    const oy   = rect.top  + rect.height / 2;
    for (let i = 0; i < count; i++) {
      const img = document.createElement('img');
      img.src   = `./assets/${set[i % set.length]}`;
      const sz  = 28 + Math.random() * 24;
      img.style.cssText =
        `position:fixed;width:${sz}px;height:${sz}px;object-fit:contain;` +
        `left:${ox}px;top:${oy}px;transform:translate(-50%,-50%);` +
        `pointer-events:none;z-index:9999;`;
      document.body.appendChild(img);
      const angle = Math.random() * Math.PI * 2;
      const dist  = 60 + Math.random() * 120;
      const tx    = Math.cos(angle) * dist;
      const ty    = Math.sin(angle) * dist;
      const rot   = (Math.random() - 0.5) * 720;
      const dur   = 0.8 + Math.random() * 0.4;
      gsap.timeline()
        .fromTo(img,
          { x: 0, y: 0, scale: 0, rotation: 0, opacity: 1 },
          { x: tx, y: ty, scale: 1, rotation: rot, opacity: 1,
            duration: dur, ease: 'elastic.out(1, 0.5)' })
        .to(img, { opacity: 0, scale: 0.5, duration: 0.28, ease: 'power2.in',
          onComplete: () => img.remove() });
    }
  }

  /* Flash a single asset across the scene — left→right sweep, peaks at 0.35 opacity. */
  function fullScreenAssetSweep(src) {
    if (!hasGSAP || !scene) return;
    const scW = scene.offsetWidth  || 320;
    const scH = scene.offsetHeight || 600;
    const img = document.createElement('img');
    img.src = `./assets/${src}`;
    img.style.cssText =
      `position:absolute;left:0;top:50%;width:${scW}px;height:auto;` +
      `transform:translateY(-50%) translateX(-110%);` +
      `pointer-events:none;z-index:150;opacity:0;`;
    scene.appendChild(img);
    gsap.timeline({ onComplete: () => img.remove() })
      .to(img, {
        x: scW * 2.1,
        rotation: (Math.random() - 0.5) * 10,
        opacity: 0.35,
        duration: 0.55,
        ease: 'power2.inOut',
      })
      .to(img, { opacity: 0, duration: 0.18, ease: 'power2.in' }, '-=0.14');
  }


  /* ── Buttery smooth auto-scroll ─────────────────────────────────────────
     One persistent rAF lerp loop. Target is always read fresh each frame
     from pitch.scrollHeight, so content growing mid-scroll is chased
     automatically — no restart / overwrite jank.                          */
  /* ── wavePunch: stacked lines with a continuous sine-wave flowing through
     every character across all rows — airport-sign-but-wavy, loops forever.
     lines: string[]   A: amplitude px   freq: chars per radian   speed: rad/s */
  function wavePunch(lines, { A = 9, freq = 0.28, speed = 1.9 } = {}) {
    const wrap = document.createElement('div');
    wrap.className = 'tg-pl tg-pl--punch';
    pitch.appendChild(wrap);
    scrollPitch();

    const allSpans = [];
    lines.forEach(txt => {
      const row = document.createElement('div');
      row.style.cssText = 'display:block;white-space:nowrap;';
      for (const ch of txt) {
        const s = document.createElement('span');
        s.textContent = ch === ' ' ? '\u00A0' : ch;
        s.style.cssText = 'display:inline-block;will-change:transform;';
        row.appendChild(s);
        allSpans.push(s);
      }
      wrap.appendChild(row);
    });

    if (hasGSAP) {
      gsap.from(wrap, { opacity: 0, y: 20, duration: 0.55, ease: hasCE ? 'unfurl' : 'power3.out' });
      const tick = () => {
        const t = gsap.ticker.time;
        allSpans.forEach((s, i) => {
          s.style.transform = `translateY(${A * Math.sin(i * freq - t * speed)}px)`;
        });
      };
      gsap.ticker.add(tick);
      wrap._stopWave = () => gsap.ticker.remove(tick);
    }
    return wrap;
  }

  /* ── crtTicker: big sine-wave text drift in brand colours ─────────────── */
  function crtTicker(text) {
    const wrap  = document.createElement('div');
    wrap.className = 'tg-pl tg-sine-ticker';
    const track = document.createElement('div');
    track.className = 'tg-sine-track';

    // Per-character spans for sine wave; color changes per WORD not per letter
    const full   = text + '   \u2736   ';
    const colors = ['#DBD59C', '#88ABE3', 'rgba(34,34,34,0.72)'];
    let wordColor = colors[0], ci = 0;
    for (let copy = 0; copy < 2; copy++) {
      ci = 0; // reset word index each copy so colors stay consistent
      for (const ch of full) {
        if (ch === ' ') { wordColor = colors[++ci % colors.length]; }
        const s = document.createElement('span');
        s.className = 'tg-sine-char';
        s.textContent = ch === ' ' ? '\u00A0' : ch;
        s.style.color = ch === ' ' ? 'transparent' : wordColor;
        track.appendChild(s);
      }
    }

    wrap.appendChild(track);
    pitch.appendChild(wrap);
    scrollPitch();

    if (hasGSAP) {
      gsap.from(wrap, { opacity: 0, duration: 0.7, ease: 'power2.out' });
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const halfW = track.scrollWidth / 2;
        if (!halfW) return;
        // Slow horizontal drift
        gsap.fromTo(track, { x: 0 },
          { x: -halfW, duration: halfW / 28, ease: 'none', repeat: -1, repeatDelay: 0 });
        // True curve-following: Y driven by each char's actual screen X,
        // so the whole ribbon travels through a sine curve in space.
        const spans  = [...track.querySelectorAll('.tg-sine-char')];
        const offsets = spans.map(s => s.offsetLeft); // static local positions
        const A = 18, freq = 0.016, drift = 0.4; // period ≈ 390px, slow temporal drift
        const sineTick = () => {
          const trackX = gsap.getProperty(track, 'x') || 0;
          const t = gsap.ticker.time;
          spans.forEach((s, i) => {
            const worldX = offsets[i] + trackX;
            s.style.transform = `translateY(${A * Math.sin(worldX * freq + t * drift)}px)`;
          });
        };
        gsap.ticker.add(sineTick);
        wrap._stopTicker = () => gsap.ticker.remove(sineTick);
      }));
    }
    return wrap;
  }

  // Track whether user was at bottom BEFORE new content arrived (Slack/iMessage pattern)
  let _atBottom = true;
  pitch.addEventListener('scroll', () => {
    _atBottom = pitch.scrollHeight - pitch.clientHeight - pitch.scrollTop < 32;
  }, { passive: true });

  function scrollPitch() {
    if (_atBottom) requestAnimationFrame(() => {
      pitch.scrollTop = pitch.scrollHeight - pitch.clientHeight;
    });
  }
  function scrollPitchSnap() {
    _atBottom = true;
    pitch.scrollTop = pitch.scrollHeight - pitch.clientHeight;
  }
  function pageBreak() {
    // Visual "new page" — inserts a full-viewport blank spacer then snaps scroll to it.
    // Old content is still above; scrolling up reveals it.
    const spacer = document.createElement('div');
    spacer.style.cssText = `height:${pitch.clientHeight}px;flex-shrink:0;pointer-events:none;`;
    pitch.appendChild(spacer);
    scrollPitchSnap();
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
    HAPTIC.burst();
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
        duration: opts.duration ?? 0.65,
        ease:     opts.ease     ?? defaultEase,
        stagger:  {
          each: opts.stagger      ?? 0.10,
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
          // Snap coin to where landed actually rendered (scroll may have shifted since tween start)
          const r  = landed.getBoundingClientRect();
          const sr = scene.getBoundingClientRect();
          gsap.set(coin, {
            x: r.left - sr.left + r.width  / 2 - SZ / 2,
            y: r.top  - sr.top  + r.height / 2 - SZ / 2,
            scale: landScale,
          });
          coin.remove();
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
  const branchPath = [];
  let firstChoice = null;
  let usedFounderPath = false;
  let pushedBackOnData = false;
  let wentDeepOnMoat = false;
  let wentStraightToAsk = false;
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
      traits: ['Evidence-First', 'Thorough', 'Precise'],
      insight: 'You asked about the data before anything else. That\'s the right question.',
    },
    contrarian: {
      name: 'The Contrarian',
      sub: 'you were early on something everyone else passed on',
      desc: 'You back founders who can\'t be talked out of it, because conviction is the only thing that survives a hard year. You\'ve learned to trust the feeling of "this is weird but right" more than any spreadsheet. Your best investments didn\'t make sense to the room.',
      together: 'You already see it. The question is whether Helen\'s the kind of founder who gets more stubborn under pressure. <strong>She is.</strong>',
      traits: ['Conviction', 'Pattern-Breaker', 'Early'],
      insight: 'You backed the founder before the product made sense to anyone else.',
    },
    architect: {
      name: 'The Architect',
      sub: 'you think in infrastructure, not products',
      desc: 'You\'re not investing in what Trove is today. You\'re investing in what it makes inevitable — the behavioural layer that sits under hiring, dating, insurance, healthcare. You\'ve backed platforms before and you understand that the moat is the dataset, not the app.',
      together: 'You\'ll want to talk about the API strategy and B2B licensing before anyone else brings it up. <strong>We\'re ready for that conversation.</strong>',
      traits: ['Systems', 'Infrastructure', 'Platform'],
      insight: 'You think in what this makes inevitable — not what it is today.',
    },
    operator: {
      name: 'The Operator',
      sub: 'you\'ve built something, and it shows',
      desc: 'You read the founder before you read the deck. You know what a person looks like when they\'re building from genuine obsession versus building to exit. You add more than capital — pattern recognition, intros, the three sentences that fix the pitch. Your portfolio companies call you on hard days.',
      together: 'You\'ll probably spot something in Helen\'s approach that she hasn\'t articulated yet. <strong>Tell her. She wants to hear it.</strong>',
      traits: ['Builder', 'Pattern Recognition', 'Hands-On'],
      insight: 'You read founders. You knew what you were looking at before the deck ended.',
    },
    storyteller: {
      name: 'The Storyteller',
      sub: 'you back things people will talk about',
      desc: 'You understand that the best consumer products are also cultural moments — they spread because they mean something. You\'ve backed companies before the market understood them because you could see the narrative before the numbers justified it. Trove is a story about what it means to actually know someone.',
      together: 'You\'ll have opinions on the product voice, the community, the cultural positioning. <strong>Those opinions are valuable. Bring them.</strong>',
      traits: ['Cultural', 'Narrative', 'Contrarian'],
      insight: 'You see the story before the numbers justify it. That\'s the whole game.',
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
    const hPos = opts.right !== undefined ? `right:${opts.right}` : `left:${opts.left || '-16px'}`;
    const vPos = opts.bottom !== undefined ? `bottom:${opts.bottom}` : (opts.top !== undefined ? `top:${opts.top}` : 'top:-8px');
    img.style.cssText = `width:${opts.w || 52}px;height:auto;position:absolute;${hPos};${vPos};opacity:0;pointer-events:none;`;
    if (hasGSAP) {
      gsap.fromTo(img,
        { opacity: 0, y: opts.fromY ?? -20, scale: opts.fromScale ?? 0.5, rotation: opts.fromRot ?? 0 },
        { opacity: 1, y: 0, scale: 1, rotation: opts.toRot ?? 0,
          duration: 0.65, ease: 'elastic.out(1, 0.48)', delay: opts.delay ?? 0.1,
          clearProps: 'transform',
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
    HAPTIC.card();

    /* All 4 palette colours cascade in sequence — gold→blue→soft→cream,
       rotated each chapter so the dominant (last/top) colour cycles.     */
    const startIdx  = ringColorIdx++ % 4;
    const ordered   = RING_COLORS.map((_, i) => RING_COLORS[(startIdx + i) % 4]);
    const topColor  = ordered[3]; // the ring left visible at peak
    const textColor = topColor === '#88ABE3' ? '#F9F9F2' : '#222222';

    /* 4 rings appended to scene (position:absolute, clipped inside phone).
       Start at scene width so scale factor stays ~3-4× — avoids mobile
       rasterisation of a tiny element being stretched to fill the screen. */
    const _sw = scene.offsetWidth || 320;
    const rings = ordered.map((c, i) => {
      const r = document.createElement('div');
      r.style.cssText =
        `position:absolute;left:50%;top:50%;` +
        `width:${_sw}px;height:${_sw}px;margin:${-_sw/2}px 0 0 ${-_sw/2}px;` +
        `border-radius:50%;pointer-events:none;background:${c};` +
        `z-index:${200 + i};transform-origin:center center;`;
      scene.appendChild(r);
      return r;
    });

    /* Large bold label, absolutely positioned inside scene */
    const floatLbl = document.createElement('div');
    floatLbl.style.cssText =
      `position:absolute;z-index:210;left:50%;top:50%;` +
      `transform:translate(-50%,-50%);text-align:center;max-width:92%;` +
      `font-family:var(--font-display);font-size:clamp(56px,18cqw,96px);` +
      `font-weight:800;line-height:0.95;letter-spacing:-0.03em;` +
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
      const maxSc = Math.ceil(
        Math.hypot(_sw, scene.offsetHeight || 600) / _sw
      ) + 1;

      gsap.set(rings, { scale: 0 });

      // 1. Rings cascade expand
      await new Promise(r =>
        gsap.to(rings, { scale: maxSc, duration: 0.48, ease: 'power3.inOut', stagger: 0.1, onComplete: r })
      );

      // 2. Words punch in one by one — huge, overshoot, settle
      gsap.set(floatLbl, { opacity: 1 });
      if (window.SplitText) {
        const split = new SplitText(floatLbl, { type: 'words' });
        split.words.forEach(wEl => { wEl.style.display = 'inline-block'; });

        await new Promise(r => {
          gsap.timeline({ onComplete: r })
            .from(split.words, {
              opacity: 0,
              y: 90,
              scale: 0.25,
              rotation: () => gsap.utils.random(-14, 14),
              duration: 0.62,
              ease: hasCE ? 'yank' : 'back.out(2.8)',
              stagger: { each: 0.14, from: 'start' },
              clearProps: 'transform,opacity',
            })
            // settle pulse after last word lands
            .to(floatLbl, { scale: 1.06, duration: 0.1, ease: 'power1.out', yoyo: true, repeat: 1 }, '-=0.05');
        });

        // 3. Hold
        await w(1700);

        // 4. Words scatter out, rings contract, watermark slides in
        await new Promise(r =>
          gsap.timeline({ onComplete: r })
            .to(split.words, {
              opacity: 0,
              y: () => gsap.utils.random(-70, -20),
              scale: 1.25,
              rotation: () => gsap.utils.random(-8, 8),
              duration: 0.35,
              ease: 'power2.in',
              stagger: { each: 0.05, from: 'random' },
            })
            .to([...rings].reverse(), { scale: 0, duration: 0.4, ease: 'power2.inOut', stagger: 0.09 }, '-=0.15')
            .call(() => { split.revert(); rings.forEach(rEl => rEl.remove()); floatLbl.remove(); })
            .fromTo(bgLbl,
              { opacity: 0, x: '-18%' },
              { opacity: 0.06, x: '0%', duration: 0.6, ease: 'power2.out' }, '-=0.2')
        );
      } else {
        await new Promise(r => gsap.from(floatLbl, {
          scale: 0.6, y: 40, duration: 0.45, ease: 'back.out(3)', onComplete: r,
        }));
        await w(1700);
        await new Promise(r =>
          gsap.timeline({ onComplete: r })
            .to(floatLbl, { opacity: 0, y: -30, duration: 0.28, ease: 'power2.in' })
            .to([...rings].reverse(), { scale: 0, duration: 0.4, ease: 'power2.inOut', stagger: 0.09 }, '<+=0.08')
            .call(() => { rings.forEach(rEl => rEl.remove()); floatLbl.remove(); })
            .fromTo(bgLbl,
              { opacity: 0, x: '-18%' },
              { opacity: 0.06, x: '0%', duration: 0.6, ease: 'power2.out' }, '-=0.2')
        );
      }
    } else {
      rings.forEach(rEl => rEl.remove()); floatLbl.remove();
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
      `font-family:var(--font-body);font-size:10px;` +
      `fill:rgba(136,171,227,0.65);letter-spacing:1.5px;`;
    const tp = document.createElementNS(ns, 'textPath');
    tp.setAttribute('href', `#${pid}`);
    tp.textContent = phrase;
    txt.appendChild(tp);
    svg.appendChild(txt);

    if (window.getComputedStyle(anchorEl).position === 'static') {
      anchorEl.style.position = 'relative';
    }
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

  /* ── curveText: SVG arc label above/below an image element ─────────────
     opts: { radius=52, arc=160, above=true, color, fontSize, delay }      */
  function curveText(anchorEl, text, opts = {}) {
    const R    = opts.radius   || 52;
    const arc  = opts.arc      || 160;  // degrees of arc to span
    const above= opts.above !== false;
    const col  = opts.color    || 'rgba(136,171,227,0.75)';
    const fs   = opts.fontSize || 9;
    const delay= opts.delay    || 0;

    const D   = R * 2 + 24;
    const ns  = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width',   D);
    svg.setAttribute('height',  D);
    svg.setAttribute('viewBox', `0 0 ${D} ${D}`);
    svg.style.cssText =
      `position:absolute;pointer-events:none;z-index:31;opacity:0;overflow:visible;` +
      (above
        ? `bottom:100%;left:50%;transform:translateX(-50%);margin-bottom:-${R * 0.35}px;`
        : `top:100%;left:50%;transform:translateX(-50%);margin-top:-${R * 0.35}px;`);

    const pid  = `ct-${Math.random().toString(36).slice(2, 7)}`;
    const defs = document.createElementNS(ns, 'defs');

    // Build arc path
    const cx = D / 2, cy = D / 2;
    const startDeg = above ? (270 - arc / 2) : (90 - arc / 2);
    const endDeg   = above ? (270 + arc / 2) : (90 + arc / 2);
    const toRad = d => d * Math.PI / 180;
    const sx = cx + R * Math.cos(toRad(startDeg));
    const sy = cy + R * Math.sin(toRad(startDeg));
    const ex = cx + R * Math.cos(toRad(endDeg));
    const ey = cy + R * Math.sin(toRad(endDeg));
    const largeArc = arc > 180 ? 1 : 0;
    const sweep    = 1;

    const path = document.createElementNS(ns, 'path');
    path.setAttribute('id', pid);
    path.setAttribute('d', `M ${sx} ${sy} A ${R} ${R} 0 ${largeArc} ${sweep} ${ex} ${ey}`);
    path.setAttribute('fill', 'none');
    defs.appendChild(path);
    svg.appendChild(defs);

    const txt = document.createElementNS(ns, 'text');
    txt.style.cssText =
      `font-family:var(--font-body);font-size:${fs}px;` +
      `fill:${col};letter-spacing:1.8px;text-anchor:middle;`;
    const tp = document.createElementNS(ns, 'textPath');
    tp.setAttribute('href', `#${pid}`);
    tp.setAttribute('startOffset', '50%');
    tp.textContent = text;
    txt.appendChild(tp);
    svg.appendChild(txt);

    if (window.getComputedStyle(anchorEl).position === 'static') {
      anchorEl.style.position = 'relative';
    }
    anchorEl.style.overflow = 'visible';
    anchorEl.appendChild(svg);

    if (hasGSAP) {
      gsap.fromTo(svg, { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.5, delay, ease: 'back.out(2)',
          transformOrigin: '50% 50%' });
      gsap.to(svg, { opacity: 0, duration: 0.4, delay: delay + 4.5,
        onComplete: () => svg.remove() });
    } else {
      setTimeout(() => { svg.style.opacity = '1'; }, delay * 1000);
      setTimeout(() => svg.remove(), (delay + 5) * 1000);
    }
    return svg;
  }

  /* ── typewriterLine: character-by-character reveal with blinking cursor ─
     Returns the element. resolves when full text is visible.              */
  async function typewriterLine(text, cls = 'tg-pl--med', cpm = 38) {
    const el     = line('', cls);
    el.style.minHeight = '1.4em';
    const cursor = document.createElement('span');
    cursor.className = 'tg-cursor';
    el.appendChild(cursor);
    const ms = Math.max(18, Math.round(60000 / cpm / 5));
    for (const ch of text) {
      el.insertBefore(document.createTextNode(ch), cursor);
      HAPTIC.begin();
      await w(ms + (Math.random() * ms * 0.4 | 0));
    }
    await w(420);
    if (hasGSAP) {
      gsap.to(cursor, { opacity: 0, duration: 0.22, onComplete: () => cursor.remove() });
    } else {
      cursor.remove();
    }
    scrollPitch();
    return el;
  }

  /* ── wordPop: words slam in one-by-one, optionally coloured ─────────────
     colorSequence: array of CSS color strings (cycles), null = default text
     Returns the container element.                                         */
  async function wordPop(el, text, colorSequence = null) {
    const words = text.split(' ');
    el.textContent = '';
    // inline-flex + nowrap keeps everything on one line, no pill-padding blowout
    el.style.display = 'inline-flex';
    el.style.flexWrap = 'nowrap';
    el.style.gap = '0.18em';
    el.style.alignItems = 'baseline';

    for (let i = 0; i < words.length; i++) {
      const span = document.createElement('span');
      span.textContent = words[i];
      if (colorSequence) {
        const col = colorSequence[i % colorSequence.length];
        if (col) {
          // colour only — no pill padding so spacing stays natural
          span.style.color = col;
        }
      }
      el.appendChild(span);

      if (hasGSAP) {
        await new Promise(r =>
          gsap.from(span, {
            opacity: 0,
            y: -18,
            scale: 1.4,
            duration: 0.28,
            ease: hasCE ? 'snap' : 'back.out(3)',
            clearProps: 'all',
            onComplete: r,
          })
        );
      } else {
        await w(80);
      }
      HAPTIC.tap();
      await w(55);
    }
    return el;
  }

  /* ── testimonialReel: staggered quote cards ─────────────────────────────
     quotes: [{ text, attr }]                                              */
  async function testimonialReel(quotes) {
    const wrap = document.createElement('div');
    wrap.className = 'tg-pl';
    wrap.style.display = 'flex';
    wrap.style.flexDirection = 'column';
    wrap.style.gap = '0';
    pitch.appendChild(wrap);
    scrollPitch();

    for (const q of quotes) {
      const card = document.createElement('div');
      card.className = 'tg-testimonial';
      card.innerHTML = `${q.text}<span class="tg-testimonial-attr">${q.attr}</span>`;
      wrap.appendChild(card);
      scrollPitch();

      HAPTIC.card();
      if (hasGSAP) {
        await new Promise(r =>
          gsap.to(card, {
            opacity: 1, y: 0, duration: 0.42,
            ease: hasCE ? 'unfurl' : 'power3.out',
            onComplete: r,
          })
        );
      } else {
        card.style.opacity = '1';
        await w(500);
      }
      await w(320);
    }
    return wrap;
  }

  /* ── statsFormation: 3-cell inline formation block (for sAsk) ───────────
     cells: [{ n, l }]                                                     */
  async function statsFormation(cells) {
    const grid = document.createElement('div');
    grid.className = 'tg-pl tg-stats-formation';
    grid.style.opacity = '0';
    cells.forEach(c => {
      grid.innerHTML += `<div class="tg-sf-cell"><span class="tg-sf-n">${c.n}</span><span class="tg-sf-l">${c.l}</span></div>`;
    });
    pitch.appendChild(grid);
    scrollPitch();

    if (hasGSAP) {
      await new Promise(r =>
        gsap.fromTo(grid,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.5)', clearProps: 'transform', onComplete: r }
        )
      );
    } else {
      grid.style.opacity = '1';
    }
    return grid;
  }

  /* ── dimLines: split a long paragraph at sentence boundaries and reveal
     each chunk separately with breathing room between them.               */
  async function dimLines(text, gap = 200) {
    const chunks = text
      .split('. ')
      .map((s, i, arr) => i < arr.length - 1 ? s.trimEnd() + '.' : s.trimEnd())
      .filter(Boolean);
    for (const chunk of chunks) {
      await reveal(line(chunk, 'tg-pl--dim'), {
        y: 8, stagger: 0.06, duration: 0.50, ease: hasCE ? 'unfurl' : 'power3.out',
      });
      if (gap > 0) await w(gap);
    }
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
        'position:absolute;right:14px;top:50%;transform:translateY(-50%);' +
        'width:120px;height:auto;opacity:0;pointer-events:none;';
      card.style.paddingRight = '140px';
      card.appendChild(img);
    }
    container.appendChild(card);
    scrollPitch();

    if (hasGSAP) {
      HAPTIC.card();
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

      // Asset burst from card center after it lands
      setTimeout(() => assetBurst(card, 'data'), 380);
      if (stat.sweep) setTimeout(() => fullScreenAssetSweep(stat.sweep), 520);
    } else {
      card.querySelector('.tg-stat-n').style.cssText = `opacity:1;transform:none;color:${pal.fg}`;
      card.querySelector('.tg-stat-l').style.cssText = `opacity:0.84;color:${pal.fg}`;
    }
    return card;
  }

  /* ── Ambient crowd floaters ──────────────────────────────────────────────
     Character/avatar assets spread over the full scroll height — a crowd
     watching the pitch. One every ~180px, random left/right, visible but
     not obtrusive. Drop ./assets/g/g0.png…g12.png in to upgrade to avatars. */
  function spawnAmbientFloaters() {
    // Use real avatar assets (g0–g12); fall back to sticker assets if needed
    const gSrcs = Array.from({ length: 13 }, (_, i) => `./avatars/g${i}.png`);
    const fallback = [
      './assets/derpy.png','./assets/frog.png','./assets/caterpillar.png',
      './assets/flower.png','./assets/flowerpot.png','./assets/starhehe.png',
      './assets/babystar.png','./assets/coin.png','./assets/bread.png',
      './assets/turtle.png','./assets/waller.png','./assets/apple.png',
    ];

    // Probe first avatar; if it 404s, swap to fallback
    let srcs = gSrcs;
    const probe = new Image();
    probe.onerror = () => { srcs = fallback; };
    probe.src = gSrcs[0];

    // Estimate scroll height; place one floater every ~200px
    const estH  = Math.max(pitch.scrollHeight, 2400);
    const count = Math.round(estH / 200);

    for (let i = 0; i < count; i++) {
      const src = srcs[i % srcs.length];
      const img = document.createElement('img');
      img.src   = src;
      const sz  = 34 + Math.random() * 22;           // 34–56px
      const pct = 5  + Math.random() * 82;            // 5–87% left
      const top = 80 + i * 200 + (Math.random() - 0.5) * 70;
      img.style.cssText =
        `position:absolute;left:${pct}%;top:${top}px;` +
        `width:${sz}px;height:auto;opacity:0;pointer-events:none;` +
        `z-index:1;will-change:transform;border-radius:50%;`;
      pitch.appendChild(img);
      if (hasGSAP) {
        const targetOp = 0.22 + Math.random() * 0.13;  // 22–35%
        gsap.to(img, { opacity: targetOp,
          duration: 1.8, delay: i * 0.07, ease: 'power2.out' });
        gsap.to(img, {
          y: -(26 + Math.random() * 38),
          rotation: (Math.random() - 0.5) * 12,
          duration: 2.6 + Math.random() * 2.8,
          ease: 'sine.inOut', yoyo: true, repeat: -1,
          delay: Math.random() * 3.5,
        });
      }
    }
  }

  // Type C — pull quote: shimmer border + ScrambleText reveal
  async function pqReveal(text, assetSrc = null, assetOpts = {}, assetCls = 'tg-decal--bob') {
    await w(300);
    HAPTIC.begin();
    const pqFills = ['#EEF4FF', '#FDFBEE']; // very pale blue, very pale cream — alternate each card
    const pqBg = pqFills[pqColorIdx++ % pqFills.length];
    const shimmer = document.createElement('div');
    shimmer.className = 'tg-pl tg-pq-shimmer';
    shimmer.style.opacity = '0';
    const d = document.createElement('blockquote');
    d.className = 'tg-pq-inner';
    d.style.background = pqBg;
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

  // Type F — reveal list: marker snaps in, then text slides in, then next item
  function rlist(items) {
    const d = document.createElement('div');
    d.className = 'tg-pl tg-rlist';
    items.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'tg-ritem';
      const marker = document.createElement('span');
      marker.className = 'tg-ritem-marker';
      marker.textContent = item.m || '→';
      marker.style.opacity = '0';
      const textSpan = document.createElement('span');
      textSpan.className = 'tg-ritem-text';
      textSpan.innerHTML = item.t;
      textSpan.style.opacity = '0';
      row.appendChild(marker);
      row.appendChild(textSpan);
      d.appendChild(row);
    });
    pitch.appendChild(d);
    scrollPitch();
    return d;
  }

  async function rlistReveal(items) {
    const d = rlist(items);
    if (!hasGSAP) {
      // no GSAP — just make everything visible immediately
      d.querySelectorAll('.tg-ritem-marker, .tg-ritem-text').forEach(el => el.style.opacity = '');
      return d;
    }
    for (const row of d.querySelectorAll('.tg-ritem')) {
      const marker = row.querySelector('.tg-ritem-marker');
      const textEl  = row.querySelector('.tg-ritem-text');
      // marker drifts in softly
      await new Promise(r => gsap.fromTo(marker,
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', clearProps: 'y', onComplete: r },
      ));
      // text: soft blur-up fade
      await new Promise(r => gsap.fromTo(textEl,
        { opacity: 0, y: 10, filter: 'blur(3px)' },
        { opacity: 1, y: 0,  filter: 'blur(0px)',
          duration: 0.44, ease: hasCE ? 'unfurl' : 'power3.out',
          clearProps: 'filter,y', onComplete: r },
      ));
      HAPTIC.tap();
      await w(140);
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
      // Pre-invisible: no flash before GSAP, and no accidental early tap on touchscreen
      [...wrap.querySelectorAll('.tg-pitch-choice')].forEach(b => b.style.opacity = '0');
      pitch.appendChild(wrap);
      scrollPitch();
      HAPTIC.begin();
      if (hasGSAP) {
        gsap.fromTo([...wrap.querySelectorAll('.tg-pitch-choice')],
          { opacity: 0, x: (i) => i % 2 === 0 ? 48 : -28, scale: 0.88, filter: 'blur(4px)' },
          { opacity: 1, x: 0, scale: 1, filter: 'none',
            duration: 0.52, ease: hasCE ? 'yank' : 'back.out(2)',
            stagger: { each: 0.09, ease: 'power2.inOut' },
            clearProps: 'all' },
        );
      } else {
        [...wrap.querySelectorAll('.tg-pitch-choice')].forEach(b => b.style.opacity = '');
      }
      window._bc = idx => {
        HAPTIC.tap();
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
        // Asset burst from selected button
        assetBurst(sel, 'celebrate');
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

  async function generateShareCard(arch, id, data) {
    const W = 900, H = 1200;
    const cvs = document.createElement('canvas');
    cvs.width = W; cvs.height = H;
    const ctx = cvs.getContext('2d');

    // ── Palette ───────────────────────────────────────────────────────
    const ARCH_COLORS = {
      cartographer: '#DBD59C', contrarian: '#88ABE3',
      architect:    '#C3D9FF', operator:   '#E8F0FF', storyteller: '#DBD59C',
    };
    const ARCH_ASSETS = {
      cartographer: 'camera.png',   contrarian: 'boomerand.png',
      architect:    'house.png',    operator:   'watch.png', storyteller: 'mic.png',
    };
    const ARCH_TYPE_IMG = {
      cartographer: 'Cartographer.png', contrarian: 'Contrarian.png',
      architect:    'Architect.png',    operator:   'Operator.png', storyteller: 'Storyteller.png',
    };

    const accentColor = ARCH_COLORS[id] || '#DBD59C';
    const BLUE  = '#88ABE3';
    const CREAM = '#F9F9F2';
    const DARK  = '#222222';
    const PAD   = 18;   // outer card padding
    const GAP   = 10;   // gap between bento tiles
    const IW    = W - PAD * 2;   // 864px inner width

    // ── Helpers ───────────────────────────────────────────────────────
    function scRoundRect(x, y, w, h, r, fill, stroke) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      if (fill)   { ctx.fillStyle   = fill;   ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
    }

    function clipRR(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath(); ctx.clip();
    }

    async function drawAsset(src, x, y, w, h, rotDeg = 0) {
      return new Promise(res => {
        const img = new Image();
        img.onload = () => {
          if (rotDeg !== 0) {
            ctx.save();
            ctx.translate(x + w / 2, y + h / 2);
            ctx.rotate(rotDeg * Math.PI / 180);
            ctx.drawImage(img, -w / 2, -h / 2, w, h);
            ctx.restore();
          } else { ctx.drawImage(img, x, y, w, h); }
          res();
        };
        img.onerror = res; img.src = src;
      });
    }

    async function drawAssetFit(src, x, y, w, h) {
      return new Promise(res => {
        const img = new Image();
        img.onload = () => {
          const s = Math.min(w / img.naturalWidth, h / img.naturalHeight);
          ctx.drawImage(img, x + (w - img.naturalWidth * s) / 2, y + (h - img.naturalHeight * s) / 2, img.naturalWidth * s, img.naturalHeight * s);
          res();
        };
        img.onerror = res; img.src = src;
      });
    }

    async function drawAssetCover(src, x, y, w, h) {
      return new Promise(res => {
        const img = new Image();
        img.onload = () => {
          const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
          const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
          ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
          res();
        };
        img.onerror = res; img.src = src;
      });
    }

    function wrapText(text, x, y, maxW, lineH) {
      const words = text.split(' '); let line = ''; const lines = [];
      for (const word of words) {
        const test = line ? line + ' ' + word : word;
        if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = word; }
        else { line = test; }
      }
      if (line) lines.push(line);
      lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineH));
      return lines.length;
    }

    async function generateQR(url, size) {
      if (typeof QRCode === 'undefined') return null;
      return new Promise(resolve => {
        const div = document.createElement('div');
        div.style.cssText = 'position:fixed;left:-9999px;top:-9999px;';
        document.body.appendChild(div);
        new QRCode(div, { text: url, width: size, height: size, colorDark: '#222222', colorLight: '#F9F9F2', correctLevel: QRCode.CorrectLevel.M });
        setTimeout(() => {
          const qc = div.querySelector('canvas'), qi = div.querySelector('img');
          if (qc) { div.remove(); resolve(qc); }
          else if (qi) {
            const c = document.createElement('canvas'); c.width = size; c.height = size;
            const x = c.getContext('2d'), i = new Image();
            i.onload = () => { x.drawImage(i, 0, 0, size, size); div.remove(); resolve(c); };
            i.src = qi.src;
          } else { div.remove(); resolve(null); }
        }, 300);
      });
    }

    function setLS(val) { try { ctx.letterSpacing = val; } catch(e) {} }
    function hexRgba(hex, a) {
      const h = hex.replace('#','');
      return `rgba(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)},${a})`;
    }

    // ── Session signals ───────────────────────────────────────────────
    const recapTraits = (data && data.traits) || [];
    const sessionSigs = [];
    if (data && data.firstChoiceLabel) sessionSigs.push(`came in as a ${data.firstChoiceLabel}`);
    if (recapTraits[0]) sessionSigs.push(recapTraits[0]);
    if (data) {
      if      (data.wentDeepOnMoat)    sessionSigs.push('stayed for the flywheel');
      else if (data.wentStraightToAsk) sessionSigs.push('cut straight to the ask');
      else if (data.usedFounderPath)   sessionSigs.push('led with the founder');
      else if (data.pushedBackOnData)  sessionSigs.push('pushed back on the data');
    }
    const signals   = sessionSigs.slice(0, 3);
    const moveCount = (data && data.pathLength) || 0;

    // ── Font preload ──────────────────────────────────────────────────
    try {
      await Promise.all([
        document.fonts.load('900 46px "Playfair Display"'),
        document.fonts.load('400 italic 17px "Playfair Display"'),
        document.fonts.load('400 13px "DM Mono"'),
      ]);
    } catch(e) {}

    // ── Layout constants ─────────────────────────────────────────────
    const COL_L  = 340;              // title text column width (in top tile)
    const TILE_Y = 44;               // first tile top-y
    const R1_H   = 322;              // top tile height (title + portrait)
    const R2_Y   = TILE_Y + R1_H + GAP;   // 376
    const R2_H   = 160;              // quote + traits row
    const R3_Y   = R2_Y + R2_H + GAP;    // 546
    const R3_H   = 200;              // signals row
    const R4_Y   = R3_Y + R3_H + GAP;    // 756
    const R4_H   = 100;              // stats mini-row
    const R5_Y   = R4_Y + R4_H + GAP;    // 866
    const R5_H   = H - R5_Y - PAD;       // 316
    const TR     = 16;               // tile border radius
    const TP     = 20;               // tile inner padding

    // ════════════════════════════════════════════════════════════════
    // DRAW
    // ════════════════════════════════════════════════════════════════

    // Card background
    ctx.fillStyle = CREAM;
    ctx.fillRect(0, 0, W, H);

    // Accent bar at top
    ctx.fillStyle = accentColor;
    ctx.fillRect(0, 0, W, 3);

    // Eyebrow
    ctx.textBaseline = 'top'; ctx.textAlign = 'left';
    ctx.fillStyle = BLUE; ctx.font = '400 9px "DM Mono", monospace';
    setLS('0.16em'); ctx.fillText('INVESTOR ARCHETYPE · TROVE', PAD, 16);
    ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(34,34,34,0.30)';
    setLS('0.04em'); ctx.fillText('2026', W - PAD, 16); setLS('0');

    // ── TILE 1: Title + Portrait (full-width, white) ──────────────────
    const T1X = PAD, T1Y = TILE_Y, T1W = IW, T1H = R1_H;
    scRoundRect(T1X, T1Y, T1W, T1H, TR, '#FFFFFF', 'rgba(34,34,34,0.07)');

    // Title text (left column)
    ctx.fillStyle = BLUE; ctx.font = '400 9px "DM Mono", monospace';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    setLS('0.16em'); ctx.fillText('YOUR TYPE', T1X + TP, T1Y + TP); setLS('0');

    ctx.fillStyle = 'rgba(34,34,34,0.42)'; ctx.font = '400 15px "DM Mono", monospace';
    setLS('0.06em'); ctx.fillText('The', T1X + TP, T1Y + TP + 26); setLS('0');

    // Archetype word — auto-fit font
    const archWord = arch.name.replace(/^The\s+/, '');
    let nfs = 48;
    ctx.font = `900 ${nfs}px "Playfair Display", serif`;
    setLS('-0.02em');
    const nameMaxW = COL_L - TP * 2;
    if (ctx.measureText(archWord).width > nameMaxW) {
      nfs = Math.floor(nfs * nameMaxW / ctx.measureText(archWord).width);
      ctx.font = `900 ${nfs}px "Playfair Display", serif`;
    }
    ctx.fillStyle = DARK;
    ctx.fillText(archWord, T1X + TP, T1Y + TP + 50);
    setLS('0');

    // Tagline
    const taglineY = T1Y + TP + 50 + Math.round(nfs * 1.2);
    ctx.fillStyle = 'rgba(34,34,34,0.55)'; ctx.font = '400 12px "DM Mono", monospace';
    setLS('0.02em'); ctx.fillText(arch.sub, T1X + TP, taglineY); setLS('0');

    // Archetype doodle — bottom-left of title column
    const DSZ = 52;
    await drawAsset(
      `./assets/${ARCH_ASSETS[id] || 'camera.png'}`,
      T1X + TP, T1Y + T1H - DSZ - TP, DSZ, DSZ, 8
    );

    // Portrait — right side, square cover-crop
    const IMG_X  = T1X + COL_L + GAP;
    const IMG_W  = T1W - COL_L - GAP;              // 514px
    const IMG_SQ = Math.min(IMG_W, T1H);            // 322px square
    const IMG_OX = IMG_X + Math.round((IMG_W - IMG_SQ) / 2);
    ctx.save();
    clipRR(IMG_OX, T1Y, IMG_SQ, T1H, TR);
    await drawAssetCover(`./assets/${ARCH_TYPE_IMG[id] || 'Cartographer.png'}`, IMG_OX, T1Y, IMG_SQ, T1H);
    ctx.restore();

    // ── TILE 3: Quote (middle-left) ───────────────────────────────────
    const T3X = PAD, T3Y = R2_Y, T3W = 380, T3H = R2_H;
    scRoundRect(T3X, T3Y, T3W, T3H, TR, hexRgba(BLUE, 0.18), null);

    ctx.fillStyle = DARK; ctx.font = '400 italic 15px "Playfair Display", serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    wrapText(`"${arch.insight}"`, T3X + TP, T3Y + TP, T3W - TP * 2, 24);

    // ── TILE 4: Traits (middle-right) ────────────────────────────────
    const T4X = PAD + 380 + GAP, T4Y = R2_Y, T4W = IW - 380 - GAP, T4H = R2_H;
    scRoundRect(T4X, T4Y, T4W, T4H, TR, CREAM, 'rgba(34,34,34,0.07)');

    ctx.fillStyle = 'rgba(34,34,34,0.38)'; ctx.font = '400 9px "DM Mono", monospace';
    ctx.textBaseline = 'top'; setLS('0.16em');
    ctx.fillText('TRAITS', T4X + TP, T4Y + TP); setLS('0');

    const pW = T4W - TP * 2, pH = 30, pGap = 8, pStart = T4Y + TP + 22;
    (arch.traits || []).slice(0, 3).forEach((trait, i) => {
      const py = pStart + i * (pH + pGap);
      scRoundRect(T4X + TP, py, pW, pH, 8, hexRgba(accentColor, 0.22), hexRgba(accentColor, 0.50));
      ctx.fillStyle = DARK; ctx.font = '400 11px "DM Mono", monospace';
      ctx.textBaseline = 'middle'; setLS('0.08em');
      ctx.fillText(trait.toUpperCase(), T4X + TP + 12, py + pH / 2);
      setLS('0');
    });

    // ── TILE 5: Your Signals (full-width, dark) ──────────────────────
    const T5X = PAD, T5Y = R3_Y, T5W = IW, T5H = R3_H;
    scRoundRect(T5X, T5Y, T5W, T5H, TR, DARK, null);

    // Ghost archetype doodle watermark
    ctx.save(); ctx.globalAlpha = 0.07;
    await drawAsset(`./assets/${ARCH_ASSETS[id] || 'camera.png'}`, T5X + T5W - 152, T5Y + (T5H - 140) / 2, 140, 140, -6);
    ctx.globalAlpha = 1; ctx.restore();

    // Ghost move count number
    if (moveCount > 0) {
      ctx.save();
      ctx.font = `900 120px "Playfair Display", serif`;
      ctx.fillStyle = 'rgba(249,249,242,0.04)';
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(String(moveCount), T5X + T5W - 160, T5Y + T5H / 2);
      ctx.restore();
    }

    // "YOUR SIGNALS" label
    ctx.fillStyle = BLUE; ctx.font = '400 9px "DM Mono", monospace';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    setLS('0.18em'); ctx.fillText('YOUR SIGNALS', T5X + TP, T5Y + TP); setLS('0');

    // All behavioral signals
    const allSigs = (data && data.allSignals && data.allSignals.length) ? data.allSignals : signals;
    ctx.font = '400 13px "DM Mono", monospace';
    ctx.fillStyle = 'rgba(249,249,242,0.88)'; setLS('0.01em');
    allSigs.slice(0, 5).forEach((sig, i) => ctx.fillText(`— ${sig}`, T5X + TP, T5Y + TP + 24 + i * 27));
    setLS('0');

    // Move count right-aligned
    if (moveCount > 0) {
      ctx.fillStyle = hexRgba(BLUE, 0.65);
      ctx.font = '400 11px "DM Mono", monospace';
      ctx.textAlign = 'right'; setLS('0.06em');
      ctx.fillText(`${moveCount} scenes`, T5X + T5W - TP, T5Y + T5H - TP - 2);
      setLS('0');
    }

    // ── Stats mini-row (3 tiles) ─────────────────────────────────────
    const ST_Y = R4_Y, ST_H = R4_H;
    const ST_W = Math.floor((IW - GAP * 2) / 3);
    const ST_W3 = IW - ST_W * 2 - GAP * 2;
    [
      { x: PAD,                    w: ST_W,  label: 'SCENES EXPLORED', val: String(data ? data.pathLength : moveCount) },
      { x: PAD + ST_W + GAP,       w: ST_W,  label: 'ENTRY ANGLE',     val: (data && data.firstChoiceLabel) || '—' },
      { x: PAD + (ST_W + GAP) * 2, w: ST_W3, label: 'EXIT MOVE',       val: (data && data.exitMove) || '—' },
    ].forEach(({ x, w, label, val }) => {
      scRoundRect(x, ST_Y, w, ST_H, 12, hexRgba(BLUE, 0.10), hexRgba(BLUE, 0.22));
      ctx.fillStyle = BLUE; ctx.font = '400 8px "DM Mono", monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      setLS('0.14em'); ctx.fillText(label, x + 14, ST_Y + 14); setLS('0');
      ctx.fillStyle = DARK; ctx.font = '700 13px "DM Mono", monospace';
      ctx.textBaseline = 'bottom'; setLS('0.02em');
      const vMaxW = w - 28;
      if (ctx.measureText(val).width > vMaxW) {
        const words = val.split(' '), half = Math.ceil(words.length / 2);
        ctx.fillText(words.slice(0, half).join(' '), x + 14, ST_Y + ST_H - 22);
        ctx.fillText(words.slice(half).join(' '),    x + 14, ST_Y + ST_H - 8);
      } else {
        ctx.fillText(val, x + 14, ST_Y + ST_H - 8);
      }
      setLS('0');
    });

    // ── TILE 7: Trove CTA + QR (full-width) ──────────────────────────
    const T7X = PAD, T7Y = R5_Y, T7W = IW, T7H = R5_H;
    scRoundRect(T7X, T7Y, T7W, T7H, TR, hexRgba(accentColor, 1), null);

    // Scattered decorative assets (left section, semi-transparent)
    ctx.save(); ctx.globalAlpha = 0.25;
    await drawAsset('./assets/starhehe.png',                         T7X + 12,         T7Y + 14,         40, 40, -14);
    await drawAsset('./assets/coin.png',                             T7X + T7W * 0.30, T7Y + T7H - 50,   34, 34,  10);
    await drawAsset('./assets/flower.png',                           T7X + T7W * 0.16, T7Y + T7H * 0.45, 30, 30,  20);
    await drawAsset(`./assets/${ARCH_ASSETS[id] || 'camera.png'}`,  T7X + T7W * 0.32, T7Y + 14,         38, 38,  -8);
    await drawAsset('./assets/babystar.png',                         T7X + 14,         T7Y + T7H - 50,   28, 28,   6);
    ctx.globalAlpha = 1; ctx.restore();

    // Logo
    await drawAsset('./TroveLogo.png', T7X + TP, T7Y + TP + 4, 114, 34, 0);

    // CTA text
    ctx.fillStyle = 'rgba(34,34,34,0.72)'; ctx.font = '400 12px "DM Mono", monospace';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top'; setLS('0.04em');
    ctx.fillText('see your type →', T7X + TP, T7Y + TP + 4 + 34 + 16);
    setLS('0');

    // URL
    ctx.fillStyle = 'rgba(34,34,34,0.40)'; ctx.font = '400 10px "DM Mono", monospace';
    setLS('0.02em');
    ctx.fillText('henliz.github.io/not-a-deck-pitch', T7X + TP, T7Y + TP + 4 + 34 + 38);
    setLS('0');

    // QR code with white inset tile
    const QR_SZ = Math.min(T7H - TP * 2 - 22, 240);
    const qrCanvas = await generateQR('https://henliz.github.io/not-a-deck-pitch/', QR_SZ);
    if (qrCanvas) {
      const qrX = T7X + T7W - QR_SZ - TP - 10;
      const qrY = T7Y + Math.round((T7H - QR_SZ - 20) / 2);
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.14)'; ctx.shadowBlur = 14;
      scRoundRect(qrX - 10, qrY - 10, QR_SZ + 20, QR_SZ + 30, 12, '#FFFFFF', null);
      ctx.restore();
      ctx.drawImage(qrCanvas, qrX, qrY, QR_SZ, QR_SZ);
      ctx.fillStyle = 'rgba(34,34,34,0.35)'; ctx.font = '400 10px "DM Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top'; setLS('0.08em');
      ctx.fillText('scan to play', qrX + QR_SZ / 2, qrY + QR_SZ + 6);
      setLS('0');
    }

    // Outer frame
    ctx.strokeStyle = 'rgba(34,34,34,0.07)';
    ctx.lineWidth   = 1;
    ctx.strokeRect(0.5, 0.5, W - 1, H - 1);

    return cvs;
  }

  function contBtn(label) {
    return new Promise(resolve => {
      const wrap = document.createElement('div');
      wrap.className = 'tg-pl tg-pitch-choices';
      const btn = document.createElement('button');
      btn.className = 'tg-pitch-choice';
      btn.textContent = label;
      btn.style.opacity = '0';
      btn.onclick = () => { HAPTIC.tap(); btn.disabled = true; disintegrate(wrap); setTimeout(resolve, 350); };
      wrap.appendChild(btn);
      pitch.appendChild(wrap);
      scrollPitch();
      if (hasGSAP) gsap.fromTo(btn, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.42, ease: 'power3.out', clearProps: 'all' });
      else btn.style.opacity = '';
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
    await reveal(line('What if the data existed? Not what they said about themselves —', 'tg-pl--med'), {
      y: 18, stagger: 0.05, duration: 0.44, blur: true, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(200);
    const questionEl = line('<span class="tg-hl">what they actually did<br>when it mattered.</span>', 'tg-pl--big');
    await reveal(questionEl, {
      type: 'chars', y: 0,
      scale: () => gsap.utils.random(0.1, 0.5),
      rotation: () => gsap.utils.random(-14, 14),
      stagger: 0.045, from: 'center', duration: 0.58, ease: hasCE ? 'slam' : 'back.out(3)',
    });
    questionEl.style.position = 'relative'; questionEl.style.overflow = 'visible';
    questionEl.appendChild(decal('id.png', 'tg-decal--bob', { right: '-20px', top: '0', w: 48, delay: 0.3 }));
    await w(300);
    const idx = await branchChoices([
      "That data doesn't exist. Walk me through how it could.",
      "I've seen a hundred behavioral tools. What makes this one different.",
      "I want to know who's building it before I read anything else.",
    ]);
    firstChoice = idx;
    score([[1,2,0,0,1],[0,0,2,2,0],[0,1,0,3,0]][idx]);
    if (idx === 0) await sA1_curious();
    else if (idx === 1) await sB1_seen();
    else await sC1_founder();
  }

  // ── BRANCH A ──────────────────────────────────────────
  async function sA1_curious() {
    branchPath.push('A1');
    await w(900); line('', 'tg-pl', 16);
    await ringWipeChapter('The Signal Problem');
    await w(200);
    // Type B — narration
    await reveal(line('<span class="tg-hl">Every important decision</span> about people runs on one type of data:', 'tg-pl--med'), {
      y: 16, stagger: 0.07, duration: 0.55, blur: true, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(200);
    // Type A — statement
    flash();
    await reveal(line('what they<br>say about<br>themselves.', 'tg-pl--big'), {
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
    await reveal(deadEl, { y: 14, stagger: 0.07, duration: 0.55, ease: hasCE ? 'unfurl' : 'power3.out' });
    // Heartbreak anchors right beside the word "dead."
    const deadWord = deadEl.querySelector('.tg-dead-word');
    if (deadWord) {
      deadWord.style.position = 'relative';
      deadWord.style.overflow = 'visible';
      deadWord.appendChild(decal('heartbreak.png', 'tg-decal--lubdub', { left: 'calc(100% + 4px)', top: '-6px', w: 52, fromY: -30, delay: 0.2 }));
    }
    await w(500);
    await reveal(line('40–80% of applicants now use AI to write about themselves.', 'tg-blockquote'), {
      y: 8, stagger: 0.022, duration: 0.34, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(220);
    await reveal(line('$8.8 trillion lost annually to employee disengagement.', 'tg-blockquote'), {
      y: 8, stagger: 0.022, duration: 0.34, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(440);
    crtTicker('the cost of not actually knowing the people you hire');
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
    branchPath.push('A2a');
    await w(900); line('', 'tg-pl', 16);
    await ringWipeChapter('The New Signal');
    await w(200);
    // Type B — setup
    await reveal(line('You <span class="tg-hl-b">stop asking</span> people who they are.', 'tg-pl--med'), {
      y: 16, stagger: 0.07, duration: 0.55, blur: true, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(600); // longer pause — next line is the answer
    flash();
    // Type D — the answer, word-by-word from center
    const watchEl = line('You watch them<br>make decisions.', 'tg-pl--big', 8);
    watchEl.style.whiteSpace = 'nowrap';
    watchEl.style.fontSize = 'clamp(22px, 9cqw, 40px)';
    if (hasGSAP) {
      const split = new SplitText(watchEl, { type: 'words' });
      await new Promise(r => gsap.from(split.words, {
        opacity: 0, scale: 0.7,
        duration: 0.5, ease: hasCE ? 'snap' : 'back.out(3)',
        stagger: { each: 0.12, from: 'center' },
        clearProps: 'transform,scale', onComplete: r,
      }));
    }
    // Camera beside "watch" — with periodic flash
    watchEl.style.position = 'relative'; watchEl.style.overflow = 'visible';
    const cameraImg = decal('camera.png', 'tg-decal--bob', { right: '-22px', top: '0', w: 46, delay: 0.2 });
    watchEl.appendChild(cameraImg);
    if (hasGSAP) {
      // Flash fires after decal lands (~0.9s), then pulses every ~3s
      gsap.timeline({ delay: 0.95, repeat: -1, repeatDelay: 2.8 })
        .to(cameraImg, { filter: 'brightness(6) saturate(0)', scale: 1.12, duration: 0.05, ease: 'none' })
        .to(cameraImg, { filter: 'brightness(1) saturate(1)', scale: 1, duration: 0.38, ease: 'power2.out' });
    }
    await w(700);
    // Type B — narration (gaming.png moved to pq card below)
    const tanglesEl = line('Trove builds <span class="tg-hl">tangles</span> — interactive, story-based scenarios that put you inside <span class="tg-hl-b">emotionally real moments.</span>', 'tg-pl--med');
    await reveal(tanglesEl, {
      y: 14, stagger: 0.035, duration: 0.4, blur: true, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(160);
    await reveal(line('A first date. A workplace crisis. A creative standoff at midnight.', 'tg-pl--med'), {
      y: 12, stagger: 0.07, duration: 0.52, blur: true, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(120);
    await reveal(line('You make choices. <span class="tg-hl">Real ones, under actual pressure.</span>', 'tg-pl--med'), {
      y: 12, stagger: 0.07, duration: 0.52, blur: true, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(350);
    // Type C — pull quote (gaming.png large, overlapping top-right corner)
    await pqReveal('The scenario is the instrument. The choice is the data.',
      'gaming.png', { right: '-28px', top: '-36px', w: 96, fromY: -30, delay: 0.5 });
    await dimLines('Not "how would you handle conflict?" — a conflict. One you\'re actually inside. The way you move through it: what you push on, what you deflect, how long you hold ambiguity. Impossible to fake consistently across twelve different contexts.');
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
    branchPath.push('A2b'); pushedBackOnData = true;
    await w(900); line('', 'tg-pl', 16);
    await ringWipeChapter('Why This Survives');
    await w(200);
    await reveal(line('Every previous attempt made <span class="tg-hl">the same mistake.</span>', 'tg-pl--med'), {
      y: 16, stagger: 0.07, duration: 0.55, blur: true, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(350);
    await dimLines('They still asked people to describe their behaviour. Personality tests — self-reported. 360 reviews — observer-reported. Assessment centres — performed. All gameable. All dead in an AI world.', 160);
    await w(400);
    // Type A — statement
    flash();
    const fundamentalEl = line('Trove\'s<br>fundamental<br>move: you never<br>ask.', 'tg-pl--big');
    fundamentalEl.style.whiteSpace = 'nowrap';
    fundamentalEl.style.fontSize = 'clamp(24px, 9.5cqw, 44px)';
    await reveal(fundamentalEl, {
      type: 'chars', y: 0,
      scale: () => gsap.utils.random(0.1, 0.5),
      rotation: () => gsap.utils.random(-15, 15),
      stagger: 0.05, from: 'center', duration: 0.65, ease: hasCE ? 'slam' : 'back.out(3)',
    });
    await w(600);
    await reveal(line('You build a scenario. You watch what someone does.', 'tg-pl--med'), {
      y: 14, stagger: 0.07, duration: 0.52, blur: true, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(120);
    await reveal(line('The measurement is <span class="tg-hl-b">invisible</span> — they\'re too absorbed in the story to perform.', 'tg-pl--med'), {
      y: 12, stagger: 0.065, duration: 0.52, blur: true, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(350);
    // Type C — pull quote + phone decal
    await pqReveal(
      '"This game read me for absolute filth."<span class="tg-pq-attr">— a Valentine\'s Day player. Completely unprompted.</span>',
      'phone.png', { right: '-24px', top: '-8px', w: 72, delay: 0.5 }, 'tg-decal--ring'
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
    branchPath.push('B1');
    await w(900); line('', 'tg-pl', 16);
    await ringWipeChapter('Not a Tool. A Layer.');
    await w(200);
    await reveal(line('Most behavioural tools sit on top of <span class="tg-hl">existing workflows.</span>', 'tg-pl--med'), {
      y: 14, stagger: 0.065, duration: 0.52, blur: true, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(120);
    await reveal(line('You administer them. Someone takes the test. <span class="tg-hl-b">You get a report.</span>', 'tg-pl--med'), {
      y: 12, stagger: 0.065, duration: 0.52, blur: true, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(350);
    // ── "Trove is" with TroveOh spin animation ──
    flash();
    const troveIsWrap = document.createElement('div');
    troveIsWrap.className = 'tg-pl';
    troveIsWrap.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:4px;';

    const logoWrap = document.createElement('span');
    logoWrap.className = 'tg-hero-logo';
    logoWrap.style.marginTop = '18px'; // move logo down a bit

    const wordImg = document.createElement('img');
    wordImg.src = './TroveLogo.png'; wordImg.className = 'tg-hero-word'; wordImg.style.opacity = '0';
    const ohImg  = document.createElement('img');
    ohImg.src  = './TroveOh.png';   ohImg.className  = 'tg-hero-oh';
    logoWrap.append(wordImg, ohImg);

    const isSpan = document.createElement('span');
    isSpan.style.cssText = 'font-family:var(--font-display);font-size:clamp(30px,12cqw,52px);font-weight:700;line-height:1.05;color:var(--anchor);opacity:0;';
    isSpan.textContent = 'is';

    troveIsWrap.append(logoWrap, isSpan);
    pitch.appendChild(troveIsWrap);
    scrollPitch();

    await new Promise(resolve => {
      let loaded = 0;
      const onLoad = () => { if (++loaded < 2) return; go(); };
      wordImg.onload = onLoad; ohImg.onload = onLoad;
      if (wordImg.complete) onLoad();
      if (ohImg.complete)   onLoad();

      function go() {
        const W    = wordImg.offsetWidth || 88;
        const ohW  = ohImg.offsetWidth   || 24;
        const startX = W + 14;
        const endX   = Math.round(W * 0.48 - ohW / 2);
        // Fade "is" in shortly after the Oh starts spinning
        setTimeout(() => {
          if (hasGSAP) gsap.fromTo(isSpan, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power3.out', clearProps: 'all' });
          else isSpan.style.opacity = '1';
        }, 420);
        ohImg.style.transform = `translateX(${startX}px)`;
        const ease = p => p < 0.5 ? 2*p*p : 1 - Math.pow(-2*p+2,2)/2;
        let t0 = null;
        function frame(ts) {
          if (!t0) t0 = ts;
          const elapsed = ts - t0;
          const p  = Math.min(1, elapsed / 2100);
          const e  = ease(p);
          ohImg.style.transform  = `translateX(${startX + (endX - startX) * e}px) rotate(${e * 720}deg)`;
          const cp = Math.max(0, Math.min(1, (elapsed - 2100 * 0.62) / 620));
          ohImg.style.opacity  = String(1 - cp);
          wordImg.style.opacity = String(cp);
          if (p < 1) requestAnimationFrame(frame);
          else { ohImg.remove(); HAPTIC.burst(); resolve(); }
        }
        requestAnimationFrame(frame);
      }
    });
    await w(200);

    // ── "infrastructure." on its own line ──
    const infraLine = line('infrastructure.', 'tg-pl--punch');
    await reveal(infraLine, {
      type: 'chars', y: 0,
      scale: () => gsap.utils.random(0.1, 0.5),
      rotation: () => gsap.utils.random(-15, 15),
      stagger: 0.05, from: 'center', duration: 0.65, ease: hasCE ? 'slam' : 'back.out(3)',
    });
    infraLine.style.position = 'relative'; infraLine.style.overflow = 'visible';
    const houseDecal = decal('house.png', 'tg-decal--bob', { right: '-26px', top: '-14px', w: 54, fromY: -30, delay: 0.3 });
    infraLine.appendChild(houseDecal);
    setTimeout(() => curveText(houseDecal, '\u2736 BEHAVIORAL LAYER \u2736 INFRASTRUCTURE \u2736 MOAT \u2736',
      { above: false, radius: 44, arc: 200, fontSize: 7.5, delay: 0 }), 500);
    await w(600);
    for (const s of [
      'Consumers play <span class="tg-hl">interactive stories</span> — scenarios that feel like games.',
      'Underneath, a behavioural science engine builds <span class="tg-hl-b">a profile they own.</span>',
      'When they apply for a job, go on a date, or authorize a landlord to screen them, they share that profile. <span class="tg-hl">The platform pays to read it.</span>',
    ]) {
      await reveal(line(s, 'tg-pl--med'), {
        y: 12, stagger: 0.065, duration: 0.52, blur: true, ease: hasCE ? 'unfurl' : 'power3.out',
      });
      await w(180);
    }
    await w(350);
    await pqReveal('Think Duolingo on the consumer side. Think Plaid on the B2B side. Behavioral data is the asset class.');
    await dimLines('The moat is the dataset. Every play makes the models sharper. Sharper models make the profiles more accurate. More accurate profiles make the B2B product worth more. That loop doesn\'t have a ceiling.', 160);
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
    branchPath.push('B2b');
    await w(900); line('', 'tg-pl', 16);
    await ringWipeChapter('The B2B Model');
    await w(200);
    await reveal(line('Four companies reached out after the Valentine\'s Day campaign. None of them were pitched. They played the consumer product and <span class="tg-hl">saw the enterprise application themselves.</span>', 'tg-pl--med'), {
      y: 14, stagger: 0.07, duration: 0.55, blur: true, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(350);
    askGrid([
      { label: 'Consumer',   value: 'Free → Premium', sub: 'Users build profiles they own across every tangle they play' },
      { label: 'Enterprise', value: '"Sign in with Trove"', sub: 'Platforms pay for authorized behavioural signal. Like Plaid for personality.' },
    ]);
    await w(500);
    await dimLines('Hiring, dating, insurance, healthcare — every high-stakes people decision currently runs on self-report. Trove becomes the API layer that replaces it. The user authorizes the share. The platform pays. The data stays the user\'s.', 160);
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
    branchPath.push('B2d');
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
    await reveal(line('This isn\'t a privacy policy nicety — it\'s <span class="tg-hl-b">the core of the business model.</span> Trove profiles are <span class="tg-hl">assets users accumulate</span> and choose to share. You authorize what gets seen and to whom. You can revoke it.', 'tg-pl--med'), {
      y: 14, stagger: 0.07, duration: 0.55, blur: true, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(350);
    await dimLines('That consent architecture is what makes the B2B product valuable. An enterprise buyer is getting a signal that the person chose to share with them. That\'s a different conversation than a background check or a scraped LinkedIn.');
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
    branchPath.push('C1'); usedFounderPath = true;
    await w(900); line('', 'tg-pl', 16);
    await ringWipeChapter('Helen Huang');
    await w(180);
    // ── Helen photo reveal ────────────────────────────────────────────────
    const photoWrap = document.createElement('div');
    photoWrap.className = 'tg-pl tg-founder-photo-wrap';
    const helenImg = document.createElement('img');
    helenImg.src = './helenfounder.png';
    helenImg.className = 'tg-founder-photo';
    helenImg.alt = 'Helen Huang';
    photoWrap.appendChild(helenImg);
    pitch.appendChild(photoWrap);
    scrollPitch();

    if (hasGSAP) {
      await new Promise(r => gsap.from(helenImg, {
        scale: 0.88, opacity: 0, y: 18, duration: 0.65,
        ease: hasCE ? 'unfurl' : 'back.out(1.6)',
        onComplete: r,
      }));
      HAPTIC?.card?.();
      // Fun decals scattered around the photo
      const photoDecals = [
        { src: 'mic.png',      right: '-18px', top:    '-16px', w: 48, delay: 0.05, fromRot: -30, toRot: 8  },
        { src: 'starhehe.png', right: '-14px', bottom: '-12px', w: 38, delay: 0.12, fromRot:  20, toRot: -5 },
        { src: 'flower.png',   left:  '-16px', top:    '-14px', w: 42, delay: 0.18, fromRot: -20, toRot: 12 },
        { src: 'babystar.png', left:  '-10px', bottom: '-10px', w: 68, delay: 0.24, fromRot:  15, toRot: -8 },
      ];
      photoDecals.forEach(({ src, w: dw, delay, fromRot, toRot, ...pos }) => {
        photoWrap.appendChild(decal(src, 'tg-decal--bob', { ...pos, w: dw, delay, fromRot, toRot }));
      });
    }
    await w(280);
    // ── Gap 5: Helen credentials as rlist ─────────────────────────────────
    const credList = await rlistReveal([
      { m: '01', t: 'Second-time founder' },
      { m: '02', t: 'Former PM at Microsoft and Zynga' },
      { m: '03', t: 'Bootstrapped a profitable edtech startup to seven figures' },
      { m: '04', t: 'Forbes 30 Under 30' },
    ]);
    // Mic decal on the container
    credList.style.position = 'relative'; credList.style.overflow = 'visible';
    credList.appendChild(decal('mic.png', 'tg-decal--bob', { right: '-22px', top: '0', w: 48, delay: 0.4 }));
    await w(300);
    // Type B — setup for the pivot
    await reveal(line('She didn\'t start Trove because it was <span class="tg-hl-b">a good market.</span>', 'tg-pl--med tg-pl--italic'), {
      y: 14, stagger: 0.07, duration: 0.55, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(500); // hold — next line is the answer
    flash();
    // Line 1
    const startedEl = line('She started it', 'tg-pl--big');
    startedEl.style.marginBottom = '2px';
    await reveal(startedEl, {
      type: 'chars', y: 0,
      scale: () => gsap.utils.random(0.1, 0.5),
      rotation: () => gsap.utils.random(-15, 15),
      stagger: 0.05, from: 'center', duration: 0.65, ease: hasCE ? 'slam' : 'back.out(3)',
    });
    // Line 2
    const becauseEl = line('because she', 'tg-pl--big');
    becauseEl.style.marginTop = '-2px';
    becauseEl.style.marginBottom = '8px';
    await reveal(becauseEl, {
      type: 'chars', y: 0,
      scale: () => gsap.utils.random(0.1, 0.5),
      rotation: () => gsap.utils.random(-15, 15),
      stagger: 0.05, from: 'center', duration: 0.65, ease: hasCE ? 'slam' : 'back.out(3)',
    });
    // Line 3 — smaller, words bloom in from huge + blur
    const livedEl = line('lived the problem.', 'tg-pl--impact');
    livedEl.style.cssText += 'color:var(--shift);margin-top:0;';
    await reveal(livedEl, {
      type: 'words', y: 0,
      scale: () => gsap.utils.random(2.0, 2.6),
      blur: true,
      duration: 0.75, ease: hasCE ? 'hesitate' : 'power3.out', stagger: 0.18,
    });
    livedEl.style.position = 'relative'; livedEl.style.overflow = 'visible';
    livedEl.appendChild(decal('heartbreak.png', 'tg-decal--lubdub', { right: '-32px', top: '-8px', w: 80, fromY: -24, delay: 0.4 }));
    await w(400);
    // Type C — the quote that proves it
    await pqReveal(
      '"You\'re working on something important, you know? More importantly, you are doing it the right way."<span class="tg-pq-attr">— unsolicited message from a player after launch.</span>',
      'babystar.png', { right: '-18px', bottom: '-18px', w: 120, delay: 0.5 }, 'tg-decal--party'
    );
    // The 30K stat + context
    await reveal(line('She also built a <span class="tg-hl">30,000-person emailing list.</span>', 'tg-pl--med'), {
      y: 12, stagger: 0.06, duration: 0.48, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(300);
    await dimLines('that\'s not a vanity metric, but a launch list to the moon', 180);
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
    branchPath.push('C2');
    await w(900); line('', 'tg-pl', 16);
    await ringWipeChapter('The Insight');
    await w(200);
    // Slide in from left — different from the blur-reveal used elsewhere
    await reveal(line('Everyone else trying to solve the "know people better" problem is <span class="tg-hl">building better questionnaires.</span>', 'tg-pl--med'), {
      x: -18, stagger: 0.06, duration: 0.52, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(350);
    flash();
    // Helen insight: small blue label sets up the punchline
    await reveal(line('Helen\'s insight:', 'tg-pl--dim'), {
      y: 6, stagger: 0.04, duration: 0.28, ease: hasCE ? 'unfurl' : 'power2.out',
    });
    await w(80);
    // "the / questionnaire / is the problem." — three-line xray glitch reveal
    const doGlitch = async (el, text) => {
      if (hasGSAP && hasScrTx) {
        el.textContent = '';
        await new Promise(r => gsap.to(el, {
          duration: 1.1,
          scrambleText: { text, chars: '!<>-_\\/[]{}—=+*^?#@░▒▓', revealDelay: 0.28, speed: 0.45 },
          ease: 'none', onComplete: r,
        }));
        const r2 = el.cloneNode(true), b2 = el.cloneNode(true);
        r2.style.cssText = 'position:absolute;top:0;left:0;color:var(--shift);mix-blend-mode:multiply;pointer-events:none;';
        b2.style.cssText = 'position:absolute;top:0;left:0;color:var(--trace);mix-blend-mode:multiply;pointer-events:none;';
        el.style.position = 'relative';
        el.appendChild(r2); el.appendChild(b2);
        await new Promise(r => gsap.timeline({ onComplete: r })
          .to(r2, { x: () => (Math.random()-0.5)*14, duration: 0.05, ease: 'steps(1)', repeat: 6, yoyo: true })
          .to(b2, { x: () => (Math.random()-0.5)*14, duration: 0.05, ease: 'steps(1)', repeat: 6, yoyo: true }, '<')
          .to(el, { skewX: () => (Math.random()-0.5)*3, duration: 0.08, ease: 'steps(1)', repeat: 3, yoyo: true }, '<')
          .call(() => { r2.remove(); b2.remove(); el.style.position = ''; })
        );
      } else if (hasGSAP) {
        const split = new SplitText(el, { type: 'chars' });
        await new Promise(r => gsap.from(split.chars, {
          opacity: 0, scale: () => gsap.utils.random(0.1, 0.5),
          rotation: () => gsap.utils.random(-12, 12),
          stagger: 0.05, from: 'center', duration: 0.6,
          ease: hasCE ? 'slam' : 'back.out(3)', clearProps: 'all', onComplete: r,
        }));
      }
    };
    flash();
    await doGlitch(line('the', 'tg-pl--huge'), 'the');
    await w(100);
    await doGlitch(line('questionnaire', 'tg-pl--huge'), 'questionnaire');
    await w(220);
    await reveal(line('is the problem.', 'tg-pl--wordpop'), {
      y: 10, stagger: 0.04, duration: 0.38, blur: true, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(600);
    // Supporting context — dim blue, tighter stagger, no blur (different from med)
    await reveal(line('Not the form it takes — the entire model of asking people to describe themselves. The only behavioural data that isn\'t gameable is data captured when the person is too absorbed in something else to perform.', 'tg-pl--dim'), {
      y: 8, stagger: 0.06, duration: 0.50, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(350);
    await pqReveal('"It felt so deeply intimate from the beginning. Terrifying. Well done."<span class="tg-pq-attr">— Valentine\'s Day player.</span>');
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
    branchPath.push('traction');
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
    await reveal(line('500 emails. No ads. No paid influencers. <span class="tg-hl">Nothing.</span>', 'tg-pl--med'), {
      y: 14, stagger: 0.07, duration: 0.55, blur: true, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(350);
    const viralEl = line('<span class="tg-hl">8× organic amplification.</span> People shared it because they wanted their friends to see their own results.', 'tg-pl--med');
    await reveal(viralEl, {
      y: 14, stagger: 0.07, duration: 0.55, blur: true, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    viralEl.style.position = 'relative'; viralEl.style.overflow = 'visible';
    viralEl.appendChild(decal('banana.png', 'tg-decal--bob', { right: '-26px', top: '-6px', w: 42, fromY: -28, delay: 0.15 }));
    await w(350);
    // Type E — stats with stagger
    const statsEl = await statsBlockReveal([
      { n: '78%',   l: 'returned day 3 — zero push notifications', asset: 'boomerand.png', sweep: 'boomerand.png' },
      { n: '7 min', l: 'median session length',                    asset: 'watch.png'     },
      { n: '24K+',  l: 'behavioural data points, 2,100+ players',  asset: 'id.png'        },
      { n: '4',     l: 'unsolicited B2B inquiries — none pitched',  asset: 'waller.png'   },
    ]);
    // babystar pops in top-right after stats land
    statsEl.style.position = 'relative'; statsEl.style.overflow = 'visible';
    statsEl.appendChild(decal('babystar.png', 'tg-decal--bob', { right: '-24px', top: '-24px', w: 80, delay: 0.2 }));
    await w(500);
    await reveal(line('When the campaign ended —', 'tg-pl--dim'), {
      y: 10, stagger: 0.06, duration: 0.50, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(500);
    flash();
    const discordEl = line('60 strangers built a Discord.', 'tg-pl--oneliner');
    await reveal(discordEl, {
      type: 'chars', y: 0,
      scale: () => gsap.utils.random(0.1, 0.5),
      rotation: () => gsap.utils.random(-12, 12),
      stagger: 0.045, from: 'center', duration: 0.6, ease: hasCE ? 'slam' : 'back.out(3)',
    });
    discordEl.style.position = 'relative'; discordEl.style.overflow = 'visible';
    discordEl.appendChild(decal('gaming.png', 'tg-decal--bob', { right: '-22px', top: '-12px', w: 88, fromY: -28, delay: 0.2 }));
    await w(350);
    await dimLines('Nobody asked them to. No push notifications. No referral loop. They just didn\'t want it to end.', 150);
    await w(400);
    // THE thesis line — needs the most air
    await pqReveal('That\'s not a retention metric. That\'s people who want to keep being seen.');

    // ── Gap 2: testimonial reel ────────────────────────────────────────
    await w(200);
    await reveal(line('What players said after:', 'tg-pl--attr'), {
      y: 8, duration: 0.35, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(180);
    await testimonialReel([
      { text: '"It\'s unsettling. I didn\'t expect to feel so understood."', attr: '— player, 11:52pm' },
      { text: '"I sent this to my therapist. Literally the topic of our next session."', attr: '— player, 4:44am' },
      { text: '"You didn\'t ask me anything. And you still got it right."', attr: '— player, Day 1' },
    ]);
    await w(300);

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
    else { wentStraightToAsk = true; await sAsk(); }
  }

  async function sShared_moat() {
    branchPath.push('moat'); wentDeepOnMoat = true;
    await w(900); line('', 'tg-pl', 16);
    await ringWipeChapter('The Flywheel');
    await w(200);
    flash();
    // Type A — statement
    await reveal(line('The data is the moat.', 'tg-pl--big'), {
      type: 'chars', y: 0,
      scale: () => gsap.utils.random(0.1, 0.5),
      rotation: () => gsap.utils.random(-15, 15),
      stagger: 0.05, from: 'center', duration: 0.65, ease: hasCE ? 'slam' : 'back.out(3)',
    });
    await w(320);
    await reveal(line('Not the app.', 'tg-pl--dim'), {
      y: 10, stagger: 0.08, duration: 0.45, ease: hasCE ? 'hesitate' : 'power2.out',
    });
    await w(500);
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
    const noGPUsEl = line('You can\'t shortcut this with GPUs.', 'tg-pl--dim');
    await reveal(noGPUsEl, {
      y: 10, stagger: 0.028, duration: 0.34, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    noGPUsEl.style.position = 'relative'; noGPUsEl.style.overflow = 'visible';
    noGPUsEl.appendChild(decal('turtle.png', 'tg-decal--bob', { right: '-22px', top: '-4px', w: 46, fromY: -18, delay: 0.25 }));
    await w(200);
    await dimLines('A competitor starting today would need years of real human behavioural data across diverse emotional contexts. Trove\'s head start is the dataset — and it compounds with every tangle played.');
    await w(350);
    await dimLines('The comparable isn\'t another assessment tool. It\'s Plaid. $430M ARR from API access to data users already had. Trove is building the behavioural equivalent of that infrastructure layer.');
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
    // $525K — hero amount, triumphant land with sparkles
    const amountEl = line('<span class="tg-amount-hero">$525K</span>', 'tg-pl');
    await reveal(amountEl, {
      type: 'chars', y: 0,
      scale: () => gsap.utils.random(0.05, 0.4),
      rotation: () => gsap.utils.random(-20, 20),
      stagger: 0.07, from: 'center', duration: 0.8, ease: hasCE ? 'slam' : 'back.out(2.5)',
    });
    // triumphant land: elastic scale punch + sparkle burst
    const heroSpan = amountEl.querySelector('.tg-amount-hero');
    if (hasGSAP && heroSpan) {
      gsap.fromTo(heroSpan, { scale: 1.14 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1.2,0.4)' });
      HAPTIC?.burst?.();
      const glyphs = ['✦','✧','✦','✧','★','✦','·','✧'];
      const rect = heroSpan.getBoundingClientRect();
      const pitchRect = pitch.getBoundingClientRect();
      for (let i = 0; i < 14; i++) {
        const sp = document.createElement('span');
        sp.className = 'tg-sparkle';
        sp.textContent = glyphs[i % glyphs.length];
        const angle = (i / 14) * Math.PI * 2;
        const dist = 55 + Math.random() * 70;
        sp.style.setProperty('--sx', `${Math.cos(angle) * dist}px`);
        sp.style.setProperty('--sy', `${Math.sin(angle) * dist}px`);
        sp.style.left = `${rect.left - pitchRect.left + rect.width / 2 + Math.random() * 30 - 15}px`;
        sp.style.top  = `${rect.top  - pitchRect.top  + rect.height / 2 + pitch.scrollTop + Math.random() * 20 - 10}px`;
        sp.style.color = i % 3 === 0 ? 'var(--trace)' : 'var(--shift)';
        sp.style.animationDelay = `${i * 0.045}s`;
        pitch.appendChild(sp);
        setTimeout(() => sp.remove(), 1600);
      }
    }
    await w(200);
    const alreadyEl = line('already in.', 'tg-pl--big');
    alreadyEl.style.cssText += 'color:var(--trace);margin-top:-4px;';
    await reveal(alreadyEl, {
      y: 16, stagger: 0.05, duration: 0.44, blur: true, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(800);
    await reveal(line('Betaworks, True Ventures, Slack Fund.', 'tg-pl--dim'), {
      y: 12, stagger: 0.06, duration: 0.50, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(350);
    await reveal(line('We\'re financing the next phase: <span class="tg-hl">100K active behavioural profiles,</span> 1–2 paid B2B pilots, <span class="tg-hl-b">retention across verticals</span> beyond dating.', 'tg-pl--med'), {
      y: 14, stagger: 0.07, duration: 0.55, blur: true, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(350);
    askGrid([
      { label: 'Already closed', value: '$525K', sub: 'Formation capital, SAFEs' },
      { label: 'Raising now',    value: '$1.5M',  sub: '18–25 months runway · 7 people' },
    ]);
    await w(400);

    // ── Gap 4: formation stats block ──────────────────────────────────────
    await statsFormation([
      { n: '$525K', l: 'already in' },
      { n: '100K',  l: 'target profiles' },
      { n: '1–2',   l: 'paid B2B pilots' },
    ]);
    await w(500);

    await reveal(line('We\'re looking for investors who <span class="tg-hl">think in platforms, not products.</span> Who understand that <span class="tg-hl-b">the moat is the dataset</span> and the app is just how you fill it.', 'tg-pl--med'), {
      y: 12, stagger: 0.07, duration: 0.55, blur: true, ease: hasCE ? 'unfurl' : 'power3.out',
    });
    await w(700);
    await contBtn('See your investor profile →');
    await sRevealArchetype();
  }

  // ── RECAP SCREEN PRIMITIVE ────────────────────────────
  async function recapScreen(buildFn, opts = {}) {
    if (!scene) return;

    const overlay = document.createElement('div');
    overlay.className = 'tg-recap-overlay';
    overlay.style.background = opts.bg || '#F9F9F2';
    scene.appendChild(overlay);

    const hint = document.createElement('div');
    hint.style.cssText = `
      position:absolute;bottom:22px;left:0;right:0;
      font-family:var(--font-label);font-size:10px;
      letter-spacing:0.14em;text-transform:uppercase;
      opacity:0;color:inherit;pointer-events:none;text-align:center;
    `;
    hint.textContent = 'tap to continue';
    overlay.appendChild(hint);

    // Entrance
    if (hasGSAP) {
      const fromVars = {
        slideUp:    { y: '100%' },
        slideLeft:  { x: '-100%' },
        slideRight: { x: '100%' },
        scale:      { scale: 0.82, opacity: 0 },
        fade:       { opacity: 0 },
      }[opts.entrance || 'slideUp'] || { y: '100%' };
      await new Promise(r => gsap.from(overlay, {
        ...fromVars, duration: 0.52, ease: hasCE ? 'slam' : 'back.out(1.4)',
        clearProps: 'transform,opacity', onComplete: r,
      }));
    }

    // Build content AFTER slide-in (fixes GSAP firing invisible)
    await buildFn(overlay);

    if (hasGSAP) gsap.to(hint, { opacity: 0.38, duration: 0.4, delay: 0.6 });
    HAPTIC.card();

    await new Promise(resolve => {
      const dismiss = (e) => {
        e.preventDefault();
        overlay.removeEventListener('click', dismiss);
        overlay.removeEventListener('touchend', dismiss);
        HAPTIC.tap();

        const toVars = {
          slideUp:    { y: '-105%' },
          slideLeft:  { x: '105%' },
          slideRight: { x: '-105%' },
          scale:      { scale: 1.1, opacity: 0 },
          fade:       { opacity: 0 },
        }[opts.exit || 'slideUp'] || { y: '-105%' };

        if (hasGSAP) {
          gsap.to(overlay, {
            ...toVars, duration: 0.38, ease: 'power2.in',
            onComplete: () => {
              overlay.remove();
              resolve();
            },
          });
        } else {
          overlay.remove();
          resolve();
        }
      };
      setTimeout(() => {
        overlay.addEventListener('click', dismiss);
        overlay.addEventListener('touchend', dismiss, { passive: false });
      }, opts.minHold || 900);
    });
  }

  // ── RECAP DATA BUILDER ────────────────────────────────
  function buildRecapData(id) {
    const arch = ARCHETYPES[id];
    const firstChoiceLabels = ['signal skeptic', 'pattern matcher', 'team reader'];
    const traitLines = {
      cartographer: ['you mapped the unknown before committing', 'you ask "does this data exist?" — not "does this matter?"'],
      contrarian:   ['you challenged the premise first', 'you needed to know what failed before you could trust what works'],
      architect:    ['you went straight for structural defensibility', 'you think in systems, not features'],
      operator:     ['you needed to know who built it', 'for you, the team is the thesis'],
      storyteller:  ['you followed the narrative thread', 'you understand that the product is the proof'],
    };
    // All truthy behavioral signals (full list, not just one)
    const allSignals = [];
    if (firstChoice !== null) allSignals.push(`came in as a ${firstChoiceLabels[firstChoice]}`);
    if (wentDeepOnMoat)    allSignals.push('stayed for the flywheel');
    if (wentStraightToAsk) allSignals.push('cut straight to the ask');
    if (usedFounderPath)   allSignals.push('led with the founder');
    if (pushedBackOnData)  allSignals.push('pushed back on the data');

    const exitMove =
      wentDeepOnMoat    ? 'stayed for the flywheel' :
      wentStraightToAsk ? 'cut to the ask' :
      usedFounderPath   ? 'led with founder' :
      pushedBackOnData  ? 'pushed back' : 'followed the signal';

    return {
      id, arch,
      pathLength: branchPath.length,
      choiceCount,
      firstChoiceLabel: firstChoice !== null ? firstChoiceLabels[firstChoice] : 'curious',
      traits: traitLines[id] || [],
      wentDeepOnMoat, wentStraightToAsk, usedFounderPath, pushedBackOnData,
      allSignals,
      exitMove,
    };
  }

  // ── EMAIL CAPTURE (standalone) ────────────────────────
  async function emailCapture() {
    return new Promise(resolveEmail => {
      const emailDiv = document.createElement('div');
      emailDiv.className = 'tg-pl';
      emailDiv.style.cssText = 'position:relative;padding:8px 0 20px;overflow:visible;';
      emailDiv.innerHTML = `
        <div class="tg-email-parade" id="tg-email-parade"></div>
        <div class="tg-email-hero" id="tg-email-hero" style="opacity:0">curious?</div>
        <div class="tg-email-sub" id="tg-email-sub" style="opacity:0">stay up to date with upcoming drops</div>
        <div class="tg-email-list-lbl" id="tg-email-lbl" style="opacity:0">first-look list — one note when it's real</div>
        <div class="tg-email-form" id="tg-email-form" style="opacity:0">
          <input class="tg-email-in" id="tg-email-in" type="email" placeholder="you@somewhere.com" autocomplete="email">
          <button class="tg-email-send" id="tg-email-send">join →</button>
        </div>
        <span class="tg-email-fine" id="tg-email-fine" style="opacity:0">no spam. just signal — you'll hear first when trove is ready.</span>
        <div class="tg-email-helen" id="tg-email-helen" style="opacity:0">Helen Huang · Founder, Trove &nbsp;·&nbsp; <a href="mailto:helen@trove.garden" class="tg-email-helen-link">helen@trove.garden</a></div>
      `;

      const paradeEl = emailDiv.querySelector('#tg-email-parade');
      // scattered around the container: top corners, mid sides, bottom corners
      const paradeSpots = [
        { src: 'starhehe.png',    anim: 'spin',   css: 'top:6px;left:-18px'      },
        { src: 'babystar.png',    anim: 'spin2',  css: 'top:6px;right:4px'       },
        { src: 'frog.png',        anim: 'bounce', css: 'top:40%;left:2px'        },
        { src: 'derpy.png',       anim: 'dance',  css: 'top:40%;right:2px'       },
        { src: 'turtle.png',      anim: 'bob',    css: 'bottom:30px;left:4px'    },
        { src: 'caterpillar.png', anim: 'wiggle', css: 'bottom:30px;right:4px'   },
      ];
      paradeSpots.forEach(a => {
        const img = document.createElement('img');
        img.src = `./assets/${a.src}`;
        img.dataset.anim = a.anim;
        img.style.cssText = a.css + ';opacity:0;';
        paradeEl.appendChild(img);
      });

      pitch.appendChild(emailDiv);
      scrollPitch();

      const submit = () => {
        const val = emailDiv.querySelector('#tg-email-in')?.value?.trim();
        if (!val || !val.includes('@')) {
          HAPTIC.shatter();
          const inp = emailDiv.querySelector('#tg-email-in');
          if (inp) { inp.style.outline = '1px solid var(--shift)'; setTimeout(() => { inp.style.outline = ''; }, 1200); }
          return;
        }
        HAPTIC.notif();
        try {
          const leads = JSON.parse(localStorage.getItem('tg-leads') || '[]');
          leads.push({ email: val, archetype: getArchetype(), ts: Date.now() });
          localStorage.setItem('tg-leads', JSON.stringify(leads));
        } catch (e) {}
        if (hasGSAP) {
          gsap.to([emailDiv.querySelector('#tg-email-form'), emailDiv.querySelector('#tg-email-fine')],
            { opacity: 0, y: -6, duration: 0.25, stagger: 0.06 });
          setTimeout(() => {
            emailDiv.innerHTML = `<div style="font-family:var(--font-label);font-size:12px;color:var(--trace);letter-spacing:0.08em;padding:6px 0;opacity:0" id="tg-email-ok">you're on the list ✓</div>`;
            gsap.to(emailDiv.querySelector('#tg-email-ok'), { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' });
            setTimeout(resolveEmail, 800);
          }, 350);
        } else {
          emailDiv.innerHTML = `<div class="tg-email-fine" style="opacity:0.8;font-size:13px;margin:6px 0">you're on the list ✓</div>`;
          setTimeout(resolveEmail, 700);
        }
      };

      if (hasGSAP) {
        const heroEl    = emailDiv.querySelector('#tg-email-hero');
        const helenEl   = emailDiv.querySelector('#tg-email-helen');
        const subEl     = emailDiv.querySelector('#tg-email-sub');
        const lblEl     = emailDiv.querySelector('#tg-email-lbl');
        const formEl    = emailDiv.querySelector('#tg-email-form');
        const fineEl    = emailDiv.querySelector('#tg-email-fine');
        const paradeImgs = paradeEl.querySelectorAll('img');

        const split = new SplitText(heroEl, { type: 'chars' });
        gsap.set(heroEl, { opacity: 1 });
        gsap.from(split.chars, {
          opacity: 0, y: 36, scale: 0.5,
          rotation: i => (Math.sin(i * 1.4) * 18),
          duration: 0.55, ease: hasCE ? 'slam' : 'back.out(2.5)',
          stagger: { each: 0.07, ease: 'power2.out' },
          clearProps: 'transform,rotation',
        });

        paradeImgs.forEach((img, i) => {
          gsap.fromTo(img,
            { opacity: 0, y: 28, scale: 0.2, rotation: (i % 2 === 0 ? -30 : 30) },
            { opacity: 1, y: 0,  scale: 1,   rotation: 0,
              duration: 0.55, ease: 'elastic.out(1, 0.45)',
              delay: 0.4 + i * 0.08,
              onComplete: () => {
                const anim = img.dataset.anim;
                const d = 0.3 + Math.random() * 0.4;
                // gentle chill dancing — slow, readable, no violent flips
                if (anim === 'spin')   gsap.to(img, { rotation: 360,  duration: 3.8, ease: 'none', repeat: -1, delay: d });
                if (anim === 'spin2')  gsap.to(img, { rotation: -360, duration: 5.2, ease: 'none', repeat: -1, delay: d });
                if (anim === 'bounce') gsap.to(img, { y: -10, duration: 0.6,  ease: 'sine.inOut', yoyo: true, repeat: -1, delay: d });
                if (anim === 'dance')  gsap.to(img, { x: 5, rotation: 8,  duration: 0.85, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: d });
                if (anim === 'bob')    gsap.to(img, { y: -6, duration: 1.5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: d });
                if (anim === 'wiggle') gsap.to(img, { rotation: 12, duration: 0.6,  ease: 'sine.inOut', yoyo: true, repeat: -1, delay: d });
              },
            }
          );
        });

        gsap.fromTo(subEl,  { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4,  ease: 'power3.out', delay: 0.88 });
        gsap.fromTo(lblEl,  { opacity: 0 },         { opacity: 1,       duration: 0.3,  ease: 'power2.out', delay: 1.05 });
        gsap.fromTo(formEl,  { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.38, ease: 'power3.out', delay: 1.2 });
        gsap.fromTo(fineEl,  { opacity: 0 },         { opacity: 1,       duration: 0.25, delay: 1.36,
          onComplete: () => { emailDiv.querySelector('#tg-email-in')?.focus(); },
        });
        gsap.fromTo(helenEl, { opacity: 0, y: 8 },  { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out', delay: 1.5 });
      } else {
        ['tg-email-hero','tg-email-sub','tg-email-lbl','tg-email-form','tg-email-fine','tg-email-helen']
          .forEach(id => { const el = emailDiv.querySelector('#' + id); if (el) el.style.opacity = '1'; });
        paradeEl.querySelectorAll('img').forEach(img => { img.style.opacity = '1'; });
        emailDiv.querySelector('#tg-email-in')?.focus();
      }

      setTimeout(() => {
        emailDiv.querySelector('#tg-email-in')?.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
        emailDiv.querySelector('#tg-email-send')?.addEventListener('click', submit);
      }, 80);
    });
  }

  // ── ARCHETYPE REVEAL ──────────────────────────────────
  async function sRevealArchetype() {
    window.tgAPI.setProgress(100);

    const id   = getArchetype();
    const data = buildRecapData(id);
    const arch = data.arch;

    // ── Persistent backdrop — covers scene between overlay transitions ─
    // Without this, the gap between overlay.remove() and the next overlay
    // being appended shows the raw pitch-scene background (or pitch content).
    const wrapBackdrop = scene ? document.createElement('div') : null;
    if (wrapBackdrop) {
      wrapBackdrop.style.cssText = 'position:absolute;inset:0;z-index:498;background:#1C1C1E;pointer-events:none;opacity:0;';
      scene.appendChild(wrapBackdrop);
      if (hasGSAP) await new Promise(r => gsap.to(wrapBackdrop, { opacity: 1, duration: 0.22, onComplete: r }));
      else wrapBackdrop.style.opacity = '1';
    }
    pitch.style.visibility = 'hidden';

    // ── Screen 1: session summary — dark, ghosted number ─────────────
    await recapScreen(async overlay => {
      overlay.style.color = '#F9F9F2';

      const ghost = document.createElement('div');
      ghost.style.cssText = `
        position:absolute;left:50%;top:45%;transform:translate(-50%,-50%);
        font-family:var(--font-display);font-size:clamp(140px,38vw,200px);
        font-weight:900;line-height:1;color:rgba(255,255,255,0.04);
        pointer-events:none;user-select:none;white-space:nowrap;
      `;
      ghost.textContent = data.pathLength;
      overlay.insertBefore(ghost, overlay.firstChild);

      const eyebrow = document.createElement('div');
      eyebrow.style.cssText = 'font-family:var(--font-label);font-size:10px;letter-spacing:0.16em;text-transform:uppercase;opacity:0.45;margin-bottom:18px;';
      eyebrow.textContent = 'your session · wrapped';

      const big = document.createElement('div');
      big.style.cssText = 'font-family:var(--font-display);font-size:clamp(36px,10vw,52px);font-weight:900;line-height:1.1;margin-bottom:14px;';
      big.textContent = `${data.pathLength} moves.`;

      const pathLine = document.createElement('div');
      pathLine.style.cssText = 'font-family:var(--font-body,sans-serif);font-size:16px;line-height:1.55;opacity:0.75;max-width:260px;margin-bottom:10px;';
      pathLine.innerHTML = `You came in as a <span style="color:#DBD59C;font-weight:700">${data.firstChoiceLabel}</span>.`;

      const detailLine = document.createElement('div');
      detailLine.style.cssText = 'font-family:var(--font-body,sans-serif);font-size:15px;opacity:0.55;max-width:240px;';
      detailLine.textContent =
        data.wentDeepOnMoat    ? 'You stayed for the flywheel.' :
        data.wentStraightToAsk ? 'You cut to the ask.' :
        data.usedFounderPath   ? 'You needed to know the founder first.' :
                                 'You followed the signal.';

      const floatSrcs = ['id.png','camera.png','watch.png','apple.png'];
      const floatPos  = [{left:'12%',top:'18%'},{right:'14%',top:'22%'},{left:'18%',bottom:'24%'},{right:'12%',bottom:'28%'}];
      floatSrcs.forEach((src, i) => {
        const img = document.createElement('img');
        img.src = `./assets/${src}`;
        img.style.cssText = 'position:absolute;width:28px;height:auto;opacity:0;pointer-events:none;';
        Object.assign(img.style, floatPos[i]);
        overlay.appendChild(img);
        if (hasGSAP) {
          gsap.to(img, { opacity: 0.22, duration: 0.4, delay: 0.2 + i * 0.1 });
          gsap.to(img, { y: -12, rotation: i % 2 === 0 ? 8 : -8, duration: 2 + i * 0.4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * 0.3 });
        }
      });

      overlay.append(eyebrow, big, pathLine, detailLine);
      if (hasGSAP) {
        [eyebrow, big, pathLine, detailLine].forEach((el, i) => {
          gsap.from(el, { opacity: 0, y: 20, duration: 0.44, ease: 'power3.out', delay: 0.05 + i * 0.12 });
        });
      }
    }, { bg: '#1C1C1E', entrance: 'slideUp', exit: 'slideUp' });


    // ── Screen 2: trait signal — gold, lightbulb slam ─────────────────
    await recapScreen(async overlay => {
      overlay.style.color = '#222222';

      const bigAsset = document.createElement('img');
      bigAsset.src = './assets/lightbulb.png';
      bigAsset.style.cssText = 'width:clamp(72px,18vw,96px);height:auto;margin-bottom:20px;';
      overlay.appendChild(bigAsset);

      if (hasGSAP) {
        gsap.from(bigAsset, {
          opacity: 0, scale: 0.1, rotation: -180, y: 40,
          duration: 0.9, ease: 'elastic.out(1,0.42)', delay: 0.05,
          onComplete: () => {
            gsap.to(bigAsset, { y: -8, rotation: 6, duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: -1 });
            orbitingTextRing(bigAsset, '\u2736 YOUR FIRST SIGNAL \u2736 PATTERN DETECTED \u2736');
          },
        });
      }

      const eyebrow = document.createElement('div');
      eyebrow.style.cssText = 'font-family:var(--font-label);font-size:10px;letter-spacing:0.16em;text-transform:uppercase;opacity:0.5;margin-bottom:14px;';
      eyebrow.textContent = 'pattern detected';

      const big = document.createElement('div');
      big.style.cssText = 'font-family:var(--font-display);font-size:clamp(22px,6vw,28px);font-weight:800;line-height:1.2;margin-bottom:12px;max-width:270px;';
      big.textContent = (data.traits[0] || 'you paid attention') + '.';

      const sub = document.createElement('div');
      sub.style.cssText = 'font-family:var(--font-body,sans-serif);font-size:14px;opacity:0.65;max-width:240px;line-height:1.55;';
      sub.textContent = data.traits[1] || '';

      overlay.append(eyebrow, big, sub);
      if (hasGSAP) {
        [eyebrow, big, sub].forEach((el, i) => {
          gsap.from(el, { opacity: 0, y: 18, duration: 0.42, ease: 'power3.out', delay: 0.3 + i * 0.13 });
        });
      }
    }, { bg: '#DBD59C', entrance: 'slideRight', exit: 'slideLeft' });


    // ── Screen 3: archetype reveal — coloured bg, elastic asset slam ──
    const ARCH_BG_COLORS = {
      cartographer: '#DBD59C', contrarian: '#88ABE3',
      architect: '#C3D9FF',   operator: '#FFFBCD', storyteller: '#DBD59C',
    };
    const ARCH_ASSETS_MAP = {
      cartographer: 'camera.png', contrarian: 'boomerand.png',
      architect: 'house.png',    operator: 'watch.png', storyteller: 'mic.png',
    };
    const revealBg    = ARCH_BG_COLORS[id]  || '#DBD59C';
    const revealAsset = ARCH_ASSETS_MAP[id] || 'camera.png';
    const revealDark  = id === 'contrarian';

    await recapScreen(async overlay => {
      overlay.style.color = revealDark ? '#F9F9F2' : '#222222';

      const bgSrcs = ['babystar.png','starhehe.png','flower.png','coin.png','apple.png','socks.png'];
      bgSrcs.forEach((src, i) => {
        const img = document.createElement('img');
        img.src = `./assets/${src}`;
        const sz = 18 + Math.random() * 16;
        img.style.cssText = `position:absolute;width:${sz}px;height:auto;opacity:0;pointer-events:none;
          left:${6 + Math.random() * 88}%;top:${4 + Math.random() * 92}%;
          transform:rotate(${(Math.random() - 0.5) * 40}deg);`;
        overlay.insertBefore(img, overlay.firstChild);
        if (hasGSAP) gsap.to(img, { opacity: 0.14 + Math.random() * 0.1, duration: 0.35, delay: 0.1 + i * 0.06 });
      });

      const eyebrow = document.createElement('div');
      eyebrow.style.cssText = `font-family:var(--font-label);font-size:10px;letter-spacing:0.16em;text-transform:uppercase;opacity:${revealDark ? '0.6' : '0.45'};margin-bottom:12px;`;
      eyebrow.textContent = 'your investor archetype';

      const bigAsset = document.createElement('img');
      bigAsset.src = `./assets/${revealAsset}`;
      bigAsset.style.cssText = 'width:clamp(88px,22vw,116px);height:auto;margin-bottom:16px;filter:drop-shadow(0 8px 20px rgba(0,0,0,0.15));';

      const nameEl = document.createElement('div');
      nameEl.style.cssText = `font-family:var(--font-display);font-size:clamp(30px,9vw,44px);font-weight:900;line-height:1.05;margin-bottom:10px;letter-spacing:-0.02em;`;
      nameEl.textContent = arch.name;

      const subEl = document.createElement('div');
      subEl.style.cssText = `font-family:var(--font-label);font-size:13px;opacity:${revealDark ? '0.65' : '0.5'};letter-spacing:0.04em;`;
      subEl.textContent = arch.sub;

      overlay.append(eyebrow, bigAsset, nameEl, subEl);

      if (hasGSAP) {
        gsap.from(eyebrow, { opacity: 0, y: 12, duration: 0.35, ease: 'power3.out', delay: 0.05 });
        gsap.from(bigAsset, {
          opacity: 0, scale: 0.05, rotation: -200, y: 60,
          duration: 1.1, ease: 'elastic.out(1,0.38)', delay: 0.1,
          onComplete: () => {
            gsap.to(bigAsset, { y: -10, rotation: 5, duration: 1.9, ease: 'sine.inOut', yoyo: true, repeat: -1 });
            orbitingTextRing(bigAsset, `\u2736 ${arch.name.toUpperCase()} \u2736 TROVE \u2736`);
            assetBurst(bigAsset, 'celebrate', 10);
          },
        });
        if (hasScrTx) {
          gsap.set(nameEl, { opacity: 1 });
          gsap.to(nameEl, {
            duration: 1.2, delay: 0.45,
            scrambleText: { text: arch.name, chars: '!<>-_\\/[]{}—=+*^?#░▒▓ABCDEFGHIJKLMNOPQRSTUVWXYZ', revealDelay: 0.28, speed: 0.5 },
            ease: 'none',
          });
        } else {
          const split = new SplitText(nameEl, { type: 'chars' });
          gsap.from(split.chars, {
            opacity: 0, y: 40, scale: 0.2, rotation: i => Math.sin(i * 1.4) * 22,
            duration: 0.65, ease: 'back.out(2.5)',
            stagger: { each: 0.07, ease: 'power2.out' },
            delay: 0.38,
          });
        }
        gsap.from(subEl, { opacity: 0, y: 10, duration: 0.38, ease: 'power3.out', delay: 1.3 });
      }
    }, { bg: revealBg, entrance: 'scale', exit: 'slideUp' });


    // ── Screen 4: what this means — blue, desc + together, last screen ─
    await recapScreen(async overlay => {
      overlay.style.color = '#F9F9F2';

      const eyebrow = document.createElement('div');
      eyebrow.style.cssText = 'font-family:var(--font-label);font-size:10px;letter-spacing:0.16em;text-transform:uppercase;opacity:0.6;margin-bottom:16px;';
      eyebrow.textContent = arch.name;

      const desc = document.createElement('div');
      desc.style.cssText = 'font-family:var(--font-display);font-size:clamp(16px,5.5vw,22px);font-weight:700;line-height:1.35;margin-bottom:18px;max-width:290px;';
      desc.textContent = arch.desc;

      const together = document.createElement('div');
      together.style.cssText = 'font-family:var(--font-label);font-size:13px;opacity:0.65;max-width:260px;line-height:1.55;';
      together.innerHTML = arch.together;

      overlay.append(eyebrow, desc, together);
      if (hasGSAP) {
        [eyebrow, desc, together].forEach((el, i) => {
          gsap.from(el, { opacity: 0, y: 16, duration: 0.44, ease: 'power3.out', delay: 0.08 + i * 0.16 });
        });
      }
    }, { bg: '#88ABE3', entrance: 'slideUp', exit: 'fade' });

    // ── Teardown: remove backdrop, restore pitch ──────────
    if (wrapBackdrop) {
      if (hasGSAP) await new Promise(r => gsap.to(wrapBackdrop, { opacity: 0, duration: 0.25, onComplete: r }));
      wrapBackdrop.remove();
    }
    pitch.style.visibility = '';
    _atBottom = true; // force scroll tracking so post-recap reveals scroll into view
    pitch.scrollTop = pitch.scrollHeight;

    await w(300);

    // ── Blue flash back to pitch ──────────────────────────
    if (hasGSAP && scene) {
      HAPTIC.notif();
      const cover = document.createElement('div');
      cover.style.cssText = 'position:absolute;inset:0;background:#88ABE3;z-index:100;pointer-events:none;opacity:0;';
      scene.appendChild(cover);
      await new Promise(r =>
        gsap.timeline({ onComplete: r })
          .to(cover, { opacity: 1, duration: 0.22, ease: 'power2.in' })
          .to(cover, { opacity: 0, duration: 0.42, ease: 'power2.out', delay: 0.18 })
          .call(() => cover.remove())
      );
    }

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
      const _sfAnchor = pitch.querySelector('.tg-stats-formation');
      if (_sfAnchor) {
        pitch.insertBefore(wrap, _sfAnchor);
      } else {
        pitch.appendChild(wrap);
      }
      requestAnimationFrame(() => {
        pitch.scrollTop = Math.max(0, wrap.offsetTop - pitch.clientHeight * 0.3);
      });

      let loaded = 0;
      const onLoad = () => { if (++loaded < 2) return; go(); };
      wordImg.onload = onLoad; ohImg.onload = onLoad;
      if (wordImg.complete) onLoad();
      if (ohImg.complete)   onLoad();

      function go() {
        const W           = wordImg.offsetWidth  || 88;
        const ohW         = ohImg.offsetWidth    || 24;
        const gap         = 14;
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
          else { ohImg.remove(); HAPTIC.burst(); resolve(); }
        }
        requestAnimationFrame(frame);
      }
    });
    await w(500);

    // Accent color for this archetype
    const ARCH_ACCENT = {
      cartographer: '#DBD59C', contrarian: '#88ABE3',
      architect: '#C3D9FF',   operator:   '#FFFBCD', storyteller: '#DBD59C',
    };
    const accentColor = ARCH_ACCENT[id] || '#DBD59C';

    // Kick off share card generation in background
    const shareCardPromise = generateShareCard(arch, id, data).catch(e => {
      console.warn('[Trove] Share card generation failed:', e);
      return null;
    });

    // ── Flat archetype reveal ─────────────────────────────────────────
    HAPTIC.card();

    // Tag
    const tagEl = line('your archetype', 'tg-pl--dim');
    if (hasGSAP) {
      await new Promise(r => gsap.fromTo(tagEl,
        { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out', clearProps: 'y', onComplete: r }
      ));
    }
    await w(80);

    // Name — ScrambleText slam
    const nameEl = line(arch.name, 'tg-p-name');
    nameEl.style.margin = '0 0 6px';
    if (hasGSAP) {
      gsap.set(nameEl, { opacity: 0 });
      gsap.set(nameEl, { opacity: 1 });
      if (hasScrTx) {
        await new Promise(r => gsap.to(nameEl, {
          duration: 1.1,
          scrambleText: { text: arch.name, chars: '!<>—\/[]{}=+*░▒▓ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', revealDelay: 0.14, speed: 0.6 },
          ease: 'none', onComplete: r,
        }));
      } else {
        await new Promise(r => gsap.fromTo(nameEl,
          { rotationX: -90, opacity: 0 }, { rotationX: 0, opacity: 1, duration: 0.55, ease: 'back.out(2)', onComplete: r }
        ));
      }
      HAPTIC.card();
      flash();
    }
    await w(120);

    // Sub
    const subEl = line(arch.sub, 'tg-pl--prompt');
    if (hasGSAP) {
      await new Promise(r => gsap.fromTo(subEl,
        { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power3.out', clearProps: 'y', onComplete: r }
      ));
    }
    await w(200);

    // How trove learned — insight + tangle context
    const insightEl = line(arch.insight + ' trove learned this through the tangle — every choice was signal.', 'tg-pl--med');
    if (hasGSAP) {
      await new Promise(r => gsap.fromTo(insightEl,
        { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.44, ease: 'power3.out', clearProps: 'y', onComplete: r }
      ));
    }
    await w(500);

    // ── Share card image (full-width, flat) ───────────────────────────
    const cvs = await shareCardPromise;
    const cardDataUrl = cvs ? (() => { try { return cvs.toDataURL('image/png'); } catch(e) { return null; } })() : null;

    if (cardDataUrl) {
      const imgWrap = document.createElement('div');
      imgWrap.className = 'tg-pl';
      imgWrap.style.cssText = 'position:relative;overflow:visible;padding:0;margin:8px 0 4px;';
      const shareImg = document.createElement('img');
      shareImg.src = cardDataUrl;
      shareImg.style.cssText = 'width:100%;border-radius:14px;display:block;box-shadow:0 10px 36px rgba(34,34,34,0.18);opacity:0;';
      imgWrap.appendChild(shareImg);
      pitch.appendChild(imgWrap);
      scrollPitch();

      if (hasGSAP) {
        await new Promise(r => gsap.fromTo(shareImg,
          { opacity: 0, y: 28, scale: 0.92, filter: 'saturate(0) blur(8px)' },
          { opacity: 1, y: 0, scale: 1, filter: 'saturate(0) blur(0px)',
            duration: 0.6, ease: hasCE ? 'slam' : 'back.out(2)', clearProps: 'y,scale', onComplete: r }
        ));
        gsap.to(shareImg, { filter: 'saturate(1)', duration: 1.3, ease: 'power2.out', clearProps: 'filter' });
        gsap.to(shareImg, { y: -3, rotation: 0.4, duration: 2.8, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 0.5 });
        assetBurst(imgWrap, 'celebrate', 12);
        HAPTIC.burst();
      } else {
        shareImg.style.opacity = '1';
      }
      await w(300);

      // Single export button
      const exportBtn = document.createElement('button');
      exportBtn.className = 'tg-pl tg-share-btn-main';
      exportBtn.textContent = 'export →';
      exportBtn.style.cssText = 'display:block;width:100%;margin:0 0 20px;opacity:0;box-sizing:border-box;';
      pitch.appendChild(exportBtn);
      scrollPitch();
      if (hasGSAP) gsap.fromTo(exportBtn, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out', clearProps: 'y' });
      else exportBtn.style.opacity = '1';

      exportBtn.onclick = async () => {
        HAPTIC.tap();
        exportBtn.textContent = 'sharing…'; exportBtn.disabled = true;
        try {
          const blob = await new Promise(r => cvs.toBlob(r, 'image/png'));
          const file = new File([blob], `trove-${id}.png`, { type: 'image/png' });
          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({ title: arch.name, text: `${arch.name} — ${arch.sub}\n\ntrove.garden`, files: [file] });
          } else if (navigator.share) {
            await navigator.share({ title: arch.name, text: `${arch.name} — ${arch.sub}`, url: 'https://trove.garden' });
          } else {
            const link = document.createElement('a');
            link.download = `trove-${id}.png`; link.href = cardDataUrl; link.click();
          }
        } catch(e) {}
        exportBtn.textContent = 'export →'; exportBtn.disabled = false;
      };
    }
    await w(400);
    await w(600);

    // ── Section break ─────────────────────────────────────
    const sectionBreak = document.createElement('div');
    sectionBreak.className = 'tg-pl tg-section-break';
    sectionBreak.innerHTML = `<span class="tg-sb-rule"></span><img src="./TroveLogo.png" class="tg-sb-logo" alt="Trove"><span class="tg-sb-rule"></span>`;
    pitch.appendChild(sectionBreak);
    scrollPitch();
    if (hasGSAP) gsap.fromTo(sectionBreak, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.1 });
    else sectionBreak.style.opacity = '1';

    // ── Curious / Helen contact + email CTA ───────────────
    await w(600);
    emailCapture(); // non-blocking — email is optional, play-again always follows
    await w(2200);  // let email section animate in before section break appears

    // ── Play again ────────────────────────────────────────
    const playAgainWrap = document.createElement('div');
    playAgainWrap.className = 'tg-pl tg-play-again-wrap';
    const playAgain = document.createElement('button');
    playAgain.className = 'tg-play-again';
    playAgain.textContent = 'play again →';
    const playAgainSub = document.createElement('div');
    playAgainSub.className = 'tg-play-again-sub';
    playAgainSub.textContent = 'each run reveals something different.';
    playAgainWrap.append(playAgain, playAgainSub);
    playAgain.onclick = () => {
      HAPTIC.tap();
      if (hasGSAP) gsap.to(pitch, { opacity: 0, duration: 0.35, onComplete: () => window.tgInitGame?.() });
      else window.tgInitGame?.();
    };
    pitch.appendChild(playAgainWrap);
    scrollPitch();
    if (hasGSAP) gsap.from(playAgainWrap, { opacity: 0, y: 14, duration: 0.38, ease: 'power3.out', delay: 0.2 });
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
    setTimeout(() => {
      investorImg.classList.add('tg-decal--bob');
      // Fix 2: curve text arc above investor image
      curveText(investorImg, 'YOU\'VE BEEN HERE BEFORE \u2736', { above: true, radius: 48, arc: 150, delay: 0.3 });
    }, 1000);

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
  // spawnAmbientFloaters(); // removed — too much
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
  // Scale pulse on settle — like it landed
  if (hasGSAP) {
    gsap.fromTo(spinEl,
      { scale: 1.18 },
      { scale: 1, duration: 0.55, ease: 'elastic.out(1, 0.52)' }
    );
    HAPTIC.burst();
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
  scrollPitchSnap();

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
  await reveal(line('for how people <span class="tg-hl">actually behave?</span>', 'tg-pl--med'), {
    y: 24, stagger: 0.065, staggerEase: 'power2.inOut', duration: 0.52, blur: true,
    ease: hasCE ? 'unfurl' : 'power3.out',
  });
  await w(1000);

  // ── Gap 1: vision beat expansion ───────────────────────────────────────
  await reveal(line('Not what they say they\'ll do. Not their self-reported preferences.', 'tg-pl--dim'), {
    y: 12, stagger: 0.065, duration: 0.52, ease: hasCE ? 'unfurl' : 'power3.out',
  });
  await w(380);

  flash();
  const visionPopEl = line('', 'tg-pl--wordpop');
  await wordPop(visionPopEl, 'What they actually do.', ['#DBD59C', null, '#88ABE3', null, '#DBD59C']);
  await w(500);

  await reveal(line('Every choice in the game is <span class="tg-hl-b">a behavioural signal.</span> Aggregated, they\'re <span class="tg-hl">a fingerprint.</span>', 'tg-pl--med'), {
    y: 12, stagger: 0.065, duration: 0.52, blur: true, ease: hasCE ? 'unfurl' : 'power3.out',
  });
  assetBurst(visionPopEl, 'data', 7);
  await w(600);

  await w(1800);
  await sBranch0();
};
