import './style.css';

const CARD_SIZE = 1200;
const PREVIEW_SIZE = 600;
const FONT = '"Hind Siliguri", "Noto Sans Bengali", sans-serif';

/** Photo cutout — sits behind tou.png transparent window */
const PHOTO_SLOT = { x: 427, y: 425, w: 348, h: 413, radius: 30 };

/** Name text — centered on the red pill below the photo */
const NAME = {
  x: 309,
  y: 869,
  w: 586,
  h: 70,
  size: 32,
  minSize: 18,
  color: '#ffffff',
};

const state = {
  photo: null,
  name: '',
};

let templateImg = null;

const els = {
  photoInput: document.getElementById('photoInput'),
  nameText: document.getElementById('nameText'),
  downloadBtn: document.getElementById('downloadBtn'),
  previewCanvas: document.getElementById('previewCanvas'),
  exportCanvas: document.getElementById('exportCanvas'),
};

async function loadFonts() {
  await Promise.all([
    document.fonts.load(`700 ${NAME.size}px ${FONT}`),
    document.fonts.load(`700 ${NAME.minSize}px ${FONT}`),
  ]);
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

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
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

function snap(value) {
  return Math.round(value) + 0.5;
}

function fitFontSize(ctx, text, maxWidth, maxSize, minSize) {
  let size = maxSize;
  while (size > minSize) {
    ctx.font = `700 ${size}px ${FONT}`;
    if (ctx.measureText(text).width <= maxWidth) return size;
    size -= 1;
  }
  return minSize;
}

function drawName(ctx) {
  const text = state.name.trim();
  if (!text) return;

  const padding = 48;
  const maxWidth = NAME.w - padding * 2;
  const fontSize = fitFontSize(ctx, text, maxWidth, NAME.size, NAME.minSize);

  ctx.font = `700 ${fontSize}px ${FONT}`;
  ctx.fillStyle = NAME.color;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillText(text, snap(NAME.x + NAME.w / 2), snap(NAME.y + NAME.h / 2));
  ctx.textAlign = 'left';
}

function renderCard(ctx) {
  ctx.clearRect(0, 0, CARD_SIZE, CARD_SIZE);

  if (state.photo) {
    ctx.save();
    roundRect(ctx, PHOTO_SLOT.x, PHOTO_SLOT.y, PHOTO_SLOT.w, PHOTO_SLOT.h, PHOTO_SLOT.radius);
    ctx.clip();
    drawCoverImage(ctx, state.photo, PHOTO_SLOT.x, PHOTO_SLOT.y, PHOTO_SLOT.w, PHOTO_SLOT.h);
    ctx.restore();
  } else {
    ctx.fillStyle = '#1a1a1a';
    ctx.save();
    roundRect(ctx, PHOTO_SLOT.x, PHOTO_SLOT.y, PHOTO_SLOT.w, PHOTO_SLOT.h, PHOTO_SLOT.radius);
    ctx.fill();
    ctx.restore();
  }

  ctx.drawImage(templateImg, 0, 0, CARD_SIZE, CARD_SIZE);
  drawName(ctx);
}

function renderExport(canvas) {
  if (!templateImg) return;

  canvas.width = CARD_SIZE;
  canvas.height = CARD_SIZE;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  renderCard(ctx);
}

function updatePreview() {
  if (!templateImg) return;
  const ctx = setupContext(els.previewCanvas, PREVIEW_SIZE);
  renderCard(ctx);
}

async function init() {
  await loadFonts();
  templateImg = await loadImage(`${import.meta.env.BASE_URL}tou.png`);
  updatePreview();

  els.nameText.addEventListener('input', () => {
    state.name = els.nameText.value;
    updatePreview();
  });

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
      link.download = `tourism-photo-card-${Date.now()}.png`;
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
