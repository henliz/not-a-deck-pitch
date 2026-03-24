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

  function scRoundRect(x, y, w, h, r, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
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
        ctx.drawImage(img, x + (w - img.naturalWidth * s) / 2, y + (h - img.naturalHeight * s) / 2, img.naturalWidth * s, img.naturalHeight * s);
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
      new QRCode(div, { text: url, width: size, height: size, colorDark: '#222222', colorLight: '#F9F9F2', correctLevel: QRCode.CorrectLevel.M });
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
  const signals   = sessionSigs.slice(0, 3);
  const moveCount = (data && data.pathLength) || 0;

  try {
    await Promise.all([
      document.fonts.load('900 46px "Playfair Display"'),
      document.fonts.load('400 italic 17px "Playfair Display"'),
    ]);
  } catch(e) {}

  const SF = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif';
  const HDR_H  = 56;
  const CONT_Y = PAD + HDR_H + GAP;
  const CONT_H = H - CONT_Y - PAD;
  const LC_W   = 256;
  const RC_X   = PAD + LC_W + GAP;
  const RC_W   = IW - LC_W - GAP;
  const TR     = 14;
  const TP     = 16;
  const SP_L   = 340;
  const SP_R   = RC_W - SP_L - GAP;

  const LT_H  = 460;
  const LB_H  = CONT_H - LT_H - GAP;

  const T_QH  = 234;
  const T_MH  = 158;
  const T_TH  = 100;
  const T_HH  = 156;
  const T_FH  = CONT_H - T_QH - T_MH - T_TH - T_HH - GAP * 4;
  const T_QY  = CONT_Y;
  const T_MY  = T_QY + T_QH + GAP;
  const T_TY  = T_MY + T_MH + GAP;
  const T_HY  = T_TY + T_TH + GAP;
  const T_FY  = T_HY + T_HH + GAP;

  // Card background
  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, W, H);

  // Header: full-width dark bar
  scRoundRect(PAD, PAD, IW, HDR_H, 8, '#1A1A1A', null);
  ctx.fillStyle = hexRgba(CREAM, 0.45); ctx.font = '400 10px SF';
  ctx.textAlign = 'right'; ctx.textBaseline = 'top'; setLS('0.16em');
  ctx.fillText('INVESTOR ARCHETYPE · TROVE 2026', PAD + IW - TP, PAD + 10); setLS('0');
  let nfs = 32;
  ctx.font = `900 ${nfs}px "Playfair Display", serif`;
  setLS('-0.01em');
  const hdrNameMaxW = IW * 0.60;
  if (ctx.measureText(arch.name).width > hdrNameMaxW) {
    nfs = Math.floor(nfs * hdrNameMaxW / ctx.measureText(arch.name).width);
    ctx.font = `900 ${nfs}px "Playfair Display", serif`;
  }
  ctx.fillStyle = CREAM; ctx.textBaseline = 'bottom';
  ctx.fillText(arch.name, PAD + TP, PAD + HDR_H - 10); setLS('0');
  ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
  const subTagY = PAD + HDR_H - 10;
  const subTagText = arch.sub;
  ctx.font = '700 15px SF'; setLS('0.04em');
  const slashW = ctx.measureText('// ').width;
  const subW   = ctx.measureText(subTagText).width;
  ctx.fillStyle = hexRgba(accentColor, 0.90);
  ctx.fillText('//', PAD + IW - TP - subW, subTagY);
  ctx.fillStyle = BLUE; ctx.font = '400 15px SF';
  ctx.fillText(subTagText, PAD + IW - TP, subTagY); setLS('0');

  // Left top: archetype image cover + trait pills
  scRoundRect(PAD, CONT_Y, LC_W, LT_H, TR, '#FFFFFF', 'rgba(34,34,34,0.07)');
  ctx.save();
  clipRR(PAD, CONT_Y, LC_W, LC_W, TR);
  await drawAssetCover(`./assets/${ARCH_ASSETS[id] || 'Cartographer.png'}`, PAD, CONT_Y, LC_W, LC_W);
  ctx.restore();
  const imgFade = ctx.createLinearGradient(0, CONT_Y + LC_W - 50, 0, CONT_Y + LC_W + 20);
  imgFade.addColorStop(0, 'rgba(255,255,255,0)');
  imgFade.addColorStop(1, '#FFFFFF');
  ctx.fillStyle = imgFade; ctx.fillRect(PAD, CONT_Y + LC_W - 50, LC_W, 70);
  const traitStartY = CONT_Y + LC_W + 14;
  const pillIcons = ['coin.png', 'babystar.png', 'apple.png'];
  for (let i = 0; i < (arch.traits || []).slice(0, 3).length; i++) {
    const trait = arch.traits[i];
    const py = traitStartY + i * 48;
    scRoundRect(PAD + TP, py, LC_W - TP * 2, 38, 10, hexRgba(accentColor, 0.22), hexRgba(accentColor, 0.50));
    ctx.save(); ctx.globalAlpha = 1.0;
    await drawAssetFit(`./assets/${pillIcons[i]}`, PAD + TP + 6, py + 4, 30, 30);
    ctx.restore();
    ctx.fillStyle = DARK; ctx.font = '700 14px SF';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; setLS('0.10em');
    ctx.fillText(trait.toUpperCase(), PAD + TP + 14 + (LC_W - TP * 2 - 14) / 2, py + 19); setLS('0');
  }
  ctx.save(); ctx.globalAlpha = 1.0;
  await drawAsset('./assets/starhehe.png',  PAD + LC_W - 104, CONT_Y + 4,  100, 100,  14);
  await drawAsset('./assets/flower.png',    PAD + 2,           CONT_Y + 2,   92,  92, -10);
  ctx.restore();

  // Left bottom: behavioral implication tile
  const LB_Y = CONT_Y + LT_H + GAP;
  scRoundRect(PAD, LB_Y, LC_W, LB_H, TR, '#FFFBCD', null);
  const HL = arch.highlights || [];
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
  ctx.fillStyle = DARK; ctx.font = 'italic 22px SF';
  ctx.textAlign = 'left'; ctx.textBaseline = 'top'; setLS('0');
  const implStartY = LB_Y + TP + 14;
  const implLineCount = wrapText(togetherRaw, PAD + TP, implStartY, LC_W - TP * 2, 30);
  ctx.fillStyle = hexRgba(accentColor, 0.6);
  ctx.fillRect(PAD + TP, implStartY + implLineCount * 30 + 14, 32, 1.5);
  if (arch.traits && arch.traits[0]) {
    ctx.fillStyle = DARK; ctx.font = '700 12px SF';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top'; setLS('0.14em');
    ctx.fillText(arch.traits[0].toUpperCase(), PAD + TP, implStartY + implLineCount * 30 + 24); setLS('0');
  }
  ctx.save(); ctx.globalAlpha = 1.0;
  await drawAsset('./assets/turtle.png',      PAD + LC_W - 110, LB_Y + LB_H - 110, 104, 104,  12);
  await drawAsset('./assets/caterpillar.png', PAD + 2,          LB_Y + LB_H - 100,  96,  96,  -8);
  ctx.restore();

  // Right top: quote tile
  scRoundRect(RC_X, T_QY, RC_W, T_QH, TR, BLUE, null);
  ctx.fillStyle = DARK; ctx.font = '700 16px SF';
  ctx.textAlign = 'left'; ctx.textBaseline = 'top'; setLS('0.14em');
  ctx.fillText('YOUR INSIGHT', RC_X + TP, T_QY + TP); setLS('0');
  ctx.fillStyle = DARK; ctx.font = '400 italic 44px "Playfair Display", serif';
  setLS('-0.02em');
  wrapText(`"${arch.insight}"`, RC_X + TP, T_QY + TP + 30, RC_W - TP * 2 - 52, 52);
  setLS('0');
  ctx.save(); ctx.globalAlpha = 1.0;
  await drawAsset('./assets/babystar.png',   RC_X + RC_W - 138, T_QY + T_QH - 138, 132, 132, -14);
  ctx.restore();
  ctx.save(); ctx.globalAlpha = 1.0;
  await drawAsset('./assets/headphones.png', RC_X + RC_W - 140, T_QY + 8,        132, 132,  10);
  ctx.restore();

  // Right middle: signals tile (dark) + entry/exit stat tile (pale blue)
  const ST_X = RC_X + SP_L + GAP;
  scRoundRect(RC_X, T_MY, SP_L, T_MH, TR, DARK, null);
  ctx.fillStyle = BLUE; ctx.font = '700 14px SF';
  ctx.textAlign = 'left'; ctx.textBaseline = 'top'; setLS('0.18em');
  ctx.fillText('YOUR SIGNALS', RC_X + TP, T_MY + TP); setLS('0');
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
  const displaySigs = filtered.length >= 2 ? filtered.slice(0, 5) : allSigsRaw.slice(0, 5);
  ctx.font = '400 16px SF'; ctx.fillStyle = CREAM; setLS('0.01em');
  displaySigs.forEach((sig, i) => ctx.fillText(`— ${sig}`, RC_X + TP, T_MY + TP + 28 + i * 28));
  setLS('0');
  ctx.save(); ctx.globalAlpha = 1.0;
  await drawAsset('./assets/id.png',   RC_X + SP_L - 124, T_MY + T_MH - 124, 116, 116,  12);
  await drawAsset('./assets/fish.png', RC_X + TP,         T_MY + T_MH - 112, 104, 104,   8);
  ctx.restore();

  scRoundRect(ST_X, T_MY, SP_R, T_MH, TR, '#C3D9FF', null);
  ctx.fillStyle = 'rgba(34,34,34,0.55)'; ctx.font = '700 10px SF';
  ctx.textAlign = 'left'; ctx.textBaseline = 'top'; setLS('0.14em');
  ctx.fillText('you came in as', ST_X + 14, T_MY + 14); setLS('0');
  const entryVal = (data && data.firstChoiceLabel) || arch.traits[0] || '—';
  ctx.fillStyle = DARK; ctx.font = '700 italic 19px "Playfair Display", serif';
  wrapText(entryVal, ST_X + 14, T_MY + 28, SP_R - 28, 23);
  const exitY = T_MY + Math.round(T_MH / 2) + 8;
  ctx.fillStyle = 'rgba(34,34,34,0.55)'; ctx.font = '700 10px SF';
  setLS('0.14em'); ctx.fillText('but by the end, you', ST_X + 14, exitY); setLS('0');
  const exitVal = (data && data.exitMove) || '—';
  ctx.fillStyle = DARK; ctx.font = '700 italic 19px "Playfair Display", serif';
  wrapText(exitVal, ST_X + 14, exitY + 16, SP_R - 28, 23);
  ctx.save(); ctx.globalAlpha = 1.0;
  await drawAsset('./assets/coin.png', ST_X + SP_R - 110, T_MY + T_MH - 110, 104, 104, -12);
  ctx.restore();

  // Together tile: full-width accent
  scRoundRect(RC_X, T_TY, RC_W, T_TH, TR, accentColor, null);
  const togetherClean = (arch.together || '').replace(/<\/?strong>/g,'').replace(/<[^>]*>/g,'');
  ctx.fillStyle = 'rgba(34,34,34,0.78)'; ctx.font = '400 16px SF';
  ctx.textAlign = 'left'; ctx.textBaseline = 'top'; setLS('0.01em');
  wrapText(togetherClean, RC_X + TP, T_TY + TP, RC_W - TP * 2, 22);
  setLS('0');
  ctx.save(); ctx.globalAlpha = 1.0;
  await drawAsset('./assets/icecream.png', RC_X + RC_W - 122, T_TY + T_TH - 122, 116, 116, 10);
  await drawAsset('./assets/banana.png',   RC_X + RC_W - 106, T_TY + 2,          88,  88, -8);
  ctx.restore();

  // Highlights row: accent-tinted left + dark right
  scRoundRect(RC_X, T_HY, SP_L, T_HH, TR, hexRgba(accentColor, 0.18), hexRgba(accentColor, 0.45));
  if (HL[0]) {
    ctx.fillStyle = DARK; ctx.font = '700 19px SF';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top'; setLS('0.01em');
    const h0l = wrapText(HL[0].head, RC_X + TP, T_HY + TP, SP_L - TP * 2, 24);
    ctx.fillStyle = 'rgba(34,34,34,0.62)'; ctx.font = '400 14px SF';
    wrapText(HL[0].body, RC_X + TP, T_HY + TP + h0l * 24 + 8, SP_L - TP * 2, 19);
    setLS('0');
  }
  ctx.save(); ctx.globalAlpha = 1.0;
  await drawAsset('./assets/flowerpot.png', RC_X + SP_L - 122, T_HY + T_HH - 122, 116, 116, 16);
  ctx.restore();

  scRoundRect(ST_X, T_HY, SP_R, T_HH, TR, DARK, null);
  if (HL[1]) {
    ctx.fillStyle = CREAM; ctx.font = '700 19px SF';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top'; setLS('0.01em');
    const h1l = wrapText(HL[1].head, ST_X + 14, T_HY + TP, SP_R - 28, 24);
    ctx.fillStyle = 'rgba(249,249,242,0.55)'; ctx.font = '400 14px SF';
    wrapText(HL[1].body, ST_X + 14, T_HY + TP + h1l * 24 + 8, SP_R - 28, 19);
    setLS('0');
  }
  ctx.save(); ctx.globalAlpha = 1.0;
  await drawAsset('./assets/derpy.png', ST_X + SP_R - 110, T_HY + T_HH - 110, 104, 104, -14);
  ctx.restore();

  // Footer: logo + CTA + QR
  scRoundRect(RC_X, T_FY, RC_W, T_FH, TR, '#FFFFFF', 'rgba(34,34,34,0.08)');
  await drawAssetFit('./TroveLogo.png', RC_X + TP, T_FY + TP, 130, 48);
  ctx.fillStyle = 'rgba(34,34,34,0.60)'; ctx.font = '400 15px SF';
  ctx.textAlign = 'left'; ctx.textBaseline = 'top'; setLS('0.04em');
  ctx.fillText('see your type →', RC_X + TP, T_FY + TP + 36); setLS('0');
  ctx.fillStyle = 'rgba(34,34,34,0.28)'; ctx.font = '400 12px SF';
  setLS('0.02em');
  ctx.fillText('henliz.github.io/not-a-deck-pitch', RC_X + TP, T_FY + TP + 56); setLS('0');
  ctx.save(); ctx.globalAlpha = 1.0;
  await drawAsset('./assets/paperwhite.png',   RC_X + Math.round(RC_W * 0.44), T_FY + TP,     92, 92,  6);
  await drawAsset('./assets/bubbleblower.png', RC_X + Math.round(RC_W * 0.51), T_FY + TP - 2, 84, 84, -8);
  ctx.restore();

  const QR_SZ = Math.min(T_FH - TP * 2 - 12, 130);
  const qrCanvas = await generateQR('https://henliz.github.io/not-a-deck-pitch/', QR_SZ);
  if (qrCanvas) {
    const qrX = RC_X + RC_W - QR_SZ - TP - 6;
    const qrY = T_FY + Math.round((T_FH - QR_SZ - 12) / 2);
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.10)'; ctx.shadowBlur = 8;
    scRoundRect(qrX - 5, qrY - 5, QR_SZ + 10, QR_SZ + 20, 8, CREAM, null);
    ctx.restore();
    ctx.drawImage(qrCanvas, qrX, qrY, QR_SZ, QR_SZ);
    ctx.fillStyle = 'rgba(34,34,34,0.35)'; ctx.font = '400 11px SF';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top'; setLS('0.08em');
    ctx.fillText('scan to play', qrX + QR_SZ / 2, qrY + QR_SZ + 5); setLS('0');
  }

  ctx.strokeStyle = 'rgba(34,34,34,0.05)';
  ctx.lineWidth   = 1;
  ctx.strokeRect(0.5, 0.5, W - 1, H - 1);

  return cvs;
}
