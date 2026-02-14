"""系統測試腳本
運行方式: uv run python test_system.py
"""

import asyncio
import sys

sys.path.append(".")


async def test_modbus_controller():
    """測試 Modbus 控制器"""
    from services.modbus_controller import ModbusRelayController

    print("\n" + "=" * 60)
    print("測試 1: Modbus RTU 繼電器控制器")
    print("=" * 60)

    controller = ModbusRelayController(port="/dev/ttyUSB0", baudrate=9600)
    await controller.connect()

    # 讀取所有狀態
    print("\n[1] 讀取所有繼電器狀態...")
    states = await controller.read_all_relays()
    for i, state in enumerate(states):  # 只顯示前8個
        print(f"   繼電器 {i:2d}: {'ON' if state else 'OFF'}")

    # 測試控制
    print("\n[2] 測試控制繼電器 0-3...")
    for channel in range(8):
        await controller.set_relay(channel, True)
        await asyncio.sleep(0.2)

    # 測試關閉
    print("[3] 全部關閉...")
    await controller.set_all_relays(False)

    await controller.disconnect()
    print("✓ Modbus 控制器測試完成\n")


async def test_temperature_monitor():
    """測試溫度監控"""
    from services.temperature_monitor import TemperatureMonitorService

    print("=" * 60)
    print("測試 2: 溫度監控服務")
    print("=" * 60)

    monitor = TemperatureMonitorService(simulation_mode=True)

    # 添加感測器
    print("\n[1] 添加模擬感測器...")
    monitor.add_sensor("tank1_hot", sensor_type="simulated", base_temp=28.0)
    monitor.add_sensor("tank1_cool", sensor_type="simulated", base_temp=24.0)

    # 讀取溫度
    print("\n[2] 讀取溫度...")
    readings = await monitor.read_all_sensors()
    for reading in readings:
        print(f"   {reading['sensor_id']:15s} -> {reading['temperature']:6.2f}°C")

    # 短暫監控
    print("\n[3] 啟動監控 5 秒...")

    reading_count = [0]

    async def on_reading(reading):
        reading_count[0] += 1
        if reading_count[0] <= 3:  # 只顯示前3次
            print(f"   [讀數] {reading['sensor_id']} = {reading['temperature']:.2f}°C")

    monitor.on_temperature_reading = on_reading

    await monitor.start()
    await asyncio.sleep(5)
    await monitor.stop()

    print(f"   總讀數: {reading_count[0]} 次")
    print("✓ 溫度監控測試完成\n")


async def test_api_response():
    """測試 API 基本響應"""
    import httpx

    print("=" * 60)
    print("測試 3: API 響應（需先啟動服務）")
    print("=" * 60)

    base_url = "http://localhost:8000"

    async with httpx.AsyncClient() as client:
        try:
            # 測試健康檢查
            print("\n[1] 測試健康檢查...")
            response = await client.get(f"{base_url}/api/health", timeout=3.0)
            print(f"   狀態碼: {response.status_code}")
            print(f"   響應: {response.json()}")

            # 測試系統狀態
            print("\n[2] 測試系統狀態...")
            response = await client.get(f"{base_url}/api/system/status", timeout=3.0)
            data = response.json()
            print(f"   系統名稱: {data['system']['name']}")
            print(f"   版本: {data['system']['version']}")

            print("✓ API 測試完成\n")

        except httpx.ConnectError:
            print("   ⚠ 服務未啟動，跳過 API 測試")
            print("   提示: 先執行 'uv run python main.py' 啟動服務\n")
        except Exception as e:
            print(f"   ✗ 錯誤: {e}\n")


async def main():
    """主測試函數"""
    print("\n")
    print("╔" + "=" * 58 + "╗")
    print("║" + " " * 15 + "系統測試套件" + " " * 31 + "║")
    print("╚" + "=" * 58 + "╝")

    # 運行測試
    await test_modbus_controller()
    # await test_temperature_monitor()
    # await test_api_response()

    print("=" * 60)
    print("所有測試完成！")
    print("=" * 60)
    print()


if __name__ == "__main__":
    asyncio.run(main())
