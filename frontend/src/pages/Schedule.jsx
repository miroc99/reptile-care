import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Clock, Calendar as CalendarIcon, Save, X, Activity } from 'lucide-react';

// 動態獲取 API base URL
const API_BASE = window.location.origin;

const Schedule = () => {
  const [tanks, setTanks] = useState([]);
  const [relayChannels, setRelayChannels] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  // 載入飼養缸資料
  const loadTanks = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/tanks`);
      const data = await response.json();
      setTanks(data);
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
      console.error('載入繼電器失敗:', error);
    }
  };

  // 載入排程資料
  const loadSchedules = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/schedules`);
      const data = await response.json();
      setSchedules(data);
    } catch (error) {
      console.error('載入排程失敗:', error);
      alert('載入排程失敗，請檢查網路連接');
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
  }, []);

  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];

  // 獲取繼電器的飼養缸名稱
  const getRelayTankName = (relayChannelId) => {
    const relay = relayChannels.find(r => r.id === relayChannelId);
    if (!relay) return '未知';
    const tank = tanks.find(t => t.id === relay.tank_id);
    return tank ? tank.name : '未關聯';
  };

  // 獲取繼電器名稱
  const getRelayName = (relayChannelId) => {
    const relay = relayChannels.find(r => r.id === relayChannelId);
    return relay ? relay.name : '未知設備';
  };

  const handleAdd = () => {
    if (relayChannels.length === 0) {
      alert('尚未設定任何繼電器通道，請先到開發者工具設定');
      return;
    }
    setEditingSchedule({
      name: '',
      description: '',
      relay_channel_id: relayChannels[0]?.id || 1,
      schedule_type: 'daily',
      start_time: '08:00',
      end_time: '20:00',
      days_of_week: '0,1,2,3,4,5,6',
      active: true,
      priority: 0
    });
    setIsEditing(true);
  };

  const handleEdit = (schedule) => {
    setEditingSchedule({
      id: schedule.id,
      name: schedule.name,
      description: schedule.description || '',
      relay_channel_id: schedule.relay_channel_id,
      schedule_type: schedule.schedule_type,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      days_of_week: schedule.days_of_week || '0,1,2,3,4,5,6',
      active: schedule.active,
      priority: schedule.priority
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editingSchedule.name) {
      alert('請輸入排程名稱');
      return;
    }

    try {
      const url = editingSchedule.id
        ? `${API_BASE}/api/schedules/${editingSchedule.id}`
        : `${API_BASE}/api/schedules`;
      
      const method = editingSchedule.id ? 'PATCH' : 'POST';
      
      // 準備要發送的資料
      const scheduleData = {
        name: editingSchedule.name,
        description: editingSchedule.description || null,
        relay_channel_id: editingSchedule.relay_channel_id,
        schedule_type: editingSchedule.schedule_type,
        start_time: editingSchedule.start_time,
        end_time: editingSchedule.end_time,
        days_of_week: editingSchedule.days_of_week,
        active: editingSchedule.active,
        priority: editingSchedule.priority || 0
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData)
      });

      if (response.ok) {
        await loadSchedules();
        setIsEditing(false);
        setEditingSchedule(null);
      } else {
        const error = await response.json();
        alert(`儲存失敗: ${error.detail || '未知錯誤'}`);
      }
    } catch (error) {
      console.error('儲存排程失敗:', error);
      alert('儲存失敗，請檢查網路連接');
    }
  };

  const handleDelete = async (schedule) => {
    if (!confirm(`確定要刪除排程「${schedule.name}」嗎？`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/schedules/${schedule.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadSchedules();
      } else {
        alert('刪除失敗');
      }
    } catch (error) {
      console.error('刪除排程失敗:', error);
      alert('刪除失敗，請檢查網路連接');
    }
  };

  const handleToggle = async (schedule) => {
    try {
      const endpoint = schedule.active ? 'disable' : 'enable';
      const response = await fetch(`${API_BASE}/api/schedules/${schedule.id}/${endpoint}`, {
        method: 'POST'
      });

      if (response.ok) {
        await loadSchedules();
      } else {
        alert('切換狀態失敗');
      }
    } catch (error) {
      console.error('切換排程狀態失敗:', error);
      alert('切換狀態失敗，請檢查網路連接');
    }
  };

  const toggleDay = (day) => {
    const daysArray = editingSchedule.days_of_week 
      ? editingSchedule.days_of_week.split(',').map(d => parseInt(d))
      : [];
    
    const newDays = daysArray.includes(day)
      ? daysArray.filter(d => d !== day)
      : [...daysArray, day];
    
    setEditingSchedule({ 
      ...editingSchedule, 
      days_of_week: newDays.sort((a, b) => a - b).join(',')
    });
  };

  // 獲取選中的日期
  const getSelectedDays = () => {
    if (!editingSchedule || !editingSchedule.days_of_week) return [];
    return editingSchedule.days_of_week.split(',').map(d => parseInt(d));
  };

  // 載入中狀態
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
        <h1 className="text-3xl font-bold text-gray-900">排程管理</h1>
        <button
          onClick={handleAdd}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>新增排程</span>
        </button>
      </div>

      {/* 编辑表单 */}
      {isEditing && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingSchedule.id ? '編輯排程' : '新增排程'}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                排程名稱 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editingSchedule.name}
                onChange={(e) => setEditingSchedule({ ...editingSchedule, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="例如：白天照明"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                描述
              </label>
              <input
                type="text"
                value={editingSchedule.description}
                onChange={(e) => setEditingSchedule({ ...editingSchedule, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="選填：排程說明"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                控制設備 <span className="text-red-500">*</span>
              </label>
              <select
                value={editingSchedule.relay_channel_id}
                onChange={(e) => setEditingSchedule({ ...editingSchedule, relay_channel_id: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {relayChannels.map(relay => {
                  const tank = tanks.find(t => t.id === relay.tank_id);
                  return (
                    <option key={relay.id} value={relay.id}>
                      {relay.name} (CH{relay.channel}) - {tank ? tank.name : '未關聯飼養缸'}
                    </option>
                  );
                })}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                選擇要控制的繼電器通道
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  開始時間
                </label>
                <input
                  type="time"
                  value={editingSchedule.start_time}
                  onChange={(e) => setEditingSchedule({ ...editingSchedule, start_time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  結束時間
                </label>
                <input
                  type="time"
                  value={editingSchedule.end_time}
                  onChange={(e) => setEditingSchedule({ ...editingSchedule, end_time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                重複日期
              </label>
              <div className="flex space-x-2">
                {[0, 1, 2, 3, 4, 5, 6].map(day => {
                  const selectedDays = getSelectedDays();
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`w-10 h-10 rounded-full font-medium transition-colors ${
                        selectedDays.includes(day)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {dayNames[day]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditingSchedule(null);
                }}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>取消</span>
              </button>
              <button
                onClick={handleSave}
                disabled={!editingSchedule.name}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>儲存</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 排程列表 */}
      {schedules.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">尚無排程，請點擊上方「新增排程」按鈕開始設定</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    排程名稱
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    飼養缸
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    設備
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    時間
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    重複
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    狀態
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schedules.map(schedule => {
                  const daysArray = schedule.days_of_week 
                    ? schedule.days_of_week.split(',').map(d => parseInt(d)).sort((a, b) => a - b)
                    : [];
                  const daysDisplay = daysArray.length === 7 
                    ? '每日' 
                    : daysArray.map(d => dayNames[d]).join(', ');

                  return (
                    <tr key={schedule.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{schedule.name}</div>
                        {schedule.description && (
                          <div className="text-xs text-gray-500">{schedule.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{getRelayTankName(schedule.relay_channel_id)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {getRelayName(schedule.relay_channel_id)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Clock className="w-4 h-4 mr-1 text-gray-400" />
                          {schedule.start_time} - {schedule.end_time}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {daysDisplay}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggle(schedule)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            schedule.active ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              schedule.active ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(schedule)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(schedule)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
