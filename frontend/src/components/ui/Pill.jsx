export default function Pill({ children, tone = '', className = '' }) {
  return (
    <span className={`pill${tone ? ' ' + tone : ''}${className ? ' ' + className : ''}`}>
      {children}
    </span>
  );
}
