import { useState, useEffect } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import GlassCard from '../components/ui/GlassCard';
import Pill from '../components/ui/Pill';
import Dot from '../components/ui/Dot';
import Icon from '../components/ui/Icon';
import { Tabs, Tab } from '../components/ui/Tabs';

function alertTone(level) {
  if (level === 'critical' || level === 'high') return 'crimson';
  if (level === 'error' || level === 'mid' || level === 'warning') return 'amber';
  return 'sky';
}

function AlertRow({ alert, onAck, dismissed }) {
  const tone = alertTone(alert.level || alert.type);
  const [hiding, setHiding] = useState(false);

  const handleAck = () => {
    setHiding(true);
    setTimeout(() => onAck(alert.id), 280);
  };

  if (dismissed) return null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 18px',
      borderBottom: '1px solid var(--glass-border)',
      opacity: hiding ? 0 : 1,
      maxHeight: hiding ? 0 : 80,
      overflow: 'hidden',
      transition: 'opacity 200ms, max-height 280ms ease',
    }}>
      <Dot tone={tone} pulse={tone === 'crimson'} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: 'var(--ink-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {alert.message || alert.description || '系統告警'}
        </div>
        <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 3 }}>
          {alert.time || (alert.created_at ? new Date(alert.created_at).toLocaleString('zh-TW') : '--')}
        </div>
      </div>
      <Pill tone={tone}>
        {tone === 'crimson' ? '嚴重' : tone === 'amber' ? '一般' : '輕微'}
      </Pill>
      <button
        onClick={handleAck}
        style={{
          flexShrink: 0, padding: '6px 14px', borderRadius: 'var(--radius-s)',
          background: 'color-mix(in oklch, var(--sage) 12%, transparent)',
          border: '1px solid color-mix(in oklch, var(--sage) 30%, transparent)',
          color: 'var(--sage)', fontSize: 12, cursor: 'pointer', fontWeight: 500,
        }}
      >
        處理
      </button>
    </div>
  );
}

