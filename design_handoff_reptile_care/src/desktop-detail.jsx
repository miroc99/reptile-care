// 爬蟲環控系統 · Desktop · TankDetail (control + schedule + alerts)
// Mounted onto window.TankDetail by desktop app.

const { useState: _useState } = React;

function TankDetail({ id, setRoute }) {
  const tank = window.RC_DATA.TANKS.find((t) => t.id === id) || window.RC_DATA.TANKS[0];
  const [tab, setTab] = _useState('control'); // control | schedule | alerts
  const [devices, setDevices] = _useState(tank.devices);
  const health = tankHealth(tank);
  const tStat = tempStatus(tank);
  const hStat = humStatus(tank);
  const tone = tank.avatar.tone;

  return (
    <div className="col gap-5">
      {/* Hero */}
      <div className="glass" style={{ padding: 28, display: 'flex', gap: 28, alignItems: 'center' }}>
        <Avatar tank={tank} size={88}/>
        <div className="col" style={{ flex: 1, gap: 8 }}>
          <div className="row gap-3">
            <div className="t-display" style={{ fontSize: 28 }}>{tank.name}</div>
            <div className={`pill ${health.tone}`}><span className="dot"/>{health.label}</div>
          </div>
          <div style={{ color: 'var(--ink-2)', fontSize: 14 }}>
            {tank.species} · <span style={{ fontStyle: 'italic', color: 'var(--ink-3)' }}>{tank.speciesLatin}</span>
          </div>
          <div className="t-mono" style={{ fontSize: 12, color: 'var(--ink-3)' }}>{tank.location}</div>
        </div>
        <div className="row gap-2">
          <div className="iconbtn"><Icon name="settings" size={16}/></div>
          <div className="iconbtn"><Icon name="feed" size={16}/></div>
        </div>
      </div>

      {/* Top row: gauges + 24h chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.4fr', gap: 16 }}>
        <div className="glass" style={{ padding: 22, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <ArcGauge
            value={tank.current.temp}
            min={20} max={40}
            lo={tank.target.temp[0]} hi={tank.target.temp[1]}
            color={`var(--${tStat.tone})`}
            size={200}
            label="溫度" unit="°C"
            sublabel={`目標 ${tank.target.temp[0]}–${tank.target.temp[1]}°C`}
          />
          <ThresholdBar
            value={tank.current.temp}
            min={20} max={40}
            lo={tank.target.temp[0]} hi={tank.target.temp[1]}
            color={`var(--${tStat.tone})`}
            unit="°C"
          />
        </div>

        <div className="glass" style={{ padding: 22, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <ArcGauge
            value={tank.current.hum}
            min={20} max={90}
            lo={tank.target.hum[0]} hi={tank.target.hum[1]}
            color={`var(--${hStat.tone})`}
            size={200}
            label="濕度" unit="%"
            sublabel={`目標 ${tank.target.hum[0]}–${tank.target.hum[1]}%`}
          />
          <ThresholdBar
            value={tank.current.hum}
            min={20} max={90}
            lo={tank.target.hum[0]} hi={tank.target.hum[1]}
            color={`var(--${hStat.tone})`}
            unit="%"
          />
        </div>

        <div className="glass" style={{ padding: 22 }}>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
            <div className="t-display" style={{ fontSize: 15 }}>24 小時走勢</div>
            <div className="row gap-2">
              <span className="t-mono" style={{ fontSize: 10, color: `var(--${tStat.tone})` }}>● 溫度</span>
              <span className="t-mono" style={{ fontSize: 10, color: `var(--${hStat.tone})` }}>● 濕度</span>
            </div>
          </div>
          <TwoLineChart
            tempSeries={tank.trend24h.temp}
            humSeries={tank.trend24h.hum}
            target={tank.target}
            tStat={tStat} hStat={hStat}
          />
        </div>
      </div>

      {/* Tabs: 手動控制 / 排程 / 告警設定 */}
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="tabs">
          <div className={`tab ${tab === 'control' ? 'active' : ''}`} onClick={() => setTab('control')}>手動控制</div>
          <div className={`tab ${tab === 'schedule' ? 'active' : ''}`} onClick={() => setTab('schedule')}>排程</div>
          <div className={`tab ${tab === 'alerts' ? 'active' : ''}`} onClick={() => setTab('alerts')}>告警設定</div>
        </div>
        <div className="row gap-2">
          {tab === 'control' && <div className="pill amber"><Icon name="tool" size={11}/>覆寫排程</div>}
          {tab === 'schedule' && <div className="pill"><Icon name="plus" size={11}/>新增排程</div>}
          {tab === 'alerts' && <div className="pill"><Icon name="check" size={11}/>已啟用</div>}
        </div>
      </div>

      {tab === 'control' && <ControlPanel devices={devices} setDevices={setDevices}/>}
      {tab === 'schedule' && <SchedulePanel tank={tank}/>}
      {tab === 'alerts' && <AlertsPanel tank={tank}/>}

      {/* Bottom row: feeding + recent alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <FeedingLog tank={tank}/>
        <RecentAlerts tank={tank}/>
      </div>
    </div>
  );
}

// ── Threshold bar ────────────────────────────────────────
function ThresholdBar({ value, min, max, lo, hi, color, unit }) {
  const t = (v) => `${((v - min) / (max - min)) * 100}%`;
  return (
    <div style={{ width: '100%', marginTop: 18 }}>
      <div className="range-track">
        <div className="range-fill" style={{ left: t(lo), right: `calc(100% - ${t(hi)})`, background: `color-mix(in oklch, ${color} 35%, transparent)` }}/>
        <div className="range-marker" style={{ left: t(value), background: color, boxShadow: `0 0 8px ${color}` }}/>
      </div>
      <div className="row" style={{ justifyContent: 'space-between', marginTop: 8 }}>
        <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>{min}{unit}</div>
        <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{lo}–{hi}{unit}</div>
        <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>{max}{unit}</div>
      </div>
    </div>
  );
}

// ── Two-line chart ───────────────────────────────────────
function TwoLineChart({ tempSeries, humSeries, target, tStat, hStat }) {
  const W = 460, H = 200, pad = 16;
  const tMin = 22, tMax = 36;
  const hMin = 30, hMax = 75;
  const innerW = W - pad * 2, innerH = H - pad * 2 - 18;
  const xs = tempSeries.length - 1;
  const xt = (i) => pad + (i / xs) * innerW;
  const yT = (v) => pad + innerH - ((v - tMin) / (tMax - tMin)) * innerH;
  const yH = (v) => pad + innerH - ((v - hMin) / (hMax - hMin)) * innerH;
  const tempPath = tempSeries.map((v, i) => `${i === 0 ? 'M' : 'L'}${xt(i)},${yT(v)}`).join(' ');
  const humPath  = humSeries.map((v, i) => `${i === 0 ? 'M' : 'L'}${xt(i)},${yH(v)}`).join(' ');
  const tColor = `var(--${tStat.tone})`;
  const hColor = `var(--${hStat.tone})`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 200 }}>
      <defs>
        <linearGradient id="tgrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={tColor} stopOpacity="0.35"/>
          <stop offset="100%" stopColor={tColor} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {/* Target band for temp */}
      <rect x={pad} y={yT(target.temp[1])} width={innerW} height={yT(target.temp[0]) - yT(target.temp[1])}
            fill={tColor} opacity="0.06" rx="3"/>
      {/* Grid */}
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1={pad} x2={W - pad} y1={pad + (innerH / 4) * i} y2={pad + (innerH / 4) * i}
              stroke="rgba(255,255,255,0.04)" strokeDasharray="2 4"/>
      ))}
      {/* Temp fill + line */}
      <path d={`${tempPath} L${xt(xs)},${pad + innerH} L${xt(0)},${pad + innerH} Z`} fill="url(#tgrad)"/>
      <path d={tempPath} fill="none" stroke={tColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Hum line */}
      <path d={humPath} fill="none" stroke={hColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 3" opacity="0.85"/>
      {/* x labels */}
      {['00','06','12','18','24'].map((l, i) => (
        <text key={l} x={pad + (innerW / 4) * i} y={H - 4} fill="rgba(255,255,255,0.32)"
              fontSize="9" fontFamily="JetBrains Mono, monospace" textAnchor="middle">{l}</text>
      ))}
    </svg>
  );
}

