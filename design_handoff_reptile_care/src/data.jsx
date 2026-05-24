// 爬蟲環控系統 · Mock data
// Exposed on window so all babel scripts share it.

const NOW = new Date('2026-05-24T18:54:00');

const TANKS = [
  {
    id: 'shimaki',
    name: '島輝的家',
    species: '肥尾守宮',
    speciesLatin: 'Hemitheconyx caudicinctus',
    location: '最上層 · 玻璃缸',
    avatar: { tone: 'amber', initial: '輝' },
    target: { temp: [28, 32], hum: [55, 70] },
    current: { temp: 30.4, hum: 62 },
    trend24h: {
      temp: [27.8, 27.6, 27.5, 27.7, 28.0, 28.6, 29.4, 30.2, 30.8, 31.0, 31.2, 31.4, 31.6, 31.8, 32.0, 31.8, 31.4, 30.8, 30.4, 29.6, 28.8, 28.2, 27.9, 30.4],
      hum:  [60, 62, 64, 65, 64, 62, 60, 58, 57, 56, 55, 55, 56, 58, 60, 62, 64, 66, 67, 66, 65, 63, 62, 62],
    },
    devices: [
      { id: 'heat-lamp', name: '陶瓷加熱燈', type: 'heat', tone: 'amber', on: true, power: 65, locationHint: '熱區頂部' },
      { id: 'heat-pad',  name: '加熱墊',     type: 'heat', tone: 'amber', on: true, power: 40, locationHint: '熱區底板' },
      { id: 'uvb',       name: 'UVB 5.0 燈管', type: 'light', tone: 'violet', on: true, power: 100, locationHint: '頂部全長' },
      { id: 'mister',    name: '自動噴霧',   type: 'humid', tone: 'sky', on: false, locationHint: '冷區角落' },
      { id: 'fan',       name: '排風扇',     type: 'air',  tone: 'sage', on: false, locationHint: '頂蓋' },
    ],
    alerts: [],
    schedule: [
      { device: 'UVB 5.0 燈管', start: 7,  end: 19, tone: 'violet' },
      { device: '陶瓷加熱燈',   start: 6,  end: 22, tone: 'amber' },
      { device: '加熱墊',       start: 0,  end: 24, tone: 'amber' },
      { device: '自動噴霧',     start: 8,  end: 8.05, tone: 'sky' },
      { device: '自動噴霧',     start: 20, end: 20.05, tone: 'sky' },
    ],
    feeding: { last: '5/22 週五', next: '5/25 週日' },
    health: { lastShed: '5/08', weight: '58g' },
  },
  {
    id: 'douzhai',
    name: '斗宅的家',
    species: '西方豬鼻蛇',
    speciesLatin: 'Heterodon nasicus',
    location: '下方 · 玻璃缸',
    avatar: { tone: 'sage', initial: '斗' },
    target: { temp: [26, 30], hum: [40, 55] },
    current: { temp: 28.6, hum: 48 },
    trend24h: {
      temp: [26.5, 26.4, 26.3, 26.5, 26.8, 27.2, 27.8, 28.4, 28.8, 29.2, 29.4, 29.6, 29.8, 30.0, 29.8, 29.4, 29.0, 28.6, 28.2, 27.6, 27.2, 26.8, 26.6, 28.6],
      hum:  [50, 51, 52, 53, 52, 50, 48, 47, 46, 45, 44, 44, 45, 46, 47, 48, 50, 52, 53, 53, 52, 51, 50, 48],
    },
    devices: [
      { id: 'heat-lamp', name: '加熱燈', type: 'heat', tone: 'amber', on: true, power: 55, locationHint: '熱區' },
      { id: 'heat-pad',  name: '加熱墊', type: 'heat', tone: 'amber', on: false, locationHint: '備用' },
      { id: 'uvb',       name: 'UVB 2.0', type: 'light', tone: 'violet', on: false, locationHint: '低需求' },
      { id: 'fan',       name: '排風扇', type: 'air', tone: 'sage', on: true, power: 30, locationHint: '頂蓋' },
    ],
    alerts: [],
    schedule: [
      { device: '加熱燈',  start: 6, end: 21, tone: 'amber' },
      { device: '排風扇',  start: 12, end: 14, tone: 'sage' },
    ],
    feeding: { last: '5/17 週六', next: '5/24 週六 (今日)' },
    health: { lastShed: '4/28', weight: '142g' },
  },
  {
    id: 'shimaz',
    name: '島Z的家',
    species: '豹紋守宮',
    speciesLatin: 'Eublepharis macularius',
    location: '中層 · 塑膠盒',
    avatar: { tone: 'violet', initial: 'Z' },
    target: { temp: [27, 31], hum: [40, 50] },
    current: { temp: 32.8, hum: 38 },
    trend24h: {
      temp: [28.0, 27.8, 27.6, 27.8, 28.2, 28.8, 29.6, 30.4, 31.0, 31.4, 31.8, 32.2, 32.5, 32.6, 32.8, 32.6, 32.2, 31.6, 31.0, 30.2, 29.4, 28.8, 28.4, 32.8],
      hum:  [42, 43, 44, 45, 44, 43, 42, 41, 40, 39, 38, 38, 37, 37, 38, 39, 40, 42, 43, 43, 42, 41, 40, 38],
    },
    devices: [
      { id: 'heat-lamp', name: '加熱燈', type: 'heat', tone: 'amber', on: true, power: 85, locationHint: '熱區' },
      { id: 'heat-pad',  name: '加熱墊', type: 'heat', tone: 'amber', on: true, power: 60, locationHint: '熱區底板' },
      { id: 'mister',    name: '噴霧器', type: 'humid', tone: 'sky', on: false, locationHint: '冷區' },
    ],
    alerts: [
      { id: 'a1', level: 'high',  time: '18:42', message: '熱區溫度超過上限 31°C', metric: 'temp', value: 32.8 },
      { id: 'a2', level: 'mid',   time: '17:10', message: '濕度低於下限 40%',     metric: 'hum',  value: 38   },
    ],
    schedule: [
      { device: '加熱燈',  start: 6,  end: 22, tone: 'amber' },
      { device: '加熱墊',  start: 0,  end: 24, tone: 'amber' },
      { device: '噴霧器',  start: 9,  end: 9.05, tone: 'sky' },
    ],
    feeding: { last: '5/21 週四', next: '5/26 週一' },
    health: { lastShed: '5/15', weight: '64g' },
  },
];

