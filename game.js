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
  const btn = document.getElementById('t-pause-btn');
  if (!btn) return;
  btn.textContent = window.tgPaused ? '▶' : '⏸';
};

/* ── Speed control ── */
window.tToggleSpeedPanel = function () {
  const panel = document.getElementById('t-speed-panel');
  if (panel) panel.classList.toggle('open');
};

window.tSetSpeed = function (mult) {
  window.tgSpeedMult = mult;
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

  const w = ms => new Promise(r => setTimeout(r, ms * window.tgSpeedMult));

  function scrollPitch() {
    if (hasGSAP) {
      gsap.to(pitch, { scrollTop: pitch.scrollHeight, duration: 0.6, ease: 'power3.out', overwrite: true });
    } else {
      pitch.scrollTop = pitch.scrollHeight;
    }
  }

  function line(html, cls, mt = 0) {
    const d = document.createElement('div');
    d.className = 'tg-pl ' + (cls || '');
    d.innerHTML = html;
    if (mt) d.style.marginTop = mt + 'px';
    pitch.appendChild(d);
    scrollPitch();
    return d;
  }

  /* Flash + scene shake — animate scene, not pitch (avoids clipping shift) */
  function flash(double = false) {
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

      const SZ        = 68;
      const LAND_W    = 72;   // final displayed width in CSS
      const landScale = LAND_W / SZ;

      // Snapshot positions that DON'T change (wallet, scene) right now
      const sceneRect = scene.getBoundingClientRect();
      const wRect     = walletEl.getBoundingClientRect();

      const sx = wRect.left - sceneRect.left + wRect.width  / 2 - SZ / 2;
      const sy = wRect.top  - sceneRect.top  + wRect.height / 2 - SZ / 2;
      const cx = sceneRect.width  / 2 - SZ / 2;
      const cy = sceneRect.height / 2 - SZ / 2;
      const coverScale = Math.max(sceneRect.width, sceneRect.height) / SZ * 1.35;

      const coin = document.createElement('img');
      coin.src = './assets/coin.png';
      coin.style.cssText = `position:absolute;left:0;top:0;width:${SZ}px;height:auto;pointer-events:none;z-index:50;`;
      scene.appendChild(coin);
      gsap.set(coin, { transformPerspective: 800 });

      const tl = gsap.timeline({
        onComplete: () => {
          coin.remove();
          // Coin lands inline inside targetTextEl, right after "someone."
          const landed = document.createElement('img');
          landed.src = './assets/coin.png';
          landed.className = 'tg-inline-coin tg-decal--bob';
          landed.style.animationDelay = '-0.8s';
          targetTextEl.appendChild(landed);
          // Scroll so the landing is visible, then animate in
          scrollPitch();
          gsap.from(landed, {
            scale: 0.15, rotation: -180, opacity: 0,
            duration: 0.75, ease: 'elastic.out(1, 0.42)',
          });
          resolve();
        },
      });

      tl
        .set(coin, { x: sx, y: sy, scale: 0.28, rotationY: 0, opacity: 1 })

        // ── APPROACH: barely stirs, then surges ──
        .to(coin, {
          x: cx, y: cy,
          scale: coverScale,
          rotationY: 720,
          duration: 1.85,
          ease: 'power1.in',
        })

        // ── PEAK: breathe at full coverage ──
        .to(coin, { scale: coverScale * 1.07, duration: 0.32, ease: 'sine.inOut' })
        .call(() => {
          scene.classList.add('tg-flash');
          setTimeout(() => scene.classList.remove('tg-flash'), 95);
        })

        // ── RECEDE: lazy target — re-reads targetTextEl's CURRENT rect when
        //    this tween fires, so scroll drift during approach doesn't matter ──
        .to(coin, {
          x: () => {
            const r  = targetTextEl.getBoundingClientRect();
            const sr = scene.getBoundingClientRect();
            return r.right - sr.left + 6 - SZ / 2;
          },
          y: () => {
            const r  = targetTextEl.getBoundingClientRect();
            const sr = scene.getBoundingClientRect();
            return r.top - sr.top + r.height / 2 - SZ / 2;
          },
          scale: landScale,
          rotationY: 1440,
          duration: 1.55,
          ease: 'power3.out',
        })

        // ── SETTLE: hand off to DOM sticker ──
        .to(coin, { scale: 0, opacity: 0, duration: 0.1, ease: 'power3.in' });
    });
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
  await w(1300);

  // ── Beat 2: Wrong call — capture element so coin can land beside "someone." ──
  const someoneEl = line('You made the wrong call on someone.', 'tg-pl--med', 28);
  await reveal(someoneEl, {
    y: 24, stagger: 0.07, staggerEase: 'power2.out', duration: 0.52, blur: true,
    ease: hasCE ? 'unfurl' : 'power3.out',
  });
  await w(900);

  window.tgAPI.setProgress(20);

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

  disintegrate(spinEl);
  await w(700);

  await reveal(line("it doesn\u2019t matter who \u2014 we\u2019ve all been there.", 'tg-pl--med', 8), {
    y: 22, stagger: 0.06, duration: 0.48, blur: true,
  });
  await w(1000);

  window.tgAPI.setProgress(45);

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
      setTimeout(() => resolve(idx), 540);
    };
  });
  window.tgAPI.setProgress(70);

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
        { opacity: 1, y: 0, scale: 1, rotation: 0, duration: 0.7, ease: 'elastic.out(1, 0.48)' }
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

  window.tgAPI.setProgress(100);
  window.tgAPI.showEnd("That's what Trove does.\n\nWant to find out how it works?");
};
