import React, { useState } from 'react';
import { Power, Lightbulb, Zap, Wind, AlertCircle } from 'lucide-react';

const ManualControl = () => {
  const [devices, setDevices] = useState({
    lighting: { 
      id: 'lighting',
      name: '照明系統', 
      status: 'on',
      icon: Lightbulb,
      color: 'yellow',
      description: '主要照明控制'
    },
    heating: { 
      id: 'heating',
      name: '加熱系統', 
      status: 'on',
      icon: Zap,
      color: 'orange',
      description: '溫度加熱控制'
    },
    cooling: { 
      id: 'cooling',
      name: '散熱系統', 
      status: 'off',
      icon: Wind,
      color: 'blue',
      description: '冷卻散熱控制'
    }
  });

  const [overrideMode, setOverrideMode] = useState(false);
  const [targetTemp, setTargetTemp] = useState(28);

  const handleToggle = (deviceId) => {
    setDevices(prev => ({
      ...prev,
      [deviceId]: {
        ...prev[deviceId],
        status: prev[deviceId].status === 'on' ? 'off' : 'on'
      }
    }));
  };

  const handleAllOn = () => {
    const updatedDevices = {};
    Object.keys(devices).forEach(key => {
      updatedDevices[key] = { ...devices[key], status: 'on' };
    });
    setDevices(updatedDevices);
  };

  const handleAllOff = () => {
    const updatedDevices = {};
    Object.keys(devices).forEach(key => {
      updatedDevices[key] = { ...devices[key], status: 'off' };
    });
    setDevices(updatedDevices);
  };

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
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">手動控制</h1>
        <div className="flex items-center space-x-3">
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

      {/* 覆写模式警告 */}
      {overrideMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-amber-800">覆寫模式已啟用</h3>
              <p className="text-sm text-amber-700 mt-1">
                手動控制將覆蓋自動排程。關閉覆寫模式以恢復自動控制。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 覆写模式开关 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">覆寫自動排程</h2>
            <p className="text-sm text-gray-600 mt-1">
              啟用後，手動控制將優先於自動排程
            </p>
          </div>
          <button
            onClick={() => setOverrideMode(!overrideMode)}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              overrideMode ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                overrideMode ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 目标温度设置 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">目標溫度設定</h2>
        <div className="flex items-center space-x-4">
          <input
            type="range"
            min="20"
            max="35"
            value={targetTemp}
            onChange={(e) => setTargetTemp(Number(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex items-center space-x-2">
            <span className="text-3xl font-bold text-gray-900">{targetTemp}</span>
            <span className="text-xl text-gray-600">°C</span>
          </div>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>20°C</span>
          <span>35°C</span>
        </div>
      </div>

      {/* 设备控制卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(devices).map((device) => {
          const Icon = device.icon;
          const colors = colorClasses[device.color];
          const isOn = device.status === 'on';

          return (
            <div key={device.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className={`p-6 ${isOn ? colors.bg : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-4">
                  <Icon className={`w-12 h-12 ${isOn ? colors.text : 'text-gray-400'}`} />
                  <div className={`w-4 h-4 rounded-full ${isOn ? 'bg-green-500' : 'bg-gray-300'} animate-pulse`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{device.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{device.description}</p>
              </div>
              
              <div className="p-6 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-700">
                    狀態: <span className={isOn ? 'text-green-600' : 'text-gray-600'}>
                      {isOn ? '運行中' : '已關閉'}
                    </span>
                  </span>
                </div>
                
                <button
                  onClick={() => handleToggle(device.id)}
                  disabled={!overrideMode}
                  className={`w-full py-3 rounded-lg font-medium text-white transition-colors flex items-center justify-center space-x-2 ${
                    overrideMode 
                      ? (isOn ? 'bg-red-600 hover:bg-red-700' : `${colors.button}`)
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  <Power className="w-5 h-5" />
                  <span>{isOn ? '關閉' : '開啟'}</span>
                </button>
                
                {!overrideMode && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    請啟用覆寫模式以進行手動控制
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 操作历史 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">最近操作記錄</h2>
        <div className="space-y-3">
          {[
            { time: '14:32', action: '照明系統已開啟', user: '手動控制' },
            { time: '13:15', action: '加熱系統已關閉', user: '自動排程' },
            { time: '12:00', action: '目標溫度設定為 28°C', user: '手動控制' },
            { time: '08:00', action: '照明系統已開啟', user: '自動排程' }
          ].map((log, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-500">{log.time}</span>
                <span className="text-sm text-gray-900">{log.action}</span>
              </div>
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                {log.user}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManualControl;