// ── Recent system activity feed ─────────────────────────────
const ACTIVITY = [
  { t: '18:42', tank: '島Z的家',   text: '熱區溫度超過 31°C 上限',     tone: 'crimson', icon: 'alert' },
  { t: '18:30', tank: '島輝的家',  text: 'UVB 燈管已啟動 · 排程',       tone: 'violet',  icon: 'light' },
  { t: '17:10', tank: '島Z的家',   text: '濕度低於 40% 下限',           tone: 'amber',   icon: 'drop' },
  { t: '14:00', tank: '斗宅的家',  text: '排風扇已啟動 · 排程',         tone: 'sage',    icon: 'fan' },
  { t: '08:00', tank: '島輝的家',  text: '完成晨間噴霧 5 秒',           tone: 'sky',     icon: 'mist' },
  { t: '07:00', tank: '全部',      text: '燈光週期同步 · 日落 19:08',  tone: 'amber',   icon: 'sun' },
];

// ── Upcoming actions ────────────────────────────────────────
const UPCOMING = [
  { t: '19:00', tank: '島輝的家',  text: 'UVB 燈管關閉',     tone: 'violet' },
  { t: '20:00', tank: '島輝的家',  text: '晚間噴霧 5 秒',     tone: 'sky' },
  { t: '21:00', tank: '斗宅的家',  text: '加熱燈關閉',       tone: 'amber' },
  { t: '22:00', tank: '島輝的家',  text: '陶瓷加熱燈關閉',   tone: 'amber' },
  { t: '明日 06:00', tank: '島輝的家', text: '加熱燈啟動',     tone: 'amber' },
];

window.RC_DATA = { NOW, TANKS, ACTIVITY, UPCOMING };