// ── Control panel ───────────────────────────────────────
function ControlPanel({ devices, setDevices }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
      {devices.map((d, i) => (
        <div key={d.id} className="glass" style={{ padding: 20 }}>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: d.on ? `color-mix(in oklch, var(--${d.tone}) 20%, transparent)` : 'rgba(255,255,255,0.03)',
              color: d.on ? `var(--${d.tone})` : 'var(--ink-4)',
              border: `1px solid ${d.on ? `color-mix(in oklch, var(--${d.tone}) 40%, transparent)` : 'var(--glass-border)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 220ms',
            }}>
              <Icon name={deviceIcon(d)} size={20}/>
            </div>
            <Toggle on={d.on} tone={d.tone} onChange={(v) => {
              const next = [...devices]; next[i] = { ...d, on: v }; setDevices(next);
            }}/>
          </div>
          <div className="t-display" style={{ fontSize: 15, marginBottom: 2 }}>{d.name}</div>
          <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 14 }}>{d.locationHint}</div>
          {d.power !== undefined && (
            <div className="col gap-2">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>強度</div>
                <div className="t-num" style={{ fontSize: 13, color: d.on ? `var(--${d.tone})` : 'var(--ink-4)' }}>{d.on ? d.power : 0}<span style={{ fontSize: 10, color: 'var(--ink-4)', marginLeft: 2 }}>%</span></div>
              </div>
              <div className="range-track">
                <div className="range-fill" style={{ left: 0, right: `${100 - (d.on ? d.power : 0)}%`, background: d.on ? `var(--${d.tone})` : 'var(--ink-4)', opacity: 0.7 }}/>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Schedule timeline (24h) ─────────────────────────────
function SchedulePanel({ tank }) {
  const hours = Array.from({ length: 25 }, (_, i) => i);
  const grouped = {};
  tank.schedule.forEach((s) => {
    if (!grouped[s.device]) grouped[s.device] = [];
    grouped[s.device].push(s);
  });
  return (
    <div className="glass" style={{ padding: 22 }}>
      {/* Hour ruler */}
      <div className="row" style={{ marginLeft: 130, marginBottom: 8, justifyContent: 'space-between' }}>
        {[0, 4, 8, 12, 16, 20, 24].map((h) => (
          <div key={h} className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>
            {String(h).padStart(2, '0')}:00
          </div>
        ))}
      </div>
      <div className="col gap-3">
        {Object.entries(grouped).map(([device, segs]) => (
          <div key={device} className="row gap-3">
            <div className="row gap-2" style={{ width: 130 }}>
              <span className="dot" style={{ color: `var(--${segs[0].tone})` }}/>
              <span style={{ fontSize: 12 }}>{device}</span>
            </div>
            <div className="sched-row" style={{ flex: 1 }}>
              {segs.map((s, i) => (
                <div key={i} className="sched-seg" style={{
                  left:  `${(s.start / 24) * 100}%`,
                  width: `${Math.max(((s.end - s.start) / 24) * 100, 1)}%`,
                  background: `linear-gradient(180deg, color-mix(in oklch, var(--${s.tone}) 70%, transparent), color-mix(in oklch, var(--${s.tone}) 40%, transparent))`,
                  boxShadow: `inset 0 0 0 1px color-mix(in oklch, var(--${s.tone}) 60%, transparent)`,
                }}/>
              ))}
              {/* Now indicator */}
              <div style={{
                position: 'absolute', top: -4, bottom: -4,
                left: `${(18.9 / 24) * 100}%`,
                width: 2, background: 'var(--ink-1)',
                boxShadow: '0 0 6px rgba(255,255,255,0.6)',
              }}/>
            </div>
          </div>
        ))}
      </div>
      <div className="row" style={{ marginTop: 16, justifyContent: 'space-between' }}>
        <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>白色標記為目前時間</div>
        <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>排程下次更新 21:00</div>
      </div>
    </div>
  );
}

// ── Alert thresholds panel ──────────────────────────────
function AlertsPanel({ tank }) {
  const thresholds = [
    { key: 'tempLo', label: '溫度下限', current: tank.target.temp[0], unit: '°C', tone: 'sky', icon: 'thermometer' },
    { key: 'tempHi', label: '溫度上限', current: tank.target.temp[1], unit: '°C', tone: 'crimson', icon: 'thermometer' },
    { key: 'humLo',  label: '濕度下限', current: tank.target.hum[0],  unit: '%',  tone: 'amber', icon: 'drop' },
    { key: 'humHi',  label: '濕度上限', current: tank.target.hum[1],  unit: '%',  tone: 'sky', icon: 'drop' },
  ];
  const channels = [
    { id: 'push', name: '推播通知', on: true },
    { id: 'mail', name: '電子郵件', on: true },
    { id: 'line', name: 'LINE 訊息', on: false },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>
      <div className="glass" style={{ padding: 22 }}>
        <div className="t-display" style={{ fontSize: 15, marginBottom: 16 }}>警報閾值</div>
        <div className="col gap-4">
          {thresholds.map((t) => (
            <div key={t.key} className="row gap-3">
              <div style={{
                width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                background: `color-mix(in oklch, var(--${t.tone}) 14%, transparent)`,
                color: `var(--${t.tone})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name={t.icon} size={15}/>
              </div>
              <div className="col" style={{ flex: 1, gap: 6 }}>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 13 }}>{t.label}</div>
                  <div className="t-num" style={{ fontSize: 14, color: `var(--${t.tone})` }}>{t.current}<span style={{ fontSize: 10, color: 'var(--ink-3)', marginLeft: 2 }}>{t.unit}</span></div>
                </div>
                <div className="range-track" style={{ height: 4 }}>
                  <div className="range-fill" style={{ left: 0, right: `${100 - (t.current / (t.key.includes('temp') ? 40 : 90)) * 100}%`, background: `var(--${t.tone})`, opacity: 0.7 }}/>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="glass" style={{ padding: 22 }}>
        <div className="t-display" style={{ fontSize: 15, marginBottom: 16 }}>通知管道</div>
        <div className="col gap-3">
          {channels.map((c) => (
            <div key={c.id} className="row" style={{ justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="col" style={{ gap: 2 }}>
                <div style={{ fontSize: 13 }}>{c.name}</div>
                <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>{c.on ? '已連結' : '未設定'}</div>
              </div>
              <Toggle on={c.on} onChange={() => {}} tone="amber"/>
            </div>
          ))}
        </div>
        <div className="col gap-2" style={{ marginTop: 16, padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.02)' }}>
          <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>升級提醒</div>
          <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>連續 15 分鐘超出上限時觸發第二次警報。</div>
        </div>
      </div>
    </div>
  );
}

// ── Feeding / Health log ────────────────────────────────
function FeedingLog({ tank }) {
  return (
    <div className="glass" style={{ padding: 22 }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
        <div className="t-display" style={{ fontSize: 15 }}>飼養紀錄</div>
        <div className="iconbtn" style={{ width: 28, height: 28 }}><Icon name="plus" size={14}/></div>
      </div>
      <div className="col gap-4">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div className="col" style={{ gap: 2 }}>
            <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>上次餵食</div>
            <div style={{ fontSize: 14 }}>{tank.feeding.last}</div>
          </div>
          <div className="col" style={{ gap: 2, textAlign: 'right' }}>
            <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>下次餵食</div>
            <div style={{ fontSize: 14, color: 'var(--amber)' }}>{tank.feeding.next}</div>
          </div>
        </div>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div className="col" style={{ gap: 2 }}>
            <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>上次脫皮</div>
            <div style={{ fontSize: 14 }}>{tank.health.lastShed}</div>
          </div>
          <div className="col" style={{ gap: 2, textAlign: 'right' }}>
            <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>體重</div>
            <div style={{ fontSize: 14 }}>{tank.health.weight}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Recent alerts list ──────────────────────────────────
function RecentAlerts({ tank }) {
  if (!tank.alerts.length) {
    return (
      <div className="glass" style={{ padding: 22, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: 8 }}>
        <div className="t-display" style={{ fontSize: 15 }}>近期警報</div>
        <div className="row gap-3" style={{ marginTop: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 999, background: 'color-mix(in oklch, var(--sage) 14%, transparent)', color: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={18}/>
          </div>
          <div className="col" style={{ gap: 2 }}>
            <div style={{ fontSize: 13 }}>過去 24 小時無警報</div>
            <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>環境穩定</div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="glass" style={{ padding: 22 }}>
      <div className="t-display" style={{ fontSize: 15, marginBottom: 16 }}>近期警報</div>
      <div className="col gap-3">
        {tank.alerts.map((a) => (
          <div key={a.id} className="row gap-3">
            <div style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: 'color-mix(in oklch, var(--crimson) 14%, transparent)',
              color: 'var(--crimson)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="alert" size={15}/>
            </div>
            <div className="col" style={{ flex: 1, gap: 2 }}>
              <div style={{ fontSize: 13 }}>{a.message}</div>
              <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>{a.time} · 數值 {a.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

window.TankDetail = TankDetail;