function SeverityBar({ open, history }) {
  const all = [...open, ...history];
  const high = all.filter(a => ['critical', 'high'].includes(a.level || a.type)).length;
  const mid = all.filter(a => ['error', 'mid', 'warning'].includes(a.level || a.type)).length;
  const low = all.length - high - mid;
  const total = all.length || 1;

  return (
    <GlassCard style={{ padding: 22 }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
        <div className="t-display" style={{ fontSize: 14 }}>嚴重度分布</div>
        <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{all.length} 則</div>
      </div>
      <div style={{ height: 10, borderRadius: 999, overflow: 'hidden', background: 'rgba(255,255,255,0.04)', display: 'flex' }}>
        <div style={{ width: `${(high / total) * 100}%`, background: 'var(--crimson)', transition: 'width 600ms' }} />
        <div style={{ width: `${(mid / total) * 100}%`, background: 'var(--amber)', transition: 'width 600ms' }} />
        <div style={{ width: `${(low / total) * 100}%`, background: 'var(--sky)', transition: 'width 600ms' }} />
      </div>
      <div className="row gap-5" style={{ marginTop: 14 }}>
        {[
          { tone: 'crimson', label: '嚴重', count: high },
          { tone: 'amber',   label: '一般', count: mid  },
          { tone: 'sky',     label: '輕微', count: low  },
        ].map(s => (
          <div key={s.tone} className="col" style={{ gap: 3 }}>
            <div className="t-mono" style={{ fontSize: 18, color: `var(--${s.tone})` }}>{s.count}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function HeatmapBar({ alerts }) {
  const bins = Array(24).fill(0);
  alerts.forEach(a => {
    const t = a.created_at || a.time;
    if (t) {
      const h = new Date(t).getHours();
      if (!isNaN(h)) bins[h]++;
    }
  });
  const data = bins.map((v, h) => ({ h: String(h).padStart(2, '0'), v }));

  return (
    <GlassCard style={{ padding: 22 }}>
      <div className="t-label" style={{ marginBottom: 14 }}>觸發時段分布</div>
      <ResponsiveContainer width="100%" height={100}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <XAxis dataKey="h" tick={{ fontSize: 9, fill: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }} interval={3} />
          <YAxis tick={{ fontSize: 9, fill: 'var(--ink-4)' }} />
          <Tooltip
            contentStyle={{ background: 'var(--bg-1)', border: '1px solid var(--glass-border)', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: 'var(--ink-3)' }}
          />
          <Bar dataKey="v" fill="var(--crimson)" radius={[2, 2, 0, 0]} opacity={0.75} />
        </BarChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}

function SourceDonut({ alerts, tanks }) {
  const counts = {};
  alerts.forEach(a => {
    const key = String(a.tank_id ?? 'unknown');
    counts[key] = (counts[key] || 0) + 1;
  });
  const COLORS = ['var(--crimson)', 'var(--amber)', 'var(--sky)', 'var(--violet)', 'var(--sage)'];
  const data = Object.entries(counts).map(([id, value], i) => {
    const tank = tanks.find(t => String(t.id) === id);
    return { name: tank?.name || '未知', value, fill: COLORS[i % COLORS.length] };
  });

  if (!data.length) return null;

  return (
    <GlassCard style={{ padding: 22 }}>
      <div className="t-label" style={{ marginBottom: 14 }}>來源飼養缸</div>
      <div className="row gap-4">
        <PieChart width={100} height={100}>
          <Pie data={data} cx={50} cy={50} innerRadius={28} outerRadius={46} dataKey="value" paddingAngle={2}>
            {data.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
          </Pie>
        </PieChart>
        <div className="col" style={{ gap: 8, justifyContent: 'center' }}>
          {data.map((d, i) => (
            <div key={i} className="row gap-2">
              <div style={{ width: 8, height: 8, borderRadius: 999, background: d.fill, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>{d.name}</span>
              <span className="t-mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

export default function Alerts() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState([]);
  const [history, setHistory] = useState([]);
  const [tanks, setTanks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [dismissed, setDismissed] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/events/alerts/active?limit=20').then(r => r.json()),
      fetch('/api/events?limit=50').then(r => r.json()),
      fetch('/api/tanks').then(r => r.json()),
    ]).then(([active, all, t]) => {
      const activeIds = new Set((active || []).map(a => a.id));
      setOpen(active || []);
      setHistory((Array.isArray(all) ? all : []).filter(e => !activeIds.has(e.id)));
      setTanks(t || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleAck = (id) => {
    setDismissed(prev => new Set([...prev, id]));
  };

  const filteredHistory = history.filter(a => {
    if (filter === 'high') return ['critical', 'high'].includes(a.level || a.type);
    if (filter === 'mid') return ['error', 'mid', 'warning'].includes(a.level || a.type);
    if (filter === 'low') return !['critical', 'high', 'error', 'mid', 'warning'].includes(a.level || a.type);
    return true;
  });

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 60, color: 'var(--ink-3)' }}>載入中…</div>;
  }

  const activeOpen = open.filter(a => !dismissed.has(a.id));

  return (
    <div className="col gap-5">
      {/* Header */}
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="col" style={{ gap: 4 }}>
          <div className="t-display" style={{ fontSize: 22 }}>告警中心</div>
          <div style={{ color: 'var(--ink-3)', fontSize: 13 }}>
            {activeOpen.length} 則待處理 · {history.length} 則歷史記錄
          </div>
        </div>
        <button
          onClick={() => setDismissed(new Set(open.map(a => a.id)))}
          className="iconbtn"
          style={{ width: 'auto', padding: '0 14px', gap: 6, fontSize: 13 }}
        >
          <Icon name="check" size={14} />
          <span>全部標為已讀</span>
        </button>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: '目前待處理', value: activeOpen.length, tone: 'crimson' },
          { label: '嚴重告警', value: open.filter(a => ['critical', 'high'].includes(a.level || a.type)).length, tone: 'amber' },
          { label: '歷史記錄', value: history.length, tone: 'sky' },
          { label: '已解決', value: dismissed.size, tone: 'sage' },
        ].map((kpi, i) => (
          <GlassCard key={i} style={{ padding: 20 }}>
            <div className="t-label" style={{ marginBottom: 10 }}>{kpi.label}</div>
            <div className="kpi-value" style={{ fontSize: 32, color: `var(--${kpi.tone})` }}>{kpi.value}</div>
          </GlassCard>
        ))}
      </div>

      <SeverityBar open={open} history={history} />

      {/* Active alerts */}
      {open.length > 0 && (
        <div className="col" style={{ gap: 10 }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div className="t-display" style={{ fontSize: 16 }}>
              <span style={{ color: 'var(--crimson)', marginRight: 8 }}>●</span>待處理警報
            </div>
            <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{activeOpen.length} 則</div>
          </div>
          <GlassCard>
            {open.map(alert => (
              <AlertRow key={alert.id} alert={alert} onAck={handleAck} dismissed={dismissed.has(alert.id)} />
            ))}
          </GlassCard>
        </div>
      )}

      {/* Filter + History */}
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <Tabs>
          <Tab active={filter === 'all'} onClick={() => setFilter('all')}>全部</Tab>
          <Tab active={filter === 'high'} onClick={() => setFilter('high')}>嚴重</Tab>
          <Tab active={filter === 'mid'} onClick={() => setFilter('mid')}>一般</Tab>
          <Tab active={filter === 'low'} onClick={() => setFilter('low')}>輕微</Tab>
        </Tabs>
        <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
          {filteredHistory.length} / {history.length} 則
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.6fr 1fr', gap: 16, alignItems: 'flex-start' }}>
        {/* History list */}
        <GlassCard>
          {filteredHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--ink-3)', fontSize: 13 }}>
              <Icon name="check" size={32} style={{ color: 'var(--sage)', display: 'block', margin: '0 auto 12px' }} />
              過去 24 小時無警報
            </div>
          ) : filteredHistory.map((alert, i) => {
            const tone = alertTone(alert.level || alert.type);
            return (
              <div key={alert.id ?? i} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 18px',
                borderBottom: i < filteredHistory.length - 1 ? '1px solid var(--glass-border)' : 'none',
              }}>
                <Dot tone={tone} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: 'var(--ink-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {alert.message || alert.description || '系統事件'}
                  </div>
                  <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>
                    {alert.created_at ? new Date(alert.created_at).toLocaleString('zh-TW') : '--'}
                  </div>
                </div>
                <Pill tone={tone}>
                  {tone === 'crimson' ? '嚴重' : tone === 'amber' ? '一般' : '輕微'}
                </Pill>
              </div>
            );
          })}
        </GlassCard>

        {/* Charts */}
        <div className="col" style={{ gap: 16 }}>
          <HeatmapBar alerts={[...open, ...history]} />
          <SourceDonut alerts={[...open, ...history]} tanks={tanks} />
        </div>
      </div>
    </div>
  );
}
