export default function IconBtn({ children, onClick, title, className = '' }) {
  return (
    <button
      className={`iconbtn${className ? ' ' + className : ''}`}
      onClick={onClick}
      title={title}
      type="button"
    >
      {children}
    </button>
  );
}
