# TROVE — ANIMATION & STYLE DIRECTIVE

---

## 0. WHAT THIS IS

This is the Trove interactive investor pitch experience. It's a browser-based, cinematic,
gamey, single-page narrative. It ends with an investor archetype reveal and Helen's contact.
It uses GSAP (already loaded). It is not a slide deck. It is not a quiz. It is a trap that
makes investors feel something before they understand what happened to them.

Your job: make it play like the GSAP website. Confident. Kinetic. Surprising.

---

## 1. COLOUR SYSTEM

These are the ONLY colours in this experience. Use them or use transparent. Nothing else.

```css
:root {
  --anchor: #222222;   /* near-black — the void, text on light backgrounds */
  --still:  #F9F9F2;   /* warm white — primary background, light elements */
  --shift:  #DBD59C;   /* warm gold — selection states, heat, YES energy */
  --light:  #FFFBCD;   /* pale yellow — softest glow, hover halos */
  --trace:  #88ABE3;   /* steel blue — secondary accent, cool intelligence */
  --echo:   #C3D9FF;   /* pale blue — ghost states, aftermath, distance */
}
```

**LIGHT MODE token swap (applied in :root):**
```css
/* Light mode — these override the dark defaults */
--bg:     var(--still);   /* background is warm white */
--text:   var(--anchor);  /* text is near-black */
--border: rgba(34,34,34,0.12);
--muted:  rgba(34,34,34,0.38);
```

### Colour intent:
- **--anchor**: text, near-black on warm white
- **--still**: background, resting state UI
- **--shift**: warmth, selection, investor energy, "you saw something"
- **--light**: glow sources, aura behind text on reveal moments
- **--trace**: Trove product colour, smart/cold/precise, investor archetype cards
- **--echo**: ghost, aftermath, the card after you've committed, faint trails

### Colour as glitch palette:
For chromatic aberration / RGB split effects:
- Channel R: `--shift` (warm displacement)
- Channel B: `--trace` (cool displacement)
- Overlap: `--still`

The particle field uses slightly higher opacity on light backgrounds (0.08–0.18 range).
Archetype card warm background: `rgba(219,213,156,0.12)` (not the dark-mode 0.04).

---

## 2. TYPOGRAPHY SYSTEM

```html
<!-- In <head> -->
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&family=DM+Mono:wght@400;500&family=Syne:wght@400;700;800&display=swap" rel="stylesheet">
```

```css
--font-display: 'Playfair Display', serif;    /* Big moments, titles, archetype names */
--font-label:   'DM Mono', monospace;         /* Labels, percentages, metadata, hints */
--font-body:    'Syne', sans-serif;           /* Choice buttons, UI copy, narration */
```

### Type hierarchy:
| Use | Font | Weight | Size | Style |
|-----|------|--------|------|-------|
| Impact headline | Playfair Display | 900 | clamp(52px, 8vw, 96px) | — |
| Section beat | Playfair Display | 700 | clamp(28px, 4vw, 48px) | — |
| Italic pullquote | Playfair Display | 400 | clamp(20px, 3vw, 30px) | italic |
| UI label / metadata | DM Mono | 400 | 10–12px | uppercase, ls: 0.15em |
| Choice button text | Syne | 400 | 13–15px | — |
| Narration | Syne | 400 | 15–17px | — |

---

## 3. GSAP ANIMATION BIBLE

**You have GSAP + SplitText + ScrambleTextPlugin + CustomEase.**
Use all of them. Do not be shy.

### 3.1 — Custom Eases (register at init)

```js
CustomEase.create('slam',    'M0,0 C0.08,0 0.12,1.3 0.32,1.08 0.52,0.86 0.52,1 1,1');
CustomEase.create('unfurl',  'M0,0 C0.28,0 0.16,1 1,1');
CustomEase.create('yank',    'M0,0 C0.6,0 0.4,1.6 1,1');
CustomEase.create('hesitate','M0,0 C0.02,0 0.04,0.02 0.3,0.02 0.5,0.02 0.6,1 1,1');
CustomEase.create('snap',    'M0,0 C0,0 0.05,0.9 0.1,1 0.15,1.1 0.25,0.95 1,1');
```

