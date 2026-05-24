// 爬蟲環控系統 · Desktop · System Settings
// Internal section navigation: overview | relays | sensors | logs | network | backup

const { useState: _set_useState, useEffect: _set_useEffect } = React;

function DesktopSettings() {
  const [section, setSection] = _set_useState('overview');

  const sections = [
    { id: 'overview', icon: 'dashboard',  label: '系統概覽', sub: '主機 · 韌體 · 效能' },
    { id: 'relays',   icon: 'tool',       label: '繼電器通道', sub: '16 通道對映 · 手動測試' },
    { id: 'sensors',  icon: 'thermometer',label: '感測器原始數據', sub: 'Live raw / cal · 採樣' },
    { id: 'logs',     icon: 'pulse',      label: '系統日誌', sub: '事件流 · 過濾 · 匯出' },
    { id: 'network',  icon: 'feed',       label: '網路與通訊', sub: 'Wi-Fi · MQTT · API' },
    { id: 'backup',   icon: 'check',      label: '備份與還原', sub: '設定 · 資料庫' },
  ];

  return (
    <div className="col gap-5">
      {/* Header */}
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="col" style={{ gap: 4 }}>
          <div className="t-display" style={{ fontSize: 22 }}>系統設定</div>
          <div className="t-mono" style={{ color: 'var(--ink-3)', fontSize: 12 }}>
            reptile-ctrl.local · 192.168.1.42 · v2.4.1
          </div>
        </div>
        <div className="row gap-2">
          <div className="pill sage"><span className="dot pulse" style={{ color: 'var(--sage)' }}/>系統運行中</div>
          <div className="iconbtn"><Icon name="search" size={15}/></div>
        </div>
      </div>

      {/* Two-col: sidebar + content */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 16, alignItems: 'flex-start' }}>
        {/* Sidebar */}
        <div className="glass" style={{ padding: 12 }}>
          <div className="col gap-1">
            {sections.map((s) => (
              <div key={s.id} onClick={() => setSection(s.id)} style={{
                padding: '11px 12px',
                borderRadius: 12,
                cursor: 'pointer',
                background: section === s.id ? 'color-mix(in oklch, var(--amber) 14%, transparent)' : 'transparent',
                color: section === s.id ? 'var(--amber)' : 'var(--ink-2)',
                transition: 'background 160ms',
              }}>
                <div className="row gap-3" style={{ alignItems: 'center' }}>
                  <Icon name={s.icon} size={16}/>
                  <div className="col" style={{ gap: 1, flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{s.label}</div>
                    <div className="t-mono" style={{ fontSize: 9, color: section === s.id ? 'color-mix(in oklch, var(--amber) 70%, transparent)' : 'var(--ink-4)' }}>{s.sub}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="col gap-4">
          {section === 'overview' && <OverviewSection/>}
          {section === 'relays'   && <RelaysSection/>}
          {section === 'sensors'  && <SensorsSection/>}
          {section === 'logs'     && <LogsSection/>}
          {section === 'network'  && <NetworkSection/>}
          {section === 'backup'   && <BackupSection/>}
        </div>
      </div>
    </div>
  );
}

// ── Overview section ───────────────────────────────────
function OverviewSection() {
  const sys = window.RC_DATA.SYSTEM_INFO;
  return (
    <div className="col gap-4">
      {/* Stat strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <MetricCard label="CPU"        value={sys.cpu}      unit="%"  tone="amber" sub={`負載 ${sys.loadAvg.join(' / ')}`}/>
        <MetricCard label="記憶體"      value={sys.memUsed}  unit="%"  tone="sky"   sub={sys.memTotal}/>
        <MetricCard label="儲存"        value={sys.storage}  unit="%"  tone="violet" sub={sys.storageTotal}/>
        <MetricCard label="CPU 溫度"    value={sys.cpuTemp}  unit="°C" tone="sage"  sub="正常範圍"/>
      </div>

      {/* Two columns: device + connectivity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="glass" style={{ padding: 22 }}>
          <div className="t-display" style={{ fontSize: 15, marginBottom: 16 }}>主機資訊</div>
          <div className="col gap-3">
            <InfoRow label="主機名稱" value={sys.hostname} mono/>
            <InfoRow label="IP 位址" value={sys.ip} mono/>
            <InfoRow label="韌體版本" value={sys.firmware} mono extra={sys.upgrade.available && <div className="pill amber" style={{ fontSize: 9, padding: '2px 7px' }}>有更新 {sys.upgrade.version}</div>}/>
            <InfoRow label="運行時間" value={sys.uptime}/>
            <InfoRow label="資料庫" value={`${sys.database.size} · ${(sys.database.records / 1000).toFixed(0)}k 筆記錄`} sub={`保留 ${sys.database.retention}`}/>
          </div>
        </div>

        <div className="glass" style={{ padding: 22 }}>
          <div className="t-display" style={{ fontSize: 15, marginBottom: 16 }}>連線狀態</div>
          <div className="col gap-3">
            <InfoRow
              label="Wi-Fi"
              value={sys.ssid}
              mono
              extra={<div className="t-mono" style={{ fontSize: 10, color: 'var(--sage)' }}>RSSI {sys.rssi} dBm</div>}
            />
            <InfoRow
              label="MQTT Broker"
              value={sys.mqtt.host}
              mono
              extra={
                <div className="pill sage" style={{ fontSize: 9, padding: '2px 7px' }}>
                  <span className="dot pulse" style={{ color: 'var(--sage)' }}/>
                  已連線 · {sys.mqtt.latency} ms
                </div>
              }
            />
            <InfoRow label="MQTT Topics" value={`${sys.mqtt.topics} 訂閱中`}/>
            <InfoRow label="網際網路" value="可連線" extra={<span className="dot" style={{ color: 'var(--sage)' }}/>}/>
            <InfoRow label="同步時鐘" value="time.cloudflare.com" mono sub="偏移 +0.3 ms"/>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, unit, tone, sub }) {
  return (
    <div className="glass" style={{ padding: 16 }}>
      <div className="t-label" style={{ marginBottom: 8 }}>{label}</div>
      <div className="kpi-value" style={{ fontSize: 28, color: `var(--${tone})` }}>
        {value}<span style={{ fontSize: 11, color: 'var(--ink-3)', marginLeft: 3 }}>{unit}</span>
      </div>
      <div className="range-track" style={{ height: 3, marginTop: 8 }}>
        <div className="range-fill" style={{ left: 0, right: `${100 - (typeof value === 'number' ? value : 0)}%`, background: `var(--${tone})`, opacity: 0.7 }}/>
      </div>
      <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 8 }}>{sub}</div>
    </div>
  );
}

function InfoRow({ label, value, mono, sub, extra }) {
  return (
    <div className="row gap-3" style={{ alignItems: 'center', padding: '4px 0' }}>
      <div className="t-label" style={{ width: 110 }}>{label}</div>
      <div className="col" style={{ flex: 1, gap: 1 }}>
        <div className={mono ? 't-mono' : ''} style={{ fontSize: 13 }}>{value}</div>
        {sub && <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>{sub}</div>}
      </div>
      {extra}
    </div>
  );
}

// ── Relays section ─────────────────────────────────────
function RelaysSection() {
  const [relays, setRelays] = _set_useState(window.RC_DATA.RELAYS);
  const used = relays.filter(r => r.tank).length;
  const onCount = relays.filter(r => r.state === 'on').length;
  const errorCount = relays.filter(r => r.errors > 0).length;

  const toggle = (ch) => setRelays(rs => rs.map(r => r.ch === ch ? { ...r, state: r.state === 'on' ? 'off' : 'on' } : r));

  return (
    <div className="col gap-4">
      {/* Header strip */}
      <div className="row gap-3">
        <div className="glass" style={{ flex: 1, padding: 16 }}>
          <div className="t-label">通道使用</div>
          <div className="kpi-value" style={{ fontSize: 24, marginTop: 4 }}>
            <span style={{ color: 'var(--amber)' }}>{used}</span>
            <span style={{ fontSize: 14, color: 'var(--ink-3)' }}> / {relays.length}</span>
          </div>
        </div>
        <div className="glass" style={{ flex: 1, padding: 16 }}>
          <div className="t-label">目前運行</div>
          <div className="kpi-value" style={{ fontSize: 24, marginTop: 4, color: 'var(--sage)' }}>{onCount}<span style={{ fontSize: 12, color: 'var(--ink-3)', marginLeft: 4 }}>件</span></div>
        </div>
        <div className="glass" style={{ flex: 1, padding: 16 }}>
          <div className="t-label">需注意</div>
          <div className="kpi-value" style={{ fontSize: 24, marginTop: 4, color: errorCount > 0 ? 'var(--crimson)' : 'var(--sage)' }}>{errorCount}<span style={{ fontSize: 12, color: 'var(--ink-3)', marginLeft: 4 }}>{errorCount > 0 ? '件錯誤' : '一切正常'}</span></div>
        </div>
        <div className="glass" style={{ flex: 1, padding: 16, alignItems: 'flex-start', justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
          <div className="t-label">硬體</div>
          <div className="t-mono" style={{ fontSize: 12, color: 'var(--ink-1)', marginTop: 4 }}>16-CH Relay Module</div>
          <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>I²C 0x20 · 5V</div>
        </div>
      </div>

      {/* Table */}
      <div className="glass" style={{ overflow: 'hidden', padding: 0 }}>
        <div className="row" style={{ padding: '14px 22px', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
          <div className="t-display" style={{ fontSize: 14, flex: 1 }}>通道對映</div>
          <div className="iconbtn" style={{ width: 'auto', padding: '0 12px', height: 30, gap: 5, fontSize: 11 }}>
            <Icon name="plus" size={12}/>新增設備
          </div>
        </div>
        {/* Column headers */}
        <div className="row" style={{
          padding: '10px 22px',
          background: 'rgba(255,255,255,0.015)',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}>
          <div className="t-label" style={{ width: 38 }}>CH</div>
          <div className="t-label" style={{ width: 80 }}>GPIO</div>
          <div className="t-label" style={{ flex: 1.6 }}>對映設備</div>
          <div className="t-label" style={{ width: 60 }}>狀態</div>
          <div className="t-label" style={{ width: 70 }}>模式</div>
          <div className="t-label" style={{ width: 100 }}>上次切換</div>
          <div className="t-label" style={{ width: 80, textAlign: 'right' }}>動作</div>
        </div>
        {relays.map((r) => (
          <RelayRow key={r.ch} r={r} onToggle={() => toggle(r.ch)}/>
        ))}
      </div>
    </div>
  );
}

function RelayRow({ r, onToggle }) {
  const assigned = !!r.tank;
  const tone = r.state === 'on' ? 'amber' : 'ink-4';
  return (
    <div className="row" style={{
      padding: '12px 22px',
      borderBottom: '1px solid rgba(255,255,255,0.03)',
      alignItems: 'center',
      background: r.errors > 0 ? 'color-mix(in oklch, var(--crimson) 4%, transparent)' : 'transparent',
    }}>
      <div className="t-mono" style={{ width: 38, fontSize: 13, color: 'var(--ink-2)' }}>
        {String(r.ch).padStart(2, '0')}
      </div>
      <div className="t-mono" style={{ width: 80, fontSize: 10, color: 'var(--ink-3)' }}>{r.gpio}</div>
      <div className="col" style={{ flex: 1.6, gap: 1 }}>
        <div style={{ fontSize: 13, color: assigned ? 'var(--ink-1)' : 'var(--ink-4)' }}>
          {assigned ? r.device : <span style={{ fontStyle: 'italic' }}>未指派</span>}
        </div>
        <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>
          {assigned ? r.tank : r.label}
        </div>
      </div>
      <div style={{ width: 60 }}>
        <div className="row gap-2" style={{ alignItems: 'center' }}>
          <span style={{
            display: 'inline-block', width: 8, height: 8, borderRadius: 999,
            background: r.state === 'on' ? 'var(--amber)' : 'rgba(255,255,255,0.15)',
            boxShadow: r.state === 'on' ? '0 0 8px var(--amber)' : 'none',
          }}/>
          <span className="t-mono" style={{ fontSize: 11, color: r.state === 'on' ? 'var(--amber)' : 'var(--ink-4)' }}>
            {r.state === 'on' ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>
      <div style={{ width: 70 }}>
        <div className="pill" style={{ fontSize: 9, padding: '2px 7px', color: r.mode === 'auto' ? 'var(--sky)' : 'var(--amber)', borderColor: `color-mix(in oklch, var(--${r.mode === 'auto' ? 'sky' : 'amber'}) 30%, transparent)`, background: `color-mix(in oklch, var(--${r.mode === 'auto' ? 'sky' : 'amber'}) 8%, transparent)` }}>
          {r.mode.toUpperCase()}
        </div>
      </div>
      <div className="t-mono" style={{ width: 100, fontSize: 10, color: 'var(--ink-3)' }}>{r.lastToggle}</div>
      <div className="row gap-2" style={{ width: 80, justifyContent: 'flex-end' }}>
        {r.errors > 0 && (
          <div title={`${r.errors} 次錯誤`} style={{ color: 'var(--crimson)' }}>
            <Icon name="alert" size={13}/>
          </div>
        )}
        <div onClick={onToggle} className="iconbtn" style={{ width: 30, height: 28, fontSize: 10 }} title="切換">
          <Icon name="pulse" size={12}/>
        </div>
      </div>
    </div>
  );
}

// ── Sensors section ────────────────────────────────────
function SensorsSection() {
  const sensors = window.RC_DATA.SENSORS;
  const [tick, setTick] = _set_useState(0);
  _set_useEffect(() => {
    const i = setInterval(() => setTick(t => t + 1), 1500);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="col gap-4">
      <div className="row gap-3">
        <div className="glass" style={{ flex: 1, padding: 16 }}>
          <div className="t-label">感測器</div>
          <div className="kpi-value" style={{ fontSize: 24, marginTop: 4, color: 'var(--amber)' }}>{sensors.length}<span style={{ fontSize: 12, color: 'var(--ink-3)', marginLeft: 4 }}>顆</span></div>
        </div>
        <div className="glass" style={{ flex: 1, padding: 16 }}>
          <div className="t-label">採樣率</div>
          <div className="kpi-value" style={{ fontSize: 24, marginTop: 4, color: 'var(--sky)' }}>5.7<span style={{ fontSize: 12, color: 'var(--ink-3)', marginLeft: 4 }}>Hz 總</span></div>
        </div>
        <div className="glass" style={{ flex: 1, padding: 16 }}>
          <div className="t-label">平均誤差率</div>
          <div className="kpi-value" style={{ fontSize: 24, marginTop: 4, color: 'var(--sage)' }}>0.21<span style={{ fontSize: 12, color: 'var(--ink-3)', marginLeft: 4 }}>%</span></div>
        </div>
        <div className="glass" style={{ flex: 1, padding: 16 }}>
          <div className="t-label">需要校正</div>
          <div className="kpi-value" style={{ fontSize: 24, marginTop: 4, color: 'var(--amber)' }}>1<span style={{ fontSize: 12, color: 'var(--ink-3)', marginLeft: 4 }}>顆</span></div>
        </div>
      </div>

      {/* Table-like grid */}
      <div className="glass" style={{ overflow: 'hidden', padding: 0 }}>
        <div className="row" style={{ padding: '14px 22px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="t-display" style={{ fontSize: 14, flex: 1 }}>即時讀數</div>
          <div className="row gap-3" style={{ color: 'var(--ink-3)', fontSize: 11 }}>
            <span className="t-mono"><span className="dot pulse" style={{ color: 'var(--sage)' }}/> Live</span>
            <span className="t-mono">每 1.5s 更新</span>
          </div>
        </div>
        <div className="row" style={{ padding: '10px 22px', background: 'rgba(255,255,255,0.015)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="t-label" style={{ width: 60 }}>ID</div>
          <div className="t-label" style={{ width: 100 }}>型號</div>
          <div className="t-label" style={{ width: 140 }}>匯流排 / 位址</div>
          <div className="t-label" style={{ flex: 1 }}>位置 / 量測</div>
          <div className="t-label" style={{ width: 140 }}>原始值 (raw)</div>
          <div className="t-label" style={{ width: 130 }}>校正後 / 偏移</div>
          <div className="t-label" style={{ width: 110 }}>採樣 / 誤差</div>
          <div className="t-label" style={{ width: 60, textAlign: 'right' }}>狀態</div>
        </div>
        {sensors.map((s) => <SensorRow key={s.id} s={s} tick={tick}/>)}
      </div>
    </div>
  );
}

function SensorRow({ s, tick }) {
  // Add a tiny live "noise" to the raw value to simulate live updates
  const noise = (Math.sin(tick / 2 + s.id.charCodeAt(2)) * 0.04);
  const rawT = s.raw.t !== undefined ? (s.raw.t + noise).toFixed(2) : null;
  const rawH = s.raw.h !== undefined ? (s.raw.h + noise * 8).toFixed(2) : null;
  const rawP = s.raw.p !== undefined ? (s.raw.p + noise).toFixed(1) : null;
  const rawD = s.raw.d !== undefined ? (s.raw.d + noise).toFixed(2) : null;
  const stOk = s.status === 'ok';
  return (
    <div className="row" style={{
      padding: '12px 22px',
      borderBottom: '1px solid rgba(255,255,255,0.03)',
      alignItems: 'center',
      background: s.status === 'warn' ? 'color-mix(in oklch, var(--amber) 4%, transparent)' : 'transparent',
    }}>
      <div className="t-mono" style={{ width: 60, fontSize: 11, color: 'var(--ink-2)' }}>{s.id}</div>
      <div className="t-mono" style={{ width: 100, fontSize: 11 }}>{s.model}</div>
      <div className="col" style={{ width: 140, gap: 1 }}>
        <div className="t-mono" style={{ fontSize: 10, color: 'var(--sky)' }}>{s.bus}</div>
        <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{s.addr}</div>
      </div>
      <div className="col" style={{ flex: 1, gap: 1 }}>
        <div style={{ fontSize: 12, color: s.tank ? 'var(--ink-1)' : 'var(--ink-4)' }}>{s.tank || '未指派'}</div>
        <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{s.metric}</div>
      </div>
      <div className="col" style={{ width: 140, gap: 1 }}>
        {rawT !== null && <div className="t-mono" style={{ fontSize: 11, color: 'var(--amber)' }}>T = {rawT}</div>}
        {rawH !== null && <div className="t-mono" style={{ fontSize: 11, color: 'var(--sky)' }}>H = {rawH}</div>}
        {rawP !== null && <div className="t-mono" style={{ fontSize: 11, color: 'var(--violet)' }}>P = {rawP}</div>}
        {rawD !== null && <div className="t-mono" style={{ fontSize: 11, color: 'var(--sage)' }}>D = {rawD} cm</div>}
      </div>
      <div className="col" style={{ width: 130, gap: 1 }}>
        {s.cal.t !== undefined && <div className="t-mono" style={{ fontSize: 11 }}>{s.cal.t}°C</div>}
        {s.cal.h !== undefined && <div className="t-mono" style={{ fontSize: 11 }}>{s.cal.h}%</div>}
        {s.cal.p !== undefined && <div className="t-mono" style={{ fontSize: 11 }}>{s.cal.p} hPa</div>}
        {s.cal.d !== undefined && <div className="t-mono" style={{ fontSize: 11 }}>{s.cal.d} cm</div>}
        <div className="t-mono" style={{ fontSize: 9, color: 'var(--ink-4)' }}>偏移 {s.offset}</div>
      </div>
      <div className="col" style={{ width: 110, gap: 1 }}>
        <div className="t-mono" style={{ fontSize: 11, color: 'var(--sky)' }}>{s.sampleHz}</div>
        <div className="t-mono" style={{ fontSize: 9, color: s.errorRate > 1 ? 'var(--amber)' : 'var(--ink-4)' }}>err {s.errorRate}%</div>
      </div>
      <div className="row gap-2" style={{ width: 60, justifyContent: 'flex-end' }}>
        <div className="t-mono" style={{ fontSize: 10, color: stOk ? 'var(--sage)' : 'var(--amber)' }}>{s.signal}%</div>
        <span className="dot pulse" style={{ color: stOk ? 'var(--sage)' : 'var(--amber)' }}/>
      </div>
    </div>
  );
}

// ── Logs section ───────────────────────────────────────
function LogsSection() {
  const allLogs = window.RC_DATA.LOGS;
  const [level, setLevel] = _set_useState('all');
  const [src, setSrc] = _set_useState('all');
  const [tail, setTail] = _set_useState(true);

  const sources = Array.from(new Set(allLogs.map(l => l.src)));
  const filtered = allLogs.filter((l) => {
    if (level !== 'all' && l.level !== level) return false;
    if (src !== 'all' && l.src !== src) return false;
    return true;
  });

  const levelColor = (l) => l === 'ERROR' ? 'crimson' : l === 'WARN' ? 'amber' : l === 'INFO' ? 'sky' : 'ink-4';

  const counts = {
    all: allLogs.length,
    ERROR: allLogs.filter(l => l.level === 'ERROR').length,
    WARN:  allLogs.filter(l => l.level === 'WARN').length,
    INFO:  allLogs.filter(l => l.level === 'INFO').length,
    DEBUG: allLogs.filter(l => l.level === 'DEBUG').length,
  };

  return (
    <div className="col gap-4">
      {/* Filter bar */}
      <div className="glass" style={{ padding: 16 }}>
        <div className="row gap-3" style={{ alignItems: 'center' }}>
          <div className="row gap-2">
            {[
              ['all', '全部', 'ink-2'],
              ['ERROR', 'ERROR', 'crimson'],
              ['WARN', 'WARN', 'amber'],
              ['INFO', 'INFO', 'sky'],
              ['DEBUG', 'DEBUG', 'ink-4'],
            ].map(([k, l, c]) => (
              <div key={k} onClick={() => setLevel(k)} style={{
                padding: '6px 12px', borderRadius: 999, cursor: 'pointer',
                fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
                background: level === k ? `color-mix(in oklch, var(--${c}) 14%, transparent)` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${level === k ? `color-mix(in oklch, var(--${c}) 35%, transparent)` : 'var(--glass-border)'}`,
                color: level === k ? `var(--${c})` : 'var(--ink-3)',
              }}>{l} <span style={{ opacity: 0.6, marginLeft: 4 }}>{counts[k]}</span></div>
            ))}
          </div>
          <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.06)' }}/>
          <div className="row gap-2">
            <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>來源</div>
            <select value={src} onChange={(e) => setSrc(e.target.value)} style={{
              background: 'rgba(255,255,255,0.04)', color: 'var(--ink-1)',
              border: '1px solid var(--glass-border)', borderRadius: 8,
              padding: '5px 10px', fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
            }}>
              <option value="all">全部</option>
              {sources.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}/>
          <div onClick={() => setTail(!tail)} style={{
            padding: '6px 12px', borderRadius: 999, cursor: 'pointer', fontSize: 11,
            background: tail ? 'color-mix(in oklch, var(--sage) 14%, transparent)' : 'rgba(255,255,255,0.03)',
            color: tail ? 'var(--sage)' : 'var(--ink-3)',
            border: `1px solid ${tail ? 'color-mix(in oklch, var(--sage) 35%, transparent)' : 'var(--glass-border)'}`,
          }}>
            <span className="dot pulse" style={{ color: tail ? 'var(--sage)' : 'var(--ink-4)', marginRight: 4 }}/>
            Tail
          </div>
          <div className="iconbtn" style={{ width: 'auto', padding: '0 12px', height: 30, gap: 5, fontSize: 11 }}>
            <Icon name="arrow-down" size={12}/>匯出 .log
          </div>
        </div>
      </div>

      {/* Log stream */}
      <div className="glass" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="t-mono" style={{
          fontSize: 11, padding: 0, maxHeight: 520, overflow: 'auto',
        }}>
          {filtered.map((l, i) => {
            const c = levelColor(l.level);
            return (
              <div key={i} style={{
                display: 'flex', gap: 16, padding: '7px 22px',
                borderBottom: '1px solid rgba(255,255,255,0.025)',
                background: l.level === 'ERROR' ? 'color-mix(in oklch, var(--crimson) 5%, transparent)' : 'transparent',
                alignItems: 'baseline',
              }}>
                <div style={{ color: 'var(--ink-4)', width: 80, flexShrink: 0 }}>{l.t}</div>
                <div style={{ color: `var(--${c})`, width: 60, flexShrink: 0, fontWeight: 500 }}>{l.level}</div>
                <div style={{ color: 'var(--ink-3)', width: 80, flexShrink: 0 }}>[{l.src}]</div>
                <div style={{ color: 'var(--ink-1)', flex: 1, whiteSpace: 'pre-wrap' }}>{l.msg}</div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--ink-3)' }}>過濾條件下無記錄</div>
          )}
        </div>
        <div className="row" style={{ padding: '8px 22px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
          <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)', flex: 1 }}>
            顯示 {filtered.length} / {allLogs.length} 行 · 緩衝區 1,024 行 · 持久化儲存 30 天
          </div>
          <div className="t-mono" style={{ fontSize: 10, color: 'var(--sage)' }}>
            <span className="dot pulse" style={{ color: 'var(--sage)' }}/> connected
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Network section ────────────────────────────────────
function NetworkSection() {
  const sys = window.RC_DATA.SYSTEM_INFO;
  return (
    <div className="col gap-4">
      <div className="glass" style={{ padding: 22 }}>
        <div className="t-display" style={{ fontSize: 15, marginBottom: 16 }}>Wi-Fi 連線</div>
        <div className="col gap-3">
          <InfoRow label="SSID" value={sys.ssid} mono/>
          <InfoRow label="頻段" value="5 GHz · 802.11ax"/>
          <InfoRow label="訊號" value={`${sys.rssi} dBm`} mono extra={<div className="pill sage" style={{ fontSize: 9, padding: '2px 7px' }}>強度良好</div>}/>
          <InfoRow label="DHCP" value="192.168.1.42 / 24" mono sub="閘道 192.168.1.1 · DNS 1.1.1.1"/>
          <InfoRow label="MAC" value="A4:CF:12:34:56:78" mono/>
        </div>
      </div>

      <div className="glass" style={{ padding: 22 }}>
        <div className="t-display" style={{ fontSize: 15, marginBottom: 16 }}>MQTT Broker</div>
        <div className="col gap-3">
          <InfoRow
            label="Broker"
            value={sys.mqtt.host}
            mono
            extra={<div className="pill sage" style={{ fontSize: 9, padding: '2px 7px' }}><span className="dot pulse" style={{ color: 'var(--sage)' }}/>已連線</div>}
          />
          <InfoRow label="Client ID" value="reptile-ctrl-01" mono/>
          <InfoRow label="延遲" value={`${sys.mqtt.latency} ms`} mono sub="平均 12 ms · 14 d"/>
          <InfoRow label="訂閱 topic" value={`${sys.mqtt.topics} 個`} sub="reptile/+/sensor/+ · reptile/+/relay/+"/>
          <InfoRow label="QoS" value="1 (at least once)" mono/>
          <InfoRow label="保留訊息" value="開啟" extra={<Toggle on={true} onChange={() => {}} tone="sky"/>}/>
        </div>
      </div>

      <div className="glass" style={{ padding: 22 }}>
        <div className="t-display" style={{ fontSize: 15, marginBottom: 16 }}>API & 整合</div>
        <div className="col gap-3">
          <InfoRow label="本地 REST API" value="http://192.168.1.42/api/v2" mono sub="未開啟驗證 · 僅內網"/>
          <InfoRow label="Webhook" value="LINE Notify" extra={<div className="pill amber" style={{ fontSize: 9, padding: '2px 7px' }}>1 失敗</div>}/>
          <InfoRow label="Home Assistant" value="未連結" extra={<div className="iconbtn" style={{ width: 'auto', padding: '0 10px', height: 26, fontSize: 11 }}>連結</div>}/>
        </div>
      </div>
    </div>
  );
}

// ── Backup section ─────────────────────────────────────
function BackupSection() {
  return (
    <div className="col gap-4">
      <div className="glass" style={{ padding: 22 }}>
        <div className="t-display" style={{ fontSize: 15, marginBottom: 16 }}>設定備份</div>
        <div className="col gap-3">
          <div className="row" style={{ justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="col" style={{ gap: 2 }}>
              <div style={{ fontSize: 13 }}>自動每日備份</div>
              <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>每日 03:00 · 上次成功 03:00 (今晨)</div>
            </div>
            <Toggle on={true} onChange={() => {}} tone="sage"/>
          </div>
          <div className="row" style={{ justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="col" style={{ gap: 2 }}>
              <div style={{ fontSize: 13 }}>雲端同步</div>
              <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>未設定</div>
            </div>
            <Toggle on={false} onChange={() => {}}/>
          </div>
          <div className="row gap-3" style={{ marginTop: 8 }}>
            <div className="iconbtn" style={{ width: 'auto', padding: '0 14px', height: 36, gap: 6 }}>
              <Icon name="arrow-down" size={14}/><span style={{ fontSize: 12 }}>下載當前設定 (.json)</span>
            </div>
            <div className="iconbtn" style={{ width: 'auto', padding: '0 14px', height: 36, gap: 6 }}>
              <Icon name="arrow-up" size={14}/><span style={{ fontSize: 12 }}>還原備份檔</span>
            </div>
          </div>
        </div>
      </div>

      <div className="glass" style={{ padding: 22 }}>
        <div className="t-display" style={{ fontSize: 15, marginBottom: 16 }}>歷史記錄資料庫</div>
        <div className="col gap-3">
          <InfoRow label="目前大小" value="8.4 MB" mono/>
          <InfoRow label="記錄數" value="184,320 筆" mono sub="平均 13,165 / 缸 / 天"/>
          <InfoRow label="保留期" value="30 天" extra={<div className="iconbtn" style={{ width: 'auto', padding: '0 10px', height: 26, fontSize: 11 }}>調整</div>}/>
          <InfoRow label="採樣間隔" value="60 秒"/>
          <InfoRow label="匯出格式" value="CSV / JSON / InfluxDB line protocol" sub="可依時間範圍與飼養缸過濾"/>
        </div>
      </div>

      <div className="glass" style={{ padding: 22, borderColor: 'color-mix(in oklch, var(--crimson) 25%, transparent)' }}>
        <div className="t-display" style={{ fontSize: 15, marginBottom: 6, color: 'var(--crimson)' }}>危險區域</div>
        <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 16 }}>以下動作無法復原</div>
        <div className="row gap-3">
          <div className="iconbtn" style={{ width: 'auto', padding: '0 14px', height: 34, fontSize: 12, color: 'var(--crimson)', borderColor: 'color-mix(in oklch, var(--crimson) 30%, transparent)' }}>
            清空歷史資料
          </div>
          <div className="iconbtn" style={{ width: 'auto', padding: '0 14px', height: 34, fontSize: 12, color: 'var(--crimson)', borderColor: 'color-mix(in oklch, var(--crimson) 30%, transparent)' }}>
            還原原廠設定
          </div>
          <div className="iconbtn" style={{ width: 'auto', padding: '0 14px', height: 34, fontSize: 12, color: 'var(--crimson)', borderColor: 'color-mix(in oklch, var(--crimson) 30%, transparent)' }}>
            重新啟動裝置
          </div>
        </div>
      </div>
    </div>
  );
}

window.DesktopSettings = DesktopSettings;
