// Canvas textures for the reading nook: the window view, its valance, cork
// board, and the three printed posters. Kept separate from tex.js so the nook
// can be edited without touching the shared texture library.
import { canvasTex, roundRect, fitText, FONT_PRINT, FONT_SANS } from './tex.js';

/**
 * Bright out-of-window view: sky, sunlit foliage, a hint of ground. Used as an
 * emissive plane behind the window frame, so the wall itself stays solid.
 */
export function windowViewTex() {
  return canvasTex(512, 640, (ctx, w, h) => {
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#dff0fb');
    sky.addColorStop(.55, '#f3f7e9');
    sky.addColorStop(1, '#e8efd6');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    const greens = ['#cfe0a8', '#bcd493', '#a8c880', '#d8e6bb'];
    for (let i = 0; i < 70; i++) {
      ctx.fillStyle = greens[i % greens.length];
      ctx.globalAlpha = .55 + Math.random() * .35;
      ctx.beginPath();
      ctx.arc(Math.random() * w, h * .12 + Math.random() * h * .6,
        30 + Math.random() * 70, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#a08a6a';
    ctx.fillRect(w * .58, h * .45, 26, h * .4);
    ctx.fillStyle = '#c3cf9a';
    ctx.fillRect(0, h * .82, w, h * .18);
    // bloom wash so it reads as backlit daylight
    const bloom = ctx.createRadialGradient(w * .35, h * .3, 10, w * .35, h * .3, w * .8);
    bloom.addColorStop(0, 'rgba(255,255,255,0.75)');
    bloom.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = bloom;
    ctx.fillRect(0, 0, w, h);
  }, { key: 'windowView' });
}

/** Sheer gathered valance: warm peach with vertical pleat shading. */
export function valanceTex() {
  return canvasTex(768, 256, (ctx, w, h) => {
    ctx.fillStyle = '#f0c98a';
    ctx.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 16) {
      ctx.fillStyle = `rgba(150,100,50,${0.10 + 0.14 * Math.abs(Math.sin(x * .09))})`;
      ctx.fillRect(x, 0, 9, h);
      ctx.fillStyle = 'rgba(255,245,225,0.28)';
      ctx.fillRect(x + 9, 0, 5, h);
    }
    const hem = ctx.createLinearGradient(0, h * .6, 0, h);
    hem.addColorStop(0, 'rgba(0,0,0,0)');
    hem.addColorStop(1, 'rgba(120,80,40,0.35)');
    ctx.fillStyle = hem;
    ctx.fillRect(0, h * .6, w, h * .4);
    ctx.fillStyle = 'rgba(120,80,40,0.22)';
    ctx.fillRect(0, 0, w, 22);
  }, { key: 'valance' });
}

/** Cork sheet for pin boards. */
export function corkTex() {
  return canvasTex(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#d8b183';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 5200; i++) {
      ctx.fillStyle = Math.random() > .5 ? 'rgba(120,80,45,0.30)' : 'rgba(255,235,205,0.30)';
      ctx.beginPath();
      ctx.ellipse(Math.random() * w, Math.random() * h,
        2 + Math.random() * 5, 1 + Math.random() * 3, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  }, { key: 'cork' });
}

/**
 * One original cartoon character drawn from primitives, so nothing here copies
 * an existing franchise design.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx head centre x
 * @param {number} cy head centre y
 * @param {number} r head radius
 * @param {number} seed picks colour, ear shape and arm pose
 */
export function drawCharacter(ctx, cx, cy, r, seed) {
  const skins = ['#f2b53c', '#e4886b', '#8ec6e8', '#a9d18e', '#c9a2d8', '#e88ca8', '#7fc6bb'];
  const skin = skins[seed % skins.length];
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.ellipse(cx, cy + r * 1.5, r * .95, r * 1.15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = skin;
  ctx.lineWidth = r * .3;
  ctx.lineCap = 'round';
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx + s * r * .8, cy + r * 1.3);
    ctx.lineTo(cx + s * r * 1.35, cy + r * (seed % 2 ? .8 : 1.9));
    ctx.stroke();
  }
  // ears: round, pointed or floppy depending on the seed
  ctx.fillStyle = skin;
  for (const s of [-1, 1]) {
    ctx.beginPath();
    if (seed % 3 === 0) ctx.arc(cx + s * r * .78, cy - r * .72, r * .42, 0, Math.PI * 2);
    else if (seed % 3 === 1) {
      ctx.moveTo(cx + s * r * .5, cy - r * .85);
      ctx.lineTo(cx + s * r * 1.0, cy - r * 1.7);
      ctx.lineTo(cx + s * r * .95, cy - r * .55);
    } else ctx.ellipse(cx + s * r * .95, cy - r * .1, r * .28, r * .6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(90,60,35,0.5)';
  ctx.lineWidth = Math.max(2, r * .07);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(cx + s * r * .36, cy - r * .12, r * .26, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#3b2a20';
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(cx + s * r * .36, cy - r * .1, r * .13, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = '#3b2a20';
  ctx.lineWidth = Math.max(2, r * .09);
  ctx.beginPath();
  ctx.arc(cx, cy + r * .18, r * .34, .12 * Math.PI, .88 * Math.PI);
  ctx.stroke();
}

const EMOTIONS = [
  ['JOY', '#f2c53c', 'smile'],
  ['SADNESS', '#5f9ed6', 'frown'],
  ['FEAR', '#9b8ed6', 'open'],
  ['ANGER', '#e0563f', 'angry'],
  ['CALM', '#6fbf9a', 'flat'],
];

/** "I FEEL..." poster: five labelled emotion faces, three up and two below. */
export function feelingsPosterTex() {
  const w = 900, h = 1120;
  return canvasTex(w, h, (ctx) => {
    ctx.fillStyle = '#fffdf6';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#2f6f9f';
    ctx.lineWidth = 22;
    ctx.strokeRect(11, 11, w - 22, h - 22);
    ctx.fillStyle = '#1f4e79';
    ctx.font = `bold 118px ${FONT_PRINT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('I FEEL...', w / 2, 110);
    const place = [[.2, .34], [.5, .34], [.8, .34], [.34, .72], [.66, .72]];
    EMOTIONS.forEach(([name, col, mood], i) => {
      const cx = w * place[i][0], cy = h * place[i][1], r = 108;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(60,40,20,0.35)';
      ctx.lineWidth = 8;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(cx + s * 40, cy - 26, 28, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#33251c';
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(cx + s * 40, cy - 22, 14, 0, Math.PI * 2);
        ctx.fill();
      }
      if (mood === 'angry') {
        ctx.strokeStyle = '#33251c';
        ctx.lineWidth = 12;
        for (const s of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(cx + s * 16, cy - 66);
          ctx.lineTo(cx + s * 66, cy - 44);
          ctx.stroke();
        }
      }
      ctx.strokeStyle = '#33251c';
      ctx.lineWidth = 13;
      ctx.beginPath();
      if (mood === 'smile') ctx.arc(cx, cy + 18, 52, .12 * Math.PI, .88 * Math.PI);
      else if (mood === 'frown') ctx.arc(cx, cy + 84, 52, 1.15 * Math.PI, 1.85 * Math.PI);
      else if (mood === 'open') ctx.ellipse(cx, cy + 46, 26, 34, 0, 0, Math.PI * 2);
      else if (mood === 'angry') ctx.arc(cx, cy + 78, 46, 1.1 * Math.PI, 1.9 * Math.PI);
      else { ctx.moveTo(cx - 44, cy + 44); ctx.lineTo(cx + 44, cy + 44); }
      ctx.stroke();
      ctx.fillStyle = '#22405c';
      const s = fitText(ctx, name, 250, 56, FONT_SANS);
      ctx.font = `bold ${s}px ${FONT_SANS}`;
      ctx.fillText(name, cx, cy + r + 52);
    });
  }, { key: 'feelingsPoster' });
}

/** Classroom-rules chart with an original character beside each rule. */
export function characterRulesTex(rules) {
  const w = 820, h = 1080;
  return canvasTex(w, h, (ctx) => {
    ctx.fillStyle = '#fffdf6';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#c0392b';
    ctx.lineWidth = 20;
    ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.fillStyle = '#1f3d57';
    ctx.font = `bold 84px ${FONT_SANS}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CLASSROOM', w / 2, 86);
    ctx.fillText('RULES', w / 2, 168);
    const top = 240, rowH = (h - top - 40) / rules.length;
    rules.forEach((text, i) => {
      const y = top + rowH * (i + .5);
      ctx.fillStyle = i % 2 ? '#f4eee0' : '#e9f1f6';
      roundRect(ctx, 34, y - rowH * .44, w - 68, rowH * .88, 12);
      ctx.fill();
      drawCharacter(ctx, 116, y - rowH * .1, rowH * .2, i);
      ctx.fillStyle = '#2b4256';
      ctx.textAlign = 'left';
      const s = fitText(ctx, text, w - 250, 44, FONT_PRINT);
      ctx.font = `bold ${s}px ${FONT_PRINT}`;
      ctx.fillText(text, 210, y);
      ctx.textAlign = 'center';
    });
  }, { key: 'characterRules' });
}

/** Dark inspirational quote poster with a castle silhouette. */
export function quotePosterTex(lines, attribution) {
  const w = 720, h = 980;
  return canvasTex(w, h, (ctx) => {
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#122d4d');
    bg.addColorStop(1, '#0b1c31');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 130; i++) {
      ctx.fillStyle = `rgba(255,255,255,${.15 + Math.random() * .5})`;
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h * .8, Math.random() * 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#f4f7fb';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    lines.forEach((l, i) => {
      const s = fitText(ctx, l, w - 120, 72, FONT_SANS);
      ctx.font = `bold ${s}px ${FONT_SANS}`;
      ctx.fillText(l, 60, 150 + i * 84);
    });
    ctx.fillStyle = '#b9c9dc';
    ctx.font = `italic 42px ${FONT_PRINT}`;
    ctx.fillText(attribution, 60, 150 + lines.length * 84 + 40);

    // castle silhouette: a keep with three towers under conical roofs
    ctx.fillStyle = 'rgba(120,160,200,0.55)';
    const base = h * .88, keepW = w * .42, keepX = (w - keepW) / 2;
    ctx.fillRect(keepX, base - 150, keepW, 150);
    [[keepX - 44, 250], [keepX + keepW - 20, 250], [w / 2 - 34, 330]].forEach(([tx, th]) => {
      ctx.fillRect(tx, base - th, 68, th);
      ctx.beginPath();
      ctx.moveTo(tx - 12, base - th);
      ctx.lineTo(tx + 34, base - th - 92);
      ctx.lineTo(tx + 80, base - th);
      ctx.closePath();
      ctx.fill();
    });
    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    ctx.fillRect(0, base, w, h - base);
  }, { key: `quote-${attribution}` });
}
