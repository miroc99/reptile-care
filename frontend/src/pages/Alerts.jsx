import React, { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Save, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

// 動態獲取 API base URL
const API_BASE = window.location.origin;

const Alerts = () => {
  const [settings, setSettings] = useState({
    tempHigh: 32,
    tempLow: 24,
    emailEnabled: true,
    email: 'user@example.com',
    lineEnabled: false,
    lineToken: '',
    telegramEnabled: false,
    telegramToken: '',
    telegramChatId: ''
  });

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 載入告警資料
  const loadAlerts = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`${API_BASE}/api/events/alerts?limit=50`);
      const data = await response.json();
      setAlerts(data);
    } catch (error) {
      console.error('載入告警資料失敗:', error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
    // 每 30 秒自動刷新一次
    const interval = setInterval(loadAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSave = () => {
    alert('設定已儲存！');
  };

  const handleTest = (type) => {
    alert(`正在發送測試通知到 ${type}...`);
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'error':
        return 'bg-orange-50 border-orange-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">告警設定</h1>
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save className="w-5 h-5" />
          <span>儲存設定</span>
        </button>
      </div>

      {/* 溫度閾值設定 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
          溫度告警閾值
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              高溫警報 (°C)
            </label>
            <input
              type="number"
              value={settings.tempHigh}
              onChange={(e) => setSettings({ ...settings, tempHigh: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="20"
              max="40"
            />
            <p className="text-sm text-gray-500 mt-1">
              當溫度超過此值時發送告警
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              低溫警報 (°C)
            </label>
            <input
              type="number"
              value={settings.tempLow}
              onChange={(e) => setSettings({ ...settings, tempLow: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="15"
              max="30"
            />
            <p className="text-sm text-gray-500 mt-1">
              當溫度低於此值時發送告警
            </p>
          </div>
        </div>
      </div>

      {/* Email通知 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Mail className="w-5 h-5 mr-2 text-blue-600" />
            Email 通知
          </h2>
          <button
            onClick={() => setSettings({ ...settings, emailEnabled: !settings.emailEnabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.emailEnabled ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.emailEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        {settings.emailEnabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email 地址
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>
            <button
              onClick={() => handleTest('Email')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              發送測試郵件
            </button>
          </div>
        )}
      </div>

      {/* Line通知 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-green-600" />
            Line Notify
          </h2>
          <button
            onClick={() => setSettings({ ...settings, lineEnabled: !settings.lineEnabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.lineEnabled ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.lineEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        {settings.lineEnabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Line Token
              </label>
              <input
                type="password"
                value={settings.lineToken}
                onChange={(e) => setSettings({ ...settings, lineToken: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="請輸入 Line Notify Token"
              />
              <p className="text-sm text-gray-500 mt-1">
                從 <a href="https://notify-bot.line.me/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Line Notify</a> 取得 Token
              </p>
            </div>
            <button
              onClick={() => handleTest('Line')}
              disabled={!settings.lineToken}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              發送測試訊息
            </button>
          </div>
        )}
      </div>

      {/* Telegram通知 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-blue-500" />
            Telegram Bot
          </h2>
          <button
            onClick={() => setSettings({ ...settings, telegramEnabled: !settings.telegramEnabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.telegramEnabled ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.telegramEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        {settings.telegramEnabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bot Token
              </label>
              <input
                type="password"
                value={settings.telegramToken}
                onChange={(e) => setSettings({ ...settings, telegramToken: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="請輸入 Bot Token"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chat ID
              </label>
              <input
                type="text"
                value={settings.telegramChatId}
                onChange={(e) => setSettings({ ...settings, telegramChatId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="請輸入 Chat ID"
              />
              <p className="text-sm text-gray-500 mt-1">
                透過 <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">@userinfobot</a> 取得您的 Chat ID
              </p>
            </div>
            <button
              onClick={() => handleTest('Telegram')}
              disabled={!settings.telegramToken || !settings.telegramChatId}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              發送測試訊息
            </button>
          </div>
        )}
      </div>

      {/* 告警历史 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Bell className="w-5 h-5 mr-2 text-purple-600" />
            告警歷史
            {alerts.length > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                {alerts.length} 條記錄
              </span>
            )}
          </h2>
          <button
            onClick={loadAlerts}
            disabled={refreshing}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>刷新</span>
          </button>
        </div>
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-2">載入中...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-gray-600">目前沒有告警記錄</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start justify-between p-4 border rounded-lg ${getAlertColor(alert.type)} ${
                  alert.resolved ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  {getAlertIcon(alert.type)}
                  <div>
                    <p className="font-medium text-gray-900">{alert.message}</p>
                    <p className="text-sm text-gray-600 mt-1">{alert.time}</p>
                    {alert.details && (
                      <p className="text-xs text-gray-500 mt-1">{alert.details}</p>
                    )}
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                  alert.resolved 
                    ? 'bg-green-100 text-green-800' 
                    : alert.type === 'critical'
                    ? 'bg-red-100 text-red-800'
                    : alert.type === 'error'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {alert.resolved ? '已解決' : '進行中'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
