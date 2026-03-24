import { ARCHETYPES } from './data/archetypes.js';

// wrapTextCanvas — canvas 2d word-wrap, returns next Y after last line
export function wrapTextCanvas(ctx, text, cx, y, maxW, lh) {
  const words = text.split(' ');
  let line = '', curY = y;
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, cx, curY);
      line = word; curY += lh;
    } else { line = test; }
  }
  if (line) ctx.fillText(line, cx, curY);
  return curY + lh;
}

// generateShareCard(id, data) — draws a 900×900 bento-layout PNG canvas,
// returns the canvas element. data comes from scoring.buildRecapData().
export async function generateShareCard(id, data) {
  const arch = ARCHETYPES[id];
  const W = 900, H = 900;
  const cvs = document.createElement('canvas');
  cvs.width = W; cvs.height = H;
  const ctx = cvs.getContext('2d');

  const ARCH_COLORS = {
    cartographer: '#DBD59C', contrarian: '#88ABE3',
    architect:    '#C3D9FF', operator:   '#E8F0FF', storyteller: '#DBD59C',
  };
  const ARCH_ASSETS = {
    cartographer: 'Cartographer.png', contrarian: 'Contrarian.png',
    architect:    'Architect.png',    operator:   'Operator.png', storyteller: 'Storyteller.png',
  };

  const accentColor = ARCH_COLORS[id] || '#DBD59C';
  const BLUE  = '#88ABE3';
  const CREAM = '#F9F9F2';
  const DARK  = '#222222';
  const PAD   = 18;
  const GAP   = 10;
  const IW    = W - PAD * 2;

  // System sans stack — interpolated as template literal so the value is used, not the string "SF"
  const SF = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

  function scRoundRect(x, y, w, h, r, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    if (fill)   { ctx.fillStyle   = fill;   ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
  }

  // clipRR — sets a rounded-rect clipping region; call inside save/restore
  function clipRR(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath(); ctx.clip();
  }

  async function drawAsset(src, x, y, w, h, rotDeg = 0) {
    return new Promise(res => {
      const img = new Image();
      img.onload = () => {
        if (rotDeg !== 0) {
          ctx.save();
          ctx.translate(x + w / 2, y + h / 2);
          ctx.rotate(rotDeg * Math.PI / 180);
          ctx.drawImage(img, -w / 2, -h / 2, w, h);
          ctx.restore();
        } else { ctx.drawImage(img, x, y, w, h); }
        res();
      };
      img.onerror = res; img.src = src;
    });
  }

  async function drawAssetFit(src, x, y, w, h) {
    return new Promise(res => {
      const img = new Image();
      img.onload = () => {
        const s = Math.min(w / img.naturalWidth, h / img.naturalHeight);
        ctx.drawImage(img,
          x + (w - img.naturalWidth * s) / 2,
          y + (h - img.naturalHeight * s) / 2,
          img.naturalWidth * s, img.naturalHeight * s);
        res();
      };
      img.onerror = res; img.src = src;
    });
  }

  async function drawAssetCover(src, x, y, w, h) {
    return new Promise(res => {
      const img = new Image();
      img.onload = () => {
        const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
        const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
        ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
        res();
      };
      img.onerror = res; img.src = src;
    });
  }

  // wrapText — returns line count
  function wrapText(text, x, y, maxW, lineH) {
    const words = text.split(' '); let line = ''; const lines = [];
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = word; }
      else { line = test; }
    }
    if (line) lines.push(line);
    lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineH));
    return lines.length;
  }

  async function generateQR(url, size) {
    if (typeof QRCode === 'undefined') return null;
    return new Promise(resolve => {
      const div = document.createElement('div');
      div.style.cssText = 'position:fixed;left:-9999px;top:-9999px;';
      document.body.appendChild(div);
      new QRCode(div, { text: url, width: size, height: size,
        colorDark: '#222222', colorLight: '#F9F9F2', correctLevel: QRCode.CorrectLevel.M });
      setTimeout(() => {
        const qc = div.querySelector('canvas'), qi = div.querySelector('img');
        if (qc) { div.remove(); resolve(qc); }
        else if (qi) {
          const c = document.createElement('canvas'); c.width = size; c.height = size;
          const x = c.getContext('2d'), i = new Image();
          i.onload = () => { x.drawImage(i, 0, 0, size, size); div.remove(); resolve(c); };
          i.src = qi.src;
        } else { div.remove(); resolve(null); }
      }, 300);
    });
  }

  function setLS(val) { try { ctx.letterSpacing = val; } catch(e) {} }
  function hexRgba(hex, a) {
    const h = hex.replace('#','');
    return `rgba(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)},${a})`;
  }

  // ── Signal / recap data ──────────────────────────────────────────────────
  const recapTraits = (data && data.traits) || [];
  const sessionSigs = [];
  if (data && data.firstChoiceLabel) sessionSigs.push(`came in as a ${data.firstChoiceLabel}`);
  if (recapTraits[0]) sessionSigs.push(recapTraits[0]);
  if (data) {
    if      (data.wentDeepOnMoat)    sessionSigs.push('stayed for the flywheel');
    else if (data.wentStraightToAsk) sessionSigs.push('cut straight to the ask');
    else if (data.usedFounderPath)   sessionSigs.push('led with the founder');
    else if (data.pushedBackOnData)  sessionSigs.push('pushed back on the data');
  }
  const signals = sessionSigs.slice(0, 3);

  try {
    await Promise.all([
      document.fonts.load('900 46px "Playfair Display"'),
      document.fonts.load('400 italic 44px "Playfair Display"'),
    ]);
  } catch(e) {}

  // ── Layout constants ─────────────────────────────────────────────────────
  const HDR_H  = 56;
  const CONT_Y = PAD + HDR_H + GAP;
  const CONT_H = H - CONT_Y - PAD;
  const LC_W   = 256;
  const RC_X   = PAD + LC_W + GAP;
  const RC_W   = IW - LC_W - GAP;
  const TR     = 14;   // tile border radius
  const TP     = 16;   // tile inner padding

  const SP_L   = 340;
  const SP_R   = RC_W - SP_L - GAP;

  const LT_H   = 460;
  const LB_H   = CONT_H - LT_H - GAP;

  const T_QH   = 234;
  const T_MH   = 158;
  const T_TH   = 120;  // together tile — taller to fit larger text
  const T_HH   = 156;
  const T_FH   = CONT_H - T_QH - T_MH - T_TH - T_HH - GAP * 4;
  const T_QY   = CONT_Y;
  const T_MY   = T_QY + T_QH + GAP;
  const T_TY   = T_MY + T_MH + GAP;
  const T_HY   = T_TY + T_TH + GAP;
  const T_FY   = T_HY + T_HH + GAP;

  // ── Card background ──────────────────────────────────────────────────────
  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, W, H);

  // ── Header bar ───────────────────────────────────────────────────────────
  scRoundRect(PAD, PAD, IW, HDR_H, 8, '#1A1A1A', null);

  // Right-side metadata label
  ctx.fillStyle = hexRgba(CREAM, 0.45);
  ctx.font = `400 10px ${SF}`;
  ctx.textAlign = 'right'; ctx.textBaseline = 'top'; setLS('0.16em');
  ctx.fillText('INVESTOR ARCHETYPE · TROVE 2026', PAD + IW - TP, PAD + 10);
  setLS('0');

  // Archetype name — textAlign explicitly 'left' (reset from 'right' above)
  let nfs = 32;
  ctx.font = `900 ${nfs}px "Playfair Display", serif`;
  setLS('-0.01em');
  const hdrNameMaxW = IW * 0.60;
  if (ctx.measureText(arch.name).width > hdrNameMaxW) {
    nfs = Math.floor(nfs * hdrNameMaxW / ctx.measureText(arch.name).width);
    ctx.font = `900 ${nfs}px "Playfair Display", serif`;
  }
  ctx.fillStyle = CREAM;
  ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
  ctx.fillText(arch.name, PAD + TP, PAD + HDR_H - 10);
  setLS('0');

  // Sub tag — right-aligned
  ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
  ctx.font = `700 15px ${SF}`; setLS('0.04em');
  ctx.fillStyle = hexRgba(accentColor, 0.90);
  ctx.fillText('//', PAD + IW - TP - ctx.measureText(arch.sub).width, PAD + HDR_H - 10);
  ctx.fillStyle = BLUE;
  ctx.font = `400 15px ${SF}`;
  ctx.fillText(arch.sub, PAD + IW - TP, PAD + HDR_H - 10);
  setLS('0');

  // ── Left top: archetype image + trait pills ───────────────────────────────
  scRoundRect(PAD, CONT_Y, LC_W, LT_H, TR, '#FFFFFF', 'rgba(34,34,34,0.07)');

  // Image — clipped to top square of tile
  ctx.save();
  clipRR(PAD, CONT_Y, LC_W, LC_W, TR);
  await drawAssetCover(`./assets/${ARCH_ASSETS[id] || 'Cartographer.png'}`, PAD, CONT_Y, LC_W, LC_W);
  ctx.restore();

  // Decorative PNGs on image area — drawn before pills, clipped to image bounds
  ctx.save();
  clipRR(PAD, CONT_Y, LC_W, LC_W, TR);
  await drawAsset('./assets/starhehe.png', PAD + LC_W - 96, CONT_Y + 4,  90, 90,  14);
  await drawAsset('./assets/flower.png',   PAD + 2,         CONT_Y + 2,  84, 84, -10);
  ctx.restore();

  // Fade at image-to-pills boundary
  const imgFade = ctx.createLinearGradient(0, CONT_Y + LC_W - 50, 0, CONT_Y + LC_W + 20);
  imgFade.addColorStop(0, 'rgba(255,255,255,0)');
  imgFade.addColorStop(1, '#FFFFFF');
  ctx.fillStyle = imgFade;
  ctx.fillRect(PAD, CONT_Y + LC_W - 50, LC_W, 70);

  // Trait pills — 60px tall, 52px icons drawn at fixed size (not fit-scaled)
  const PILL_H    = 60;
  const PILL_ICON = 52;
  const PILL_GAP  = 8;
  const pillIcons = ['coin.png', 'babystar.png', 'apple.png'];
  const traitStartY = CONT_Y + LC_W + 14;

  // Clip pills to the left tile so they can't bleed
  ctx.save();
  clipRR(PAD, CONT_Y, LC_W, LT_H, TR);
  for (let i = 0; i < (arch.traits || []).slice(0, 3).length; i++) {
    const trait = arch.traits[i];
    const py = traitStartY + i * (PILL_H + PILL_GAP);
    scRoundRect(PAD + TP, py, LC_W - TP * 2, PILL_H, 10,
      hexRgba(accentColor, 0.22), hexRgba(accentColor, 0.50));
    // drawAsset (fixed size) so all icons render at the same size regardless of PNG dimensions
    await drawAsset(`./assets/${pillIcons[i]}`,
      PAD + TP + 4, py + (PILL_H - PILL_ICON) / 2, PILL_ICON, PILL_ICON);
    ctx.fillStyle = DARK;
    ctx.font = `700 13px ${SF}`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; setLS('0.10em');
    const pillTextX = PAD + TP + PILL_ICON + 4 + (LC_W - TP * 2 - PILL_ICON - 8) / 2;
    ctx.fillText(trait.toUpperCase(), pillTextX, py + PILL_H / 2);
    setLS('0');
  }
  ctx.restore();

  // ── Left bottom: personalized implication tile ────────────────────────────
  const LB_Y = CONT_Y + LT_H + GAP;
  scRoundRect(PAD, LB_Y, LC_W, LB_H, TR, '#FFFBCD', null);

  const togetherRaw =
    data.wentDeepOnMoat    ? 'You stayed for the flywheel when most people don\'t. That\'s where this gets real.' :
    data.pushedOnFounder   ? 'You pushed on the conviction. That\'s the question this company needs you to ask.' :
    data.wentB2B           ? 'You found the B2B angle before we pointed there. That\'s the conversation we want to have.' :
    data.wentDataset       ? 'You challenged who owns the data. That\'s the right instinct for this market.' :
    data.pushedBackOnData  ? 'You pushed back on the signal. Good — that means you\'ll trust it when you see the system.' :
    data.wentStraightToAsk ? 'You cut to the ask. We can work with that.' :
    data.readerSpeed === 'fast reader'        ? 'You moved fast and still found the signal. That\'s pattern recognition.' :
    data.readerSpeed === 'deep reader'        ? 'You took your time. The people who take their time tend to see further.' :
    data.firstChoiceLabel === 'signal skeptic'? 'You came in skeptical. You\'re still here. That\'s the only answer that matters.' :
    data.firstChoiceLabel === 'team reader'   ? 'You read the team first. That\'s usually right.' :
    arch.implication || (arch.together || '').replace(/<\/?strong>/g,'').replace(/<[^>]*>/g,'');

  const implPad  = TP + 4;
  const implMaxW = LC_W - implPad * 2;

  ctx.save();
  clipRR(PAD, LB_Y, LC_W, LB_H, TR);

  let curY = LB_Y + implPad + 10;

  // Primary personalised line — large italic Playfair
  ctx.fillStyle = DARK;
  ctx.font = `italic 400 22px "Playfair Display", serif`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'top'; setLS('0');
  const implLines = wrapText(togetherRaw, PAD + implPad, curY, implMaxW, 30);
  curY += implLines * 30 + 12;

  // Rule
  ctx.fillStyle = hexRgba(accentColor, 0.6);
  ctx.fillRect(PAD + implPad, curY, 32, 1.5);
  curY += 12;

  // Trait label
  if (arch.traits && arch.traits[0]) {
    ctx.fillStyle = hexRgba(DARK, 0.40);
    ctx.font = `700 10px ${SF}`;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top'; setLS('0.14em');
    ctx.fillText(arch.traits[0].toUpperCase(), PAD + implPad, curY);
    setLS('0');
  }

  // Decals — bottom corners, clipped to tile so they can't escape
  await drawAsset('./assets/turtle.png',      PAD + LC_W - 98, LB_Y + LB_H - 96,  90,  90,  12);
  await drawAsset('./assets/caterpillar.png', PAD + 2,         LB_Y + LB_H - 90,  84,  84,  -8);

  ctx.restore();

  // ── Right top: quote tile ─────────────────────────────────────────────────
  scRoundRect(RC_X, T_QY, RC_W, T_QH, TR, BLUE, null);

  ctx.save();
  clipRR(RC_X, T_QY, RC_W, T_QH, TR);

  ctx.fillStyle = DARK;
  ctx.font = `700 16px ${SF}`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'top'; setLS('0.14em');
  ctx.fillText('YOUR INSIGHT', RC_X + TP, T_QY + TP);
  setLS('0');

  ctx.fillStyle = DARK;
  ctx.font = `400 italic 38px "Playfair Display", serif`;
  setLS('-0.02em');
  wrapText(`"${arch.insight}"`, RC_X + TP, T_QY + TP + 30, RC_W - TP * 2, 48);
  setLS('0');

  // Single decal at bottom-right — quote at 38px fits ~3 lines (ending ~y+172), babystar starts below
  await drawAsset('./assets/babystar.png', RC_X + RC_W - 88, T_QY + T_QH - 86, 80, 80, -14);

  ctx.restore();

  // ── Right middle: signals tile (dark) + entry/exit stat tile (pale blue) ──
  const ST_X = RC_X + SP_L + GAP;

  // Signals tile
  scRoundRect(RC_X, T_MY, SP_L, T_MH, TR, DARK, null);

  ctx.save();
  clipRR(RC_X, T_MY, SP_L, T_MH, TR);

  ctx.fillStyle = BLUE;
  ctx.font = `700 14px ${SF}`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'top'; setLS('0.18em');
  ctx.fillText('YOUR SIGNALS', RC_X + TP, T_MY + TP);
  setLS('0');

  const allSigsRaw = (data && data.allSignals && data.allSignals.length) ? data.allSignals : signals;
  const lcLabel  = (data && data.firstChoiceLabel || '').toLowerCase();
  const lcExit   = (data && data.exitMove || '').toLowerCase();
  const traitSet = new Set((arch.traits || []).map(t => t.toLowerCase()));
  const filtered = allSigsRaw.filter(s => {
    const lc = s.toLowerCase();
    if (lc.startsWith('came in as')) return false;
    if (lcLabel && lc.includes(lcLabel)) return false;
    if (lcExit  && lc.includes(lcExit))  return false;
    if (traitSet.has(lc)) return false;
    return true;
  });
  const displaySigs = filtered.length >= 2 ? filtered.slice(0, 4) : allSigsRaw.slice(0, 4);

  ctx.font = `400 16px ${SF}`; ctx.fillStyle = CREAM; setLS('0.01em');
  displaySigs.forEach((sig, i) => {
    ctx.fillText(`— ${sig}`, RC_X + TP, T_MY + TP + 28 + i * 28);
  });
  setLS('0');

  // No decal — signals fill the full tile height, no clear zone

  ctx.restore();

  // Entry/exit stat tile (pale blue)
  scRoundRect(ST_X, T_MY, SP_R, T_MH, TR, '#C3D9FF', null);

  ctx.save();
  clipRR(ST_X, T_MY, SP_R, T_MH, TR);

  ctx.fillStyle = 'rgba(34,34,34,0.55)';
  ctx.font = `700 10px ${SF}`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'top'; setLS('0.14em');
  ctx.fillText('you came in as', ST_X + 14, T_MY + 14);
  setLS('0');
  ctx.fillStyle = DARK;
  ctx.font = `700 italic 19px "Playfair Display", serif`;
  wrapText((data && data.firstChoiceLabel) || arch.traits[0] || '—',
    ST_X + 14, T_MY + 28, SP_R - 28, 23);

  const exitY = T_MY + Math.round(T_MH / 2) + 8;
  ctx.fillStyle = 'rgba(34,34,34,0.55)';
  ctx.font = `700 10px ${SF}`;
  setLS('0.14em');
  ctx.fillText('but by the end, you', ST_X + 14, exitY);
  setLS('0');
  ctx.fillStyle = DARK;
  ctx.font = `700 italic 19px "Playfair Display", serif`;
  wrapText((data && data.exitMove) || '—', ST_X + 14, exitY + 16, SP_R - 28, 23);

  // Small coin at top-right — only the short label sits there, values are below it
  await drawAsset('./assets/coin.png', ST_X + SP_R - 68, T_MY + 6, 60, 60, -12);

  ctx.restore();

  // ── Together tile: full-width accent, large bold text ────────────────────
  scRoundRect(RC_X, T_TY, RC_W, T_TH, TR, accentColor, null);

  ctx.save();
  clipRR(RC_X, T_TY, RC_W, T_TH, TR);

  const togetherClean = (arch.together || '').replace(/<\/?strong>/g,'').replace(/<[^>]*>/g,'');
  ctx.fillStyle = 'rgba(34,34,34,0.85)';
  ctx.font = `700 22px ${SF}`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'top'; setLS('0.01em');
  wrapText(togetherClean, RC_X + TP, T_TY + TP, RC_W - TP * 2, 30);
  setLS('0');

  // No decal — together tile is 120px, text fills it; no clear zone without overlap

  ctx.restore();

  // ── Highlights row: accent-tinted left + dark right ──────────────────────
  const HL = arch.highlights || [];

  // Left highlight tile
  scRoundRect(RC_X, T_HY, SP_L, T_HH, TR, hexRgba(accentColor, 0.18), hexRgba(accentColor, 0.45));

  ctx.save();
  clipRR(RC_X, T_HY, SP_L, T_HH, TR);

  if (HL[0]) {
    ctx.fillStyle = DARK;
    ctx.font = `700 19px ${SF}`;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top'; setLS('0.01em');
    const h0l = wrapText(HL[0].head, RC_X + TP, T_HY + TP, SP_L - TP * 2, 24);
    ctx.fillStyle = 'rgba(34,34,34,0.62)';
    ctx.font = `400 14px ${SF}`;
    wrapText(HL[0].body, RC_X + TP, T_HY + TP + h0l * 24 + 8, SP_L - TP * 2, 19);
    setLS('0');
  }
  // No decal — highlight text fills the tile; bottom-right is always in the body text zone

  ctx.restore();

  // Right highlight tile
  scRoundRect(ST_X, T_HY, SP_R, T_HH, TR, DARK, null);

  ctx.save();
  clipRR(ST_X, T_HY, SP_R, T_HH, TR);

  if (HL[1]) {
    ctx.fillStyle = CREAM;
    ctx.font = `700 19px ${SF}`;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top'; setLS('0.01em');
    const h1l = wrapText(HL[1].head, ST_X + 14, T_HY + TP, SP_R - 28, 24);
    ctx.fillStyle = 'rgba(249,249,242,0.55)';
    ctx.font = `400 14px ${SF}`;
    wrapText(HL[1].body, ST_X + 14, T_HY + TP + h1l * 24 + 8, SP_R - 28, 19);
    setLS('0');
  }
  // No decal — same issue on the right highlight tile

  ctx.restore();

  // ── Footer: logo + CTA + QR ───────────────────────────────────────────────
  scRoundRect(RC_X, T_FY, RC_W, T_FH, TR, '#FFFFFF', 'rgba(34,34,34,0.08)');

  ctx.save();
  clipRR(RC_X, T_FY, RC_W, T_FH, TR);

  await drawAssetFit('./TroveLogo.png', RC_X + TP, T_FY + TP, 130, 48);
  ctx.fillStyle = 'rgba(34,34,34,0.60)';
  ctx.font = `400 15px ${SF}`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'top'; setLS('0.04em');
  ctx.fillText('see your type →', RC_X + TP, T_FY + TP + 36);
  setLS('0');
  ctx.fillStyle = 'rgba(34,34,34,0.28)';
  ctx.font = `400 12px ${SF}`;
  setLS('0.02em');
  ctx.fillText('henliz.github.io/not-a-deck-pitch', RC_X + TP, T_FY + TP + 56);
  setLS('0');

  await drawAsset('./assets/paperwhite.png',   RC_X + Math.round(RC_W * 0.44), T_FY + TP,     92, 92,  6);
  await drawAsset('./assets/bubbleblower.png', RC_X + Math.round(RC_W * 0.51), T_FY + TP - 2, 84, 84, -8);

  const QR_SZ    = Math.min(T_FH - TP * 2 - 12, 120);
  const qrCanvas = await generateQR('https://henliz.github.io/not-a-deck-pitch/', QR_SZ);
  if (qrCanvas) {
    const qrX = RC_X + RC_W - QR_SZ - TP - 6;
    const qrY = T_FY + Math.round((T_FH - QR_SZ - 12) / 2);
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.10)'; ctx.shadowBlur = 8;
    scRoundRect(qrX - 5, qrY - 5, QR_SZ + 10, QR_SZ + 20, 8, CREAM, null);
    ctx.restore();
    ctx.drawImage(qrCanvas, qrX, qrY, QR_SZ, QR_SZ);
    ctx.fillStyle = 'rgba(34,34,34,0.35)';
    ctx.font = `400 11px ${SF}`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'top'; setLS('0.08em');
    ctx.fillText('scan to play', qrX + QR_SZ / 2, qrY + QR_SZ + 5);
    setLS('0');
  }

  ctx.restore();

  // Card border
  ctx.strokeStyle = 'rgba(34,34,34,0.05)';
  ctx.lineWidth   = 1;
  ctx.strokeRect(0.5, 0.5, W - 1, H - 1);

  return cvs;
}
