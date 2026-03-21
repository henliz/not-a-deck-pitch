import { HAPTIC } from './haptics.js';

/* ══════════════════════════════════════════════════════════════
   GAME ENGINE
══════════════════════════════════════════════════════════════ */

function replyText(choiceStr) {
  const dash = choiceStr.indexOf(' \u2014 ');
  return dash >= 0 ? choiceStr.slice(0, dash) : choiceStr;
}

window.tgAPI = {

  addNarration(text) {
    const scroll = document.getElementById('tg-scroll');
    if (!scroll) return;
    const p = document.createElement('p');
    p.className = 'tg-narration';
    p.textContent = text;
    scroll.appendChild(p);
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

      const wrap = document.createElement('div');
      wrap.className = 'tg-bubble-wrap';
      wrap.innerHTML = `
        <div class="tg-bubble-meta">
          <div class="tg-bubble-avatar">C</div>
          <span class="tg-bubble-name">Cass</span>
        </div>
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
      }, typingMs);
    });
  },

  showChoicesAsync(choices) {
    const el = document.getElementById('tg-choices');
    if (!el) return Promise.resolve(0);

    return new Promise(resolve => {
      window._tgChoiceResolve = resolve;
      el.innerHTML = choices
        .map((c, i) => `<button class="tg-choice" onclick="window._tgChoiceClick(this,${i})">${c}</button>`)
        .join('');
      el.style.transition    = 'opacity 300ms ease';
      el.style.opacity       = '1';
      el.style.pointerEvents = 'auto';
      el.style.maxHeight     = '500px';
      el.style.paddingTop    = '';
      el.style.paddingBottom = '';
      el.style.borderColor   = '';
      requestAnimationFrame(() => {
        const scroll = document.getElementById('tg-scroll');
        if (scroll) scroll.scrollTop = scroll.scrollHeight;
      });
    });
  },

  wait(ms) {
    return new Promise(r => setTimeout(r, ms));
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

};

/* ── Choice tap: collapse box → player bubble → resolve ── */
window._tgChoiceClick = function (btn, idx) {
  if (btn.classList.contains('selected')) return;
  HAPTIC.tap();
  btn.classList.add('selected');

  const el = document.getElementById('tg-choices');
  if (el) {
    el.querySelectorAll('.tg-choice').forEach(b => { b.disabled = true; });
    // Collapse the whole choices panel
    el.style.opacity       = '0';
    el.style.maxHeight     = '0';
    el.style.paddingTop    = '0';
    el.style.paddingBottom = '0';
    el.style.borderColor   = 'transparent';
    el.style.pointerEvents = 'none';
  }

  // After box has collapsed, show player reply bubble
  setTimeout(() => {
    const scroll = document.getElementById('tg-scroll');
    if (scroll) {
      const wrap = document.createElement('div');
      wrap.className = 'tg-player-wrap';
      const bubble = document.createElement('div');
      bubble.className = 'tg-player-bubble';
      bubble.textContent = replyText(btn.textContent);
      wrap.appendChild(bubble);
      scroll.appendChild(wrap);
      setTimeout(() => { scroll.scrollTop = scroll.scrollHeight; }, 50);
    }

    setTimeout(() => {
      if (window._tgChoiceResolve) {
        const resolve = window._tgChoiceResolve;
        window._tgChoiceResolve = null;
        resolve(idx);
      }
    }, 500);
  }, 380);
};

/* ══════════════════════════════════════════════════════════════
   GAME NARRATIVE — "Someone Thought of You"
══════════════════════════════════════════════════════════════ */
window.tgInitGame = async function () {
  const api = window.tgAPI;

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

  await api.showChoicesAsync([
    '"come over" \u2014 you knew when you saw the name.',
    '"it\'s late" \u2014 you say this. you both know it\'s not a real objection.',
    '"what did you find" \u2014 you\'re not agreeing to anything. you just want to know.',
    '"...how far away are you" \u2014 they\'re already on their way. you can tell.',
  ]);
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
};
