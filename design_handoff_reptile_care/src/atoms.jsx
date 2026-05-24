// 爬蟲環控系統 · Icons + shared atoms (Gauge, Sparkline, Toggle, etc.)

const { useState, useEffect, useMemo, useRef } = React;

// ── Icons ──────────────────────────────────────────────────
const Icon = ({ name, size = 18, stroke = 1.6, style }) => {
  const s = size; const sw = stroke;
  const common = { width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round", style };
  switch (name) {
    case 'dashboard':
      return <svg {...common}><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>;
    case 'tank':
      return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 14 Q 7 12 12 14 T 21 14"/><circle cx="8" cy="10" r="0.8" fill="currentColor"/></svg>;
    case 'schedule':
      return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>;
    case 'bell':
      return <svg {...common}><path d="M6 8a6 6 0 1 1 12 0c0 4 1.5 5 2 6H4c.5-1 2-2 2-6Z"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>;
    case 'settings':
      return <svg {...common}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7 4.9l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>;
    case 'thermometer':
      return <svg {...common}><path d="M14 14V5a2 2 0 1 0-4 0v9a4 4 0 1 0 4 0Z"/><path d="M12 5v9"/></svg>;
    case 'drop':
      return <svg {...common}><path d="M12 3 6 11a6 6 0 1 0 12 0z"/></svg>;
    case 'sun':
      return <svg {...common}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>;
    case 'lightbulb':
      return <svg {...common}><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V18h6v-1.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2Z"/></svg>;
    case 'fan':
      return <svg {...common}><path d="M12 12a4 4 0 0 0-4-4 4 4 0 0 0 4 4Z"/><path d="M12 12a4 4 0 0 1-4 4 4 4 0 0 1 4-4Z"/><path d="M12 12a4 4 0 0 1 4-4 4 4 0 0 1-4 4Z"/><path d="M12 12a4 4 0 0 0 4 4 4 4 0 0 0-4-4Z"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></svg>;
    case 'mist':
      return <svg {...common}><path d="M5 11h14M3 15h18M5 19h14"/><path d="M7 7c0-1 1-2 2-2s1 1 2 1 2-1 3-1 2 1 2 2"/></svg>;
    case 'alert':
      return <svg {...common}><path d="M12 3 2 21h20L12 3Z"/><path d="M12 10v4M12 18h.01"/></svg>;
    case 'chevron-right':
      return <svg {...common}><path d="M9 6l6 6-6 6"/></svg>;
    case 'chevron-left':
      return <svg {...common}><path d="M15 6l-6 6 6 6"/></svg>;
    case 'arrow-up':
      return <svg {...common}><path d="M12 19V5M5 12l7-7 7 7"/></svg>;
    case 'arrow-down':
      return <svg {...common}><path d="M12 5v14M19 12l-7 7-7-7"/></svg>;
    case 'menu':
      return <svg {...common}><path d="M4 7h16M4 12h16M4 17h16"/></svg>;
    case 'plus':
      return <svg {...common}><path d="M12 5v14M5 12h14"/></svg>;
    case 'search':
      return <svg {...common}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>;
    case 'feed':
      return <svg {...common}><path d="M4 19c4-4 6-4 8-4s4 0 8-4"/><circle cx="6" cy="17" r="2"/><circle cx="18" cy="9" r="2"/></svg>;
    case 'pulse':
      return <svg {...common}><path d="M3 12h4l3-7 4 14 3-7h4"/></svg>;
    case 'check':
      return <svg {...common}><path d="M5 12l5 5L20 7"/></svg>;
    case 'tool':
      return <svg {...common}><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-2.5 2.5-2.5Z"/></svg>;
    case 'lizard':
      // simple geometric "lizard" silhouette (allowed: just paths, not photo-real)
      return <svg {...common} fill="currentColor" stroke="none"><path d="M3 12c0-2 2-3 4-2 1-2 4-2 5 0 2-2 6-1 7 2 1 0 2 1 2 2s-1 2-2 2c-1 1-3 2-5 2-1 1-4 1-5-1-2 0-4-2-4-3-1 0-2-1-2-2Z" opacity=".9"/></svg>;
    default: return null;
  }
};

// ── Sparkline ──────────────────────────────────────────────
function Sparkline({ values, color = "var(--amber)", width = 120, height = 36, fill = true, range, showDots = false }) {
  if (!values || values.length === 0) return null;
  const min = range ? range[0] : Math.min(...values);
  const max = range ? range[1] : Math.max(...values);
  const span = Math.max(max - min, 0.001);
  const stepX = width / (values.length - 1);
  const pts = values.map((v, i) => [i * stepX, height - ((v - min) / span) * height]);
  const d = pts.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(' ');
  const fillD = `${d} L${width},${height} L0,${height} Z`;
  const last = pts[pts.length - 1];
  const gradId = `sg-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={fillD} fill={`url(#${gradId})`} />}
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {showDots && pts.map(([x, y], i) => i === pts.length - 1 && (
        <circle key={i} cx={x} cy={y} r="3" fill={color} />
      ))}
    </svg>
  );
}

// ── Gauge (semi-circle, used in detail page) ────────────────
function ArcGauge({ value, min, max, lo, hi, color = "var(--amber)", size = 180, label, unit, sublabel }) {
  const r = size / 2 - 14;
  const cx = size / 2, cy = size / 2 + 4;
  const startAng = Math.PI * 0.85;
  const endAng = Math.PI * 0.15;
  // Convert value to angle along an arc going counterclockwise from startAng to (2π - 0.15π) then to endAng... simpler:
  // Use a full arc from -135deg to +135deg (270 degrees of sweep).
  const sweepDeg = 270;
  const startDeg = -225; // start at lower-left
  const t = Math.min(Math.max((value - min) / (max - min), 0), 1);
  const polar = (angDeg) => {
    const a = (angDeg * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  const trackD = describeArc(cx, cy, r, startDeg, startDeg + sweepDeg);
  const fillD = describeArc(cx, cy, r, startDeg, startDeg + sweepDeg * t);
  // Marker positions for lo/hi
  const loT = (lo - min) / (max - min);
  const hiT = (hi - min) / (max - min);
  const loPos = polar(startDeg + sweepDeg * loT);
  const hiPos = polar(startDeg + sweepDeg * hiT);
  const tipPos = polar(startDeg + sweepDeg * t);
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size}>
        <path d={trackD} stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="none" strokeLinecap="round"/>
        <path d={fillD} stroke={color} strokeWidth="8" fill="none" strokeLinecap="round"/>
        <line x1={loPos[0]} y1={loPos[1]} x2={loPos[0] + Math.cos((startDeg + sweepDeg * loT) * Math.PI/180) * 8} y2={loPos[1] + Math.sin((startDeg + sweepDeg * loT) * Math.PI/180) * 8} stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round"/>
        <line x1={hiPos[0]} y1={hiPos[1]} x2={hiPos[0] + Math.cos((startDeg + sweepDeg * hiT) * Math.PI/180) * 8} y2={hiPos[1] + Math.sin((startDeg + sweepDeg * hiT) * Math.PI/180) * 8} stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round"/>
        <circle cx={tipPos[0]} cy={tipPos[1]} r="6" fill={color} />
        <circle cx={tipPos[0]} cy={tipPos[1]} r="6" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1"/>
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center'
      }}>
        <div className="t-label" style={{ marginBottom: 4 }}>{label}</div>
        <div className="kpi-value" style={{ fontSize: size * 0.32, color }}>
          {value.toFixed(1)}
          <span style={{ fontSize: size * 0.14, color: 'var(--ink-3)', marginLeft: 4 }}>{unit}</span>
        </div>
        {sublabel && <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 6 }}>{sublabel}</div>}
      </div>
    </div>
  );
}

