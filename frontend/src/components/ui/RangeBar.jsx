export default function RangeBar({ value, min, max, lo, hi, tone = 'amber' }) {
  const pct = v => Math.min(Math.max(((v - min) / (max - min)) * 100, 0), 100);
  const loP = pct(lo);
  const hiP = pct(hi);
  const valP = pct(value);
  return (
    <div className="range-track" style={{ width: '100%' }}>
      <div
        className="range-fill"
        style={{
          left: `${loP}%`,
          width: `${hiP - loP}%`,
          background: `color-mix(in oklch, var(--${tone}) 35%, transparent)`,
        }}
      />
      <div className="range-marker" style={{ left: `calc(${valP}% - 1px)` }} />
    </div>
  );
}