| Ease | Use it for |
|------|-----------|
| `slam` | Impact text landing, big reveal moments |
| `unfurl` | Words flowing in, narration beats |
| `yank` | Choice buttons arriving, things snapping into place |
| `hesitate` | Dial settling, choices loading (builds anticipation) |
| `snap` | Quick confirmations, checkmarks, collected items |

### 3.2 — SplitText Patterns

**Pattern A — Impact Slam (big headlines)**
```js
async function impactReveal(el, opts = {}) {
  const split = new SplitText(el, { type: 'chars' });
  await gsap.from(split.chars, {
    opacity: 0,
    y: () => gsap.utils.random(80, 140),
    x: () => gsap.utils.random(-20, 20),
    rotation: () => gsap.utils.random(-25, 25),
    scale: () => gsap.utils.random(0.05, 0.4),
    duration: opts.duration ?? 0.9,
    ease: 'slam',
    stagger: { each: 0.055, from: opts.from ?? 'center', ease: 'power3.in' },
    clearProps: 'transform,x,y,rotation,scale',
    ...opts
  });
}
```

**Pattern B — Word Unfurl (narration, sentences)**
```js
async function wordReveal(el, opts = {}) {
  const split = new SplitText(el, { type: 'words' });
  await gsap.from(split.words, {
    opacity: 0,
    y: 28,
    filter: 'blur(8px)',
    duration: opts.duration ?? 0.55,
    ease: 'unfurl',
    stagger: { each: opts.stagger ?? 0.08, ease: 'power2.inOut' },
    clearProps: 'filter,transform,y,opacity',
    ...opts
  });
}
```

**Pattern C — ScrambleText Matrix Decode**
```js
async function matrixReveal(el, text, opts = {}) {
  el.textContent = '';
  await gsap.to(el, {
    duration: opts.duration ?? 1.8,
    scrambleText: {
      text,
      chars: '!<>-_\\/[]{}—=+*^?#░▒▓01XR4YV!@#$%',
      revealDelay: opts.revealDelay ?? 0.3,
      speed: opts.speed ?? 0.45,
      newClass: 'tg-scramble-char',
    },
    ease: 'none',
  });
}
```

**Pattern D — Stagger From Edges (for choice buttons appearing)**
```js
async function edgeReveal(els, opts = {}) {
  await gsap.from(els, {
    opacity: 0,
    x: (i) => i % 2 === 0 ? -40 : 40,
    scale: 0.88,
    filter: 'blur(4px)',
    duration: 0.5,
    ease: 'yank',
    stagger: { each: 0.07, ease: 'power2.inOut' },
    clearProps: 'filter,x,scale',
    ...opts
  });
}
```

### 3.3 — WILD ANIMATIONS (specific beats)

#### Glitch Effect (for "xray vision" and other impact moments)
```js
function glitchEl(el, intensity = 1) {
  const tl = gsap.timeline();
  const steps = 6 + Math.floor(Math.random() * 5);
  const r = el.cloneNode(true);
  const b = el.cloneNode(true);
  r.style.cssText = `position:absolute;top:0;left:0;color:var(--shift);mix-blend-mode:screen;pointer-events:none;`;
  b.style.cssText = `position:absolute;top:0;left:0;color:var(--trace);mix-blend-mode:screen;pointer-events:none;`;
  el.style.position = 'relative';
  el.appendChild(r);
  el.appendChild(b);
  tl.to(r, { x: () => (Math.random()-0.5)*18*intensity, duration: 0.05, ease: 'steps(1)', repeat: steps, yoyo: true })
    .to(b, { x: () => (Math.random()-0.5)*18*intensity, duration: 0.05, ease: 'steps(1)', repeat: steps, yoyo: true }, '<')
    .to(el, { skewX: () => (Math.random()-0.5)*4*intensity, duration: 0.08, ease: 'steps(1)', repeat: 3, yoyo: true }, '<')
    .call(() => { r.remove(); b.remove(); el.style.position=''; });
  return tl;
}
```

