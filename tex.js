// Canvas-based texture factory.
// Everything printed in the reference image (posters, labels, name plates, rugs,
// book spines) is drawn here as a 2D canvas and mapped onto flat geometry.
import * as THREE from 'three';

let MAX_ANISO = 8;
export function setMaxAnisotropy(n) { MAX_ANISO = n; }

const cache = new Map();

/**
 * Draw into an offscreen canvas and return it as a texture.
 * @param {number} w canvas width in px
 * @param {number} h canvas height in px
 * @param {(ctx: CanvasRenderingContext2D, w: number, h: number) => void} draw
 * @param {{repeat?: [number, number], key?: string}} [opts]
 */
export function canvasTex(w, h, draw, opts = {}) {
  if (opts.key && cache.has(opts.key)) return cache.get(opts.key);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = MAX_ANISO;
  if (opts.repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(opts.repeat[0], opts.repeat[1]);
  }
  if (opts.key) cache.set(opts.key, t);
  return t;
}

// ---------------------------------------------------------------- 2D helpers

export const FONT_PRINT = '"Comic Sans MS", "Segoe Print", "Bradley Hand", cursive';
export const FONT_SANS = '"Trebuchet MS", "Segoe UI", sans-serif';

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** Shrink the font size until `text` fits inside `maxWidth`. */
export function fitText(ctx, text, maxWidth, size, family, weight = 'bold') {
  let s = size;
  do {
    ctx.font = `${weight} ${s}px ${family}`;
    s -= 1;
  } while (ctx.measureText(text).width > maxWidth && s > 6);
  return s;
}

function noise(ctx, w, h, amount, alpha) {
  for (let i = 0; i < amount; i++) {
    ctx.fillStyle = `rgba(0,0,0,${Math.random() * alpha})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
  }
}

// ---------------------------------------------------------------- materials

/** Warm wood-plank floor running along one axis. */
export function floorTex() {
  return canvasTex(1024, 1024, (ctx, w, h) => {
    const planks = 8;
    const ph = h / planks;
    for (let i = 0; i < planks; i++) {
      const tone = 150 + Math.random() * 30;
      ctx.fillStyle = `rgb(${tone + 40},${tone - 10},${tone - 60})`;
      ctx.fillRect(0, i * ph, w, ph);
      // grain
      for (let g = 0; g < 26; g++) {
        ctx.strokeStyle = `rgba(90,55,25,${0.05 + Math.random() * 0.09})`;
        ctx.lineWidth = 1 + Math.random() * 2;
        const y = i * ph + Math.random() * ph;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(w * 0.3, y + 6, w * 0.6, y - 6, w, y + 2);
        ctx.stroke();
      }
      // plank seam
      ctx.strokeStyle = 'rgba(70,42,20,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, i * ph);
      ctx.lineTo(w, i * ph);
      ctx.stroke();
      // butt joints
      const jx = Math.random() * w;
      ctx.beginPath();
      ctx.moveTo(jx, i * ph);
      ctx.lineTo(jx, (i + 1) * ph);
      ctx.stroke();
    }
  }, { repeat: [3, 2], key: 'floor' });
}

/** Plain warm wood for furniture carcasses. */
export function woodTex(base = '#c99a69') {
  return canvasTex(512, 512, (ctx, w, h) => {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
    for (let g = 0; g < 90; g++) {
      ctx.strokeStyle = `rgba(120,80,40,${0.04 + Math.random() * 0.07})`;
      ctx.lineWidth = 1 + Math.random() * 3;
      const y = Math.random() * h;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(w * 0.4, y + 10, w * 0.7, y - 10, w, y);
      ctx.stroke();
    }
    noise(ctx, w, h, 900, 0.05);
  }, { key: `wood-${base}` });
}

/** Faint painted-drywall wall. */
export function wallTex(base = '#f4efe6') {
  return canvasTex(512, 512, (ctx, w, h) => {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
    noise(ctx, w, h, 4000, 0.035);
  }, { key: `wall-${base}` });
}

// ---------------------------------------------------------------- printed items

/**
 * Small printed name card, the kind taped to a cubby or desk.
 * @param {string} name
 * @param {{accent?: string, bg?: string}} [opts]
 */
export function namePlateTex(name, opts = {}) {
  const accent = opts.accent ?? '#4a5b6b';
  const bg = opts.bg ?? '#fdfcf8';
  return canvasTex(384, 128, (ctx, w, h) => {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, w - 8, h - 8);
    ctx.fillStyle = '#2b2b2b';
    const s = fitText(ctx, name, w * 0.8, 62, FONT_PRINT);
    ctx.font = `bold ${s}px ${FONT_PRINT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, w / 2, h / 2 + 2);
  }, { key: `plate-${name}-${accent}` });
}

