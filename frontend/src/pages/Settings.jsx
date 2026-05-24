import { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import GlassCard from '../components/ui/GlassCard';
import Pill from '../components/ui/Pill';
import Dot from '../components/ui/Dot';
import Icon from '../components/ui/Icon';
import Toggle from '../components/ui/Toggle';

const SECTIONS = [
  { id: 'relays',   icon: 'tool',        label: '繼電器通道',   sub: '16 通道對映 · 手動測試' },
  { id: 'sensors',  icon: 'thermometer', label: '感測器原始數據', sub: '即時數值 · 採樣狀態' },
  { id: 'logs',     icon: 'pulse',       label: '系統日誌',     sub: '事件流 · 過濾 · 匯出' },
  { id: 'network',  icon: 'feed',        label: '網路與備份',   sub: 'IP · MQTT · 立即備份' },
];

function deviceTone(type) {
  const m = { lighting: 'violet', heating: 'amber', humidifier: 'sky', fan: 'sage', relay: 'amber' };
  return m[type] || 'amber';
}

function RelaysSection({ relays, tanks, onToggle }) {
  return (
    <div className="col gap-3">
      <GlassCard style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--glass-border)' }}>
          <div className="t-label">繼電器通道 · {relays.length} 個</div>
        </div>
        {relays.map((relay, i) => {
          const tone = deviceTone(relay.device_type);
          const tank = tanks.find(t => t.id === relay.tank_id);
          return (
            <div key={relay.id} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '12px 18px',
              borderBottom: i < relays.length - 1 ? '1px solid var(--glass-border)' : 'none',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: `color-mix(in oklch, var(--${tone}) 12%, transparent)`,
                color: `var(--${tone})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span className="t-mono" style={{ fontSize: 11 }}>
                  {relay.channel_number != null ? `${relay.channel_number}` : `CH${i + 1}`}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 500 }}>
                  {relay.label || relay.name || `通道 ${i + 1}`}
                </div>
                <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                  {relay.device_type || '未設定'}
                  {tank ? ` · ${tank.name}` : ''}
                </div>
              </div>
              <Pill tone={relay.current_state ? tone : ''}>
                {relay.current_state ? '運行中' : '已關閉'}
              </Pill>
              <Toggle
                on={relay.current_state}
                tone={tone}
                onChange={() => onToggle(relay.id, !relay.current_state)}
              />
            </div>
          );
        })}
      </GlassCard>
    </div>
  );
}

function SensorsSection({ tanks }) {
  const [readings, setReadings] = useState({});

  useEffect(() => {
    tanks.forEach(tank => {
      fetch(`/api/temperature/latest/${tank.id}`)
        .then(r => r.json())
        .then(d => setReadings(prev => ({ ...prev, [tank.id]: d })))
        .catch(() => {});
    });
  }, [tanks]);

  return (
    <GlassCard style={{ overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="t-label">感測器原始數據</div>
      </div>
      {tanks.length === 0 ? (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>無感測器資料</div>
      ) : tanks.map((tank, i) => {
        const r = readings[tank.id];
        return (
          <div key={tank.id} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 18px',
            borderBottom: i < tanks.length - 1 ? '1px solid var(--glass-border)' : 'none',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 500, marginBottom: 4 }}>{tank.name}</div>
              <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                {r?.timestamp ? `最後更新：${new Date(r.timestamp).toLocaleTimeString('zh-TW')}` : '等待資料…'}
              </div>
            </div>
            <div className="row gap-5">
              <div className="col" style={{ alignItems: 'flex-end' }}>
                <span className="t-label">溫度</span>
                <span className="t-num" style={{ fontSize: 20, color: 'var(--amber)' }}>
                  {r?.temperature != null ? `${r.temperature.toFixed(1)}°C` : '--'}
                </span>
              </div>
              <div className="col" style={{ alignItems: 'flex-end' }}>
                <span className="t-label">濕度</span>
                <span className="t-num" style={{ fontSize: 20, color: 'var(--sky)' }}>
                  {r?.humidity != null ? `${r.humidity.toFixed(0)}%` : '--'}
                </span>
              </div>
            </div>
            <Dot tone={r ? 'sage' : 'amber'} pulse={!!r} />
          </div>
        );
      })}
    </GlassCard>
  );
}

function LogsSection() {
  const [logs, setLogs] = useState([]);
  const logRef = useRef(null);

  useEffect(() => {
    fetch('/api/events?limit=50')
      .then(r => r.json())
      .then(data => setLogs(Array.isArray(data) ? data : []))
      .catch(() => {});

    const ws = new WebSocket(`ws://${window.location.host}/ws/logs`);
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        setLogs(prev => [msg, ...prev].slice(0, 100));
      } catch {
        setLogs(prev => [{ message: e.data, created_at: new Date().toISOString() }, ...prev].slice(0, 100));
      }
    };
    return () => ws.close();
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = 0;
  }, [logs]);

  return (
    <GlassCard style={{ overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--glass-border)' }} className="row">
        <span className="t-label" style={{ flex: 1 }}>系統日誌</span>
        <Dot tone="sage" pulse />
      </div>
      <div
        ref={logRef}
        style={{
          height: 360, overflowY: 'auto', padding: '12px 18px',
          fontFamily: 'var(--font-mono)', fontSize: 12,
          scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent',
        }}
      >
        {logs.length === 0 ? (
          <div style={{ color: 'var(--ink-4)', textAlign: 'center', paddingTop: 40 }}>等待日誌…</div>
        ) : logs.map((log, i) => (
          <div key={i} style={{ marginBottom: 6, color: 'var(--ink-3)', lineHeight: 1.5 }}>
            <span style={{ color: 'var(--ink-4)', marginRight: 12 }}>
              {log.created_at ? new Date(log.created_at).toLocaleTimeString('zh-TW', { hour12: false }) : '--:--:--'}
            </span>
            <span style={{ color: 'var(--ink-2)' }}>{log.message || log.description || JSON.stringify(log)}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function NetworkSection() {
  const [backing, setBacking] = useState(false);
  const [backupDone, setBackupDone] = useState(false);

  const handleBackup = async () => {
    setBacking(true);
    try {
      await fetch('/api/dev/export-db', { method: 'POST' });
      setBackupDone(true);
      setTimeout(() => setBackupDone(false), 3000);
    } catch {}
    setBacking(false);
  };

  return (
    <div className="col gap-4">
      <GlassCard style={{ padding: 22 }}>
        <div className="t-label" style={{ marginBottom: 16 }}>網路資訊</div>
        <div className="col" style={{ gap: 12 }}>
          {[
            { label: '主機名稱', value: window.location.hostname },
            { label: 'API 端點', value: `${window.location.origin}/api` },
            { label: '連線狀態', value: '已連線', tone: 'sage' },
          ].map((item, i) => (
            <div key={i} className="row" style={{ justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: 10 }}>
              <span className="t-label">{item.label}</span>
              <span className="t-mono" style={{ fontSize: 12, color: item.tone ? `var(--${item.tone})` : 'var(--ink-2)' }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard style={{ padding: 22 }}>
        <div className="t-label" style={{ marginBottom: 16 }}>備份與還原</div>
        <div className="col" style={{ gap: 14 }}>
          <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>
            手動匯出目前的資料庫與設定檔。
          </div>
          <button
            onClick={handleBackup}
            disabled={backing}
            style={{
              padding: '10px 20px', borderRadius: 'var(--radius-m)',
              background: backupDone
                ? 'color-mix(in oklch, var(--sage) 20%, transparent)'
                : 'color-mix(in oklch, var(--amber) 16%, transparent)',
              border: `1px solid color-mix(in oklch, var(--${backupDone ? 'sage' : 'amber'}) 35%, transparent)`,
              color: `var(--${backupDone ? 'sage' : 'amber'})`,
              fontSize: 13, fontWeight: 500, cursor: backing ? 'wait' : 'pointer',
              transition: 'all 200ms', width: 'fit-content',
            }}
          >
            {backupDone ? '✓ 備份完成' : backing ? '備份中…' : '立即備份'}
          </button>
        </div>
      </GlassCard>
    </div>
  );
}

export default function Settings() {
  const isMobile = useIsMobile();
  const [section, setSection] = useState('relays');
  const [relays, setRelays] = useState([]);
  const [tanks, setTanks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/relays').then(r => r.json()),
      fetch('/api/tanks').then(r => r.json()),
    ]).then(([r, t]) => {
      setRelays(r);
      setTanks(t);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleToggle = async (relayId, newState) => {
    setRelays(prev => prev.map(r => r.id === relayId ? { ...r, current_state: newState } : r));
    try {
      await fetch(`/api/relays/${relayId}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: newState ? 'on' : 'off' }),
      });
    } catch {
      const updated = await fetch('/api/relays').then(r => r.json()).catch(() => relays);
      setRelays(updated);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 60, color: 'var(--ink-3)' }}>載入中…</div>;
  }

  return (
    <div className="col gap-5">
      {/* Header */}
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="col" style={{ gap: 4 }}>
          <div className="t-display" style={{ fontSize: 22 }}>系統設定</div>
          <div className="t-mono" style={{ color: 'var(--ink-3)', fontSize: 12 }}>
            {window.location.hostname}
          </div>
        </div>
        <Pill tone="sage">
          <Dot tone="sage" pulse />
          系統運行中
        </Pill>
      </div>

      {/* Two-column: sidebar + content */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '220px 1fr', gap: 16, alignItems: 'flex-start' }}>
        {/* Sidebar */}
        <GlassCard style={{ padding: 10 }}>
          <div className="col" style={{ gap: 2 }}>
            {SECTIONS.map(s => (
              <div
                key={s.id}
                onClick={() => setSection(s.id)}
                style={{
                  padding: '11px 12px', borderRadius: 12, cursor: 'pointer',
                  background: section === s.id ? 'color-mix(in oklch, var(--amber) 14%, transparent)' : 'transparent',
                  color: section === s.id ? 'var(--amber)' : 'var(--ink-2)',
                  transition: 'background 160ms',
                }}
              >
                <div className="row gap-3">
                  <Icon name={s.icon} size={16} />
                  <div className="col" style={{ gap: 1, flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{s.label}</div>
                    <div className="t-mono" style={{ fontSize: 9, color: section === s.id ? 'color-mix(in oklch, var(--amber) 70%, transparent)' : 'var(--ink-4)' }}>
                      {s.sub}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Content */}
        <div className="col" style={{ gap: 16 }}>
          {section === 'relays'  && <RelaysSection relays={relays} tanks={tanks} onToggle={handleToggle} />}
          {section === 'sensors' && <SensorsSection tanks={tanks} />}
          {section === 'logs'    && <LogsSection />}
          {section === 'network' && <NetworkSection />}
        </div>
      </div>
    </div>
  );
}
