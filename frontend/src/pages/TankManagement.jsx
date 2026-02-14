import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Upload, X, Save } from 'lucide-react';

// 動態獲取 API base URL
const API_BASE = window.location.origin;

const TankManagement = () => {
  const [tanks, setTanks] = useState([]);
  const [relayChannels, setRelayChannels] = useState([]);
  const [tankRelays, setTankRelays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTank, setEditingTank] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: null,
    target_temp_min: 26,
    target_temp_max: 30,
    target_humidity_min: null,
    target_humidity_max: null,
    active: true
  });
  const [imagePreview, setImagePreview] = useState(null);

  // 載入所有飼養缸
  const loadTanks = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/tanks`);
      const data = await response.json();
      setTanks(data);
    } catch (error) {
      console.error('載入飼養缸失敗:', error);
      alert('載入飼養缸失敗，請檢查網路連接');
    } finally {
      setLoading(false);
    }
  };

  // 載入所有繼電器通道
  const loadRelayChannels = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/relays`);
      const data = await response.json();
      setRelayChannels(data);
    } catch (error) {
      console.error('載入繼電器資料失敗:', error);
    }
  };

  useEffect(() => {
    loadTanks();
    loadRelayChannels();
  }, []);

  const handleAdd = () => {
    setEditingTank(null);
    setTankRelays([]);
    setFormData({
      name: '',
      description: '',
      image_url: null,
      target_temp_min: 26,
      target_temp_max: 30,
      target_humidity_min: null,
      target_humidity_max: null,
      active: true
    });
    setImagePreview(null);
    setIsEditing(true);
  };

  const handleEdit = (tank) => {
    setEditingTank(tank);
    setFormData({
      name: tank.name,
      description: tank.description || '',
      image_url: tank.image_url,
      target_temp_min: tank.target_temp_min,
      target_temp_max: tank.target_temp_max,
      target_humidity_min: tank.target_humidity_min,
      target_humidity_max: tank.target_humidity_max,
      active: tank.active
    });
    setImagePreview(tank.image_url);
    // 篩選出屬於此飼養缸的繼電器
    const relaysForTank = relayChannels.filter(relay => relay.tank_id === tank.id);
    setTankRelays(relaysForTank);
    setIsEditing(true);
  };

  // 處理圖片上傳
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 檢查檔案大小 (限制 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('圖片大小不能超過 5MB');
        return;
      }

      // 檢查檔案類型
      if (!file.type.startsWith('image/')) {
        alert('請上傳圖片檔案');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData({ ...formData, image_url: base64String });
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  // 移除圖片
  const handleRemoveImage = () => {
    setFormData({ ...formData, image_url: null });
    setImagePreview(null);
  };

  const handleSave = async () => {
    if (!formData.name) {
      alert('請輸入飼養缸名稱');
      return;
    }

    try {
      const url = editingTank 
        ? `${API_BASE}/api/tanks/${editingTank.id}`
        : `${API_BASE}/api/tanks`;
      
      const method = editingTank ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadTanks();
        await loadRelayChannels();
        setIsEditing(false);
        setEditingTank(null);
        setTankRelays([]);
      } else {
        const error = await response.json();
        alert(`儲存失敗: ${error.detail || '未知錯誤'}`);
      }
    } catch (error) {
      console.error('儲存飼養缸失敗:', error);
      alert('儲存失敗，請檢查網路連接');
    }
  };

  const handleDelete = async (tank) => {
    if (!confirm(`確定要刪除「${tank.name}」嗎？相關的排程和歷史資料也會被刪除。`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/tanks/${tank.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadTanks();
      } else {
        alert('刪除失敗');
      }
    } catch (error) {
      console.error('刪除飼養缸失敗:', error);
      alert('刪除失敗，請檢查網路連接');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">飼養缸管理</h1>
        <button
          onClick={handleAdd}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>新增飼養缸</span>
        </button>
      </div>

      {/* 編輯表單 */}
      {isEditing && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingTank ? '編輯飼養缸' : '新增飼養缸'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 基本資訊 */}
            <div className="space-y-4">
              {/* 圖片上傳 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  飼養缸圖片
                </label>
                <div className="flex items-center space-x-4">
                  {imagePreview ? (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-300">
                      <img 
                        src={imagePreview} 
                        alt="預覽" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="tank-image-upload"
                    />
                    <label
                      htmlFor="tank-image-upload"
                      className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      <span>選擇圖片</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      支援 JPG、PNG 格式，最大 5MB
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  飼養缸名稱 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="例如：綠鬣蜥主缸"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="例如：守宮飼養箱"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    最低溫度 (°C)
                  </label>
                  <input
                    type="number"
                    value={formData.target_temp_min}
                    onChange={(e) => setFormData({ ...formData, target_temp_min: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="15"
                    max="40"
                    step="0.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    最高溫度 (°C)
                  </label>
                  <input
                    type="number"
                    value={formData.target_temp_max}
                    onChange={(e) => setFormData({ ...formData, target_temp_max: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="15"
                    max="40"
                    step="0.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    最低濕度 (%)
                  </label>
                  <input
                    type="number"
                    value={formData.target_humidity_min || ''}
                    onChange={(e) => setFormData({ ...formData, target_humidity_min: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    max="100"
                    placeholder="選填"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    最高濕度 (%)
                  </label>
                  <input
                    type="number"
                    value={formData.target_humidity_max || ''}
                    onChange={(e) => setFormData({ ...formData, target_humidity_max: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    max="100"
                    placeholder="選填"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  啟用此飼養缸
                </label>
              </div>
            </div>

            {/* 右側：提示資訊 */}
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">💡 設定說明</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>• 溫度範圍用於自動控制加熱/冷卻設備</li>
                  <li>• 溫度超出範圍時會觸發警報</li>
                  <li>• 濕度設定為選填項目</li>
                  <li>• 建立後可到「開發者工具」設定繼電器通道關聯</li>
                  <li>• 停用的飼養缸不會執行自動控制</li>
                </ul>
              </div>

              {/* 關聯的繼電器通道 */}
              {editingTank && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">🔌 關聯的設備</h3>
                  {tankRelays.length === 0 ? (
                    <p className="text-sm text-gray-500">尚未關聯任何設備</p>
                  ) : (
                    <div className="space-y-2">
                      {tankRelays.map(relay => (
                        <div key={relay.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900">{relay.name}</div>
                            <div className="text-xs text-gray-500">CH{relay.channel} - {relay.device_type}</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {relay.enabled ? (
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">啟用</span>
                            ) : (
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">停用</span>
                            )}
                            {relay.current_state && (
                              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-3">
                    💡 到「開發者工具」頁面可以編輯設備關聯
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setIsEditing(false);
                setEditingTank(null);
                setTankRelays([]);
              }}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>取消</span>
            </button>
            <button
              onClick={handleSave}
              disabled={!formData.name}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>儲存</span>
            </button>
          </div>
        </div>
      )}

      {/* 飼養缸列表 */}
      {tanks.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600 mb-4">尚無飼養缸，請點擊上方「新增飼養缸」按鈕開始設定</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tanks.map((tank) => (
            <div key={tank.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
              {/* 圖片區域 */}
              <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500 relative overflow-hidden">
                {tank.image_url ? (
                  <img 
                    src={tank.image_url} 
                    alt={tank.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-6xl font-bold">
                    {tank.name.charAt(0)}
                  </div>
                )}
                {!tank.active && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded">
                    已停用
                  </div>
                )}
              </div>

              {/* 資訊區域 */}
              <div className="p-4">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{tank.name}</h3>
                {tank.description && (
                  <p className="text-sm text-gray-600 mb-3">{tank.description}</p>
                )}
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">目標溫度:</span>
                    <span className="font-semibold text-blue-600">
                      {tank.target_temp_min}°C - {tank.target_temp_max}°C
                    </span>
                  </div>
                  {tank.target_humidity_min && tank.target_humidity_max && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">目標濕度:</span>
                      <span className="font-semibold text-green-600">
                        {tank.target_humidity_min}% - {tank.target_humidity_max}%
                      </span>
                    </div>
                  )}
                </div>

                {/* 操作按鈕 */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(tank)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="text-sm">編輯</span>
                  </button>
                  <button
                    onClick={() => handleDelete(tank)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm">刪除</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TankManagement;
