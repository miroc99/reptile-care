import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Thermometer, Lightbulb, Zap, Activity, ChevronRight, AlertTriangle } from 'lucide-react';

// 動態獲取 API base URL
const API_BASE = window.location.origin;

const Dashboard = () => {
  const navigate = useNavigate();
  
  const [tanks, setTanks] = useState([]);
  const [relayChannels, setRelayChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  // 載入飼養缸資料
  const loadTanks = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/tanks`);
      const tanksData = await response.json();
      
      // 為每個飼養缸載入最新溫度資料
      const tanksWithTemp = await Promise.all(
        tanksData.map(async (tank) => {
          try {
            const tempResponse = await fetch(`${API_BASE}/api/temperature/latest/${tank.id}`);
            const tempData = await tempResponse.json();
            return {
              ...tank,
              currentTemp: tempData?.temperature || null,
              humidity: tempData?.humidity || null,
              lastUpdate: tempData?.timestamp || null
            };
          } catch (error) {
            return {
              ...tank,
              currentTemp: null,
              humidity: null,
              lastUpdate: null
            };
          }
        })
      );
      
      setTanks(tanksWithTemp);
    } catch (error) {
      console.error('載入飼養缸資料失敗:', error);
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

  // 初始載入
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([loadTanks(), loadRelayChannels()]);
      setLoading(false);
    };
    loadAll();

    // 每 5 秒更新一次溫度資料
    const interval = setInterval(loadTanks, 5000);
    return () => clearInterval(interval);
  }, []);

  // 計算溫度狀態
  const getTempStatus = (temp, min, max) => {
    if (!temp) return 'unknown';
    if (temp < min) return 'low';
    if (temp > max) return 'high';
    return 'normal';
  };

  // 獲取該飼養缸的運行中設備數量
  const getActiveDevicesCount = (tankId) => {
    return relayChannels.filter(
      channel => channel.tank_id === tankId && channel.current_state && channel.enabled
    ).length;
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
                {relayChannels.filter(ch => ch.current_state && ch.enabled).length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Zap className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 各飼養缸狀態卡片 */}
      {tanks.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">尚未建立任何飼養缸</p>
          <button
            onClick={() => navigate('/tanks')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            立即建立
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {tanks.map(tank => {
            const tempStatus = getTempStatus(tank.currentTemp, tank.target_temp_min, tank.target_temp_max);
            const activeDevices = getActiveDevicesCount(tank.id);
          
          return (
            <div key={tank.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
              {/* 頭部圖片區域 */}
              <div className="h-32 bg-gradient-to-br from-green-400 to-blue-500 relative overflow-hidden">
                {tank.image_url ? (
                  <img src={tank.image_url} alt={tank.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                    {tank.name.charAt(0)}
                  </div>
                )}
                {tempStatus !== 'normal' && tempStatus !== 'unknown' && (
                  <div className="absolute top-2 right-2 p-2 bg-red-500 rounded-full">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>

              {/* 資訊區域 */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{tank.name}</h3>
                    {tank.description && (
                      <p className="text-sm text-gray-600">{tank.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => navigate(`/tank/${tank.id}`)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* 溫度顯示 */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">當前溫度</span>
                    {tank.currentTemp ? (
                      <span className={`text-2xl font-bold ${
                        tempStatus === 'high' ? 'text-red-600' :
                        tempStatus === 'low' ? 'text-blue-600' :
                        'text-green-600'
                      }`}>
                        {tank.currentTemp.toFixed(1)}°C
                      </span>
                    ) : (
                      <span className="text-2xl font-bold text-gray-400">--°C</span>
                    )}
                  </div>
                  {tank.currentTemp && (
                    <>
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
                        <span>{tank.target_temp_min}°C</span>
                        <span>{tank.target_temp_max}°C</span>
                      </div>
                    </>
                  )}
                </div>

                {/* 設備狀態 */}
                <div className="flex items-center justify-between text-sm pt-3 border-t">
                  <div className="flex items-center space-x-2">
                    <Zap className={`w-4 h-4 ${activeDevices > 0 ? 'text-green-500' : 'text-gray-400'}`} />
                    <span className="text-gray-600">
                      {activeDevices} 個設備運行中
                    </span>
                  </div>
                  {tank.humidity && (
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                      濕度 {tank.humidity.toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
