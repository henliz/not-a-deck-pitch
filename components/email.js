// createEmail(ctx) — envelope UI with email capture form + replay button.
// Appended at the very end of every playthrough.

export function createEmail(ctx) {
  function emailCapture() {
    const wrap = document.createElement('div');
    wrap.className = 'tg-pl tg-env-wrap';

    // Letter: top half visible, lower half hidden by cover
    const letterWrap = document.createElement('div');
    letterWrap.className = 'tg-env-letter-wrap';
    const letterImg = document.createElement('img');
    letterImg.src = './assets/emailletter.png';
    letterImg.className = 'tg-env-letter-img';
    const letterContent = document.createElement('div');
    letterContent.className = 'tg-env-letter-content';
    letterContent.innerHTML =
      `<div class="tg-email-hero">curious?</div>` +
      `<div class="tg-email-sub">stay up to date with upcoming drops</div>` +
      `<div class="tg-email-list-lbl">first-look list — one note when it's real</div>` +
      `<div class="tg-email-form"><input class="tg-email-in" type="email" placeholder="you@somewhere.com" autocomplete="email"><button class="tg-email-send">join →</button></div>` +
      `<span class="tg-email-fine">no spam. just signal — you'll hear first when trove is ready.</span>`;
    letterWrap.append(letterImg, letterContent);
    wrap.appendChild(letterWrap);

    // Cover: absolutely anchored to the bottom of the letter
    const coverWrap = document.createElement('div');
    coverWrap.className = 'tg-env-cover-wrap';
    const coverImg = document.createElement('img');
    coverImg.src = './assets/emailcover.png';
    coverImg.className = 'tg-env-cover';
    const coverContent = document.createElement('div');
    coverContent.className = 'tg-env-cover-content';
    coverContent.innerHTML =
      `<div class="tg-email-helen">Helen Huang · Founder, Trove &nbsp;·&nbsp; <a href="mailto:helen@trove.garden" class="tg-email-helen-link">helen@trove.garden</a></div>`;
    coverWrap.append(coverImg, coverContent);
    wrap.appendChild(coverWrap);

    ctx.pitch.appendChild(wrap);
    ctx.scrollPitch();
    if (ctx.hasGSAP) gsap.from(wrap, { opacity: 0, y: 18, duration: 0.42, ease: ctx.hasCE ? 'unfurl' : 'power3.out' });

    // Replay button below the envelope
    const replayWrap = document.createElement('div');
    replayWrap.className = 'tg-pl';
    replayWrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:8px;margin-top:18px;';
    const replayCaption = document.createElement('div');
    replayCaption.style.cssText = 'font-family:var(--font-label);font-size:10px;letter-spacing:0.12em;color:rgba(34,34,34,0.38);text-align:center;';
    replayCaption.textContent = 'every playthrough reveals something different';
    const replayBtn = document.createElement('button');
    replayBtn.className = 'tg-env-replay';
    replayBtn.textContent = 'play again →';
    replayBtn.onclick = () => {
      ctx.HAPTIC.tap();
      if (ctx.hasGSAP) gsap.to(ctx.pitch, { opacity: 0, duration: 0.35, onComplete: () => window.tgInitGame?.() });
      else window.tgInitGame?.();
    };
    replayWrap.append(replayCaption, replayBtn);
    ctx.pitch.appendChild(replayWrap);

    // Submit handler
    const emailInEl   = letterContent.querySelector('.tg-email-in');
    const emailSendEl = letterContent.querySelector('.tg-email-send');
    const fineEl      = letterContent.querySelector('.tg-email-fine');
    const formEl      = letterContent.querySelector('.tg-email-form');
    const submit = () => {
      const val = emailInEl?.value?.trim();
      if (!val || !val.includes('@')) {
        ctx.HAPTIC.shatter();
        if (emailInEl) { emailInEl.style.outline = '1px solid var(--shift)'; setTimeout(() => { emailInEl.style.outline = ''; }, 1200); }
        return;
      }
      ctx.HAPTIC.notif();
      try {
        const leads = JSON.parse(localStorage.getItem('tg-leads') || '[]');
        leads.push({ email: val, archetype: ctx.getArchetype(), ts: Date.now() });
        localStorage.setItem('tg-leads', JSON.stringify(leads));
      } catch (e) {}
      if (ctx.hasGSAP) {
        gsap.to([formEl, fineEl], { opacity: 0, y: -6, duration: 0.25, stagger: 0.06 });
        setTimeout(() => {
          formEl.innerHTML = `<div style="font-family:var(--font-label);font-size:11px;color:var(--trace);letter-spacing:0.08em;padding:4px 0" id="tg-email-ok">you're on the list ✓</div>`;
          if (ctx.hasGSAP) gsap.from(formEl.querySelector('#tg-email-ok'), { opacity: 0, duration: 0.35, ease: 'power3.out' });
        }, 350);
      } else {
        formEl.textContent = 'you\'re on the list ✓';
      }
    };
    emailSendEl?.addEventListener('click', submit);
    emailInEl?.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
  }

  return { emailCapture };
}
