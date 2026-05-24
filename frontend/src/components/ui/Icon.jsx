export default function Icon({ name, size = 18, stroke = 1.6, style, className }) {
  const common = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor",
    strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round",
    style, className,
  };
  switch (name) {
    case 'dashboard':
      return <svg {...common}><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>;
    case 'tank':
      return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 14 Q 7 12 12 14 T 21 14"/><circle cx="8" cy="10" r="0.8" fill="currentColor"/></svg>;
    case 'schedule':
      return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>;
    case 'bell':
      return <svg {...common}><path d="M6 8a6 6 0 1 1 12 0c0 4 1.5 5 2 6H4c.5-1 2-2 2-6Z"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>;
    case 'settings':
      return <svg {...common}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7 4.9l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>;
    case 'thermometer':
      return <svg {...common}><path d="M14 14V5a2 2 0 1 0-4 0v9a4 4 0 1 0 4 0Z"/><path d="M12 5v9"/></svg>;
    case 'drop':
      return <svg {...common}><path d="M12 3 6 11a6 6 0 1 0 12 0z"/></svg>;
    case 'sun':
      return <svg {...common}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>;
    case 'lightbulb':
      return <svg {...common}><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V18h6v-1.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2Z"/></svg>;
    case 'fan':
      return <svg {...common}><path d="M12 12a4 4 0 0 0-4-4 4 4 0 0 0 4 4Z"/><path d="M12 12a4 4 0 0 1-4 4 4 4 0 0 1 4-4Z"/><path d="M12 12a4 4 0 0 1 4-4 4 4 0 0 1-4 4Z"/><path d="M12 12a4 4 0 0 0 4 4 4 4 0 0 0-4-4Z"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></svg>;
    case 'mist':
      return <svg {...common}><path d="M5 11h14M3 15h18M5 19h14"/><path d="M7 7c0-1 1-2 2-2s1 1 2 1 2-1 3-1 2 1 2 2"/></svg>;
    case 'alert':
      return <svg {...common}><path d="M12 3 2 21h20L12 3Z"/><path d="M12 10v4M12 18h.01"/></svg>;
    case 'chevron-right':
      return <svg {...common}><path d="M9 6l6 6-6 6"/></svg>;
    case 'chevron-left':
      return <svg {...common}><path d="M15 6l-6 6 6 6"/></svg>;
    case 'arrow-up':
      return <svg {...common}><path d="M12 19V5M5 12l7-7 7 7"/></svg>;
    case 'arrow-down':
      return <svg {...common}><path d="M12 5v14M19 12l-7 7-7-7"/></svg>;
    case 'menu':
      return <svg {...common}><path d="M4 7h16M4 12h16M4 17h16"/></svg>;
    case 'plus':
      return <svg {...common}><path d="M12 5v14M5 12h14"/></svg>;
    case 'search':
      return <svg {...common}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>;
    case 'feed':
      return <svg {...common}><path d="M4 19c4-4 6-4 8-4s4 0 8-4"/><circle cx="6" cy="17" r="2"/><circle cx="18" cy="9" r="2"/></svg>;
    case 'pulse':
      return <svg {...common}><path d="M3 12h4l3-7 4 14 3-7h4"/></svg>;
    case 'check':
      return <svg {...common}><path d="M5 12l5 5L20 7"/></svg>;
    case 'tool':
      return <svg {...common}><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-2.5 2.5-2.5Z"/></svg>;
    case 'x':
      return <svg {...common}><path d="M18 6 6 18M6 6l12 12"/></svg>;
    case 'lizard':
      return <svg {...common} fill="currentColor" stroke="none"><path d="M3 12c0-2 2-3 4-2 1-2 4-2 5 0 2-2 6-1 7 2 1 0 2 1 2 2s-1 2-2 2c-1 1-3 2-5 2-1 1-4 1-5-1-2 0-4-2-4-3-1 0-2-1-2-2Z" opacity=".9"/></svg>;
    default: return null;
  }
}