function describeArc(cx, cy, r, startDeg, endDeg) {
  const start = polarToCart(cx, cy, r, endDeg);
  const end = polarToCart(cx, cy, r, startDeg);
  const large = endDeg - startDeg <= 180 ? 0 : 1;
  return ['M', start.x, start.y, 'A', r, r, 0, large, 0, end.x, end.y].join(' ');
}
function polarToCart(cx, cy, r, angDeg) {
  const a = (angDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

// ── Toggle ─────────────────────────────────────────────────
function Toggle({ on, onChange, tone = '' }) {
  return (
    <div className={`toggle ${tone} ${on ? 'on' : ''}`} onClick={() => onChange && onChange(!on)} role="switch" aria-checked={on}/>
  );
}

// ── Avatar ────────────────────────────────────────────────
function Avatar({ tank, size = 44 }) {
  return (
    <div className={`avatar ${tank.avatar.tone}`} style={{ width: size, height: size, fontSize: size * 0.42 }}>
      {tank.avatar.initial}
    </div>
  );
}

// ── Status helpers ────────────────────────────────────────
function tempStatus(tank) {
  const { temp } = tank.current;
  const [lo, hi] = tank.target.temp;
  if (temp < lo) return { tone: 'sky', label: '偏低' };
  if (temp > hi) return { tone: 'crimson', label: '過高' };
  return { tone: 'sage', label: '正常' };
}
function humStatus(tank) {
  const { hum } = tank.current;
  const [lo, hi] = tank.target.hum;
  if (hum < lo) return { tone: 'amber', label: '偏乾' };
  if (hum > hi) return { tone: 'sky', label: '過濕' };
  return { tone: 'sage', label: '正常' };
}
function tankHealth(tank) {
  if (tank.alerts && tank.alerts.length) return { tone: 'crimson', label: '需注意' };
  const t = tempStatus(tank), h = humStatus(tank);
  if (t.tone === 'sage' && h.tone === 'sage') return { tone: 'sage', label: '一切正常' };
  return { tone: 'amber', label: '可微調' };
}

// Stitch everything onto window for the page scripts
Object.assign(window, {
  Icon, Sparkline, ArcGauge, Toggle, Avatar,
  tempStatus, humStatus, tankHealth,
});
