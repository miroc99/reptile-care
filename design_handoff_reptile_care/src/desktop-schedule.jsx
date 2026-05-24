// 爬蟲環控系統 · Desktop · Schedule (全局排程)

const { useState: _s_useState } = React;

function DesktopSchedule() {
  const { TANKS, UPCOMING, SCHEDULE_STATS } = window.RC_DATA;
  const [day, setDay] = _s_useState('today'); // today | week

  // Build per-tank rows: each tank has a header + per-device row
  const NOW_H = 18.9; // current hour as decimal

  return (
    <div className="col gap-5">
      {/* Header */}
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="col" style={{ gap: 4 }}>
          <div className="t-display" style={{ fontSize: 22 }}>排程總覽</div>
          <div style={{ color: 'var(--ink-3)', fontSize: 13 }}>跨 {TANKS.length} 缸 · 5月24日 週日</div>
        </div>
        <div className="row gap-3">
          <div className="tabs">
            <div className={`tab ${day==='today'?'active':''}`} onClick={() => setDay('today')}>今日</div>
            <div className={`tab ${day==='week'?'active':''}`} onClick={() => setDay('week')}>本週</div>
          </div>
          <div className="iconbtn" style={{ width: 'auto', padding: '0 14px', gap: 6, color: 'var(--amber)' }}>
            <Icon name="plus" size={14}/>
            <span style={{ fontSize: 13 }}>新增排程</span>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <KpiCard label="今日動作" value={SCHEDULE_STATS.todayActions} unit="次" sub="自動 18 · 手動 4" tone="amber" icon="schedule"/>
        <KpiCard label="目前運行" value={SCHEDULE_STATS.activeNow} unit="件" sub="跨 3 缸" tone="sage" icon="pulse"/>
        <NextActionCard next={SCHEDULE_STATS.nextAction} />
        <KpiCard label="自動化覆蓋" value={SCHEDULE_STATS.autoCoverage} unit="%" sub="設備自動排程比例" tone="sky" icon="settings"/>
      </div>

      {/* Day view */}
      {day === 'today' && <ScheduleDayView tanks={TANKS} nowH={NOW_H}/>}
      {day === 'week' && <ScheduleWeekView tanks={TANKS}/>}

      {/* Upcoming list */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        <UpcomingDetailed/>
        <ScheduleLegend tanks={TANKS}/>
      </div>
    </div>
  );
}

function NextActionCard({ next }) {
  return (
    <div className="glass" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14, position: 'relative' }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="t-label">下個動作</div>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: `color-mix(in oklch, var(--${next.tone}) 14%, transparent)`, color: `var(--${next.tone})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="arrow-down" size={16}/>
        </div>
      </div>
      <div className="kpi-value" style={{ fontSize: 32, color: `var(--${next.tone})` }}>{next.time}</div>
      <div className="col" style={{ gap: 2 }}>
        <div style={{ fontSize: 12 }}>{next.text}</div>
        <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>{next.tank}</div>
      </div>
    </div>
  );
}

// ── Day view: 24h timeline across all tanks ─────────────
function ScheduleDayView({ tanks, nowH }) {
  return (
    <div className="glass" style={{ padding: 22 }}>
      {/* Hour ruler */}
      <div className="row" style={{ marginLeft: 180, marginBottom: 12 }}>
        <div style={{ flex: 1, position: 'relative', height: 16 }}>
          {[0, 4, 8, 12, 16, 20, 24].map((h) => (
            <div key={h} className="t-mono" style={{
              position: 'absolute', left: `${(h/24)*100}%`,
              transform: 'translateX(-50%)', fontSize: 10, color: 'var(--ink-3)',
            }}>{String(h).padStart(2,'0')}:00</div>
          ))}
          {/* Now indicator label */}
          <div className="t-mono" style={{
            position: 'absolute', left: `${(nowH/24)*100}%`,
            top: -2, transform: 'translateX(-50%)',
            fontSize: 9, color: 'var(--ink-1)',
            background: 'rgba(20,16,12,0.95)',
            padding: '1px 5px', borderRadius: 4, whiteSpace: 'nowrap',
            border: '1px solid rgba(255,255,255,0.2)',
          }}>NOW {Math.floor(nowH)}:{String(Math.round((nowH%1)*60)).padStart(2,'0')}</div>
        </div>
      </div>

      <div className="col gap-5">
        {tanks.map((tank) => {
          const grouped = {};
          tank.schedule.forEach((s) => { (grouped[s.device] = grouped[s.device] || []).push(s); });
          return (
            <div key={tank.id} className="col gap-2">
              <div className="row gap-3" style={{ marginBottom: 4 }}>
                <Avatar tank={tank} size={28}/>
                <div className="col" style={{ gap: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{tank.name}</div>
                  <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>{tank.species}</div>
                </div>
                <div style={{ flex: 1 }}/>
                <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>
                  {tank.schedule.length} 項排程
                </div>
              </div>
              {Object.entries(grouped).map(([device, segs]) => (
                <div key={device} className="row gap-3">
                  <div className="row gap-2" style={{ width: 180 }}>
                    <span className="dot" style={{ color: `var(--${segs[0].tone})` }}/>
                    <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>{device}</span>
                  </div>
                  <div className="sched-row" style={{ flex: 1, height: 24 }}>
                    {/* Hour grid lines */}
                    {[6, 12, 18].map((h) => (
                      <div key={h} style={{ position: 'absolute', top: 0, bottom: 0, left: `${(h/24)*100}%`, width: 1, background: 'rgba(255,255,255,0.04)' }}/>
                    ))}
                    {segs.map((s, i) => (
                      <div key={i} className="sched-seg" style={{
                        left: `${(s.start/24)*100}%`,
                        width: `${Math.max(((s.end-s.start)/24)*100, 0.5)}%`,
                        background: `linear-gradient(180deg, color-mix(in oklch, var(--${s.tone}) 75%, transparent), color-mix(in oklch, var(--${s.tone}) 40%, transparent))`,
                        boxShadow: `inset 0 0 0 1px color-mix(in oklch, var(--${s.tone}) 60%, transparent)`,
                      }}/>
                    ))}
                    {/* Now indicator */}
                    <div style={{
                      position: 'absolute', top: -3, bottom: -3,
                      left: `${(nowH/24)*100}%`, width: 2,
                      background: 'var(--ink-1)', boxShadow: '0 0 6px rgba(255,255,255,0.6)',
                      borderRadius: 1,
                    }}/>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Week view: 7×24 density grid ────────────────────────
function ScheduleWeekView({ tanks }) {
  const days = ['週一','週二','週三','週四','週五','週六','週日'];
  // Compute activity per day-hour across tanks: how many devices active
  const totalDevices = tanks.reduce((s, t) => s + t.schedule.length, 0);
  const cells = Array.from({ length: 7 }, (_, d) =>
    Array.from({ length: 24 }, (_, h) => {
      // Aggregate across all tanks' schedules
      let count = 0;
      tanks.forEach((t) => {
        t.schedule.forEach((s) => {
          if (h >= Math.floor(s.start) && h < Math.ceil(s.end)) count++;
        });
      });
      // Add slight day variation
      return Math.min(count + (d % 3 === 0 ? 0 : -1) + (d === 6 ? 1 : 0), totalDevices);
    })
  );
  const max = totalDevices;
  return (
    <div className="glass" style={{ padding: 22 }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
        <div className="t-display" style={{ fontSize: 15 }}>本週活動密度</div>
        <div className="row gap-2" style={{ fontSize: 10, color: 'var(--ink-3)' }}>
          <span className="t-mono">低</span>
          {[0,0.25,0.5,0.75,1].map((t) => (
            <div key={t} style={{ width: 18, height: 12, borderRadius: 3, background: `color-mix(in oklch, var(--amber) ${t*60}%, transparent)`, border: '1px solid rgba(255,255,255,0.05)' }}/>
          ))}
          <span className="t-mono">高</span>
        </div>
      </div>
      <div className="row" style={{ marginLeft: 38 }}>
        <div style={{ flex: 1, position: 'relative', height: 14, marginBottom: 4 }}>
          {[0,6,12,18,24].map((h) => (
            <div key={h} className="t-mono" style={{ position: 'absolute', left: `${(h/24)*100}%`, transform: 'translateX(-50%)', fontSize: 9, color: 'var(--ink-4)' }}>{h}</div>
          ))}
        </div>
      </div>
      <div className="col gap-1">
        {cells.map((row, di) => (
          <div key={di} className="row gap-2">
            <div className="t-mono" style={{ width: 30, fontSize: 10, color: 'var(--ink-3)', textAlign: 'right' }}>{days[di]}</div>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(24, 1fr)', gap: 2 }}>
              {row.map((v, hi) => {
                const intensity = Math.max(0, v) / max;
                return (
                  <div key={hi} style={{
                    height: 22,
                    borderRadius: 3,
                    background: intensity > 0
                      ? `color-mix(in oklch, var(--amber) ${intensity*70}%, transparent)`
                      : 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                  }}/>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Upcoming with details ──────────────────────────────
function UpcomingDetailed() {
  const { UPCOMING } = window.RC_DATA;
  return (
    <div className="glass" style={{ padding: 22 }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
        <div className="t-display" style={{ fontSize: 15 }}>即將執行</div>
        <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>未來 24 小時</div>
      </div>
      <div className="col gap-3">
        {UPCOMING.map((u, i) => (
          <div key={i} className="row gap-3" style={{ paddingBottom: 10, borderBottom: i < UPCOMING.length-1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
            <div className="t-num" style={{ width: 80, fontSize: 14 }}>{u.t}</div>
            <div style={{ width: 2, alignSelf: 'stretch', background: `var(--${u.tone})`, borderRadius: 1, opacity: 0.6 }}/>
            <div className="col" style={{ flex: 1, gap: 1 }}>
              <div style={{ fontSize: 13 }}>{u.text}</div>
              <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>{u.tank}</div>
            </div>
            <div className="iconbtn" style={{ width: 26, height: 26 }}>
              <Icon name="chevron-right" size={12}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Legend: devices by tank ────────────────────────────
function ScheduleLegend({ tanks }) {
  return (
    <div className="glass" style={{ padding: 22 }}>
      <div className="t-display" style={{ fontSize: 15, marginBottom: 16 }}>排程設備</div>
      <div className="col gap-3">
        {tanks.map((t) => (
          <div key={t.id} className="col gap-2" style={{ paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="row gap-2">
              <Avatar tank={t} size={24}/>
              <div style={{ fontSize: 12, fontWeight: 500 }}>{t.name}</div>
              <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-4)', marginLeft: 'auto' }}>{t.schedule.length} 項</div>
            </div>
            <div className="row gap-2" style={{ flexWrap: 'wrap', paddingLeft: 30 }}>
              {[...new Set(t.schedule.map(s => s.device))].map((d) => {
                const seg = t.schedule.find(s => s.device === d);
                return (
                  <div key={d} className="row gap-1" style={{
                    padding: '3px 8px',
                    borderRadius: 999,
                    background: `color-mix(in oklch, var(--${seg.tone}) 8%, transparent)`,
                    border: `1px solid color-mix(in oklch, var(--${seg.tone}) 20%, transparent)`,
                    fontSize: 10,
                    color: `var(--${seg.tone})`,
                  }}>
                    <span className="dot"/>{d}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

window.DesktopSchedule = DesktopSchedule;
