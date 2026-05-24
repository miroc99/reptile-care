// Extra data — alert history, weekly schedule stats
// Appended to window.RC_DATA after src/data.jsx loads.

const ALERT_HISTORY = [
  // Active (unresolved)
  { id: 'h1', level: 'high',  status: 'active',   time: '18:42', date: '今日', tank: '島Z的家', tankId: 'shimaz',  metric: 'temp', value: 32.8, threshold: 31, message: '熱區溫度超過上限 31°C', duration: '12 分鐘' },
  { id: 'h2', level: 'mid',   status: 'active',   time: '17:10', date: '今日', tank: '島Z的家', tankId: 'shimaz',  metric: 'hum',  value: 38,   threshold: 40, message: '濕度低於下限 40%', duration: '1 小時 44 分' },

  // Recent resolved
  { id: 'h3', level: 'mid',   status: 'resolved', time: '14:08', date: '今日', tank: '斗宅的家', tankId: 'douzhai', metric: 'temp', value: 30.3, threshold: 30, message: '溫度短暫超過上限', duration: '8 分鐘' },
  { id: 'h4', level: 'low',   status: 'resolved', time: '09:22', date: '今日', tank: '島輝的家', tankId: 'shimaki', metric: 'hum',  value: 71,   threshold: 70, message: '噴霧後濕度暫時偏高', duration: '4 分鐘' },
  { id: 'h5', level: 'mid',   status: 'resolved', time: '22:14', date: '昨日', tank: '島Z的家', tankId: 'shimaz',  metric: 'temp', value: 33.1, threshold: 31, message: '加熱燈未關閉', duration: '23 分鐘' },
  { id: 'h6', level: 'low',   status: 'resolved', time: '11:30', date: '昨日', tank: '斗宅的家', tankId: 'douzhai', metric: 'hum',  value: 39,   threshold: 40, message: '濕度短暫偏低', duration: '6 分鐘' },
  { id: 'h7', level: 'high',  status: 'resolved', time: '03:12', date: '5/22', tank: '島Z的家', tankId: 'shimaz',  metric: 'temp', value: 25.4, threshold: 27, message: '夜間溫度過低', duration: '47 分鐘' },
  { id: 'h8', level: 'mid',   status: 'resolved', time: '15:48', date: '5/22', tank: '島輝的家', tankId: 'shimaki', metric: 'temp', value: 32.6, threshold: 32, message: '溫度短暫超出', duration: '11 分鐘' },
  { id: 'h9', level: 'low',   status: 'resolved', time: '19:01', date: '5/21', tank: '斗宅的家', tankId: 'douzhai', metric: 'hum',  value: 56,   threshold: 55, message: '濕度上限突破 1%', duration: '3 分鐘' },
  { id: 'h10', level: 'high', status: 'resolved', time: '08:45', date: '5/20', tank: '島Z的家', tankId: 'shimaz',  metric: 'temp', value: 34.2, threshold: 31, message: '溫度峰值', duration: '32 分鐘' },
];

// Alerts by hour for past 7 days (24h heatmap)
const ALERT_HEATMAP = Array.from({ length: 7 }, (_, d) =>
  Array.from({ length: 24 }, (_, h) => {
    // Synthetic: more at night for some, peaks at 14-18
    const pulses = [3, 14, 17, 22];
    const dist = Math.min(...pulses.map(p => Math.abs(p - h)));
    const base = Math.max(0, 3 - dist * 0.6);
    const noise = ((d * 7 + h * 13) % 5) / 5;
    return Math.round(base * (0.6 + noise));
  })
);

// Stat aggregates
const ALERT_STATS = {
  active: 2,
  last24h: 4,
  last7d: 18,
  avgResolveMin: 14,
  bySeverity: { high: 3, mid: 9, low: 6 },
  bySource: [
    { tank: '島Z的家', count: 11, tone: 'violet' },
    { tank: '島輝的家', count: 4, tone: 'amber' },
    { tank: '斗宅的家', count: 3, tone: 'sage' },
  ],
};

// Today's schedule actions aggregate
const SCHEDULE_STATS = {
  todayActions: 22,
  activeNow: 6,
  nextAction: { time: '19:00', text: 'UVB 燈管關閉', tank: '島輝的家', tone: 'violet' },
  autoCoverage: 92,
};

window.RC_DATA.ALERT_HISTORY = ALERT_HISTORY;
window.RC_DATA.ALERT_HEATMAP = ALERT_HEATMAP;
window.RC_DATA.ALERT_STATS = ALERT_STATS;
window.RC_DATA.SCHEDULE_STATS = SCHEDULE_STATS;
