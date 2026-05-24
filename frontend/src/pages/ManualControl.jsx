import React, { useState, useEffect } from 'react';
import { Power, Lightbulb, Zap, Wind, ChevronDown, Activity } from 'lucide-react';

// 動態獲取 API base URL
const API_BASE = window.location.origin;

const ManualControl = () => {
  const [tanks, setTanks] = useState([]);
  const [relayChannels, setRelayChannels] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedTankId, setSelectedTankId] = useState(null);
  const [loading, setLoading] = useState(true);

  // 載入飼養缸資料
  const loadTanks = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/tanks`);
      const data = await response.json();
      setTanks(data);
      if (data.length > 0 && !selectedTankId) {
        setSelectedTankId(data[0].id);
      }
    } catch (error) {
      console.error('載入飼養缸失敗:', error);
    }
  };

  // 載入繼電器通道資料
  const loadRelayChannels = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/relays`);
      const data = await response.json();
      setRelayChannels(data);
    } catch (error) {
      console.error('載入繼電器資料失敗:', error);
    }
  };

  // 載入排程資料
  const loadSchedules = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/schedules`);
      const data = await response.json();
      setSchedules(data);
    } catch (error) {
      console.error('載入排程資料失敗:', error);
    }
  };

  // 初始載入
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([loadTanks(), loadRelayChannels(), loadSchedules()]);
      setLoading(false);
    };
    loadAll();

    // 每 2 秒更新繼電器狀態
    const interval = setInterval(loadRelayChannels, 2000);
    return () => clearInterval(interval);
  }, []);

  // 控制繼電器
  const handleToggle = async (channel) => {
    try {
      const response = await fetch(`${API_BASE}/api/relays/${channel.id}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state: !channel.current_state
        })
      });

      if (response.ok) {
        await loadRelayChannels();
      } else {
        alert('控制失敗');
      }
    } catch (error) {
      console.error('控制繼電器失敗:', error);
      alert('控制失敗，請檢查網路連接');
    }
  };

  // 獲取設備相關的排程
  const getRelaySchedules = (relayId) => {
    return schedules.filter(s => s.relay_channel_id === relayId && s.active);
  };

  // 全部開啟
  const handleAllOn = async () => {
    const selectedChannels = relayChannels.filter(ch => 
      ch.tank_id === selectedTankId && ch.enabled
    );

    for (const channel of selectedChannels) {
      if (!channel.current_state) {
        await handleToggle(channel);
      }
    }
  };

  // 全部關閉
  const handleAllOff = async () => {
    const selectedChannels = relayChannels.filter(ch => 
      ch.tank_id === selectedTankId && ch.enabled
    );

    for (const channel of selectedChannels) {
      if (channel.current_state) {
        await handleToggle(channel);
      }
    }
  };

  // 取得選中飼養缸的繼電器通道
  const getSelectedTankChannels = () => {
    return relayChannels.filter(ch => ch.tank_id === selectedTankId && ch.enabled);
  };

  // 設備類型圖示
  const getDeviceIcon = (deviceType) => {
    const icons = {
      lighting: Lightbulb,
      heating: Zap,
      humidifier: Wind,
      fan: Wind,
      relay: Power
    };
    return icons[deviceType] || Power;
  };

  // 設備類型顏色
  const getDeviceColor = (deviceType) => {
    const colors = {
      lighting: { bg: 'bg-yellow-100', text: 'text-yellow-600', button: 'bg-yellow-600 hover:bg-yellow-700' },
      heating: { bg: 'bg-orange-100', text: 'text-orange-600', button: 'bg-orange-600 hover:bg-orange-700' },
      humidifier: { bg: 'bg-blue-100', text: 'text-blue-600', button: 'bg-blue-600 hover:bg-blue-700' },
      fan: { bg: 'bg-cyan-100', text: 'text-cyan-600', button: 'bg-cyan-600 hover:bg-cyan-700' },
      relay: { bg: 'bg-purple-100', text: 'text-purple-600', button: 'bg-purple-600 hover:bg-purple-700' }
    };
    return colors[deviceType] || colors.relay;
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

  if (tanks.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">尚未建立任何飼養缸</p>
          <a 
            href="/tanks"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
          >
            前往建立飼養缸
          </a>
        </div>
      </div>
    );
  }

  const selectedTank = tanks.find(t => t.id === selectedTankId);
  const tankChannels = getSelectedTankChannels();

  const colorClasses = {
    yellow: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-600',
      button: 'bg-yellow-600 hover:bg-yellow-700'
    },
    orange: {
      bg: 'bg-orange-100',
      text: 'text-orange-600',
      button: 'bg-orange-600 hover:bg-orange-700'
    },
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700'
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-600',
      button: 'bg-purple-600 hover:bg-purple-700'
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-bold text-gray-900">手動控制</h1>
        <div className="flex items-center space-x-3 flex-wrap gap-2">
          <button
            onClick={handleAllOn}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            全部開啟
          </button>
          <button
            onClick={handleAllOff}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            全部關閉
          </button>
        </div>
      </div>

      {/* 飼養缸選擇器 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">選擇飼養缸</h2>
        <div className="relative">
          <select
            value={selectedTankId || ''}
            onChange={(e) => setSelectedTankId(Number(e.target.value))}
            className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-lg font-medium"
          >
            {tanks.map(tank => (
              <option key={tank.id} value={tank.id}>
                {tank.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* 飼養缸資訊 */}
      {selectedTank && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">飼養缸資訊</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600">飼養缸名稱</div>
              <div className="text-lg font-semibold text-gray-900">{selectedTank.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">目標溫度範圍</div>
              <div className="text-lg font-semibold text-blue-600">
                {selectedTank.target_temp_min}°C - {selectedTank.target_temp_max}°C
              </div>
            </div>
            {selectedTank.target_humidity_min && (
              <div>
                <div className="text-sm text-gray-600">目標濕度範圍</div>
                <div className="text-lg font-semibold text-green-600">
                  {selectedTank.target_humidity_min}% - {selectedTank.target_humidity_max}%
                </div>
              </div>
            )}
            <div>
              <div className="text-sm text-gray-600">設備數量</div>
              <div className="text-lg font-semibold text-purple-600">{tankChannels.length} 個</div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          手動操作後，設備狀態會維持到下一次排程事件執行時再由排程接管。
        </p>
      </div>

      {/* 設備控制卡片 */}
      {tankChannels.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600 mb-4">此飼養缸尚未關聯任何設備</p>
          <a
            href="/dev-tools"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
          >
            前往開發者工具設定
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tankChannels.map((channel) => {
            const Icon = getDeviceIcon(channel.device_type);
            const colors = getDeviceColor(channel.device_type);
            const isOn = channel.current_state;
            const relaySchedules = getRelaySchedules(channel.id);
            const hasSchedule = relaySchedules.length > 0;

            return (
              <div key={channel.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className={`p-6 ${isOn ? colors.bg : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <Icon className={`w-12 h-12 ${isOn ? colors.text : 'text-gray-400'}`} />
                    <div className={`w-4 h-4 rounded-full ${isOn ? 'bg-green-500' : 'bg-gray-300'} ${isOn ? 'animate-pulse' : ''}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{channel.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">通道 {channel.channel}</p>
                </div>
                
                <div className="p-6 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      狀態: <span className={isOn ? 'text-green-600' : 'text-gray-600'}>
                        {isOn ? '運行中' : '已關閉'}
                      </span>
                    </span>

                    {hasSchedule ? (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded font-semibold">
                        ⏰ 排程
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                        無排程
                      </span>
                    )}
                  </div>
                  
                  {/* 排程資訊 */}
                  {hasSchedule && (
                    <div className="text-xs text-gray-600 space-y-1">
                      {relaySchedules.map(schedule => (
                        <div key={schedule.id} className="flex items-center">
                          <span>📅 {schedule.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <button
                    onClick={() => handleToggle(channel)}
                    className={`w-full py-3 rounded-lg font-medium text-white transition-colors flex items-center justify-center space-x-2 ${
                      isOn ? 'bg-red-600 hover:bg-red-700' : colors.button
                    }`}
                  >
                    <Power className="w-5 h-5" />
                    <span>{isOn ? '關閉' : '開啟'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ManualControl;
