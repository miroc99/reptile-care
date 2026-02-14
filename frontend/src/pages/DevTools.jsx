import React, { useState, useEffect, useRef } from 'react';
import { 
  Power, 
  PowerOff, 
  ToggleLeft, 
  Zap, 
  Thermometer, 
  Activity,
  Server,
  Terminal,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Settings,
  Plus,
  Edit2,
  X,
  Save
} from 'lucide-react';

// 動態獲取 API base URL，支援本地和遠程訪問
const API_BASE = window.location.origin;

// 簡單的 Card 組件
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

// 簡單的 Button 組件
const Button = ({ children, onClick, variant = 'default', size = 'default', className = '', disabled = false }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
  };
  
  const sizeClasses = {
    default: 'px-4 py-2 text-sm',
    sm: 'px-3 py-1.5 text-xs',
    lg: 'px-6 py-3 text-base'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
};

// 簡單的 Badge 組件
const Badge = ({ children, variant = 'default', className = '' }) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    destructive: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

// 簡單的 Alert 組件
const Alert = ({ children, variant = 'default', className = '' }) => {
  const variantClasses = {
    default: 'bg-gray-50 border-gray-200 text-gray-800',
    destructive: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800'
  };
  
  return (
    <div className={`border rounded-lg p-4 ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};

const AlertDescription = ({ children }) => (
  <div className="text-sm">{children}</div>
);

const DevTools = () => {
  const [relayStatus, setRelayStatus] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [logs, setLogs] = useState([]);
  const [systemInfo, setSystemInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef(null);
  const logsEndRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(false);
  
  // 繼電器通道配置相關狀態
  const [relayChannels, setRelayChannels] = useState([]);
  const [tanks, setTanks] = useState([]);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [editingChannel, setEditingChannel] = useState(null);
  const [channelFormData, setChannelFormData] = useState({
    channel: 0,
    name: '',
    description: '',
    tank_id: null,
    device_type: 'relay',
    enabled: true
  });

  // 自動滾動到底部
  useEffect(() => {
    if (autoScroll) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // 載入控制器狀態
  const loadControllerStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/dev/controller/status`);
      const data = await response.json();
      setRelayStatus(data.relay_details || []);
    } catch (error) {
      console.error('載入控制器狀態失敗:', error);
    }
  };

  // 載入感測器數據
  const loadSensors = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/dev/sensors/raw`);
      const data = await response.json();
      setSensors(data.sensors || []);
    } catch (error) {
      console.error('載入感測器數據失敗:', error);
    }
  };

  // 載入系統信息
  const loadSystemInfo = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/dev/system/info`);
      const data = await response.json();
      setSystemInfo(data);
    } catch (error) {
      console.error('載入系統信息失敗:', error);
    }
  };

  // 載入繼電器通道配置
  const loadRelayChannels = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/relays`);
      const data = await response.json();
      setRelayChannels(data);
    } catch (error) {
      console.error('載入繼電器通道配置失敗:', error);
    }
  };

  // 載入飼養箱列表
  const loadTanks = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/tanks`);
      const data = await response.json();
      setTanks(data);
    } catch (error) {
      console.error('載入飼養箱列表失敗:', error);
    }
  };

  // 初始載入
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([
        loadControllerStatus(),
        loadSensors(),
        loadSystemInfo(),
        loadRelayChannels(),
        loadTanks()
      ]);
      setLoading(false);
    };
    loadAll();

    // 定期刷新感測器數據
    const interval = setInterval(loadSensors, 2000);
    return () => clearInterval(interval);
  }, []);

  // WebSocket 連接
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        // 動態構建 WebSocket URL，支援 http/https 和本地/遠程訪問
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const ws = new WebSocket(`${protocol}//${window.location.host}/api/dev/logs`);
        
        ws.onopen = () => {
          console.log('WebSocket 已連接');
          setWsConnected(true);
        };
        
        ws.onmessage = (event) => {
          const log = JSON.parse(event.data);
          setLogs(prev => [...prev.slice(-999), log]); // 保留最近 1000 條
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket 錯誤:', error);
          setWsConnected(false);
        };
        
        ws.onclose = () => {
          console.log('WebSocket 已斷開');
          setWsConnected(false);
          // 3 秒後重連
          setTimeout(connectWebSocket, 3000);
        };
        
        wsRef.current = ws;
      } catch (error) {
        console.error('WebSocket 連接失敗:', error);
        setTimeout(connectWebSocket, 3000);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // 控制繼電器
  const controlRelay = async (channel, state) => {
    try {
      await fetch(`${API_BASE}/api/dev/controller/relay/${channel}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state })
      });
      await loadControllerStatus();
    } catch (error) {
      console.error('控制繼電器失敗:', error);
    }
  };

  // 切換繼電器
  const toggleRelay = async (channel) => {
    try {
      await fetch(`${API_BASE}/api/dev/controller/relay/${channel}/toggle`, {
        method: 'POST'
      });
      await loadControllerStatus();
    } catch (error) {
      console.error('切換繼電器失敗:', error);
    }
  };

  // 閃爍測試
  const flashRelay = async (channel) => {
    try {
      await fetch(`${API_BASE}/api/dev/controller/flash/${channel}`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('閃爍測試失敗:', error);
    }
  };

  // 控制所有繼電器
  const controlAllRelays = async (state) => {
    try {
      await fetch(`${API_BASE}/api/dev/controller/all-relays`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state })
      });
      await loadControllerStatus();
    } catch (error) {
      console.error('批量控制失敗:', error);
    }
  };

  // 清除日誌
  const clearLogs = () => {
    setLogs([]);
  };

  // 繼電器通道管理函數
  const handleAddChannel = () => {
    setEditingChannel(null);
    setChannelFormData({
      channel: 0,
      name: '',
      description: '',
      tank_id: null,
      device_type: 'relay',
      enabled: true
    });
    setShowChannelModal(true);
  };

  const handleEditChannel = (channel) => {
    setEditingChannel(channel);
    setChannelFormData({
      channel: channel.channel,
      name: channel.name,
      description: channel.description || '',
      tank_id: channel.tank_id,
      device_type: channel.device_type,
      enabled: channel.enabled
    });
    setShowChannelModal(true);
  };

  const handleSaveChannel = async () => {
    try {
      const url = editingChannel 
        ? `${API_BASE}/api/relays/${editingChannel.id}`
        : `${API_BASE}/api/relays`;
      
      const method = editingChannel ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(channelFormData)
      });

      if (response.ok) {
        await loadRelayChannels();
        setShowChannelModal(false);
      } else {
        const error = await response.json();
        alert(`保存失敗: ${error.detail}`);
      }
    } catch (error) {
      console.error('保存繼電器通道失敗:', error);
      alert('保存失敗，請檢查網絡連接');
    }
  };

  const handleDeleteChannel = async (channelId) => {
    if (!confirm('確定要刪除此繼電器通道配置嗎？')) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/relays/${channelId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadRelayChannels();
      } else {
        alert('刪除失敗');
      }
    } catch (error) {
      console.error('刪除繼電器通道失敗:', error);
      alert('刪除失敗，請檢查網絡連接');
    }
  };

  // 日誌級別顏色
  const getLogLevelColor = (level) => {
    const colors = {
      DEBUG: 'text-gray-500',
      INFO: 'text-blue-400',
      WARNING: 'text-yellow-400',
      ERROR: 'text-red-400',
      CRITICAL: 'text-red-600 font-bold'
    };
    return colors[level] || 'text-gray-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">開發者控制台</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">直接控制 Modbus 硬體、監控感測器和系統日誌</p>
        </div>
        <Badge variant={wsConnected ? 'success' : 'destructive'} className="text-sm self-start sm:self-auto">
          {wsConnected ? <CheckCircle className="w-4 h-4 mr-1" /> : <XCircle className="w-4 h-4 mr-1" />}
          {wsConnected ? '日誌已連接' : '日誌已斷開'}
        </Badge>
      </div>

      {/* Modbus 繼電器控制 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="flex items-center">
              <Server className="w-5 h-5 mr-2" />
              Modbus 繼電器控制（16 通道）
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={() => controlAllRelays(true)} variant="success" size="sm" className="flex-1 sm:flex-none">
                全開
              </Button>
              <Button onClick={() => controlAllRelays(false)} variant="destructive" size="sm" className="flex-1 sm:flex-none">
                全關
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {relayStatus.map((relay) => (
              <div
                key={relay.channel}
                className="border rounded-lg p-3 bg-gray-50 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-700 text-sm">CH {relay.channel}</span>
                  <Badge variant={relay.state ? 'success' : 'default'}>
                    {relay.state ? 'ON' : 'OFF'}
                  </Badge>
                </div>
                <div className="flex gap-1.5">
                  <Button
                    onClick={() => controlRelay(relay.channel, !relay.state)}
                    variant={relay.state ? 'destructive' : 'success'}
                    size="sm"
                    className="flex-1 min-w-0 px-2"
                  >
                    {relay.state ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                  </Button>
                  <Button
                    onClick={() => toggleRelay(relay.channel)}
                    variant="outline"
                    size="sm"
                    className="px-2"
                  >
                    <ToggleLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => flashRelay(relay.channel)}
                    variant="ghost"
                    size="sm"
                    className="hidden sm:inline-flex px-2"
                  >
                    <Zap className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 繼電器通道配置 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              繼電器通道配置
            </CardTitle>
            <Button onClick={handleAddChannel} size="sm" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              添加通道
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {relayChannels.length === 0 ? (
            <Alert variant="warning">
              <AlertDescription>尚未配置任何繼電器通道，請點擊「添加通道」開始配置</AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">通道</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">名稱</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">設備類型</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">關聯飼養缸</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">狀態</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {relayChannels.map((channel) => {
                    const tank = tanks.find(t => t.id === channel.tank_id);
                    return (
                      <tr key={channel.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <Badge variant="default">CH {channel.channel}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium text-gray-900">{channel.name}</div>
                            {channel.description && (
                              <div className="text-xs text-gray-500">{channel.description}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="info">{channel.device_type}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {tank ? tank.name : '未關聯'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={channel.enabled ? 'success' : 'default'}>
                            {channel.enabled ? '啟用' : '停用'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleEditChannel(channel)}
                              variant="outline"
                              size="sm"
                              className="px-2"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteChannel(channel.id)}
                              variant="destructive"
                              size="sm"
                              className="px-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 溫度感測器 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Thermometer className="w-5 h-5 mr-2" />
            溫度感測器原始數據
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sensors.length === 0 ? (
            <Alert variant="warning">
              <AlertDescription>未檢測到感測器</AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sensors.map((sensor) => (
                <div
                  key={sensor.id}
                  className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-700">{sensor.id}</span>
                    <Badge variant="info">{sensor.type}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 flex items-center">
                        <Thermometer className="w-4 h-4 mr-1" />
                        溫度
                      </span>
                      <span className="text-2xl font-bold text-blue-600">
                        {sensor.temperature?.toFixed(2)}°C
                      </span>
                    </div>
                    {sensor.humidity !== null && sensor.humidity !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">濕度</span>
                        <span className="text-lg font-semibold text-blue-600">
                          {sensor.humidity?.toFixed(1)}%
                        </span>
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      {new Date(sensor.timestamp).toLocaleString('zh-TW')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 系統信息 */}
      {systemInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              系統信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-sm text-gray-600 mb-1">作業系統</div>
                <div className="font-semibold">{systemInfo.os}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Python 版本</div>
                <div className="font-semibold">{systemInfo.python_version}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1 flex items-center">
                  <Activity className="w-4 h-4 mr-1" />
                  CPU 使用率
                </div>
                <div className="font-semibold text-blue-600">{systemInfo.cpu_percent}%</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">記憶體使用</div>
                <div className="font-semibold text-blue-600">{systemInfo.memory_percent}%</div>
              </div>
              {systemInfo.modbus_config && (
                <>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Modbus 端口</div>
                    <div className="font-semibold">{systemInfo.modbus_config.port}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">波特率</div>
                    <div className="font-semibold">{systemInfo.modbus_config.baudrate}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">從站地址</div>
                    <div className="font-semibold">{systemInfo.modbus_config.slave_id}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">模擬模式</div>
                    <Badge variant={systemInfo.modbus_config.simulation_mode ? 'warning' : 'success'}>
                      {systemInfo.modbus_config.simulation_mode ? '啟用' : '關閉'}
                    </Badge>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 實時日誌 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Terminal className="w-5 h-5 mr-2" />
              實時日誌
            </CardTitle>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="rounded border-gray-300"
                />
                自動滾動
              </label>
              <Button onClick={clearLogs} variant="outline" size="sm">
                <Trash2 className="w-4 h-4 mr-1" />
                清除
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="bg-gray-900 text-gray-100 font-mono text-sm h-96 overflow-y-auto p-4">
            {logs.length === 0 ? (
              <div className="text-gray-500 text-center py-8">等待日誌輸出...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className={`mb-1 ${getLogLevelColor(log.level)}`}>
                  <span className="text-gray-500">{log.timestamp}</span>
                  <span className="mx-2">[{log.level}]</span>
                  <span className="text-gray-400">{log.name}:</span>
                  <span className="ml-2">{log.message}</span>
                  {log.pathname && (
                    <span className="text-gray-600 ml-2">
                      ({log.pathname}:{log.lineno})
                    </span>
                  )}
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* 繼電器通道編輯模態框 */}
      {showChannelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingChannel ? '編輯繼電器通道' : '添加繼電器通道'}
              </h3>
              <button
                onClick={() => setShowChannelModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              {/* 通道編號 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  通道編號 (0-15) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={channelFormData.channel}
                  onChange={(e) => setChannelFormData({...channelFormData, channel: parseInt(e.target.value)})}
                  disabled={!!editingChannel}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              {/* 名稱 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  名稱 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={channelFormData.name}
                  onChange={(e) => setChannelFormData({...channelFormData, name: e.target.value})}
                  placeholder="例如：主缸加熱燈"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 描述 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  描述
                </label>
                <textarea
                  value={channelFormData.description}
                  onChange={(e) => setChannelFormData({...channelFormData, description: e.target.value})}
                  placeholder="選填：設備的詳細說明"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 設備類型 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  設備類型 <span className="text-red-500">*</span>
                </label>
                <select
                  value={channelFormData.device_type}
                  onChange={(e) => setChannelFormData({...channelFormData, device_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="relay">繼電器 (Relay)</option>
                  <option value="heating">加熱設備 (Heating)</option>
                  <option value="lighting">照明設備 (Lighting)</option>
                  <option value="humidifier">加濕器 (Humidifier)</option>
                  <option value="fan">風扇 (Fan)</option>
                </select>
              </div>

              {/* 關聯飼養缸 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  關聯飼養缸
                </label>
                <select
                  value={channelFormData.tank_id || ''}
                  onChange={(e) => setChannelFormData({...channelFormData, tank_id: e.target.value ? parseInt(e.target.value) : null})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">未關聯</option>
                  {tanks.map(tank => (
                    <option key={tank.id} value={tank.id}>
                      {tank.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 啟用狀態 */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={channelFormData.enabled}
                  onChange={(e) => setChannelFormData({...channelFormData, enabled: e.target.checked})}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  啟用此通道
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <Button
                onClick={() => setShowChannelModal(false)}
                variant="outline"
              >
                取消
              </Button>
              <Button
                onClick={handleSaveChannel}
                disabled={!channelFormData.name || channelFormData.channel < 0 || channelFormData.channel > 15}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                保存
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevTools;
