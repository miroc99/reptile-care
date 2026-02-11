import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Clock, Calendar as CalendarIcon, Save, X } from 'lucide-react';

const Schedule = () => {
  // 模拟缸数据
  const [tanks] = useState([
    { id: 1, name: '綠鬣蜥主缸' },
    { id: 2, name: '球蟒繁殖缸' },
    { id: 3, name: '豹紋守宮幼體缸' }
  ]);

  const [schedules, setSchedules] = useState([
    {
      id: 1,
      name: '白天照明',
      tankId: 1,
      tankName: '綠鬣蜥主缸',
      device: 'lighting',
      startTime: '08:00',
      endTime: '20:00',
      days: [1, 2, 3, 4, 5, 6, 0],
      enabled: true
    },
    {
      id: 2,
      name: '夜間加熱',
      tankId: 1,
      tankName: '綠鬣蜥主缸',
      device: 'heating',
      startTime: '22:00',
      endTime: '06:00',
      days: [1, 2, 3, 4, 5, 6, 0],
      enabled: true
    },
    {
      id: 3,
      name: '球蟒加熱',
      tankId: 2,
      tankName: '球蟒繁殖缸',
      device: 'heating',
      startTime: '00:00',
      endTime: '23:59',
      days: [1, 2, 3, 4, 5, 6, 0],
      enabled: true
    }
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  const deviceOptions = [
    { value: 'lighting', label: '照明' },
    { value: 'heating', label: '加熱' },
    { value: 'cooling', label: '散熱' }
  ];

  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];

  const handleAdd = () => {
    setEditingSchedule({
      id: Date.now(),
      name: '',
      tankId: tanks[0]?.id || 1,
      tankName: tanks[0]?.name || '',
      device: 'lighting',
      startTime: '08:00',
      endTime: '20:00',
      days: [1, 2, 3, 4, 5, 6, 0],
      enabled: true
    });
    setIsEditing(true);
  };

  const handleEdit = (schedule) => {
    setEditingSchedule({ ...schedule });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (schedules.find(s => s.id === editingSchedule.id)) {
      setSchedules(schedules.map(s => s.id === editingSchedule.id ? editingSchedule : s));
    } else {
      setSchedules([...schedules, editingSchedule]);
    }
    setIsEditing(false);
    setEditingSchedule(null);
  };

  const handleDelete = (id) => {
    if (confirm('確定要刪除此排程嗎？')) {
      setSchedules(schedules.filter(s => s.id !== id));
    }
  };

  const handleToggle = (id) => {
    setSchedules(schedules.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const toggleDay = (day) => {
    const days = editingSchedule.days.includes(day)
      ? editingSchedule.days.filter(d => d !== day)
      : [...editingSchedule.days, day];
    setEditingSchedule({ ...editingSchedule, days });
  };

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
            {schedules.find(s => s.id === editingSchedule.id) ? '編輯排程' : '新增排程'}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                飼養缸 *
              </label>
              <select
                value={editingSchedule.tankId}
                onChange={(e) => {
                  const tankId = Number(e.target.value);
                  const tank = tanks.find(t => t.id === tankId);
                  setEditingSchedule({ 
                    ...editingSchedule, 
                    tankId: tankId,
                    tankName: tank?.name || ''
                  });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {tanks.map(tank => (
                  <option key={tank.id} value={tank.id}>
                    {tank.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                排程名稱
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
                控制設備
              </label>
              <select
                value={editingSchedule.device}
                onChange={(e) => setEditingSchedule({ ...editingSchedule, device: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {deviceOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  開始時間
                </label>
                <input
                  type="time"
                  value={editingSchedule.startTime}
                  onChange={(e) => setEditingSchedule({ ...editingSchedule, startTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  結束時間
                </label>
                <input
                  type="time"
                  value={editingSchedule.endTime}
                  onChange={(e) => setEditingSchedule({ ...editingSchedule, endTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                重複日期
              </label>
              <div className="flex space-x-2">
                {[0, 1, 2, 3, 4, 5, 6].map(day => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`w-10 h-10 rounded-full font-medium transition-colors ${
                      editingSchedule.days.includes(day)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {dayNames[day]}
                  </button>
                ))}
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
              {schedules.map(schedule => (
                <tr key={schedule.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{schedule.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{schedule.tankName}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {deviceOptions.find(d => d.value === schedule.device)?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Clock className="w-4 h-4 mr-1 text-gray-400" />
                      {schedule.startTime} - {schedule.endTime}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {schedule.days.length === 7 ? '每日' : schedule.days.sort().map(d => dayNames[d]).join(', ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggle(schedule.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        schedule.enabled ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          schedule.enabled ? 'translate-x-6' : 'translate-x-1'
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
                      onClick={() => handleDelete(schedule.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
