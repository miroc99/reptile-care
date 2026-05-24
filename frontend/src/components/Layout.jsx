import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from './ui/Icon';
import Dot from './ui/Dot';
import IconBtn from './ui/IconBtn';
import { useIsMobile } from '../hooks/useIsMobile';

const NAV_ITEMS = [
  { label: '儀表板', path: '/',         icon: 'dashboard' },
  { label: '排程',   path: '/schedule', icon: 'schedule'  },
  { label: '告警',   path: '/alerts',   icon: 'bell'      },
  { label: '設定',   path: '/settings', icon: 'settings'  },
];

function useNow() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);
  return now;
}


export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const now = useNow();
  const isMobile = useIsMobile();
  const [tanks, setTanks] = useState([]);
  const [tankTemps, setTankTemps] = useState({});

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/' || location.pathname.startsWith('/tank/');
    return location.pathname.startsWith(path);
  };

  const pageTitle = () => {
    if (location.pathname.startsWith('/tank/')) return '飼養缸詳情';
    const item = NAV_ITEMS.find(n => n.path !== '/' && location.pathname.startsWith(n.path));
    return item ? item.label : '儀表板';
  };

  const dateStr = now.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
  const timeStr = now.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false });

  useEffect(() => {
    fetch('/api/tanks')
      .then(r => r.json())
      .then(data => setTanks(data.slice(0, 6)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!tanks.length) return;
    tanks.forEach(tank => {
      fetch(`/api/temperature/latest/${tank.id}`)
        .then(r => r.json())
        .then(d => setTankTemps(prev => ({ ...prev, [tank.id]: d })))
        .catch(() => {});
    });
  }, [tanks]);

  const TONE_MAP = ['amber', 'sage', 'sky', 'violet', 'crimson', 'amber'];

  if (isMobile) {
    return (
      <div className="app-root" style={{ display: 'flex', flexDirection: 'column', height: '100dvh', position: 'relative', overflow: 'hidden' }}>
        <main className="mobile-scroll" style={{
          flex: 1,
          overflowY: 'auto',
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
          paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 16px))',
          paddingLeft: 16,
          paddingRight: 16,
        }}>
          <Outlet />
        </main>

        {/* Bottom tab bar */}
        <nav style={{
          position: 'fixed',
          left: 12, right: 12,
          bottom: 'calc(14px + env(safe-area-inset-bottom, 0px))',
          borderRadius: 24,
          background: 'rgba(20, 16, 12, 0.85)',
          backdropFilter: 'blur(24px) saturate(160%)',
          WebkitBackdropFilter: 'blur(24px) saturate(160%)',
          border: '1px solid var(--glass-border)',
          padding: '8px 6px',
          display: 'flex',
          justifyContent: 'space-around',
          zIndex: 50,
        }}>
          {NAV_ITEMS.map(item => {
            const active = isActive(item.path);
            return (
              <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  padding: '6px 10px',
                  color: active ? 'var(--amber)' : 'var(--ink-3)',
                  cursor: 'pointer',
                  transition: 'color 160ms',
                }}>
                  <Icon name={item.icon} size={20} />
                  <div style={{ fontSize: 9, fontWeight: 500 }}>{item.label}</div>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    );
  }

  return (
    <div className="app-root" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* NavRail */}
      <aside style={{
        width: 240, flexShrink: 0,
        background: 'rgba(0,0,0,0.18)',
        borderRight: '1px solid var(--glass-border)',
        display: 'flex', flexDirection: 'column',
        padding: '20px 12px',
        gap: 0, overflow: 'hidden',
      }}>
        {/* Brand */}
        <div className="row gap-3" style={{ padding: '2px 8px 20px', flexShrink: 0 }}>
          <div className="avatar amber" style={{ width: 38, height: 38, fontSize: 16 }}>
            <Icon name="lizard" size={20} />
          </div>
          <span className="t-display" style={{ fontSize: 15, color: 'var(--ink-1)' }}>Terraria</span>
        </div>

        {/* Main Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
          {NAV_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              style={{ textDecoration: 'none' }}
            >
              <div className={`nav-item${isActive(item.path) ? ' active' : ''}`}>
                <span className="nav-icon">
                  <Icon name={item.icon} size={18} />
                </span>
                <span style={{ fontSize: 14 }}>{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>

        {/* Tank Quick-Jump */}
        {tanks.length > 0 && (
          <div style={{ marginTop: 28, flexShrink: 0 }}>
            <div className="t-label" style={{ padding: '0 14px 10px' }}>飼養缸</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {tanks.map((tank, i) => {
                const t = tankTemps[tank.id];
                const tone = TONE_MAP[i % TONE_MAP.length];
                const initial = tank.name ? tank.name.charAt(0) : '?';
                const isOnDetail = location.pathname === `/tank/${tank.id}`;
                const temp = t?.temperature;
                const hum = t?.humidity;
                return (
                  <div
                    key={tank.id}
                    onClick={() => navigate(`/tank/${tank.id}`)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 10px', borderRadius: 'var(--radius-m)',
                      cursor: 'pointer',
                      background: isOnDetail ? 'color-mix(in oklch, var(--amber) 8%, transparent)' : 'transparent',
                      transition: 'background 160ms',
                    }}
                    onMouseEnter={e => { if (!isOnDetail) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                    onMouseLeave={e => { if (!isOnDetail) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div className={`avatar ${tone}`} style={{ width: 28, height: 28, fontSize: 12, flexShrink: 0 }}>
                      {initial}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {tank.name}
                      </div>
                      {temp != null && (
                        <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                          {temp.toFixed(1)}°C · {hum != null ? hum.toFixed(0) + '%' : '--'}
                        </div>
                      )}
                    </div>
                    <Dot tone="sage" pulse />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ flex: 1 }} />
      </aside>

      {/* Right side: TopBar + Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* TopBar */}
        <header style={{
          flexShrink: 0,
          display: 'flex', alignItems: 'center',
          padding: '0 28px',
          height: 64,
          borderBottom: '1px solid var(--glass-border)',
          background: 'rgba(0,0,0,0.10)',
          gap: 16,
        }}>
          {location.pathname.startsWith('/tank/') && (
            <button
              onClick={() => navigate('/')}
              className="iconbtn"
              style={{ marginRight: 4 }}
              title="返回儀表板"
            >
              <Icon name="chevron-left" size={18} />
            </button>
          )}
          <div style={{ flex: 1 }}>
            <div className="t-label">{pageTitle()}</div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 1 }}>
              <span className="t-mono">{timeStr}</span>
              <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>
              {dateStr}
            </div>
          </div>
          <div className="row gap-3">
            <div className="pill sage row gap-2">
              <Dot tone="sage" pulse />
              系統運行中
            </div>
            <IconBtn title="搜尋">
              <Icon name="search" size={16} />
            </IconBtn>
            <IconBtn title="告警">
              <Icon name="bell" size={16} />
            </IconBtn>
          </div>
        </header>

        {/* Page Content */}
        <main className="scroll" style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