#### Screen Flash + Scene Shake
```js
function bigFlash(scene, severity = 1) {
  gsap.fromTo(scene,
    { backgroundColor: severity > 1 ? 'rgba(219,213,156,0.15)' : 'rgba(249,249,242,0.06)' },
    { backgroundColor: 'transparent', duration: 0.4, ease: 'power2.out' }
  );
  gsap.fromTo(scene,
    { x: -12*severity, rotation: -0.8*severity },
    { x: 0, rotation: 0, duration: 0.9, ease: 'elastic.out(1, 0.25)' }
  );
  gsap.fromTo(scene,
    { y: -6*severity },
    { y: 0, duration: 0.6, ease: 'elastic.out(1, 0.35)', delay: 0.05 }
  );
}
```

#### Particle Disintegration (palette colours)
```js
function disintegrate(el) {
  const rect = el.getBoundingClientRect();
  const N = 32;
  const palette = ['#DBD59C', '#88ABE3', '#C3D9FF', '#F9F9F2', '#FFFBCD'];
  for (let i = 0; i < N; i++) {
    const p = document.createElement('div');
    const sz = 1.5 + Math.random() * 4;
    const col = palette[Math.floor(Math.random() * palette.length)];
    const sx = rect.left + Math.random() * rect.width;
    const sy = rect.top + Math.random() * rect.height;
    const ang = Math.random() * Math.PI * 2;
    const mag = 24 + Math.random() * 60;
    const dur = 400 + Math.random() * 350;
    p.style.cssText = `
      position:fixed;width:${sz}px;height:${sz}px;border-radius:50%;
      background:${col};left:${sx}px;top:${sy}px;
      pointer-events:none;z-index:9999;opacity:0.7;
      box-shadow:0 0 ${sz*2}px ${col}40;
    `;
    document.body.appendChild(p);
    gsap.to(p, {
      x: Math.cos(ang)*mag, y: Math.sin(ang)*mag - 20,
      opacity: 0, scale: 0.1,
      duration: dur/1000, ease: 'power2.out',
      onComplete: () => p.remove()
    });
  }
  gsap.to(el, {
    opacity: 0, scale: 0.94, height: 0, marginBottom: 0,
    duration: 0.4, ease: 'power2.inOut',
    onComplete: () => el.remove()
  });
}
```

#### Dial — Magnetic Snap + Momentum
```js
function settleDial(track, from, to, syncActive, resolve) {
  gsap.to({ v: from }, {
    v: to + (to - from) * 0.12,
    duration: 0.28, ease: 'power3.out',
    onUpdate: function() { track.scrollTop = this.targets()[0].v; syncActive(); }
  }).then(() => {
    gsap.to({ v: track.scrollTop }, {
      v: to, duration: 0.55, ease: 'elastic.out(1, 0.55)',
      onUpdate: function() { track.scrollTop = this.targets()[0].v; syncActive(); },
      onComplete: resolve
    });
  });
}
```

#### Xray Reveal — ScrambleText + Bloom + Glitch
```js
async function xrayReveal(el) {
  await matrixReveal(el, 'xray vision');
  const ring = document.createElement('div');
  ring.style.cssText = `
    position:fixed;left:50%;top:50%;
    width:4px;height:4px;margin:-2px 0 0 -2px;
    border-radius:50%;border:1px solid var(--trace);
    pointer-events:none;z-index:9999;
  `;
  document.body.appendChild(ring);
  gsap.to(ring, {
    width:'120vw',height:'120vw',marginTop:'-60vw',marginLeft:'-60vw',
    opacity:0,duration:1.2,ease:'power2.out',
    onComplete:()=>ring.remove()
  });
  glitchEl(el, 1.5);
}
```

