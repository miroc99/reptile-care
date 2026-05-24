// Settings data — relay channels, sensors, logs, system info

const RELAYS = [
  { ch: 1,  label: '島輝-加熱燈',  tank: '島輝的家', tankId: 'shimaki', device: '陶瓷加熱燈', gpio: 'GPIO 17', state: 'on',  mode: 'auto',   lastToggle: '18:30', power: 65,  current: 0.42, errors: 0 },
  { ch: 2,  label: '島輝-加熱墊',  tank: '島輝的家', tankId: 'shimaki', device: '加熱墊',     gpio: 'GPIO 27', state: 'on',  mode: 'auto',   lastToggle: '00:00', power: 40,  current: 0.18, errors: 0 },
  { ch: 3,  label: '島輝-UVB',     tank: '島輝的家', tankId: 'shimaki', device: 'UVB 5.0',    gpio: 'GPIO 22', state: 'on',  mode: 'auto',   lastToggle: '07:00', power: 100, current: 0.31, errors: 0 },
  { ch: 4,  label: '島輝-噴霧',    tank: '島輝的家', tankId: 'shimaki', device: '自動噴霧',   gpio: 'GPIO 23', state: 'off', mode: 'auto',   lastToggle: '20:00 (昨)', power: 0, current: 0, errors: 0 },
  { ch: 5,  label: '島輝-排風扇',  tank: '島輝的家', tankId: 'shimaki', device: '排風扇',     gpio: 'GPIO 24', state: 'off', mode: 'auto',   lastToggle: '14:20 (昨)', power: 0, current: 0, errors: 0 },
  { ch: 6,  label: '斗宅-加熱燈',  tank: '斗宅的家', tankId: 'douzhai', device: '加熱燈',     gpio: 'GPIO 5',  state: 'on',  mode: 'auto',   lastToggle: '06:00', power: 55,  current: 0.36, errors: 0 },
  { ch: 7,  label: '斗宅-加熱墊',  tank: '斗宅的家', tankId: 'douzhai', device: '加熱墊備用', gpio: 'GPIO 6',  state: 'off', mode: 'manual', lastToggle: '--', power: 0,   current: 0, errors: 0 },
  { ch: 8,  label: '斗宅-UVB 2.0', tank: '斗宅的家', tankId: 'douzhai', device: 'UVB 2.0',    gpio: 'GPIO 12', state: 'off', mode: 'auto',   lastToggle: '19:00 (昨)', power: 0, current: 0, errors: 0 },
  { ch: 9,  label: '斗宅-排風扇',  tank: '斗宅的家', tankId: 'douzhai', device: '排風扇',     gpio: 'GPIO 13', state: 'on',  mode: 'auto',   lastToggle: '14:00', power: 30,  current: 0.14, errors: 0 },
  { ch: 10, label: '島Z-加熱燈',   tank: '島Z的家', tankId: 'shimaz',  device: '加熱燈',     gpio: 'GPIO 19', state: 'on',  mode: 'auto',   lastToggle: '06:00', power: 85,  current: 0.51, errors: 2 },
  { ch: 11, label: '島Z-加熱墊',   tank: '島Z的家', tankId: 'shimaz',  device: '加熱墊',     gpio: 'GPIO 26', state: 'on',  mode: 'auto',   lastToggle: '00:00', power: 60,  current: 0.27, errors: 0 },
  { ch: 12, label: '島Z-噴霧器',   tank: '島Z的家', tankId: 'shimaz',  device: '噴霧器',     gpio: 'GPIO 16', state: 'off', mode: 'auto',   lastToggle: '09:00', power: 0,   current: 0, errors: 0 },
  { ch: 13, label: '備用',         tank: null,       tankId: null,      device: null,         gpio: 'GPIO 20', state: 'off', mode: 'manual', lastToggle: '--', power: 0, current: 0, errors: 0 },
  { ch: 14, label: '備用',         tank: null,       tankId: null,      device: null,         gpio: 'GPIO 21', state: 'off', mode: 'manual', lastToggle: '--', power: 0, current: 0, errors: 0 },
  { ch: 15, label: '備用',         tank: null,       tankId: null,      device: null,         gpio: 'GPIO 25', state: 'off', mode: 'manual', lastToggle: '--', power: 0, current: 0, errors: 0 },
  { ch: 16, label: '備用',         tank: null,       tankId: null,      device: null,         gpio: 'GPIO 18', state: 'off', mode: 'manual', lastToggle: '--', power: 0, current: 0, errors: 0 },
];

