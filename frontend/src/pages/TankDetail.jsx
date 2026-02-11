import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Thermometer, Droplets, Power, Settings } from 'lucide-react';

const TankDetail = () => {
  const { tankId } = useParams();
  const navigate = useNavigate();

  // 模拟缸数据
  const [tank, setTank] = useState({
    id: 1,
    name: '綠鬣蜥主缸',
    species: '綠鬣蜥',
    image: null,
    currentTemp: 28.5,
    targetTempMin: 26,
    targetTempMax: 30,
    humidity: 65,
    devices: {
      lighting: { status: 'on', name: '照明', power: 50 },
      heating: { status: 'on', name: '加熱墊', power: 100 },
      uvb: { status: 'on', name: 'UVB燈', power: 25 },
      cooling: { status: 'off', name: '散熱風扇', power: 30 }
    }
  });

  const [tempHistory, setTempHistory] = useState([
    { time: '00:00', temp: 26.5, humidity: 60 },
    { time: '04:00', temp: 25.8, humidity: 62 },
    { time: '08:00', temp: 27.2, humidity: 64 },
    { time: '12:00', temp: 29.1, humidity: 63 },
    { time: '16:00', temp: 28.5, humidity: 65 },
    { time: '20:00', temp: 27.8, humidity: 66 },
  ]);

  // 模拟实时更新
  useEffect(() => {
    const interval = setInterval(() => {
      setTank(prev => ({
        ...prev,
        currentTemp: Math.max(20, Math.min(35, prev.currentTemp + (Math.random() - 0.5) * 0.3)),
        humidity: Math.max(40, Math.min(90, prev.humidity + (Math.random() - 0.5) * 2))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleDeviceToggle = (deviceKey) => {
    setTank(prev => ({
      ...prev,
      devices: {
        ...prev.devices,
        [deviceKey]: {
          ...prev.devices[deviceKey],
          status: prev.devices[deviceKey].status === 'on' ? 'off' : 'on'
        }
      }
    }));
  };

  const getTempStatus = () => {
    if (tank.currentTemp < tank.targetTempMin) return { text: '偏低', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (tank.currentTemp > tank.targetTempMax) return { text: '偏高', color: 'text-red-600', bg: 'bg-red-100' };
    return { text: '正常', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const tempStatus = getTempStatus();

  return (
    <div className="space-y-6">
      {/* 返回按钮和标题 */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{tank.name}</h1>
          {tank.species && (
            <p className="text-gray-600 mt-1">{tank.species}</p>
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

      {/* 主要监控卡片 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 温度卡片 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">溫度監控</h3>
            <Thermometer className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {tank.currentTemp.toFixed(1)}°C
            </div>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${tempStatus.bg} ${tempStatus.color}`}>
              {tempStatus.text}
            </span>
            <div className="mt-4 text-sm text-gray-600">
              目標: {tank.targetTempMin}°C - {tank.targetTempMax}°C
            </div>
          </div>
        </div>

        {/* 湿度卡片 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">濕度監控</h3>
            <Droplets className="w-6 h-6 text-cyan-600" />
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {tank.humidity.toFixed(0)}%
            </div>
            <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-cyan-100 text-cyan-600">
              正常範圍
            </span>
            <div className="mt-4 text-sm text-gray-600">
              建議: 50% - 70%
            </div>
          </div>
        </div>

        {/* 能耗卡片 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">能耗統計</h3>
            <Power className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {Object.values(tank.devices)
                .filter(d => d.status === 'on')
                .reduce((sum, d) => sum + d.power, 0)}W
            </div>
            <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-600">
              實時功耗
            </span>
            <div className="mt-4 text-sm text-gray-600">
              本日累計: 2.4 kWh
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(tank.devices).map(([key, device]) => {
            const isOn = device.status === 'on';
            return (
              <div key={key} className={`p-4 border-2 rounded-lg transition-all ${
                isOn ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{device.name}</h4>
                  <div className={`w-3 h-3 rounded-full ${isOn ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  功率: {device.power}W
                </div>
                <button
                  onClick={() => handleDeviceToggle(key)}
                  className={`w-full py-2 rounded-lg font-medium transition-colors ${
                    isOn 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isOn ? '關閉' : '開啟'}
                </button>
              </div>
            );
          })}
        </div>
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
