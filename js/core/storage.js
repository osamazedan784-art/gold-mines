// ============================================
// إدارة التخزين (localStorage)
// ============================================
import { CONFIG } from './config.js';

export const Storage = {
  save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('[storage] save failed:', e);
      return false;
    }
  },
  load(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('[storage] load failed:', e);
      return fallback;
    }
  },
  remove(key) {
    try { localStorage.removeItem(key); return true; }
    catch (e) { return false; }
  }
};
