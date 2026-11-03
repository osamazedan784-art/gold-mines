// ============================================
// نظام الأحداث الموحد
// ============================================

class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(event, fn) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(fn);
    return () => this.off(event, fn);
  }

  off(event, fn) {
    const list = this.listeners.get(event);
    if (!list) return;
    const i = list.indexOf(fn);
    if (i !== -1) list.splice(i, 1);
  }

  emit(event, data) {
    const list = this.listeners.get(event);
    if (!list) return;
    for (const fn of list) {
      try { fn(data); }
      catch (e) { console.error(`[eventbus] "${event}":`, e); }
    }
  }

  once(event, fn) {
    const wrapper = (data) => {
      this.off(event, wrapper);
      fn(data);
    };
    this.on(event, wrapper);
  }
}

export const bus = new EventBus();

export const EVENTS = {
  GAME_START: 'game:start',
  GAME_TICK: 'game:tick',
  GAME_SAVE: 'game:save',
  GAME_LOAD: 'game:load',
  UPGRADE_BOUGHT: 'upgrade:bought',
  ERA_CHANGED: 'era:changed',
  UI_UPDATE: 'ui:update',
  UI_TOAST: 'ui:toast',
  FX_UPGRADE: 'fx:upgrade',
};
