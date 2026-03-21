import { HAPTIC } from './haptics.js';

window.tgSpeedMult = 1.0;

/* ══════════════════════════════════════════════════════════════
   GAME ENGINE
══════════════════════════════════════════════════════════════ */

function replyText(str) {
  const dash = str.indexOf(' \u2014 ');
  return dash >= 0 ? str.slice(0, dash) : str;
}

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

  addNarration(text) {
    const scroll = document.getElementById('tg-scroll');
    if (!scroll) return;
    const block = document.createElement('p');
    block.className = 'tg-narration';
    const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
    const bigBlock = sentences.length >= 3;
    sentences.forEach((sentence, i) => {
      const line = document.createElement('span');
      line.className = 'tg-narration-line';
      line.textContent = sentence;
      line.style.animationDelay = `${i * 900 * (bigBlock ? 1.25 : 1) * window.tgSpeedMult}ms`;
      block.appendChild(line);
    });
    scroll.appendChild(block);
    requestAnimationFrame(() => { scroll.scrollTop = scroll.scrollHeight; });
  },

  addImage(description, bgColor = '#2a3020') {
    const scroll = document.getElementById('tg-scroll');
    if (!scroll) return;
    const div = document.createElement('div');
    div.className = 'tg-inline-img';
    div.style.background = bgColor;
    div.textContent = description;
    scroll.appendChild(div);
    requestAnimationFrame(() => { scroll.scrollTop = scroll.scrollHeight; });
  },

  addBubble(text, typingMs = 1400) {
    return new Promise(resolve => {
      const scroll = document.getElementById('tg-scroll');
      if (!scroll) return resolve();
      const lastEl = scroll.lastElementChild;
      const showMeta = !lastEl || !lastEl.classList.contains('tg-bubble-wrap');
      const wrap = document.createElement('div');
      wrap.className = 'tg-bubble-wrap';
      wrap.innerHTML = `
        ${showMeta ? `<div class="tg-bubble-meta">
          <div class="tg-bubble-avatar">C</div>
          <span class="tg-bubble-name">Cass</span>
        </div>` : ''}
        <div class="tg-typing"><span></span><span></span><span></span></div>
      `;
      scroll.appendChild(wrap);
      scroll.scrollTop = scroll.scrollHeight;
      setTimeout(() => {
        const typing = wrap.querySelector('.tg-typing');
        if (typing) {
          const bubble = document.createElement('div');
          bubble.className = 'tg-bubble';
          bubble.textContent = text;
          typing.replaceWith(bubble);
          scroll.scrollTop = scroll.scrollHeight;
        }
        resolve();
      }, typingMs * window.tgSpeedMult);
    });
  },

  /* Renders choices inline in the scroll area — no separate panel */
  showChoicesAsync(choices) {
    const scroll = document.getElementById('tg-scroll');
    if (!scroll) return Promise.resolve(0);

    return new Promise(resolve => {
      window._tgChoiceResolve = resolve;
      window._tgChoiceNarrations = choices.map(c => {
        const dash = c.indexOf(' \u2014 ');
        return dash >= 0 ? c.slice(dash + 3) : null;
      });

      const group = document.createElement('div');
      group.className = 'tg-choice-group';
      group.id = 'tg-choice-group-active';
      group.innerHTML = choices
        .map((c, i) => `<button class="tg-choice" onclick="window._tgChoiceClick(this,${i})">${replyText(c)}</button>`)
        .join('');
      scroll.appendChild(group);
      requestAnimationFrame(() => { scroll.scrollTop = scroll.scrollHeight; });
    });
  },

  collect(emoji, name) {
    HAPTIC.tap();
    const toast = document.getElementById('tg-toast');
    if (!toast) return;
    toast.textContent = `${emoji}  You collected: ${name}`;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 2800);
  },

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

