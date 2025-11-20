import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface BatteryIndicatorProps {
  batteryLevel: number; // 0-1
  isCharging: boolean;
}

export const BatteryIndicator: React.FC<BatteryIndicatorProps> = ({
  batteryLevel,
  isCharging,
}) => {
  const [blinkAnim] = useState(new Animated.Value(1));

  // Calculate number of bars (0-4)
  // 0-25% = 1 bar, 26-50% = 2 bars, 51-75% = 3 bars, 76-100% = 4 bars
  const bars = Math.floor(batteryLevel * 4);

  // Blink animation when charging
  useEffect(() => {
    if (isCharging) {
      const blink = Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      blink.start();
      return () => blink.stop();
    } else {
      blinkAnim.setValue(1);
    }
  }, [isCharging]);

  return (
    <View style={styles.container}>
      {/* Battery body */}
      <View style={styles.batteryBody}>
        {/* 4 bars */}
        {[1, 2, 3, 4].map((barIndex) => (
          <Animated.View
            key={barIndex}
            style={[
              styles.bar,
              barIndex <= bars && styles.barFilled,
              isCharging && { opacity: blinkAnim },
            ]}
          />
        ))}
      </View>
      {/* Battery tip */}
      <View style={styles.batteryTip} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryBody: {
    width: 26,
    height: 13,
    borderWidth: 1.5,
    borderColor: '#3d3d3dff',
    flexDirection: 'row',
    gap: 1.5,
    padding: 2,
    marginTop: 2,
  },
  batteryTip: {
    width: 2.5,
    height: 6.5,
    marginTop: 2,
    marginRight: 4,
    backgroundColor: '#3d3d3dff',
  },
  bar: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  barFilled: {
    backgroundColor: '#3d3d3dff',
  },
});
