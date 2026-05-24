import GlassCard from './GlassCard';

export default function KpiCard({ label, value, unit, sublabel, tone = 'amber', icon }) {
  return (
    <GlassCard style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="row gap-3" style={{ justifyContent: 'space-between' }}>
        <span className="t-label">{label}</span>
        {icon && (
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: `color-mix(in oklch, var(--${tone}) 12%, transparent)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: `var(--${tone})`,
          }}>
            {icon}
          </div>
        )}
      </div>
      <div className="row gap-2" style={{ alignItems: 'baseline' }}>
        <span className="kpi-value" style={{ fontSize: 36, color: `var(--${tone})` }}>
          {value}
        </span>
        {unit && <span className="t-muted" style={{ fontSize: 13 }}>{unit}</span>}
      </div>
      {sublabel && <span className="t-dim" style={{ fontSize: 12 }}>{sublabel}</span>}
    </GlassCard>
  );
}
