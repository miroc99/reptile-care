"""Modbus RTU 繼電器控制服務"""

import asyncio
import logging
from typing import Optional, List, Dict
from datetime import datetime
from pymodbus.client import ModbusSerialClient
from pymodbus.exceptions import ModbusException
from config import settings

logger = logging.getLogger(__name__)


class ModbusRelayController:
    """Modbus RTU 16通道繼電器控制器

    基於 Waveshare Modbus RTU Relay 16CH
    - 功能碼 01: 讀線圈狀態
    - 功能碼 05: 寫單線圈
    - 功能碼 0F: 寫多線圈
    - 繼電器地址: 0x0000-0x000F (0-15)
    """

    def __init__(
        self,
        port: str = None,
        baudrate: int = None,
        device_address: int = None,
        simulation_mode: bool = False,
    ):
        """初始化 Modbus 控制器

        Args:
            port: 串口端口 (例如 COM3 或 /dev/ttyUSB0)
            baudrate: 波特率，默認 9600
            device_address: Modbus 設備地址，默認 1
            simulation_mode: 模擬模式，用於無硬件測試
        """
        self.port = port or settings.modbus_port
        self.baudrate = baudrate or settings.modbus_baudrate
        self.device_address = device_address or settings.modbus_device_address
        self.simulation_mode = simulation_mode

        # 模擬狀態 (用於無硬件測試)
        self._simulated_state = [False] * 16

        self.client: Optional[ModbusSerialClient] = None
        self._lock = asyncio.Lock()

        logger.info(
            f"ModbusRelayController 初始化: port={self.port}, "
            f"baudrate={self.baudrate}, address={self.device_address}, "
            f"simulation={self.simulation_mode}"
        )

    async def connect(self) -> bool:
        """連接到 Modbus 設備"""
        if self.simulation_mode:
            logger.info("模擬模式：跳過實際連接")
            return True

        try:
            self.client = ModbusSerialClient(
                port=self.port,
                baudrate=self.baudrate,
                parity=settings.modbus_parity,
                stopbits=settings.modbus_stopbits,
                bytesize=settings.modbus_bytesize,
                timeout=settings.modbus_timeout,
            )

            # 在事件循環中運行同步操作
            connected = await asyncio.get_event_loop().run_in_executor(None, self.client.connect)

            if connected:
                logger.info(f"成功連接到 Modbus 設備: {self.port}")
                return True
            else:
                logger.error(f"無法連接到 Modbus 設備: {self.port}")
                return False

        except Exception as e:
            logger.error(f"連接 Modbus 設備時發生錯誤: {e}")
            return False

    async def disconnect(self):
        """斷開連接"""
        if self.simulation_mode or not self.client:
            return

        try:
            await asyncio.get_event_loop().run_in_executor(None, self.client.close)
            logger.info("已斷開 Modbus 連接")
        except Exception as e:
            logger.error(f"斷開連接時發生錯誤: {e}")

    async def read_relay_status(self, channel: int) -> Optional[bool]:
        """讀取單個繼電器狀態

        Args:
            channel: 繼電器通道 (0-15)

        Returns:
            True=ON, False=OFF, None=錯誤
        """
        if not 0 <= channel <= 15:
            raise ValueError(f"通道編號必須在 0-15 之間，得到 {channel}")

        if self.simulation_mode:
            return self._simulated_state[channel]

        async with self._lock:
            try:
                # 功能碼 01: 讀取線圈狀態
                response = await asyncio.get_event_loop().run_in_executor(
                    None,
                    lambda: self.client.read_coils(
                        address=channel, count=1, device_id=self.device_address
                    ),
                )

                if response.isError():
                    logger.error(f"讀取繼電器 {channel} 狀態失敗: {response}")
                    return None

                status = response.bits[0]
                logger.debug(f"繼電器 {channel} 狀態: {status}")
                return status

            except Exception as e:
                logger.error(f"讀取繼電器 {channel} 狀態時發生錯誤: {e}")
                return None

    async def read_all_relays(self) -> Optional[List[bool]]:
        """讀取所有繼電器狀態

        Returns:
            16個布林值的列表，或 None 如果發生錯誤
        """
        if self.simulation_mode:
            return self._simulated_state.copy()

        async with self._lock:
            try:
                # 功能碼 01: 讀取所有 16 個線圈
                response = await asyncio.get_event_loop().run_in_executor(
                    None,
                    lambda: self.client.read_coils(
                        address=0, count=16, device_id=self.device_address
                    ),
                )

                if response.isError():
                    logger.error(f"讀取所有繼電器狀態失敗: {response}")
                    return None

                statuses = response.bits[:16]
                logger.debug(f"所有繼電器狀態: {statuses}")
                return statuses

            except Exception as e:
                logger.error(f"讀取所有繼電器狀態時發生錯誤: {e}")
                return None

    async def set_relay(self, channel: int, state: bool) -> bool:
        """設置單個繼電器狀態

        Args:
            channel: 繼電器通道 (0-15)
            state: True=ON, False=OFF

        Returns:
            操作是否成功
        """
        if not 0 <= channel <= 15:
            raise ValueError(f"通道編號必須在 0-15 之間，得到 {channel}")

        if self.simulation_mode:
            self._simulated_state[channel] = state
            logger.info(f"[模擬] 繼電器 {channel} 設為 {'ON' if state else 'OFF'}")
            return True

        async with self._lock:
            try:
                # 功能碼 05: 寫單個線圈
                # 0xFF00 = ON, 0x0000 = OFF
                value = 0xFF00 if state else 0x0000

                response = await asyncio.get_event_loop().run_in_executor(
                    None,
                    lambda: self.client.write_coil(
                        address=channel, value=state, device_id=self.device_address
                    ),
                )

                if response.isError():
                    logger.error(f"設置繼電器 {channel} 失敗: {response}")
                    return False

                logger.info(f"繼電器 {channel} 已設為 {'ON' if state else 'OFF'}")
                return True

            except Exception as e:
                logger.error(f"設置繼電器 {channel} 時發生錯誤: {e}")
                return False

    async def set_all_relays(self, state: bool) -> bool:
        """設置所有繼電器為相同狀態

        Args:
            state: True=全部ON, False=全部OFF

        Returns:
            操作是否成功
        """
        if self.simulation_mode:
            self._simulated_state = [state] * 16
            logger.info(f"[模擬] 所有繼電器設為 {'ON' if state else 'OFF'}")
            return True

        async with self._lock:
            try:
                # 功能碼 0F: 寫多個線圈
                values = [state] * 16

                response = await asyncio.get_event_loop().run_in_executor(
                    None,
                    lambda: self.client.write_coils(
                        address=0, values=values, device_id=self.device_address
                    ),
                )

                if response.isError():
                    logger.error(f"設置所有繼電器失敗: {response}")
                    return False

                logger.info(f"所有繼電器已設為 {'ON' if state else 'OFF'}")
                return True

            except Exception as e:
                logger.error(f"設置所有繼電器時發生錯誤: {e}")
                return False

    async def toggle_relay(self, channel: int) -> bool:
        """切換繼電器狀態

        Args:
            channel: 繼電器通道 (0-15)

        Returns:
            操作是否成功
        """
        current = await self.read_relay_status(channel)
        if current is None:
            return False

        return await self.set_relay(channel, not current)

    async def flash_relay(
        self, channel: int, duration_ms: int = 500, initial_state: bool = True
    ) -> bool:
        """繼電器閃爍（開啟後自動關閉，或關閉後自動開啟）

        Args:
            channel: 繼電器通道 (0-15)
            duration_ms: 持續時間（毫秒）
            initial_state: True=閃開（先開後關）, False=閃閉（先關後開）

        Returns:
            操作是否成功
        """
        if not 0 <= channel <= 15:
            raise ValueError(f"通道編號必須在 0-15 之間，得到 {channel}")

        # 讀取當前狀態
        original_state = await self.read_relay_status(channel)
        if original_state is None:
            return False

        # 設置為目標狀態
        if not await self.set_relay(channel, initial_state):
            return False

        # 等待指定時間
        await asyncio.sleep(duration_ms / 1000.0)

        # 恢復原狀態
        return await self.set_relay(channel, original_state)

    async def get_status_dict(self) -> Dict:
        """取得控制器狀態字典"""
        statuses = await self.read_all_relays()

        return {
            "connected": self.client.is_socket_open() if self.client else False,
            "simulation_mode": self.simulation_mode,
            "device_address": self.device_address,
            "port": self.port,
            "baudrate": self.baudrate,
            "relay_states": statuses if statuses else [None] * 16,
            "timestamp": datetime.utcnow().isoformat(),
        }


# 全局控制器實例
_controller: Optional[ModbusRelayController] = None


def get_controller(simulation_mode: bool = True) -> ModbusRelayController:
    """取得全局控制器實例

    Args:
        simulation_mode: 是否使用模擬模式（無實際硬件時設為 True）
    """
    global _controller
    if _controller is None:
        _controller = ModbusRelayController(simulation_mode=simulation_mode)
    return _controller


async def initialize_controller(simulation_mode: bool = True) -> bool:
    """初始化並連接控制器"""
    controller = get_controller(simulation_mode=simulation_mode)
    return await controller.connect()


async def shutdown_controller():
    """關閉控制器"""
    global _controller
    if _controller:
        await _controller.disconnect()
        _controller = None