/* ── Choice tap: selected stays green with checkmark, others disintegrate ── */
window._tgChoiceClick = function (btn, idx) {
  if (btn.classList.contains('selected')) return;
  HAPTIC.tap();
  btn.classList.add('selected');

  const group = document.getElementById('tg-choice-group-active');
  if (group) {
    group.removeAttribute('id');
    group.querySelectorAll('.tg-choice').forEach(b => {
      b.disabled = true;
      if (b !== btn) disintegrate(b);
    });
  }

  // Resolve after disintegration + slide settles
  setTimeout(() => {
    const narration = window._tgChoiceNarrations && window._tgChoiceNarrations[idx];
    window._tgChoiceNarrations = null;
    if (narration) window.tgAPI.addNarration(narration);
    if (window._tgChoiceResolve) {
      const resolve = window._tgChoiceResolve;
      window._tgChoiceResolve = null;
      resolve(idx);
    }
  }, 520);
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

  // ── Drum dial builder (keep exactly as-is) ─────────────────────
  const ITEM_H = 46;
  const VISIBLE = 5;
  const DIAL_H  = ITEM_H * VISIBLE;
  const DIAL_PAD = (DIAL_H - ITEM_H) / 2;

  function buildDial(words, settleIdx) {
    const wrap  = document.createElement('div');
    wrap.className = 'tg-dial-wrap'; // no tg-pl — GSAP handles entrance, avoids transform conflict

    const tick = document.createElement('div');
    tick.className = 'tg-dial-line';

    const fade  = document.createElement('div');
    fade.className = 'tg-dial-fade';

    const track = document.createElement('div');
    track.className = 'tg-dial-track';
    track.style.cssText = `padding-top:${DIAL_PAD}px;padding-bottom:${DIAL_PAD}px;`;

    const items = words.map(word => {
      const el = document.createElement('div');
      el.className = 'tg-dial-item';
      el.textContent = word;
      track.appendChild(el);
      return el;
    });

    wrap.append(tick, fade, track);

    function syncActive() {
      const center = track.scrollTop;
      items.forEach((el, i) => {
        const dist = Math.abs(i * ITEM_H - center) / ITEM_H;
        el.style.opacity   = Math.max(0.15, 1 - dist * 0.42);
        el.style.transform = `scale(${Math.max(0.62, 1 - dist * 0.15)})`;
        el.classList.toggle('active', dist < 0.5);
      });
    }
    track.addEventListener('scroll', syncActive, { passive: true });
    syncActive();

    const done = new Promise(resolve => {
      let count = 0;
      const total = 34;
      function step() {
        const p = count / total;
        const delay = p < 0.42 ? 52 : p < 0.74 ? 105 : 195;
        if (count < total) {
          track.scrollTop = (count % words.length) * ITEM_H;
          syncActive();
          count++;
          setTimeout(step, delay * window.tgSpeedMult);
        } else {
          const from  = track.scrollTop;
          const to    = settleIdx * ITEM_H;
          const start = performance.now();
          const dur   = 420;
          (function settle(now) {
            const t = Math.min(1, (now - start) / dur);
            const e = 1 - Math.pow(1 - t, 3);
            track.scrollTop = from + (to - from) * e;
            syncActive();
            if (t < 1) requestAnimationFrame(settle);
            else resolve();
          })(performance.now());
        }
      }
      setTimeout(step, 80 * window.tgSpeedMult);
    });

    return { el: wrap, done };
  }

  window.tgAPI.setProgress(0);

  // ── Beat 1: You're an investor ────────────────────────────────
  // Impact slam — chars scatter from random y/x/rotation, land together
  {
    const el = line("You're an investor.", 'tg-pl--big');
    if (hasGSAP) {
      const split = new SplitText(el, { type: 'chars' });
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
  }
  await w(1100);

  // ── Beat 2: Wrong call — one tight line ───────────────────────
  await reveal(line('You made the wrong call on someone.', 'tg-pl--med', 28), {
    y: 24, stagger: 0.07, staggerEase: 'power2.out', duration: 0.52, blur: true,
    ease: hasCE ? 'unfurl' : 'power3.out',
  });
  await w(900);

  window.tgAPI.setProgress(20);

  // ── Beat 3: A [dial] ─────────────────────────────────────────
  await reveal(line('A', 'tg-pl--dim', 28), { y: 18, duration: 0.32, blur: false });
  await w(260);

  const dial2 = buildDial(['hire','co-founder','partner','date','friend'], 2);
  dial2.el.style.marginTop = '18px';
  pitch.appendChild(dial2.el);
  if (hasGSAP) gsap.from(dial2.el, { opacity: 0, y: 28, filter: 'blur(6px)', duration: 0.55, ease: 'power3.out', clearProps: 'filter' });
  pitch.scrollTop = pitch.scrollHeight;
  await dial2.done;
  await w(500);

  await reveal(line('who looked right on paper.', 'tg-pl--med'), {
    y: 22, stagger: 0.07, staggerEase: 'power2.inOut', duration: 0.48, blur: true,
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

  await w(400);
  await reveal(line('for how people actually behave?', 'tg-pl--med'), {
    y: 24, stagger: 0.065, staggerEase: 'power2.inOut', duration: 0.52, blur: true,
    ease: hasCE ? 'unfurl' : 'power3.out',
  });
  await w(1600);

  window.tgAPI.setProgress(100);
  window.tgAPI.showEnd("That's what Trove does.\n\nWant to find out how it works?");
};
