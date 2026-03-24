import { RING_COLORS } from '../data/palette.js';

// createPitchUI(ctx) — scroll helpers, line, flash, reveal, coinTransition,
// decal, chapter, ringWipeChapter, contBtn, branchChoices.
// All functions close over ctx lazily so cross-module refs resolve at call time.

export function createPitchUI(ctx) {
  let _atBottom    = true;
  let ringColorIdx = 0;

  // scroll helpers — only auto-scroll if user was already at the bottom
  // (same pattern as Slack/iMessage: don't interrupt someone reading up)
  function _bindScroll() {
    ctx.pitch.addEventListener('scroll', () => {
      _atBottom = ctx.pitch.scrollHeight - ctx.pitch.clientHeight - ctx.pitch.scrollTop < 32;
    }, { passive: true });
  }

  function scrollPitch() {
    if (_atBottom) requestAnimationFrame(() => {
      ctx.pitch.scrollTop = ctx.pitch.scrollHeight - ctx.pitch.clientHeight;
    });
  }

  function scrollPitchSnap() {
    _atBottom = true;
    ctx.pitch.scrollTop = ctx.pitch.scrollHeight - ctx.pitch.clientHeight;
  }

  function pageBreak() {
    // full-viewport spacer — old content stays above, feels like a new page
    const spacer = document.createElement('div');
    spacer.style.cssText = `height:${ctx.pitch.clientHeight}px;flex-shrink:0;pointer-events:none;`;
    ctx.pitch.appendChild(spacer);
    scrollPitchSnap();
  }

  const TMARK = '<img src="./TroveLogo.png" class="tg-trove-mark" alt="Trove">';
  const tmark = s => s.replace(/\bTrove\b/g, TMARK);

  function line(html, cls, mt = 0) {
    const d = document.createElement('div');
    d.className = 'tg-pl ' + (cls || '');
    d.innerHTML = tmark(html);
    if (mt) d.style.marginTop = mt + 'px';
    ctx.pitch.appendChild(d);
    scrollPitch();
    return d;
  }

  // flash + shake — animates the *scene* wrapper, not the scroll container
  // shaking pitch directly clips overflow and looks broken
  function flash(double = false) {
    ctx.HAPTIC.burst();
    if (!ctx.scene) return;
    ctx.scene.classList.add('tg-flash');
    if (ctx.hasGSAP) {
      gsap.fromTo(ctx.scene, { x: -10, rotation: -0.7 },
        { x: 0, rotation: 0, duration: 0.9, ease: 'elastic.out(1, 0.28)', overwrite: true });
      gsap.fromTo(ctx.scene, { y: -5 },
        { y: 0, duration: 0.6, ease: 'elastic.out(1, 0.35)', delay: 0.04, overwrite: false });
    }
    setTimeout(() => {
      ctx.scene.classList.remove('tg-flash');
      if (double) {
        setTimeout(() => {
          ctx.scene.classList.add('tg-flash');
          if (ctx.hasGSAP) {
            gsap.fromTo(ctx.scene, { x: 7, rotation: 0.5 },
              { x: 0, rotation: 0, duration: 0.75, ease: 'elastic.out(1, 0.35)', overwrite: true });
          }
          setTimeout(() => ctx.scene.classList.remove('tg-flash'), 60);
        }, 85);
      }
    }, 60);
  }

  // reveal() — splits into words/chars, animates from blur+y, staggers in
  // returns a Promise so callers can await it
  function reveal(el, opts = {}) {
    if (!ctx.hasGSAP) return Promise.resolve();
    const splitType = opts.type || 'words';
    const split     = new SplitText(el, { type: splitType });
    const targets   = splitType === 'chars' ? split.chars : split.words;
    const applyBlur = opts.blur ?? (splitType === 'words');
    const defaultEase = ctx.hasCE
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

  // coinTransition — coin grows from wallet, fills screen, breathes, arcs down
  // and lands inline next to its target text element
  function coinTransition(walletEl, targetTextEl) {
    return new Promise(resolve => {
      if (!ctx.hasGSAP || !ctx.scene) { resolve(); return; }

      const LAND_W    = 72;
      const SZ        = 96;

      const sceneRect = ctx.scene.getBoundingClientRect();
      const wRect     = walletEl.getBoundingClientRect();

      const landScale  = LAND_W / SZ;
      const coverScale = (Math.min(sceneRect.width, sceneRect.height) * 0.9) / SZ;

      const sx = wRect.left - sceneRect.left + wRect.width  / 2 - SZ / 2;
      const sy = wRect.top  - sceneRect.top  + wRect.height / 2 - SZ / 2;
      const cx = sceneRect.width  / 2 - SZ / 2;
      const cy = sceneRect.height / 2 - SZ / 2;

      const coin = document.createElement('img');
      coin.src = './assets/coin.png';
      coin.style.cssText = `position:absolute;left:0;top:0;width:${SZ}px;height:${SZ}px;object-fit:contain;pointer-events:none;z-index:50;will-change:transform;`;
      ctx.scene.appendChild(coin);
      gsap.set(coin, { transformPerspective: 600 });

      const landed = document.createElement('img');
      landed.src = './assets/coin.png';
      landed.className = 'tg-inline-coin tg-decal--bob';
      landed.style.animationDelay = '-0.8s';
      landed.style.opacity = '0';
      targetTextEl.appendChild(landed);

      const tl = gsap.timeline({
        onComplete: () => {
          const r  = landed.getBoundingClientRect();
          const sr = ctx.scene.getBoundingClientRect();
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
        .to(coin, {
          x: cx, y: cy,
          scale: coverScale,
          rotationY: 720,
          duration: 1.85,
          ease: 'power1.in',
        })
        .to(coin, { scale: coverScale * 1.06, rotationY: 720, duration: 0.28, ease: 'sine.inOut' })
        .call(() => {
          ctx.scene.classList.add('tg-flash');
          setTimeout(() => ctx.scene.classList.remove('tg-flash'), 110);
        })
        .to(coin, {
          x: () => {
            const r  = landed.getBoundingClientRect();
            const sr = ctx.scene.getBoundingClientRect();
            return r.left - sr.left + r.width / 2 - SZ / 2;
          },
          y: () => {
            const r  = landed.getBoundingClientRect();
            const sr = ctx.scene.getBoundingClientRect();
            return r.top - sr.top + r.height / 2 - SZ / 2;
          },
          scale: landScale,
          rotationY: 1440,
          duration: 1.55,
          ease: 'power3.out',
        })
        .to(coin, { opacity: 0, duration: 0.18, ease: 'power1.in' });
    });
  }

  // decal() — drops a sticker PNG onto any pitch element, elastic entrance
  function decal(src, cls = 'tg-decal--bob', opts = {}) {
    const img = document.createElement('img');
    img.src = `./assets/${src}`;
    img.className = `tg-inline-decal ${cls}`;
    const hPos = opts.right !== undefined ? `right:${opts.right}` : `left:${opts.left || '-16px'}`;
    const vPos = opts.bottom !== undefined ? `bottom:${opts.bottom}` : (opts.top !== undefined ? `top:${opts.top}` : 'top:-8px');
    img.style.cssText = `width:${opts.w || 52}px;height:auto;position:absolute;${hPos};${vPos};opacity:0;pointer-events:none;`;
    if (ctx.hasGSAP) {
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
    ctx.pitch.appendChild(d);
    return d;
  }

  // ringWipeChapter — full-screen colour cascade expands, chapter label punches in,
  // rings contract, watermark slides into scroll. 4 palette colours cycle each chapter.
  async function ringWipeChapter(label) {
    ctx.HAPTIC.card();

    const startIdx  = ringColorIdx++ % 4;
    const ordered   = RING_COLORS.map((_, i) => RING_COLORS[(startIdx + i) % 4]);
    const topColor  = ordered[3];
    const textColor = topColor === '#88ABE3' ? '#F9F9F2' : '#222222';

    const _sw = ctx.scene.offsetWidth || 320;
    const rings = ordered.map((c, i) => {
      const r = document.createElement('div');
      r.style.cssText =
        `position:absolute;left:50%;top:50%;` +
        `width:${_sw}px;height:${_sw}px;margin:${-_sw/2}px 0 0 ${-_sw/2}px;` +
        `border-radius:50%;pointer-events:none;background:${c};` +
        `z-index:${200 + i};transform-origin:center center;`;
      ctx.scene.appendChild(r);
      return r;
    });

    const floatLbl = document.createElement('div');
    floatLbl.style.cssText =
      `position:absolute;z-index:210;left:50%;top:50%;` +
      `transform:translate(-50%,-50%);text-align:center;max-width:92%;` +
      `font-family:var(--font-display);font-size:clamp(56px,18cqw,96px);` +
      `font-weight:800;line-height:0.95;letter-spacing:-0.03em;` +
      `pointer-events:none;opacity:0;color:${textColor};`;
    floatLbl.textContent = label;
    ctx.scene.appendChild(floatLbl);

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
    ctx.pitch.appendChild(wrap);
    scrollPitch();

    if (ctx.hasGSAP) {
      const maxSc = Math.ceil(
        Math.hypot(_sw, ctx.scene.offsetHeight || 600) / _sw
      ) + 1;

      gsap.set(rings, { scale: 0 });

      await new Promise(r =>
        gsap.to(rings, { scale: maxSc, duration: 0.48, ease: 'power3.inOut', stagger: 0.1, onComplete: r })
      );

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
              ease: ctx.hasCE ? 'yank' : 'back.out(2.8)',
              stagger: { each: 0.14, from: 'start' },
              clearProps: 'transform,opacity',
            })
            .to(floatLbl, { scale: 1.06, duration: 0.1, ease: 'power1.out', yoyo: true, repeat: 1 }, '-=0.05');
        });

        await ctx.w(1700);

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
        await ctx.w(1700);
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

  function contBtn(label) {
    return new Promise(resolve => {
      const wrap = document.createElement('div');
      wrap.className = 'tg-pl tg-pitch-choices';
      const btn = document.createElement('button');
      btn.className = 'tg-pitch-choice';
      btn.textContent = label;
      btn.style.opacity = '0';
      btn.onclick = () => { ctx.HAPTIC.tap(); btn.disabled = true; ctx.disintegrate(wrap); setTimeout(resolve, 350); };
      wrap.appendChild(btn);
      ctx.pitch.appendChild(wrap);
      scrollPitch();
      if (ctx.hasGSAP) gsap.fromTo(btn, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.42, ease: 'power3.out', clearProps: 'all' });
      else btn.style.opacity = '';
    });
  }

  function branchChoices(choices) {
    return new Promise(resolve => {
      const wrap = document.createElement('div');
      wrap.className = 'tg-pl tg-pitch-choices';
      wrap.innerHTML = choices.map((c, i) =>
        `<button class="tg-pitch-choice" onclick="window._bc(${i})">${c}</button>`
      ).join('');
      [...wrap.querySelectorAll('.tg-pitch-choice')].forEach(b => b.style.opacity = '0');
      ctx.pitch.appendChild(wrap);
      scrollPitch();
      ctx.HAPTIC.begin();
      if (ctx.hasGSAP) {
        gsap.fromTo([...wrap.querySelectorAll('.tg-pitch-choice')],
          { opacity: 0, x: (i) => i % 2 === 0 ? 48 : -28, scale: 0.88, filter: 'blur(4px)' },
          { opacity: 1, x: 0, scale: 1, filter: 'none',
            duration: 0.52, ease: ctx.hasCE ? 'yank' : 'back.out(2)',
            stagger: { each: 0.09, ease: 'power2.inOut' },
            clearProps: 'all' },
        );
      } else {
        [...wrap.querySelectorAll('.tg-pitch-choice')].forEach(b => b.style.opacity = '');
      }
      window._bc = idx => {
        ctx.HAPTIC.tap();
        window._bc = () => {};
        [...wrap.querySelectorAll('.tg-pitch-choice')].forEach((b, i) => {
          b.disabled = true;
          if (i !== idx) ctx.disintegrate(b);
        });
        const sel = wrap.querySelectorAll('.tg-pitch-choice')[idx];
        sel.classList.add('selected');
        if (ctx.hasGSAP) {
          gsap.to(sel, { scale: 1.06, duration: 0.12, ease: 'power2.out',
            onComplete: () => gsap.to(sel, { scale: 1, duration: 0.9, ease: 'elastic.out(1, 0.38)' }) });
        }
        ctx.assetBurst(sel, 'celebrate');
        if (ctx.hasGSAP && ctx.hasScrTx) {
          const orig = sel.textContent;
          gsap.to(sel, { duration: 0.52,
            scrambleText: { text: orig, chars: '!<>-_\\/[]{}░▒▓', speed: 0.65 } });
        }
        const newCount = ctx.getChoiceCount() + 1;
        ctx.setChoiceCount(newCount);
        window.tgAPI.setProgress(25 + Math.min(newCount, 3) * 25);
        const _now = Date.now();
        if (!ctx.getFirstBranchTs()) ctx.setFirstBranchTs(_now);
        if (ctx.getLastChoiceTime()) ctx.pushChoiceTiming(_now - ctx.getLastChoiceTime());
        ctx.setLastChoiceTime(_now);
        setTimeout(() => resolve(idx), 600);
      };
    });
  }

  // bind scroll listener once ctx.pitch is set
  _bindScroll();

  return {
    scrollPitch, scrollPitchSnap, pageBreak,
    line, flash, reveal,
    coinTransition, decal, chapter, ringWipeChapter,
    contBtn, branchChoices,
  };
}
