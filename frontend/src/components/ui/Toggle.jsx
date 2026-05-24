export default function Toggle({ on, onChange, tone = '' }) {
  return (
    <div
      className={`toggle${tone ? ' ' + tone : ''}${on ? ' on' : ''}`}
      onClick={() => onChange && onChange(!on)}
      role="switch"
      aria-checked={on}
    />
  );
}
