import { HAPTIC } from './haptics.js';

window.tgSpeedMult = 1.0;

/* ══════════════════════════════════════════════════════════════
   GAME ENGINE
══════════════════════════════════════════════════════════════ */

function replyText(str) {
  const dash = str.indexOf(' \u2014 ');
  return dash >= 0 ? str.slice(0, dash) : str;
}

/* Particle disintegration — Mr. Stark I don't feel so good */
function disintegrate(el) {
  const rect = el.getBoundingClientRect();
  const N = 26;
  for (let i = 0; i < N; i++) {
    const p   = document.createElement('div');
    const sz  = 1.5 + Math.random() * 3;
    const sx  = rect.left + Math.random() * rect.width;
    const sy  = rect.top  + Math.random() * rect.height;
    const ang = Math.random() * Math.PI * 2;
    const mag = 18 + Math.random() * 48;
    const dur = 380 + Math.random() * 320;
    p.style.cssText =
      `position:fixed;width:${sz}px;height:${sz}px;border-radius:50%;` +
      `background:#1a1a2e;left:${sx}px;top:${sy}px;` +
      `pointer-events:none;z-index:9999;opacity:1;` +
      `transition:transform ${dur}ms ease-out,opacity ${dur * 0.75}ms ease-in;`;
    document.body.appendChild(p);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      p.style.transform = `translate(${Math.cos(ang)*mag}px,${Math.sin(ang)*mag - 10}px) scale(0.1)`;
      p.style.opacity   = '0';
    }));
    setTimeout(() => p.remove(), dur + 80);
  }
  // freeze height so collapse animates (slides content up) rather than snapping
  el.style.overflow     = 'hidden';
  el.style.height       = el.offsetHeight + 'px';
  el.style.transition   = 'opacity 220ms ease, transform 220ms ease, height 340ms 60ms cubic-bezier(0.4,0,0.2,1), margin-bottom 340ms 60ms cubic-bezier(0.4,0,0.2,1)';
  requestAnimationFrame(() => {
    el.style.opacity      = '0';
    el.style.transform    = 'scale(0.96)';
    el.style.height       = '0';
    el.style.marginBottom = '0';
  });
  setTimeout(() => el.remove(), 460);
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
  btn.innerHTML = window.tgPaused
    ? `<svg width="12" height="14" viewBox="0 0 12 14" fill="white"><path d="M2 1.5 L11 7 L2 12.5 Z"/></svg>`
    : `<svg width="12" height="14" viewBox="0 0 12 14" fill="white"><rect x="1" y="1" width="3.5" height="12" rx="1"/><rect x="7.5" y="1" width="3.5" height="12" rx="1"/></svg>`;
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
   GAME NARRATIVE — "Someone Thought of You"
