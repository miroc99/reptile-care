export default function Avatar({ initial, tone = 'amber', size = 44, src }) {
  if (src) {
    return (
      <div
        className={`avatar ${tone}`}
        style={{ width: size, height: size, padding: 0, overflow: 'hidden' }}
      >
        <img src={src} alt={initial} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
    );
  }
  return (
    <div
      className={`avatar ${tone}`}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {initial}
    </div>
  );
}
