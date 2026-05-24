// 爬蟲環控系統 · Desktop app (Dashboard + TankDetail, internal navigation)
// Mounts into window.DesktopApp for use inside a DCArtboard.

const { useState, useEffect, useMemo } = React;
const { TANKS, ACTIVITY, UPCOMING } = window.RC_DATA;

// ───────────────────────────────────────────────────────────
// Desktop shell
// ───────────────────────────────────────────────────────────
function DesktopApp({ initialRoute }) {
  const [route, setRoute] = useState(initialRoute || { name: 'dashboard' });
  // routes: { name: 'dashboard' } | { name: 'tank', id } | { name: 'schedule' } | { name: 'alerts' }
  const [now, setNow] = useState(new Date('2026-05-24T18:54:00'));
  useEffect(() => {
    const i = setInterval(() => setNow((d) => new Date(d.getTime() + 1000)), 1000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="app-root desktop" style={{ display: 'flex' }}>
      <NavRail route={route} setRoute={setRoute} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar now={now} route={route} setRoute={setRoute} />
        <div className="scroll" style={{ flex: 1, padding: '8px 32px 32px' }}>
          {route.name === 'dashboard' && <Dashboard setRoute={setRoute} />}
          {route.name === 'tank' && <TankDetail id={route.id} setRoute={setRoute} />}
          {route.name === 'schedule' && <DesktopSchedule setRoute={setRoute} />}
          {route.name === 'alerts' && <DesktopAlerts setRoute={setRoute} />}
          {route.name === 'settings' && <DesktopSettings setRoute={setRoute} />}
        </div>
      </div>
    </div>
  );
}

// ── Left nav rail ─────────────────────────────────────────
function NavRail({ route, setRoute }) {
  const items = [
    { id: 'dashboard', icon: 'dashboard', label: '儀表板總覽', onClick: () => setRoute({ name: 'dashboard' }) },
    { id: 'tanks',     icon: 'tank',      label: '飼養缸',     onClick: () => setRoute({ name: 'tank', id: TANKS[0].id }) },
    { id: 'schedule',  icon: 'schedule',  label: '排程',       onClick: () => setRoute({ name: 'schedule' }) },
    { id: 'alerts',    icon: 'bell',      label: '告警',       onClick: () => setRoute({ name: 'alerts' }) },
    { id: 'settings',  icon: 'settings',  label: '系統設定',   onClick: () => setRoute({ name: 'settings' }) },
  ];
  return (
    <aside style={{
      width: 240, padding: '24px 16px', display: 'flex', flexDirection: 'column',
      borderRight: '1px solid var(--glass-border)',
      background: 'rgba(0,0,0,0.18)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px 28px' }}>
        <div style={{
          width: 38, height: 38, borderRadius: 12,
          background: 'radial-gradient(circle at 30% 30%, color-mix(in oklch, var(--amber) 60%, transparent), color-mix(in oklch, var(--amber) 18%, transparent) 70%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'inset 0 0 0 1px color-mix(in oklch, var(--amber) 40%, transparent)',
          color: 'var(--amber)',
        }}>
          <Icon name="lizard" size={22} stroke={1.4}/>
        </div>
        <div className="col" style={{ gap: 2 }}>
          <div className="t-display" style={{ fontSize: 15, fontWeight: 600 }}>Terraria</div>
          <div className="t-label" style={{ fontSize: 9, letterSpacing: '0.16em' }}>爬蟲環控系統</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map((it) => {
          const active = (it.id === 'dashboard' && route.name === 'dashboard') ||
                         (it.id === 'tanks'     && route.name === 'tank') ||
                         (it.id === 'schedule'  && route.name === 'schedule') ||
                         (it.id === 'alerts'    && route.name === 'alerts') ||
                         (it.id === 'settings'  && route.name === 'settings');
          return (
            <div key={it.id}
                 className={`nav-item ${active ? 'active' : ''}`}
                 onClick={() => it.onClick && it.onClick()}>
              <span className="nav-icon"><Icon name={it.icon} size={18}/></span>
              <span>{it.label}</span>
            </div>
          );
        })}
      </div>

      <div style={{ flex: 1 }}/>

      {/* Mini tank quick-jump */}
      <div className="t-label" style={{ padding: '0 14px 10px' }}>飼養缸</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {TANKS.map((t) => {
          const health = tankHealth(t);
          const active = route.name === 'tank' && route.id === t.id;
          return (
            <div key={t.id}
                 onClick={() => setRoute({ name: 'tank', id: t.id })}
                 style={{
                   display: 'flex', alignItems: 'center', gap: 10,
                   padding: '8px 10px',
                   borderRadius: 12,
                   background: active ? 'rgba(255,255,255,0.05)' : 'transparent',
                   cursor: 'pointer',
                 }}>
              <Avatar tank={t} size={28}/>
              <div className="col" style={{ flex: 1, minWidth: 0, gap: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div>
                <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{t.current.temp.toFixed(1)}° · {t.current.hum}%</div>
              </div>
              <span className="dot" style={{ color: `var(--${health.tone})` }}/>
            </div>
          );
        })}
      </div>

      <div style={{ height: 16 }}/>
      {/* Settings now lives in the main nav above */}
    </aside>
  );
}

// ── Top bar ──────────────────────────────────────────────
function TopBar({ now, route, setRoute }) {
  const dateStr = `${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日`;
  const wk = ['日','一','二','三','四','五','六'][now.getDay()];
  const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 32px 12px' }}>
      {route.name === 'tank' && (
        <div className="iconbtn" onClick={() => setRoute({ name: 'dashboard' })}>
          <Icon name="chevron-left" size={18}/>
        </div>
      )}
      <div className="col" style={{ flex: 1, gap: 2 }}>
        {route.name === 'dashboard' && (<>
          <div className="t-display" style={{ fontSize: 26 }}>晚安，今晚一切平靜</div>
          <div style={{ color: 'var(--ink-3)', fontSize: 13 }}>{dateStr} · 星期{wk} · {timeStr}</div>
        </>)}
        {route.name === 'tank' && (<div className="t-label">飼養缸詳情</div>)}
        {route.name === 'schedule' && (<div className="t-label">排程</div>)}
        {route.name === 'alerts' && (<div className="t-label">告警中心</div>)}
        {route.name === 'settings' && (<div className="t-label">系統設定</div>)}
      </div>
      <div className="row gap-2">
        <div className="pill sage"><span className="dot pulse" style={{ color: 'var(--sage)' }}/>系統運行中</div>
        <div className="iconbtn"><Icon name="search" size={16}/></div>
        <div className="iconbtn" style={{ position: 'relative' }}>
          <Icon name="bell" size={16}/>
          <span style={{ position: 'absolute', top: 6, right: 7, width: 7, height: 7, borderRadius: 999, background: 'var(--crimson)', boxShadow: '0 0 0 2px var(--bg-0)' }}/>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// Dashboard view
// ───────────────────────────────────────────────────────────
function Dashboard({ setRoute }) {
  const totalDevices = TANKS.reduce((s, t) => s + t.devices.filter(d => d.on).length, 0);
  const totalAlerts  = TANKS.reduce((s, t) => s + t.alerts.length, 0);
  const inRange = TANKS.filter(t => tempStatus(t).tone === 'sage' && humStatus(t).tone === 'sage').length;

  return (
    <div className="col gap-5">
      {/* Hero KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 16 }}>
        <ClimateHero />
        <KpiCard label="飼養缸" value={TANKS.length} unit="缸" sub={`${inRange} 缸狀態正常`} tone="amber" icon="tank"/>
        <KpiCard label="異常警報" value={totalAlerts} unit="則" sub={totalAlerts ? '需要查看' : '一切平靜'} tone={totalAlerts ? 'crimson' : 'sage'} icon="alert"/>
        <KpiCard label="運行設備" value={totalDevices} unit="件" sub="加熱 · UVB · 通風" tone="sky" icon="pulse"/>
      </div>

      {/* Tank tiles */}
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div className="t-display" style={{ fontSize: 18 }}>飼養缸</div>
        <div className="t-mono" style={{ color: 'var(--ink-3)', fontSize: 12 }}>{TANKS.length} 缸 · 更新於 {new Date().getMinutes() % 5 + 1} 分鐘前</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {TANKS.map((t) => <TankTile key={t.id} tank={t} onOpen={() => setRoute({ name: 'tank', id: t.id })}/>)}
      </div>

      {/* Activity + Upcoming */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        <ActivityCard />
        <UpcomingCard />
      </div>
    </div>
  );
}

// Hero: aggregate climate visualization across tanks (Top-left big card)
function ClimateHero() {
  // composite trend: average temp across tanks per hour
  const avg = Array.from({ length: 24 }, (_, i) =>
    TANKS.reduce((s, t) => s + t.trend24h.temp[i], 0) / TANKS.length
  );
  const max = Math.max(...TANKS.flatMap(t => t.trend24h.temp));
  const min = Math.min(...TANKS.flatMap(t => t.trend24h.temp));
  return (
    <div className="glass" style={{ padding: 22, display: 'flex', gap: 22 }}>
      <div className="col" style={{ justifyContent: 'space-between', minWidth: 170 }}>
        <div className="col gap-2">
          <div className="t-label">綜合氣候</div>
          <div className="t-display" style={{ fontSize: 28, lineHeight: 1.05 }}>
            <span style={{ color: 'var(--amber)' }}>30.6</span>
            <span style={{ fontSize: 16, color: 'var(--ink-3)', marginLeft: 4 }}>°C</span>
          </div>
          <div className="t-mono" style={{ color: 'var(--ink-3)', fontSize: 12 }}>平均溫度 · 24h</div>
        </div>
        <div className="col gap-2">
          <div className="row gap-3">
            <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>最高</div>
            <div className="t-num" style={{ fontSize: 14, color: 'var(--crimson)' }}>{max.toFixed(1)}°</div>
          </div>
          <div className="row gap-3">
            <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>最低</div>
            <div className="t-num" style={{ fontSize: 14, color: 'var(--sky)' }}>{min.toFixed(1)}°</div>
          </div>
          <div className="row gap-3">
            <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>平均濕度</div>
            <div className="t-num" style={{ fontSize: 14, color: 'var(--sky)' }}>49<span style={{ fontSize: 10, marginLeft: 2 }}>%</span></div>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, position: 'relative', minHeight: 130 }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <CompositeTrend tanks={TANKS}/>
        </div>
        <div style={{ position: 'absolute', bottom: -2, left: 0, right: 0, display: 'flex', justifyContent: 'space-between' }}>
          {['00','06','12','18','24'].map((l) => (
            <div key={l} className="t-mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>{l}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CompositeTrend({ tanks }) {
  const W = 420, H = 130;
  const all = tanks.flatMap(t => t.trend24h.temp);
  const min = Math.min(...all) - 1;
  const max = Math.max(...all) + 1;
  const span = max - min;
  const tones = { amber: 'var(--amber)', sage: 'var(--sage)', sky: 'var(--sky)', violet: 'var(--violet)', crimson: 'var(--crimson)' };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
      {/* Grid */}
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1="0" x2={W} y1={(H/4)*i + 4} y2={(H/4)*i + 4} stroke="rgba(255,255,255,0.04)" strokeDasharray="2 4"/>
      ))}
      {tanks.map((t) => {
        const vals = t.trend24h.temp;
        const stepX = W / (vals.length - 1);
        const pts = vals.map((v, i) => `${i === 0 ? 'M' : 'L'}${i * stepX},${H - ((v - min) / span) * (H - 8) - 4}`).join(' ');
        return (
          <g key={t.id}>
            <path d={pts} fill="none" stroke={tones[t.avatar.tone]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.85"/>
          </g>
        );
      })}
    </svg>
  );
}

// KPI Card
function KpiCard({ label, value, unit, sub, tone, icon }) {
  return (
    <div className="glass" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14, position: 'relative' }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="t-label">{label}</div>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: `color-mix(in oklch, var(--${tone}) 14%, transparent)`,
          color: `var(--${tone})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name={icon} size={16}/>
        </div>
      </div>
      <div className="kpi-value" style={{ fontSize: 40, color: `var(--${tone})` }}>
        {value}
        <span style={{ fontSize: 14, color: 'var(--ink-3)', marginLeft: 6 }}>{unit}</span>
      </div>
      <div style={{ color: 'var(--ink-3)', fontSize: 12 }}>{sub}</div>
    </div>
  );
}

// Tank tile
function TankTile({ tank, onOpen }) {
  const tStat = tempStatus(tank);
  const hStat = humStatus(tank);
  const onDevices = tank.devices.filter(d => d.on);
  const health = tankHealth(tank);
  const tone = tank.avatar.tone;
  return (
    <div className="glass tank-tile" style={{ padding: 20 }} onClick={onOpen}>
      {/* Header: avatar + name + status */}
      <div className="row gap-3" style={{ marginBottom: 14 }}>
        <Avatar tank={tank} size={48}/>
        <div className="col" style={{ flex: 1, gap: 2 }}>
          <div className="t-display" style={{ fontSize: 16 }}>{tank.name}</div>
          <div style={{ color: 'var(--ink-3)', fontSize: 12 }}>{tank.species} · {tank.location}</div>
        </div>
        <div className={`pill ${health.tone}`}>
          <span className="dot"/>{health.label}
        </div>
      </div>

      {/* Big readout: temp + hum side by side */}
      <div className="row" style={{ alignItems: 'flex-end', gap: 24, marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid var(--glass-border)' }}>
        <div className="col" style={{ flex: 1, gap: 6 }}>
          <div className="row gap-2">
            <Icon name="thermometer" size={14} style={{ color: `var(--${tStat.tone})` }}/>
            <span className="t-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>溫度</span>
            <span className="t-mono" style={{ fontSize: 10, color: `var(--${tStat.tone})` }}>{tStat.label}</span>
          </div>
          <div className="kpi-value" style={{ fontSize: 32, color: `var(--${tStat.tone})` }}>
            {tank.current.temp.toFixed(1)}<span style={{ fontSize: 14, color: 'var(--ink-3)', marginLeft: 2 }}>°C</span>
          </div>
          <Sparkline values={tank.trend24h.temp} color={`var(--${tStat.tone})`} width={150} height={28}/>
          <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>目標 {tank.target.temp[0]}–{tank.target.temp[1]}°C</div>
        </div>
        <div className="col" style={{ flex: 1, gap: 6 }}>
          <div className="row gap-2">
            <Icon name="drop" size={14} style={{ color: `var(--${hStat.tone})` }}/>
            <span className="t-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>濕度</span>
            <span className="t-mono" style={{ fontSize: 10, color: `var(--${hStat.tone})` }}>{hStat.label}</span>
          </div>
          <div className="kpi-value" style={{ fontSize: 32, color: `var(--${hStat.tone})` }}>
            {tank.current.hum}<span style={{ fontSize: 14, color: 'var(--ink-3)', marginLeft: 2 }}>%</span>
          </div>
          <Sparkline values={tank.trend24h.hum} color={`var(--${hStat.tone})`} width={150} height={28}/>
          <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>目標 {tank.target.hum[0]}–{tank.target.hum[1]}%</div>
        </div>
      </div>

      {/* Footer: devices + open */}
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="row gap-2">
          {tank.devices.slice(0, 5).map((d) => (
            <div key={d.id} title={d.name} style={{
              width: 30, height: 30, borderRadius: 9,
              background: d.on ? `color-mix(in oklch, var(--${d.tone}) 18%, transparent)` : 'rgba(255,255,255,0.025)',
              color: d.on ? `var(--${d.tone})` : 'var(--ink-4)',
              border: `1px solid ${d.on ? `color-mix(in oklch, var(--${d.tone}) 35%, transparent)` : 'var(--glass-border)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name={deviceIcon(d)} size={14}/>
            </div>
          ))}
        </div>
        <div className="row gap-2" style={{ color: 'var(--ink-2)', fontSize: 12 }}>
          {onDevices.length}/{tank.devices.length} 設備運行
          <Icon name="chevron-right" size={14}/>
        </div>
      </div>
    </div>
  );
}

function deviceIcon(d) {
  if (d.type === 'heat') return 'lightbulb';
  if (d.type === 'light') return 'sun';
  if (d.type === 'humid') return 'mist';
  if (d.type === 'air') return 'fan';
  return 'pulse';
}

// Activity feed
function ActivityCard() {
  return (
    <div className="glass" style={{ padding: 22 }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
        <div className="t-display" style={{ fontSize: 15 }}>近期活動</div>
        <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>過去 12 小時</div>
      </div>
      <div className="col gap-3">
        {ACTIVITY.map((a, i) => (
          <div key={i} className="row gap-3">
            <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-3)', width: 38 }}>{a.t}</div>
            <div style={{
              width: 28, height: 28, borderRadius: 8, flexShrink: 0,
              background: `color-mix(in oklch, var(--${a.tone}) 14%, transparent)`,
              color: `var(--${a.tone})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name={a.icon} size={14}/>
            </div>
            <div className="col" style={{ flex: 1, gap: 0 }}>
              <div style={{ fontSize: 13 }}>{a.text}</div>
              <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>{a.tank}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Upcoming
function UpcomingCard() {
  return (
    <div className="glass" style={{ padding: 22 }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
        <div className="t-display" style={{ fontSize: 15 }}>排程動作</div>
        <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>即將執行</div>
      </div>
      <div className="col gap-3">
        {UPCOMING.map((u, i) => (
          <div key={i} className="row gap-3" style={{ paddingBottom: 10, borderBottom: i < UPCOMING.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
            <div className="col" style={{ width: 64, gap: 1 }}>
              <div className="t-num" style={{ fontSize: 14, color: 'var(--ink-1)' }}>{u.t}</div>
            </div>
            <div style={{ width: 2, alignSelf: 'stretch', background: `var(--${u.tone})`, borderRadius: 1, opacity: 0.6 }}/>
            <div className="col" style={{ flex: 1, gap: 1 }}>
              <div style={{ fontSize: 13 }}>{u.text}</div>
              <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>{u.tank}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

window.DesktopDashboard = Dashboard;
window.DesktopApp = DesktopApp;
