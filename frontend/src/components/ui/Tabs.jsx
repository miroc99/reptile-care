export function Tabs({ children, className = '' }) {
  return (
    <div className={`tabs${className ? ' ' + className : ''}`}>
      {children}
    </div>
  );
}

export function Tab({ children, active, onClick }) {
  return (
    <div className={`tab${active ? ' active' : ''}`} onClick={onClick}>
      {children}
    </div>
  );
}
