// ============================================
// نقطة البداية للعبة
// ============================================
import { S, loadState, saveState } from './core/state.js';
import { bus, EVENTS } from './core/eventbus.js';
import { fmt } from './core/utils.js';
import { totalRate, newMineCost } from './game/economy.js';

// حالة العمال
const minerStates = [];
const rowRefs = [];

function initMiners() {
  S.sh.forEach(() => {
    minerStates.push({ p: 0, t: 0, u: 0 });
  });
}

// ============================================
// محاكاة العمال
// ============================================
function simulate(dt) {
  S.sh.forEach((h, i) => {
    const m = minerStates[i];
    if (!m) return;
    m.t += dt;
    if (m.p === 0) {
      m.u = ease(Math.min(1, m.t / 1.7));
      if (m.t >= 1.7) { m.p = 1; m.t = 0; m.u = 1; }
    } else if (m.p === 1) {
      if (m.t >= 1.2) {
        m.p = 2; m.t = 0;
        const amount = productionRate(i, h.lv);
        h.st += amount;
        S.res[mineType(i)] += amount;
      }
    } else if (m.p === 2) {
      m.u = 1 - ease(Math.min(1, m.t / 1.7));
      if (m.t >= 1.7) { m.p = 0; m.t = 0; m.u = 0; }
    }
  });
}

// استيراد دوال الاقتصاد الإضافية
function productionRate(i, lv) {
  let base = 3 * lv * Math.pow(4.4, i);
  base *= S.mg[i] ? 2 + 0.2 * (S.ml[i] || 0) : 1;
  base *= 1 + (S.evb || 0);
  return base;
}
function mineType(i) { return i < 5 ? 0 : i < 8 ? 1 : 2; }
function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

// ============================================
// بناء الصفوف
// ============================================
function buildRows() {
  const rows = document.getElementById('rows');
  if (!rows) return;
  rows.innerHTML = '';
  rowRefs.length = 0;
  S.sh.forEach((h, i) => {
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `<div class="row-info">منجم ${i+1} · مستوى ${h.lv}</div>`;
    rows.appendChild(row);
    rowRefs[i] = {
      info: row.querySelector('.row-info'),
    };
  });
}

// ============================================
// حلقة اللعبة
// ============================================
let lastTick = performance.now();
let lastUI = 0;

function gameLoop(now) {
  requestAnimationFrame(gameLoop);
  const dt = Math.min(0.1, (now - lastTick) / 1000);
  lastTick = now;

  simulate(dt);

  // تحديث الواجهة
  if (now - lastUI > 200) {
    lastUI = now;
    const cash = document.getElementById('cash');
    const inc = document.getElementById('inc');
    if (cash) cash.textContent = `🪙 ${fmt(S.cash)}`;
    if (inc) inc.textContent = `+${fmt(totalRate())} / ثانية`;

    rowRefs.forEach((ref, i) => {
      if (!ref) return;
      const h = S.sh[i];
      const txt = `منجم ${i+1} · مستوى ${h.lv} · 📦 ${fmt(h.st)}`;
      if (ref.info._t !== txt) {
        ref.info.textContent = txt;
        ref.info._t = txt;
      }
    });

    updateButtons();
  }
}

function updateButtons() {
  const btn = document.getElementById('nextMine');
  if (!btn) return;
  if (S.sh.length >= 10) {
    btn.textContent = 'وصلت للحد الأقصى';
    btn.disabled = true;
  } else {
    const cost = newMineCost(S.sh.length);
    const txt = `🔓 منجم ${S.sh.length+1} جديد · 🪙${fmt(cost)}`;
    if (btn._t !== txt) { btn.textContent = txt; btn._t = txt; }
    btn.disabled = S.cash < cost;
  }

  const boost = document.getElementById('boostBtn');
  if (!boost) return;
  const n = Date.now();
  if (n < S.boostEnd) {
    const t = Math.ceil((S.boostEnd - n) / 1000);
    boost.textContent = `⚡ يعمل · ${t}ث`;
    boost.disabled = true;
  } else if (n < S.boostCd) {
    const t = Math.ceil((S.boostCd - n) / 1000);
    boost.textContent = `⏳ ${t}ث`;
    boost.disabled = true;
  } else {
    boost.textContent = '⚡ تسريع ×2';
    boost.disabled = false;
  }
}

// ============================================
// الأحداث
// ============================================
function setupEvents() {
  document.getElementById('nextMine')?.addEventListener('click', () => {
    if (S.sh.length >= 10) return;
    const cost = newMineCost(S.sh.length);
    if (S.cash < cost) { toast(`تحتاج 🪙${fmt(cost - S.cash)} أخرى`); return; }
    S.cash -= cost;
    S.sh.push({ lv: 1, st: 0 });
    S.mx.push(0); S.ml.push(0); S.mg.push(0);
    minerStates.push({ p: 0, t: 0, u: 0 });
    buildRows();
    toast(`🎉 منجم ${S.sh.length} مفتوح!`);
    saveState();
  });

  document.getElementById('modeBtn')?.addEventListener('click', () => {
    S.mode = (S.mode + 1) % 3;
    document.getElementById('modeBtn').textContent = ['×1','×10','أقصى'][S.mode];
  });

  document.getElementById('boostBtn')?.addEventListener('click', () => {
    const n = Date.now();
    if (n < S.boostCd || n < S.boostEnd) return;
    S.boostEnd = n + 30000;
    S.boostCd = n + 90000;
    toast('⚡ تسريع ×2 لمدة 30 ثانية');
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) saveState();
  });
  window.addEventListener('pagehide', () => saveState());
  setInterval(() => saveState(), 4000);
}

// ============================================
// Toast
// ============================================
let toastTimer;
function toast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('on'), 3000);
}

// ============================================
// الإقلاع
// ============================================
function boot() {
  console.log('[game] booting…');
  const isNew = !loadState();
  console.log('[game] loaded. new:', isNew, '| cash:', S.cash, '| mines:', S.sh.length);
  initMiners();
  buildRows();
  setupEvents();

  setTimeout(() => {
    const splash = document.getElementById('splash');
    splash?.classList.add('out');
    const app = document.getElementById('app');
    if (app) app.hidden = false;
    setTimeout(() => splash?.remove(), 800);
  }, 1200);

  requestAnimationFrame(gameLoop);
  bus.emit(EVENTS.GAME_START);
  console.log('[game] ready!');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
