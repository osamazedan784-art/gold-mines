// ============================================
// حالة اللعبة والحفظ
// ============================================
import { CONFIG } from './config.js';
import { Storage } from './storage.js';
import { isNum } from './utils.js';
import { bus, EVENTS } from './eventbus.js';

export const S = {};

export function createNewState() {
  const n = 10;
  const zero = (v) => Array(n).fill(v);
  return {
    cash: 0,
    dm: 0,
    sh: Array.from({ length: n }, () => ({ lv: 1, st: 0 })),
    el: 1,
    wh: 1,
    pile: 0,
    mode: 0,
    mm: { s: 0, el: 0, wh: 0 },
    boostEnd: 0,
    boostCd: 0,
    t: Date.now(),
    ev: { wh: 0, el: 0, tr: 0, wk: 0, ct: 0 },
    tu: { wh: 1, el: 1, tr: 1, wk: 1, ct: 1 },
    evb: 0,
    mx: zero(0),
    ml: zero(0),
    mg: zero(0),
    mspec: zero(''),
    mskill: { gold: 0, lift: 0, economy: 0 },
    res: [0, 0, 0],
    tot: 0,
    pt: 0,
    mi: 0,
    qi: 0,
    pr: 0,
    mk: 0,
    ach: 0,
    mab: { end: 0, cd: 0, mine: -1, era: 0 },
    mqdone: {},
    mmil: 0,
    erw: {},
    dq: null,
    wq: null,
    dly: { last: -9, streak: 0 },
    hint: 0,
    snd: 1,
    lp: 0,
    zc: 1.25,
    zt: 0.4875,
    ztm: 0,
    xp: null,
    tr: [],
    ep: { mines: 1, pk: {} },
    hw: 0,
    awT: 0,
    awS: 0,
  };
}

function sanitize(data) {
  for (const k of ['cash', 'dm', 'pr', 'mk', 'pile', 'tot', 'pt']) {
    if (data[k] != null && !isNum(data[k])) data[k] = 0;
  }
  for (const k of ['el', 'wh']) {
    if (data[k] != null && !isNum(data[k], 1)) data[k] = 1;
  }
  for (const k of ['mx', 'ml', 'mg', 'mspec']) {
    if (Array.isArray(data[k])) {
      data[k] = data[k].slice(0, 10).map((v) =>
        typeof v === 'string' ? v : isNum(v) ? v : 0
      );
    } else if (data[k] != null) {
      data[k] = [];
    }
  }
}

export function loadState() {
  const saved = Storage.load(CONFIG.SAVE_KEY, null);
  if (!saved || !saved.sh) {
    Object.assign(S, createNewState());
    bus.emit(EVENTS.GAME_LOAD, { fresh: true });
    return false;
  }
  Object.assign(S, createNewState(), saved);
  sanitize(S);
  if (!Array.isArray(S.sh) || S.sh.length === 0) {
    S.sh = [{ lv: 1, st: 0 }];
  }
  S.sh.forEach((h) => {
    if (!isFinite(h.lv) || h.lv < 1) h.lv = 1;
    if (!isFinite(h.st) || h.st < 0) h.st = 0;
  });
  bus.emit(EVENTS.GAME_LOAD, { fresh: false });
  return true;
}

export function saveState() {
  S.t = Date.now();
  const ok = Storage.save(CONFIG.SAVE_KEY, S);
  if (ok) bus.emit(EVENTS.GAME_SAVE);
  return ok;
    }
