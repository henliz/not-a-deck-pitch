# not-a-deck-pitch

A pitch for Trove — delivered as the product itself.

Instead of a slide deck, an investor opens a webpage and sees a phone. They hold it to begin. The phone comes alive, spins, and presents a question. They tap a button. A quiz slides up inside the phone screen. Thirteen chapters later, they've experienced Trove, understood the problem it solves, and received a behavioural profile of themselves as an investor.

No PDF. No Figma export. No "next slide please."

---

## The Concept

Trove's pitch is that self-reported data is dead — resumes, LinkedIn profiles, personality tests, all of it. Trove replaces it with **tangles**: interactive, story-based simulations where you make real choices under pressure, and a behavioural engine reads what those choices mean.

The problem with pitching that in a deck is obvious. A deck is self-reported. You're telling investors Trove is different while using the most conventional format possible.

So this pitch *is* a tangle. The investor doesn't read about the product — they play it. By the time they reach the ask, they've already experienced what they're being asked to fund.

---

## What the Investor Experiences

The pitch runs in a browser. Nothing to install, nothing to sign in to.

**Before the pitch begins:**
A 3D phone model sits on screen, slightly tilted, gently floating. Notification cards burst from the screen. The investor holds down on the phone to begin — a hold-to-confirm interaction that immediately signals: *this isn't a deck.*

**The intro sequence:**
On hold, a progress ring fills. The phone shivers, the notifications shatter. The phone spins 360°, tilts face-on, and a push notification card slides up asking: *"What if you had xray vision for how people actually behave?"*

**The tangle (the pitch):**
Tapping the notification opens Trove's quiz UI — rendered inside the phone screen itself, tilting and moving with the 3D model. The pitch is non-linear: after a shared opening, the investor picks one of three paths, then a sub-branch, before converging on a shared close.

**Opening sequence** (shared):

| Beat | What happens |
|---|---|
| You're an investor | Characters slam in. Wallet and investor illustration float in. |
| The wrong call | "You made the wrong call on someone." Coin launches from wallet. |
| Slot machine | hire / co-founder / partner / date / friend spins to a stop, then disintegrates. |
| What happened? | First choice — 4 options. Narrative only; sets tone, no scoring. |
| Xray vision | "What if you had xray vision for how people actually behave?" ScrambleText reveal, chromatic aberration glitch. |
| The fingerprint | "Every choice is a behavioural signal. Aggregated, they're a fingerprint." |

**The Question** (first scored branch — 3 paths):

| Choice | Path taken |
|---|---|
| "That data doesn't exist. Walk me through how it could." | **Path A — Evidence** |
| "I've seen a hundred behavioral tools. What makes this one different." | **Path B — Sceptic** |
| "I want to know who's building it before I read anything else." | **Path C — Founder** |

Each path has its own chapter header and a second sub-branch choice:

| Path | Chapters | Sub-branch |
|---|---|---|
| A — Evidence | The Signal Problem → self-reporting dead, AI stats | "Okay, what's the new signal?" vs "People have tried this before." → The New Signal / Why This Survives |
| B — Sceptic | Not a Tool. A Layer. → what's structurally different about Trove | "Tell me the B2B play." vs "Who owns the data?" → The B2B Model / Who Owns the Data |
| C — Founder | Helen Huang → background, why she started it | "What's the insight that makes this work?" → The Insight |

**Shared close** (all paths converge here):

| Chapter | What it covers |
|---|---|
| Valentine's Day. $0 Spend. | Traction. 8× organic amplification, 78% day-3 return rate, 7-min sessions. 60 strangers built a Discord unprompted. Testimonials. |
| The Flywheel | "Trove is infrastructure." B2C free → premium flywheel feeds B2B "Sign in with Trove". The data is the moat. |
| The Ask | $525K already in from Betaworks, True Ventures, Slack Fund. Raising $1.5M for 100K behavioural profiles + 1–2 paid B2B pilots. |
| Your investor profile | "See your investor profile →" — leads into the reveal sequence. |

**The reveal** (4 swipe-able fullscreen screens, then flat scroll):

| Screen | What it shows |
|---|---|
| Session wrapped | Move count, entry angle, exit move, behavioural pills, avg decision gap. Dark bg, coin shower. |
| Signals Trove read | The behaviours the engine actually detected — specific, not generic. Gold bg, fish swim past. |
| Your archetype | Archetype image with sticker border, name scramble-reveals, orbiting text ring. |
| What this means | Archetype description + "together" card. Blue bg. |

Back in the scroll: archetype name + insight line, share card (900×900 bento PNG, exportable), then email capture + replay.

