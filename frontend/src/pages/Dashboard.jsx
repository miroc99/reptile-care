import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Thermometer, Lightbulb, Zap, Activity } from 'lucide-react';

const Dashboard = () => {
  const [currentTemp, setCurrentTemp] = useState(28.5);
  const [targetTemp, setTargetTemp] = useState({ min: 26, max: 30 });
  const [devices, setDevices] = useState({
    lighting: { status: 'on', name: '照明' },
    heating: { status: 'on', name: '加熱' },
    cooling: { status: 'off', name: '散熱' }
  });

  // 模拟温度历史数据
  const [tempHistory, setTempHistory] = useState([
    { time: '00:00', temp: 26.5 },
    { time: '04:00', temp: 25.8 },
    { time: '08:00', temp: 27.2 },
    { time: '12:00', temp: 29.1 },
    { time: '16:00', temp: 28.5 },
    { time: '20:00', temp: 27.8 },
  ]);

  // 模拟实时更新
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTemp(prev => {
        const change = (Math.random() - 0.5) * 0.5;
        return Math.max(20, Math.min(35, prev + change));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">儀表板</h1>
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-green-500 animate-pulse" />
          <span className="text-sm text-gray-600">系統運行中</span>
        </div>
      </div>

      {/* 温度卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">當前溫度</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {currentTemp.toFixed(1)}°C
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Thermometer className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            目標範圍: {targetTemp.min}°C - {targetTemp.max}°C
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">最高溫度</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {Math.max(...tempHistory.map(d => d.temp)).toFixed(1)}°C
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <Thermometer className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            過去24小時
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">最低溫度</p>
              <p className="text-3xl font-bold text-cyan-600 mt-2">
                {Math.min(...tempHistory.map(d => d.temp)).toFixed(1)}°C
              </p>
            </div>
            <div className="p-3 bg-cyan-100 rounded-full">
              <Thermometer className="w-8 h-8 text-cyan-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            過去24小時
          </div>
        </div>
      </div>

      {/* 温度图表 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">溫度趨勢</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={tempHistory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis domain={[20, 35]} />
            <Tooltip />
            <Legend />
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

      {/* 设备状态 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">設備狀態</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Lightbulb className={`w-6 h-6 ${devices.lighting.status === 'on' ? 'text-yellow-500' : 'text-gray-400'}`} />
              <div>
                <p className="font-medium text-gray-900">{devices.lighting.name}</p>
                <p className="text-sm text-gray-500">
                  {devices.lighting.status === 'on' ? '運行中' : '已關閉'}
                </p>
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${devices.lighting.status === 'on' ? 'bg-green-500' : 'bg-gray-300'}`} />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Zap className={`w-6 h-6 ${devices.heating.status === 'on' ? 'text-orange-500' : 'text-gray-400'}`} />
              <div>
                <p className="font-medium text-gray-900">{devices.heating.name}</p>
                <p className="text-sm text-gray-500">
                  {devices.heating.status === 'on' ? '運行中' : '已關閉'}
                </p>
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${devices.heating.status === 'on' ? 'bg-green-500' : 'bg-gray-300'}`} />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Activity className={`w-6 h-6 ${devices.cooling.status === 'on' ? 'text-blue-500' : 'text-gray-400'}`} />
              <div>
                <p className="font-medium text-gray-900">{devices.cooling.name}</p>
                <p className="text-sm text-gray-500">
                  {devices.cooling.status === 'on' ? '運行中' : '已關閉'}
                </p>
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${devices.cooling.status === 'on' ? 'bg-green-500' : 'bg-gray-300'}`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
