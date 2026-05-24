import { useMemo } from 'react';

export default function Sparkline({ values, color = 'var(--amber)', width = 120, height = 36, fill = true, range, showDots = false }) {
  const paths = useMemo(() => {
    if (!values || values.length < 2) return null;
    const min = range ? range[0] : Math.min(...values);
    const max = range ? range[1] : Math.max(...values);
    const span = Math.max(max - min, 0.001);
    const stepX = width / (values.length - 1);
    const pts = values.map((v, i) => [i * stepX, height - ((v - min) / span) * (height - 2) - 1]);
    const d = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
    const fillD = `${d} L${width},${height} L0,${height} Z`;
    return { d, fillD, pts };
  }, [values, width, height, range]);

  if (!paths) return <div style={{ width, height }} />;

  const gradId = `spark-${Math.random().toString(36).slice(2, 7)}`;

  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={paths.fillD} fill={`url(#${gradId})`} />}
      <path d={paths.d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {showDots && paths.pts.map(([x, y], i) =>
        i === paths.pts.length - 1
          ? <circle key={i} cx={x} cy={y} r="3" fill={color} />
          : null
      )}
    </svg>
  );
}
