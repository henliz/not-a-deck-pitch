import { BURST_SETS, STAT_COLORS } from '../data/palette.js';

// createRichElements(ctx) — all the visual set pieces:
// assetBurst, fullScreenAssetSweep, wavePunch, crtTicker, orbitingTextRing,
// curveText, typewriterLine, wordPop, testimonialReel, statsFormation,
// dimLines, statCard, spawnAmbientFloaters, pqReveal, statsBlockReveal,
// rlist, rlistReveal, askGrid.

const TMARK = '<img src="./TroveLogo.png" class="tg-trove-mark" alt="Trove">';
const tmark = s => s.replace(/\bTrove\b/g, TMARK);

export function createRichElements(ctx) {
  let statColorIdx = 0;
  let pqColorIdx   = 0;

  // confetti-style explosion of sticker images from a point — used on choice confirms + heavy beats
  function assetBurst(originEl, setName = 'celebrate', count = 10) {
    if (!ctx.hasGSAP || !originEl) return;
    ctx.HAPTIC.burst();
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

  // one asset flies across the full phone width — subtle punctuation between heavy beats
  function fullScreenAssetSweep(src) {
    if (!ctx.hasGSAP || !ctx.scene) return;
    const scW = ctx.scene.offsetWidth  || 320;
    const scH = ctx.scene.offsetHeight || 600;
    const img = document.createElement('img');
    img.src = `./assets/${src}`;
    img.style.cssText =
      `position:absolute;left:0;top:50%;width:${scW}px;height:auto;` +
      `transform:translateY(-50%) translateX(-110%);` +
      `pointer-events:none;z-index:150;opacity:0;`;
    ctx.scene.appendChild(img);
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

  // wavePunch — stacked text with a sine wave flowing through every character
  // each char is its own span animated on the GSAP ticker, so motion is perfectly smooth
  function wavePunch(lines, { A = 9, freq = 0.28, speed = 1.9 } = {}) {
    const wrap = document.createElement('div');
    wrap.className = 'tg-pl tg-pl--punch';
    ctx.pitch.appendChild(wrap);
    ctx.scrollPitch();

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

    if (ctx.hasGSAP) {
      gsap.from(wrap, { opacity: 0, y: 20, duration: 0.55, ease: ctx.hasCE ? 'unfurl' : 'power3.out' });
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

  // crtTicker — horizontal text ribbon whose Y position tracks a sine curve in world space
  // (not just a bobbing ribbon — each character's Y is driven by its actual screen X,
  // so the whole track travels *through* the curve as it scrolls)
  function crtTicker(text) {
    const wrap  = document.createElement('div');
    wrap.className = 'tg-pl tg-sine-ticker';
    const track = document.createElement('div');
    track.className = 'tg-sine-track';

    const full   = text + '   \u2736   ';
    const colors = ['#DBD59C', '#88ABE3', 'rgba(34,34,34,0.72)'];
    let wordColor = colors[0], ci = 0;
    for (let copy = 0; copy < 2; copy++) {
      ci = 0;
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
    ctx.pitch.appendChild(wrap);
    ctx.scrollPitch();

    if (ctx.hasGSAP) {
      gsap.from(wrap, { opacity: 0, duration: 0.7, ease: 'power2.out' });
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const halfW = track.scrollWidth / 2;
        if (!halfW) return;
        gsap.fromTo(track, { x: 0 },
          { x: -halfW, duration: halfW / 50, ease: 'none', repeat: -1, repeatDelay: 0 });
        const spans   = [...track.querySelectorAll('.tg-sine-char')];
        const offsets = spans.map(s => s.offsetLeft);
        const A = 18, freq = 0.016, drift = 0.4;
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

  // SVG text that orbits continuously around an element
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

    if (ctx.hasGSAP) {
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

  // SVG arc label that bends above or below an element
  // opts: { radius, arc, above, color, fontSize, delay }
  function curveText(anchorEl, text, opts = {}) {
    const R    = opts.radius   || 52;
    const arc  = opts.arc      || 160;
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

    const cx = D / 2, cy = D / 2;
    const startDeg = above ? (270 - arc / 2) : (90 - arc / 2);
    const endDeg   = above ? (270 + arc / 2) : (90 + arc / 2);
    const toRad = d => d * Math.PI / 180;
    const sx = cx + R * Math.cos(toRad(startDeg));
    const sy = cy + R * Math.sin(toRad(startDeg));
    const ex = cx + R * Math.cos(toRad(endDeg));
    const ey = cy + R * Math.sin(toRad(endDeg));
    const largeArc = arc > 180 ? 1 : 0;

    const path = document.createElementNS(ns, 'path');
    path.setAttribute('id', pid);
    path.setAttribute('d', `M ${sx} ${sy} A ${R} ${R} 0 ${largeArc} 1 ${ex} ${ey}`);
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

    if (ctx.hasGSAP) {
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

  // character-by-character reveal with blinking cursor
  async function typewriterLine(text, cls = 'tg-pl--med', cpm = 38) {
    const el     = ctx.line('', cls);
    el.style.minHeight = '1.4em';
    const cursor = document.createElement('span');
    cursor.className = 'tg-cursor';
    el.appendChild(cursor);
    const ms = Math.max(18, Math.round(60000 / cpm / 5));
    for (const ch of text) {
      el.insertBefore(document.createTextNode(ch), cursor);
      ctx.HAPTIC.begin();
      await ctx.w(ms + (Math.random() * ms * 0.4 | 0));
    }
    await ctx.w(420);
    if (ctx.hasGSAP) {
      gsap.to(cursor, { opacity: 0, duration: 0.22, onComplete: () => cursor.remove() });
    } else {
      cursor.remove();
    }
    ctx.scrollPitch();
    return el;
  }

  // words slam in one-by-one; colorSequence cycles CSS colors per word (null = default)
  async function wordPop(el, text, colorSequence = null) {
    const words = text.split(' ');
    el.textContent = '';
    el.style.display = 'inline-flex';
    el.style.flexWrap = 'nowrap';
    el.style.gap = '0.18em';
    el.style.alignItems = 'baseline';

    for (let i = 0; i < words.length; i++) {
      const span = document.createElement('span');
      span.textContent = words[i];
      if (colorSequence) {
        const col = colorSequence[i % colorSequence.length];
        if (col) span.style.color = col;
      }
      el.appendChild(span);

      if (ctx.hasGSAP) {
        await new Promise(r =>
          gsap.from(span, {
            opacity: 0,
            y: -18,
            scale: 1.4,
            duration: 0.28,
            ease: ctx.hasCE ? 'snap' : 'back.out(3)',
            clearProps: 'all',
            onComplete: r,
          })
        );
      } else {
        await ctx.w(80);
      }
      ctx.HAPTIC.tap();
      await ctx.w(55);
    }
    return el;
  }

  // staggered quote cards — quotes: [{ text, attr }]
  async function testimonialReel(quotes) {
    const wrap = document.createElement('div');
    wrap.className = 'tg-pl';
    wrap.style.display = 'flex';
    wrap.style.flexDirection = 'column';
    wrap.style.gap = '0';
    ctx.pitch.appendChild(wrap);
    ctx.scrollPitch();

    for (const q of quotes) {
      const card = document.createElement('div');
      card.className = 'tg-testimonial';
      card.innerHTML = `${q.text}<span class="tg-testimonial-attr">${q.attr}</span>`;
      wrap.appendChild(card);
      ctx.scrollPitch();

      ctx.HAPTIC.card();
      if (ctx.hasGSAP) {
        await new Promise(r =>
          gsap.to(card, {
            opacity: 1, y: 0, duration: 0.42,
            ease: ctx.hasCE ? 'unfurl' : 'power3.out',
            onComplete: r,
          })
        );
      } else {
        card.style.opacity = '1';
        await ctx.w(500);
      }
      await ctx.w(320);
    }
    return wrap;
  }

  // three-cell stat grid — cells: [{ n, l }]
  async function statsFormation(cells) {
    const grid = document.createElement('div');
    grid.className = 'tg-pl tg-stats-formation';
    grid.style.opacity = '0';
    cells.forEach(c => {
      grid.innerHTML += `<div class="tg-sf-cell"><span class="tg-sf-n">${c.n}</span><span class="tg-sf-l">${c.l}</span></div>`;
    });
    ctx.pitch.appendChild(grid);
    ctx.scrollPitch();

    if (ctx.hasGSAP) {
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

  // splits text at sentence boundaries and reveals each chunk.
  // >3 sentences becomes alternating scrapbook cards.
  async function dimLines(text, gap = 200) {
    const chunks = text
      .split('. ')
      .map((s, i, arr) => i < arr.length - 1 ? s.trimEnd() + '.' : s.trimEnd())
      .filter(Boolean);

    if (chunks.length <= 3) {
      for (const chunk of chunks) {
        await ctx.reveal(ctx.line(chunk, 'tg-pl--dim'), {
          y: 8, stagger: 0.06, duration: 0.50, ease: ctx.hasCE ? 'unfurl' : 'power3.out',
        });
        if (gap > 0) await ctx.w(gap);
      }
      return;
    }

    const PAPER = ['./assets/paperyellow.png', './assets/paperwhite.png'];
    const pages = [];
    for (let i = 0; i < chunks.length; i += 4) pages.push(chunks.slice(i, i + 4));

    for (let pi = 0; pi < pages.length; pi++) {
      const rot = pi % 2 === 0 ? -1.8 : 1.4;
      const card = document.createElement('div');
      card.className = 'tg-pl tg-scrapbook-card';
      card.style.cssText = `background-image:url('${PAPER[pi % 2]}');transform:rotate(${rot}deg);`;
      ctx.pitch.appendChild(card);
      ctx.scrollPitch();
      if (ctx.hasGSAP) gsap.from(card, { opacity: 0, y: 18, scale: 0.97, duration: 0.42, ease: ctx.hasCE ? 'unfurl' : 'power3.out' });
      else card.style.opacity = '1';

      for (const chunk of pages[pi]) {
        const el = document.createElement('div');
        el.className = 'tg-pl--dim tg-scrapbook-line';
        el.textContent = chunk;
        card.appendChild(el);
        if (ctx.hasGSAP) {
          await ctx.reveal(el, { y: 6, stagger: 0.05, duration: 0.40, ease: ctx.hasCE ? 'unfurl' : 'power3.out' });
        }
        if (gap > 0) await ctx.w(Math.round(gap * 0.65));
      }
      if (pi < pages.length - 1) await ctx.w(gap);
    }
  }

  // one stat card — slams in from alternating corners, scrambles the number, bobs the image
  async function statCard(stat, container) {
    const pal  = STAT_COLORS[statColorIdx % STAT_COLORS.length];
    const dir  = statColorIdx % 2 === 0 ? -1 : 1;
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
    ctx.scrollPitch();

    if (ctx.hasGSAP) {
      ctx.HAPTIC.card();
      const numEl = card.querySelector('.tg-stat-n');
      const lblEl = card.querySelector('.tg-stat-l');
      const imgEl = card.querySelector('img');

      gsap.fromTo(card,
        { x: dir * 72, y: dir * 16, rotation: dir * 5, scale: 0.78, opacity: 0 },
        { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1,
          duration: 0.48, ease: ctx.hasCE ? 'slam' : 'back.out(2.5)',
          clearProps: 'rotation,transform' }
      );

      gsap.to(card, {
        filter: 'brightness(1.22)', duration: 0.12, delay: 0.36,
        ease: 'power2.out', yoyo: true, repeat: 1,
        onComplete: () => { card.style.filter = ''; },
      });

      await new Promise(r => {
        if (ctx.hasScrTx) {
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

      gsap.fromTo(lblEl,
        { opacity: 0, y: 10 },
        { opacity: 0.84, y: 0, duration: 0.36, ease: 'power3.out' }
      );

      if (imgEl) {
        gsap.fromTo(imgEl,
          { opacity: 0, scale: 0.04, rotation: dir * -400, x: dir * 48 },
          { opacity: 1, scale: 1,    rotation: dir * 6,    x: 0,
            duration: 1.1, ease: 'elastic.out(1, 0.38)', delay: 0.2,
            onComplete: () => {
              gsap.to(imgEl, { y: -6, rotation: dir * 4, duration: 1.8,
                ease: 'sine.inOut', yoyo: true, repeat: -1 });
            },
          }
        );
      }

      setTimeout(() => ctx.assetBurst(card, 'data'), 380);
      if (stat.sweep) setTimeout(() => ctx.fullScreenAssetSweep(stat.sweep), 520);
    } else {
      card.querySelector('.tg-stat-n').style.cssText = `opacity:1;transform:none;color:${pal.fg}`;
      card.querySelector('.tg-stat-l').style.cssText = `opacity:0.84;color:${pal.fg}`;
    }
    return card;
  }

  // character/avatar assets scattered across the full scroll height like a crowd watching
  function spawnAmbientFloaters() {
    const gSrcs   = Array.from({ length: 13 }, (_, i) => `./avatars/g${i}.png`);
    const fallback = [
      './assets/derpy.png','./assets/frog.png','./assets/caterpillar.png',
      './assets/flower.png','./assets/flowerpot.png','./assets/starhehe.png',
      './assets/babystar.png','./assets/coin.png','./assets/bread.png',
      './assets/turtle.png','./assets/waller.png','./assets/apple.png',
    ];

    let srcs = gSrcs;
    const probe = new Image();
    probe.onerror = () => { srcs = fallback; };
    probe.src = gSrcs[0];

    const estH  = Math.max(ctx.pitch.scrollHeight, 2400);
    const count = Math.round(estH / 200);

    for (let i = 0; i < count; i++) {
      const src = srcs[i % srcs.length];
      const img = document.createElement('img');
      img.src   = src;
      const sz  = 34 + Math.random() * 22;
      const pct = 5  + Math.random() * 82;
      const top = 80 + i * 200 + (Math.random() - 0.5) * 70;
      img.style.cssText =
        `position:absolute;left:${pct}%;top:${top}px;` +
        `width:${sz}px;height:auto;opacity:0;pointer-events:none;` +
        `z-index:1;will-change:transform;border-radius:50%;`;
      ctx.pitch.appendChild(img);
      if (ctx.hasGSAP) {
        const targetOp = 0.22 + Math.random() * 0.13;
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

  // Type C — pull quote with shimmer border + ScrambleText reveal
  async function pqReveal(text, assetSrc = null, assetOpts = {}, assetCls = 'tg-decal--bob') {
    await ctx.w(300);
    ctx.HAPTIC.begin();
    const pqFills = ['#EEF4FF', '#FDFBEE'];
    const pqBg = pqFills[pqColorIdx++ % pqFills.length];
    const shimmer = document.createElement('div');
    shimmer.className = 'tg-pl tg-pq-shimmer';
    shimmer.style.opacity = '0';
    const d = document.createElement('blockquote');
    d.className = 'tg-pq-inner';
    d.style.background = pqBg;
    shimmer.appendChild(d);
    ctx.pitch.appendChild(shimmer);
    ctx.scrollPitch();

    if (ctx.hasGSAP && ctx.hasScrTx) {
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
      d.innerHTML = tmark(text);
    } else if (ctx.hasGSAP) {
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
      shimmer.appendChild(ctx.decal(assetSrc, assetCls, assetOpts));
    }
    await ctx.w(800);
    return shimmer;
  }

  // Type E — Wrapped-style full-bleed stat cards, one per stat
  async function statsBlockReveal(stats) {
    const wrap = document.createElement('div');
    wrap.className = 'tg-pl';
    ctx.pitch.appendChild(wrap);
    for (const stat of stats) {
      await statCard(stat, wrap);
      await ctx.w(160);
    }
    return wrap;
  }

  // Type F — reveal list: marker snaps in, text slides in, repeat per item
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
    ctx.pitch.appendChild(d);
    ctx.scrollPitch();
    return d;
  }

  async function rlistReveal(items) {
    const d = rlist(items);
    if (!ctx.hasGSAP) {
      d.querySelectorAll('.tg-ritem-marker, .tg-ritem-text').forEach(el => el.style.opacity = '');
      return d;
    }
    for (const row of d.querySelectorAll('.tg-ritem')) {
      const marker = row.querySelector('.tg-ritem-marker');
      const textEl  = row.querySelector('.tg-ritem-text');
      await new Promise(r => gsap.fromTo(marker,
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', clearProps: 'y', onComplete: r },
      ));
      await new Promise(r => gsap.fromTo(textEl,
        { opacity: 0, y: 10, filter: 'blur(3px)' },
        { opacity: 1, y: 0,  filter: 'blur(0px)',
          duration: 0.44, ease: ctx.hasCE ? 'unfurl' : 'power3.out',
          clearProps: 'filter,y', onComplete: r },
      ));
      ctx.HAPTIC.tap();
      await ctx.w(140);
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
    ctx.pitch.appendChild(d);
    ctx.scrollPitch();
    return d;
  }

  return {
    assetBurst, fullScreenAssetSweep,
    wavePunch, crtTicker,
    orbitingTextRing, curveText,
    typewriterLine, wordPop,
    testimonialReel, statsFormation, dimLines,
    statCard, spawnAmbientFloaters,
    pqReveal, statsBlockReveal,
    rlist, rlistReveal, askGrid,
  };
}
