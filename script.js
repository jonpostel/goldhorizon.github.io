const html = document.documentElement;
const yearEl = document.getElementById('year');
const starCanvas = document.getElementById('starfield');
const ctx = starCanvas ? starCanvas.getContext('2d') : null;
const aboutTrigger = document.getElementById('aboutTrigger');
const aboutModal = document.getElementById('aboutModal');
const aboutClose = document.getElementById('aboutClose');
const aboutBackdrop = aboutModal ? aboutModal.querySelector('.modal-backdrop') : null;
yearEl.textContent = new Date().getFullYear();
const dict = {
  en: {
    brand: 'Gold Horizon',
    'nav.mission': 'Mission',
    'nav.services': 'Services',
    'nav.technology': 'Technology',
    'nav.contact': 'Contact',
    'hero.title': 'Building the orbital infrastructure of tomorrow',
    'hero.subtitle': 'Gold Horizon designs modular orbital platforms and in‑orbit services for sustainable space operations.',
    'hero.cta.primary': 'Explore our mission',
    'hero.cta.secondary': 'View services',
    'mission.title': 'Mission',
    'mission.tag': 'Enabling sustainable space operations',
    'mission.copy1': 'We design and operate modular orbital platforms that accelerate space construction and unlock persistent in‑orbit capabilities.',
    'mission.copy2': 'Our focus spans assembly robotics, refueling logistics, inspection and repair, and debris mitigation to build a resilient cislunar economy.',
    'mission.card.title': 'Principles',
    'mission.card.item1': 'Safety first operations',
    'mission.card.item2': 'Modular, upgradeable systems',
    'mission.card.item3': 'Autonomy with human oversight',
    'mission.card.item4': 'Open, interoperable standards',
    'services.title': 'Services',
    'services.tag': 'From orbit design to on‑site operations',
    'services.item1.title': 'Orbital platform design',
    'services.item1.copy': 'Architecture, analysis, and mission integration for modular stations.',
    'services.item2.title': 'On‑orbit assembly',
    'services.item2.copy': 'Autonomous truss build‑up and payload installation.',
    'services.item3.title': 'Refueling & logistics',
    'services.item3.copy': 'Depot operations, propellant transfer, and traffic coordination.',
    'services.item4.title': 'Debris mitigation',
    'services.item4.copy': 'Tracking, avoidance planning, and responsible removal.',
    'services.item5.title': 'Inspection & repair',
    'services.item5.copy': 'Remote inspection, anomaly resolution, and component upgrade.',
    'technology.title': 'Technology',
    'technology.tag': 'Reliable systems for persistent operations',
    'technology.item1.title': 'Autonomous robotics',
    'technology.item1.copy': 'Manipulators and vision for safe assembly and servicing.',
    'technology.item2.title': 'Modular truss modules',
    'technology.item2.copy': 'Reconfigurable structures enabling growth and maintenance.',
    'technology.item3.title': 'Propellant transfer systems',
    'technology.item3.copy': 'Standardized interfaces for cross‑mission refueling.',
    'technology.item4.title': 'AI‑assisted operations',
    'technology.item4.copy': 'Planning, monitoring, and anomaly detection at scale.',
    'technology.item5.title': 'Radiation‑hardened avionics',
    'technology.item5.copy': 'Reliable compute for long‑duration missions.',
    'contact.title': 'Contact',
    'contact.tag': 'Partnerships and mission inquiries',
    'contact.email': 'admin@goldhorizon.org'
  }
};
let currentLang = 'en';
function applyI18n() {
  const t = dict[currentLang] || dict.en;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) el.textContent = t[key];
  });
}
applyI18n();
if (aboutTrigger && aboutModal) {
  const openModal = () => {
    aboutModal.classList.add('open');
    html.style.overflow = 'hidden';
  };
  const closeModal = () => {
    aboutModal.classList.remove('open');
    html.style.overflow = '';
  };
  aboutTrigger.addEventListener('click', () => {
    openModal();
  });
  if (aboutClose) {
    aboutClose.addEventListener('click', () => {
      closeModal();
    });
  }
  if (aboutBackdrop) {
    aboutBackdrop.addEventListener('click', () => {
      closeModal();
    });
  }
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && aboutModal.classList.contains('open')) {
      closeModal();
    }
  });
}
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('show');
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const heroEl = document.querySelector('.hero');
let reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let stars = [];
let dimStars = [];
let starColor = '#8aa0b5';
let orbitColor = '#445160';
let satColor = '#ffb800';
let w = 0, h = 0, scale = 1;
let cx = 0, cy = 0;
let orbits = [];
let constLines = [];
let meteor = null;
let nebulaRgb = { r: 255, g: 184, b: 0 };
let nebulaRgb2 = { r: 100, g: 150, b: 255 };
let nebulaGrad1 = null;
let nebulaGrad2 = null;
let nebulaGrad3 = null;
let nebulaGrad4 = null;
let horizonGrad = null;
let bgCanvas = null, bgCtx = null;
function getColorVar(name) {
  return getComputedStyle(html).getPropertyValue(name).trim();
}
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  scale = dpr > 1.5 ? 1.5 : dpr;
  w = window.innerWidth;
  h = window.innerHeight;
  starCanvas.width = Math.floor(w * scale);
  starCanvas.height = Math.floor(h * scale);
  starCanvas.style.width = w + 'px';
  starCanvas.style.height = h + 'px';
  updateOrbitAnchor();
  updateGradients();
  updateBackgroundCache();
}
function updateBackgroundCache() {
  if (!bgCanvas) {
    bgCanvas = document.createElement('canvas');
    bgCtx = bgCanvas.getContext('2d');
  }
  bgCanvas.width = starCanvas.width;
  bgCanvas.height = starCanvas.height;
  
  bgCtx.fillStyle = '#020617';
  bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
  
  const cxNeb = Math.floor((cx - 180) * scale);
  const cyNeb = Math.floor((cy - 60) * scale);
  const rNeb = 320 * scale;
  const bgGrad1 = bgCtx.createRadialGradient(cxNeb, cyNeb, 0, cxNeb, cyNeb, rNeb);
  bgGrad1.addColorStop(0, `rgba(${nebulaRgb.r}, ${nebulaRgb.g}, ${nebulaRgb.b}, 0.13)`);
  bgGrad1.addColorStop(1, 'rgba(0,0,0,0)');
  bgCtx.fillStyle = bgGrad1;
  bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
  
  const bgGrad2 = bgCtx.createLinearGradient(0, Math.floor((cy - 220) * scale), 0, Math.floor((cy + 220) * scale));
  bgGrad2.addColorStop(0, 'rgba(0,0,0,0)');
  bgGrad2.addColorStop(0.5, `rgba(${nebulaRgb.r}, ${nebulaRgb.g}, ${nebulaRgb.b}, 0.06)`);
  bgGrad2.addColorStop(1, 'rgba(0,0,0,0)');
  bgCtx.fillStyle = bgGrad2;
  bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
  
  const cxNeb2 = Math.floor((w * 0.75) * scale);
  const cyNeb2 = Math.floor((h * 0.3) * scale);
  const rNeb2 = 280 * scale;
  const bgGrad3 = bgCtx.createRadialGradient(cxNeb2, cyNeb2, 0, cxNeb2, cyNeb2, rNeb2);
  bgGrad3.addColorStop(0, `rgba(${nebulaRgb2.r}, ${nebulaRgb2.g}, ${nebulaRgb2.b}, 0.09)`);
  bgGrad3.addColorStop(0.5, `rgba(${nebulaRgb2.r}, ${nebulaRgb2.g}, ${nebulaRgb2.b}, 0.04)`);
  bgGrad3.addColorStop(1, 'rgba(0,0,0,0)');
  bgCtx.fillStyle = bgGrad3;
  bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
  
  const bgGrad4 = bgCtx.createRadialGradient(0, Math.floor(h * 0.5 * scale), 0, 0, Math.floor(h * 0.5 * scale), Math.floor(w * 0.6 * scale));
  bgGrad4.addColorStop(0, 'rgba(0,0,0,0)');
  bgGrad4.addColorStop(0.6, `rgba(${nebulaRgb2.r}, ${nebulaRgb2.g}, ${nebulaRgb2.b}, 0.03)`);
  bgGrad4.addColorStop(1, 'rgba(0,0,0,0)');
  bgCtx.fillStyle = bgGrad4;
  bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
  
  const cxScreen = w * 0.5 * scale;
  const cyScreen = h * 1.08 * scale;
  const radius = h * 1.2 * scale;
  const bgHorizon = bgCtx.createRadialGradient(cxScreen, cyScreen, 0, cxScreen, cyScreen, radius);
  bgHorizon.addColorStop(0, `rgba(${nebulaRgb.r}, ${nebulaRgb.g}, ${nebulaRgb.b}, 0)`);
  bgHorizon.addColorStop(0.45, `rgba(${nebulaRgb.r}, ${nebulaRgb.g}, ${nebulaRgb.b}, 0.28)`);
  bgHorizon.addColorStop(0.9, 'rgba(0,0,0,0)');
  bgCtx.fillStyle = bgHorizon;
  bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
}
function updateOrbitAnchor() {
  if (heroEl) {
    const r = heroEl.getBoundingClientRect();
    cx = r.left + r.width / 2;
    cy = r.top + r.height * 0.45;
  } else {
    cx = w / 2;
    cy = h * 0.38;
  }
  updateGradients();
}
function seedStars(count) {
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 1.2 + 0.4,
    ang: (Math.random() * 0.4 + 0.8) * 0.0006,
    tw: Math.random() * Math.PI * 2
  }));
  const dimCount = Math.floor(count * 1.5);
  dimStars = Array.from({ length: dimCount }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 0.6 + 0.1,
    ang: (Math.random() * 0.4 + 0.8) * 0.0004,
    tw: Math.random() * Math.PI * 2
  }));
  seedConstellations();
}
function seedOrbits() {
  const baseW = heroEl ? heroEl.getBoundingClientRect().width : Math.min(w, 720);
  const base = Math.max(120, Math.min(baseW, 640)) / 2;
  orbits = [
    { a: base * 1.05, b: base * 0.64, rot: -0.18, speed: 0.00045, t: Math.random() * Math.PI * 2, nodes: 7 },
    { a: base * 0.80, b: base * 0.46, rot: 0.28, speed: 0.0007, t: Math.random() * Math.PI * 2, nodes: 6 },
    { a: base * 0.58, b: base * 0.30, rot: -0.52, speed: 0.0009, t: Math.random() * Math.PI * 2, nodes: 5 },
    { a: base * 0.38, b: base * 0.20, rot: 0.82, speed: 0.0011, t: Math.random() * Math.PI * 2, nodes: 4 }
  ];
}
function updateStarColors() {
  starColor = getColorVar('--muted') || starColor;
  orbitColor = getColorVar('--border') || orbitColor;
  satColor = getColorVar('--space-accent') || satColor;
  const hex = satColor.trim();
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
  if (m) nebulaRgb = { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
  nebulaRgb2 = { r: 80, g: 120, b: 220 };
  updateGradients();
}
function updateGradients() {
  if (!ctx || !starCanvas) return;
  const cxNeb = Math.floor((cx - 180) * scale);
  const cyNeb = Math.floor((cy - 60) * scale);
  const rNeb = 320 * scale;
  const g1 = ctx.createRadialGradient(cxNeb, cyNeb, 0, cxNeb, cyNeb, rNeb);
  g1.addColorStop(0, `rgba(${nebulaRgb.r}, ${nebulaRgb.g}, ${nebulaRgb.b}, 0.13)`);
  g1.addColorStop(1, 'rgba(0,0,0,0)');
  nebulaGrad1 = g1;
  
  const g2 = ctx.createLinearGradient(0, Math.floor((cy - 220) * scale), 0, Math.floor((cy + 220) * scale));
  g2.addColorStop(0, 'rgba(0,0,0,0)');
  g2.addColorStop(0.5, `rgba(${nebulaRgb.r}, ${nebulaRgb.g}, ${nebulaRgb.b}, 0.06)`);
  g2.addColorStop(1, 'rgba(0,0,0,0)');
  nebulaGrad2 = g2;
  
  const cxNeb2 = Math.floor((w * 0.75) * scale);
  const cyNeb2 = Math.floor((h * 0.3) * scale);
  const rNeb2 = 280 * scale;
  const g3 = ctx.createRadialGradient(cxNeb2, cyNeb2, 0, cxNeb2, cyNeb2, rNeb2);
  g3.addColorStop(0, `rgba(${nebulaRgb2.r}, ${nebulaRgb2.g}, ${nebulaRgb2.b}, 0.09)`);
  g3.addColorStop(0.5, `rgba(${nebulaRgb2.r}, ${nebulaRgb2.g}, ${nebulaRgb2.b}, 0.04)`);
  g3.addColorStop(1, 'rgba(0,0,0,0)');
  nebulaGrad3 = g3;
  
  const g4 = ctx.createRadialGradient(0, Math.floor(h * 0.5 * scale), 0, 0, Math.floor(h * 0.5 * scale), Math.floor(w * 0.6 * scale));
  g4.addColorStop(0, 'rgba(0,0,0,0)');
  g4.addColorStop(0.6, `rgba(${nebulaRgb2.r}, ${nebulaRgb2.g}, ${nebulaRgb2.b}, 0.03)`);
  g4.addColorStop(1, 'rgba(0,0,0,0)');
  nebulaGrad4 = g4;
  
  const cxScreen = w * 0.5 * scale;
  const cyScreen = h * 1.08 * scale;
  const radius = h * 1.2 * scale;
  const gh = ctx.createRadialGradient(cxScreen, cyScreen, 0, cxScreen, cyScreen, radius);
  gh.addColorStop(0, `rgba(${nebulaRgb.r}, ${nebulaRgb.g}, ${nebulaRgb.b}, 0)`);
  gh.addColorStop(0.45, `rgba(${nebulaRgb.r}, ${nebulaRgb.g}, ${nebulaRgb.b}, 0.28)`);
  gh.addColorStop(0.9, 'rgba(0,0,0,0)');
  horizonGrad = gh;
}
function drawNebula() {
  if (!nebulaGrad1 || !nebulaGrad2 || !nebulaGrad3 || !nebulaGrad4) updateGradients();
  ctx.fillStyle = nebulaGrad1;
  ctx.fillRect(0, 0, starCanvas.width, starCanvas.height);
  ctx.fillStyle = nebulaGrad2;
  ctx.fillRect(0, 0, starCanvas.width, starCanvas.height);
  ctx.fillStyle = nebulaGrad3;
  ctx.fillRect(0, 0, starCanvas.width, starCanvas.height);
  ctx.fillStyle = nebulaGrad4;
  ctx.fillRect(0, 0, starCanvas.width, starCanvas.height);
}
function seedConstellations(n = 10) {
  constLines = [];
  if (stars.length < 2) return;
  for (let i = 0; i < n; i++) {
    const a = stars[Math.floor(Math.random() * stars.length)];
    const b = stars[Math.floor(Math.random() * stars.length)];
    constLines.push({ a, b });
  }
}
function drawConstellations() {
  ctx.save();
  ctx.strokeStyle = orbitColor;
  ctx.globalAlpha = 0.12;
  ctx.lineWidth = 0.6 * scale;
  for (const ln of constLines) {
    ctx.beginPath();
    ctx.moveTo(Math.round(ln.a.x * scale), Math.round(ln.a.y * scale));
    ctx.lineTo(Math.round(ln.b.x * scale), Math.round(ln.b.y * scale));
    ctx.stroke();
  }
  ctx.restore();
}
function maybeSpawnMeteor() {
  if (reduceMotion || meteor) return;
  if (Math.random() < 0.003) {
    const startX = Math.random() * w * 0.3;
    const startY = Math.random() * h * 0.4;
    meteor = { x: startX, y: startY, vx: 6 + Math.random() * 2, vy: -2 - Math.random(), life: 160 };
  }
}
function drawMeteor() {
  if (!meteor) return;
  ctx.save();
  const grad = ctx.createLinearGradient(Math.round((meteor.x - 30) * scale), Math.round((meteor.y + 10) * scale), Math.round(meteor.x * scale), Math.round(meteor.y * scale));
  grad.addColorStop(0, `rgba(${nebulaRgb.r}, ${nebulaRgb.g}, ${nebulaRgb.b}, 0)`);
  grad.addColorStop(1, `rgba(${nebulaRgb.r}, ${nebulaRgb.g}, ${nebulaRgb.b}, 0.9)`);
  ctx.strokeStyle = grad;
  ctx.lineWidth = 1.2 * scale;
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.moveTo(Math.round((meteor.x - 30) * scale), Math.round((meteor.y + 10) * scale));
  ctx.lineTo(Math.round(meteor.x * scale), Math.round(meteor.y * scale));
  ctx.stroke();
  ctx.fillStyle = `rgba(${nebulaRgb.r}, ${nebulaRgb.g}, ${nebulaRgb.b}, 1)`;
  ctx.beginPath();
  ctx.arc(Math.round(meteor.x * scale), Math.round(meteor.y * scale), 1.8 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  meteor.x += meteor.vx;
  meteor.y += meteor.vy;
  meteor.life -= 1;
  if (meteor.life <= 0 || meteor.x > w + 40 || meteor.y < -40) meteor = null;
}
function drawOrbits() {
  ctx.save();
  ctx.lineWidth = 0.8 * scale;
  ctx.strokeStyle = orbitColor;
  ctx.globalAlpha = 0.32;
  for (const o of orbits) {
    ctx.beginPath();
    ctx.ellipse(Math.round(cx * scale), Math.round(cy * scale), o.a * scale, o.b * scale, o.rot, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}
function drawOrbitNodes() {
  ctx.save();
  ctx.fillStyle = satColor;
  for (const o of orbits) {
    const n = o.nodes || 0;
    if (!n) continue;
    for (let i = 0; i < n; i++) {
      const angle = o.t + (i / n) * Math.PI * 2;
      const c = Math.cos(angle), s = Math.sin(angle);
      const rx = o.a * c * 0.96;
      const ry = o.b * s * 0.96;
      const x = cx + rx * Math.cos(o.rot) - ry * Math.sin(o.rot);
      const y = cy + rx * Math.sin(o.rot) + ry * Math.cos(o.rot);
      const size = (1.2 + 0.4 * Math.sin(angle * 2)) * scale;
      ctx.globalAlpha = 0.9;
      ctx.shadowColor = satColor;
      ctx.shadowBlur = 4 * scale;
      ctx.beginPath();
      ctx.moveTo(Math.round((x - size) * scale), Math.round(y * scale));
      ctx.lineTo(Math.round(x * scale), Math.round((y - size) * scale));
      ctx.lineTo(Math.round((x + size) * scale), Math.round(y * scale));
      ctx.lineTo(Math.round(x * scale), Math.round((y + size) * scale));
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.restore();
}
function drawHorizon() {
  ctx.save();
  if (!horizonGrad) updateGradients();
  ctx.fillStyle = horizonGrad;
  ctx.fillRect(0, 0, starCanvas.width, starCanvas.height);
  ctx.restore();
}
function drawSatellites() {
  ctx.save();
  ctx.fillStyle = satColor;
  for (const o of orbits) {
    if (!reduceMotion) o.t += o.speed;
    const c = Math.cos(o.t), s = Math.sin(o.t);
    const rx = o.a * c, ry = o.b * s;
    const x = cx + rx * Math.cos(o.rot) - ry * Math.sin(o.rot);
    const y = cy + rx * Math.sin(o.rot) + ry * Math.cos(o.rot);
    ctx.globalAlpha = 1;
    ctx.shadowColor = satColor;
    ctx.shadowBlur = 8 * scale;
    ctx.beginPath();
    ctx.arc(Math.round(x * scale), Math.round(y * scale), (1.4 + 0.7 * Math.sin(o.t * 2)) * scale, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
function draw() {
  if (bgCanvas) {
    ctx.drawImage(bgCanvas, 0, 0);
  } else {
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, starCanvas.width, starCanvas.height);
    drawNebula();
    drawHorizon();
  }
  
  const rotCx = w / 2;
  const rotCy = h / 2;

  ctx.fillStyle = starColor;
  ctx.globalAlpha = 0.25;
  for (const s of dimStars) {
    const dx = s.x - rotCx;
    const dy = s.y - rotCy;
    const c = Math.cos(s.ang);
    const n = Math.sin(s.ang);
    s.x = rotCx + dx * c - dy * n;
    s.y = rotCy + dx * n + dy * c;
    const size = Math.max(1, s.r * scale);
    ctx.beginPath();
    ctx.arc(Math.round(s.x * scale), Math.round(s.y * scale), size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  for (const s of stars) {
    const dx = s.x - rotCx;
    const dy = s.y - rotCy;
    const c = Math.cos(s.ang);
    const n = Math.sin(s.ang);
    s.x = rotCx + dx * c - dy * n;
    s.y = rotCy + dx * n + dy * c;
    const alpha = reduceMotion ? 0.8 : 0.6 + 0.4 * Math.sin(s.tw += 0.005);
    ctx.globalAlpha = alpha;
    const size = Math.max(1, s.r * scale);
    ctx.beginPath();
    ctx.arc(Math.round(s.x * scale), Math.round(s.y * scale), size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  drawConstellations();
  drawOrbits();
  drawOrbitNodes();
  drawSatellites();
  maybeSpawnMeteor();
  drawMeteor();
  if (!reduceMotion) requestAnimationFrame(draw);
}
function initStarfield() {
  if (!starCanvas || !ctx) return;
  updateStarColors();
  resizeCanvas();
  const area = w * h;
  const densityBase = scale > 1.25 ? 22000 : 16000;
  const baseCount = Math.floor(area / densityBase);
  const count = Math.max(90, baseCount + 80);
  seedStars(count);
  seedOrbits();
  if (reduceMotion) {
    draw();
  } else {
    requestAnimationFrame(draw);
  }
}
let resizeTimeout = null;
window.addEventListener('resize', () => {
  if (resizeTimeout) clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    resizeCanvas();
    const count = Math.floor((w * h) / (scale > 1.25 ? 22000 : 16000)) + 80;
    seedStars(Math.max(90, count));
    seedOrbits();
    resizeTimeout = null;
  }, 150);
});
let scrollTimeout = null;
window.addEventListener('scroll', () => {
  if (scrollTimeout) clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    updateOrbitAnchor();
    scrollTimeout = null;
  }, 50);
}, { passive: true });
initStarfield();
