import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import GlassCard from '../components/ui/GlassCard';
import Pill from '../components/ui/Pill';
import Dot from '../components/ui/Dot';
import Avatar from '../components/ui/Avatar';
import Icon from '../components/ui/Icon';
import Toggle from '../components/ui/Toggle';
import ArcGauge from '../components/ui/ArcGauge';
import RangeBar from '../components/ui/RangeBar';
import { Tabs, Tab } from '../components/ui/Tabs';

const TONES = ['amber', 'sage', 'violet', 'sky', 'crimson', 'amber'];
function tankInitial(name) { return name ? name.charAt(0) : '?'; }
function tankTone(id) {
  const n = parseInt(id) || 0;
  return TONES[n % TONES.length];
}

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
function healthOf(temp, hum, tLo, tHi, hLo, hHi) {
  const ts = tempStatus(temp, tLo, tHi);
  const hs = humStatus(hum, hLo, hHi);
  if (ts === 'crimson') return { tone: 'crimson', label: '需注意' };
  if (ts === 'sage' && hs === 'sage') return { tone: 'sage', label: '一切正常' };
  return { tone: 'amber', label: '可微調' };
}

function deviceIcon(type) {
  const m = { lighting: 'lightbulb', heating: 'sun', humidifier: 'mist', fan: 'fan', relay: 'pulse' };
  return m[type] || 'pulse';
}
function deviceTone(type) {
  const m = { lighting: 'violet', heating: 'amber', humidifier: 'sky', fan: 'sage', relay: 'amber' };
  return m[type] || 'amber';
}

