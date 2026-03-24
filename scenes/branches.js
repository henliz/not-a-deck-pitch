// createBranches(ctx) — the full branching story:
// sBranch0 → A/B/C paths → shared traction + moat nodes → sAsk
// scoring flags and branchPath are updated via ctx (scoring module)

export function createBranches(ctx) {

  // entry point — three first-choice paths
  async function sBranch0() {
    await ctx.w(900); ctx.line('', 'tg-pl', 16);
    await ctx.ringWipeChapter('The Question');
    await ctx.w(200);
    await ctx.reveal(ctx.line('So.', 'tg-pl--impact'), {
      type: 'chars', y: 0,
      scale: () => gsap.utils.random(0.1, 0.5),
      rotation: () => gsap.utils.random(-20, 20),
      stagger: 0.06, from: 'center', duration: 0.62, ease: 'back.out(4)',
    });
    await ctx.w(400);
    await ctx.reveal(ctx.line('What if the data existed? Not what they said about themselves —', 'tg-pl--med'), {
      y: 18, stagger: 0.05, duration: 0.44, blur: true, ease: ctx.hasCE ? 'unfurl' : 'power3.out',
    });
    await ctx.w(200);
    const questionEl = ctx.line('<span class="tg-hl">what they actually did<br>when it mattered.</span>', 'tg-pl--big');
    await ctx.reveal(questionEl, {
      type: 'chars', y: 0,
      scale: () => gsap.utils.random(0.1, 0.5),
      rotation: () => gsap.utils.random(-14, 14),
      stagger: 0.045, from: 'center', duration: 0.58, ease: ctx.hasCE ? 'slam' : 'back.out(3)',
    });
    questionEl.style.position = 'relative'; questionEl.style.overflow = 'visible';
    questionEl.appendChild(ctx.decal('id.png', 'tg-decal--bob', { right: '10px', top: '0', w: 72, delay: 0.3, toRot: -45 }));
    await ctx.w(300);
    const idx = await ctx.branchChoices([
      "That data doesn't exist. Walk me through how it could.",
      "I've seen a hundred behavioral tools. What makes this one different.",
      "I want to know who's building it before I read anything else.",
    ]);
    ctx.setFirstChoice(idx);
    ctx.score([[1,2,0,0,1],[0,0,2,2,0],[0,1,0,3,0]][idx]);
    if (idx === 0) await sA1_curious();
    else if (idx === 1) await sB1_seen();
    else await sC1_founder();
  }

  // branch A — evidence-first path
  async function sA1_curious() {
    ctx.branchPath.push('A1');
    await ctx.w(900); ctx.line('', 'tg-pl', 16);
    await ctx.ringWipeChapter('The Signal Problem');
    await ctx.w(200);
    await ctx.reveal(ctx.line('<span class="tg-hl">Every important decision</span> about people runs on one type of data:', 'tg-pl--med'), {
      y: 16, stagger: 0.07, duration: 0.55, blur: true, ease: ctx.hasCE ? 'unfurl' : 'power3.out',
    });
    await ctx.w(200);
    ctx.flash();
    await ctx.reveal(ctx.line('what they<br>say about<br>themselves.', 'tg-pl--big'), {
      type: 'chars', y: 0,
      scale: () => gsap.utils.random(0.1, 0.5),
      rotation: () => gsap.utils.random(-15, 15),
      stagger: 0.05, from: 'center', duration: 0.65, ease: ctx.hasCE ? 'slam' : 'back.out(3)',
    });
    await ctx.w(600);
    await ctx.rlistReveal([
      { t: 'Resumes. LinkedIn. Dating profiles. Self-reported.' },
      { t: 'Reference checks. Personality tests. 360s. Self-reported.' },
      { t: 'And now? AI can rewrite any of those in thirty seconds. Completely unverifiable.' },
    ]);
    await ctx.w(400);
    const deadEl = ctx.line('Self-reporting isn\'t just noisy. It\'s <span class="tg-dead-word">dead.</span>', 'tg-pl--med tg-pl--italic', 8);
    await ctx.reveal(deadEl, { y: 14, stagger: 0.07, duration: 0.55, ease: ctx.hasCE ? 'unfurl' : 'power3.out' });
    const deadWord = deadEl.querySelector('.tg-dead-word');
    if (deadWord) {
      deadWord.style.position = 'relative';
      deadWord.style.overflow = 'visible';
      deadWord.appendChild(ctx.decal('heartbreak.png', 'tg-decal--lubdub', { left: 'calc(100% - 20px)', top: '18px', w: 104, fromY: -30, delay: 0.2 }));
    }
    await ctx.w(500);
    await ctx.reveal(ctx.line('40–80% of applicants now use AI to write about themselves.', 'tg-blockquote'), {
      y: 8, stagger: 0.022, duration: 0.34, ease: ctx.hasCE ? 'unfurl' : 'power3.out',
    });
    await ctx.w(220);
    await ctx.reveal(ctx.line('$8.8 trillion lost annually to employee disengagement.', 'tg-blockquote'), {
      y: 8, stagger: 0.022, duration: 0.34, ease: ctx.hasCE ? 'unfurl' : 'power3.out',
    });
    await ctx.w(440);
    ctx.crtTicker('the cost of not actually knowing the people you hire');
    await ctx.w(350);
    const idx = await ctx.branchChoices([
      "Okay. So what's the new signal?",
      "People have tried to solve this before. Why does this attempt survive contact with the real world?",
    ]);
    ctx.score([[2,0,0,1,1],[1,2,1,0,0]][idx]);
    if (idx === 0) await sA2_soWhat();
    else await sA2_beenTried();
  }

  async function sA2_soWhat() {
    ctx.branchPath.push('A2a');
    await ctx.w(900); ctx.line('', 'tg-pl', 16);
    await ctx.ringWipeChapter('The New Signal');
    await ctx.w(200);
    await ctx.reveal(ctx.line('You <span class="tg-hl-b">stop asking</span> people who they are.', 'tg-pl--med'), {
      y: 16, stagger: 0.07, duration: 0.55, blur: true, ease: ctx.hasCE ? 'unfurl' : 'power3.out',
    });
    await ctx.w(600);
    ctx.flash();
    const watchEl = ctx.line('You watch them<br>make decisions.', 'tg-pl--big', 8);
    watchEl.style.whiteSpace = 'nowrap';
    watchEl.style.fontSize = 'clamp(22px, 9cqw, 40px)';
    if (ctx.hasGSAP) {
      const split = new SplitText(watchEl, { type: 'words' });
      await new Promise(r => gsap.from(split.words, {
        opacity: 0, scale: 0.7,
        duration: 0.5, ease: ctx.hasCE ? 'snap' : 'back.out(3)',
        stagger: { each: 0.12, from: 'center' },
        clearProps: 'transform,scale', onComplete: r,
      }));
    }
    watchEl.style.position = 'relative'; watchEl.style.overflow = 'visible';
    const cameraImg = ctx.decal('camera.png', 'tg-decal--bob', { right: '0px', top: '-4px', w: 68, delay: 0.2 });
    watchEl.appendChild(cameraImg);
    if (ctx.hasGSAP) {
      gsap.timeline({ delay: 0.95, repeat: -1, repeatDelay: 2.4 })
        .to(cameraImg, { filter: 'brightness(10) saturate(0)', scale: 1.22, duration: 0.04, ease: 'none' })
        .to(cameraImg, { filter: 'brightness(2) saturate(0.4)', scale: 1.1, duration: 0.08, ease: 'power1.out' })
        .to(cameraImg, { filter: 'brightness(1) saturate(1)', scale: 1, duration: 0.5, ease: 'power3.out' });
    }
    await ctx.w(700);
    const tanglesEl = ctx.line('Trove builds <span class="tg-hl">tangles</span> — interactive, story-based scenarios that put you inside <span class="tg-hl-b">emotionally real moments.</span>', 'tg-pl--med');
    await ctx.reveal(tanglesEl, {
      y: 14, stagger: 0.035, duration: 0.4, blur: true, ease: ctx.hasCE ? 'unfurl' : 'power3.out',
    });
    await ctx.w(160);
    await ctx.reveal(ctx.line('A first date. A workplace crisis. A creative standoff at midnight.', 'tg-pl--med'), {
      y: 12, stagger: 0.07, duration: 0.52, blur: true, ease: ctx.hasCE ? 'unfurl' : 'power3.out',
    });
    await ctx.w(120);
    await ctx.reveal(ctx.line('You make choices. <span class="tg-hl">Real ones, under actual pressure.</span>', 'tg-pl--med'), {
      y: 12, stagger: 0.07, duration: 0.52, blur: true, ease: ctx.hasCE ? 'unfurl' : 'power3.out',
    });
    await ctx.w(350);
    await ctx.pqReveal('The scenario is the instrument. The choice is the data.',
      'gaming.png', { right: '-28px', top: '-36px', w: 96, fromY: -30, delay: 0.5 });
    await ctx.dimLines('Not "how would you handle conflict?" — a conflict. One you\'re actually inside. The way you move through it: what you push on, what you deflect, how long you hold ambiguity. Impossible to fake consistently across twelve different contexts.');
    await ctx.w(350);
    const idx = await ctx.branchChoices([
      "Has anyone actually played this? What did the data look like?",
      "What stops someone from building the same thing in six months?",
    ]);
    ctx.score([[2,0,0,1,1],[1,0,3,0,0]][idx]);
    if (idx === 0) await sShared_traction();
    else await sShared_moat();
  }

  async function sA2_beenTried() {
    ctx.branchPath.push('A2b'); ctx.setFlag('pushedBackOnData');
    await ctx.w(900); ctx.line('', 'tg-pl', 16);
    await ctx.ringWipeChapter('Why This Survives');
    await ctx.w(200);
    await ctx.reveal(ctx.line('Every previous attempt made <span class="tg-hl">the same mistake.</span>', 'tg-pl--med'), {
      y: 16, stagger: 0.07, duration: 0.55, blur: true, ease: ctx.hasCE ? 'unfurl' : 'power3.out',
    });
    await ctx.w(350);
    await ctx.dimLines('They still asked people to describe their behaviour. Personality tests — self-reported. 360 reviews — observer-reported. Assessment centres — performed. All gameable. All dead in an AI world.', 160);
    await ctx.w(400);
    ctx.flash();
    const fundamentalEl = ctx.line('Trove\'s<br>fundamental<br>move: you never<br>ask.', 'tg-pl--big');
    fundamentalEl.style.whiteSpace = 'nowrap';
    fundamentalEl.style.fontSize = 'clamp(24px, 9.5cqw, 44px)';
    await ctx.reveal(fundamentalEl, {
      type: 'chars', y: 0,
      scale: () => gsap.utils.random(0.1, 0.5),
      rotation: () => gsap.utils.random(-15, 15),
      stagger: 0.05, from: 'center', duration: 0.65, ease: ctx.hasCE ? 'slam' : 'back.out(3)',
    });
    await ctx.w(600);
    await ctx.reveal(ctx.line('You build a scenario. You watch what someone does.', 'tg-pl--med'), {
      y: 14, stagger: 0.07, duration: 0.52, blur: true, ease: ctx.hasCE ? 'unfurl' : 'power3.out',
    });
    await ctx.w(120);
    await ctx.reveal(ctx.line('The measurement is <span class="tg-hl-b">invisible</span> — they\'re too absorbed in the story to perform.', 'tg-pl--med'), {
      y: 12, stagger: 0.065, duration: 0.52, blur: true, ease: ctx.hasCE ? 'unfurl' : 'power3.out',
    });
    await ctx.w(350);
    await ctx.pqReveal(
      '"This game read me for absolute filth."<span class="tg-pq-attr">— a Valentine\'s Day player. Completely unprompted.</span>',
      'phone.png', { right: '-24px', top: '-8px', w: 72, delay: 0.5 }, 'tg-decal--ring'
    );
    const idx = await ctx.branchChoices([
      "Show me the numbers from early usage.",
      "I want to understand the moat. What compounds here?",
    ]);
    ctx.score([[2,0,0,1,1],[1,0,3,0,0]][idx]);
    if (idx === 0) await sShared_traction();
    else await sShared_moat();
  }

  // branch B — skeptic path
  async function sB1_seen() {
    ctx.branchPath.push('B1');
    await ctx.w(900); ctx.line('', 'tg-pl', 16);
    await ctx.ringWipeChapter('Not a Tool. A Layer.');
    await ctx.w(200);
    await ctx.reveal(ctx.line('Most behavioural tools sit on top of <span class="tg-hl">existing workflows.</span>', 'tg-pl--med'), {
      y: 14, stagger: 0.065, duration: 0.52, blur: true, ease: ctx.hasCE ? 'unfurl' : 'power3.out',
    });
    await ctx.w(120);
    await ctx.reveal(ctx.line('You administer them. Someone takes the test. <span class="tg-hl-b">You get a report.</span>', 'tg-pl--med'), {
      y: 12, stagger: 0.065, duration: 0.52, blur: true, ease: ctx.hasCE ? 'unfurl' : 'power3.out',
    });
    await ctx.w(350);
    ctx.flash();
    const troveIsWrap = document.createElement('div');
    troveIsWrap.className = 'tg-pl';
    troveIsWrap.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:4px;';
    const logoWrap = document.createElement('span');
    logoWrap.className = 'tg-hero-logo';
    logoWrap.style.marginTop = '18px';
    const wordImg = document.createElement('img');
    wordImg.src = './TroveLogo.png'; wordImg.className = 'tg-hero-word'; wordImg.style.opacity = '0';
    const ohImg  = document.createElement('img');
    ohImg.src  = './TroveOh.png';   ohImg.className  = 'tg-hero-oh';
    logoWrap.append(wordImg, ohImg);
    const isSpan = document.createElement('span');
    isSpan.style.cssText = 'font-family:var(--font-display);font-size:clamp(30px,12cqw,52px);font-weight:700;line-height:1.05;color:var(--shift);opacity:0;';
    isSpan.textContent = 'is';
    troveIsWrap.append(logoWrap, isSpan);
    ctx.pitch.appendChild(troveIsWrap);
    ctx.scrollPitch();

    await new Promise(resolve => {
      let loaded = 0;
      const onLoad = () => { if (++loaded < 2) return; go(); };
      wordImg.onload = onLoad; ohImg.onload = onLoad;
      if (wordImg.complete) onLoad();
      if (ohImg.complete)   onLoad();
      function go() {
        const W    = wordImg.offsetWidth || 88;
        const ohW  = ohImg.offsetWidth   || 24;
        const startX = W + 14;
        const endX   = Math.round(W * 0.48 - ohW / 2);
        setTimeout(() => {
          if (ctx.hasGSAP) gsap.fromTo(isSpan, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power3.out', clearProps: 'all' });
          else isSpan.style.opacity = '1';
        }, 420);
        ohImg.style.transform = `translateX(${startX}px)`;
        const ease = p => p < 0.5 ? 2*p*p : 1 - Math.pow(-2*p+2,2)/2;
        let t0 = null;
        function frame(ts) {
          if (!t0) t0 = ts;
          const elapsed = ts - t0;
          const p  = Math.min(1, elapsed / 2100);
          const e  = ease(p);
          ohImg.style.transform  = `translateX(${startX + (endX - startX) * e}px) rotate(${e * 720}deg)`;
          const cp = Math.max(0, Math.min(1, (elapsed - 2100 * 0.62) / 620));
          ohImg.style.opacity  = String(1 - cp);
          wordImg.style.opacity = String(cp);
          if (p < 1) requestAnimationFrame(frame);
          else { ohImg.remove(); ctx.HAPTIC.burst(); resolve(); }
        }
        requestAnimationFrame(frame);
      }
    });
    await ctx.w(200);

    const infraLine = ctx.line('infrastructure.', 'tg-pl--punch');
    await ctx.reveal(infraLine, {
      type: 'chars', y: 0,
      scale: () => gsap.utils.random(0.1, 0.5),
      rotation: () => gsap.utils.random(-15, 15),
      stagger: 0.05, from: 'center', duration: 0.65, ease: ctx.hasCE ? 'slam' : 'back.out(3)',
    });
    infraLine.style.position = 'relative'; infraLine.style.overflow = 'visible';
    const houseDecal = ctx.decal('house.png', 'tg-decal--bob', { right: '-26px', top: '-14px', w: 54, fromY: -30, delay: 0.3 });
    infraLine.appendChild(houseDecal);
    setTimeout(() => ctx.curveText(houseDecal, '\u2736 BEHAVIORAL LAYER \u2736 INFRASTRUCTURE \u2736 MOAT \u2736',
      { above: false, radius: 44, arc: 200, fontSize: 7.5, delay: 0 }), 500);
    await ctx.w(600);
    for (const s of [
      'Consumers play <span class="tg-hl">interactive stories</span> — scenarios that feel like games.',
      'Underneath, a behavioural science engine builds <span class="tg-hl-b">a profile they own.</span>',
      'When they apply for a job, go on a date, or authorize a landlord to screen them, they share that profile. <span class="tg-hl">The platform pays to read it.</span>',
    ]) {
      await ctx.reveal(ctx.line(s, 'tg-pl--med'), {
        y: 12, stagger: 0.065, duration: 0.52, blur: true, ease: ctx.hasCE ? 'unfurl' : 'power3.out',
      });
      await ctx.w(180);
    }
    await ctx.w(350);
    await ctx.pqReveal('Think Duolingo on the consumer side. Think Plaid on the B2B side. Behavioral data is the asset class.');
    await ctx.dimLines('The moat is the dataset. Every play makes the models sharper. Sharper models make the profiles more accurate. More accurate profiles make the B2B product worth more. That loop doesn\'t have a ceiling.', 160);
    await ctx.w(350);
    const idx = await ctx.branchChoices([
      "Walk me through the B2B licensing model specifically.",
      "Who owns the data? That's usually where these models break down.",
      "Show me proof the consumer side actually works first.",
    ]);
    ctx.score([[0,0,3,1,0],[1,0,2,1,0],[2,0,0,1,1]][idx]);
    if (idx === 0) await sB2_b2b();
    else if (idx === 1) await sB2_dataset();
    else await sShared_traction();
  }

  async function sB2_b2b() {
    ctx.branchPath.push('B2b'); ctx.setFlag('wentB2B');
    await ctx.w(900); ctx.line('', 'tg-pl', 16);
    await ctx.ringWipeChapter('The B2B Model');
    await ctx.w(200);
    await ctx.reveal(ctx.line('Four companies reached out after the Valentine\'s Day campaign. None of them were pitched. They played the consumer product and <span class="tg-hl">saw the enterprise application themselves.</span>', 'tg-pl--med'), {
      y: 14, stagger: 0.07, duration: 0.55, blur: true, ease: ctx.hasCE ? 'unfurl' : 'power3.out',
    });
    await ctx.w(350);
    ctx.askGrid([
      { label: 'Consumer',   value: 'Free → Premium', sub: 'Users build profiles they own across every tangle they play' },
      { label: 'Enterprise', value: '"Sign in with Trove"', sub: 'Platforms pay for authorized behavioural signal. Like Plaid for personality.' },
    ]);
    await ctx.w(500);
    await ctx.dimLines('Hiring, dating, insurance, healthcare — every high-stakes people decision currently runs on self-report. Trove becomes the API layer that replaces it. The user authorizes the share. The platform pays. The data stays the user\'s.', 160);
    await ctx.w(350);
    const idx = await ctx.branchChoices([
      "What does early consumer traction look like?",
      "I want to hear the ask.",
    ]);
    ctx.score([[2,0,0,1,1],[1,0,1,1,0]][idx]);
    if (idx === 0) await sShared_traction();
    else await sAsk();
  }

  async function sB2_dataset() {
    ctx.branchPath.push('B2d'); ctx.setFlag('wentDataset');
    await ctx.w(900); ctx.line('', 'tg-pl', 16);
    await ctx.ringWipeChapter('Who Owns the Data');
    await ctx.w(200);
    ctx.flash();
    const userEl = ctx.line('The user does. <span class="tg-always-word" style="position:relative;display:inline-block;overflow:visible;">Always.</span>', 'tg-pl--big');
    await ctx.reveal(userEl, {
      type: 'chars', y: 0,
      scale: () => gsap.utils.random(0.1, 0.5),
      rotation: () => gsap.utils.random(-15, 15),
      stagger: 0.05, from: 'center', duration: 0.65, ease: ctx.hasCE ? 'slam' : 'back.out(3)',
    });
    const alwaysWord = userEl.querySelector('.tg-always-word') || userEl;
    alwaysWord.appendChild(ctx.decal('id.png', 'tg-decal--bob', { right: '-58px', top: '-8px', w: 72, delay: 0.2 }));
    userEl.style.position = 'relative'; userEl.style.overflow = 'visible';
    userEl.appendChild(ctx.decal('avatars/g4.png', 'tg-decal--party', { left: '-54px', top: '-18px', w: 58, delay: 0.5 }));
    await ctx.w(600);
    await ctx.reveal(ctx.line('This isn\'t a privacy policy nicety — it\'s <span class="tg-hl-b">the core of the business model.</span> Trove profiles are <span class="tg-hl">assets users accumulate</span> and choose to share. You authorize what gets seen and to whom. You can revoke it.', 'tg-pl--med'), {
      y: 14, stagger: 0.07, duration: 0.55, blur: true, ease: ctx.hasCE ? 'unfurl' : 'power3.out',
    });
    await ctx.w(350);
    await ctx.dimLines('That consent architecture is what makes the B2B product valuable. An enterprise buyer is getting a signal that the person chose to share with them. That\'s a different conversation than a background check or a scraped LinkedIn.');
    await ctx.w(350);
    await ctx.pqReveal('The user\'s willingness to share their Trove profile is itself a behavioural signal. It tells you something about them before you\'ve even looked at the data.');
    const idx = await ctx.branchChoices([
      "Show me the early consumer numbers. Does this actually work?",
      "Tell me more about how the dataset compounds.",
    ]);
    ctx.score([[2,0,0,1,1],[1,0,3,0,0]][idx]);
    if (idx === 0) await sShared_traction();
    else await sShared_moat();
  }

  // branch C — conviction/founder path
  async function sC1_founder() {
    ctx.branchPath.push('C1'); ctx.setFlag('usedFounderPath');
    await ctx.w(900); ctx.line('', 'tg-pl', 16);
    await ctx.ringWipeChapter('Helen Huang');
    await ctx.w(180);
    const photoWrap = document.createElement('div');
    photoWrap.className = 'tg-pl tg-founder-photo-wrap';
    const helenImg = document.createElement('img');
    helenImg.src = './helenfounder.png';
    helenImg.className = 'tg-founder-photo';
    helenImg.alt = 'Helen Huang';
    photoWrap.appendChild(helenImg);
    ctx.pitch.appendChild(photoWrap);
    ctx.scrollPitch();

    if (ctx.hasGSAP) {
      await new Promise(r => gsap.from(helenImg, {
        scale: 0.88, opacity: 0, y: 18, duration: 0.65,
        ease: ctx.hasCE ? 'unfurl' : 'back.out(1.6)',
        onComplete: r,
      }));
      ctx.HAPTIC?.card?.();
      const photoDecals = [
        { src: 'mic.png',      right: '-18px', top:    '-16px', w: 48, delay: 0.05, fromRot: -30, toRot: 8  },
        { src: 'starhehe.png', right: '-14px', bottom: '-12px', w: 38, delay: 0.12, fromRot:  20, toRot: -5 },
        { src: 'flower.png',   left:  '-16px', top:    '-14px', w: 42, delay: 0.18, fromRot: -20, toRot: 12 },
        { src: 'babystar.png', left:  '-10px', bottom: '-10px', w: 68, delay: 0.24, fromRot:  15, toRot: -8 },
      ];
      photoDecals.forEach(({ src, w: dw, delay, fromRot, toRot, ...pos }) => {
        photoWrap.appendChild(ctx.decal(src, 'tg-decal--bob', { ...pos, w: dw, delay, fromRot, toRot }));
      });
    }
    await ctx.w(280);
    const credList = await ctx.rlistReveal([
      { m: '01', t: 'Second-time founder' },
      { m: '02', t: 'Former PM at Microsoft and Zynga' },
      { m: '03', t: 'Bootstrapped a profitable edtech startup to seven figures' },
      { m: '04', t: 'Forbes 30 Under 30' },
    ]);
    credList.style.position = 'relative'; credList.style.overflow = 'visible';
    credList.appendChild(ctx.decal('mic.png', 'tg-decal--bob', { right: '-22px', top: '0', w: 48, delay: 0.4 }));
    await ctx.w(300);
    await ctx.reveal(ctx.line('She didn\'t start Trove because it was <span class="tg-hl-b">a good market.</span>', 'tg-pl--med tg-pl--italic'), {
      y: 14, stagger: 0.07, duration: 0.55, ease: ctx.hasCE ? 'unfurl' : 'power3.out',
    });
    await ctx.w(500);
    ctx.flash();
    const startedEl = ctx.line('She started it', 'tg-pl--big');
    startedEl.style.marginBottom = '2px';
    await ctx.reveal(startedEl, {
      type: 'chars', y: 0,
      scale: () => gsap.utils.random(0.1, 0.5),
      rotation: () => gsap.utils.random(-15, 15),
      stagger: 0.05, from: 'center', duration: 0.65, ease: ctx.hasCE ? 'slam' : 'back.out(3)',
    });
    const becauseEl = ctx.line('because she', 'tg-pl--big');
    becauseEl.style.marginTop = '-2px';
    becauseEl.style.marginBottom = '8px';
    await ctx.reveal(becauseEl, {
      type: 'chars', y: 0,
      scale: () => gsap.utils.random(0.1, 0.5),
      rotation: () => gsap.utils.random(-15, 15),
      stagger: 0.05, from: 'center', duration: 0.65, ease: ctx.hasCE ? 'slam' : 'back.out(3)',
    });
    const livedEl = ctx.line('lived the problem.', 'tg-pl--impact');
    livedEl.style.cssText += 'color:var(--shift);margin-top:0;';
    await ctx.reveal(livedEl, {
      type: 'words', y: 0,
      scale: () => gsap.utils.random(2.0, 2.6),
      blur: true,
      duration: 0.75, ease: ctx.hasCE ? 'hesitate' : 'power3.out', stagger: 0.18,
    });
    livedEl.style.position = 'relative'; livedEl.style.overflow = 'visible';
    livedEl.appendChild(ctx.decal('heartbreak.png', 'tg-decal--lubdub', { right: '-32px', top: '-8px', w: 80, fromY: -24, delay: 0.4 }));
    await ctx.w(400);
    await ctx.pqReveal(
      '"You\'re working on something important, you know? More importantly, you are doing it the right way."<span class="tg-pq-attr">— unsolicited message from a player after launch.</span>',
      'babystar.png', { right: '-18px', bottom: '-18px', w: 120, delay: 0.5 }, 'tg-decal--party'
    );
    await ctx.reveal(ctx.line('She also built a <span class="tg-hl">30,000-person emailing list.</span>', 'tg-pl--med'), {
      y: 12, stagger: 0.06, duration: 0.48, ease: ctx.hasCE ? 'unfurl' : 'power3.out',
    });
    await ctx.w(300);
    await ctx.dimLines('that\'s not a vanity metric, but a launch list to the moon', 180);
    await ctx.w(600);
    const idx = await ctx.branchChoices([
      "What does she know that nobody else in this space has figured out?",
      "I want to see what she's shipped. Show me the early numbers.",
    ]);
    ctx.score([[0,2,0,2,0],[2,0,0,1,1]][idx]);
    if (idx === 0) await sC2_conviction();
    else await sShared_traction();
  }

  async function sC2_conviction() {
    ctx.branchPath.push('C2'); ctx.setFlag('pushedOnFounder');
    await ctx.w(900); ctx.line('', 'tg-pl', 16);
    await ctx.ringWipeChapter('The Insight');
    await ctx.w(200);
    await ctx.reveal(ctx.line('Everyone else trying to solve the "know people better" problem is <span class="tg-hl">building better questionnaires.</span>', 'tg-pl--med'), {
      x: -18, stagger: 0.06, duration: 0.52, ease: ctx.hasCE ? 'unfurl' : 'power3.out',
    });
    await ctx.w(350);
    ctx.flash();
    await ctx.reveal(ctx.line('Helen\'s insight:', 'tg-pl--dim'), {
      y: 6, stagger: 0.04, duration: 0.28, ease: ctx.hasCE ? 'unfurl' : 'power2.out',
    });
    await ctx.w(80);

    const doGlitch = async (el, text) => {
      if (ctx.hasGSAP && ctx.hasScrTx) {
        el.textContent = '';
        await new Promise(r => gsap.to(el, {
          duration: 1.1,
          scrambleText: { text, chars: '!<>-_\\/[]{}—=+*^?#@░▒▓', revealDelay: 0.28, speed: 0.45 },
          ease: 'none', onComplete: r,
        }));
        const r2 = el.cloneNode(true), b2 = el.cloneNode(true);
        r2.style.cssText = 'position:absolute;top:0;left:0;color:var(--shift);mix-blend-mode:multiply;pointer-events:none;';
        b2.style.cssText = 'position:absolute;top:0;left:0;color:var(--trace);mix-blend-mode:multiply;pointer-events:none;';
        el.style.position = 'relative';
        el.appendChild(r2); el.appendChild(b2);
        await new Promise(r => gsap.timeline({ onComplete: r })
          .to(r2, { x: () => (Math.random()-0.5)*14, duration: 0.05, ease: 'steps(1)', repeat: 6, yoyo: true })
          .to(b2, { x: () => (Math.random()-0.5)*14, duration: 0.05, ease: 'steps(1)', repeat: 6, yoyo: true }, '<')
          .to(el, { skewX: () => (Math.random()-0.5)*3, duration: 0.08, ease: 'steps(1)', repeat: 3, yoyo: true }, '<')
          .call(() => { r2.remove(); b2.remove(); el.style.position = ''; })
        );
      } else if (ctx.hasGSAP) {
        const split = new SplitText(el, { type: 'chars' });
        await new Promise(r => gsap.from(split.chars, {
          opacity: 0, scale: () => gsap.utils.random(0.1, 0.5),
          rotation: () => gsap.utils.random(-12, 12),
          stagger: 0.05, from: 'center', duration: 0.6,
          ease: ctx.hasCE ? 'slam' : 'back.out(3)', clearProps: 'all', onComplete: r,
        }));
      }
    };
    ctx.flash();
    await doGlitch(ctx.line('the', 'tg-pl--huge'), 'the');
    await ctx.w(100);
    await doGlitch(ctx.line('questionnaire', 'tg-pl--huge'), 'questionnaire');
    await ctx.w(220);
    const isProblemEl = ctx.line('is the problem.', 'tg-pl--oneliner');
    isProblemEl.style.cssText += 'color:var(--anchor);font-weight:600;margin-top:-2px;';
    await ctx.reveal(isProblemEl, {
      y: 10, stagger: 0.04, duration: 0.38, blur: true, ease: ctx.hasCE ? 'unfurl' : 'power3.out',
    });
    await ctx.w(600);
    await ctx.reveal(ctx.line('Not the form it takes — the entire model of asking people to describe themselves. The only behavioural data that isn\'t gameable is data captured when the person is too absorbed in something else to perform.', 'tg-pl--dim'), {
      y: 8, stagger: 0.06, duration: 0.50, ease: ctx.hasCE ? 'unfurl' : 'power3.out',
    });
    await ctx.w(350);
    await ctx.pqReveal('"It felt so deeply intimate from the beginning. Terrifying. Well done."<span class="tg-pq-attr">— Valentine\'s Day player.</span>');
    const idx = await ctx.branchChoices([
      "Show me what the first real launch looked like.",
      "What makes this defensible long-term?",
    ]);
    ctx.score([[2,0,0,1,1],[1,0,3,0,0]][idx]);
    if (idx === 0) await sShared_traction();
    else await sShared_moat();
  }

  // shared convergence nodes
  async function sShared_traction() {
    ctx.branchPath.push('traction');
    await ctx.w(900); ctx.line('', 'tg-pl', 16);
    ctx.chapter("Valentine's Day. $0 Spend.");
    await ctx.w(200);
    ctx.flash(true);
    const oneCampaignEl = ctx.line('One campaign.', 'tg-pl--big', 8);
    await ctx.reveal(oneCampaignEl, {
      type: 'chars', from: 'center', stagger: 0.06, duration: 0.6, ease: ctx.hasCE ? 'slam' : 'back.out(3)',
    });
    oneCampaignEl.style.position = 'relative'; oneCampaignEl.style.overflow = 'visible';
    oneCampaignEl.appendChild(ctx.decal('icecream.png', 'tg-decal--bob', { right: '-28px', top: '-10px', w: 46, fromY: -30, delay: 0.2 }));
    await ctx.w(300);
    await ctx.reveal(ctx.line('500 emails. No ads. No paid influencers. <span class="tg-hl">Nothing.</span>', 'tg-pl--med'), {
      y: 14, stagger: 0.07, duration: 0.55, blur: true, ease: ctx.hasCE ? 'unfurl' : 'power3.out',
    });
    await ctx.w(350);
    const viralEl = ctx.line('<span class="tg-hl">8× organic amplification.</span> People shared it because they wanted their friends to see their own results.', 'tg-pl--med');
    await ctx.reveal(viralEl, {
      y: 14, stagger: 0.07, duration: 0.55, blur: true, ease: ctx.hasCE ? 'unfurl' : 'power3.out',
    });
    viralEl.style.position = 'relative'; viralEl.style.overflow = 'visible';
    viralEl.appendChild(ctx.decal('banana.png', 'tg-decal--bob', { right: '-26px', top: '-6px', w: 42, fromY: -28, delay: 0.15 }));
    await ctx.w(350);
    const statsEl = await ctx.statsBlockReveal([
      { n: '78%',   l: 'returned day 3 — zero push notifications', asset: 'boomerand.png', sweep: 'boomerand.png' },
      { n: '7 min', l: 'median session length',                    asset: 'watch.png'     },
      { n: '24K+',  l: 'behavioural data points, 2,100+ players',  asset: 'id.png'        },
      { n: '4',     l: 'unsolicited B2B inquiries — none pitched',  asset: 'waller.png'   },
    ]);
    statsEl.style.position = 'relative'; statsEl.style.overflow = 'visible';
    statsEl.appendChild(ctx.decal('babystar.png', 'tg-decal--bob', { right: '-24px', top: '-24px', w: 80, delay: 0.2 }));
    await ctx.w(500);
    await ctx.reveal(ctx.line('When the campaign ended —', 'tg-pl--dim'), {
      y: 10, stagger: 0.06, duration: 0.50, ease: ctx.hasCE ? 'unfurl' : 'power3.out',
    });
    await ctx.w(500);
    ctx.flash();
    const discordEl = ctx.line('60 strangers built a Discord.', 'tg-pl--oneliner');
    await ctx.reveal(discordEl, {
      type: 'chars', y: 0,
      scale: () => gsap.utils.random(0.1, 0.5),
      rotation: () => gsap.utils.random(-12, 12),
      stagger: 0.045, from: 'center', duration: 0.6, ease: ctx.hasCE ? 'slam' : 'back.out(3)',
    });
    discordEl.style.position = 'relative'; discordEl.style.overflow = 'visible';
    discordEl.appendChild(ctx.decal('gaming.png', 'tg-decal--bob', { right: '-60px', top: '-24px', w: 88, fromY: -28, delay: 0.2 }));
    await ctx.w(350);
    await ctx.dimLines('Nobody asked them to. No push notifications. No referral loop. They just didn\'t want it to end.', 150);
    await ctx.w(400);
    await ctx.pqReveal('That\'s not a retention metric. That\'s people who want to keep being seen.');
    await ctx.w(200);
    await ctx.reveal(ctx.line('What players said after:', 'tg-pl--attr'), {
      y: 8, duration: 0.35, ease: ctx.hasCE ? 'unfurl' : 'power3.out',
    });
    await ctx.w(180);
    await ctx.testimonialReel([
      { text: '"It\'s unsettling. I didn\'t expect to feel so understood."', attr: '— player, 11:52pm' },
      { text: '"I sent this to my therapist. Literally the topic of our next session."', attr: '— player, 4:44am' },
      { text: '"You didn\'t ask me anything. And you still got it right."', attr: '— player, Day 1' },
    ]);
    await ctx.w(300);

    // Fish swims the full pitch width
    {
      const fishWrap = document.createElement('div');
      const fishImg  = document.createElement('img');
      fishImg.src = './assets/fish.png';
      fishImg.style.cssText = 'width:72px;height:auto;display:block;pointer-events:none;';
      fishWrap.style.cssText = `position:absolute;left:0;top:${ctx.pitch.scrollTop + ctx.pitch.clientHeight * 0.38}px;pointer-events:none;z-index:20;`;
      fishWrap.appendChild(fishImg);
      ctx.pitch.appendChild(fishWrap);
      const sw = ctx.pitch.clientWidth;
      gsap.set(fishWrap, { x: sw + 80 });
      gsap.to(fishWrap, { y: 55, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.timeline({ repeat: -1 })
        .to(fishWrap, { x: -80, duration: 5.5, ease: 'none',
          onStart() { gsap.set(fishWrap, { scaleX: -1 }); gsap.to(fishImg, { scale: 1.45, duration: 0.5, ease: 'power2.out' }); } })
        .to(fishWrap, { x: sw + 80, duration: 5.5, ease: 'none',
          onStart() { gsap.set(fishWrap, { scaleX: 1 });  gsap.to(fishImg, { scale: 0.65, duration: 0.5, ease: 'power2.out' }); } });
    }
    await ctx.w(200);
    const idx = await ctx.branchChoices([
      "What makes this compound? Walk me through the flywheel.",
      "I've heard enough. What's the ask?",
    ]);
    ctx.score([[1,0,3,0,0],[1,0,1,1,0]][idx]);
    if (idx === 0) await sShared_moat();
    else { ctx.setFlag('wentStraightToAsk'); await sAsk(); }
  }

  async function sShared_moat() {
    ctx.branchPath.push('moat'); ctx.setFlag('wentDeepOnMoat');
    await ctx.w(900); ctx.line('', 'tg-pl', 16);
    await ctx.ringWipeChapter('The Flywheel');
    await ctx.w(200);
    ctx.flash();
    const moatEl = ctx.line('The data is the moat.', 'tg-pl--big');
    await ctx.reveal(moatEl, {
      type: 'chars', y: 0,
      scale: () => gsap.utils.random(0.1, 0.5),
      rotation: () => gsap.utils.random(-15, 15),
      stagger: 0.05, from: 'center', duration: 0.65, ease: ctx.hasCE ? 'slam' : 'back.out(3)',
    });
    moatEl.style.position = 'relative'; moatEl.style.overflow = 'visible';
    const frogImg = ctx.decal('frog.png', 'tg-decal--bob', { right: '50px', top: '30px', w: 100, fromY: -30, fromScale: 0.3, delay: 0.3 });
    moatEl.appendChild(frogImg);
    setTimeout(() => ctx.orbitingTextRing(frogImg, '\u2736 THE DATA IS THE MOAT \u2736 THE DATA IS THE MOAT \u2736'), 900);
    await ctx.w(320);
    await ctx.reveal(ctx.line('Not the app.', 'tg-pl--dim'), {
      y: 10, stagger: 0.08, duration: 0.45, ease: ctx.hasCE ? 'hesitate' : 'power2.out',
    });
    await ctx.w(500);
    const rlistEl = await ctx.rlistReveal([
      { m: '01', t: 'More plays → sharper behavioural models' },
      { m: '02', t: 'Sharper models → more accurate profiles' },
      { m: '03', t: 'More accurate profiles → more B2B value' },
      { m: '04', t: 'More B2B value → more users → more plays' },
    ]);
    rlistEl.style.position = 'relative'; rlistEl.style.overflow = 'visible';
    await ctx.w(400);
    const noGPUsEl = ctx.line('You can\'t shortcut this with GPUs.', 'tg-pl--dim');
    await ctx.reveal(noGPUsEl, {
      y: 10, stagger: 0.028, duration: 0.34, ease: ctx.hasCE ? 'unfurl' : 'power3.out',
    });
    noGPUsEl.style.position = 'relative'; noGPUsEl.style.overflow = 'visible';
    const turtleEl = document.createElement('img');
    turtleEl.src = './assets/turtle.png';
    const TSZ = 46;
    turtleEl.style.cssText = `width:${TSZ}px;height:auto;position:absolute;left:0;top:-${TSZ - 14}px;opacity:0;pointer-events:none;`;
    noGPUsEl.appendChild(turtleEl);
    if (ctx.hasGSAP) {
      gsap.set(turtleEl, { scale: 0.1 });
      gsap.to(turtleEl, {
        opacity: 1, scale: 1, duration: 0.55, ease: 'elastic.out(1, 0.5)', delay: 0.3,
        onComplete: () => {
          const walkPx = Math.max(60, noGPUsEl.offsetWidth - TSZ);
          const stepDur = walkPx / 38;
          gsap.timeline({ repeat: -1, repeatDelay: 0.9 })
            .to(turtleEl, { x: walkPx, duration: stepDur, ease: 'none',
              modifiers: { y: () => (Math.sin(gsap.getProperty(turtleEl, 'x') * 0.18) * 3) + 'px' } })
            .to(turtleEl, { scaleX: -1, duration: 0.12, ease: 'power2.inOut' })
            .to(turtleEl, { x: 0, duration: stepDur, ease: 'none',
              modifiers: { y: () => (Math.sin(gsap.getProperty(turtleEl, 'x') * 0.18) * 3) + 'px' } })
            .to(turtleEl, { scaleX: 1, duration: 0.12, ease: 'power2.inOut' });
        },
      });
    }
    await ctx.w(200);
    await ctx.dimLines('A competitor starting today would need years of real human behavioural data across diverse emotional contexts. Trove\'s head start is the dataset — and it compounds with every tangle played.');
    await ctx.w(350);
    await ctx.dimLines('The comparable isn\'t another assessment tool. It\'s Plaid. $430M ARR from API access to data users already had. Trove is building the behavioural equivalent of that infrastructure layer.');
    const lastScrapCard = [...ctx.pitch.querySelectorAll('.tg-scrapbook-card')].pop();
    if (lastScrapCard) {
      lastScrapCard.style.position = 'relative'; lastScrapCard.style.overflow = 'visible';
      lastScrapCard.appendChild(ctx.decal('socks.png', 'tg-decal--bob', { right: '-24px', top: '32px', w: 130, fromY: -20, fromRot: 18, toRot: -10, delay: 0.15 }));
    }
    await ctx.w(700);
    await ctx.contBtn("What's the ask? →");
    await sAsk();
  }

  async function sAsk() {
    await ctx.w(900); ctx.line('', 'tg-pl', 16);
    await ctx.ringWipeChapter('The Ask');
    await ctx.w(200);
    ctx.score([1,0,1,1,0]);
    ctx.flash(true);
    const amountEl = ctx.line('<span class="tg-amount-hero">$525K</span>', 'tg-pl');
    await ctx.reveal(amountEl, {
      type: 'chars', y: 0,
      scale: () => gsap.utils.random(0.05, 0.4),
      rotation: () => gsap.utils.random(-20, 20),
      stagger: 0.07, from: 'center', duration: 0.8, ease: ctx.hasCE ? 'slam' : 'back.out(2.5)',
    });
    const heroSpan = amountEl.querySelector('.tg-amount-hero');
    if (ctx.hasGSAP && heroSpan) {
      gsap.fromTo(heroSpan, { scale: 1.14 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1.2,0.4)' });
      ctx.HAPTIC?.burst?.();
      const glyphs = ['✦','✧','✦','✧','★','✦','·','✧'];
      const rect = heroSpan.getBoundingClientRect();
      const pitchRect = ctx.pitch.getBoundingClientRect();
      for (let i = 0; i < 14; i++) {
        const sp = document.createElement('span');
        sp.className = 'tg-sparkle';
        sp.textContent = glyphs[i % glyphs.length];
        const angle = (i / 14) * Math.PI * 2;
        const dist = 55 + Math.random() * 70;
        sp.style.setProperty('--sx', `${Math.cos(angle) * dist}px`);
        sp.style.setProperty('--sy', `${Math.sin(angle) * dist}px`);
        sp.style.left = `${rect.left - pitchRect.left + rect.width / 2 + Math.random() * 30 - 15}px`;
        sp.style.top  = `${rect.top  - pitchRect.top  + rect.height / 2 + ctx.pitch.scrollTop + Math.random() * 20 - 10}px`;
        sp.style.color = i % 3 === 0 ? 'var(--trace)' : 'var(--shift)';
        sp.style.animationDelay = `${i * 0.045}s`;
        ctx.pitch.appendChild(sp);
        setTimeout(() => sp.remove(), 1600);
      }
    }
    await ctx.w(200);
    const alreadyEl = ctx.line('already in.', 'tg-pl--big');
    alreadyEl.style.cssText += 'color:var(--trace);margin-top:-4px;';
    await ctx.reveal(alreadyEl, {
      y: 16, stagger: 0.05, duration: 0.44, blur: true, ease: ctx.hasCE ? 'unfurl' : 'power3.out',
    });
    await ctx.w(800);
    await ctx.reveal(ctx.line('Betaworks, True Ventures, Slack Fund.', 'tg-pl--dim'), {
      y: 12, stagger: 0.06, duration: 0.50, ease: ctx.hasCE ? 'unfurl' : 'power3.out',
    });
    await ctx.w(350);
    await ctx.reveal(ctx.line('We\'re financing the next phase: <span class="tg-hl">100K active behavioural profiles,</span> 1–2 paid B2B pilots, <span class="tg-hl-b">retention across verticals</span> beyond dating.', 'tg-pl--med'), {
      y: 14, stagger: 0.07, duration: 0.55, blur: true, ease: ctx.hasCE ? 'unfurl' : 'power3.out',
    });
    await ctx.w(350);
    ctx.askGrid([
      { label: 'Already closed', value: '$525K', sub: 'Formation capital, SAFEs' },
      { label: 'Raising now',    value: '$1.5M',  sub: '18–25 months runway · 7 people' },
    ]);
    await ctx.w(400);
    await ctx.statsFormation([
      { n: '$525K', l: 'already in' },
      { n: '100K',  l: 'target profiles' },
      { n: '1–2',   l: 'paid B2B pilots' },
    ]);
    await ctx.w(500);
    await ctx.reveal(ctx.line('We\'re looking for investors who <span class="tg-hl">think in platforms, not products.</span> Who understand that <span class="tg-hl-b">the moat is the dataset</span> and the app is just how you fill it.', 'tg-pl--med'), {
      y: 12, stagger: 0.07, duration: 0.55, blur: true, ease: ctx.hasCE ? 'unfurl' : 'power3.out',
    });
    await ctx.w(700);
    await ctx.contBtn('See your investor profile →');
    await ctx.sRevealArchetype();
  }

  return {
    sBranch0, sAsk,
    sA1_curious, sA2_soWhat, sA2_beenTried,
    sB1_seen, sB2_b2b, sB2_dataset,
    sC1_founder, sC2_conviction,
    sShared_traction, sShared_moat,
  };
}
