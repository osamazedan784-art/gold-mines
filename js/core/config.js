// ============================================
// الثوابت والإعدادات العامة
// ============================================

export const CONFIG = {
  SAVE_KEY: 'goldmines.v5.save',
  BACKUP_KEY: 'goldmines.v5.backup',

  ROW_HEIGHT: 70,
  CAV_HEIGHT: 66,
  MAX_MINES: 10,
  WALK_TIME: 1.7,
  MINE_TIME: 1.2,

  ECO: {
    K: [500, 65, 13.6, 2.25, 90],
    TD: [0, 2, 4, 8, 16],
  },

  ERA_NAMES: [
    'العصر الخشبي',
    'العصر الحديدي',
    'العصر الصناعي',
    'العصر الكهربائي',
    'العصر الذكي',
  ],

  ERA_COLORS: ['#d9a441', '#b8c4d0', '#4ad0ff', '#5fffff', '#ff8cf0'],

  RESOURCE_NAMES: ['ذهب', 'لؤلؤ', 'ميثريل'],
};

export const getWorldWidth = () =>
  document.getElementById('world')?.clientWidth || 480;
