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

The pitch runs as a single HTML file. Nothing to install, nothing to sign in to. It opens in a browser.

**Before the pitch begins:**
A 3D phone model sits on screen, slightly tilted, gently floating. Notification cards burst from the screen. The investor holds down on the phone to begin — a hold-to-confirm interaction that immediately signals: *this isn't a deck.*

**The intro sequence:**
On hold, a progress ring fills. The phone shivers, the notifications shatter. The phone spins 360°, tilts face-on, and a push notification card slides up asking: *"What if you had xray vision for how people actually behave?"*

**The tangle (the pitch):**
Tapping the notification opens Trove's quiz UI — rendered inside the phone screen itself, tilting and moving with the 3D model. The investor progresses through 13 chapters:

| Chapter | What it covers |
|---|---|
| Intro | Frame: you're an investor. Every choice reveals something. |
| 01 — The World | A hiring scenario. The problem lands through a story, not a statistic. |
| 02 — The Problem | Self-reporting is dead. AI killed it. |
| 03 — The Question | How *would* you understand someone if you couldn't ask them? |
| 04 — The Solution | Tangles. Simulations. Behavioural science. |
| 05 — You Just Did It | The investor realises they've been doing a tangle this whole time. |
| 06 — Traction | 8× organic amplification. 78% multi-day return rate. 7-min sessions. $0 spend. |
| 07 — The Model | B2C free-to-premium flywheel feeds B2B "Sign in with Trove" enterprise play. |
| 08 — The Team | Second-time founders. Microsoft, Zynga, Ogilvy, Nokia. Forbes 30 Under 30. |
| 09 — The Market | $65B+ across hiring, dating, learning, and team assessment. All self-reported. |
| 10 — The Ask | $1.5M raise. $525K already in from Betaworks, True Ventures, Slack Fund. |
| 11 — Who We're Looking For | Consumer-to-enterprise investors. Patient. Data infrastructure thesis. |
| 12 — Your Profile | Personalised investor archetype based on choices made through the pitch. |
| 13 — The Close | The world's only irreducibly human signal. Contact details. |

Some chapters branch on the investor's previous choice, so the pitch adapts to how they engage with it.

**After the pitch:**
The investor has a behavioural profile of themselves. They've experienced the exact loop Trove sells to enterprise clients. The close writes itself.

---

## How It's Built

Single HTML file. No framework, no build step, no server.

- **Three.js** renders the 3D phone model (a GLB file) with a custom lighting rig and a soft brand-green halo behind the phone
- **Canvas API** draws all screen textures (clock, notifications, question card, hold ring) as 2D canvases mapped onto geometry inside the 3D scene — so they're native to the phone and move with it
- **CSS matrix3d homography** projects the four corners of the phone screen into screen coordinates every frame and warps the quiz UI overlay to match exactly — the UI is a DOM element that appears to be painted on the glass
- **Mouse parallax** (desktop) and **device orientation** (mobile) tilt the phone subtly in response to where you're looking or how you're holding your device
- The phone tilts in the opposite direction when the quiz opens, handled through Three.js rotation with a buttery easeOutCubic animation; the quiz overlay follows automatically via the homography

Everything is one file you can email or drop on GitHub Pages.

---

## Files

```
index.html      — the entire pitch
iphone.glb      — the phone 3D model
TroveLogo.png   — wordmark used in the quiz UI
TroveOh.png     — icon used on the notification card and quiz header
```

---

## To View

Open `index.html` in a browser. No server required — works from the filesystem.

On mobile, hold your phone in portrait. The device orientation parallax will register on first touch.

---

## Contact

Helen Huang — helen@trove.garden — trove.is
