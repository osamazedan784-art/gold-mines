// ============================================
// الحسابات الاقتصادية
// ============================================
import { S } from '../core/state.js';

export const mineType = (i) => (i < 5 ? 0 : i < 8 ? 1 : 2);
const TYPE_MULT = [1, 1.4, 2.2];

export function productionRate(i, lv) {
  const type = mineType(i);
  const hasManager = S.mg && S.mg[i];
  let base = 3 * lv * Math.pow(4.4, i);
  base *= 1 + (S.pr || 0) * 0.25;
  base *= hasManager ? 2 + 0.2 * (S.ml[i] || 0) : 1;
  base *= 1 + (S.mk || 0) * 0.2;
  base *= TYPE_MULT[type];
  base *= 1 + (S.evb || 0);
  base *= Math.pow(1.5, S.mx[i] || 0);
  base *= 1 + 0.05 * Math.max(0, Math.min(5, (S.mskill && S.mskill.gold) || 0));
  if (hasManager) {
    const spec = (S.mspec && S.mspec[i]) || '';
    const specMult = { geologist: 1.2, engineer: 1.12, foreman: 1.1 }[spec] || 1;
    base *= specMult;
  }
  return base;
}

export function upgradeCost(i, lv) {
  return 18 * Math.pow(5.2, i) * Math.pow(1.2, lv - 1);
}

export function newMineCost(n) {
  return 150 * Math.pow(8.5, n);
}

export function elevatorCost(lv) {
  return 80 * Math.pow(1.3, lv - 1) * Math.pow(2.2, S.sh.length - 1);
}

export function warehouseCost(lv) {
  return 120 * Math.pow(1.3, lv - 1) * Math.pow(2.2, S.sh.length - 1);
}

export function elevatorCapacity(lv = S.el) {
  const skill = 1 + 0.08 * Math.max(0, Math.min(5, (S.mskill && S.mskill.lift) || 0));
  return 30 * Math.pow(1.3, lv - 1) * Math.pow(2, S.sh.length - 1) * skill;
}

export function warehouseCapacity(lv = S.wh) {
  return 50 * Math.pow(1.3, lv - 1) * Math.pow(2, S.sh.length - 1);
}

export function totalRate() {
  let sum = 0;
  S.sh.forEach((h, i) => { sum += productionRate(i, h.lv) / 5.2; });
  const elevRate = elevatorCapacity() / (2 * (0.7 + 0.45 * S.sh.length) + 1.7);
  const truckTime = 1.35 + 2 * 1.35;
  const whRate = warehouseCapacity() / truckTime;
  return Math.min(sum, elevRate, whRate);
                                         }