#### End Card — Yank Up + ScrambleText
```js
function showWildEnd(message, scene) {
  bigFlash(scene, 2);
  const el = document.createElement('div');
  el.className = 'tg-end-card';
  // ...your existing HTML...
  scene.appendChild(el);
  gsap.from(el, { y: '100%', opacity: 0, duration: 0.7, ease: 'yank', delay: 0.15 });
  const textEl = el.querySelector('.tg-end-text');
  setTimeout(() => matrixReveal(textEl, message.replace('\n\n', ' ')), 400);
}
```

---

## 4. CSS ART ASSETS

### Asset A: Floating Ornament
```html
<div class="trove-ornament">
  <svg width="60" height="30" viewBox="0 0 60 30">
    <line x1="0" y1="15" x2="22" y2="15" stroke="var(--still)" stroke-width="0.5" opacity="0.3"/>
    <polygon points="30,4 36,15 30,26 24,15" fill="none" stroke="var(--shift)" stroke-width="0.8"/>
    <circle cx="30" cy="15" r="2" fill="var(--shift)"/>
    <line x1="38" y1="15" x2="60" y2="15" stroke="var(--still)" stroke-width="0.5" opacity="0.3"/>
  </svg>
</div>
```

### Asset B: Scanline Overlay
```css
.scanlines::after {
  content: '';
  position: absolute; inset: 0;
  background: repeating-linear-gradient(
    0deg, transparent, transparent 2px,
    rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px
  );
  pointer-events: none; z-index: 100;
}
```

### Asset C: Corner Bracket
```html
<svg class="corner-tl" width="20" height="20" viewBox="0 0 20 20">
  <path d="M2 18 L2 2 L18 2" fill="none" stroke="var(--trace)" stroke-width="1" stroke-linecap="round"/>
</svg>
<svg class="corner-br" width="20" height="20" viewBox="0 0 20 20" style="transform:rotate(180deg)">
  <path d="M2 18 L2 2 L18 2" fill="none" stroke="var(--trace)" stroke-width="1" stroke-linecap="round"/>
</svg>
```

### Asset D: Particle Field (ambient background)
```js
function initParticleField(canvas) {
  const ctx = canvas.getContext('2d');
  const dots = Array.from({length:60}, () => ({
    x: Math.random()*canvas.width, y: Math.random()*canvas.height,
    r: 0.5+Math.random()*1.5,
    vx: (Math.random()-0.5)*0.15, vy: (Math.random()-0.5)*0.15,
    c: ['#88ABE3','#DBD59C','#C3D9FF','#F9F9F2'][Math.floor(Math.random()*4)],
    a: 0.08+Math.random()*0.1   /* higher opacity for light field */
  }));
  (function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    dots.forEach(d=>{
      d.x+=d.vx; d.y+=d.vy;
      if(d.x<0)d.x=canvas.width; if(d.x>canvas.width)d.x=0;
      if(d.y<0)d.y=canvas.height; if(d.y>canvas.height)d.y=0;
      ctx.beginPath(); ctx.arc(d.x,d.y,d.r,0,Math.PI*2);
      ctx.fillStyle=d.c; ctx.globalAlpha=d.a; ctx.fill(); ctx.globalAlpha=1;
    });
    requestAnimationFrame(draw);
  })();
}
```

### Asset E: Gold Rule
```css
.gold-rule {
  width: 60px; height: 1px;
  background: linear-gradient(90deg, transparent, var(--shift), transparent);
  margin: 24px auto;
}
```

### Asset F: RGB Cursor Trail
```js
function initCursorTrail() {
  document.addEventListener('mousemove', e => {
    if(Math.random() > 0.4) return;
    [['#DBD59C', -3], ['#88ABE3', 3]].forEach(([col, offset]) => {
      const p = document.createElement('div');
      p.style.cssText = `position:fixed;width:3px;height:3px;border-radius:50%;
        background:${col};left:${e.clientX+offset}px;top:${e.clientY}px;
        pointer-events:none;z-index:9999;`;
      document.body.appendChild(p);
      gsap.to(p, {
        y:-15,x:offset*2,opacity:0,scale:0.2,
        duration:0.5,ease:'power2.out',onComplete:()=>p.remove()
      });
    });
  });
}
```

---

## 5. CSS VARIABLES (full :root — light mode)

