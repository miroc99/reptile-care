// 爬蟲環控系統 · Mobile · System Settings

const { useState: _msSt } = React;

function MSettingsPage({ setRoute }) {
  const [section, setSection] = _msSt('overview');

  const sections = [
    { id: 'overview', label: '概覽' },
    { id: 'relays',   label: '繼電器' },
    { id: 'sensors',  label: '感測器' },
    { id: 'logs',     label: '日誌' },
    { id: 'network',  label: '網路' },
    { id: 'backup',   label: '備份' },
  ];

  return (
    <div className="mobile-scroll" style={{ height: '100%', padding: '54px 16px 100px' }}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div className="col" style={{ gap: 4 }}>
          <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.16em' }}>reptile-ctrl.local</div>
          <div className="t-display" style={{ fontSize: 22 }}>系統設定</div>
        </div>
        <div className="pill sage" style={{ fontSize: 9, padding: '3px 8px' }}>
          <span className="dot pulse" style={{ color: 'var(--sage)' }}/>運行中
        </div>
      </div>

      {/* Section tabs (horizontal scroll) */}
      <div className="row" style={{ overflowX: 'auto', gap: 8, marginBottom: 14, paddingBottom: 4 }}>
        {sections.map((s) => (
          <div key={s.id} onClick={() => setSection(s.id)} style={{
            padding: '7px 14px', borderRadius: 999, fontSize: 12, whiteSpace: 'nowrap', cursor: 'pointer',
            background: section === s.id ? 'color-mix(in oklch, var(--amber) 18%, transparent)' : 'rgba(255,255,255,0.03)',
            color: section === s.id ? 'var(--amber)' : 'var(--ink-3)',
            border: `1px solid ${section === s.id ? 'color-mix(in oklch, var(--amber) 30%, transparent)' : 'var(--glass-border)'}`,
          }}>{s.label}</div>
        ))}
      </div>

      {section === 'overview' && <MOverview/>}
      {section === 'relays'   && <MRelays/>}
      {section === 'sensors'  && <MSensors/>}
      {section === 'logs'     && <MLogs/>}
      {section === 'network'  && <MNetwork/>}
      {section === 'backup'   && <MBackup/>}

      <MobileBottomNav active="settings" setRoute={setRoute}/>
    </div>
  );
}

function MOverview() {
  const sys = window.RC_DATA.SYSTEM_INFO;
  return (
    <div className="col gap-3">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <MMetric label="CPU"     value={sys.cpu}     unit="%"   tone="amber"/>
        <MMetric label="記憶體"   value={sys.memUsed} unit="%"   tone="sky"/>
        <MMetric label="儲存"     value={sys.storage} unit="%"   tone="violet"/>
        <MMetric label="CPU 溫度" value={sys.cpuTemp} unit="°C"  tone="sage"/>
      </div>

      <div className="glass" style={{ padding: 14 }}>
        <div className="t-display" style={{ fontSize: 13, marginBottom: 10 }}>主機資訊</div>
        <div className="col gap-2">
          <MInfoRow label="主機" value={sys.hostname} mono/>
          <MInfoRow label="IP"   value={sys.ip} mono/>
          <MInfoRow label="韌體" value={sys.firmware} mono/>
          <MInfoRow label="運行時間" value={sys.uptime}/>
        </div>
      </div>

      <div className="glass" style={{ padding: 14 }}>
        <div className="t-display" style={{ fontSize: 13, marginBottom: 10 }}>連線</div>
        <div className="col gap-2">
          <MInfoRow label="Wi-Fi" value={`${sys.ssid} · ${sys.rssi}dBm`} mono/>
          <MInfoRow label="MQTT" value={sys.mqtt.host} mono extra={<span className="dot" style={{ color: 'var(--sage)' }}/>}/>
          <MInfoRow label="延遲" value={`${sys.mqtt.latency} ms`} mono/>
        </div>
      </div>
    </div>
  );
}

function MMetric({ label, value, unit, tone }) {
  return (
    <div className="glass" style={{ padding: 12 }}>
      <div className="t-label" style={{ fontSize: 10 }}>{label}</div>
      <div className="kpi-value" style={{ fontSize: 22, color: `var(--${tone})`, marginTop: 4 }}>
        {value}<span style={{ fontSize: 10, color: 'var(--ink-3)', marginLeft: 3 }}>{unit}</span>
      </div>
      <div className="range-track" style={{ height: 3, marginTop: 6 }}>
        <div className="range-fill" style={{ left: 0, right: `${100 - (typeof value === 'number' ? value : 0)}%`, background: `var(--${tone})`, opacity: 0.7 }}/>
      </div>
    </div>
  );
}

