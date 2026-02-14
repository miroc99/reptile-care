import React, { useState } from 'react';
import { Bell, Mail, MessageSquare, Save, AlertTriangle, CheckCircle } from 'lucide-react';

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

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'warning',
      message: '溫度接近上限 (31.5°C)',
      time: '2026-02-12 14:30',
      resolved: false
    },
    {
      id: 2,
      type: 'error',
      message: '加熱系統連線中斷',
      time: '2026-02-12 12:15',
      resolved: true
    },
    {
      id: 3,
      type: 'info',
      message: '排程已更新',
      time: '2026-02-12 10:00',
      resolved: true
    }
  ]);

  const handleSave = () => {
    alert('設定已儲存！');
  };

  const handleTest = (type) => {
    alert(`正在發送測試通知到 ${type}...`);
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200';
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
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Bell className="w-5 h-5 mr-2 text-purple-600" />
          告警歷史
        </h2>
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
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                alert.resolved 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {alert.resolved ? '已解決' : '進行中'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Alerts;