**After the pitch:**
The investor has a behavioural profile of themselves. They've experienced the exact loop Trove sells to enterprise clients. The close writes itself.

---

## How to Run

**Local (no server needed):**
```
open index.html
```
Works directly from the filesystem. No build step, no Node, no bundler.

**For iOS device orientation (gyroscope parallax):**
Device orientation requires HTTPS on iOS — `file://` will silently get no gyro data on iPhone. Either:
- Serve locally: `python3 -m http.server 8080` then open `http://localhost:8080`
- Deploy to GitHub Pages, Netlify, or any HTTPS host

**Speed controls:**
A speed panel is in the top-right corner of the pitch UI. You can also set `window.tgSpeedMult` in the browser console before starting — `1.0` is fast, `2.5` is normal, `5.0` is slow. This controls wait times between beats only, not animation duration.

**Replay:**
The "play again" button at the end calls `window.tgInitGame()` which does a full clean reset — wipes DOM, resets all scores and flags, re-registers GSAP plugins. You can also call it from the console at any point to restart.

**Inspecting captured emails:**
Email signups are stored locally in `localStorage`:
```js
JSON.parse(localStorage.getItem('tg-leads'))
// → [{ email, archetype, ts }, ...]
```

---

## File Structure

```
index.html                  — Three.js phone model, canvas screen textures,
                              hold-to-begin interaction, homography loop,
                              GSAP/SplitText/ScrambleText CDN scripts

styles.css                  — all CSS; colour system, typography, component styles

game.js                     — orchestrator: wires all modules together, defines
                              tgInitGame(), speed/pause controls, disintegrate()

haptics.js                  — HAPTIC object (tap, shatter, notif) using web-haptics

quiz-content.js             — scene registry (currently: one scene, the pitch)

scoring.js                  — behavioural scoring engine: 5 archetype vectors,
                              7 behavioural flags, timing analysis, recap data

share-card.js               — generateShareCard(): draws a 900×900 bento-layout
                              PNG on a canvas for the archetype reveal share moment

data/
  archetypes.js             — ARCHETYPES pure data (names, traits, quotes, images)
  palette.js                — RING_COLORS, STAT_COLORS, BURST_SETS

components/
  pitch-ui.js               — scroll helpers, line/flash/reveal, chapter headers,
                              ring wipe transitions, branchChoices() interaction
  rich-elements.js          — all visual set-pieces: assetBurst, orbitingTextRing,
                              wavePunch, crtTicker, statsFormation, pqReveal,
                              testimonialReel, dimLines, askGrid, and more
  email.js                  — envelope UI + email capture + replay button

scenes/
  intro.js                  — opening sequence, beats 1–5
  branches.js               — all A/B/C branch paths + shared nodes (traction, moat)
  archetype-reveal.js       — recap overlays + archetype reveal + share card + close

assets/
  iphone.glb                — (not in repo — you need to provide this)
  emailcover.png            — envelope flap illustration
  emailletter.png           — letter background illustration
  Architect.png             — archetype card images (×5)
  Cartographer.png
  Contrarian.png
  Operator.png
  Storyteller.png
  [other UI asset PNGs]

avatars/
  g0.png – g12.png          — avatar images used in testimonial reel
```

---

## Where to Be Careful

**GSAP plugins.**
`SplitText`, `ScrambleTextPlugin`, and `CustomEase` are all free as of GSAP 3.12 — no membership required. They're loaded via CDN in `index.html`.

**Archetype ID consistency.**
The archetype IDs (`'Architect'`, `'Cartographer'`, `'Contrarian'`, `'Operator'`, `'Storyteller'`) appear in three places that must stay in sync:
- `data/archetypes.js` — as object keys
- `scoring.js` — in `getArchetype()` which maps score vectors to IDs
- `assets/` — as the PNG filenames (`Architect.png`, etc.)

If you rename one, rename all three.

**Scoring flags are string keys.**
`ctx.setFlag('flagName')` dispatches to a closed-over switch in `scoring.js`. The 7 valid flag names are: `usedFounderPath`, `pushedBackOnData`, `wentDeepOnMoat`, `wentStraightToAsk`, `pushedOnFounder`, `wentB2B`, `wentDataset`. Typos fail silently.

**Don't call `gsap.killAll()` or clear the global timeline.**
The pause system uses `gsap.globalTimeline.paused()`. Killing the timeline would break the pause button and leave `tgPaused` state out of sync with actual playback.

