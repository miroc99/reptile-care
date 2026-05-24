// 爬蟲環控系統 · Mobile · Schedule + Alerts screens (global, cross-tank)

const { useState: _ms_useState } = React;

// ── Mobile Schedule ─────────────────────────────────────
function MSchedulePage({ setRoute }) {
  const { TANKS, UPCOMING, SCHEDULE_STATS } = window.RC_DATA;
  const [day, setDay] = _ms_useState('today');
  const nowH = 18.9;

  return (
    <div className="mobile-scroll" style={{ height: '100%', padding: '54px 16px 100px' }}>
      {/* Header */}
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div className="col" style={{ gap: 4 }}>
          <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.16em' }}>5月24日 · 週日</div>
          <div className="t-display" style={{ fontSize: 22 }}>排程</div>
        </div>
        <div className="iconbtn" style={{ width: 36, height: 36 }}><Icon name="plus" size={15}/></div>
      </div>

      {/* Mini stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        <MiniStat label="今日動作" value={SCHEDULE_STATS.todayActions} unit="次" tone="amber"/>
        <MiniStat label="目前運行" value={SCHEDULE_STATS.activeNow}    unit="件" tone="sage"/>
      </div>

      {/* Next action card */}
      <div className="glass" style={{ padding: 14, marginBottom: 16 }}>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
          <div className="t-label">下個動作</div>
          <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{SCHEDULE_STATS.nextAction.tank}</div>
        </div>
        <div className="row gap-3" style={{ alignItems: 'center' }}>
          <div className="kpi-value" style={{ fontSize: 26, color: `var(--${SCHEDULE_STATS.nextAction.tone})` }}>{SCHEDULE_STATS.nextAction.time}</div>
          <div style={{ flex: 1, fontSize: 13 }}>{SCHEDULE_STATS.nextAction.text}</div>
        </div>
      </div>

      <div className="row" style={{ marginBottom: 14 }}>
        <div className="tabs" style={{ width: '100%', justifyContent: 'space-between' }}>
          <div className={`tab ${day==='today'?'active':''}`} style={{ flex: 1, textAlign: 'center', fontSize: 12 }} onClick={() => setDay('today')}>今日</div>
          <div className={`tab ${day==='week'?'active':''}`}  style={{ flex: 1, textAlign: 'center', fontSize: 12 }} onClick={() => setDay('week')}>本週</div>
        </div>
      </div>

      {day === 'today' && (
        <div className="col gap-4">
          {TANKS.map((tank) => {
            const grouped = {};
            tank.schedule.forEach((s) => { (grouped[s.device] = grouped[s.device] || []).push(s); });
            return (
              <div key={tank.id} className="glass" style={{ padding: 14 }}>
                <div className="row gap-2" style={{ marginBottom: 12 }}>
                  <Avatar tank={tank} size={28}/>
                  <div className="col" style={{ flex: 1, gap: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{tank.name}</div>
                    <div className="t-mono" style={{ fontSize: 9, color: 'var(--ink-4)' }}>{tank.schedule.length} 項排程</div>
                  </div>
                </div>
                {/* Hour ruler */}
                <div className="row" style={{ marginLeft: 70, marginBottom: 6, justifyContent: 'space-between' }}>
                  {['00','06','12','18','24'].map((h) => (
                    <div key={h} className="t-mono" style={{ fontSize: 9, color: 'var(--ink-4)' }}>{h}</div>
                  ))}
                </div>
                <div className="col gap-2">
                  {Object.entries(grouped).map(([device, segs]) => (
                    <div key={device} className="row gap-2">
                      <div className="row gap-1" style={{ width: 70 }}>
                        <span className="dot" style={{ color: `var(--${segs[0].tone})` }}/>
                        <span style={{ fontSize: 10, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{device}</span>
                      </div>
                      <div className="sched-row" style={{ flex: 1, height: 16 }}>
                        {segs.map((s, i) => (
                          <div key={i} className="sched-seg" style={{
                            left: `${(s.start/24)*100}%`,
                            width: `${Math.max(((s.end-s.start)/24)*100, 0.8)}%`,
                            background: `linear-gradient(180deg, color-mix(in oklch, var(--${s.tone}) 70%, transparent), color-mix(in oklch, var(--${s.tone}) 40%, transparent))`,
                            boxShadow: `inset 0 0 0 1px color-mix(in oklch, var(--${s.tone}) 55%, transparent)`,
                          }}/>
                        ))}
                        <div style={{
                          position: 'absolute', top: -2, bottom: -2,
                          left: `${(nowH/24)*100}%`, width: 2,
                          background: 'var(--ink-1)', boxShadow: '0 0 4px rgba(255,255,255,0.6)',
                          borderRadius: 1,
                        }}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {day === 'week' && <MWeekHeatmap tanks={TANKS}/>}

      {/* Upcoming */}
      <div className="row" style={{ justifyContent: 'space-between', margin: '20px 0 12px' }}>
        <div className="t-display" style={{ fontSize: 14 }}>即將執行</div>
        <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>未來 24h</div>
      </div>
      <div className="glass" style={{ padding: 12 }}>
        <div className="col gap-3">
          {UPCOMING.map((u, i) => (
            <div key={i} className="row gap-3" style={{ paddingBottom: 8, borderBottom: i < UPCOMING.length-1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
              <div className="t-num" style={{ width: 56, fontSize: 12 }}>{u.t}</div>
              <div style={{ width: 2, alignSelf: 'stretch', background: `var(--${u.tone})`, borderRadius: 1, opacity: 0.6 }}/>
              <div className="col" style={{ flex: 1, gap: 1 }}>
                <div style={{ fontSize: 12 }}>{u.text}</div>
                <div className="t-mono" style={{ fontSize: 9, color: 'var(--ink-4)' }}>{u.tank}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <MobileBottomNav active="schedule" setRoute={setRoute}/>
    </div>
  );
}

function MWeekHeatmap({ tanks }) {
  const days = ['一','二','三','四','五','六','日'];
  const totalDevices = tanks.reduce((s, t) => s + t.schedule.length, 0);
  const cells = Array.from({ length: 7 }, (_, d) =>
    Array.from({ length: 24 }, (_, h) => {
      let count = 0;
      tanks.forEach((t) => {
        t.schedule.forEach((s) => {
          if (h >= Math.floor(s.start) && h < Math.ceil(s.end)) count++;
        });
      });
      return Math.min(count + (d % 3 === 0 ? 0 : -1) + (d === 6 ? 1 : 0), totalDevices);
    })
  );
  return (
    <div className="glass" style={{ padding: 14 }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
        <div className="t-display" style={{ fontSize: 13 }}>本週密度</div>
        <div className="t-mono" style={{ fontSize: 9, color: 'var(--ink-3)' }}>動作密度</div>
      </div>
      <div className="row" style={{ marginLeft: 18 }}>
        <div style={{ flex: 1, position: 'relative', height: 12, marginBottom: 4 }}>
          {[0,6,12,18,23].map((h) => (
            <div key={h} className="t-mono" style={{ position: 'absolute', left: `${(h/23)*100}%`, transform: 'translateX(-50%)', fontSize: 8, color: 'var(--ink-4)' }}>{h}</div>
          ))}
        </div>
      </div>
      <div className="col gap-1">
        {cells.map((row, di) => (
          <div key={di} className="row gap-1">
            <div className="t-mono" style={{ width: 14, fontSize: 9, color: 'var(--ink-3)' }}>{days[di]}</div>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(24, 1fr)', gap: 1 }}>
              {row.map((v, hi) => {
                const t = Math.max(0, v) / totalDevices;
                return (
                  <div key={hi} style={{
                    height: 14, borderRadius: 2,
                    background: t > 0 ? `color-mix(in oklch, var(--amber) ${t*65}%, transparent)` : 'rgba(255,255,255,0.025)',
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

// ── Mobile Alerts ─────────────────────────────────────
function MAlertsPage({ setRoute }) {
  const { ALERT_HISTORY, ALERT_STATS, ALERT_HEATMAP, TANKS } = window.RC_DATA;
  const [filter, setFilter] = _ms_useState('all');

  const filtered = ALERT_HISTORY.filter((a) => {
    if (filter === 'active' && a.status !== 'active') return false;
    if (['high','mid','low'].includes(filter) && a.level !== filter) return false;
    return true;
  });

  const active = ALERT_HISTORY.filter((a) => a.status === 'active');

  return (
    <div className="mobile-scroll" style={{ height: '100%', padding: '54px 16px 100px' }}>
      {/* Header */}
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div className="col" style={{ gap: 4 }}>
          <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.16em' }}>{ALERT_STATS.active} 則待處理</div>
          <div className="t-display" style={{ fontSize: 22 }}>告警中心</div>
        </div>
        <div className="iconbtn" style={{ width: 36, height: 36 }}><Icon name="settings" size={15}/></div>
      </div>

      {/* Mini stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
        <MiniStat label="待處理" value={ALERT_STATS.active}     unit="則" tone="crimson"/>
        <MiniStat label="24h"   value={ALERT_STATS.last24h}     unit="則" tone="amber"/>
        <MiniStat label="7d"    value={ALERT_STATS.last7d}      unit="則" tone="sky"/>
      </div>

      {/* Severity bar */}
      <div className="glass" style={{ padding: 14, marginBottom: 16 }}>
        <div className="t-label" style={{ marginBottom: 10 }}>嚴重度分布 · 7 天</div>
        <div className="row" style={{ height: 8, borderRadius: 999, overflow: 'hidden', background: 'rgba(255,255,255,0.04)', marginBottom: 10 }}>
          <div style={{ width: `${(ALERT_STATS.bySeverity.high/(ALERT_STATS.bySeverity.high+ALERT_STATS.bySeverity.mid+ALERT_STATS.bySeverity.low))*100}%`, background: 'var(--crimson)' }}/>
          <div style={{ width: `${(ALERT_STATS.bySeverity.mid /(ALERT_STATS.bySeverity.high+ALERT_STATS.bySeverity.mid+ALERT_STATS.bySeverity.low))*100}%`, background: 'var(--amber)' }}/>
          <div style={{ width: `${(ALERT_STATS.bySeverity.low /(ALERT_STATS.bySeverity.high+ALERT_STATS.bySeverity.mid+ALERT_STATS.bySeverity.low))*100}%`, background: 'var(--sky)' }}/>
        </div>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div className="row gap-1" style={{ fontSize: 10 }}><span className="dot" style={{ color: 'var(--crimson)' }}/><span>嚴重 {ALERT_STATS.bySeverity.high}</span></div>
          <div className="row gap-1" style={{ fontSize: 10 }}><span className="dot" style={{ color: 'var(--amber)' }}/><span>一般 {ALERT_STATS.bySeverity.mid}</span></div>
          <div className="row gap-1" style={{ fontSize: 10 }}><span className="dot" style={{ color: 'var(--sky)' }}/><span>輕微 {ALERT_STATS.bySeverity.low}</span></div>
        </div>
      </div>

      {/* Active alerts */}
      {active.length > 0 && (
        <>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
            <div className="t-display" style={{ fontSize: 14 }}>
              <span style={{ color: 'var(--crimson)' }}>●</span> 待處理
            </div>
            <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{active.length} 則</div>
          </div>
          <div className="col gap-2" style={{ marginBottom: 16 }}>
            {active.map((a) => {
              const sev = sevInfo(a.level);
              return (
                <div key={a.id} className="glass" style={{
                  padding: 12,
                  borderColor: `color-mix(in oklch, var(--${sev.tone}) 35%, transparent)`,
                }} onClick={() => setRoute && setRoute({ name: 'tank', id: a.tankId })}>
                  <div className="row gap-2" style={{ marginBottom: 8 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      background: `color-mix(in oklch, var(--${sev.tone}) 18%, transparent)`,
                      color: `var(--${sev.tone})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon name="alert" size={14}/>
                    </div>
                    <div className="col" style={{ flex: 1, gap: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 500 }}>{a.message}</div>
                      <div className="t-mono" style={{ fontSize: 9, color: 'var(--ink-4)' }}>{a.tank} · {a.time} · 持續 {a.duration}</div>
                    </div>
                    <div className={`pill ${sev.tone}`} style={{ fontSize: 9, padding: '2px 7px' }}>{sev.label}</div>
                  </div>
                  <div className="row gap-3" style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.025)', borderRadius: 8 }}>
                    <div className="col" style={{ gap: 0 }}>
                      <div className="t-mono" style={{ fontSize: 9, color: 'var(--ink-3)' }}>目前</div>
                      <div className="t-num" style={{ fontSize: 13, color: `var(--${sev.tone})` }}>{a.value}{a.metric === 'temp' ? '°C' : '%'}</div>
                    </div>
                    <div className="col" style={{ gap: 0 }}>
                      <div className="t-mono" style={{ fontSize: 9, color: 'var(--ink-3)' }}>{a.metric === 'temp' ? '上限' : '下限'}</div>
                      <div className="t-num" style={{ fontSize: 13 }}>{a.threshold}{a.metric === 'temp' ? '°C' : '%'}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Filter */}
      <div className="row" style={{ overflowX: 'auto', gap: 8, marginBottom: 12, paddingBottom: 4 }}>
        {[
          ['all', '全部'],
          ['active', '待處理'],
          ['high', '嚴重'],
          ['mid', '一般'],
          ['low', '輕微'],
        ].map(([k, l]) => (
          <div key={k} onClick={() => setFilter(k)} style={{
            padding: '6px 12px', borderRadius: 999, fontSize: 11, whiteSpace: 'nowrap', cursor: 'pointer',
            background: filter === k ? 'color-mix(in oklch, var(--amber) 18%, transparent)' : 'rgba(255,255,255,0.03)',
            color: filter === k ? 'var(--amber)' : 'var(--ink-3)',
            border: `1px solid ${filter === k ? 'color-mix(in oklch, var(--amber) 30%, transparent)' : 'var(--glass-border)'}`,
          }}>{l}</div>
        ))}
      </div>

      {/* History list */}
      <div className="glass" style={{ overflow: 'hidden', padding: 0 }}>
        {(() => {
          const groups = {};
          filtered.forEach((a) => { (groups[a.date] = groups[a.date] || []).push(a); });
          return Object.entries(groups).map(([date, items]) => (
            <div key={date}>
              <div className="t-label" style={{ padding: '10px 14px 4px', fontSize: 10, background: 'rgba(255,255,255,0.015)' }}>{date}</div>
              {items.map((a) => {
                const sev = sevInfo(a.level);
                return (
                  <div key={a.id} className="row gap-2" style={{
                    padding: '12px 14px',
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                  }} onClick={() => setRoute && setRoute({ name: 'tank', id: a.tankId })}>
                    <div className="t-mono" style={{ width: 38, fontSize: 10, color: 'var(--ink-3)' }}>{a.time}</div>
                    <span className="dot" style={{ color: `var(--${sev.tone})` }}/>
                    <div className="col" style={{ flex: 1, gap: 1 }}>
                      <div style={{ fontSize: 12 }}>{a.message}</div>
                      <div className="t-mono" style={{ fontSize: 9, color: 'var(--ink-4)' }}>{a.tank}</div>
                    </div>
                    {a.status === 'active' && (
                      <div className="pill crimson" style={{ fontSize: 8, padding: '1px 5px' }}>進行中</div>
                    )}
                  </div>
                );
              })}
            </div>
          ));
        })()}
        {filtered.length === 0 && (
          <div className="t-mono" style={{ padding: 24, textAlign: 'center', color: 'var(--ink-3)', fontSize: 11 }}>無相符警報</div>
        )}
      </div>

      <MobileBottomNav active="alerts" setRoute={setRoute}/>
    </div>
  );
}

window.MSchedulePage = MSchedulePage;
window.MAlertsPage = MAlertsPage;
