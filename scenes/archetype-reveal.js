// createArchetypeReveal(ctx) — the finale sequence:
// recapScreen helper + sRevealArchetype (4 swipe-able overlay screens → flat pitch reveal → share card → email)

export function createArchetypeReveal(ctx) {

  // recapScreen — fullscreen overlay that slides in, runs buildFn, waits for tap, slides out
  async function recapScreen(buildFn, opts = {}) {
    if (!ctx.scene) return;

    const overlay = document.createElement('div');
    overlay.className = 'tg-recap-overlay';
    overlay.style.background = opts.bg || '#F9F9F2';
    ctx.scene.appendChild(overlay);

    const hint = document.createElement('div');
    hint.style.cssText = `
      position:absolute;bottom:22px;left:0;right:0;
      font-family:var(--font-label);font-size:10px;
      letter-spacing:0.14em;text-transform:uppercase;
      opacity:0;color:inherit;pointer-events:none;text-align:center;
    `;
    hint.textContent = 'tap to continue';
    overlay.appendChild(hint);

    if (ctx.hasGSAP) {
      const fromVars = {
        slideUp:    { y: '100%' },
        slideLeft:  { x: '-100%' },
        slideRight: { x: '100%' },
        scale:      { scale: 0.82, opacity: 0 },
        fade:       { opacity: 0 },
      }[opts.entrance || 'slideUp'] || { y: '100%' };
      await new Promise(r => gsap.from(overlay, {
        ...fromVars, duration: 0.52, ease: ctx.hasCE ? 'slam' : 'back.out(1.4)',
        clearProps: 'transform,opacity', onComplete: r,
      }));
    }

    await buildFn(overlay);

    if (ctx.hasGSAP) gsap.to(hint, { opacity: 0.38, duration: 0.4, delay: 0.6 });
    ctx.HAPTIC.card();

    await new Promise(resolve => {
      const dismiss = (e) => {
        e.preventDefault();
        overlay.removeEventListener('click', dismiss);
        overlay.removeEventListener('touchend', dismiss);
        ctx.HAPTIC.tap();

        const toVars = {
          slideUp:    { y: '-105%' },
          slideLeft:  { x: '105%' },
          slideRight: { x: '-105%' },
          scale:      { scale: 1.1, opacity: 0 },
          fade:       { opacity: 0 },
        }[opts.exit || 'slideUp'] || { y: '-105%' };

        if (ctx.hasGSAP) {
          gsap.to(overlay, {
            ...toVars, duration: 0.38, ease: 'power2.in',
            onComplete: () => { overlay.remove(); resolve(); },
          });
        } else {
          overlay.remove(); resolve();
        }
      };
      setTimeout(() => {
        overlay.addEventListener('click', dismiss);
        overlay.addEventListener('touchend', dismiss, { passive: false });
      }, opts.minHold || 900);
    });
  }

  async function sRevealArchetype() {
    window.tgAPI.setProgress(100);

    const id   = ctx.getArchetype();
    const data = ctx.buildRecapData(id);
    const arch = data.arch;

    const ARCH_BG_COLORS = {
      cartographer: '#DBD59C', contrarian: '#88ABE3',
      architect:    '#C3D9FF', operator:   '#FFFBCD', storyteller: '#DBD59C',
    };
    const ARCH_ASSETS_MAP = {
      cartographer: 'Cartographer.png', contrarian: 'Contrarian.png',
      architect:    'Architect.png',    operator:   'Operator.png', storyteller: 'Storyteller.png',
    };
    const revealBg    = ARCH_BG_COLORS[id]  || '#DBD59C';
    const revealAsset = ARCH_ASSETS_MAP[id] || 'Cartographer.png';
    const revealDark  = id === 'contrarian';

    // persistent backdrop prevents raw scene flashing between overlay transitions
    const wrapBackdrop = ctx.scene ? document.createElement('div') : null;
    if (wrapBackdrop) {
      wrapBackdrop.style.cssText = 'position:absolute;inset:0;z-index:498;background:#1C1C1E;pointer-events:none;opacity:0;';
      ctx.scene.appendChild(wrapBackdrop);
      if (ctx.hasGSAP) await new Promise(r => gsap.to(wrapBackdrop, { opacity: 1, duration: 0.22, onComplete: r }));
      else wrapBackdrop.style.opacity = '1';
    }
    ctx.pitch.style.visibility = 'hidden';

    // screen 1: session stats (dark, coin shower)
    await recapScreen(async overlay => {
      overlay.style.color = '#F9F9F2';

      const ghost = document.createElement('div');
      ghost.style.cssText = 'position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);font-family:var(--font-display);font-size:clamp(120px,34vw,180px);font-weight:900;line-height:1;color:rgba(255,255,255,0.04);pointer-events:none;user-select:none;white-space:nowrap;';
      ghost.textContent = data.pathLength;
      overlay.insertBefore(ghost, overlay.firstChild);

      if (ctx.hasGSAP) {
        for (let i = 0; i < 18; i++) {
          const coin = document.createElement('img');
          coin.src = './assets/coin.png';
          const sz = 18 + Math.random() * 14;
          coin.style.cssText = `position:absolute;width:${sz}px;height:auto;pointer-events:none;left:${Math.random()*95}%;top:-60px;opacity:0.85;`;
          overlay.insertBefore(coin, overlay.firstChild);
          gsap.to(coin, {
            y: '110vh', rotation: (Math.random() - 0.5) * 540,
            duration: 1.2 + Math.random() * 0.8, ease: 'power1.in',
            delay: Math.random() * 0.8,
            onComplete: () => coin.remove(),
          });
        }
      }

      const eyebrow = document.createElement('div');
      eyebrow.style.cssText = 'font-family:var(--font-label);font-size:11px;letter-spacing:0.18em;text-transform:uppercase;opacity:0.45;margin-bottom:14px;';
      eyebrow.textContent = 'your session · wrapped';

      const big = document.createElement('div');
      big.style.cssText = 'font-family:var(--font-display);font-size:clamp(40px,11vw,56px);font-weight:900;line-height:1.05;margin-bottom:12px;';
      big.textContent = `${data.pathLength} moves.`;

      const entryLine = document.createElement('div');
      entryLine.style.cssText = 'font-family:var(--font-body,sans-serif);font-size:15px;line-height:1.55;opacity:0.80;max-width:260px;margin-bottom:6px;';
      entryLine.innerHTML = `You came in as a <span style="color:#DBD59C;font-weight:700">${data.firstChoiceLabel}</span>.`;

      const exitLine = document.createElement('div');
      exitLine.style.cssText = 'font-family:var(--font-body,sans-serif);font-size:14px;opacity:0.55;max-width:250px;margin-bottom:16px;';
      exitLine.textContent =
        data.wentDeepOnMoat    ? 'You stayed for the flywheel.' :
        data.wentStraightToAsk ? 'You cut to the ask.' :
        data.usedFounderPath   ? 'You needed to know the founder first.' :
                                 'You followed the signal.';

      const pills = document.createElement('div');
      pills.style.cssText = 'display:flex;gap:7px;flex-wrap:wrap;max-width:270px;';
      const pillData = [
        data.readerSpeed ? data.readerSpeed : null,
        data.pushedOnFounder  ? 'dug into conviction' : null,
        data.wentB2B          ? 'went deep on B2B'   : null,
        data.wentDataset      ? 'challenged the data': null,
        data.wentDeepOnMoat   ? 'stayed for flywheel': null,
      ].filter(Boolean).slice(0, 4);
      pillData.forEach((txt, i) => {
        const p = document.createElement('div');
        p.style.cssText = 'background:rgba(249,249,242,0.12);border:1px solid rgba(249,249,242,0.22);border-radius:100px;padding:4px 11px;font-family:var(--font-label);font-size:10px;letter-spacing:0.06em;opacity:0;';
        p.textContent = txt;
        pills.appendChild(p);
        if (ctx.hasGSAP) gsap.to(p, { opacity: 1, duration: 0.3, ease: 'power2.out', delay: 0.5 + i * 0.1 });
        else p.style.opacity = '1';
      });

      const timingStat = document.createElement('div');
      timingStat.style.cssText = 'font-family:var(--font-body,sans-serif);font-size:14px;opacity:0.55;max-width:250px;margin-bottom:16px;';
      timingStat.textContent = data.avgChoiceGap
        ? `avg. ${data.avgChoiceGap}s between decisions.`
        : data.readerSpeed === 'deep reader' ? 'you read every word.' : '';

      overlay.append(eyebrow, big, entryLine, exitLine, timingStat, pills);
      if (ctx.hasGSAP) {
        [eyebrow, big, entryLine, exitLine, timingStat].forEach((el, i) => {
          gsap.from(el, { opacity: 0, y: 22, duration: 0.44, ease: 'power3.out', delay: 0.04 + i * 0.11 });
        });
      }
    }, { bg: '#1C1C1E', entrance: 'slideUp', exit: 'slideUp' });


    // screen 2: your signals (gold, fish background)
    await recapScreen(async overlay => {
      overlay.style.color = '#222222';

      if (ctx.hasGSAP) {
        for (let i = 0; i < 8; i++) {
          const fish = document.createElement('img');
          fish.src = './assets/fish.png';
          const sz = 28 + Math.random() * 8;
          fish.style.cssText = `position:absolute;width:${sz}px;height:auto;pointer-events:none;left:-60px;top:${10 + Math.random() * 75}%;opacity:0.55;`;
          overlay.insertBefore(fish, overlay.firstChild);
          const dur = 2.2 + Math.random() * 1.2;
          gsap.to(fish, { x: 'calc(100vw + 80px)', duration: dur, ease: 'none', repeat: -1, delay: i * 0.4 });
          gsap.to(fish, { y: 10 + Math.random() * 8, duration: 0.8 + Math.random() * 0.4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * 0.4 });
        }
      }

      const eyebrow = document.createElement('div');
      eyebrow.style.cssText = 'font-family:var(--font-label);font-size:11px;letter-spacing:0.16em;text-transform:uppercase;opacity:0.5;margin-bottom:10px;';
      eyebrow.textContent = 'signals trove read';

      const big = document.createElement('div');
      big.style.cssText = 'font-family:var(--font-display);font-size:clamp(20px,6vw,26px);font-weight:800;line-height:1.2;margin-bottom:10px;max-width:270px;';
      big.textContent = (data.traits[0] || 'you paid attention') + '.';

      const sub = document.createElement('div');
      sub.style.cssText = 'font-family:var(--font-body,sans-serif);font-size:13px;opacity:0.60;max-width:240px;line-height:1.55;margin-bottom:14px;';
      sub.textContent = data.traits[1] || '';

      const sigList = document.createElement('div');
      sigList.style.cssText = 'display:flex;flex-direction:column;gap:5px;width:100%;max-width:265px;';
      (data.allSignals || []).slice(0, 5).forEach((sig, i) => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;gap:8px;background:rgba(34,34,34,0.10);border-radius:8px;padding:7px 11px;font-family:var(--font-label);font-size:11px;font-weight:600;color:#222;opacity:0;';
        row.innerHTML = `<span style="color:#88ABE3;font-size:14px;">—</span> ${sig}`;
        sigList.appendChild(row);
        if (ctx.hasGSAP) gsap.fromTo(row, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.32, ease: 'power3.out', delay: 0.45 + i * 0.09 });
        else row.style.opacity = '1';
      });

      overlay.append(eyebrow, big, sub, sigList);
      if (ctx.hasGSAP) {
        [eyebrow, big, sub].forEach((el, i) => {
          gsap.from(el, { opacity: 0, y: 18, duration: 0.40, ease: 'power3.out', delay: 0.08 + i * 0.12 });
        });
      }
    }, { bg: '#DBD59C', entrance: 'slideRight', exit: 'slideLeft' });


    // screen 3: archetype image with sticker border
    await recapScreen(async overlay => {
      overlay.style.color = revealDark ? '#F9F9F2' : '#222222';
      overlay.style.justifyContent = 'flex-start';
      overlay.style.paddingTop = 'clamp(80px, 20vh, 130px)';

      ['babystar.png','starhehe.png','coin.png','apple.png'].forEach((src, i) => {
        const img = document.createElement('img');
        img.src = `./assets/${src}`;
        const sz = 16 + Math.random() * 14;
        img.style.cssText = `position:absolute;width:${sz}px;height:auto;opacity:0;pointer-events:none;left:${5+Math.random()*90}%;top:${4+Math.random()*92}%;transform:rotate(${(Math.random()-0.5)*38}deg);`;
        overlay.insertBefore(img, overlay.firstChild);
        if (ctx.hasGSAP) gsap.to(img, { opacity: 0.12 + Math.random() * 0.10, duration: 0.35, delay: 0.1 + i * 0.07 });
      });

      const eyebrow = document.createElement('div');
      eyebrow.style.cssText = `position:absolute;top:clamp(18px,5vh,32px);left:0;right:0;font-family:var(--font-label);font-size:11px;letter-spacing:0.16em;text-transform:uppercase;opacity:${revealDark?'0.60':'0.45'};text-align:center;pointer-events:none;`;
      eyebrow.textContent = 'your investor archetype';

      const frameSz = 'clamp(130px,38vw,170px)';
      const frame = document.createElement('div');
      frame.style.cssText = `position:relative;width:${frameSz};height:${frameSz};margin-bottom:18px;flex-shrink:0;`;

      const frameBg = document.createElement('div');
      frameBg.style.cssText = `position:absolute;inset:-10px;background:#FFFFFF;border-radius:18px;box-shadow:0 10px 36px rgba(0,0,0,0.18);`;

      const typeImg = document.createElement('img');
      typeImg.src = `./assets/${ARCH_ASSETS_MAP[id] || revealAsset}`;
      typeImg.style.cssText = `position:relative;z-index:1;width:100%;height:100%;object-fit:cover;border-radius:14px;display:block;`;

      frame.appendChild(frameBg);
      frame.appendChild(typeImg);

      const stickerSrcs = ['babystar.png','flower.png','starhehe.png','coin.png','lightbulb.png','socks.png'];
      const stickerPos  = [
        { top:'-17px', left:'-17px',  rot:-18, sz:28 },
        { top:'-15px', right:'-13px', rot: 14, sz:26 },
        { bottom:'-16px', left:'-15px', rot: 22, sz:24 },
        { bottom:'-18px', right:'-17px', rot:-16, sz:28 },
        { top:'32%',  left:'-20px',  rot:-10, sz:22 },
        { top:'28%',  right:'-19px', rot: 12, sz:22 },
      ];
      stickerSrcs.forEach((src, i) => {
        const d = document.createElement('img');
        d.src = `./assets/${src}`;
        const p = stickerPos[i];
        let posStr = '';
        if (p.top    !== undefined) posStr += `top:${p.top};`;
        if (p.bottom !== undefined) posStr += `bottom:${p.bottom};`;
        if (p.left   !== undefined) posStr += `left:${p.left};`;
        if (p.right  !== undefined) posStr += `right:${p.right};`;
        d.style.cssText = `position:absolute;width:${p.sz}px;height:auto;transform:rotate(${p.rot}deg) scale(0);z-index:12;pointer-events:none;${posStr}`;
        frame.appendChild(d);
        if (ctx.hasGSAP) gsap.to(d, { scale: 1, duration: 0.35, ease: 'back.out(2.5)', delay: 0.7 + i * 0.08 });
        else d.style.transform = `rotate(${p.rot}deg) scale(1)`;
      });

      const nameEl = document.createElement('div');
      nameEl.style.cssText = `font-family:var(--font-display);font-size:clamp(28px,8.5vw,40px);font-weight:900;line-height:1.05;margin-bottom:8px;letter-spacing:-0.02em;`;
      nameEl.textContent = arch.name;

      const subEl = document.createElement('div');
      subEl.style.cssText = `font-family:var(--font-label);font-size:13px;opacity:${revealDark?'0.65':'0.50'};letter-spacing:0.04em;`;
      subEl.textContent = arch.sub;

      overlay.append(eyebrow, frame, nameEl, subEl);

      if (ctx.hasGSAP) {
        gsap.from(eyebrow, { opacity: 0, y: 12, duration: 0.35, ease: 'power3.out', delay: 0.05 });
        gsap.from(frame, {
          scale: 0.08, rotation: -160, opacity: 0, duration: 1.0, ease: 'elastic.out(1,0.40)', delay: 0.1,
          onComplete: () => {
            gsap.to(frame, { y: -8, rotation: 2, duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
            ctx.orbitingTextRing(frame, `\u2736 ${arch.name.toUpperCase()} \u2736 TROVE \u2736`);
            ctx.HAPTIC.burst(); ctx.assetBurst(frame, 'celebrate', 6);
            setTimeout(() => { ctx.HAPTIC.burst(); ctx.assetBurst(frame, 'founder', 6); }, 200);
            setTimeout(() => { ctx.HAPTIC.burst(); ctx.assetBurst(frame, 'viral', 6); }, 400);
          },
        });
        if (ctx.hasScrTx) {
          gsap.set(nameEl, { opacity: 1 });
          gsap.to(nameEl, {
            duration: 1.1, delay: 0.5,
            scrambleText: { text: arch.name, chars: '!<>-_\\/[]{}—=+*^?#░▒▓ABCDEFGHIJKLMNOPQRSTUVWXYZ', revealDelay: 0.28, speed: 0.5 },
            ease: 'none',
          });
        } else {
          gsap.from(nameEl, { opacity: 0, y: 30, duration: 0.55, ease: 'back.out(2)', delay: 0.45 });
        }
        gsap.from(subEl, { opacity: 0, y: 10, duration: 0.38, ease: 'power3.out', delay: 1.2 });
      }
    }, { bg: revealBg, entrance: 'scale', exit: 'slideUp' });


    // screen 4: what this means (blue, desc + together)
    await recapScreen(async overlay => {
      overlay.style.color = '#F9F9F2';

      const eyebrow = document.createElement('div');
      eyebrow.style.cssText = 'font-family:var(--font-label);font-size:11px;letter-spacing:0.16em;text-transform:uppercase;opacity:0.55;margin-bottom:12px;';
      eyebrow.textContent = arch.name;

      const desc = document.createElement('div');
      desc.style.cssText = 'font-family:var(--font-display);font-size:clamp(13px,4vw,17px);font-weight:700;line-height:1.4;margin-bottom:12px;max-width:280px;opacity:0.90;';
      desc.textContent = arch.desc;

      const togetherCard = document.createElement('div');
      togetherCard.style.cssText = 'background:rgba(255,255,255,0.15);border-radius:12px;padding:14px 16px;font-size:13px;line-height:1.6;max-width:270px;margin-top:14px;opacity:0;';
      togetherCard.innerHTML = arch.together;

      const ctaLine = document.createElement('div');
      ctaLine.style.cssText = 'font-family:var(--font-label);font-size:11px;opacity:0;letter-spacing:0.12em;margin-top:10px;';
      ctaLine.textContent = 'ready to connect?';

      overlay.append(eyebrow, desc, togetherCard, ctaLine);
      if (ctx.hasGSAP) {
        [eyebrow, desc].forEach((el, i) => {
          gsap.from(el, { opacity: 0, y: 16, duration: 0.42, ease: 'power3.out', delay: 0.06 + i * 0.15 });
        });
        gsap.to(togetherCard, { opacity: 1, y: 0, duration: 0.38, ease: 'power3.out', delay: 0.55 });
        gsap.to(ctaLine, { opacity: 0.5, duration: 0.38, ease: 'power3.out', delay: 0.75 });
      } else { togetherCard.style.opacity = '1'; ctaLine.style.opacity = '0.5'; }
    }, { bg: '#88ABE3', entrance: 'slideUp', exit: 'fade' });

    // teardown: remove backdrop, restore pitch scroll
    if (wrapBackdrop) {
      if (ctx.hasGSAP) await new Promise(r => gsap.to(wrapBackdrop, { opacity: 0, duration: 0.25, onComplete: r }));
      wrapBackdrop.remove();
    }
    ctx.pitch.style.visibility = '';
    ctx.scrollPitchSnap(); // resets _atBottom and scrolls to bottom

    ctx.HAPTIC.burst();
    await ctx.w(200);

    // blue flash wipe back to pitch
    if (ctx.hasGSAP && ctx.scene) {
      ctx.HAPTIC.notif();
      const cover = document.createElement('div');
      cover.style.cssText = 'position:absolute;inset:0;background:#88ABE3;z-index:100;pointer-events:none;opacity:0;';
      ctx.scene.appendChild(cover);
      await new Promise(r =>
        gsap.timeline({ onComplete: r })
          .to(cover, { opacity: 1, duration: 0.22, ease: 'power2.in' })
          .to(cover, { opacity: 0, duration: 0.42, ease: 'power2.out', delay: 0.18 })
          .call(() => cover.remove())
      );
    }

    // TroveOh spins out, TroveLogo fades in
    await new Promise(resolve => {
      const wrap = document.createElement('div');
      wrap.className = 'tg-pl tg-hero-logo';
      const wordImg = document.createElement('img');
      wordImg.src = './TroveLogo.png';
      wordImg.className = 'tg-hero-word';
      wordImg.style.opacity = '0';
      const ohImg = document.createElement('img');
      ohImg.src = './TroveOh.png';
      ohImg.className = 'tg-hero-oh';
      wrap.append(wordImg, ohImg);
      const _sfAnchor = ctx.pitch.querySelector('.tg-stats-formation');
      if (_sfAnchor) {
        ctx.pitch.insertBefore(wrap, _sfAnchor);
      } else {
        ctx.pitch.appendChild(wrap);
      }
      requestAnimationFrame(() => {
        ctx.pitch.scrollTop = Math.max(0, wrap.offsetTop - ctx.pitch.clientHeight * 0.3);
      });

      let loaded = 0;
      const onLoad = () => { if (++loaded < 2) return; go(); };
      wordImg.onload = onLoad; ohImg.onload = onLoad;
      if (wordImg.complete) onLoad();
      if (ohImg.complete)   onLoad();

      function go() {
        const W           = wordImg.offsetWidth  || 88;
        const ohW         = ohImg.offsetWidth    || 24;
        const startX      = W + 14;
        const endX        = Math.round(W * 0.48 - ohW / 2);
        const totalDur    = 2100;
        const crossfadeAt = 0.62;
        const crossfadeDur= 620;
        ohImg.style.transform = `translateX(${startX}px)`;
        const ease = p => p < 0.5 ? 2*p*p : 1 - Math.pow(-2*p+2,2)/2;
        let startTime = null;
        function frame(ts) {
          if (!startTime) startTime = ts;
          const elapsed = ts - startTime;
          const p  = Math.min(1, elapsed / totalDur);
          const e  = ease(p);
          ohImg.style.transform = `translateX(${startX + (endX - startX) * e}px) rotate(${e * 720}deg)`;
          const cp = Math.max(0, Math.min(1, (elapsed - totalDur * crossfadeAt) / crossfadeDur));
          ohImg.style.opacity   = String(1 - cp);
          wordImg.style.opacity = String(cp);
          if (p < 1) requestAnimationFrame(frame);
          else { ohImg.remove(); ctx.HAPTIC.burst(); resolve(); }
        }
        requestAnimationFrame(frame);
      }
    });
    await ctx.w(500);

    // kick off share card in background
    const shareCardPromise = ctx.generateShareCard(id, data).catch(e => {
      console.warn('[Trove] Share card generation failed:', e);
      return null;
    });

    ctx.HAPTIC.card();

    const tagEl = ctx.line('your archetype', 'tg-pl--dim');
    if (ctx.hasGSAP) {
      await new Promise(r => gsap.fromTo(tagEl,
        { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out', clearProps: 'y', onComplete: r }
      ));
    }
    await ctx.w(80);

    const nameEl = ctx.line(arch.name, 'tg-p-name');
    nameEl.style.margin = '0 0 6px';
    if (ctx.hasGSAP) {
      gsap.set(nameEl, { opacity: 0 });
      gsap.set(nameEl, { opacity: 1 });
      if (ctx.hasScrTx) {
        await new Promise(r => gsap.to(nameEl, {
          duration: 1.1,
          scrambleText: { text: arch.name, chars: '!<>—\/[]{}=+*░▒▓ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', revealDelay: 0.14, speed: 0.6 },
          ease: 'none', onComplete: r,
        }));
      } else {
        await new Promise(r => gsap.fromTo(nameEl,
          { rotationX: -90, opacity: 0 }, { rotationX: 0, opacity: 1, duration: 0.55, ease: 'back.out(2)', onComplete: r }
        ));
      }
      ctx.HAPTIC.card();
      ctx.flash();
    }
    await ctx.w(120);

    const subEl = ctx.line(arch.sub, 'tg-pl--prompt');
    if (ctx.hasGSAP) {
      await new Promise(r => gsap.fromTo(subEl,
        { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power3.out', clearProps: 'y', onComplete: r }
      ));
    }
    await ctx.w(200);

    const insightEl = ctx.line(arch.insight + ' trove learned this through the tangle — every choice was signal.', 'tg-pl--med');
    if (ctx.hasGSAP) {
      await new Promise(r => gsap.fromTo(insightEl,
        { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.44, ease: 'power3.out', clearProps: 'y', onComplete: r }
      ));
    }
    await ctx.w(500);

    // share card: desaturated entrance → color, bob, export button
    const cvs = await shareCardPromise;
    const cardDataUrl = cvs ? (() => { try { return cvs.toDataURL('image/png'); } catch(e) { return null; } })() : null;

    if (cardDataUrl) {
      const imgWrap = document.createElement('div');
      imgWrap.className = 'tg-pl';
      imgWrap.style.cssText = 'position:relative;overflow:visible;padding:0;margin:8px 0 4px;';
      const shareImg = document.createElement('img');
      shareImg.src = cardDataUrl;
      shareImg.style.cssText = 'width:100%;border-radius:14px;display:block;box-shadow:0 10px 36px rgba(34,34,34,0.18);opacity:0;';
      imgWrap.appendChild(shareImg);
      ctx.pitch.appendChild(imgWrap);
      ctx.scrollPitch();

      if (ctx.hasGSAP) {
        await new Promise(r => gsap.fromTo(shareImg,
          { opacity: 0, y: 28, scale: 0.92, filter: 'saturate(0) blur(8px)' },
          { opacity: 1, y: 0, scale: 1, filter: 'saturate(0) blur(0px)',
            duration: 0.6, ease: ctx.hasCE ? 'slam' : 'back.out(2)', clearProps: 'y,scale', onComplete: r }
        ));
        gsap.to(shareImg, { filter: 'saturate(1)', duration: 1.3, ease: 'power2.out', clearProps: 'filter' });
        gsap.to(shareImg, { y: -3, rotation: 0.4, duration: 2.8, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 0.5 });
        ctx.assetBurst(imgWrap, 'celebrate', 12);
        ctx.HAPTIC.burst();
      } else {
        shareImg.style.opacity = '1';
      }
      await ctx.w(300);

      const exportBtn = document.createElement('button');
      exportBtn.className = 'tg-pl tg-share-btn-main';
      exportBtn.textContent = 'export →';
      exportBtn.style.cssText = 'display:block;width:100%;margin:0 0 20px;opacity:0;box-sizing:border-box;';
      ctx.pitch.appendChild(exportBtn);
      ctx.scrollPitch();
      if (ctx.hasGSAP) gsap.fromTo(exportBtn, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out', clearProps: 'y' });
      else exportBtn.style.opacity = '1';

      exportBtn.onclick = async () => {
        ctx.HAPTIC.tap();
        exportBtn.textContent = 'sharing…'; exportBtn.disabled = true;
        try {
          const blob = await new Promise(r => cvs.toBlob(r, 'image/png'));
          const file = new File([blob], `trove-${id}.png`, { type: 'image/png' });
          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({ title: arch.name, text: `${arch.name} — ${arch.sub}\n\ntrove.garden`, files: [file] });
          } else if (navigator.share) {
            await navigator.share({ title: arch.name, text: `${arch.name} — ${arch.sub}`, url: 'https://trove.garden' });
          } else {
            const link = document.createElement('a');
            link.download = `trove-${id}.png`; link.href = cardDataUrl; link.click();
          }
        } catch(e) {}
        exportBtn.textContent = 'export →'; exportBtn.disabled = false;
      };
    }
    await ctx.w(400);
    await ctx.w(600);

    // trove logo section break before email
    const sectionBreak = document.createElement('div');
    sectionBreak.className = 'tg-pl tg-section-break';
    sectionBreak.innerHTML = `<span class="tg-sb-rule"></span><img src="./TroveLogo.png" class="tg-sb-logo" alt="Trove"><span class="tg-sb-rule"></span>`;
    if (ctx.hasGSAP) gsap.set(sectionBreak, { opacity: 0 });
    ctx.pitch.appendChild(sectionBreak);
    ctx.scrollPitch();
    if (ctx.hasGSAP) gsap.to(sectionBreak, { opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.1 });
    else sectionBreak.style.opacity = '1';

    await ctx.w(600);
    ctx.emailCapture();
    setTimeout(() => { ctx.pitch.scrollTop = ctx.pitch.scrollHeight; }, 300);
    setTimeout(() => { ctx.pitch.scrollTop = ctx.pitch.scrollHeight; }, 900);
  }

  return { recapScreen, sRevealArchetype };
}