/**
 * Big white foam-board sign with a heading, e.g. "STUDENT CUBBIES".
 * @param {string} text
 * @param {{fg?: string, bg?: string, border?: string, ratio?: number}} [opts]
 */
export function signTex(text, opts = {}) {
  const fg = opts.fg ?? '#1f2b38';
  const bg = opts.bg ?? '#fffdf7';
  const border = opts.border ?? '#c9c2b2';
  const ratio = opts.ratio ?? 0.32;
  const w = 1024;
  const h = Math.round(w * ratio);
  return canvasTex(w, h, (ctx) => {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = border;
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, w - 10, h - 10);
    ctx.fillStyle = fg;
    const s = fitText(ctx, text, w * 0.86, h * 0.6, FONT_SANS);
    ctx.font = `bold ${s}px ${FONT_SANS}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, h / 2);
  }, { key: `sign-${text}-${fg}-${bg}` });
}

/**
 * Alphabet wall card: "Aa" over a simple picture, the strip that runs along the
 * top of the back wall in the reference.
 */
export function alphabetCardTex(letter) {
  const i = letter.charCodeAt(0) - 65;
  const tints = ['#e4572e','#f2b53c','#3f8fc4','#5f9e6a','#8e5fa8','#e2718f','#39a3a3'];
  const tint = tints[i % tints.length];
  return canvasTex(192, 192, (ctx, w, h) => {
    ctx.fillStyle = '#fffdf6';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#c8bfa9';
    ctx.lineWidth = 7;
    ctx.strokeRect(3, 3, w - 6, h - 6);
    ctx.fillStyle = '#22405c';
    ctx.font = `bold 74px ${FONT_SANS}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${letter}${letter.toLowerCase()}`, w / 2, 54);
    // picture: rotate through a few primitive shapes so the strip varies
    ctx.fillStyle = tint;
    const cx = w / 2, cy = h * .68, r = 40;
    ctx.beginPath();
    switch (i % 4) {
      case 0: ctx.arc(cx, cy, r, 0, Math.PI * 2); break;
      case 1: ctx.moveTo(cx, cy - r); ctx.lineTo(cx + r, cy + r); ctx.lineTo(cx - r, cy + r); break;
      case 2: ctx.rect(cx - r * .85, cy - r * .85, r * 1.7, r * 1.7); break;
      default:
        for (let k = 0; k < 10; k++) {
          const a = -Math.PI / 2 + (k * Math.PI) / 5;
          const rr = k % 2 ? r * .45 : r;
          ctx[k ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
        }
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 4;
    ctx.stroke();
  }, { key: `alpha-${letter}` });
}

/** Bunting-style banner headline with dot flourishes either side. */
export function bannerTex(text) {
  const w = 1400, h = 260;
  return canvasTex(w, h, (ctx) => {
    ctx.fillStyle = '#fffdf6';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#d8cfb8';
    ctx.lineWidth = 12;
    ctx.strokeRect(6, 6, w - 12, h - 12);
    const dots = ['#f2b53c','#e4572e','#3f8fc4','#5f9e6a'];
    for (let s = 0; s < 2; s++) {
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = dots[i];
        ctx.beginPath();
        ctx.arc(s ? w - 90 - i * 62 : 90 + i * 62, h / 2, 20, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Alternate letter colours the way cut-out banner letters do
    const size = fitText(ctx, text, w - 420, 116, FONT_SANS);
    ctx.font = `bold ${size}px ${FONT_SANS}`;
    ctx.textBaseline = 'middle';
    const chars = [...text];
    const total = chars.reduce((a, c) => a + ctx.measureText(c).width, 0);
    let x = (w - total) / 2;
    const letterCols = ['#c0392b','#1f6f9f','#2f8f4f','#c07a1f','#7a4f9f'];
    chars.forEach((c, i) => {
      ctx.fillStyle = c === ' ' ? 'transparent' : letterCols[i % letterCols.length];
      ctx.textAlign = 'left';
      ctx.fillText(c, x, h / 2 + 6);
      x += ctx.measureText(c).width;
    });
  }, { key: `banner-${text}` });
}

/** Framed welcome poster: rainbow arcs, hearts, and the greeting. */
export function welcomeTex() {
  const w = 640, h = 800;
  return canvasTex(w, h, (ctx) => {
    ctx.fillStyle = '#fffdf6';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#2b2b2b';
    ctx.lineWidth = 26;
    ctx.strokeRect(13, 13, w - 26, h - 26);
    ctx.fillStyle = '#22405c';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ['WELCOME','TO OUR','CLASSROOM!'].forEach((line, i) => {
      const s = fitText(ctx, line, w - 140, 92, FONT_SANS);
      ctx.font = `bold ${s}px ${FONT_SANS}`;
      ctx.fillText(line, w / 2, 170 + i * 105);
    });
    // rainbow
    const bands = ['#e4572e','#f2913c','#f2c73c','#5f9e6a','#3f8fc4','#8e5fa8'];
    bands.forEach((c, i) => {
      ctx.strokeStyle = c;
      ctx.lineWidth = 26;
      ctx.beginPath();
      ctx.arc(w / 2, h * .82, 230 - i * 27, Math.PI, Math.PI * 2);
      ctx.stroke();
    });
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(w / 2, h * .82, 230 - bands.length * 27, Math.PI, Math.PI * 2);
    ctx.fill();
    // hearts in the corners
    for (const [hx, hy] of [[90, 620], [w - 90, 620]]) {
      ctx.fillStyle = '#e2718f';
      ctx.beginPath();
      ctx.moveTo(hx, hy + 18);
      ctx.bezierCurveTo(hx - 30, hy - 12, hx - 6, hy - 32, hx, hy - 12);
      ctx.bezierCurveTo(hx + 6, hy - 32, hx + 30, hy - 12, hx, hy + 18);
      ctx.fill();
    }
  }, { key: 'welcome' });
}

/** Printed classroom-rules poster: numbered list with a star per rule. */
export function rulesTex(rules) {
  const w = 640, h = 900;
  return canvasTex(w, h, (ctx) => {
    ctx.fillStyle = '#fffdf5';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#2f6f9f';
    ctx.lineWidth = 16;
    ctx.strokeRect(8, 8, w - 16, h - 16);
    ctx.fillStyle = '#1f3d57';
    ctx.font = `bold 60px ${FONT_SANS}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CLASSROOM RULES', w / 2, 76);
    const top = 150, rowH = (h - top - 40) / rules.length;
    ctx.textAlign = 'left';
    rules.forEach((r, i) => {
      const y = top + rowH * (i + .5);
      ctx.fillStyle = '#22405c';
      const s = fitText(ctx, `${i + 1}. ${r}`, w - 170, 44, FONT_PRINT);
      ctx.font = `bold ${s}px ${FONT_PRINT}`;
      wrapText(ctx, `${i + 1}. ${r}`, 48, y, w - 170, s * 1.15);
      star(ctx, w - 70, y, 22, ['#f2b53c','#3f8fc4','#e2718f','#5f9e6a','#8e5fa8','#e4572e'][i % 6]);
    });
  }, { key: 'rules' });
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = test;
  }
  lines.push(line);
  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((l, i) => ctx.fillText(l, x, startY + i * lineHeight));
}

