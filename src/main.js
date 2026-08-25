import './style.css';

const CARD_SIZE = 1254;
const PREVIEW_SIZE = 627;
const FONT = '"Hind Siliguri", "Noto Sans Bengali", sans-serif';

/** Image input space — photo sits behind PNG template */
const PHOTO_SLOT = { x: 35, y: 177, w: 1183, h: 714, radius: 22 };

/** Text positions — lower in green/footer zone, on top of PNG */
const SLOT_BOTTOM = PHOTO_SLOT.y + PHOTO_SLOT.h;
const TEXT_CENTER_X = PHOTO_SLOT.x + PHOTO_SLOT.w / 2;

const LAYOUT = {
  badge: { x: 72, y: SLOT_BOTTOM - 44, h: 34, size: 44 },
  date: { x: 1120, y: SLOT_BOTTOM - 20, size: 29 },
  headline1: { y: SLOT_BOTTOM + 58, maxWidth: 1100, lineHeight: 68, size: 64 },
  headline2: { maxWidth: 1100, lineHeight: 66, size: 62, gap: 22 },
};

const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const BENGALI_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
];

const state = {
  photo: null,
  badge: 'প্রশ্নফাঁসের',
  date: '',
  headline1: 'প্রশ্নফাঁসের সুরাহা চেয়ে',
  headline2: 'দিল্লির রাজপথে বিক্ষোভকারীরা',
};

let templateImg = null;

const els = {
  photoInput: document.getElementById('photoInput'),
  badgeText: document.getElementById('badgeText'),
  dateText: document.getElementById('dateText'),
  headline1: document.getElementById('headline1'),
  headline2: document.getElementById('headline2'),
  downloadBtn: document.getElementById('downloadBtn'),
  previewCanvas: document.getElementById('previewCanvas'),
  exportCanvas: document.getElementById('exportCanvas'),
};

function toBengaliNumber(num) {
  return String(num)
    .split('')
    .map((d) => BENGALI_DIGITS[parseInt(d, 10)] ?? d)
    .join('');
}

function getTodayBengaliDate() {
  const now = new Date();
  return `${toBengaliNumber(now.getDate())} ${BENGALI_MONTHS[now.getMonth()]}, ${toBengaliNumber(now.getFullYear())}`;
}

