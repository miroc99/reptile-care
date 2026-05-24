import { useState, useEffect } from 'react';
import GlassCard from '../components/ui/GlassCard';
import Pill from '../components/ui/Pill';
import Dot from '../components/ui/Dot';
import Icon from '../components/ui/Icon';
import Avatar from '../components/ui/Avatar';
import { Tabs, Tab } from '../components/ui/Tabs';

const TONES = ['amber', 'sage', 'violet', 'sky', 'crimson', 'amber'];
function tankTone(i) { return TONES[i % TONES.length]; }
function tankInitial(name) { return name ? name.charAt(0) : '?'; }

function deviceTone(type) {
  const m = { lighting: 'violet', heating: 'amber', humidifier: 'sky', fan: 'sage', relay: 'amber' };
  return m[type] || 'amber';
}

const HOURS = [0, 4, 8, 12, 16, 20, 24];

function ScheduleDayView({ tanks, relays, schedules }) {
  const now = new Date();
  const nowFrac = (now.getHours() * 60 + now.getMinutes()) / 1440;
  const nowLabel = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return (
    <GlassCard style={{ padding: 22 }}>
      {/* Hour ruler */}
      <div style={{ display: 'flex', marginLeft: 180, marginBottom: 14, position: 'relative' }}>
        <div style={{ flex: 1, position: 'relative', height: 20 }}>
          {HOURS.map(h => (
            <div key={h} className="t-mono" style={{
              position: 'absolute',
              left: `${(h / 24) * 100}%`,
              transform: 'translateX(-50%)',
              fontSize: 10, color: 'var(--ink-3)',
            }}>
              {String(h).padStart(2, '0')}:00
            </div>
          ))}
          <div className="t-mono" style={{
            position: 'absolute',
            left: `${nowFrac * 100}%`,
            top: -2, transform: 'translateX(-50%)',
            fontSize: 9, color: 'var(--ink-1)',
            background: 'rgba(20,16,12,0.95)',
            padding: '1px 6px', borderRadius: 4, whiteSpace: 'nowrap',
            border: '1px solid rgba(255,255,255,0.2)',
          }}>
            NOW {nowLabel}
          </div>
        </div>
      </div>

      <div className="col" style={{ gap: 20 }}>
        {tanks.map((tank, ti) => {
          const tone = tankTone(ti);
          const tankRelays = relays.filter(r => r.tank_id === tank.id);
          const tankSchedules = schedules.filter(s =>
            tankRelays.some(r => r.id === s.relay_channel_id)
          );
          if (!tankSchedules.length) return null;

          return (
            <div key={tank.id} className="col" style={{ gap: 8 }}>
              <div className="row gap-3" style={{ marginBottom: 4 }}>
                <Avatar initial={tankInitial(tank.name)} tone={tone} size={28} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-2)' }}>{tank.name}</div>
                </div>
                <div style={{ flex: 1 }} />
                <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>
                  {tankSchedules.length} 項排程
                </div>
              </div>

              {tankSchedules.map(s => {
                const relay = tankRelays.find(r => r.id === s.relay_channel_id);
                const segTone = deviceTone(relay?.device_type);
                const [sh, sm] = (s.start_time || '00:00').split(':').map(Number);
                const [eh, em] = (s.end_time || '23:59').split(':').map(Number);
                const startF = (sh * 60 + (sm || 0)) / 1440;
                const endF = (eh * 60 + (em || 0)) / 1440;
                const label = relay?.label || relay?.name || s.name || '設備';

                return (
                  <div key={s.id} className="row gap-3">
                    <div className="row gap-2" style={{ width: 180, flexShrink: 0 }}>
                      <Dot tone={segTone} />
                      <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>{label}</span>
                    </div>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <div className="sched-row" style={{ height: 24 }}>
                        {HOURS.map(h => (
                          <div key={h} style={{
                            position: 'absolute', top: 0, bottom: 0,
                            left: `${(h / 24) * 100}%`,
                            width: 1, background: 'rgba(255,255,255,0.05)',
                          }} />
                        ))}
                        <div
                          className="sched-seg"
                          style={{
                            left: `${startF * 100}%`,
                            width: `${Math.max((endF - startF) * 100, 0.5)}%`,
                            background: `var(--${segTone})`,
                          }}
                        />
                        <div style={{
                          position: 'absolute', top: 0, bottom: 0,
                          left: `${nowFrac * 100}%`,
                          width: 1, background: 'rgba(255,255,255,0.5)',
                        }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

function WeekDensityView({ schedules }) {
  const days = ['日', '一', '二', '三', '四', '五', '六'];
  const grid = Array.from({ length: 7 }, () => Array(24).fill(0));
  schedules.forEach(s => {
    if (!s.start_time) return;
    const [h] = s.start_time.split(':').map(Number);
    const [eh] = (s.end_time || '00:00').split(':').map(Number);
    for (let hour = Math.min(h, 23); hour <= Math.min(eh, 23); hour++) {
      const dow = (s.schedule_type === 'weekly' && s.day_of_week != null) ? s.day_of_week : -1;
      if (dow >= 0) grid[dow][hour]++;
      else grid.forEach(row => row[hour]++);
    }
  });
  const maxV = Math.max(1, ...grid.flat());

  return (
    <GlassCard style={{ padding: 22 }}>
      <div className="t-label" style={{ marginBottom: 14 }}>本週排程密度</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, justifyContent: 'space-around' }}>
          {days.map(d => (
            <div key={d} className="t-mono" style={{ fontSize: 10, color: 'var(--ink-4)', width: 16, textAlign: 'center' }}>{d}</div>
          ))}
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {grid.map((row, di) => (
            <div key={di} style={{ display: 'flex', gap: 3 }}>
              {row.map((count, hi) => (
                <div key={hi} style={{
                  flex: 1, height: 14, borderRadius: 3,
                  background: count > 0
                    ? `color-mix(in oklch, var(--amber) ${Math.round((count / maxV) * 70) + 10}%, transparent)`
                    : 'rgba(255,255,255,0.025)',
                }} />
              ))}
            </div>
          ))}
          <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
            {[0, 4, 8, 12, 16, 20].map(h => (
              <div key={h} style={{ flex: 4, textAlign: 'center' }}>
                <span className="t-mono" style={{ fontSize: 9, color: 'var(--ink-4)' }}>
                  {String(h).padStart(2, '0')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

function UpcomingList({ schedules, tanks }) {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const toneByType = { daily: 'amber', weekly: 'violet', cron: 'sky', temperature: 'crimson' };

  const upcoming = schedules
    .filter(s => s.is_enabled && s.start_time)
    .map(s => {
      const [h, m] = (s.start_time || '00:00').split(':').map(Number);
      const sMin = h * 60 + (m || 0);
      const diff = sMin >= nowMin ? sMin - nowMin : 1440 - nowMin + sMin;
      return { ...s, diffMin: diff };
    })
    .sort((a, b) => a.diffMin - b.diffMin)
    .slice(0, 8);

  return (
    <GlassCard style={{ padding: 22 }}>
      <div className="t-label" style={{ marginBottom: 14 }}>即將執行</div>
      {upcoming.length === 0 ? (
        <div style={{ color: 'var(--ink-4)', textAlign: 'center', padding: '16px 0', fontSize: 13 }}>暫無排程</div>
      ) : (
        <div className="col" style={{ gap: 12 }}>
          {upcoming.map((s, i) => {
            const tone = toneByType[s.schedule_type] || 'amber';
            const tank = tanks.find(t => t.id === s.tank_id);
            const diffH = Math.floor(s.diffMin / 60);
            const diffM = s.diffMin % 60;
            const diffLabel = diffH > 0 ? `${diffH}h ${diffM}m 後` : `${diffM}m 後`;
            return (
              <div key={s.id ?? i} className="row gap-3">
                <div className="t-num" style={{ fontSize: 13, color: `var(--${tone})`, width: 44, flexShrink: 0 }}>
                  {s.start_time?.slice(0, 5) || '--:--'}
                </div>
                <div style={{ width: 3, alignSelf: 'stretch', borderRadius: 2, background: `var(--${tone})`, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: 'var(--ink-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.name || '排程任務'}
                  </div>
                  {tank && <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>{tank.name}</div>}
                </div>
                <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-4)', flexShrink: 0 }}>{diffLabel}</div>
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}

export default function Schedule() {
  const [tanks, setTanks] = useState([]);
  const [relays, setRelays] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [view, setView] = useState('today');
  const [filterTank, setFilterTank] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/tanks').then(r => r.json()),
      fetch('/api/relays').then(r => r.json()),
      fetch('/api/schedules').then(r => r.json()),
    ]).then(([t, r, s]) => {
      setTanks(t);
      setRelays(r);
      setSchedules(s);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const now = new Date();
  const dateStr = now.toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'short' });

  const visibleTanks = filterTank === 'all' ? tanks : tanks.filter(t => String(t.id) === filterTank);
  const enabledSchedules = schedules.filter(s => s.is_enabled);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 60, color: 'var(--ink-3)' }}>載入中…</div>;
  }

  return (
    <div className="col gap-5">
      {/* Header */}
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="col" style={{ gap: 4 }}>
          <div className="t-display" style={{ fontSize: 22 }}>排程總覽</div>
          <div style={{ color: 'var(--ink-3)', fontSize: 13 }}>跨 {tanks.length} 缸 · {dateStr}</div>
        </div>
        <div className="row gap-3">
          <Tabs>
            <Tab active={view === 'today'} onClick={() => setView('today')}>今日</Tab>
            <Tab active={view === 'week'} onClick={() => setView('week')}>本週</Tab>
          </Tabs>
          <button className="iconbtn" style={{ width: 'auto', padding: '0 14px', gap: 6, color: 'var(--amber)' }} title="新增排程">
            <Icon name="plus" size={14} />
            <span style={{ fontSize: 13 }}>新增排程</span>
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: '今日排程', value: enabledSchedules.length, unit: '項', tone: 'amber' },
          { label: '目前運行', value: relays.filter(r => r.current_state && r.enabled).length, unit: '件', tone: 'sage' },
          { label: '已停用', value: schedules.filter(s => !s.is_enabled).length, unit: '項', tone: 'amber' },
          { label: '自動化設備', value: relays.filter(r => enabledSchedules.some(s => s.relay_channel_id === r.id)).length, unit: '個', tone: 'sky' },
        ].map((kpi, i) => (
          <GlassCard key={i} style={{ padding: 20 }}>
            <div className="t-label" style={{ marginBottom: 10 }}>{kpi.label}</div>
            <div className="kpi-value" style={{ fontSize: 32, color: `var(--${kpi.tone})` }}>
              {kpi.value}
              <span style={{ fontSize: 14, color: 'var(--ink-3)', marginLeft: 4 }}>{kpi.unit}</span>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Tank filter chips */}
      <div className="row gap-2">
        <div className={`tab${filterTank === 'all' ? ' active' : ''}`} onClick={() => setFilterTank('all')} style={{ cursor: 'pointer', fontSize: 12, padding: '6px 12px', borderRadius: 999, background: filterTank === 'all' ? 'color-mix(in oklch, var(--amber) 20%, transparent)' : 'rgba(255,255,255,0.04)', color: filterTank === 'all' ? 'var(--amber)' : 'var(--ink-3)', border: '1px solid var(--glass-border)', transition: 'all 160ms' }}>
          所有飼養缸
        </div>
        {tanks.map(t => (
          <div
            key={t.id}
            onClick={() => setFilterTank(String(t.id))}
            style={{
              cursor: 'pointer', fontSize: 12, padding: '6px 12px', borderRadius: 999,
              background: filterTank === String(t.id) ? 'color-mix(in oklch, var(--amber) 20%, transparent)' : 'rgba(255,255,255,0.04)',
              color: filterTank === String(t.id) ? 'var(--amber)' : 'var(--ink-3)',
              border: '1px solid var(--glass-border)', transition: 'all 160ms',
            }}
          >
            {t.name}
          </div>
        ))}
      </div>

      {/* Day / Week view */}
      {view === 'today' && <ScheduleDayView tanks={visibleTanks} relays={relays} schedules={enabledSchedules} />}
      {view === 'week' && <WeekDensityView schedules={enabledSchedules} />}

      {/* Bottom: Upcoming + Legend */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        <UpcomingList schedules={enabledSchedules} tanks={tanks} />
        <GlassCard style={{ padding: 22 }}>
          <div className="t-label" style={{ marginBottom: 14 }}>設備顏色圖例</div>
          <div className="col" style={{ gap: 10 }}>
            {[
              { tone: 'amber', label: '加熱 / 溫控', icon: 'sun' },
              { tone: 'violet', label: 'UVB / 照明', icon: 'lightbulb' },
              { tone: 'sky', label: '噴霧 / 加濕', icon: 'mist' },
              { tone: 'sage', label: '通風 / 風扇', icon: 'fan' },
            ].map(item => (
              <div key={item.tone} className="row gap-3">
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: `color-mix(in oklch, var(--${item.tone}) 14%, transparent)`,
                  color: `var(--${item.tone})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name={item.icon} size={14} />
                </div>
                <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
