export default function Avatar({ initial, tone = 'amber', size = 44 }) {
  return (
    <div
      className={`avatar ${tone}`}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {initial}
    </div>
  );
}