async function loadFonts() {
  const loads = [
    document.fonts.load(`700 44px ${FONT}`),
    document.fonts.load(`600 29px ${FONT}`),
    document.fonts.load(`800 64px ${FONT}`),
    document.fonts.load(`700 62px ${FONT}`),
  ];
  await Promise.all(loads);
  await document.fonts.ready;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function setupContext(canvas, displaySize) {
  const dpr = window.devicePixelRatio || 1;
  const scale = (displaySize / CARD_SIZE) * dpr;
  canvas.width = Math.round(CARD_SIZE * scale);
  canvas.height = Math.round(CARD_SIZE * scale);
  canvas.style.width = `${displaySize}px`;
  canvas.style.height = `${displaySize}px`;

  const ctx = canvas.getContext('2d');
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  return ctx;
}

function roundRectTop(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawCoverImage(ctx, img, x, y, w, h) {
  const ir = img.width / img.height;
  const rr = w / h;
  let sw, sh, sx, sy;
  if (ir > rr) {
    sh = img.height;
    sw = sh * rr;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    sw = img.width;
    sh = sw / rr;
    sx = 0;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function snap(value) {
  return Math.round(value) + 0.5;
}

function drawTextContent(ctx) {
  const { badge, date, headline1, headline2 } = LAYOUT;

  const badgeText = state.badge.trim();
  if (badgeText) {
    ctx.font = `700 ${badge.size}px ${FONT}`;
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText(badgeText, snap(badge.x), snap(badge.y + badge.h / 2));
  }

  ctx.font = `600 ${date.size}px ${FONT}`;
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'right';
  ctx.fillText(state.date, snap(date.x), snap(date.y));

  ctx.textAlign = 'center';
  ctx.font = `800 ${headline1.size}px ${FONT}`;
  let y = headline1.y;
  for (const line of wrapText(ctx, state.headline1, headline1.maxWidth)) {
    ctx.fillStyle = '#ffffff';
    ctx.fillText(line, snap(TEXT_CENTER_X), snap(y));
    y += headline1.lineHeight;
  }

  y += headline2.gap;

  ctx.font = `700 ${headline2.size}px ${FONT}`;
  for (const line of wrapText(ctx, state.headline2, headline2.maxWidth)) {
    ctx.fillStyle = '#f5c400';
    ctx.fillText(line, snap(TEXT_CENTER_X), snap(y));
    y += headline2.lineHeight;
  }

  ctx.textAlign = 'left';
}

function renderExport(canvas) {
  if (!templateImg) return;

  canvas.width = CARD_SIZE;
  canvas.height = CARD_SIZE;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.clearRect(0, 0, CARD_SIZE, CARD_SIZE);

  if (state.photo) {
    ctx.save();
    roundRectTop(ctx, PHOTO_SLOT.x, PHOTO_SLOT.y, PHOTO_SLOT.w, PHOTO_SLOT.h, PHOTO_SLOT.radius);
    ctx.clip();
    drawCoverImage(ctx, state.photo, PHOTO_SLOT.x, PHOTO_SLOT.y, PHOTO_SLOT.w, PHOTO_SLOT.h);
    ctx.restore();
  } else {
    ctx.fillStyle = '#000000';
    ctx.fillRect(PHOTO_SLOT.x, PHOTO_SLOT.y, PHOTO_SLOT.w, PHOTO_SLOT.h);
  }

  ctx.drawImage(templateImg, 0, 0, CARD_SIZE, CARD_SIZE);
  drawTextContent(ctx);
}

function updatePreview() {
  if (!templateImg) return;

  const ctx = setupContext(els.previewCanvas, PREVIEW_SIZE);
  ctx.clearRect(0, 0, CARD_SIZE, CARD_SIZE);

  if (state.photo) {
    ctx.save();
    roundRectTop(ctx, PHOTO_SLOT.x, PHOTO_SLOT.y, PHOTO_SLOT.w, PHOTO_SLOT.h, PHOTO_SLOT.radius);
    ctx.clip();
    drawCoverImage(ctx, state.photo, PHOTO_SLOT.x, PHOTO_SLOT.y, PHOTO_SLOT.w, PHOTO_SLOT.h);
    ctx.restore();
  } else {
    ctx.fillStyle = '#000000';
    ctx.fillRect(PHOTO_SLOT.x, PHOTO_SLOT.y, PHOTO_SLOT.w, PHOTO_SLOT.h);
  }

  ctx.drawImage(templateImg, 0, 0, CARD_SIZE, CARD_SIZE);
  drawTextContent(ctx);
}

function bindInput(input, key) {
  input.addEventListener('input', () => {
    state[key] = input.value;
    updatePreview();
  });
}

async function init() {
  state.date = getTodayBengaliDate();
  els.dateText.value = state.date;

  await loadFonts();
  templateImg = await loadImage('/PRB-NEWS-Tempated.png');
  updatePreview();

  bindInput(els.badgeText, 'badge');
  bindInput(els.dateText, 'date');
  bindInput(els.headline1, 'headline1');
  bindInput(els.headline2, 'headline2');

  els.photoInput.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    state.photo = await loadImage(URL.createObjectURL(file));
    updatePreview();
  });

  els.downloadBtn.addEventListener('click', async () => {
    els.downloadBtn.disabled = true;
    els.downloadBtn.textContent = 'তৈরি হচ্ছে...';
    try {
      await loadFonts();
      renderExport(els.exportCanvas);
      const link = document.createElement('a');
      link.download = `prb-news-card-${Date.now()}.png`;
      link.href = els.exportCanvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error(err);
      alert('ডাউনলোড ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      els.downloadBtn.disabled = false;
      els.downloadBtn.textContent = 'PNG ডাউনলোড';
    }
  });
}

init();
