import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';
import GlassCard from '../components/ui/GlassCard';
import Pill from '../components/ui/Pill';
import Dot from '../components/ui/Dot';
import Avatar from '../components/ui/Avatar';
import Icon from '../components/ui/Icon';
import Sparkline from '../components/ui/Sparkline';
import RangeBar from '../components/ui/RangeBar';
import KpiCard from '../components/ui/KpiCard';

const TONES = ['amber', 'sage', 'violet', 'sky', 'crimson', 'amber'];

function tankTone(i) { return TONES[i % TONES.length]; }
function tankInitial(name) { return name ? name.charAt(0) : '?'; }

function tempStatus(temp, lo, hi) {
  if (temp == null) return 'amber';
  if (temp < lo) return 'sky';
  if (temp > hi) return 'crimson';
  return 'sage';
}
function humStatus(hum, lo, hi) {
  if (hum == null) return 'amber';
  if (hum < lo) return 'amber';
  if (hum > hi) return 'sky';
  return 'sage';
}
function tankHealth(temp, hum, tLo, tHi, hLo, hHi) {
  const ts = tempStatus(temp, tLo, tHi);
  const hs = humStatus(hum, hLo, hHi);
  if (ts === 'crimson') return { tone: 'crimson', label: '需注意' };
  if (ts === 'sage' && hs === 'sage') return { tone: 'sage', label: '一切正常' };
  return { tone: 'amber', label: '可微調' };
}

function DeviceIcon({ type }) {
  const iconMap = { lighting: 'lightbulb', heating: 'sun', humidifier: 'mist', fan: 'fan' };
  const toneMap = { lighting: 'violet', heating: 'amber', humidifier: 'sky', fan: 'sage' };
  const icon = iconMap[type] || 'pulse';
  const tone = toneMap[type] || 'amber';
  return (
    <div style={{
      width: 30, height: 30, borderRadius: 8,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `color-mix(in oklch, var(--${tone}) 12%, transparent)`,
      color: `var(--${tone})`,
    }}>
      <Icon name={icon} size={16} />
    </div>
  );
}

function TankTile({ tank, relays, index, onClick }) {
  const temp = tank.currentTemp;
  const hum = tank.humidity;
  const lo = tank.target_temp_min ?? 24;
  const hi = tank.target_temp_max ?? 32;
  const hLo = tank.target_hum_min ?? 40;
  const hHi = tank.target_hum_max ?? 70;
  const ts = tempStatus(temp, lo, hi);
  const hs = humStatus(hum, hLo, hHi);
  const health = tankHealth(temp, hum, lo, hi, hLo, hHi);
  const tone = tankTone(index);
  const tankRelays = relays.filter(r => r.tank_id === tank.id && r.enabled);
  const activeRelays = tankRelays.filter(r => r.current_state);

  return (
    <GlassCard
      className="tank-tile"
      style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}
      onClick={onClick}
    >
      {/* Header */}
      <div className="row gap-3" style={{ justifyContent: 'space-between' }}>
        <div className="row gap-3">
          <Avatar initial={tankInitial(tank.name)} tone={tone} size={44} />
          <div>
            <div className="t-display" style={{ fontSize: 15, color: 'var(--ink-1)' }}>{tank.name}</div>
            {tank.description && (
              <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 2 }}>{tank.description}</div>
            )}
          </div>
        </div>
        <Pill tone={health.tone}>
          <Dot tone={health.tone} />
          {health.label}
        </Pill>
      </div>

      <div style={{ borderTop: '1px solid var(--glass-border)' }} />

      {/* Temp + Humidity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Temperature */}
        <div className="col gap-2">
          <div className="row gap-2">
            <Icon name="thermometer" size={14} style={{ color: `var(--${ts})` }} />
            <span className="t-label">溫度</span>
          </div>
          <div className="kpi-value" style={{ fontSize: 28, color: `var(--${ts})` }}>
            {temp != null ? temp.toFixed(1) : '--'}
            <span style={{ fontSize: 14, color: 'var(--ink-3)', marginLeft: 3 }}>°C</span>
          </div>
          <div style={{ marginTop: 2 }}>
            {temp != null && (
              <RangeBar value={temp} min={lo - 4} max={hi + 4} lo={lo} hi={hi} tone={ts} />
            )}
            <div className="row" style={{ justifyContent: 'space-between', marginTop: 4 }}>
              <span className="t-mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>{lo}°</span>
              <span className="t-mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>{hi}°</span>
            </div>
          </div>
        </div>

        {/* Humidity */}
        <div className="col gap-2">
          <div className="row gap-2">
            <Icon name="drop" size={14} style={{ color: `var(--${hs})` }} />
            <span className="t-label">濕度</span>
          </div>
          <div className="kpi-value" style={{ fontSize: 28, color: `var(--${hs})` }}>
            {hum != null ? hum.toFixed(0) : '--'}
            <span style={{ fontSize: 14, color: 'var(--ink-3)', marginLeft: 3 }}>%</span>
          </div>
          <div style={{ marginTop: 2 }}>
            {hum != null && (
              <RangeBar value={hum} min={hLo - 10} max={hHi + 10} lo={hLo} hi={hHi} tone={hs} />
            )}
            <div className="row" style={{ justifyContent: 'space-between', marginTop: 4 }}>
              <span className="t-mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>{hLo}%</span>
              <span className="t-mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>{hHi}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Device chips + chevron */}
      <div className="row gap-2" style={{ justifyContent: 'space-between' }}>
        <div className="row gap-2">
          {tankRelays.slice(0, 5).map(r => (
            <DeviceIcon key={r.id} type={r.device_type} />
          ))}
        </div>
        <div className="row gap-2" style={{ color: 'var(--ink-4)', fontSize: 12 }}>
          <span className="t-mono">{activeRelays.length}/{tankRelays.length}</span>
          <span style={{ color: 'var(--ink-4)' }}>設備運行</span>
          <Icon name="chevron-right" size={14} />
        </div>
      </div>
    </GlassCard>
  );
}

