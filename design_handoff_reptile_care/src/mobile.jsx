// 爬蟲環控系統 · Mobile (iPhone) app
// Internal navigation between Dashboard and TankDetail.

const { useState: _m_useState } = React;
const { TANKS: MTANKS, ACTIVITY: MACT } = window.RC_DATA;

function MobileApp({ initialRoute }) {
  const [route, setRoute] = _m_useState(initialRoute || { name: 'dashboard' });
  return (
    <div className="app-root mobile" style={{ position: 'relative', height: '100%', width: '100%' }}>
      {route.name === 'dashboard' && <MDashboard setRoute={setRoute} />}
      {route.name === 'tank'      && <MTankDetail id={route.id} setRoute={setRoute} />}
      {route.name === 'schedule'  && <MSchedulePage setRoute={setRoute} />}
      {route.name === 'alerts'    && <MAlertsPage setRoute={setRoute} />}
      {route.name === 'settings'  && <MSettingsPage setRoute={setRoute} />}
    </div>
  );
}

// ── Mobile Dashboard ──────────────────────────────────────
function MDashboard({ setRoute }) {
  const total = MTANKS.length;
  const alerts = MTANKS.reduce((s, t) => s + t.alerts.length, 0);
  const onDev  = MTANKS.reduce((s, t) => s + t.devices.filter(d => d.on).length, 0);
  return (
    <div className="mobile-scroll" style={{ height: '100%', padding: '54px 16px 100px' }}>
      {/* Header */}
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div className="col" style={{ gap: 4 }}>
          <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.16em' }}>5月24日 · 週日</div>
          <div className="t-display" style={{ fontSize: 22, lineHeight: 1.15 }}>晚安<br/>今晚一切平靜</div>
        </div>
        <div className="row gap-2">
          <div className="iconbtn" style={{ width: 36, height: 36 }}><Icon name="search" size={15}/></div>
          <div className="iconbtn" style={{ width: 36, height: 36, position: 'relative' }}>
            <Icon name="bell" size={15}/>
            {alerts > 0 && <span style={{ position: 'absolute', top: 5, right: 6, width: 7, height: 7, borderRadius: 999, background: 'var(--crimson)' }}/>}
          </div>
        </div>
      </div>

      {/* Climate summary card */}
      <div className="glass" style={{ padding: 16, marginBottom: 14 }}>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
          <div className="t-label">綜合氣候</div>
          <div className="pill sage" style={{ padding: '3px 8px', fontSize: 10 }}>
            <span className="dot pulse" style={{ color: 'var(--sage)' }}/>運行中
          </div>
        </div>
        <div className="row gap-4" style={{ alignItems: 'baseline' }}>
          <div className="col" style={{ gap: 2 }}>
            <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>平均溫</div>
            <div className="kpi-value" style={{ fontSize: 28, color: 'var(--amber)' }}>30.6<span style={{ fontSize: 12, color: 'var(--ink-3)', marginLeft: 2 }}>°C</span></div>
          </div>
          <div className="col" style={{ gap: 2 }}>
            <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>平均濕</div>
            <div className="kpi-value" style={{ fontSize: 28, color: 'var(--sky)' }}>49<span style={{ fontSize: 12, color: 'var(--ink-3)', marginLeft: 2 }}>%</span></div>
          </div>
          <div style={{ flex: 1 }}/>
          <div style={{ width: 80 }}>
            <Sparkline values={MTANKS[0].trend24h.temp} color="var(--amber)" width={80} height={36}/>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
        <MiniStat label="飼養缸" value={total}    unit="缸" tone="amber"/>
        <MiniStat label="運行設備" value={onDev}   unit="件" tone="sky"/>
        <MiniStat label="警報"   value={alerts}  unit="則" tone={alerts ? 'crimson' : 'sage'}/>
      </div>

      {/* Tank list */}
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
        <div className="t-display" style={{ fontSize: 16 }}>飼養缸</div>
        <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{total} 缸</div>
      </div>
      <div className="col gap-3">
        {MTANKS.map((t) => <MTankRow key={t.id} tank={t} onOpen={() => setRoute({ name: 'tank', id: t.id })}/>)}
      </div>

      {/* Activity */}
      <div className="row" style={{ justifyContent: 'space-between', margin: '24px 0 12px' }}>
        <div className="t-display" style={{ fontSize: 16 }}>近期活動</div>
        <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>過去 12h</div>
      </div>
      <div className="glass" style={{ padding: 14 }}>
        <div className="col gap-3">
          {MACT.slice(0, 5).map((a, i) => (
            <div key={i} className="row gap-3">
              <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)', width: 32 }}>{a.t}</div>
              <div style={{
                width: 24, height: 24, borderRadius: 7, flexShrink: 0,
                background: `color-mix(in oklch, var(--${a.tone}) 14%, transparent)`,
                color: `var(--${a.tone})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name={a.icon} size={12}/>
              </div>
              <div className="col" style={{ flex: 1, gap: 0 }}>
                <div style={{ fontSize: 12 }}>{a.text}</div>
                <div className="t-mono" style={{ fontSize: 9, color: 'var(--ink-4)' }}>{a.tank}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <MobileBottomNav active="home" setRoute={setRoute}/>
    </div>
  );
}

function MiniStat({ label, value, unit, tone }) {
  return (
    <div className="glass" style={{ padding: 12 }}>
      <div className="t-mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.12em' }}>{label}</div>
      <div className="kpi-value" style={{ fontSize: 22, color: `var(--${tone})`, marginTop: 4 }}>
        {value}<span style={{ fontSize: 10, color: 'var(--ink-3)', marginLeft: 3 }}>{unit}</span>
      </div>
    </div>
  );
}

function MTankRow({ tank, onOpen }) {
  const tStat = tempStatus(tank);
  const hStat = humStatus(tank);
  const health = tankHealth(tank);
  const onCount = tank.devices.filter(d => d.on).length;
  return (
    <div className="glass tank-tile" onClick={onOpen} style={{ padding: 14 }}>
      <div className="row gap-3" style={{ marginBottom: 12 }}>
        <Avatar tank={tank} size={40}/>
        <div className="col" style={{ flex: 1, gap: 2, minWidth: 0 }}>
          <div className="t-display" style={{ fontSize: 14 }}>{tank.name}</div>
          <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tank.species} · {tank.location}</div>
        </div>
        <div className={`pill ${health.tone}`} style={{ fontSize: 10, padding: '3px 8px' }}>
          <span className="dot"/>{health.label}
        </div>
      </div>
      <div className="row" style={{ alignItems: 'flex-end', gap: 12 }}>
        <div className="col" style={{ flex: 1, gap: 2 }}>
          <div className="row gap-2">
            <Icon name="thermometer" size={11} style={{ color: `var(--${tStat.tone})` }}/>
            <span className="t-mono" style={{ fontSize: 9, color: 'var(--ink-3)' }}>溫度</span>
          </div>
          <div className="kpi-value" style={{ fontSize: 22, color: `var(--${tStat.tone})` }}>
            {tank.current.temp.toFixed(1)}<span style={{ fontSize: 10, color: 'var(--ink-3)', marginLeft: 2 }}>°C</span>
          </div>
          <div style={{ marginTop: 2 }}>
            <Sparkline values={tank.trend24h.temp} color={`var(--${tStat.tone})`} width={110} height={22}/>
          </div>
        </div>
        <div className="col" style={{ flex: 1, gap: 2 }}>
          <div className="row gap-2">
            <Icon name="drop" size={11} style={{ color: `var(--${hStat.tone})` }}/>
            <span className="t-mono" style={{ fontSize: 9, color: 'var(--ink-3)' }}>濕度</span>
          </div>
          <div className="kpi-value" style={{ fontSize: 22, color: `var(--${hStat.tone})` }}>
            {tank.current.hum}<span style={{ fontSize: 10, color: 'var(--ink-3)', marginLeft: 2 }}>%</span>
          </div>
          <div style={{ marginTop: 2 }}>
            <Sparkline values={tank.trend24h.hum} color={`var(--${hStat.tone})`} width={110} height={22}/>
          </div>
        </div>
      </div>
      <div className="row" style={{ marginTop: 10, justifyContent: 'space-between' }}>
        <div className="row gap-2">
          {tank.devices.slice(0, 4).map((d) => (
            <div key={d.id} style={{
              width: 22, height: 22, borderRadius: 6,
              background: d.on ? `color-mix(in oklch, var(--${d.tone}) 18%, transparent)` : 'rgba(255,255,255,0.025)',
              color: d.on ? `var(--${d.tone})` : 'var(--ink-4)',
              border: `1px solid ${d.on ? `color-mix(in oklch, var(--${d.tone}) 35%, transparent)` : 'var(--glass-border)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name={deviceIconM(d)} size={10}/>
            </div>
          ))}
        </div>
        <div className="row gap-1" style={{ color: 'var(--ink-3)', fontSize: 10 }}>
          {onCount}/{tank.devices.length} 運行
          <Icon name="chevron-right" size={11}/>
        </div>
      </div>
    </div>
  );
}

function deviceIconM(d) {
  if (d.type === 'heat') return 'lightbulb';
  if (d.type === 'light') return 'sun';
  if (d.type === 'humid') return 'mist';
  if (d.type === 'air') return 'fan';
  return 'pulse';
}

// ── Mobile Tank Detail ────────────────────────────────────
function MTankDetail({ id, setRoute }) {
  const tank = MTANKS.find((t) => t.id === id) || MTANKS[0];
  const [tab, setTab] = _m_useState('overview');
  const [devices, setDevices] = _m_useState(tank.devices);
  const tStat = tempStatus(tank);
  const hStat = humStatus(tank);
  const health = tankHealth(tank);

  return (
    <div className="mobile-scroll" style={{ height: '100%', padding: '54px 0 100px' }}>
      {/* Header */}
      <div className="row" style={{ padding: '0 16px', justifyContent: 'space-between', marginBottom: 16 }}>
        <div className="iconbtn" onClick={() => setRoute({ name: 'dashboard' })}>
          <Icon name="chevron-left" size={16}/>
        </div>
        <div className="t-label">飼養缸詳情</div>
        <div className="iconbtn"><Icon name="settings" size={15}/></div>
      </div>

      {/* Hero */}
      <div style={{ padding: '0 16px', marginBottom: 18 }}>
        <div className="row gap-3" style={{ marginBottom: 14 }}>
          <Avatar tank={tank} size={56}/>
          <div className="col" style={{ flex: 1, gap: 2 }}>
            <div className="t-display" style={{ fontSize: 20 }}>{tank.name}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{tank.species}</div>
            <div className="t-mono" style={{ fontSize: 9, color: 'var(--ink-4)' }}>{tank.location}</div>
          </div>
          <div className={`pill ${health.tone}`} style={{ fontSize: 10, padding: '3px 8px' }}>
            <span className="dot"/>{health.label}
          </div>
        </div>

        {/* Big readings */}
        <div className="row gap-3">
          <div className="glass" style={{ flex: 1, padding: 14 }}>
            <div className="row gap-2" style={{ marginBottom: 6 }}>
              <Icon name="thermometer" size={12} style={{ color: `var(--${tStat.tone})` }}/>
              <span className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>溫度</span>
              <span className="t-mono" style={{ fontSize: 9, color: `var(--${tStat.tone})`, marginLeft: 'auto' }}>{tStat.label}</span>
            </div>
            <div className="kpi-value" style={{ fontSize: 30, color: `var(--${tStat.tone})` }}>
              {tank.current.temp.toFixed(1)}<span style={{ fontSize: 12, color: 'var(--ink-3)' }}>°C</span>
            </div>
            <div className="t-mono" style={{ fontSize: 9, color: 'var(--ink-4)', marginTop: 4 }}>
              目標 {tank.target.temp[0]}–{tank.target.temp[1]}°C
            </div>
          </div>
          <div className="glass" style={{ flex: 1, padding: 14 }}>
            <div className="row gap-2" style={{ marginBottom: 6 }}>
              <Icon name="drop" size={12} style={{ color: `var(--${hStat.tone})` }}/>
              <span className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>濕度</span>
              <span className="t-mono" style={{ fontSize: 9, color: `var(--${hStat.tone})`, marginLeft: 'auto' }}>{hStat.label}</span>
            </div>
            <div className="kpi-value" style={{ fontSize: 30, color: `var(--${hStat.tone})` }}>
              {tank.current.hum}<span style={{ fontSize: 12, color: 'var(--ink-3)' }}>%</span>
            </div>
            <div className="t-mono" style={{ fontSize: 9, color: 'var(--ink-4)', marginTop: 4 }}>
              目標 {tank.target.hum[0]}–{tank.target.hum[1]}%
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: '0 16px', marginBottom: 14 }}>
        <div className="tabs" style={{ width: '100%', justifyContent: 'space-between' }}>
          {[
            ['overview', '即時'],
            ['control',  '控制'],
            ['schedule', '排程'],
            ['alerts',   '警報'],
          ].map(([k, l]) => (
            <div key={k} className={`tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)} style={{ flex: 1, textAlign: 'center', fontSize: 12, padding: '8px 6px' }}>{l}</div>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        {tab === 'overview' && <MOverview tank={tank} tStat={tStat} hStat={hStat}/>}
        {tab === 'control'  && <MControl devices={devices} setDevices={setDevices}/>}
        {tab === 'schedule' && <MSchedule tank={tank}/>}
        {tab === 'alerts'   && <MAlerts tank={tank}/>}
      </div>

      <MobileBottomNav active="tanks" setRoute={setRoute}/>
    </div>
  );
}

// Mobile Overview tab
function MOverview({ tank, tStat, hStat }) {
  return (
    <div className="col gap-3">
      <div className="glass" style={{ padding: 16 }}>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
          <div className="t-display" style={{ fontSize: 13 }}>24 小時走勢</div>
          <div className="row gap-2">
            <span className="t-mono" style={{ fontSize: 9, color: `var(--${tStat.tone})` }}>● 溫</span>
            <span className="t-mono" style={{ fontSize: 9, color: `var(--${hStat.tone})` }}>● 濕</span>
          </div>
        </div>
        <TwoLineChart tempSeries={tank.trend24h.temp} humSeries={tank.trend24h.hum} target={tank.target} tStat={tStat} hStat={hStat}/>
      </div>

      <div className="glass" style={{ padding: 16 }}>
        <div className="t-display" style={{ fontSize: 13, marginBottom: 12 }}>飼養紀錄</div>
        <div className="col gap-3">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>上次餵食</div>
            <div style={{ fontSize: 13 }}>{tank.feeding.last}</div>
          </div>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>下次餵食</div>
            <div style={{ fontSize: 13, color: 'var(--amber)' }}>{tank.feeding.next}</div>
          </div>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>上次脫皮</div>
            <div style={{ fontSize: 13 }}>{tank.health.lastShed}</div>
          </div>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>體重</div>
            <div style={{ fontSize: 13 }}>{tank.health.weight}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mobile Control tab
function MControl({ devices, setDevices }) {
  return (
    <div className="col gap-3">
      {devices.map((d, i) => (
        <div key={d.id} className="glass" style={{ padding: 14 }}>
          <div className="row gap-3" style={{ alignItems: 'center' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 11,
              background: d.on ? `color-mix(in oklch, var(--${d.tone}) 20%, transparent)` : 'rgba(255,255,255,0.03)',
              color: d.on ? `var(--${d.tone})` : 'var(--ink-4)',
              border: `1px solid ${d.on ? `color-mix(in oklch, var(--${d.tone}) 40%, transparent)` : 'var(--glass-border)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'all 220ms',
            }}>
              <Icon name={deviceIconM(d)} size={17}/>
            </div>
            <div className="col" style={{ flex: 1, gap: 2 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{d.name}</div>
              <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{d.locationHint}</div>
            </div>
            <Toggle on={d.on} tone={d.tone} onChange={(v) => {
              const next = [...devices]; next[i] = { ...d, on: v }; setDevices(next);
            }}/>
          </div>
          {d.power !== undefined && (
            <div className="col gap-2" style={{ marginTop: 12 }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>強度</div>
                <div className="t-num" style={{ fontSize: 12, color: d.on ? `var(--${d.tone})` : 'var(--ink-4)' }}>{d.on ? d.power : 0}<span style={{ fontSize: 9, color: 'var(--ink-4)', marginLeft: 2 }}>%</span></div>
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

// Mobile Schedule tab — compact 24h timeline
function MSchedule({ tank }) {
  const grouped = {};
  tank.schedule.forEach((s) => {
    if (!grouped[s.device]) grouped[s.device] = [];
    grouped[s.device].push(s);
  });
  return (
    <div className="glass" style={{ padding: 16 }}>
      <div className="row" style={{ marginLeft: 84, marginBottom: 6, justifyContent: 'space-between' }}>
        {['00','06','12','18','24'].map((h) => (
          <div key={h} className="t-mono" style={{ fontSize: 9, color: 'var(--ink-4)' }}>{h}</div>
        ))}
      </div>
      <div className="col gap-3">
        {Object.entries(grouped).map(([device, segs]) => (
          <div key={device} className="row gap-2">
            <div className="row gap-1" style={{ width: 84, fontSize: 11 }}>
              <span className="dot" style={{ color: `var(--${segs[0].tone})` }}/>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{device}</span>
            </div>
            <div className="sched-row" style={{ flex: 1, height: 22 }}>
              {segs.map((s, i) => (
                <div key={i} className="sched-seg" style={{
                  left:  `${(s.start / 24) * 100}%`,
                  width: `${Math.max(((s.end - s.start) / 24) * 100, 1)}%`,
                  background: `linear-gradient(180deg, color-mix(in oklch, var(--${s.tone}) 70%, transparent), color-mix(in oklch, var(--${s.tone}) 40%, transparent))`,
                  boxShadow: `inset 0 0 0 1px color-mix(in oklch, var(--${s.tone}) 60%, transparent)`,
                }}/>
              ))}
              <div style={{
                position: 'absolute', top: -3, bottom: -3,
                left: `${(18.9 / 24) * 100}%`, width: 2,
                background: 'var(--ink-1)', boxShadow: '0 0 5px rgba(255,255,255,0.6)',
              }}/>
            </div>
          </div>
        ))}
      </div>
      <div className="t-mono" style={{ fontSize: 9, color: 'var(--ink-4)', marginTop: 12 }}>
        白色標記為目前時間 · 點擊段落編輯
      </div>
    </div>
  );
}

// Mobile Alerts tab
function MAlerts({ tank }) {
  const thresholds = [
    { key: 'tempLo', label: '溫度下限', current: tank.target.temp[0], unit: '°C', tone: 'sky' },
    { key: 'tempHi', label: '溫度上限', current: tank.target.temp[1], unit: '°C', tone: 'crimson' },
    { key: 'humLo',  label: '濕度下限', current: tank.target.hum[0],  unit: '%',  tone: 'amber' },
    { key: 'humHi',  label: '濕度上限', current: tank.target.hum[1],  unit: '%',  tone: 'sky' },
  ];
  return (
    <div className="col gap-3">
      <div className="glass" style={{ padding: 16 }}>
        <div className="t-display" style={{ fontSize: 13, marginBottom: 12 }}>警報閾值</div>
        <div className="col gap-3">
          {thresholds.map((t) => (
            <div key={t.key} className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="row gap-2">
                <span className="dot" style={{ color: `var(--${t.tone})` }}/>
                <span style={{ fontSize: 12 }}>{t.label}</span>
              </div>
              <div className="t-num" style={{ fontSize: 14, color: `var(--${t.tone})` }}>
                {t.current}<span style={{ fontSize: 10, color: 'var(--ink-3)', marginLeft: 2 }}>{t.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass" style={{ padding: 16 }}>
        <div className="t-display" style={{ fontSize: 13, marginBottom: 12 }}>近期警報</div>
        {tank.alerts.length === 0 ? (
          <div className="row gap-3" style={{ alignItems: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: 999, background: 'color-mix(in oklch, var(--sage) 14%, transparent)', color: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="check" size={15}/>
            </div>
            <div className="col" style={{ gap: 2 }}>
              <div style={{ fontSize: 12 }}>過去 24 小時無警報</div>
              <div className="t-mono" style={{ fontSize: 9, color: 'var(--ink-3)' }}>環境穩定</div>
            </div>
          </div>
        ) : (
          <div className="col gap-3">
            {tank.alerts.map((a) => (
              <div key={a.id} className="row gap-3">
                <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: 'color-mix(in oklch, var(--crimson) 14%, transparent)', color: 'var(--crimson)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="alert" size={13}/>
                </div>
                <div className="col" style={{ flex: 1, gap: 2 }}>
                  <div style={{ fontSize: 12 }}>{a.message}</div>
                  <div className="t-mono" style={{ fontSize: 9, color: 'var(--ink-4)' }}>{a.time} · 數值 {a.value}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass" style={{ padding: 16 }}>
        <div className="t-display" style={{ fontSize: 13, marginBottom: 12 }}>通知管道</div>
        <div className="col gap-3">
          {[{n:'推播通知', on:true}, {n:'電子郵件', on:true}, {n:'LINE 訊息', on:false}].map((c, i) => (
            <div key={i} className="row" style={{ justifyContent: 'space-between' }}>
              <div style={{ fontSize: 12 }}>{c.n}</div>
              <Toggle on={c.on} onChange={() => {}}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Bottom nav (floating) ─────────────────────────────────
function MobileBottomNav({ active, setRoute }) {
  const { TANKS } = window.RC_DATA;
  const items = [
    { id: 'home',    icon: 'dashboard', label: '總覽',   go: () => setRoute && setRoute({ name: 'dashboard' }) },
    { id: 'tanks',   icon: 'tank',      label: '飼養缸', go: () => setRoute && setRoute({ name: 'tank', id: TANKS[0].id }) },
    { id: 'schedule',icon: 'schedule',  label: '排程',   go: () => setRoute && setRoute({ name: 'schedule' }) },
    { id: 'alerts',  icon: 'bell',      label: '告警',   go: () => setRoute && setRoute({ name: 'alerts' }) },
    { id: 'settings',icon: 'settings',  label: '設定',   go: () => setRoute && setRoute({ name: 'settings' }) },
  ];
  return (
    <div style={{
      position: 'absolute',
      left: 12, right: 12, bottom: 14,
      borderRadius: 24,
      background: 'rgba(20, 16, 12, 0.7)',
      backdropFilter: 'blur(24px) saturate(160%)',
      border: '1px solid var(--glass-border)',
      padding: '8px 6px',
      display: 'flex', justifyContent: 'space-around',
      zIndex: 30,
    }}>
      {items.map((it) => {
        const isActive = it.id === active;
        return (
          <div key={it.id} onClick={it.go} className="col" style={{
            alignItems: 'center', gap: 2, padding: '6px 10px',
            color: isActive ? 'var(--amber)' : 'var(--ink-3)',
            cursor: 'pointer',
          }}>
            <Icon name={it.icon} size={18}/>
            <div style={{ fontSize: 9, fontWeight: 500 }}>{it.label}</div>
          </div>
        );
      })}
    </div>
  );
}

window.MobileApp = MobileApp;
