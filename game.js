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
        'position:absolute;right:18px;top:50%;transform:translateY(-50%);' +
        'width:68px;height:auto;opacity:0;pointer-events:none;';
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
    const pqFills = ['#C3D9FF', '#FFFBCD']; // echo blue, light yellow — alternate each card
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
      // text fades in word by word
      if (window.SplitText) {
        const split = new SplitText(textEl, { type: 'words' });
        await new Promise(r => {
          gsap.timeline({ onComplete: r })
            .fromTo(split.words,
              { opacity: 0, y: 8 },
              { opacity: 1, y: 0, duration: 0.32, ease: 'power2.out', stagger: 0.05, clearProps: 'y,opacity' }
            );
        });
        split.revert();
        textEl.style.opacity = ''; // clear rlist()'s opacity:0 — split.revert() restores content but not parent inline styles
      } else {
        await new Promise(r => gsap.fromTo(textEl,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.32, ease: 'power2.out', clearProps: 'y,opacity', onComplete: r },
        ));
      }
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

    try { await document.fonts.load('900 74px "Playfair Display"'); } catch(e) {}

    ctx.textAlign = 'center'; ctx.textBaseline = 'top';

    // Tag — spaced letters
    ctx.fillStyle = '#88ABE3';
    ctx.font = '400 13px system-ui';
    const tagStr = 'YOUR INVESTOR ARCHETYPE';
    let tx = W / 2 - ctx.measureText(tagStr).width / 2 - tagStr.length * 1.5;
    tagStr.split('').forEach(ch => { ctx.fillText(ch, tx, headerH + 26); tx += ctx.measureText(ch).width + 3; });

    // Name
    ctx.fillStyle = '#222222';
    ctx.font = '900 74px "Playfair Display", serif';
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
    ctx.font = '400 18px system-ui';
    ctx.fillText(arch.sub, W / 2, headerH + 158);

    // Divider + gold accent
    ctx.strokeStyle = 'rgba(34,34,34,0.1)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(80, headerH + 206); ctx.lineTo(W - 80, headerH + 206); ctx.stroke();
    ctx.strokeStyle = '#DBD59C'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(W / 2 - 42, headerH + 210); ctx.lineTo(W / 2 + 42, headerH + 210); ctx.stroke();

    // Description
    ctx.fillStyle = 'rgba(34,34,34,0.72)';
    ctx.font = '500 22px system-ui';
    const descBottom = wrapTextCanvas(ctx, arch.desc, W / 2, headerH + 236, W - 160, 34);

    // Together line
    const togetherText = arch.together.replace(/<\/?strong>/g, '');
    ctx.fillStyle = 'rgba(34,34,34,0.45)';
    ctx.font = '400 16px system-ui';
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
    ctx.font = '400 16px system-ui';
    ctx.fillText('trove.garden', W / 2, H - 48);

    return cvs;
  }

  function contBtn(label) {
    return new Promise(resolve => {
      const btn = document.createElement('button');
      btn.className = 'tg-pl tg-cont';
      btn.textContent = label;
      btn.onclick = () => { HAPTIC.tap(); btn.disabled = true; disintegrate(btn); setTimeout(resolve, 350); };
      btn.style.opacity = '0'; // pre-invisible: no flash, no accidental tap on touchscreen
      pitch.appendChild(btn);
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
    const questionEl = line('<span class="tg-hl">what they actually did when it mattered.</span>', 'tg-pl--big');
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
    await reveal(line('Trove\'s fundamental move: you never ask.', 'tg-pl--big'), {
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
    const houseDecal = decal('house.png', 'tg-decal--bob', { right: '-26px', top: '-14px', w: 54, fromY: -30, delay: 0.3 });
    infraEl.appendChild(houseDecal);
    // Fix 4: curve text arc around house decal
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
    await w(200);
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
    await dimLines('She also built a 30,000-person tech audience before she needed it. That\'s not a vanity metric. That\'s a launch list.', 180);
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
    // Punchline: gold slam — short enough to never wrap mid-word
    await reveal(line('The questionnaire is the problem.', 'tg-pl--punch'), {
      type: 'chars', y: 0,
      scale: () => gsap.utils.random(0.1, 0.5),
      rotation: () => gsap.utils.random(-12, 12),
      stagger: 0.045, from: 'center', duration: 0.6, ease: hasCE ? 'slam' : 'back.out(3)',
    });
    await w(600);
    // Supporting context — dim blue, tighter stagger, no blur (different from med)
    await reveal(line('Not the form it takes — the entire model of asking people to describe themselves. The only behavioural data that isn\'t gameable is data captured when the person is too absorbed in something else to perform.', 'tg-pl--dim'), {
      y: 8, stagger: 0.06, duration: 0.50, ease: hasCE ? 'unfurl' : 'power3.out',
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
    statsEl.appendChild(decal('babystar.png', 'tg-decal--bob', { right: '-18px', top: '-18px', w: 40, delay: 0.2 }));
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
    discordEl.appendChild(decal('bubblublower.png', 'tg-decal--bob', { right: '-24px', top: '-8px', w: 44, fromY: -22, delay: 0.2 }));
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
  function recapScreen(buildFn) {
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.className = 'tg-recap-overlay';
      scene.appendChild(overlay);
      buildFn(overlay);

      const hint = document.createElement('div');
      hint.className = 'tg-recap-hint';
      hint.textContent = 'tap to continue';
      overlay.appendChild(hint);

      HAPTIC.begin();
      if (hasGSAP) {
        gsap.from(overlay, { y: '100%', duration: 0.55, ease: hasCE ? 'slam' : 'back.out(1.5)', clearProps: 'transform' });
      }

      const advance = () => {
        HAPTIC.tap();
        overlay.removeEventListener('click', advance);
        if (hasGSAP) {
          gsap.to(overlay, {
            y: '-100%', duration: 0.42, ease: hasCE ? 'unfurl' : 'power3.in',
            onComplete: () => { overlay.remove(); resolve(); },
          });
        } else {
          overlay.remove();
          resolve();
        }
      };
      setTimeout(() => overlay.addEventListener('click', advance), 800);
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
    return {
      id, arch,
      pathLength: branchPath.length,
      firstChoiceLabel: firstChoice !== null ? firstChoiceLabels[firstChoice] : 'curious',
      traits: traitLines[id] || [],
      wentDeepOnMoat, wentStraightToAsk, usedFounderPath, pushedBackOnData,
    };
  }

  // ── EMAIL CAPTURE (standalone) ────────────────────────
  async function emailCapture() {
    return new Promise(resolveEmail => {
      const emailDiv = document.createElement('div');
      emailDiv.className = 'tg-pl';
      emailDiv.innerHTML = `
        <div class="tg-email-hero" id="tg-email-hero" style="opacity:0">curious?</div>
        <div class="tg-email-parade" id="tg-email-parade"></div>
        <div class="tg-email-sub" id="tg-email-sub" style="opacity:0">stay up to date with upcoming drops</div>
        <div class="tg-email-list-lbl" id="tg-email-lbl" style="opacity:0">first-look list — one note when it's real</div>
        <div class="tg-email-form" id="tg-email-form" style="opacity:0">
          <input class="tg-email-in" id="tg-email-in" type="email" placeholder="you@somewhere.com" autocomplete="email">
          <button class="tg-email-send" id="tg-email-send">→</button>
        </div>
        <button class="tg-e-no" id="tg-email-skip" style="opacity:0">skip →</button>
        <span class="tg-email-fine" id="tg-email-fine" style="opacity:0">no spam. just signal — you'll hear first when trove is ready.</span>
        <div class="tg-email-helen" id="tg-email-helen" style="opacity:0">Helen Huang · Founder, Trove &nbsp;·&nbsp; <a href="mailto:helen@trove.garden" class="tg-email-helen-link">helen@trove.garden</a></div>
      `;

      const paradeEl = emailDiv.querySelector('#tg-email-parade');
      [
        { src: 'starhehe.png',    anim: 'spin'   },
        { src: 'frog.png',        anim: 'bounce' },
        { src: 'derpy.png',       anim: 'dance'  },
        { src: 'turtle.png',      anim: 'bob'    },
        { src: 'caterpillar.png', anim: 'wiggle' },
        { src: 'babystar.png',    anim: 'spin2'  },
      ].forEach(a => {
        const img = document.createElement('img');
        img.src = `./assets/${a.src}`;
        img.dataset.anim = a.anim;
        img.style.opacity = '0';
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
          gsap.to([emailDiv.querySelector('#tg-email-form'), emailDiv.querySelector('#tg-email-skip'), emailDiv.querySelector('#tg-email-fine')],
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
        const skipEl    = emailDiv.querySelector('#tg-email-skip');
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
        gsap.fromTo(formEl, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.38, ease: 'power3.out', delay: 1.2 });
        gsap.fromTo(skipEl, { opacity: 0 },         { opacity: 1,       duration: 0.25, delay: 1.36 });
        gsap.fromTo(fineEl, { opacity: 0 },         { opacity: 1,       duration: 0.25, delay: 1.46,
          onComplete: () => { emailDiv.querySelector('#tg-email-in')?.focus(); },
        });
        gsap.fromTo(helenEl, { opacity: 0, y: 8 },  { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out', delay: 1.64 });
      } else {
        ['tg-email-hero','tg-email-sub','tg-email-lbl','tg-email-form','tg-email-skip','tg-email-fine','tg-email-helen']
          .forEach(id => { const el = emailDiv.querySelector('#' + id); if (el) el.style.opacity = '1'; });
        paradeEl.querySelectorAll('img').forEach(img => { img.style.opacity = '1'; });
        emailDiv.querySelector('#tg-email-in')?.focus();
      }

      setTimeout(() => {
        emailDiv.querySelector('#tg-email-in')?.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
        emailDiv.querySelector('#tg-email-send')?.addEventListener('click', submit);
        emailDiv.querySelector('#tg-email-skip')?.addEventListener('click', () => { HAPTIC.tap(); resolveEmail(); });
      }, 80);
    });
  }

  // ── ARCHETYPE REVEAL ──────────────────────────────────
  async function sRevealArchetype() {
    window.tgAPI.setProgress(100);

    const id   = getArchetype();
    const data = buildRecapData(id);
    const arch = data.arch;

    // ── Screen 1: path summary ────────────────────────────
    await recapScreen(el => {
      const badges = [];
      if (data.pushedBackOnData)   badges.push('skeptic');
      if (data.usedFounderPath)    badges.push('team-first');
      if (data.wentDeepOnMoat)     badges.push('systems thinker');
      if (data.wentStraightToAsk)  badges.push('decisive');
      el.innerHTML = `
        <div class="tg-recap-eyebrow">your session · wrapped</div>
        <div class="tg-recap-big">${data.pathLength} moves.</div>
        <div class="tg-recap-body">You came in as a <span class="tg-recap-hl">${data.firstChoiceLabel}</span>.</div>
        <div class="tg-recap-body">${
          data.wentDeepOnMoat     ? 'You stayed for the flywheel.' :
          data.wentStraightToAsk  ? 'You cut to the ask.' :
          data.usedFounderPath    ? 'You needed to know the founder first.' :
                                    'You followed the signal.'
        }</div>
        ${badges.length ? `<div class="tg-recap-fine">${badges.join(' · ')}</div>` : '<div class="tg-recap-fine"></div>'}
      `;
    });

    // ── Screen 2: trait signal ────────────────────────────
    await recapScreen(el => {
      el.style.background = 'var(--shift)';
      el.innerHTML = `
        <div class="tg-recap-eyebrow" style="color:var(--anchor)">pattern detected</div>
        <div class="tg-recap-big" style="color:var(--anchor)">${data.traits[0] || 'you paid attention'}.</div>
        <div class="tg-recap-body" style="color:var(--anchor);opacity:0.72">${data.traits[1] || ''}</div>
      `;
    });

    // ── Screen 3: archetype name ──────────────────────────
    await recapScreen(el => {
      el.style.background = 'var(--anchor)';
      el.innerHTML = `
        <div class="tg-recap-eyebrow" style="color:var(--trace)">your investor archetype</div>
        <div class="tg-recap-arch-name" id="tg-recap-arch-name" style="color:var(--shift)">${arch.name}</div>
        <div class="tg-recap-body" style="color:rgba(255,255,255,0.68)">${arch.sub}</div>
      `;
      if (hasGSAP) {
        const nameEl = el.querySelector('#tg-recap-arch-name');
        if (nameEl) {
          const split = new SplitText(nameEl, { type: 'chars' });
          gsap.from(split.chars, {
            opacity: 0, y: 44, scale: 0.25,
            rotation: i => Math.sin(i * 1.4) * 22,
            duration: 0.68, ease: hasCE ? 'slam' : 'back.out(2.5)',
            stagger: { each: 0.07, ease: 'power2.out' },
            delay: 0.18,
          });
        }
      }
      HAPTIC.notif();
    });

    // ── Screen 4: archetype description ──────────────────
    await recapScreen(el => {
      el.style.background = 'var(--trace)';
      el.innerHTML = `
        <div class="tg-recap-eyebrow" style="color:var(--anchor)">${arch.name}</div>
        <div class="tg-recap-big" style="color:var(--anchor);font-size:clamp(18px,6.5cqw,28px);line-height:1.25">${arch.desc}</div>
        <div class="tg-recap-body" style="color:var(--anchor);opacity:0.72;margin-top:18px">${arch.together}</div>
      `;
    });

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
      pitch.appendChild(wrap);
      scrollPitch();

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

    // ── Profile card ──────────────────────────────────────
    const archetypeAssets = {
      cartographer: { src: 'camera.png',    opts: { right: '-28px', top: '-12px', w: 56 } },
      contrarian:   { src: 'boomerand.png', opts: { right: '-24px', top: '-8px',  w: 52, fromRot: -45, toRot: 8 } },
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
    HAPTIC.card();
    if (hasGSAP) {
      await new Promise(r => gsap.from(profileCard, { opacity: 0, y: 26, scale: 0.96, duration: 0.55, ease: 'back.out(2)', clearProps: 'all', onComplete: r }));
    }

    assetBurst(profileCard, 'celebrate', 18);
    await w(350);

    profileCard.style.position = 'relative'; profileCard.style.overflow = 'visible';
    const { src, opts } = archetypeAssets[id];
    profileCard.appendChild(decal(src, 'tg-decal--bob', { ...opts, delay: 0 }));
    setTimeout(() => orbitingTextRing(profileCard,
      `\u2736 ${arch.name.toUpperCase()} \u2736 TROVE INVESTOR \u2736 `), 700);

    await w(300);

    const nameEl = document.getElementById('tg-arch-name');
    if (nameEl) {
      const originalName = nameEl.textContent;
      await wordPop(nameEl, originalName, ['#DBD59C', '#88ABE3', '#DBD59C', '#88ABE3', '#DBD59C']);
      nameEl.style.textDecoration = 'underline';
      nameEl.style.textDecorationColor = 'var(--trace)';
      nameEl.style.textDecorationThickness = '2px';
      nameEl.style.textUnderlineOffset = '4px';
    }
    await w(700);

    // Share button
    const shareBtn = document.createElement('button');
    shareBtn.className = 'tg-share-btn-main';
    shareBtn.textContent = 'share this →';
    shareBtn.onclick = async () => {
      HAPTIC.tap();
      shareBtn.textContent = 'generating…';
      shareBtn.disabled = true;
      try {
        const cvs = await generateShareCard(arch, id);
        const blob = await new Promise(r => cvs.toBlob(r, 'image/png'));
        const file = new File([blob], `trove-${id}.png`, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ title: arch.name, text: `${arch.name} — ${arch.sub}\n\ntrove.garden`, files: [file] });
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

    // ── Curious / Helen contact + email CTA ───────────────
    await w(600);
    await emailCapture();
    await w(400);

    // ── Play again ────────────────────────────────────────
    const playAgain = document.createElement('button');
    playAgain.className = 'tg-pl tg-play-again';
    playAgain.textContent = 'play again →';
    playAgain.onclick = () => {
      HAPTIC.tap();
      if (hasGSAP) gsap.to(pitch, { opacity: 0, duration: 0.35, onComplete: () => window.tgInitGame?.() });
      else window.tgInitGame?.();
    };
    pitch.appendChild(playAgain);
    scrollPitch();
    if (hasGSAP) gsap.from(playAgain, { opacity: 0, y: 14, duration: 0.38, ease: 'power3.out', delay: 0.2 });
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