**The homography runs every animation frame.**
`index.html` computes the phone screen's four 3D corner positions → projects them to screen coords → builds a CSS `matrix3d` every `requestAnimationFrame`. This is intentional and cheap. Don't add synchronous DOM reads (like `getBoundingClientRect` on many elements) inside that loop or you'll get layout thrash.

**`tgInitGame()` is a full reset.**
It wipes `pitch.innerHTML`, removes any recap overlays, re-registers GSAP plugins, and re-creates all module state from scratch. Don't try to "resume" a half-finished session — just call `tgInitGame()` again.

---

## What's Technically Unusual Here

Most of this is genuinely kind of cool in my opinion. Here's what's actually going on under the hood, for anyone inheriting the codebase.

### CSS matrix3d homography — a DOM element painted onto 3D glass

The quiz UI isn't a texture or an iframe inside the 3D model. It's a regular DOM `<div>` — with real buttons, real scroll, real CSS — that *appears* to be on the phone screen.

Every frame, `index.html` takes the four corners of the phone's screen geometry in 3D space, projects them to 2D screen coordinates using Three.js, then computes a CSS `perspective + matrix3d` transform that warps the flat div to match those four points exactly. This is a **homographic projection** applied to DOM: the same math used in AR marker tracking and camera calibration, implemented in 200 lines of vanilla JS.

The result: the quiz overlays sit flush on the phone glass, reflect the same tilt from parallax, and respond to the phone spinning 360°. The UI *is* the phone screen. It's not faked.

This technique is rare. Most "3D phone with content" demos either composite a flat screenshot, use a `<video>` texture, or fake it with a perspective CSS transform that only works from one viewing angle. A real per-frame homography that survives arbitrary 3D rotation is a different category of thing.

### Three.js with live canvas screen textures

The phone's screen area (clock, notifications, hold ring, question card) is rendered as actual `<canvas>` elements that Three.js reads as live textures — so the hold ring filling up, the notification cards, the clock ticking are all happening on real canvases mapped as geometry textures inside the 3D scene. They update in real time, inside the phone model, in 3D space.

The lighting rig is also hand-tuned: six lights (hemisphere ambient + warm key point + two rim directionals for the edge glow + bounce fill + steel-blue accent) to make a plastic phone look like it's sitting in a studio.

### Behavioural scoring engine — it's actually reading you

The archetype reveal isn't a personality quiz in disguise. The scoring engine tracks:
- Which branches you took and in what order
- How many choices you made and how fast
- Whether you pushed back (picked the sceptical option)
- Whether you went straight to the ask chapter or explored first
- Seven specific behavioural flags tripped by specific choice sequences

The five archetypes (Architect, Cartographer, Contrarian, Operator, Storyteller) each have weighted scoring vectors across multiple axes. The result you get at the end is a genuine output of how you moved through the pitch — not a predetermined "you answered B three times" mapping.

The share card is a bento-layout 900×900 PNG generated on a `<canvas>` at reveal time, with your archetype image, trait pills, a pulled insight quote, your signals, and session stats — all drawn via Canvas 2D API with proper text wrapping.

### The animation system

The GSAP implementation goes well beyond "fade in on scroll." In use here:
- **SplitText** with per-character physics: random y offsets (80–140px), rotation (±25°), scale (0.05–0.4x), all landing with a custom `slam` ease that overshoots and settles
- **ScrambleTextPlugin** for matrix-decode reveals using a custom character set (`!<>-_\/[]{}—=+*^?#░▒▓01XR4YV`)
- **Five custom cubic-bezier eases** tuned for specific emotional qualities: `slam` (impact), `unfurl` (flow), `yank` (snap), `hesitate` (builds anticipation), `snap` (confirmation)
- **Particle disintegration**: when you reject a choice, 32 colored dots explode from the element's bounding rect with randomised angles and magnitudes, GSAP-animated, then the element collapses its height to zero
- **orbitingTextRing**: words rotating around a central image in 3D perspective using CSS transform
- **wavePunch**: stacked text lines with a sine wave phase-shifting through the character positions on every animation frame
- **crtTicker**: a terminal-style scrolling ticker with scanline overlay

All of this runs without a build step. No Webpack, no Vite, no TypeScript. Pure ES modules loaded directly by the browser, GSAP and Three.js from CDN via importmap.

### The architecture

`game.js` was originally a 3,800-line monolithic closure. It's been refactored into 11 ES modules using a shared `ctx` context pattern: each `createXxx(ctx)` factory receives the context object, returns its methods, and gets `Object.assign`'d back onto `ctx`. Cross-module calls resolve lazily at invocation time, so registration order doesn't cause circular dependency issues.

---

## Contact for Trove

Helen Huang — helen@trove.garden — trove.is
