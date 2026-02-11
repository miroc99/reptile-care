import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Thermometer, Lightbulb, Zap, Activity, ChevronRight, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // 模拟多个饲养缸数据
  const [tanks, setTanks] = useState([
    {
      id: 1,
      name: '綠鬣蜥主缸',
      species: '綠鬣蜥',
      image: null,
      currentTemp: 28.5,
      targetTempMin: 26,
      targetTempMax: 30,
      humidity: 65,
      devices: {
        lighting: { status: 'on', name: '照明' },
        heating: { status: 'on', name: '加熱墊' },
        uvb: { status: 'on', name: 'UVB燈' },
        cooling: { status: 'off', name: '散熱' }
      }
    },
    {
      id: 2,
      name: '球蟒繁殖缸',
      species: '球蟒',
      image: null,
      currentTemp: 30.2,
      targetTempMin: 28,
      targetTempMax: 32,
      humidity: 70,
      devices: {
        lighting: { status: 'on', name: '照明' },
        heating: { status: 'on', name: '陶瓷加熱器' },
        uvb: { status: 'off', name: 'UVB燈' },
        cooling: { status: 'off', name: '散熱' }
      }
    },
    {
      id: 3,
      name: '豹紋守宮幼體缸',
      species: '豹紋守宮',
      image: null,
      currentTemp: 27.8,
      targetTempMin: 26,
      targetTempMax: 29,
      humidity: 50,
      devices: {
        lighting: { status: 'off', name: '照明' },
        heating: { status: 'on', name: '加熱墊' },
        uvb: { status: 'off', name: 'UVB燈' },
        cooling: { status: 'off', name: '散熱' }
      }
    }
  ]);

  // 模拟温度历史数据
  const [tempHistory, setTempHistory] = useState([
    { time: '00:00', temp: 26.5 },
    { time: '04:00', temp: 25.8 },
    { time: '08:00', temp: 27.2 },
    { time: '12:00', temp: 29.1 },
    { time: '16:00', temp: 28.5 },
    { time: '20:00', temp: 27.8 },
  ]);

  // 模拟实时更新温度
  useEffect(() => {
    const interval = setInterval(() => {
      setTanks(prevTanks => 
        prevTanks.map(tank => ({
          ...tank,
          currentTemp: Math.max(20, Math.min(35, tank.currentTemp + (Math.random() - 0.5) * 0.3))
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // 计算温度状态
  const getTempStatus = (temp, min, max) => {
    if (temp < min) return 'low';
    if (temp > max) return 'high';
    return 'normal';
  };

  // 获取运行中的设备数量
  const getActiveDevicesCount = (devices) => {
    return Object.values(devices).filter(d => d.status === 'on').length;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">儀表板總覽</h1>
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-green-500 animate-pulse" />
          <span className="text-sm text-gray-600">系統運行中</span>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">飼養缸總數</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{tanks.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">溫度正常</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {tanks.filter(t => getTempStatus(t.currentTemp, t.targetTempMin, t.targetTempMax) === 'normal').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Thermometer className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">異常警報</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {tanks.filter(t => getTempStatus(t.currentTemp, t.targetTempMin, t.targetTempMax) !== 'normal').length}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">運行設備</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {tanks.reduce((sum, tank) => sum + getActiveDevicesCount(tank.devices), 0)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Zap className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 各饲养缸状态卡片 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {tanks.map(tank => {
          const tempStatus = getTempStatus(tank.currentTemp, tank.targetTempMin, tank.targetTempMax);
          const activeDevices = getActiveDevicesCount(tank.devices);
          
          return (
            <div key={tank.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
              {/* 头部图片区域 */}
              <div className="h-32 bg-gradient-to-br from-green-400 to-blue-500 relative">
                {tank.image ? (
                  <img src={tank.image} alt={tank.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                    {tank.name.charAt(0)}
                  </div>
                )}
                {tempStatus !== 'normal' && (
                  <div className="absolute top-2 right-2 p-2 bg-red-500 rounded-full">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>

              {/* 信息区域 */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{tank.name}</h3>
                    {tank.species && (
                      <p className="text-sm text-gray-600">{tank.species}</p>
                    )}
                  </div>
                  <button
                    onClick={() => navigate(`/tank/${tank.id}`)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* 温度显示 */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">當前溫度</span>
                    <span className={`text-2xl font-bold ${
                      tempStatus === 'high' ? 'text-red-600' :
                      tempStatus === 'low' ? 'text-blue-600' :
                      'text-green-600'
                    }`}>
                      {tank.currentTemp.toFixed(1)}°C
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        tempStatus === 'high' ? 'bg-red-500' :
                        tempStatus === 'low' ? 'bg-blue-500' :
                        'bg-green-500'
                      }`}
                      style={{ 
                        width: `${Math.min(100, Math.max(0, ((tank.currentTemp - 20) / 15) * 100))}%` 
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{tank.targetTempMin}°C</span>
                    <span>{tank.targetTempMax}°C</span>
                  </div>
                </div>

                {/* 设备状态 */}
                <div className="flex items-center justify-between text-sm pt-3 border-t">
                  <div className="flex items-center space-x-2">
                    <Zap className={`w-4 h-4 ${activeDevices > 0 ? 'text-green-500' : 'text-gray-400'}`} />
                    <span className="text-gray-600">
                      {activeDevices} 個設備運行中
                    </span>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                    濕度 {tank.humidity}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
