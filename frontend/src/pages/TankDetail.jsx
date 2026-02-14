import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Thermometer, Droplets, Power, Settings, Activity } from 'lucide-react';

// 動態獲取 API base URL
const API_BASE = window.location.origin;

const TankDetail = () => {
  const { tankId } = useParams();
  const navigate = useNavigate();

  const [tank, setTank] = useState(null);
  const [currentTemp, setCurrentTemp] = useState(null);
  const [currentHumidity, setCurrentHumidity] = useState(null);
  const [relayChannels, setRelayChannels] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [tempHistory, setTempHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // 載入飼養缸基本資料
  const loadTankData = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/tanks/${tankId}`);
      if (!response.ok) {
        throw new Error('飼養缸不存在');
      }
      const data = await response.json();
      setTank(data);
    } catch (error) {
      console.error('載入飼養缸資料失敗:', error);
      alert('載入飼養缸資料失敗，請返回重試');
      navigate('/dashboard');
    }
  };

  // 載入當前溫濕度資料
  const loadCurrentTemperature = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/temperature/latest/${tankId}`);
      if (response.ok) {
        const data = await response.json();
        setCurrentTemp(data.temperature);
        setCurrentHumidity(data.humidity);
      }
    } catch (error) {
      console.error('載入溫度資料失敗:', error);
    }
  };

  // 載入繼電器通道資料
  const loadRelayChannels = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/relays`);
      if (response.ok) {
        const data = await response.json();
        // 只顯示屬於這個飼養缸的繼電器
        const tankRelays = data.filter(relay => relay.tank_id === parseInt(tankId));
        setRelayChannels(tankRelays);
      }
    } catch (error) {
      console.error('載入繼電器資料失敗:', error);
    }
  };

  // 載入排程資料
  const loadSchedules = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/schedules`);
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      }
    } catch (error) {
      console.error('載入排程資料失敗:', error);
    }
  };

  // 載入溫度歷史記錄
  const loadTemperatureHistory = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/temperature/history/${tankId}?hours=24`);
      if (response.ok) {
        const data = await response.json();
        // 轉換資料格式供圖表使用
        const formattedData = data.map(item => ({
          time: new Date(item.timestamp).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
          temp: item.temperature,
          humidity: item.humidity || 0
        }));
        // 只取最近12筆資料以保持圖表清晰
        setTempHistory(formattedData.slice(-12));
      }
    } catch (error) {
      console.error('載入溫度歷史失敗:', error);
    }
  };

  // 初始載入
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await loadTankData();
      await Promise.all([
        loadCurrentTemperature(),
        loadRelayChannels(),
        loadSchedules(),
        loadTemperatureHistory()
      ]);
      setLoading(false);
    };
    loadAll();

    // 每 5 秒更新溫度和繼電器狀態
    const interval = setInterval(() => {
      loadCurrentTemperature();
      loadRelayChannels();
    }, 5000);

    return () => clearInterval(interval);
  }, [tankId]);

  // 切換繼電器狀態
  const handleRelayToggle = async (relay) => {
    try {
      const response = await fetch(`${API_BASE}/api/relays/${relay.id}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state: !relay.current_state,
          manual: true
        })
      });

      if (response.ok) {
        // 立即更新本地狀態以獲得即時反饋
        await loadRelayChannels();
      } else {
        alert('控制繼電器失敗');
      }
    } catch (error) {
      console.error('控制繼電器失敗:', error);
      alert('控制繼電器失敗，請檢查網路連接');
    }
  };

  // 取消手動覆寫，回到自動模式
  const handleClearOverride = async (relay) => {
    try {
      const response = await fetch(`${API_BASE}/api/relays/${relay.id}/clear-override`, {
        method: 'POST'
      });

      if (response.ok) {
        await loadRelayChannels();
        alert(`${relay.name} 已回到自動排程控制模式`);
      } else {
        alert('操作失敗');
      }
    } catch (error) {
      console.error('清除手動覆寫失敗:', error);
      alert('操作失敗，請檢查網路連接');
    }
  };

  // 獲取設備相關的排程
  const getRelaySchedules = (relayId) => {
    return schedules.filter(s => s.relay_channel_id === relayId && s.active);
  };

  const getTempStatus = () => {
    if (!tank || currentTemp === null) return { text: '無資料', color: 'text-gray-600', bg: 'bg-gray-100' };
    if (currentTemp < tank.target_temp_min) return { text: '偏低', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (currentTemp > tank.target_temp_max) return { text: '偏高', color: 'text-red-600', bg: 'bg-red-100' };
    return { text: '正常', color: 'text-green-600', bg: 'bg-green-100' };
  };

  // 載入中狀態
  if (loading || !tank) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  const tempStatus = getTempStatus();

  return (
    <div className="space-y-6">
      {/* 返回按鈕和標題 */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{tank.name}</h1>
          {tank.description && (
            <p className="text-gray-600 mt-1">{tank.description}</p>
          )}
        </div>
        <button
          onClick={() => navigate('/tanks')}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span>編輯設定</span>
        </button>
      </div>

      {/* 主要監控卡片 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 溫度卡片 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">溫度監控</h3>
            <Thermometer className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {currentTemp !== null ? currentTemp.toFixed(1) : '--'}°C
            </div>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${tempStatus.bg} ${tempStatus.color}`}>
              {tempStatus.text}
            </span>
            <div className="mt-4 text-sm text-gray-600">
              目標: {tank.target_temp_min}°C - {tank.target_temp_max}°C
            </div>
          </div>
        </div>

        {/* 濕度卡片 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">濕度監控</h3>
            <Droplets className="w-6 h-6 text-cyan-600" />
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {currentHumidity !== null ? currentHumidity.toFixed(0) : '--'}%
            </div>
            <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-cyan-100 text-cyan-600">
              {tank.target_humidity_min && tank.target_humidity_max ? '已設定範圍' : '未設定範圍'}
            </span>
            <div className="mt-4 text-sm text-gray-600">
              {tank.target_humidity_min && tank.target_humidity_max 
                ? `目標: ${tank.target_humidity_min}% - ${tank.target_humidity_max}%`
                : '建議: 50% - 70%'
              }
            </div>
          </div>
        </div>

        {/* 能耗卡片 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">設備統計</h3>
            <Power className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {relayChannels.filter(r => r.current_state && r.enabled).length}
            </div>
            <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-600">
              運行中設備
            </span>
            <div className="mt-4 text-sm text-gray-600">
              總共 {relayChannels.length} 個設備
            </div>
          </div>
        </div>
      </div>

      {/* 趋势图表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">溫度趨勢</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={tempHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={[20, 35]} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="temp" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="溫度 (°C)"
                dot={{ fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">濕度趨勢</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={tempHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={[40, 90]} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="humidity" 
                stroke="#06b6d4" 
                strokeWidth={2}
                name="濕度 (%)"
                dot={{ fill: '#06b6d4' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 设备控制面板 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">設備控制</h3>
        {relayChannels.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Power className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>此飼養缸尚未關聯任何設備</p>
            <p className="text-sm mt-2">請到「飼養缸管理」頁面編輯設定</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relayChannels.map((relay) => {
              const isOn = relay.current_state;
              const isEnabled = relay.enabled;
              const isManual = relay.manual_override;
              const relaySchedules = getRelaySchedules(relay.id);
              const hasSchedule = relaySchedules.length > 0;
              
              return (
                <div key={relay.id} className={`p-4 border-2 rounded-lg transition-all ${
                  !isEnabled 
                    ? 'border-gray-300 bg-gray-100 opacity-60' 
                    : isOn 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{relay.name}</h4>
                    <div className={`w-3 h-3 rounded-full ${
                      !isEnabled 
                        ? 'bg-gray-400' 
                        : isOn 
                          ? 'bg-green-500 animate-pulse' 
                          : 'bg-gray-300'
                    }`} />
                  </div>
                  
                  <div className="text-xs text-gray-600 mb-2">
                    通道: CH{relay.channel} · {relay.device_type}
                  </div>
                  
                  {relay.description && (
                    <div className="text-xs text-gray-500 mb-2">
                      {relay.description}
                    </div>
                  )}
                  
                  {/* 控制模式標示 */}
                  <div className="mb-3">
                    {isManual ? (
                      <div className="flex items-center text-xs">
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded font-semibold">
                          🔧 手動模式
                        </span>
                      </div>
                    ) : hasSchedule ? (
                      <div className="flex items-center text-xs">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-semibold">
                          ⏰ 排程控制
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center text-xs">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded">
                          無排程
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 排程資訊 */}
                  {hasSchedule && (
                    <div className="text-xs text-gray-600 mb-2 space-y-1">
                      {relaySchedules.map(schedule => (
                        <div key={schedule.id} className="flex items-center">
                          <span className="text-blue-600">📅</span>
                          <span className="ml-1">{schedule.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* 控制按鈕 */}
                  <div className="space-y-2">
                    <button
                      onClick={() => handleRelayToggle(relay)}
                      disabled={!isEnabled}
                      className={`w-full py-2 rounded-lg font-medium transition-colors ${
                        !isEnabled
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : isOn 
                            ? 'bg-red-600 hover:bg-red-700 text-white' 
                            : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {!isEnabled ? '已停用' : isOn ? '關閉' : '開啟'}
                    </button>
                    
                    {/* 回到自動模式按鈕 */}
                    {isManual && isEnabled && (
                      <button
                        onClick={() => handleClearOverride(relay)}
                        className="w-full py-1.5 text-xs rounded-lg font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                      >
                        ⏰ 回到自動模式
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 最近事件 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">最近事件</h3>
        <div className="space-y-3">
          {[
            { time: '14:32', event: '溫度達到目標範圍', type: 'success' },
            { time: '13:15', event: '加熱墊已開啟', type: 'info' },
            { time: '12:00', event: 'UVB燈已開啟', type: 'info' },
            { time: '08:00', event: '照明系統已開啟（自動排程）', type: 'info' }
          ].map((log, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  log.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                }`} />
                <span className="text-sm font-medium text-gray-500">{log.time}</span>
                <span className="text-sm text-gray-900">{log.event}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TankDetail;
