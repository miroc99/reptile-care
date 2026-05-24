// 爬蟲環控系統 · Desktop · Alerts (告警中心)

const { useState: _a_useState } = React;

function DesktopAlerts({ setRoute }) {
  const { ALERT_HISTORY, ALERT_HEATMAP, ALERT_STATS, TANKS } = window.RC_DATA;
  const [filter, setFilter] = _a_useState('all'); // all | active | high | mid | low
  const [tankFilter, setTankFilter] = _a_useState('all');

  const filtered = ALERT_HISTORY.filter((a) => {
    if (filter === 'active' && a.status !== 'active') return false;
    if (['high','mid','low'].includes(filter) && a.level !== filter) return false;
    if (tankFilter !== 'all' && a.tankId !== tankFilter) return false;
    return true;
  });

  const active = ALERT_HISTORY.filter((a) => a.status === 'active');

  return (
    <div className="col gap-5">
      {/* Header */}
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="col" style={{ gap: 4 }}>
          <div className="t-display" style={{ fontSize: 22 }}>告警中心</div>
          <div style={{ color: 'var(--ink-3)', fontSize: 13 }}>過去 7 天 {ALERT_STATS.last7d} 則 · 目前 {ALERT_STATS.active} 則待處理</div>
        </div>
        <div className="row gap-2">
          <div className="iconbtn"><Icon name="settings" size={16}/></div>
          <div className="iconbtn" style={{ width: 'auto', padding: '0 14px', gap: 6 }}>
            <Icon name="check" size={14}/>
            <span style={{ fontSize: 13 }}>全部標為已讀</span>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <KpiCard label="目前待處理" value={ALERT_STATS.active}      unit="則" sub="需立即關注" tone="crimson" icon="alert"/>
        <KpiCard label="過去 24 小時" value={ALERT_STATS.last24h}    unit="則" sub="含已解決" tone="amber" icon="bell"/>
        <KpiCard label="過去 7 天"   value={ALERT_STATS.last7d}      unit="則" sub="平均每日 2.6" tone="sky" icon="schedule"/>
        <KpiCard label="平均解決"     value={ALERT_STATS.avgResolveMin} unit="分鐘" sub="自觸發起" tone="sage" icon="check"/>
      </div>

      {/* Severity breakdown */}
      <SeverityBar stats={ALERT_STATS.bySeverity}/>

      {/* Active alerts (prominent) */}
      {active.length > 0 && (
        <div className="col gap-3">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div className="t-display" style={{ fontSize: 16 }}>
              <span style={{ color: 'var(--crimson)' }}>●</span> 待處理警報
            </div>
            <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{active.length} 則</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {active.map((a) => <ActiveAlertCard key={a.id} a={a} setRoute={setRoute}/>)}
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="row gap-3">
          <div className="tabs">
            {[
              ['all', '全部'],
              ['active', '待處理'],
              ['high', '嚴重'],
              ['mid', '一般'],
              ['low', '輕微'],
            ].map(([k, l]) => (
              <div key={k} className={`tab ${filter===k?'active':''}`} onClick={() => setFilter(k)}>{l}</div>
            ))}
          </div>
          <div className="tabs">
            <div className={`tab ${tankFilter==='all'?'active':''}`} onClick={() => setTankFilter('all')}>所有飼養缸</div>
            {TANKS.map((t) => (
              <div key={t.id} className={`tab ${tankFilter===t.id?'active':''}`} onClick={() => setTankFilter(t.id)}>{t.name}</div>
            ))}
          </div>
        </div>
        <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>顯示 {filtered.length} / {ALERT_HISTORY.length} 則</div>
      </div>

      {/* Two-column: history + heatmap & source */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, alignItems: 'flex-start' }}>
        <AlertHistory list={filtered} setRoute={setRoute}/>
        <div className="col gap-4">
          <AlertHeatmap data={ALERT_HEATMAP}/>
          <AlertSources stats={ALERT_STATS.bySource}/>
        </div>
      </div>
    </div>
  );
}

// ── Severity breakdown bar ─────────────────────────────
function SeverityBar({ stats }) {
  const total = stats.high + stats.mid + stats.low;
  return (
    <div className="glass" style={{ padding: 22 }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
        <div className="t-display" style={{ fontSize: 14 }}>嚴重度分布</div>
        <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>過去 7 天 · {total} 則</div>
      </div>
      <div className="row" style={{ height: 10, borderRadius: 999, overflow: 'hidden', background: 'rgba(255,255,255,0.04)' }}>
        <div style={{ width: `${(stats.high/total)*100}%`, background: 'var(--crimson)' }}/>
        <div style={{ width: `${(stats.mid/total)*100}%`, background: 'var(--amber)' }}/>
        <div style={{ width: `${(stats.low/total)*100}%`, background: 'var(--sky)' }}/>
      </div>
      <div className="row gap-5" style={{ marginTop: 14 }}>
        <SevLegend tone="crimson" label="嚴重" count={stats.high} total={total}/>
        <SevLegend tone="amber"   label="一般" count={stats.mid}  total={total}/>
        <SevLegend tone="sky"     label="輕微" count={stats.low}  total={total}/>
      </div>
    </div>
  );
}
function SevLegend({ tone, label, count, total }) {
  return (
    <div className="row gap-2">
      <span className="dot" style={{ color: `var(--${tone})` }}/>
      <div className="col" style={{ gap: 1 }}>
        <div style={{ fontSize: 12 }}>{label}</div>
        <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{count} 則 · {((count/total)*100).toFixed(0)}%</div>
      </div>
    </div>
  );
}

// ── Active alert card ─────────────────────────────────
function ActiveAlertCard({ a, setRoute }) {
  const sev = sevInfo(a.level);
  return (
    <div className="glass" style={{ padding: 20, borderColor: `color-mix(in oklch, var(--${sev.tone}) 35%, transparent)` }}>
      <div className="row gap-3" style={{ marginBottom: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 11, flexShrink: 0,
          background: `color-mix(in oklch, var(--${sev.tone}) 18%, transparent)`,
          color: `var(--${sev.tone})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="alert" size={20}/>
        </div>
        <div className="col" style={{ flex: 1, gap: 2 }}>
          <div className="row gap-2">
            <div className="t-display" style={{ fontSize: 15 }}>{a.message}</div>
            <div className={`pill ${sev.tone}`} style={{ fontSize: 9, padding: '2px 7px' }}>{sev.label}</div>
          </div>
          <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{a.tank} · 觸發於 {a.time} · 持續 {a.duration}</div>
        </div>
      </div>
      <div className="row gap-4" style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.025)', borderRadius: 10 }}>
        <div className="col" style={{ gap: 1 }}>
          <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>目前數值</div>
          <div className="t-num" style={{ fontSize: 16, color: `var(--${sev.tone})` }}>
            {a.value}<span style={{ fontSize: 11, color: 'var(--ink-3)', marginLeft: 2 }}>{a.metric === 'temp' ? '°C' : '%'}</span>
          </div>
        </div>
        <div className="col" style={{ gap: 1 }}>
          <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{a.metric === 'temp' ? '上限' : '下限'}</div>
          <div className="t-num" style={{ fontSize: 16 }}>
            {a.threshold}<span style={{ fontSize: 11, color: 'var(--ink-3)', marginLeft: 2 }}>{a.metric === 'temp' ? '°C' : '%'}</span>
          </div>
        </div>
        <div style={{ flex: 1 }}/>
        <div className="row gap-2">
          <div className="iconbtn" style={{ width: 'auto', padding: '0 12px', fontSize: 11, height: 32, gap: 4 }} onClick={() => setRoute && setRoute({ name: 'tank', id: a.tankId })}>
            前往飼養缸 <Icon name="chevron-right" size={12}/>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Severity helper ────────────────────────────────────
function sevInfo(level) {
  if (level === 'high') return { tone: 'crimson', label: '嚴重' };
  if (level === 'mid')  return { tone: 'amber',   label: '一般' };
  return { tone: 'sky', label: '輕微' };
}

// ── History list ──────────────────────────────────────
function AlertHistory({ list, setRoute }) {
  if (list.length === 0) {
    return (
      <div className="glass" style={{ padding: 40, textAlign: 'center' }}>
        <div className="t-mono" style={{ color: 'var(--ink-3)', fontSize: 12 }}>過濾條件下無警報</div>
      </div>
    );
  }
  // Group by date
  const groups = {};
  list.forEach((a) => { (groups[a.date] = groups[a.date] || []).push(a); });
  return (
    <div className="glass" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="row" style={{ padding: '18px 22px', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="t-display" style={{ fontSize: 15 }}>警報歷史</div>
        <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>由近至遠</div>
      </div>
      <div className="col">
        {Object.entries(groups).map(([date, items]) => (
          <div key={date}>
            <div className="t-label" style={{ padding: '12px 22px 6px', background: 'rgba(255,255,255,0.015)' }}>{date}</div>
            {items.map((a) => {
              const sev = sevInfo(a.level);
              return (
                <div key={a.id} className="row gap-3" style={{
                  padding: '14px 22px',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  cursor: 'pointer',
                  transition: 'background 160ms',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                onClick={() => setRoute && setRoute({ name: 'tank', id: a.tankId })}
                >
                  <div className="t-mono" style={{ width: 50, fontSize: 11, color: 'var(--ink-3)' }}>{a.time}</div>
                  <span className="dot" style={{ color: `var(--${sev.tone})` }}/>
                  <div className="col" style={{ flex: 1, gap: 1 }}>
                    <div style={{ fontSize: 13 }}>{a.message}</div>
                    <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>{a.tank} · {sev.label} · 持續 {a.duration}</div>
                  </div>
                  <div className="t-num" style={{ fontSize: 13, color: `var(--${sev.tone})`, width: 60, textAlign: 'right' }}>
                    {a.value}<span style={{ fontSize: 10, color: 'var(--ink-3)', marginLeft: 1 }}>{a.metric === 'temp' ? '°C' : '%'}</span>
                  </div>
                  <div className={`pill ${a.status === 'active' ? 'crimson' : ''}`} style={{ fontSize: 9, padding: '2px 8px', minWidth: 56, justifyContent: 'center' }}>
                    {a.status === 'active' ? '進行中' : '已解決'}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Heatmap: 7d × 24h ──────────────────────────────────
function AlertHeatmap({ data }) {
  const days = ['一','二','三','四','五','六','日'];
  const max = Math.max(...data.flat(), 1);
  return (
    <div className="glass" style={{ padding: 22 }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
        <div className="t-display" style={{ fontSize: 14 }}>觸發時段分布</div>
        <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>7 天 × 24 小時</div>
      </div>
      <div className="row" style={{ marginLeft: 22 }}>
        <div style={{ flex: 1, position: 'relative', height: 12, marginBottom: 4 }}>
          {[0,6,12,18,23].map((h) => (
            <div key={h} className="t-mono" style={{ position: 'absolute', left: `${(h/23)*100}%`, transform: 'translateX(-50%)', fontSize: 8, color: 'var(--ink-4)' }}>{h}</div>
          ))}
        </div>
      </div>
      <div className="col gap-1">
        {data.map((row, di) => (
          <div key={di} className="row gap-1">
            <div className="t-mono" style={{ width: 18, fontSize: 9, color: 'var(--ink-3)', textAlign: 'right' }}>{days[di]}</div>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(24, 1fr)', gap: 1.5 }}>
              {row.map((v, hi) => {
                const t = v / max;
                return (
                  <div key={hi} style={{
                    height: 14,
                    borderRadius: 2,
                    background: t > 0
                      ? `color-mix(in oklch, var(--crimson) ${Math.max(t*70, 12)}%, transparent)`
                      : 'rgba(255,255,255,0.025)',
                  }} title={`${v} alerts`}/>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Source breakdown ──────────────────────────────────
function AlertSources({ stats }) {
  const total = stats.reduce((s, x) => s + x.count, 0);
  return (
    <div className="glass" style={{ padding: 22 }}>
      <div className="t-display" style={{ fontSize: 14, marginBottom: 14 }}>來源飼養缸</div>
      <div className="col gap-4">
        {stats.map((s) => {
          const pct = (s.count / total) * 100;
          return (
            <div key={s.tank} className="col gap-2">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div className="row gap-2">
                  <span className="dot" style={{ color: `var(--${s.tone})` }}/>
                  <span style={{ fontSize: 12 }}>{s.tank}</span>
                </div>
                <div className="t-num" style={{ fontSize: 12 }}>{s.count}<span style={{ fontSize: 9, color: 'var(--ink-4)', marginLeft: 3 }}>{pct.toFixed(0)}%</span></div>
              </div>
              <div className="range-track" style={{ height: 4 }}>
                <div className="range-fill" style={{ left: 0, right: `${100-pct}%`, background: `var(--${s.tone})`, opacity: 0.7 }}/>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

window.DesktopAlerts = DesktopAlerts;
