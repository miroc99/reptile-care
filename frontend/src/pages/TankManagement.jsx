import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Upload, X, Save } from 'lucide-react';

const TankManagement = () => {
  const [tanks, setTanks] = useState([
    {
      id: 1,
      name: '綠鬣蜥主缸',
      species: '綠鬣蜥',
      image: null,
      targetTempMin: 26,
      targetTempMax: 30,
      devices: {
        lighting: { name: '照明', enabled: true },
        heating: { name: '加熱墊', enabled: true },
        uvb: { name: 'UVB燈', enabled: true },
        cooling: { name: '散熱風扇', enabled: false }
      }
    },
    {
      id: 2,
      name: '球蟒繁殖缸',
      species: '球蟒',
      image: null,
      targetTempMin: 28,
      targetTempMax: 32,
      devices: {
        lighting: { name: '照明', enabled: true },
        heating: { name: '陶瓷加熱器', enabled: true },
        uvb: { name: 'UVB燈', enabled: false },
        cooling: { name: '散熱風扇', enabled: false }
      }
    }
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [editingTank, setEditingTank] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleAdd = () => {
    setEditingTank({
      id: Date.now(),
      name: '',
      species: '',
      image: null,
      targetTempMin: 26,
      targetTempMax: 30,
      devices: {
        lighting: { name: '照明', enabled: true },
        heating: { name: '加熱', enabled: true },
        uvb: { name: 'UVB燈', enabled: false },
        cooling: { name: '散熱', enabled: false }
      }
    });
    setImagePreview(null);
    setIsEditing(true);
  };

  const handleEdit = (tank) => {
    setEditingTank({ ...tank });
    setImagePreview(tank.image);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (tanks.find(t => t.id === editingTank.id)) {
      setTanks(tanks.map(t => t.id === editingTank.id ? editingTank : t));
    } else {
      setTanks([...tanks, editingTank]);
    }
    setIsEditing(false);
    setEditingTank(null);
    setImagePreview(null);
  };

  const handleDelete = (id) => {
    if (confirm('確定要刪除此飼養缸嗎？相關的排程和歷史數據也會被刪除。')) {
      setTanks(tanks.filter(t => t.id !== id));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setEditingTank({ ...editingTank, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeviceToggle = (deviceKey) => {
    setEditingTank({
      ...editingTank,
      devices: {
        ...editingTank.devices,
        [deviceKey]: {
          ...editingTank.devices[deviceKey],
          enabled: !editingTank.devices[deviceKey].enabled
        }
      }
    });
  };

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

      {/* 编辑表单 */}
      {isEditing && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {tanks.find(t => t.id === editingTank.id) ? '編輯飼養缸' : '新增飼養缸'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 左侧：基本信息 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  飼養缸名稱 *
                </label>
                <input
                  type="text"
                  value={editingTank.name}
                  onChange={(e) => setEditingTank({ ...editingTank, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="例如：綠鬣蜥主缸"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  飼養物種
                </label>
                <input
                  type="text"
                  value={editingTank.species}
                  onChange={(e) => setEditingTank({ ...editingTank, species: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="例如：綠鬣蜥、球蟒"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    最低溫度 (°C)
                  </label>
                  <input
                    type="number"
                    value={editingTank.targetTempMin}
                    onChange={(e) => setEditingTank({ ...editingTank, targetTempMin: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="15"
                    max="40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    最高溫度 (°C)
                  </label>
                  <input
                    type="number"
                    value={editingTank.targetTempMax}
                    onChange={(e) => setEditingTank({ ...editingTank, targetTempMax: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="15"
                    max="40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  啟用設備
                </label>
                <div className="space-y-2">
                  {Object.entries(editingTank.devices).map(([key, device]) => (
                    <label key={key} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={device.enabled}
                        onChange={() => handleDeviceToggle(key)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{device.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* 右侧：图片上传 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                飼養缸照片
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="預覽"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setImagePreview(null);
                        setEditingTank({ ...editingTank, image: null });
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="py-12">
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-sm text-gray-600 mb-2">點擊上傳照片</p>
                    <p className="text-xs text-gray-500">支援 JPG、PNG、GIF</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="mt-3 inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors"
                >
                  {imagePreview ? '更換照片' : '選擇照片'}
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setIsEditing(false);
                setEditingTank(null);
                setImagePreview(null);
              }}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>取消</span>
            </button>
            <button
              onClick={handleSave}
              disabled={!editingTank.name}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>儲存</span>
            </button>
          </div>
        </div>
      )}

      {/* 饲养缸列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tanks.map((tank) => (
          <div key={tank.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
            {/* 图片区域 */}
            <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500 relative">
              {tank.image ? (
                <img
                  src={tank.image}
                  alt={tank.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-6xl font-bold">
                  {tank.name.charAt(0)}
                </div>
              )}
            </div>

            {/* 信息区域 */}
            <div className="p-4">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{tank.name}</h3>
              {tank.species && (
                <p className="text-sm text-gray-600 mb-3">{tank.species}</p>
              )}
              
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-gray-600">目標溫度:</span>
                <span className="font-semibold text-blue-600">
                  {tank.targetTempMin}°C - {tank.targetTempMax}°C
                </span>
              </div>

              {/* 设备状态 */}
              <div className="flex flex-wrap gap-1 mb-4">
                {Object.entries(tank.devices)
                  .filter(([_, device]) => device.enabled)
                  .map(([key, device]) => (
                    <span
                      key={key}
                      className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"
                    >
                      {device.name}
                    </span>
                  ))}
              </div>

              {/* 操作按钮 */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(tank)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="text-sm">編輯</span>
                </button>
                <button
                  onClick={() => handleDelete(tank.id)}
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

      {tanks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">尚無飼養缸，請點擊上方「新增飼養缸」按鈕開始設定</p>
        </div>
      )}
    </div>
  );
};

export default TankManagement;