function MInfoRow({ label, value, mono, extra }) {
  return (
    <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
      <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{label}</div>
      <div className="row gap-2" style={{ alignItems: 'center' }}>
        <div className={mono ? 't-mono' : ''} style={{ fontSize: 12, color: 'var(--ink-1)' }}>{value}</div>
        {extra}
      </div>
    </div>
  );
}

function MRelays() {
  const [relays, setRelays] = _msSt(window.RC_DATA.RELAYS);
  const used = relays.filter(r => r.tank).length;
  const onCount = relays.filter(r => r.state === 'on').length;
  const toggle = (ch) => setRelays(rs => rs.map(r => r.ch === ch ? { ...r, state: r.state === 'on' ? 'off' : 'on' } : r));
  return (
    <div className="col gap-3">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div className="glass" style={{ padding: 12 }}>
          <div className="t-label" style={{ fontSize: 10 }}>已使用</div>
          <div className="kpi-value" style={{ fontSize: 22, marginTop: 4, color: 'var(--amber)' }}>{used}<span style={{ fontSize: 11, color: 'var(--ink-3)' }}> / {relays.length}</span></div>
        </div>
        <div className="glass" style={{ padding: 12 }}>
          <div className="t-label" style={{ fontSize: 10 }}>運行中</div>
          <div className="kpi-value" style={{ fontSize: 22, marginTop: 4, color: 'var(--sage)' }}>{onCount}<span style={{ fontSize: 11, color: 'var(--ink-3)', marginLeft: 3 }}>件</span></div>
        </div>
      </div>

      <div className="col gap-2">
        {relays.map((r) => (
          <div key={r.ch} className="glass" style={{
            padding: 12,
            background: r.errors > 0 ? 'color-mix(in oklch, var(--crimson) 5%, var(--glass-bg))' : undefined,
          }}>
            <div className="row gap-3" style={{ alignItems: 'center' }}>
              <div className="t-mono" style={{ width: 26, fontSize: 14, color: 'var(--ink-2)', textAlign: 'center' }}>
                {String(r.ch).padStart(2,'0')}
              </div>
              <div className="col" style={{ flex: 1, gap: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: r.tank ? 'var(--ink-1)' : 'var(--ink-4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {r.tank ? r.device : '未指派'}
                </div>
                <div className="t-mono" style={{ fontSize: 9, color: 'var(--ink-3)' }}>
                  {r.gpio} · {r.tank || r.label}
                </div>
              </div>
              <div className="col" style={{ gap: 2, alignItems: 'flex-end', width: 60 }}>
                <div className="t-mono" style={{ fontSize: 10, color: r.state === 'on' ? 'var(--amber)' : 'var(--ink-4)' }}>
                  {r.state === 'on' ? 'ON' : 'OFF'}
                </div>
                <div className="t-mono" style={{ fontSize: 9, color: 'var(--ink-4)' }}>
                  {r.mode}
                </div>
              </div>
              <Toggle on={r.state === 'on'} tone="amber" onChange={() => toggle(r.ch)}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MSensors() {
  const sensors = window.RC_DATA.SENSORS;
  const [tick, setTick] = _msSt(0);
  React.useEffect(() => {
    const i = setInterval(() => setTick(t => t + 1), 1500);
    return () => clearInterval(i);
  }, []);
  return (
    <div className="col gap-2">
      {sensors.map((s) => {
        const noise = Math.sin(tick / 2 + s.id.charCodeAt(2)) * 0.04;
        return (
          <div key={s.id} className="glass" style={{ padding: 14 }}>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div className="col" style={{ gap: 2 }}>
                <div className="row gap-2">
                  <span className="t-mono" style={{ fontSize: 11, color: 'var(--amber)' }}>{s.id}</span>
                  <span className="t-mono" style={{ fontSize: 11 }}>{s.model}</span>
                </div>
                <div className="t-mono" style={{ fontSize: 9, color: 'var(--ink-3)' }}>{s.bus} · {s.addr}</div>
              </div>
              <div className="col" style={{ alignItems: 'flex-end', gap: 2 }}>
                <div className="row gap-1">
                  <span className="t-mono" style={{ fontSize: 10, color: s.status === 'ok' ? 'var(--sage)' : 'var(--amber)' }}>{s.signal}%</span>
                  <span className="dot pulse" style={{ color: s.status === 'ok' ? 'var(--sage)' : 'var(--amber)' }}/>
                </div>
                <div className="t-mono" style={{ fontSize: 9, color: 'var(--ink-4)' }}>{s.sampleHz}</div>
              </div>
            </div>
            <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginBottom: 8 }}>
              {s.tank || '未指派'} · {s.metric}
            </div>
            <div className="row gap-3" style={{ padding: '8px 10px', background: 'rgba(0,0,0,0.25)', borderRadius: 8 }}>
              {s.raw.t !== undefined && (
                <div className="col" style={{ flex: 1, gap: 1 }}>
                  <div className="t-mono" style={{ fontSize: 9, color: 'var(--ink-4)' }}>raw T</div>
                  <div className="t-mono" style={{ fontSize: 12, color: 'var(--amber)' }}>{(s.raw.t + noise).toFixed(2)}</div>
                </div>
              )}
              {s.raw.h !== undefined && (
                <div className="col" style={{ flex: 1, gap: 1 }}>
                  <div className="t-mono" style={{ fontSize: 9, color: 'var(--ink-4)' }}>raw H</div>
                  <div className="t-mono" style={{ fontSize: 12, color: 'var(--sky)' }}>{(s.raw.h + noise * 8).toFixed(2)}</div>
                </div>
              )}
              {s.raw.p !== undefined && (
                <div className="col" style={{ flex: 1, gap: 1 }}>
                  <div className="t-mono" style={{ fontSize: 9, color: 'var(--ink-4)' }}>raw P</div>
                  <div className="t-mono" style={{ fontSize: 12, color: 'var(--violet)' }}>{(s.raw.p + noise).toFixed(1)}</div>
                </div>
              )}
              {s.raw.d !== undefined && (
                <div className="col" style={{ flex: 1, gap: 1 }}>
                  <div className="t-mono" style={{ fontSize: 9, color: 'var(--ink-4)' }}>raw D</div>
                  <div className="t-mono" style={{ fontSize: 12, color: 'var(--sage)' }}>{(s.raw.d + noise).toFixed(2)}</div>
                </div>
              )}
              <div className="col" style={{ alignItems: 'flex-end', gap: 1 }}>
                <div className="t-mono" style={{ fontSize: 9, color: 'var(--ink-4)' }}>偏移</div>
                <div className="t-mono" style={{ fontSize: 10 }}>{s.offset}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MLogs() {
  const allLogs = window.RC_DATA.LOGS;
  const [level, setLevel] = _msSt('all');
  const filtered = allLogs.filter(l => level === 'all' || l.level === level);
  const levelColor = (l) => l === 'ERROR' ? 'crimson' : l === 'WARN' ? 'amber' : l === 'INFO' ? 'sky' : 'ink-4';
  return (
    <div className="col gap-3">
      <div className="row" style={{ overflowX: 'auto', gap: 6, paddingBottom: 4 }}>
        {[['all','全部'],['ERROR','ERROR'],['WARN','WARN'],['INFO','INFO'],['DEBUG','DEBUG']].map(([k, l]) => (
          <div key={k} onClick={() => setLevel(k)} style={{
            padding: '5px 10px', borderRadius: 999, cursor: 'pointer',
            fontSize: 10, fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap',
            background: level === k ? `color-mix(in oklch, var(--${levelColor(k === 'all' ? 'INFO' : k)}) 14%, transparent)` : 'rgba(255,255,255,0.03)',
            border: `1px solid ${level === k ? 'rgba(255,255,255,0.18)' : 'var(--glass-border)'}`,
            color: level === k ? 'var(--ink-1)' : 'var(--ink-3)',
          }}>{l}</div>
        ))}
      </div>
      <div className="glass" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ maxHeight: 460, overflow: 'auto' }}>
          {filtered.map((l, i) => {
            const c = levelColor(l.level);
            return (
              <div key={i} className="col" style={{
                padding: '8px 12px',
                gap: 2,
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                background: l.level === 'ERROR' ? 'color-mix(in oklch, var(--crimson) 5%, transparent)' : 'transparent',
              }}>
                <div className="row gap-2">
                  <span className="t-mono" style={{ fontSize: 9, color: 'var(--ink-4)' }}>{l.t}</span>
                  <span className="t-mono" style={{ fontSize: 9, color: `var(--${c})`, fontWeight: 500 }}>{l.level}</span>
                  <span className="t-mono" style={{ fontSize: 9, color: 'var(--ink-3)' }}>[{l.src}]</span>
                </div>
                <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-1)', lineHeight: 1.4 }}>{l.msg}</div>
              </div>
            );
          })}
        </div>
        <div className="row" style={{ padding: '6px 12px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
          <div className="t-mono" style={{ fontSize: 9, color: 'var(--ink-3)', flex: 1 }}>{filtered.length} / {allLogs.length} 行</div>
          <div className="t-mono" style={{ fontSize: 9, color: 'var(--sage)' }}>
            <span className="dot pulse" style={{ color: 'var(--sage)' }}/> live
          </div>
        </div>
      </div>
    </div>
  );
}

function MNetwork() {
  const sys = window.RC_DATA.SYSTEM_INFO;
  return (
    <div className="col gap-3">
      <div className="glass" style={{ padding: 14 }}>
        <div className="t-display" style={{ fontSize: 13, marginBottom: 10 }}>Wi-Fi</div>
        <div className="col gap-2">
          <MInfoRow label="SSID" value={sys.ssid} mono/>
          <MInfoRow label="訊號" value={`${sys.rssi} dBm`} mono extra={<span className="dot" style={{ color: 'var(--sage)' }}/>}/>
          <MInfoRow label="IP"   value={sys.ip} mono/>
          <MInfoRow label="MAC"  value="A4:CF:12:34:56:78" mono/>
        </div>
      </div>
      <div className="glass" style={{ padding: 14 }}>
        <div className="t-display" style={{ fontSize: 13, marginBottom: 10 }}>MQTT</div>
        <div className="col gap-2">
          <MInfoRow label="Broker" value={sys.mqtt.host} mono/>
          <MInfoRow label="延遲"   value={`${sys.mqtt.latency} ms`} mono/>
          <MInfoRow label="Topics" value={`${sys.mqtt.topics} 訂閱`}/>
        </div>
      </div>
    </div>
  );
}

function MBackup() {
  return (
    <div className="col gap-3">
      <div className="glass" style={{ padding: 14 }}>
        <div className="row" style={{ justifyContent: 'space-between', padding: '6px 0' }}>
          <div className="col" style={{ gap: 2 }}>
            <div style={{ fontSize: 13 }}>自動每日備份</div>
            <div className="t-mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>每日 03:00</div>
          </div>
          <Toggle on={true} onChange={() => {}} tone="sage"/>
        </div>
      </div>
      <div className="glass" style={{ padding: 14 }}>
        <div className="t-display" style={{ fontSize: 13, marginBottom: 10 }}>歷史資料庫</div>
        <div className="col gap-2">
          <MInfoRow label="大小"   value="8.4 MB" mono/>
          <MInfoRow label="記錄"   value="184,320 筆" mono/>
          <MInfoRow label="保留期" value="30 天"/>
        </div>
      </div>
      <div className="col gap-2">
        <div className="iconbtn" style={{ width: '100%', padding: '12px', height: 44, gap: 6, justifyContent: 'center' }}>
          <Icon name="arrow-down" size={14}/><span style={{ fontSize: 12 }}>下載當前設定</span>
        </div>
        <div className="iconbtn" style={{ width: '100%', padding: '12px', height: 44, gap: 6, justifyContent: 'center' }}>
          <Icon name="arrow-up" size={14}/><span style={{ fontSize: 12 }}>還原備份</span>
        </div>
      </div>
      <div className="glass" style={{ padding: 14, borderColor: 'color-mix(in oklch, var(--crimson) 25%, transparent)' }}>
        <div className="t-display" style={{ fontSize: 12, marginBottom: 10, color: 'var(--crimson)' }}>危險區域</div>
        <div className="col gap-2">
          <div className="iconbtn" style={{ width: '100%', justifyContent: 'center', padding: '10px', height: 38, fontSize: 11, color: 'var(--crimson)', borderColor: 'color-mix(in oklch, var(--crimson) 30%, transparent)' }}>清空歷史資料</div>
          <div className="iconbtn" style={{ width: '100%', justifyContent: 'center', padding: '10px', height: 38, fontSize: 11, color: 'var(--crimson)', borderColor: 'color-mix(in oklch, var(--crimson) 30%, transparent)' }}>還原原廠設定</div>
          <div className="iconbtn" style={{ width: '100%', justifyContent: 'center', padding: '10px', height: 38, fontSize: 11, color: 'var(--crimson)', borderColor: 'color-mix(in oklch, var(--crimson) 30%, transparent)' }}>重新啟動裝置</div>
        </div>
      </div>
    </div>
  );
}

window.MSettingsPage = MSettingsPage;
