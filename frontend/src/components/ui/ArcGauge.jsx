function describeArc(cx, cy, r, startDeg, endDeg) {
  const start = polarToCart(cx, cy, r, endDeg);
  const end = polarToCart(cx, cy, r, startDeg);
  const large = endDeg - startDeg <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`;
}
function polarToCart(cx, cy, r, angDeg) {
  const a = (angDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

export default function ArcGauge({ value, min, max, lo, hi, color = 'var(--amber)', size = 180, label, unit, sublabel }) {
  const r = size / 2 - 14;
  const cx = size / 2, cy = size / 2 + 4;
  const sweepDeg = 270;
  const startDeg = -225;
  const t = Math.min(Math.max((value - min) / (max - min), 0), 1);

  const polar = (angDeg) => {
    const a = (angDeg * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };

  const trackD = describeArc(cx, cy, r, startDeg, startDeg + sweepDeg);
  const fillD = t > 0 ? describeArc(cx, cy, r, startDeg, startDeg + sweepDeg * t) : null;

  const loT = (lo - min) / (max - min);
  const hiT = (hi - min) / (max - min);
  const loPos = polar(startDeg + sweepDeg * loT);
  const hiPos = polar(startDeg + sweepDeg * hiT);
  const tipPos = polar(startDeg + sweepDeg * t);

  const loAng = startDeg + sweepDeg * loT;
  const hiAng = startDeg + sweepDeg * hiT;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size}>
        <path d={trackD} stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="none" strokeLinecap="round" />
        {fillD && <path d={fillD} stroke={color} strokeWidth="8" fill="none" strokeLinecap="round" />}
        <line
          x1={loPos[0]} y1={loPos[1]}
          x2={loPos[0] + Math.cos(loAng * Math.PI / 180) * 8}
          y2={loPos[1] + Math.sin(loAng * Math.PI / 180) * 8}
          stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round"
        />
        <line
          x1={hiPos[0]} y1={hiPos[1]}
          x2={hiPos[0] + Math.cos(hiAng * Math.PI / 180) * 8}
          y2={hiPos[1] + Math.sin(hiAng * Math.PI / 180) * 8}
          stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round"
        />
        <circle cx={tipPos[0]} cy={tipPos[1]} r="6" fill={color} />
        <circle cx={tipPos[0]} cy={tipPos[1]} r="6" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      }}>
        <div className="t-label" style={{ marginBottom: 4 }}>{label}</div>
        <div className="kpi-value" style={{ fontSize: size * 0.22, color }}>
          {typeof value === 'number' ? value.toFixed(1) : '--'}
          <span style={{ fontSize: size * 0.12, color: 'var(--ink-3)', marginLeft: 3 }}>{unit}</span>
        </div>
        {sublabel && (
          <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 6 }}>
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
}