function ControlPanel({ relays, onToggle }) {
  const isMobile = useIsMobile();
  if (!relays.length) {
    return <div style={{ color: 'var(--ink-3)', textAlign: 'center', padding: '32px 0' }}>此飼養缸無設備</div>;
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: 14 }}>
      {relays.map(relay => {
        const tone = deviceTone(relay.device_type);
        const icon = deviceIcon(relay.device_type);
        const on = relay.current_state;
        return (
          <GlassCard key={relay.id} style={{ padding: 20 }}>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: on ? `color-mix(in oklch, var(--${tone}) 20%, transparent)` : 'rgba(255,255,255,0.04)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: on ? `var(--${tone})` : 'var(--ink-4)',
                transition: 'background 200ms, color 200ms',
              }}>
                <Icon name={icon} size={20} />
              </div>
              <Toggle
                on={on}
                tone={tone}
                onChange={() => onToggle(relay.id, !on)}
              />
            </div>
            <div className="t-display" style={{ fontSize: 14, color: 'var(--ink-1)', marginBottom: 4 }}>
              {relay.label || relay.name || `CH${relay.channel_number}`}
            </div>
            <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>
              {relay.description || relay.device_type || '繼電器'}
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}

function SchedulePanel({ schedules, relays }) {
  const hours = Array.from({ length: 7 }, (_, i) => i * 4);
  if (!schedules.length) {
    return <div style={{ color: 'var(--ink-3)', textAlign: 'center', padding: '32px 0' }}>此飼養缸無排程</div>;
  }
  const now = new Date();
  const nowFrac = (now.getHours() * 60 + now.getMinutes()) / 1440;

  return (
    <GlassCard style={{ padding: 22 }}>
      {/* Hour ruler */}
      <div className="row" style={{ marginBottom: 8, paddingLeft: 130, gap: 0, position: 'relative' }}>
        {hours.map(h => (
          <div key={h} style={{ flex: h === 0 ? 0 : 1, fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>
            {String(h).padStart(2, '0')}
          </div>
        ))}
        <div style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>24</div>
      </div>

      <div className="col" style={{ gap: 8 }}>
        {schedules.map(s => {
          const relay = relays.find(r => r.id === s.relay_channel_id);
          const tone = deviceTone(relay?.device_type);
          const [sh, sm] = (s.start_time || '00:00').split(':').map(Number);
          const [eh, em] = (s.end_time || '23:59').split(':').map(Number);
          const startF = (sh * 60 + (sm || 0)) / 1440;
          const endF = (eh * 60 + (em || 0)) / 1440;
          const label = relay?.label || relay?.name || s.name || '設備';

          return (
            <div key={s.id} className="row gap-3">
              <div style={{ width: 120, flexShrink: 0, fontSize: 13, color: 'var(--ink-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {label}
              </div>
              <div style={{ flex: 1, position: 'relative' }}>
                <div className="sched-row">
                  <div
                    className="sched-seg"
                    style={{
                      left: `${startF * 100}%`,
                      width: `${Math.max((endF - startF) * 100, 1)}%`,
                      background: `var(--${tone})`,
                    }}
                  />
                  {/* Now indicator */}
                  <div style={{
                    position: 'absolute', top: 0, bottom: 0,
                    left: `${nowFrac * 100}%`,
                    width: 1, background: 'rgba(255,255,255,0.6)',
                    pointerEvents: 'none',
                  }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

function AlertsPanel({ tank }) {
  const isMobile = useIsMobile();
  const tLo = tank.target_temp_min ?? 24;
  const tHi = tank.target_temp_max ?? 32;
  const hLo = tank.target_humidity_min ?? 40;
  const hHi = tank.target_humidity_max ?? 70;

  const thresholds = [
    { icon: 'thermometer', label: '溫度下限', value: tLo, min: 15, max: 40, tone: 'sky', unit: '°C' },
    { icon: 'thermometer', label: '溫度上限', value: tHi, min: 15, max: 40, tone: 'crimson', unit: '°C' },
    { icon: 'drop', label: '濕度下限', value: hLo, min: 0, max: 100, tone: 'amber', unit: '%' },
    { icon: 'drop', label: '濕度上限', value: hHi, min: 0, max: 100, tone: 'sky', unit: '%' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.6fr 1fr', gap: 14 }}>
      <GlassCard style={{ padding: 22 }}>
        <div className="t-label" style={{ marginBottom: 16 }}>溫濕度門檻</div>
        <div className="col" style={{ gap: 16 }}>
          {thresholds.map((t, i) => (
            <div key={i} className="row gap-3">
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: `color-mix(in oklch, var(--${t.tone}) 12%, transparent)`,
                color: `var(--${t.tone})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name={t.icon} size={14} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{t.label}</span>
                  <span className="t-num" style={{ fontSize: 14, color: `var(--${t.tone})` }}>
                    {t.value}{t.unit}
                  </span>
                </div>
                <RangeBar value={t.value} min={t.min} max={t.max} lo={t.value - 1} hi={t.value + 1} tone={t.tone} />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
      <GlassCard style={{ padding: 22 }}>
        <div className="t-label" style={{ marginBottom: 16 }}>通知管道</div>
        <div className="col gap-3" style={{ alignItems: 'center', padding: '12px 0' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'color-mix(in oklch, var(--amber) 10%, transparent)',
            color: 'var(--amber)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="bell" size={18} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 4 }}>通知功能開發中</div>
            <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>推播、Email、LINE 通知即將推出</div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

const INP = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid var(--glass-border)',
  borderRadius: 10,
  padding: '9px 13px',
  color: 'var(--ink-1)',
  fontSize: 14,
  fontFamily: 'var(--font-tc)',
  outline: 'none',
  width: '100%',
};
const NUM_INP = { ...INP, width: 88, textAlign: 'center' };

function EditTankModal({ tank, onClose, onSave }) {
  const [form, setForm] = useState({
    name: tank.name || '',
    description: tank.description || '',
    image_url: tank.image_url || null,
    target_temp_min: tank.target_temp_min ?? 24,
    target_temp_max: tank.target_temp_max ?? 32,
    target_humidity_min: tank.target_humidity_min ?? 40,
    target_humidity_max: tank.target_humidity_max ?? 70,
  });
  const [imagePreview, setImagePreview] = useState(tank.image_url || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => {
    const val = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    setForm(f => ({ ...f, [key]: val }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('圖片大小不能超過 5MB'); return; }
    if (!file.type.startsWith('image/')) { setError('請上傳圖片檔案'); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(f => ({ ...f, image_url: reader.result }));
      setImagePreview(reader.result);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setForm(f => ({ ...f, image_url: null }));
    setImagePreview(null);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('名稱不能空白'); return; }
    if (form.target_temp_min >= form.target_temp_max) { setError('溫度下限必須低於上限'); return; }
    if (form.target_humidity_min >= form.target_humidity_max) { setError('濕度下限必須低於上限'); return; }
    setSaving(true);
    setError('');
    try {
      const r = await fetch(`/api/tanks/${tank.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error('儲存失敗，請再試一次');
      onSave(await r.json());
      onClose();
    } catch (e) {
      setError(e.message);
    }
    setSaving(false);
  };

  const Field = ({ label, children }) => (
    <div className="col gap-2">
      <label style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</label>
      {children}
    </div>
  );

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.62)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <GlassCard style={{ width: '100%', maxWidth: 460, padding: 28 }}>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 24 }}>
          <div className="t-display" style={{ fontSize: 18 }}>編輯飼養缸</div>
          <button className="iconbtn" onClick={onClose}><Icon name="x" size={16} /></button>
        </div>

        <div className="col gap-4">
          <Field label="封面圖片">
            <div className="row gap-3" style={{ alignItems: 'flex-start' }}>
              {imagePreview ? (
                <div style={{ position: 'relative', width: 80, height: 80, borderRadius: 12, overflow: 'hidden', flexShrink: 0, border: '1px solid var(--glass-border)' }}>
                  <img src={imagePreview} alt="預覽" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    onClick={handleRemoveImage}
                    style={{
                      position: 'absolute', top: 4, right: 4,
                      width: 20, height: 20, borderRadius: '50%',
                      background: 'color-mix(in oklch, var(--crimson) 80%, black)',
                      border: 'none', cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      color: '#fff',
                    }}
                  >
                    <Icon name="x" size={10} />
                  </button>
                </div>
              ) : (
                <div style={{
                  width: 80, height: 80, borderRadius: 12, flexShrink: 0,
                  border: '1px dashed var(--glass-border)',
                  background: 'rgba(255,255,255,0.03)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--ink-4)',
                }}>
                  <Icon name="image" size={22} />
                </div>
              )}
              <div className="col gap-2">
                <input type="file" accept="image/*" id="tank-img-upload" onChange={handleImageUpload} style={{ display: 'none' }} />
                <label htmlFor="tank-img-upload" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)',
                  color: 'var(--ink-2)', fontSize: 13,
                }}>
                  <Icon name="upload" size={13} />
                  選擇圖片
                </label>
                <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>JPG / PNG，最大 5 MB</span>
              </div>
            </div>
          </Field>
          <Field label="名稱">
            <input value={form.name} onChange={set('name')} style={INP} placeholder="飼養缸名稱" />
          </Field>
          <Field label="描述（選填）">
            <input value={form.description || ''} onChange={set('description')} style={INP} placeholder="例如：肥尾守宮的家" />
          </Field>
          <Field label="目標溫度範圍（°C）">
            <div className="row gap-2">
              <input type="number" step="0.5" min="15" max="40" value={form.target_temp_min} onChange={set('target_temp_min')} style={NUM_INP} />
              <span style={{ color: 'var(--ink-3)' }}>–</span>
              <input type="number" step="0.5" min="15" max="45" value={form.target_temp_max} onChange={set('target_temp_max')} style={NUM_INP} />
              <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>°C</span>
            </div>
          </Field>
          <Field label="目標濕度範圍（%）">
            <div className="row gap-2">
              <input type="number" step="1" min="0" max="100" value={form.target_humidity_min} onChange={set('target_humidity_min')} style={NUM_INP} />
              <span style={{ color: 'var(--ink-3)' }}>–</span>
              <input type="number" step="1" min="0" max="100" value={form.target_humidity_max} onChange={set('target_humidity_max')} style={NUM_INP} />
              <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>%</span>
            </div>
          </Field>
        </div>

        {error && (
          <div style={{
            marginTop: 16, padding: '10px 14px', borderRadius: 10,
            background: 'color-mix(in oklch, var(--crimson) 12%, transparent)',
            color: 'var(--crimson)', fontSize: 13,
          }}>{error}</div>
        )}

        <div className="row gap-3" style={{ justifyContent: 'flex-end', marginTop: 24 }}>
          <button onClick={onClose} style={{
            padding: '9px 20px', borderRadius: 999, cursor: 'pointer',
            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
            color: 'var(--ink-2)', fontSize: 14,
          }}>取消</button>
          <button onClick={handleSave} disabled={saving} style={{
            padding: '9px 20px', borderRadius: 999, cursor: 'pointer',
            background: 'color-mix(in oklch, var(--amber) 20%, transparent)',
            border: '1px solid color-mix(in oklch, var(--amber) 40%, transparent)',
            color: 'var(--amber)', fontSize: 14, opacity: saving ? 0.6 : 1,
          }}>{saving ? '儲存中…' : '儲存'}</button>
        </div>
      </GlassCard>
    </div>
  );
}

function TwoLineChart({ history, tLo, tHi }) {
  if (!history?.length) {
    return (
      <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-4)', fontSize: 13 }}>
        暫無歷史資料
      </div>
    );
  }
  const data = history.map(h => ({
    time: new Date(h.timestamp).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false }),
    temp: h.temperature != null ? +h.temperature.toFixed(1) : null,
    hum: h.humidity != null ? +h.humidity.toFixed(0) : null,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 10, fill: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }} />
        <Tooltip
          contentStyle={{ background: 'var(--bg-1)', border: '1px solid var(--glass-border)', borderRadius: 10, fontSize: 12 }}
          labelStyle={{ color: 'var(--ink-3)' }}
        />
        {tLo && <ReferenceLine y={tLo} stroke="var(--sky)" strokeDasharray="3 3" strokeOpacity={0.4} />}
        {tHi && <ReferenceLine y={tHi} stroke="var(--crimson)" strokeDasharray="3 3" strokeOpacity={0.4} />}
        <Line type="monotone" dataKey="temp" stroke="var(--amber)" strokeWidth={1.5} dot={false} name="溫度°C" />
        <Line type="monotone" dataKey="hum" stroke="var(--sky)" strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="濕度%" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function TankDetail() {
  const { tankId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [tank, setTank] = useState(null);
  const [temp, setTemp] = useState(null);
  const [hum, setHum] = useState(null);
  const [relays, setRelays] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState('control');
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [feedToast, setFeedToast] = useState(false);

  const loadLatest = useCallback(async () => {
    try {
      const d = await fetch(`/api/temperature/latest/${tankId}`).then(r => r.json());
      setTemp(d?.temperature ?? null);
      setHum(d?.humidity ?? null);
    } catch {}
  }, [tankId]);

  const loadRelays = useCallback(async () => {
    try {
      const all = await fetch('/api/relays').then(r => r.json());
      setRelays(all.filter(r => String(r.tank_id) === String(tankId)));
    } catch {}
  }, [tankId]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [td] = await Promise.all([
          fetch(`/api/tanks/${tankId}`).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
          loadLatest(),
          loadRelays(),
          fetch(`/api/schedules`).then(r => r.json()).then(d => {
            setSchedules(d);
          }).catch(() => {}),
          fetch(`/api/temperature/history/${tankId}?hours=24`).then(r => r.json()).then(setHistory).catch(() => {}),
        ]);
        setTank(td);
      } catch {
        navigate('/');
      }
      setLoading(false);
    };
    init();
    const t = setInterval(() => { loadLatest(); loadRelays(); }, 5000);
    return () => clearInterval(t);
  }, [tankId, loadLatest, loadRelays, navigate]);

  const handleToggle = async (relayId, newState) => {
    setRelays(prev => prev.map(r => r.id === relayId ? { ...r, current_state: newState } : r));
    try {
      await fetch(`/api/relays/${relayId}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: newState }),
      });
    } catch {
      await loadRelays();
    }
  };

  if (loading || !tank) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: 'var(--ink-3)' }}>
        載入中…
      </div>
    );
  }

  const tLo = tank.target_temp_min ?? 24;
  const tHi = tank.target_temp_max ?? 32;
  const hLo = tank.target_humidity_min ?? 40;
  const hHi = tank.target_humidity_max ?? 70;
  const ts = tempStatus(temp, tLo, tHi);
  const hs = humStatus(hum, hLo, hHi);
  const health = healthOf(temp, hum, tLo, tHi, hLo, hHi);
  const tone = tankTone(tankId);

  const tankSchedules = schedules.filter(s =>
    relays.some(r => r.id === s.relay_channel_id)
  );

  return (
    <div className="col gap-5">
      {/* Hero */}
      <GlassCard style={{ padding: isMobile ? 18 : 28 }}>
        {isMobile ? (
          <div className="col" style={{ gap: 12 }}>
            {/* 第一列：Avatar + 按鈕 */}
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Avatar initial={tankInitial(tank.name)} tone={tone} size={56} src={tank.image_url || undefined} />
              <div className="row gap-2">
                <button className="iconbtn" title="編輯飼養缸設定" onClick={() => setEditOpen(true)}>
                  <Icon name="settings" size={16} />
                </button>
                <button className="iconbtn" title="餵食紀錄" onClick={() => {
                  setFeedToast(true);
                  setTimeout(() => setFeedToast(false), 2800);
                }}>
                  <Icon name="feed" size={16} />
                </button>
              </div>
            </div>
            {/* 第二列：名稱 + 狀態 */}
            <div className="row gap-2" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
              <div className="t-display" style={{ fontSize: 22 }}>{tank.name}</div>
              <Pill tone={health.tone}><Dot tone={health.tone} />{health.label}</Pill>
            </div>
            {tank.description && (
              <div style={{ color: 'var(--ink-2)', fontSize: 13 }}>{tank.description}</div>
            )}
            <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
              目標 {tLo}–{tHi}°C · 濕度 {hLo}–{hHi}%
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            <Avatar initial={tankInitial(tank.name)} tone={tone} size={88} src={tank.image_url || undefined} />
            <div className="col" style={{ flex: 1, gap: 8 }}>
              <div className="row gap-3">
                <div className="t-display" style={{ fontSize: 26 }}>{tank.name}</div>
                <Pill tone={health.tone}><Dot tone={health.tone} />{health.label}</Pill>
              </div>
              {tank.description && (
                <div style={{ color: 'var(--ink-2)', fontSize: 14 }}>{tank.description}</div>
              )}
              <div className="t-mono" style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                目標 {tLo}–{tHi}°C · 濕度 {hLo}–{hHi}%
              </div>
            </div>
            <div className="row gap-2">
              <button className="iconbtn" title="編輯飼養缸設定" onClick={() => setEditOpen(true)}>
                <Icon name="settings" size={16} />
              </button>
              <button className="iconbtn" title="餵食紀錄" onClick={() => {
                setFeedToast(true);
                setTimeout(() => setFeedToast(false), 2800);
              }}>
                <Icon name="feed" size={16} />
              </button>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Gauges + Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1.4fr', gap: 16 }}>
        {/* Temp gauge */}
        <GlassCard style={{ padding: 22, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <ArcGauge
            value={temp ?? tLo}
            min={15} max={45}
            lo={tLo} hi={tHi}
            color={`var(--${ts})`}
            size={200}
            label="溫度" unit="°C"
            sublabel={`目標 ${tLo}–${tHi}°C`}
          />
          <div style={{ width: '100%' }}>
            <RangeBar value={temp ?? tLo} min={15} max={45} lo={tLo} hi={tHi} tone={ts} />
          </div>
        </GlassCard>

        {/* Humidity gauge */}
        <GlassCard style={{ padding: 22, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <ArcGauge
            value={hum ?? hLo}
            min={10} max={100}
            lo={hLo} hi={hHi}
            color={`var(--${hs})`}
            size={200}
            label="濕度" unit="%"
            sublabel={`目標 ${hLo}–${hHi}%`}
          />
          <div style={{ width: '100%' }}>
            <RangeBar value={hum ?? hLo} min={10} max={100} lo={hLo} hi={hHi} tone={hs} />
          </div>
        </GlassCard>

        {/* 24h chart */}
        <GlassCard style={{ padding: 22 }}>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
            <div className="t-display" style={{ fontSize: 15 }}>24 小時走勢</div>
            <div className="row gap-3">
              <span className="t-mono" style={{ fontSize: 10, color: 'var(--amber)' }}>● 溫度</span>
              <span className="t-mono" style={{ fontSize: 10, color: 'var(--sky)' }}>● 濕度</span>
            </div>
          </div>
          <TwoLineChart history={history} tLo={tLo} tHi={tHi} />
        </GlassCard>
      </div>

      {/* Tabs */}
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <Tabs>
          <Tab active={tab === 'control'} onClick={() => setTab('control')}>手動控制</Tab>
          <Tab active={tab === 'schedule'} onClick={() => setTab('schedule')}>排程</Tab>
          <Tab active={tab === 'alerts'} onClick={() => setTab('alerts')}>告警設定</Tab>
        </Tabs>
        {tab === 'control' && (
          <Pill tone="amber">覆寫排程有效</Pill>
        )}
      </div>

      {tab === 'control' && <ControlPanel relays={relays} onToggle={handleToggle} />}
      {tab === 'schedule' && <SchedulePanel schedules={tankSchedules} relays={relays} />}
      {tab === 'alerts' && <AlertsPanel tank={tank} />}

      {editOpen && (
        <EditTankModal
          tank={tank}
          onClose={() => setEditOpen(false)}
          onSave={(updated) => setTank(updated)}
        />
      )}

      {feedToast && (
        <div style={{
          position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          zIndex: 300, whiteSpace: 'nowrap',
          background: 'var(--bg-1)', border: '1px solid var(--glass-border)',
          borderRadius: 14, padding: '12px 20px',
          fontSize: 13, color: 'var(--ink-2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
        }}>
          餵食紀錄功能即將推出
        </div>
      )}
    </div>
  );
}
