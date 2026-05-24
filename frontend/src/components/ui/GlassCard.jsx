export default function GlassCard({ children, hover = false, className = '', style, onClick }) {
  return (
    <div
      className={`glass${hover ? ' hover' : ''}${className ? ' ' + className : ''}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