function star(ctx, cx, cy, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * .46 : r;
    ctx[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
}

/**
 * Blue daily-calendar board: today/weather/season strip plus a month grid.
 * @param {{month:string, year:number, today:string, dateLine:string,
 *          weather:string, season:string, highlight:number, firstDow:number, days:number}} o
 */
export function calendarTex(o) {
  const w = 1100, h = 760;
  return canvasTex(w, h, (ctx) => {
    ctx.fillStyle = '#1f4e79';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#0f3251';
    ctx.lineWidth = 18;
    ctx.strokeRect(9, 9, w - 18, h - 18);

    // Title bar
    ctx.fillStyle = '#12395c';
    roundRect(ctx, 34, 30, 400, 78, 12);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 50px ${FONT_SANS}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('DAILY CALENDAR', 234, 70);
    ctx.fillStyle = '#ffd54f';
    ctx.font = `bold 58px ${FONT_PRINT}`;
    ctx.fillText(`${o.month} ${o.year}!`, 760, 70);

    // Left info strip
    const rows = [['Today is:', o.today], ['', o.dateLine], ['The Weather is:', o.weather], ['The Season is:', o.season]];
    let y = 150;
    ctx.textAlign = 'left';
    rows.forEach(([k, v]) => {
      if (k) {
        ctx.fillStyle = '#dce9f5';
        ctx.font = `bold 32px ${FONT_SANS}`;
        ctx.fillText(k, 44, y);
        y += 42;
      }
      ctx.fillStyle = '#ffffff';
      roundRect(ctx, 44, y - 26, 330, 56, 10);
      ctx.fill();
      ctx.fillStyle = '#22405c';
      const s = fitText(ctx, v, 300, 34, FONT_PRINT);
      ctx.font = `bold ${s}px ${FONT_PRINT}`;
      ctx.textAlign = 'center';
      ctx.fillText(v, 209, y + 3);
      ctx.textAlign = 'left';
      y += 88;
    });

    // Month grid
    const gx = 430, gy = 132, gw = w - gx - 46, cell = gw / 7;
    const dow = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    ctx.textAlign = 'center';
    dow.forEach((d, i) => {
      ctx.fillStyle = '#a9c8e0';
      ctx.font = `bold 28px ${FONT_SANS}`;
      ctx.fillText(d, gx + cell * (i + .5), gy + 20);
    });
    for (let d = 1; d <= o.days; d++) {
      const idx = o.firstDow + d - 1;
      const cx = gx + cell * ((idx % 7) + .5);
      const cy = gy + 54 + Math.floor(idx / 7) * cell * .82 + cell * .35;
      const isToday = d === o.highlight;
      ctx.fillStyle = isToday ? '#3fa45b' : '#f4f7fa';
      roundRect(ctx, cx - cell * .42, cy - cell * .3, cell * .84, cell * .68, 8);
      ctx.fill();
      ctx.fillStyle = isToday ? '#ffffff' : '#22405c';
      ctx.font = `bold 30px ${FONT_SANS}`;
      ctx.fillText(String(d), cx, cy + 4);
    }
  }, { key: 'calendar' });
}

/** Tall classroom-jobs chart: heading plus one job/name row per line. */
export function jobsChartTex(jobs) {
  const w = 560, h = 1180;
  return canvasTex(w, h, (ctx) => {
    ctx.fillStyle = '#fffdf6';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#7a5230';
    ctx.lineWidth = 16;
    ctx.strokeRect(8, 8, w - 16, h - 16);
    ctx.fillStyle = '#1f3d57';
    ctx.font = `bold 52px ${FONT_SANS}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CLASSROOM JOBS', w / 2, 62);
    const top = 108, rowH = (h - top - 26) / jobs.length;
    jobs.forEach(([job, name], i) => {
      const y = top + rowH * (i + .5);
      ctx.fillStyle = i % 2 ? '#f2ede0' : '#e6f0f6';
      roundRect(ctx, 26, y - rowH * .42, w - 52, rowH * .84, 6);
      ctx.fill();
      ctx.fillStyle = '#33475c';
      ctx.textAlign = 'left';
      ctx.font = `bold ${Math.min(26, rowH * .5)}px ${FONT_SANS}`;
      ctx.fillText(job, 40, y);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#b8541f';
      ctx.font = `bold ${Math.min(26, rowH * .5)}px ${FONT_PRINT}`;
      ctx.fillText(name, w - 40, y);
    });
  }, { key: 'jobs' });
}

/** Cream rug scattered with candy-coloured polka dots, on a green border. */
export function polkaRugTex() {
  return canvasTex(1024, 1024, (ctx, w, h) => {
    ctx.fillStyle = '#efe7d4';
    ctx.fillRect(0, 0, w, h);
    // border ring
    ctx.strokeStyle = '#5f9e6a';
    ctx.lineWidth = 46;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w / 2 - 26, 0, Math.PI * 2);
    ctx.stroke();
    const dots = ['#e4572e','#f2b53c','#3f8fc4','#5f9e6a','#8e5fa8','#e2718f','#39a3a3'];
    for (let i = 0; i < 130; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * (w / 2 - 90);
      const rad = 16 + Math.random() * 20;
      ctx.fillStyle = dots[i % dots.length];
      ctx.beginPath();
      ctx.arc(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r, rad, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 4;
      ctx.stroke();
    }
    noise(ctx, w, h, 3000, 0.05);
  }, { key: 'polkaRug' });
}

const FACES = [
  ['HAPPY',   '#ffd54f', 'smile'],
  ['SAD',     '#90caf9', 'frown'],
  ['EXCITED', '#ffab91', 'open'],
  ['WORRIED', '#ce93d8', 'wave'],
  ['ANGRY',   '#ef9a9a', 'frown'],
  ['TIRED',   '#a5d6a7', 'flat'],
];

function drawFace(ctx, cx, cy, r, fill, mouth) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#5d4037';
  ctx.lineWidth = r * 0.09;
  ctx.stroke();
  ctx.fillStyle = '#4e342e';
  const ey = cy - r * 0.25, ex = r * 0.36;
  if (mouth === 'flat') {
    ctx.lineWidth = r * 0.1;
    ctx.strokeStyle = '#4e342e';
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(cx + s * ex - r * 0.16, ey);
      ctx.lineTo(cx + s * ex + r * 0.16, ey);
      ctx.stroke();
    }
  } else {
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(cx + s * ex, ey, r * 0.13, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.strokeStyle = '#4e342e';
  ctx.lineWidth = r * 0.11;
  ctx.beginPath();
  if (mouth === 'smile') ctx.arc(cx, cy + r * 0.1, r * 0.42, 0.15 * Math.PI, 0.85 * Math.PI);
  else if (mouth === 'frown') ctx.arc(cx, cy + r * 0.6, r * 0.42, 1.2 * Math.PI, 1.8 * Math.PI);
  else if (mouth === 'open') { ctx.arc(cx, cy + r * 0.28, r * 0.26, 0, Math.PI * 2); }
  else if (mouth === 'wave') {
    ctx.moveTo(cx - r * 0.4, cy + r * 0.34);
    ctx.quadraticCurveTo(cx - r * 0.1, cy + r * 0.14, cx + r * 0.1, cy + r * 0.36);
    ctx.quadraticCurveTo(cx + r * 0.3, cy + r * 0.5, cx + r * 0.42, cy + r * 0.3);
  } else ctx.moveTo(cx - r * 0.35, cy + r * 0.3), ctx.lineTo(cx + r * 0.35, cy + r * 0.3);
  ctx.stroke();
}

/** "I FEEL..." emotion chart: title plus a column of labelled faces. */
export function emotionChartTex() {
  const w = 512, h = 768;
  return canvasTex(w, h, (ctx) => {
    ctx.fillStyle = '#fffdf6';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#3f6f8f';
    ctx.lineWidth = 14;
    ctx.strokeRect(7, 7, w - 14, h - 14);
    ctx.fillStyle = '#25445c';
    ctx.font = `bold 74px ${FONT_PRINT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('I FEEL...', w / 2, 78);
    const rows = FACES.length, top = 140, rowH = (h - top - 30) / rows;
    FACES.forEach(([name, fill, mouth], i) => {
      const cy = top + rowH * (i + .5);
      drawFace(ctx, 108, cy, rowH * .36, fill, mouth);
      ctx.fillStyle = '#33475c';
      const s = fitText(ctx, name, w - 220, 52, FONT_SANS);
      ctx.font = `bold ${s}px ${FONT_SANS}`;
      ctx.textAlign = 'left';
      ctx.fillText(name, 190, cy);
    });
  }, { key: 'emotionChart' });
}

/** Picture-book cover: colour block, title bars, a simple illustration shape. */
export function bookCoverTex(seed = 0) {
  const palette = ['#e4572e','#f2b53c','#3f8fc4','#5f9e6a','#8e5fa8','#e2718f','#39a3a3','#d9534f'];
  const bg = palette[seed % palette.length];
  return canvasTex(256, 320, (ctx, w, h) => {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    roundRect(ctx, 18, 18, w - 36, 62, 10);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    for (let i = 0; i < 2; i++) {
      roundRect(ctx, 34, 34 + i * 22, (w - 90) * (i ? .6 : .9), 10, 5);
      ctx.fill();
    }
    // illustration blob
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.arc(w / 2, h * .58, w * .26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = ['#ffd54f','#a5d6a7','#90caf9','#ffab91'][seed % 4];
    ctx.beginPath();
    ctx.arc(w / 2, h * .58, w * .18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    roundRect(ctx, 40, h - 66, w - 80, 34, 8);
    ctx.fill();
  }, { key: `cover-${seed}` });
}

/** Woven-fabric storage bin front, with an optional label window. */
export function binTex(label, base = '#e9e6df') {
  return canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
    // weave
    ctx.strokeStyle = 'rgba(0,0,0,0.07)';
    ctx.lineWidth = 3;
    for (let y = 0; y < h; y += 9) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    for (let x = 0; x < w; x += 9) {
      ctx.strokeStyle = 'rgba(255,255,255,0.16)';
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    if (label) {
      ctx.fillStyle = '#ffffff';
      roundRect(ctx, w * 0.1, h * 0.58, w * 0.8, h * 0.28, 8);
      ctx.fill();
      ctx.strokeStyle = '#8a93a0';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = '#2b2b2b';
      const s = fitText(ctx, label, w * 0.7, 40, FONT_PRINT);
      ctx.font = `bold ${s}px ${FONT_PRINT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, w / 2, h * 0.72);
    }
  }, { key: `bin-${label}-${base}` });
}

/**
 * Naive kid painting on white paper: sun, house, stick figures and scribbles.
 * @param {number} i variant seed
 */
export function kidArtTex(i = 0) {
  const w = 400, h = 320;
  return canvasTex(w, h, (ctx) => {
    ctx.fillStyle = '#fdfcf4';
    ctx.fillRect(0, 0, w, h);
    // paper edge shading so the sheet reads as paper, not a lit plane
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, w - 6, h - 6);
    const sky = ['#bfe3f2', '#d7ecc9', '#f5e2c0'][i % 3];
    ctx.fillStyle = sky;
    ctx.fillRect(10, 10, w - 20, h * .42);
    ctx.fillStyle = ['#a8d18a', '#c9d97a', '#9fc98c'][i % 3];
    ctx.fillRect(10, h * .68, w - 20, h * .3 - 8);

    // sun with rays
    const sx = i % 2 ? w - 78 : 76, sy = 74;
    ctx.fillStyle = '#f7cf3f';
    ctx.beginPath();
    ctx.arc(sx, sy, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f0b429';
    ctx.lineWidth = 7;
    for (let r = 0; r < 8; r++) {
      const a = (r / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(sx + Math.cos(a) * 38, sy + Math.sin(a) * 38);
      ctx.lineTo(sx + Math.cos(a) * 54, sy + Math.sin(a) * 54);
      ctx.stroke();
    }

    // house: wonky walls, triangular roof, door and one window
    const hx = i % 2 ? 70 : w - 150, hy = h * .44;
    ctx.fillStyle = '#e8a06a';
    ctx.fillRect(hx, hy, 96, 96);
    ctx.fillStyle = '#c0503c';
    ctx.beginPath();
    ctx.moveTo(hx - 12, hy);
    ctx.lineTo(hx + 48, hy - 52);
    ctx.lineTo(hx + 108, hy);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#7a4a2b';
    ctx.fillRect(hx + 36, hy + 46, 28, 50);
    ctx.fillStyle = '#bfe3f2';
    ctx.fillRect(hx + 12, hy + 16, 26, 26);
    ctx.strokeStyle = '#5c6470';
    ctx.lineWidth = 3;
    ctx.strokeRect(hx + 12, hy + 16, 26, 26);

    // stick figures holding hands
    ctx.strokeStyle = '#3b4b5c';
    ctx.lineWidth = 5;
    const figs = i % 2 ? [w / 2 + 10, w / 2 + 62] : [w / 2 - 50, w / 2 + 4];
    figs.forEach((fx, k) => {
      const fy = h * .74;
      ctx.beginPath();
      ctx.arc(fx, fy - 44, 15, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(fx, fy - 29);
      ctx.lineTo(fx, fy + 12);
      ctx.moveTo(fx - 20, fy - 12);
      ctx.lineTo(fx + 20, fy - 12);
      ctx.moveTo(fx, fy + 12);
      ctx.lineTo(fx - 16, fy + 44);
      ctx.moveTo(fx, fy + 12);
      ctx.lineTo(fx + 16, fy + 44);
      ctx.stroke();
      ctx.fillStyle = ['#e2718f', '#3f8fc4'][k % 2];
      ctx.beginPath();
      ctx.arc(fx, fy - 44, 15, Math.PI, Math.PI * 2);
      ctx.fill();
    });

    // crayon scribbles over the top
    const scribble = ['#8e5fa8', '#39a3a3', '#e4572e'];
    for (let s = 0; s < 3; s++) {
      ctx.strokeStyle = scribble[(s + i) % 3];
      ctx.lineWidth = 4;
      ctx.beginPath();
      let x = 30 + Math.random() * (w - 120), y = 30 + Math.random() * (h - 60);
      ctx.moveTo(x, y);
      for (let k = 0; k < 6; k++) {
        x += 14 + Math.random() * 22;
        ctx.quadraticCurveTo(x - 10, y + (k % 2 ? 20 : -20), x, y);
      }
      ctx.stroke();
    }
  }, { key: `kidart-${i}` });
}

/**
 * Phonics digraph card: the pair printed large with a tiny cue picture under it.
 * @param {string} text e.g. "sh"
 */
export function digraphCardTex(text) {
  const cues = { sh: '#3f8fc4', ch: '#e4572e', th: '#5f9e6a', wh: '#8e5fa8' };
  const tint = cues[text] ?? '#f2b53c';
  return canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#fffdf6';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = tint;
    ctx.lineWidth = 12;
    ctx.strokeRect(6, 6, w - 12, h - 12);
    ctx.fillStyle = '#22405c';
    const s = fitText(ctx, text, w * .66, 128, FONT_SANS);
    ctx.font = `bold ${s}px ${FONT_SANS}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, h * .36);
    // cue picture: a simple tinted shape so each card is visually distinct
    ctx.fillStyle = tint;
    const cx = w / 2, cy = h * .74, r = 34;
    ctx.beginPath();
    if (text === 'sh') {
      // shell fan
      ctx.arc(cx, cy + r * .5, r, Math.PI, Math.PI * 2);
    } else if (text === 'ch') {
      // cheese wedge
      ctx.moveTo(cx - r, cy + r * .6);
      ctx.lineTo(cx + r, cy + r * .6);
      ctx.lineTo(cx + r, cy - r * .5);
    } else if (text === 'th') {
      // thumb-up block
      ctx.roundRect(cx - r * .6, cy - r * .6, r * 1.2, r * 1.3, 8);
    } else {
      // wheel
      ctx.arc(cx, cy, r * .85, 0, Math.PI * 2);
    }
    ctx.closePath();
    ctx.fill();
    if (text === 'wh') {
      ctx.fillStyle = '#fffdf6';
      ctx.beginPath();
      ctx.arc(cx, cy, r * .3, 0, Math.PI * 2);
      ctx.fill();
    }
  }, { key: `digraph-${text}` });
}

/**
 * Printed numbers rug: a 10x10 grid of 1..100 where every column band carries its
 * own rainbow tone, plus white gridlines, a dark selvedge and a fabric-noise pass.
 */
export function numbersCarpetTex() {
  const cols = ['#1b3a8f','#2f6fd0','#159c9c','#2f9e4f','#8cbf3f',
                '#f2c53c','#ef8f2a','#e4572e','#cf2d2d','#7b4fa8'];
  const w = 1536, h = 1024;
  return canvasTex(w, h, (ctx) => {
    const pad = 34;                       // dark selvedge width
    const gw = w - pad * 2, gh = h - pad * 2;
    const cw = gw / 10, ch = gh / 10;
    ctx.fillStyle = '#231d18';
    ctx.fillRect(0, 0, w, h);
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        const x = pad + c * cw, y = pad + r * ch;
        ctx.fillStyle = cols[c];
        ctx.fillRect(x, y, cw, ch);
        // slight top-edge sheen so each cell reads as woven pile, not flat fill
        ctx.fillStyle = 'rgba(255,255,255,0.07)';
        ctx.fillRect(x, y, cw, ch * .18);
        ctx.fillStyle = '#ffffff';
        const n = String(r * 10 + c + 1);
        const s = fitText(ctx, n, cw * .55, ch * .62, FONT_SANS);
        ctx.font = `bold ${s}px ${FONT_SANS}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(n, x + cw / 2, y + ch / 2 + 2);
      }
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 4;
    for (let i = 0; i <= 10; i++) {
      ctx.beginPath();
      ctx.moveTo(pad + i * cw, pad);
      ctx.lineTo(pad + i * cw, h - pad);
      ctx.moveTo(pad, pad + i * ch);
      ctx.lineTo(w - pad, pad + i * ch);
      ctx.stroke();
    }
    ctx.strokeStyle = '#15100c';
    ctx.lineWidth = pad * 2;
    ctx.strokeRect(0, 0, w, h);
    noise(ctx, w, h, 9000, 0.11);
  }, { key: 'numbersCarpet' });
}

/** Book spine seen edge-on: cloth colour, a title bar and a smaller author bar. */
export function bookSpineTex(seed = 0) {
  const palette = ['#b23a3a','#2f6fa8','#3f8f5f','#c98a2a','#6f4f9f','#2f8f8f',
                   '#a8434f','#4a5b6b','#d0713a','#7a9c3a'];
  const bg = palette[seed % palette.length];
  return canvasTex(96, 512, (ctx, w, h) => {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    // head and tail bands
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(0, 0, w, 26);
    ctx.fillRect(0, h - 26, w, 26);
    // gilt rules
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 4;
    for (const y of [58, h - 58]) {
      ctx.beginPath();
      ctx.moveTo(10, y);
      ctx.lineTo(w - 10, y);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    roundRect(ctx, 14, h * .3, w - 28, h * .26, 8);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    for (let i = 0; i < 3; i++) {
      roundRect(ctx, 26, h * .33 + i * (h * .07), (w - 52) * (i === 2 ? .55 : .95), 9, 4);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    roundRect(ctx, 22, h * .68, w - 44, h * .07, 6);
    ctx.fill();
  }, { key: `spine-${seed}` });
}

/** Easel whiteboard: heading plus three worked sums with empty answer boxes. */
export function mathBoardTex() {
  const w = 900, h = 672;
  return canvasTex(w, h, (ctx) => {
    ctx.fillStyle = '#fdfdfa';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#c9c2b2';
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, w - 8, h - 8);
    ctx.fillStyle = '#c0392b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const s = fitText(ctx, "LET'S DO MATH!", w * .8, 96, FONT_PRINT);
    ctx.font = `bold ${s}px ${FONT_PRINT}`;
    ctx.fillText("LET'S DO MATH!", w / 2, 86);
    ctx.strokeStyle = '#3f8fc4';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(110, 140);
    ctx.lineTo(w - 110, 140);
    ctx.stroke();
    // Each problem is drawn as handwriting, with the answer left blank for a kid
    const problems = ['7 + 5 =', '12 - 3 =', '9 + 6 ='];
    problems.forEach((p, i) => {
      const y = 240 + i * 132;
      ctx.fillStyle = '#22405c';
      ctx.font = `bold 74px ${FONT_PRINT}`;
      ctx.textAlign = 'left';
      ctx.fillText(p, 150, y);
      const bx = 150 + ctx.measureText(p).width + 34;
      ctx.strokeStyle = '#5f9e6a';
      ctx.lineWidth = 7;
      roundRect(ctx, bx, y - 46, 92, 92, 10);
      ctx.stroke();
    });
  }, { key: 'mathBoard' });
}

/** White first-aid case front: red cross on a light shell. */
export function firstAidTex() {
  return canvasTex(256, 232, (ctx, w, h) => {
    ctx.fillStyle = '#f7f7f4';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#cfd4d8';
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, w - 8, h - 8);
    ctx.fillStyle = '#d0342b';
    const t = 42, L = 132;
    ctx.fillRect(w / 2 - t / 2, h / 2 - L / 2, t, L);
    ctx.fillRect(w / 2 - L / 2, h / 2 - t / 2, L, t);
    ctx.fillStyle = '#3a4652';
    ctx.font = `bold 24px ${FONT_SANS}`;
    ctx.textAlign = 'center';
    ctx.fillText('FIRST AID', w / 2, h - 22);
  }, { key: 'firstAid' });
}

/**
 * Red/white hazard tape, repeated along its length.
 * @param {number} reps how many stripe pairs to tile across the strip
 */
export function hazardTapeTex(reps = 4) {
  return canvasTex(128, 64, (ctx, w, h) => {
    ctx.fillStyle = '#fbfbf8';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#d0342b';
    // Slanted bars, drawn wide enough to still meet the edges after the skew
    for (let i = -1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 64, 0);
      ctx.lineTo(i * 64 + 32, 0);
      ctx.lineTo(i * 64 + 32 - h, h);
      ctx.lineTo(i * 64 - h, h);
      ctx.closePath();
      ctx.fill();
    }
  }, { repeat: [reps, 1], key: `hazard-${reps}` });
}