function ClimateHero({ tanks }) {
  const temps = tanks.map(t => t.currentTemp).filter(Boolean);
  const avg = temps.length ? (temps.reduce((a, b) => a + b, 0) / temps.length) : null;
  const maxTemp = temps.length ? Math.max(...temps) : null;
  const minTemp = temps.length ? Math.min(...temps) : null;

  return (
    <GlassCard style={{ padding: 22 }}>
      <div className="t-label" style={{ marginBottom: 14 }}>綜合氣候</div>
      <div className="row gap-5" style={{ alignItems: 'flex-start' }}>
        <div className="col gap-3" style={{ minWidth: 130 }}>
          <div>
            <div className="kpi-value" style={{ fontSize: 40, color: 'var(--amber)' }}>
              {avg != null ? avg.toFixed(1) : '--'}
              <span style={{ fontSize: 18, color: 'var(--ink-3)', marginLeft: 4 }}>°C</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>平均溫度 · 全部飼養缸</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
            {maxTemp != null && (
              <div className="row gap-2">
                <Icon name="arrow-up" size={12} style={{ color: 'var(--crimson)' }} />
                <span style={{ fontSize: 12, color: 'var(--crimson)' }} className="t-mono">{maxTemp.toFixed(1)}°C</span>
                <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>最高</span>
              </div>
            )}
            {minTemp != null && (
              <div className="row gap-2">
                <Icon name="arrow-down" size={12} style={{ color: 'var(--sky)' }} />
                <span style={{ fontSize: 12, color: 'var(--sky)' }} className="t-mono">{minTemp.toFixed(1)}°C</span>
                <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>最低</span>
              </div>
            )}
          </div>
        </div>
        {/* Multi-tank temp sparklines */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tanks.slice(0, 3).map((tank, i) => (
            <div key={tank.id} className="row gap-3">
              <span style={{ fontSize: 12, color: 'var(--ink-3)', width: 60, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tank.name}</span>
              {tank.history24h?.length > 1 ? (
                <Sparkline
                  values={tank.history24h.map(h => h.temperature)}
                  color={`var(--${TONES[i]})`}
                  width={160}
                  height={28}
                  fill={false}
                />
              ) : (
                <div style={{ flex: 1, height: 28, borderRadius: 4, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
                  <span className="t-mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                    {tank.currentTemp != null ? `${tank.currentTemp.toFixed(1)}°C` : '無資料'}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

function ActivityCard({ events }) {
  return (
    <GlassCard style={{ padding: 22 }}>
      <div className="t-label" style={{ marginBottom: 14 }}>近期動態</div>
      {events.length === 0 ? (
        <div style={{ color: 'var(--ink-4)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>目前沒有動態</div>
      ) : (
        <div className="col gap-3">
          {events.slice(0, 6).map((ev, i) => (
            <div key={ev.id ?? i} className="row gap-3">
              <span className="t-mono" style={{ fontSize: 11, color: 'var(--ink-4)', width: 40, flexShrink: 0 }}>
                {new Date(ev.timestamp || ev.created_at || Date.now()).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })}
              </span>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'color-mix(in oklch, var(--amber) 10%, transparent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                color: 'var(--amber)',
              }}>
                <Icon name="pulse" size={13} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: 'var(--ink-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ev.message || ev.description || '系統事件'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

function UpcomingCard({ schedules, tanks }) {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const toneByType = { daily: 'amber', weekly: 'violet', cron: 'sky', temperature: 'crimson' };

  const upcoming = schedules
    .filter(s => s.is_enabled && s.start_time)
    .map(s => {
      const [h, m] = (s.start_time || '00:00').split(':').map(Number);
      const sMin = h * 60 + (m || 0);
      const diff = sMin >= nowMin ? sMin - nowMin : 1440 - nowMin + sMin;
      return { ...s, diffMin: diff, sMin };
    })
    .sort((a, b) => a.diffMin - b.diffMin)
    .slice(0, 5);

  return (
    <GlassCard style={{ padding: 22 }}>
      <div className="t-label" style={{ marginBottom: 14 }}>即將執行</div>
      {upcoming.length === 0 ? (
        <div style={{ color: 'var(--ink-4)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>暫無排程</div>
      ) : (
        <div className="col gap-3">
          {upcoming.map((s, i) => {
            const tone = toneByType[s.schedule_type] || 'amber';
            const tank = tanks.find(t => t.id === s.tank_id);
            return (
              <div key={s.id ?? i} className="row gap-3">
                <span className="t-num" style={{ fontSize: 12, color: `var(--${tone})`, width: 40, flexShrink: 0 }}>
                  {s.start_time?.slice(0, 5) || '--:--'}
                </span>
                <div style={{ width: 3, alignSelf: 'stretch', borderRadius: 2, background: `var(--${tone})`, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: 'var(--ink-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.name || '排程任務'}
                  </div>
                  {tank && <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>{tank.name}</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [tanks, setTanks] = useState([]);
  const [relays, setRelays] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [events, setEvents] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTanks = useCallback(async () => {
    const r = await fetch('/api/tanks');
    const data = await r.json();
    const withTemp = await Promise.all(data.map(async (tank, i) => {
      try {
        const [tr, hr] = await Promise.all([
          fetch(`/api/temperature/latest/${tank.id}`).then(x => x.json()),
          fetch(`/api/temperature/history/${tank.id}?hours=24`).then(x => x.json()).catch(() => []),
        ]);
        return {
          ...tank,
          currentTemp: tr?.temperature ?? null,
          humidity: tr?.humidity ?? null,
          history24h: Array.isArray(hr) ? hr : [],
        };
      } catch {
        return { ...tank, currentTemp: null, humidity: null, history24h: [] };
      }
    }));
    setTanks(withTemp);
  }, []);

  const loadAlerts = useCallback(async () => {
    try {
      const r = await fetch('/api/events/alerts/active?limit=5');
      setAlerts(await r.json());
    } catch { setAlerts([]); }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        loadTanks(),
        loadAlerts(),
        fetch('/api/relays').then(r => r.json()).then(setRelays).catch(() => {}),
        fetch('/api/events?limit=6').then(r => r.json()).then(setEvents).catch(() => {}),
        fetch('/api/schedules').then(r => r.json()).then(setSchedules).catch(() => {}),
      ]);
      setLoading(false);
    };
    init();
    const t1 = setInterval(loadTanks, 5000);
    const t2 = setInterval(loadAlerts, 30000);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, [loadTanks, loadAlerts]);

  const activeTanks = tanks.filter(t => t.currentTemp != null).length;
  const activeDevices = relays.filter(r => r.current_state && r.enabled).length;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: 'var(--ink-3)' }}>
        載入中…
      </div>
    );
  }

  return (
    <div className="col gap-5">
      {/* KPI Hero Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.4fr 1fr 1fr 1fr', gap: 16 }}>
        <ClimateHero tanks={tanks} />
        <KpiCard
          label="飼養缸"
          value={tanks.length}
          sublabel={`${activeTanks} 個資料正常`}
          tone="amber"
          icon={<Icon name="tank" size={16} />}
        />
        <KpiCard
          label="異常告警"
          value={alerts.length}
          sublabel={alerts.length === 0 ? '目前一切正常' : '點擊查看詳情'}
          tone={alerts.length > 0 ? 'crimson' : 'sage'}
          icon={<Icon name="alert" size={16} />}
        />
        <KpiCard
          label="運行設備"
          value={activeDevices}
          sublabel={`共 ${relays.filter(r => r.enabled).length} 個設備`}
          tone="sky"
          icon={<Icon name="pulse" size={16} />}
        />
      </div>

      {/* Tank Tiles */}
      <div>
        <div className="row gap-3" style={{ marginBottom: 16 }}>
          <span className="t-display" style={{ fontSize: 18 }}>飼養缸</span>
          <span className="t-mono" style={{ fontSize: 13, color: 'var(--ink-4)' }}>{tanks.length} 個</span>
        </div>
        {tanks.length === 0 ? (
          <GlassCard style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}>
            尚未建立任何飼養缸
          </GlassCard>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 16 }}>
            {tanks.map((tank, i) => (
              <TankTile
                key={tank.id}
                tank={tank}
                relays={relays}
                index={i}
                onClick={() => navigate(`/tank/${tank.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Activity + Upcoming */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.4fr 1fr', gap: 16 }}>
        <ActivityCard events={events} />
        <UpcomingCard schedules={schedules} tanks={tanks} />
      </div>
    </div>
  );
}