══════════════════════════════════════════════════════════════ */
window.tgInitGame = async function () {
  const api = window.tgAPI;
  api.setProgress(0);

  /* ── Beat 1: The message ── */

  api.addImage('a phone on a table. lamp light. city outside doing its thing. the kind of Thursday evening that was going fine.');
  await api.wait(1000);

  api.addNarration('Your phone buzzes at 9pm.');
  await api.wait(2800);

  api.addNarration("It's Cass. Three words, no punctuation, which means they're already on their way.");
  await api.wait(3200);

  await api.addBubble('are you home', 1400);
  await api.wait(2500);

  api.addNarration("You look at your apartment. The lamp is on. There's something on the stove. You were, by any reasonable measure, having a perfectly good Thursday.");
  await api.wait(4200);

  api.addNarration('You type yes before you\'ve decided to.');
  await api.wait(3000);

  await api.addBubble('okay good', 900);
  await api.wait(800);
  await api.addBubble('I found something', 1000);
  await api.wait(800);
  await api.addBubble("well. I've been sitting on it for three weeks actually", 1600);
  await api.wait(900);
  await api.addBubble("I kept thinking I was wrong but I'm not wrong", 1500);
  await api.wait(900);
  await api.addBubble("I'm not texting you about it. you need to see it", 1400);
  await api.wait(800);
  await api.addBubble("are you eating? I'll bring food", 1200);
  await api.wait(1800);

  api.addNarration('You put your phone down.');
  await api.wait(2500);
  api.addNarration('You check the stove.');
  await api.wait(2200);
  api.addNarration('You put your phone back up.');
  await api.wait(2800);

  const c1 = await api.showChoicesAsync([
    '"come over" \u2014 you knew when you saw the name.',
    '"it\'s late" \u2014 you say this. you both know it\'s not a real objection.',
    '"what did you find" \u2014 you\'re not agreeing to anything. you just want to know.',
    '"...how far away are you" \u2014 they\'re already on their way. you can tell.',
  ]);
  api.setProgress(25);
  await api.wait(1800);

  /* ── Beat 2: The knock ── */

  api.addImage('your door from the inside. someone knocking. the specific quality of a knock that knows you\'re home.');
  await api.wait(1000);

  api.addNarration('Twenty-two minutes later, Cass is at your door.');
  await api.wait(3200);

  api.addNarration("They're holding a bottle of something and a paper bag that smells like the Thai place two blocks over. They brought food. They said they'd bring food. This is notable because Cass does not usually follow through on logistical specifics \u2014 they follow through on the things that matter, and apparently tonight, the food mattered.");
  await api.wait(5500);

  api.addNarration("They're already talking.");
  await api.wait(2500);

  await api.addBubble("okay so I know what you're going to say \u2014", 1400);
  await api.wait(1800);

  api.addNarration("You haven't said anything. You opened the door.");
  await api.wait(3000);

  await api.addBubble("you're going to say 'Cass this is another one of your things' and I need you to not do that right now because this is not another one of my things.\n\nthis is the thing.", 2400);
  await api.wait(1200);

  api.addImage("Cass inside now. jacket still on \u2014 they never take the jacket off, they're always half-leaving \u2014 laptop open on your coffee table before they've sat down properly. the bottle beside it. they brought two glasses. they always know where the glasses are.");
  await api.wait(1200);

  api.addNarration('You take the food.');
  await api.wait(2500);

  api.addNarration("You notice they've been nervous. Not visibly, not in a way most people would catch \u2014 but you've known Cass long enough to read the specific frequency of their energy tonight. This isn't the manic excitement of someone who found an interesting thing. This is the careful, barely-contained energy of someone who found something they're afraid to be wrong about.");
  await api.wait(5500);

  await api.addBubble('have you heard of Trove?', 1400);
  await api.wait(2000);

  api.addNarration('You have not heard of Trove.');
  await api.wait(2800);

  const c2 = await api.showChoicesAsync([
    '"No. What is it." \u2014 flat. you\'re listening.',
    '"Should I have?" \u2014 a small challenge. Cass loves a small challenge.',
    '"Is this what you\'ve been texting me about for three weeks?" \u2014 you\'ve been paying more attention than you let on.',
    '"Pour first." \u2014 priorities.',
  ]);
  if (c2 === 3) {
    await api.wait(800);
    api.collect('\u{1F943}', 'The Scotch');
  }
  api.setProgress(50);
  await api.wait(1800);

  /* ── Beat 3: The pitch ── */

  await api.addBubble('okay so.', 1000);
  await api.wait(1500);

  api.addNarration("They sit down. Cross-legged, obviously. They turn the laptop toward you.");
  await api.wait(3500);

  await api.addBubble("the problem \u2014 and I need you to actually think about this, not just nod at me \u2014 is that every important decision we make about people is based on what they say about themselves.", 2200);
  await api.wait(1000);
  await api.addBubble("resumes. dating profiles. interviews. reference checks.\n\nall of it. every single signal we use to understand people. self-reported. meaning: someone decided what to tell you, chose the framing, ran it through whatever version of themselves they wanted you to see.", 2800);
  await api.wait(1000);
  await api.addBubble("and now AI can generate any of those in about four seconds.", 1600);
  await api.wait(1500);

  api.addImage("the laptop screen angled toward us. a company name \u2014 Trove \u2014 and the suggestion of data we can't fully read yet. something that looks like numbers. good numbers.");
  await api.wait(1200);

  await api.addBubble("so the signal is dead. everything we built to understand people \u2014 broken. and most people haven't noticed yet.", 2000);
  await api.wait(900);
  await api.addBubble("except the people who are about to make a lot of money noticing.", 1500);
  await api.wait(1500);

  api.addNarration('You look at the screen. You look at Cass.');
  await api.wait(3500);

  const c3 = await api.showChoicesAsync([
    "This is a real problem. You've felt it. \u2014 a hire that looked perfect. a partnership that didn't survive contact with reality.",
    "Everyone says the signal is broken. That's not the same as having a solution. \u2014 you're listening but you want the other half of the sentence.",
    "You want to know who noticed. \u2014 skip the problem. get to the company.",
    "You want to know why Cass has been sitting on this for three weeks. \u2014 the pitch is interesting. Cass is more interesting.",
  ]);
  if (c3 === 3) {
    await api.wait(800);
    api.collect('\u{1F56F}\uFE0F', 'The Candle');
  }
  api.setProgress(75);
  await api.wait(1800);

  /* ── Beat 4: The close ── */

  await api.addBubble('so.', 900);
  await api.wait(1500);

  api.addNarration("They close the laptop halfway. Open it again. A tell \u2014 they only do this when they're about to say the part they've been rehearsing.");
  await api.wait(4000);

  api.addNarration("They look at you properly for the first time since they walked in.");
  await api.wait(2800);

  await api.addBubble("I've been wrong about things before. I know that. I'm not wrong about this.", 2000);

  await api.wait(3000);
  const scroll = document.getElementById('tg-scroll');
  if (scroll) scroll.scrollTop = scroll.scrollHeight;
  await api.wait(900);
  api.setProgress(100);
  api.showEnd("that's all for now, folks.\n\ncheck back later to finish the thrilling adventure of you & Cass.");
};