```css
:root {
  /* Palette */
  --anchor: #222222;
  --still:  #F9F9F2;
  --shift:  #DBD59C;
  --light:  #FFFBCD;
  --trace:  #88ABE3;
  --echo:   #C3D9FF;

  /* Light mode tokens */
  --bg:     var(--still);
  --text:   var(--anchor);
  --border: rgba(34,34,34,0.12);
  --muted:  rgba(34,34,34,0.38);

  /* Semantic */
  --color-bg:     var(--still);
  --color-text:   var(--anchor);
  --color-accent: var(--shift);
  --color-cool:   var(--trace);
  --color-ghost:  var(--echo);
  --color-glow:   var(--light);

  /* Glow shadows */
  --glow-warm: 0 0 20px rgba(219,213,156,0.3), 0 0 40px rgba(219,213,156,0.1);
  --glow-cool: 0 0 20px rgba(136,171,227,0.3), 0 0 40px rgba(136,171,227,0.1);
  --glow-text: 0 0 30px rgba(255,251,205,0.5);

  /* Typography */
  --font-display: 'Playfair Display', serif;
  --font-label:   'DM Mono', monospace;
  --font-body:    'Syne', sans-serif;

  /* Motion */
  --ease-slam:   cubic-bezier(0.08, 1.3, 0.52, 1);
  --ease-unfurl: cubic-bezier(0.28, 0, 0.16, 1);
  --ease-yank:   cubic-bezier(0.6, 0, 0.4, 1.6);
}
```

---

## 6. ARCHETYPE CARD STYLES

```css
.archetype-card {
  border: 1px solid rgba(219,213,156,0.25);
  background: rgba(219,213,156,0.12);   /* warm parchment — light mode value */
  padding: 32px 36px;
  position: relative;
  max-width: 380px;
}
.archetype-card .arch-label {
  font-family: var(--font-label);
  font-size: 9px; letter-spacing: 0.2em;
  text-transform: uppercase; color: var(--shift); margin-bottom: 12px;
}
.archetype-card .arch-name {
  font-family: var(--font-display);
  font-size: clamp(28px, 4vw, 40px); font-weight: 700;
  color: var(--text); line-height: 1; margin-bottom: 16px;
}
.archetype-card .arch-desc {
  font-family: var(--font-label);
  font-size: 12px; color: var(--muted); line-height: 1.7; margin-bottom: 24px;
}
.archetype-card .arch-cta {
  font-family: var(--font-label);
  font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase;
  color: var(--trace); background: transparent;
  border: 1px solid rgba(136,171,227,0.3);
  padding: 10px 20px; cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.3s;
}
.archetype-card .arch-cta:hover {
  border-color: var(--trace); box-shadow: var(--glow-cool);
}
```

---

## 7. ANIMATION SEQUENCE CHEATSHEET

| Beat | Function | Notes |
|------|----------|-------|
| Big text entrance | `impactReveal(el)` | chars, from center |
| Sentence flows in | `wordReveal(el)` | words, left to right |
| Impact word | `matrixReveal(el, text)` + `glitchEl(el)` | scramble then glitch |
| Screen shock | `bigFlash(scene, 1.5)` | shake + flash |
| Choice buttons arrive | `edgeReveal(btns)` | alternating from edges |
| User picks choice | disintegrate others | see existing code |
| Archetype reveal | `showWildEnd()` | yank up + scramble |
| Progress milestone | animate fill + `bigFlash(scene, 0.5)` | subtle confirmation |

---

## 8. RULES — DO NOT VIOLATE

- No gradient backgrounds (background is flat var(--bg))
- No rounded corners on buttons (sharp, editorial)
- No bounce on text reveals (elastic = dial and cards only, not sentences)
- No emojis in the UI
- No Inter, Roboto, Nunito, or system fonts
- No white (#ffffff) backgrounds
- No opacity-only transitions (always add a transform)
- Do not reduce particle count for performance
- Do not soften the glitch effect — it should be alarming

---

*End of directive. Make it unforgettable.*
