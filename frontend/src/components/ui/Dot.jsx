export default function Dot({ tone = 'sage', pulse = false, style }) {
  return (
    <span
      className={`dot${pulse ? ' pulse' : ''}`}
      style={{ color: `var(--${tone})`, ...style }}
    />
  );
}
