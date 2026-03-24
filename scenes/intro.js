// createIntro(ctx) — the opening sequence before the branching quiz.
// beats 1-5: investor + wallet → wrong call → slot machine → xray vision
// ends by calling ctx.sBranch0() to hand off to the branching story.

export function createIntro(ctx) {
  async function runIntro() {
    window.tgAPI.setProgress(0);

    // beat 1 — "you're an investor" slams in char by char from random positions
    const investorEl = ctx.line('You\'re an<br><span class="tg-investor-word">investor.</span>', 'tg-pl--big');
    if (ctx.hasGSAP) {
      const split = new SplitText(investorEl, { type: 'chars' });
      await new Promise(r => gsap.from(split.chars, {
        opacity: 0,
        y: () => gsap.utils.random(60, 120),
        x: () => gsap.utils.random(-18, 18),
        rotation: () => gsap.utils.random(-22, 22),
        scale: () => gsap.utils.random(0.05, 0.35),
        duration: 0.85, ease: ctx.hasCE ? 'slam' : 'back.out(3)',
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
    ctx.pitch.appendChild(pairEl);
    ctx.scrollPitch();

    if (ctx.hasGSAP) {
      gsap.fromTo(investorImg,
        { opacity: 0, y: -50, rotation: 13, scale: 0.65 },
        { opacity: 1, y: 0, rotation: -3, scale: 1,
          duration: 0.88, ease: 'elastic.out(1, 0.52)', delay: 0.08 }
      );
      setTimeout(() => {
        investorImg.classList.add('tg-decal--bob');
        ctx.curveText(investorImg, 'YOU\'VE BEEN HERE BEFORE \u2736', { above: true, radius: 48, arc: 150, delay: 0.3 });
      }, 1000);

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
    await ctx.w(1300);

    // beat 2 — the wrong call
    const someoneEl = ctx.line('You made the wrong call on someone.', 'tg-pl--med', 28);
    await ctx.reveal(someoneEl, {
      y: 24, stagger: 0.07, staggerEase: 'power2.out', duration: 0.52, blur: true,
      ease: ctx.hasCE ? 'unfurl' : 'power3.out',
    });
    await ctx.w(900);

    // coin launches from wallet → fills screen → arcs down to land next to "someone."
    if (ctx.hasGSAP) {
      gsap.to(walletImg, { opacity: 0.35, scale: 0.9, duration: 0.3, ease: 'power2.in' });
    }
    await ctx.w(80);
    await ctx.coinTransition(walletImg, someoneEl);
    await ctx.w(220);

    // section break rule
    {
      const sb = document.createElement('div');
      sb.className = 'tg-pl tg-section-break';
      sb.innerHTML = `<span class="tg-sb-rule"></span>`;
      if (ctx.hasGSAP) gsap.set(sb, { opacity: 0 });
      ctx.pitch.appendChild(sb);
      ctx.scrollPitch();
      if (ctx.hasGSAP) gsap.to(sb, { opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.1 });
      else sb.style.opacity = '1';
    }
    await ctx.w(400);

    // beat 3 — slot machine of candidate names, then disintegrates
    await ctx.reveal(ctx.line('maybe they were a\u2026', 'tg-pl--dim', 28), { y: 18, duration: 0.45, blur: true });
    await ctx.w(300);

    const spinWords  = ['hire','co-founder','partner','date','friend'];
    const spinSeq    = [0,1,2,3,4,0,1,2,3,4,0,1,2];
    const spinDelays = [70,75,82,88,98,115,135,160,195,230,280,350];

    const spinEl = ctx.line(spinWords[0], 'tg-pl--big', 4);
    for (let i = 0; i < spinSeq.length; i++) {
      spinEl.textContent = spinWords[spinSeq[i]];
      ctx.HAPTIC.tap();
      if (i < spinDelays.length) await ctx.w(spinDelays[i]);
    }
    if (ctx.hasGSAP) {
      gsap.fromTo(spinEl,
        { scale: 1.18 },
        { scale: 1, duration: 0.55, ease: 'elastic.out(1, 0.52)' }
      );
      ctx.HAPTIC.burst();
    }
    await ctx.w(900);

    // sand-blows-away disintegration
    await new Promise(resolve => {
      const rect = spinEl.getBoundingClientRect();
      const pal  = ['#DBD59C','#88ABE3','#C3D9FF','#FFFBCD','#aaaaaa'];
      for (let i = 0; i < 80; i++) {
        const delay = Math.random() * 900;
        const p   = document.createElement('div');
        const sz  = 1.5 + Math.random() * 3.5;
        const col = pal[Math.floor(Math.random() * pal.length)];
        const sx  = rect.left + Math.random() * rect.width;
        const sy  = rect.top  + Math.random() * rect.height;
        const dx  = 40 + Math.random() * 110;
        const dy  = (Math.random() - 0.4) * 40;
        p.style.cssText = `position:fixed;width:${sz}px;height:${sz}px;border-radius:50%;`
          + `background:${col};left:${sx}px;top:${sy}px;pointer-events:none;z-index:9999;opacity:0;`;
        document.body.appendChild(p);
        const dur = 600 + Math.random() * 500;
        if (window.gsap) {
          gsap.fromTo(p,
            { opacity: 0.85, x: 0, y: 0 },
            { opacity: 0, x: dx, y: dy, duration: dur / 1000,
              ease: 'power1.out', delay: delay / 1000, onComplete: () => p.remove() });
        } else {
          setTimeout(() => {
            p.style.opacity = '0.85';
            p.style.transition = `transform ${dur}ms linear, opacity ${dur * 0.8}ms ease-in`;
            requestAnimationFrame(() => requestAnimationFrame(() => {
              p.style.transform = `translate(${dx}px,${dy}px)`;
              p.style.opacity = '0';
            }));
            setTimeout(() => p.remove(), dur + 80);
          }, delay);
        }
      }
      if (window.gsap) {
        gsap.to(spinEl, { opacity: 0, duration: 0.9, ease: 'power2.in', onComplete: resolve });
      } else {
        spinEl.style.transition = 'opacity 0.9s ease-in';
        spinEl.style.opacity = '0';
        setTimeout(resolve, 950);
      }
    });

    await ctx.w(300);

    // mutate spinEl in place — no new element, same DOM space
    if (window.gsap) gsap.killTweensOf(spinEl);
    spinEl.className = 'tg-pl tg-pl--med';
    spinEl.style.marginTop = '8px';
    spinEl.style.opacity = '0';
    spinEl.textContent = "it doesn\u2019t matter who \u2014 we\u2019ve all been there.";
    if (window.gsap) {
      await new Promise(r => gsap.fromTo(spinEl,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out', onComplete: r }
      ));
    } else {
      spinEl.style.transition = 'opacity 0.55s ease';
      spinEl.style.opacity = '1';
      await ctx.w(600);
    }
    await ctx.w(1000);

    // beat 4 — "What happened?" + narrative choice (no scoring — just a moment)
    ctx.flash();
    await ctx.reveal(ctx.line('What happened?', 'tg-pl--impact', 18), {
      type: 'chars', blur: false,
      y: 0,
      scale: () => gsap.utils.random(0.1, 0.5),
      rotation: () => gsap.utils.random(-30, 30),
      stagger: 0.05, from: 'center', staggerEase: 'power2.inOut',
      ease: 'back.out(3.5)', duration: 0.75,
    });
    await ctx.w(380);

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
    ctx.pitch.appendChild(choiceWrap);
    ctx.scrollPitchSnap();

    if (ctx.hasGSAP) {
      gsap.from([...choiceWrap.querySelectorAll('.tg-pitch-choice')], {
        opacity: 0,
        x: (i) => i % 2 === 0 ? 48 : -28,
        scale: 0.88,
        filter: 'blur(4px)',
        duration: 0.52,
        ease: ctx.hasCE ? 'yank' : 'back.out(2)',
        stagger: { each: 0.09, ease: 'power2.inOut' },
        clearProps: 'filter,x,scale',
      });
    }

    window._pitchChosen = false;
    await new Promise(resolve => {
      window._pitchChoose = idx => {
        if (window._pitchChosen) return;
        window._pitchChosen = true;
        const btns = [...choiceWrap.querySelectorAll('.tg-pitch-choice')];
        btns.forEach((b, i) => { b.disabled = true; if (i !== idx) ctx.disintegrate(b); });
        const sel = btns[idx];
        sel.classList.add('selected');
        if (ctx.hasGSAP) {
          gsap.to(sel, {
            scale: 1.06, duration: 0.12, ease: 'power2.out',
            onComplete: () => gsap.to(sel, { scale: 1, duration: 0.9, ease: 'elastic.out(1, 0.38)' }),
          });
        }
        window.tgAPI.setProgress(25);
        setTimeout(() => resolve(idx), 540);
      };
    });

    ctx.scrollPitch();
    await ctx.w(800);

    // beat 5 — xray vision — the core product proposition
    await ctx.reveal(ctx.line('What if you had', 'tg-pl--dim', 28), {
      y: 20, stagger: 0.07, duration: 0.42, blur: true,
      ease: ctx.hasCE ? 'unfurl' : 'power3.out',
    });
    await ctx.w(420);

    ctx.flash(true);
    const xrayEl = ctx.line('xray vision', 'tg-pl--huge');

    if (ctx.hasGSAP && ctx.hasScrTx) {
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
      const ring = document.createElement('div');
      ring.style.cssText = `position:fixed;left:50%;top:50%;width:4px;height:4px;
        margin:-2px 0 0 -2px;border-radius:50%;
        border:1px solid var(--trace);pointer-events:none;z-index:9999;`;
      document.body.appendChild(ring);
      gsap.to(ring, {
        width:'140vw', height:'140vw', marginTop:'-70vw', marginLeft:'-70vw',
        opacity:0, duration:1.1, ease:'power2.out', onComplete:()=>ring.remove(),
      });
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
    } else if (ctx.hasGSAP) {
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
      if (ctx.hasGSAP) {
        gsap.fromTo(decalGroup,
          { opacity: 0, y: 18, scale: 0.5, rotation: -10 },
          { opacity: 1, y: 0, scale: 1, rotation: 0, duration: 0.7, ease: 'elastic.out(1, 0.48)',
            onComplete: () => ctx.orbitingTextRing(bulbImg, '\u2736 XRAY VISION \u2736 BEHAVIORAL SIGNAL \u2736') }
        );
      } else {
        decalGroup.style.opacity = '1';
      }
    }

    await ctx.w(400);
    await ctx.reveal(ctx.line('for how people <span class="tg-hl">actually behave?</span>', 'tg-pl--med'), {
      y: 24, stagger: 0.065, staggerEase: 'power2.inOut', duration: 0.52, blur: true,
      ease: ctx.hasCE ? 'unfurl' : 'power3.out',
    });
    await ctx.w(1000);

    await ctx.reveal(ctx.line('Not what they say they\'ll do. Not their self-reported preferences.', 'tg-pl--dim'), {
      y: 12, stagger: 0.065, duration: 0.52, ease: ctx.hasCE ? 'unfurl' : 'power3.out',
    });
    await ctx.w(380);

    ctx.flash();
    const visionPopEl = ctx.line('', 'tg-pl--wordpop');
    await ctx.wordPop(visionPopEl, 'What they actually do.', ['#DBD59C', null, '#88ABE3', null, '#DBD59C']);
    await ctx.w(500);

    await ctx.reveal(ctx.line('Every choice in the game is <span class="tg-hl-b">a behavioural signal.</span> Aggregated, they\'re <span class="tg-hl">a fingerprint.</span>', 'tg-pl--med'), {
      y: 12, stagger: 0.065, duration: 0.52, blur: true, ease: ctx.hasCE ? 'unfurl' : 'power3.out',
    });
    ctx.assetBurst(visionPopEl, 'data', 7);
    await ctx.w(600);

    await ctx.w(1800);
    await ctx.sBranch0();
  }

  return { runIntro };
}