const SENSORS = [
  { id: 'S-01', model: 'SHT31',     bus: 'I²C', addr: '0x44', tank: '島輝的家', tankId: 'shimaki', metric: 'temp+hum', raw: { t: 30.42, h: 62.13 }, cal: { t: 30.4, h: 62 }, offset: '−0.02°C / 0%', sampleHz: '1 Hz', errorRate: 0.0,  signal: 99, status: 'ok' },
  { id: 'S-02', model: 'DS18B20',   bus: '1-Wire', addr: '28-3a-c2-04', tank: '島輝的家', tankId: 'shimaki', metric: 'temp (基板)', raw: { t: 31.95 }, cal: { t: 32.0 }, offset: '+0.05°C', sampleHz: '0.5 Hz', errorRate: 0.0, signal: 100, status: 'ok' },
  { id: 'S-03', model: 'SHT31',     bus: 'I²C', addr: '0x45', tank: '斗宅的家', tankId: 'douzhai', metric: 'temp+hum', raw: { t: 28.61, h: 48.22 }, cal: { t: 28.6, h: 48 }, offset: '−0.01°C / 0%', sampleHz: '1 Hz', errorRate: 0.0, signal: 98, status: 'ok' },
  { id: 'S-04', model: 'DHT22',     bus: 'GPIO', addr: 'GPIO 4', tank: '斗宅的家', tankId: 'douzhai', metric: 'temp+hum (備用)', raw: { t: 28.5, h: 47.8 }, cal: { t: 28.5, h: 48 }, offset: '0 / +0.2%', sampleHz: '0.2 Hz', errorRate: 1.2, signal: 87, status: 'ok' },
  { id: 'S-05', model: 'BME280',    bus: 'I²C', addr: '0x76', tank: '島Z的家', tankId: 'shimaz',  metric: 'temp+hum+氣壓', raw: { t: 32.78, h: 38.04, p: 1012.4 }, cal: { t: 32.8, h: 38, p: 1012 }, offset: '0 / 0 / 0', sampleHz: '1 Hz', errorRate: 0.3, signal: 96, status: 'warn' },
  { id: 'S-06', model: 'DS18B20',   bus: '1-Wire', addr: '28-9f-b1-15', tank: '島Z的家', tankId: 'shimaz', metric: 'temp (熱區點測)', raw: { t: 33.21 }, cal: { t: 33.2 }, offset: '−0.01°C', sampleHz: '0.5 Hz', errorRate: 0.0, signal: 100, status: 'ok' },
  { id: 'S-07', model: 'HC-SR04',   bus: 'GPIO', addr: 'GPIO 14/15', tank: null, tankId: null, metric: '水位 (儲水桶)', raw: { d: 8.4 }, cal: { d: 8.4 }, offset: '0 cm', sampleHz: '0.1 Hz', errorRate: 0.0, signal: 100, status: 'ok' },
];

const LOGS = [
  { t: '18:54:12', level: 'INFO',  src: 'scheduler', msg: '排程觸發：島輝-噴霧 倒數 65 分鐘' },
  { t: '18:42:33', level: 'WARN',  src: 'sensors',   msg: 'S-05 BME280 溫度 32.8°C 超過上限 31°C — 觸發告警 #h1' },
  { t: '18:42:33', level: 'ERROR', src: 'alerts',    msg: '告警通知失敗：LINE webhook timeout (channel: shimaz)' },
  { t: '18:42:21', level: 'INFO',  src: 'relay',     msg: 'CH10 島Z-加熱燈 維持 ON power=85%' },
  { t: '18:30:01', level: 'INFO',  src: 'scheduler', msg: 'CH3 島輝-UVB 啟動 (排程 daily 07:00–19:00)' },
  { t: '18:00:00', level: 'INFO',  src: 'mqtt',      msg: '心跳 → broker.local:1883 OK · latency 14ms' },
  { t: '17:30:44', level: 'INFO',  src: 'sensors',   msg: 'S-04 DHT22 重試成功 (重試 1/3)' },
  { t: '17:10:18', level: 'WARN',  src: 'sensors',   msg: 'S-05 BME280 濕度 38% 低於下限 40% — 觸發告警 #h2' },
  { t: '17:05:12', level: 'DEBUG', src: 'system',    msg: 'free heap = 184 KB · CPU temp = 52.3°C' },
  { t: '16:00:00', level: 'INFO',  src: 'mqtt',      msg: '心跳 → broker.local:1883 OK · latency 12ms' },
  { t: '15:48:09', level: 'INFO',  src: 'scheduler', msg: '島輝-噴霧 動作 5 秒' },
  { t: '14:08:22', level: 'WARN',  src: 'sensors',   msg: 'S-03 SHT31 溫度短暫超出 — 8 分鐘後自動解除' },
  { t: '14:00:00', level: 'INFO',  src: 'scheduler', msg: 'CH9 斗宅-排風扇 啟動' },
  { t: '13:45:30', level: 'INFO',  src: 'system',    msg: '自動排程同步完成 · 22 動作 / 16 通道' },
  { t: '12:00:01', level: 'DEBUG', src: 'system',    msg: 'daily checkpoint · uptime 14d 6h · 0 panic' },
  { t: '09:22:11', level: 'WARN',  src: 'sensors',   msg: 'S-01 SHT31 濕度短暫偏高 71% (噴霧後)' },
  { t: '08:00:05', level: 'INFO',  src: 'scheduler', msg: 'CH4 島輝-噴霧 動作 5 秒' },
  { t: '07:00:00', level: 'INFO',  src: 'scheduler', msg: '燈光週期啟動 · sunrise 07:00 sunset 19:08' },
  { t: '06:00:00', level: 'INFO',  src: 'scheduler', msg: '加熱燈群組啟動 (CH1, CH6, CH10)' },
  { t: '03:12:08', level: 'ERROR', src: 'sensors',   msg: '昨日 S-06 DS18B20 連線失敗 retry x3 · 已恢復' },
];

const SYSTEM_INFO = {
  hostname:  'reptile-ctrl.local',
  ip:        '192.168.1.42',
  ssid:      'home-iot-5g',
  rssi:      -54,
  firmware:  'v2.4.1 (build 1248)',
  upgrade:   { available: true, version: 'v2.5.0' },
  uptime:    '14 天 6 小時 32 分',
  cpu:       28,
  memUsed:   58,
  memTotal:  '512 MB',
  cpuTemp:   52.3,
  storage:   42,
  storageTotal: '32 GB',
  mqtt:      { host: 'broker.local:1883', status: 'connected', latency: 14, topics: 24 },
  database:  { size: '8.4 MB', records: 184_320, retention: '30 天' },
  loadAvg:   [0.18, 0.24, 0.21],
};

window.RC_DATA.RELAYS = RELAYS;
window.RC_DATA.SENSORS = SENSORS;
window.RC_DATA.LOGS = LOGS;
window.RC_DATA.SYSTEM_INFO = SYSTEM_INFO;
