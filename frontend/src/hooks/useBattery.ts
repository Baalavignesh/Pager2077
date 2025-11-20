import { useState, useEffect } from 'react';
import * as Battery from 'expo-battery';

interface BatteryState {
  batteryLevel: number;
  isCharging: boolean;
}

export const useBattery = (): BatteryState => {
  const [batteryState, setBatteryState] = useState<BatteryState>({
    batteryLevel: 1,
    isCharging: false,
  });

  useEffect(() => {
    let isMounted = true;

    const updateBatteryStatus = async () => {
      try {
        // Get battery level (0-1)
        const level = await Battery.getBatteryLevelAsync();
        
        // Get charging state
        const state = await Battery.getBatteryStateAsync();
        const charging = state === Battery.BatteryState.CHARGING;

        if (isMounted) {
          setBatteryState({
            batteryLevel: level,
            isCharging: charging,
          });
        }
      } catch (error) {
        console.log('Battery status error:', error);
      }
    };

    // Update immediately
    updateBatteryStatus();

    // Update every 30 seconds
    const interval = setInterval(updateBatteryStatus, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return batteryState;
};
