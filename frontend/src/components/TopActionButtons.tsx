/**
 * TopActionButtons Component
 * 
 * A 2x2 grid of action buttons with a centered menu button overlay.
 * Features a metallic design with flat corner buttons and a gradient center button.
 * 
 * Layout:
 * - 4 corner buttons arranged in 2 rows (Back, Select, Record, Stop)
 * - 1 center menu button positioned absolutely in the middle
 * - Corner buttons have seamless borders (no gap in middle)
 * - Center button has thick double-border frame effect
 * 
 * Design:
 * - Corner buttons: Flat gray (#b5b5b5) with subtle borders
 * - Center button: Metallic gradient with double-square border frame
 * - Press animation: Scale effect (0.98) with shine overlay
 * - High z-index (1000) to sit above other UI elements
 */

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface TopActionButtonProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  isCenter?: boolean;
  position?: 'left' | 'right';
}

const TopActionButton: React.FC<TopActionButtonProps> = ({
  label,
  onPress,
  disabled,
  isCenter = false,
  position
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];

  const handlePress = () => {
    if (!onPress || disabled) {
      return;
    }
    
    try {
      onPress();
    } catch (error) {
      console.error('Error executing top action button press:', error);
    }
  };

  const handlePressIn = () => {
    if (disabled) return;
    setIsPressed(true);
    Animated.timing(scaleAnim, {
      toValue: 0.98,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  // Flat color for corner buttons
  const flatColor = '#b5b5b5';
  const borderColor = '#6a6a6a';

  // Center button with metallic gradient and thick border
  const centerColors = {
    outerBorder: '#4a4a4a',
    innerBorder: '#6a6a6a',
    frameBg: '#b0b0b0', // Match button color to blend
    button: ['#c8c8c8', '#9a9a9a'] as const,
  };

  return (
    <Animated.View
      style={[
        isCenter ? styles.centerButtonWrapper : styles.topButtonWrapper,
        disabled && styles.topButtonDisabled,
      ]}
    >
      {isCenter ? (
        // Center button with metallic gradient and thick border effect
        <View style={[styles.centerOuterBorder, { borderColor: centerColors.outerBorder }]}>
          {/* Frame background between borders */}
          <View style={[styles.centerFrameBg, { backgroundColor: centerColors.frameBg }]}>
            {/* Inner square border for thick border effect */}
            <View style={[styles.centerInnerBorder, { borderColor: centerColors.innerBorder }]}>
              <Pressable
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled}
                style={styles.pressableWrapper}
              >
                <LinearGradient
                  colors={centerColors.button}
                  style={styles.centerButtonGradient}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                >
                  <Animated.View
                    style={[
                      styles.topButtonContent,
                      {
                        transform: [{ scale: scaleAnim }],
                      },
                    ]}
                  >
                    {isPressed && (
                      <View style={[styles.shineEffect, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]} />
                    )}
                    <Text style={styles.topButtonText}>{label}</Text>
                  </Animated.View>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </View>
      ) : (
        // Corner buttons with flat color and selective borders
        <View style={[
          styles.topOuterFlat, 
          { borderColor },
          position === 'left' && styles.leftButton,
          position === 'right' && styles.rightButton,
        ]}>
          <Pressable
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
            style={styles.pressableWrapper}
          >
            <View style={[styles.topButtonFlat, { backgroundColor: flatColor }]}>
              <Animated.View
                style={[
                  styles.topButtonContent,
                  {
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              >
                {isPressed && (
                  <View style={[styles.shineEffect, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]} />
                )}
                <Text style={styles.topButtonText}>{label}</Text>
              </Animated.View>
            </View>
          </Pressable>
        </View>
      )}
    </Animated.View>
  );
};

interface TopActionButtonsProps {
  onSelect: () => void;
  onBack: () => void;
  onMenu: () => void;
}

export const TopActionButtons: React.FC<TopActionButtonsProps> = ({
  onSelect,
  onBack,
  onMenu
}) => {
  // Placeholder handlers for future functionality
  const handleRecord = () => {
    console.log('Record button pressed - functionality coming soon');
  };

  const handleStop = () => {
    console.log('Stop button pressed - functionality coming soon');
  };

  return (
    <View style={styles.topActionsContainer}>
      {/* Top row: BACK and SELECT - full width */}
      <View style={styles.topActionRow}>
        <TopActionButton label="−" onPress={onBack} position="left" />
        <TopActionButton label="−" onPress={onSelect} position="right" />
      </View>
      
      {/* Bottom row: RECORD and STOP - full width */}
      <View style={styles.bottomActionRow}>
        <TopActionButton label="−" onPress={handleRecord} position="left" />
        <TopActionButton label="−" onPress={handleStop} position="right" />
      </View>
      
      {/* Center MENU button - absolutely positioned on top */}
      <TopActionButton label="" onPress={onMenu} isCenter={true} />
    </View>
  );
};

const styles = StyleSheet.create({
  // Top action buttons container
  topActionsContainer: {
    width: '100%',
    position: 'relative',
    height: 110,
    zIndex: 1000,
  },
  
  topActionRow: {
    flexDirection: 'row',
    width: '100%',
    height: 55,
  },
  
  bottomActionRow: {
    flexDirection: 'row',
    width: '100%',
    height: 55,
  },
  
  // Top button wrapper styles
  topButtonWrapper: {
    flex: 1,
    position: 'relative',
    height: 55,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  
  centerButtonWrapper: {
    position: 'absolute',
    top: 55,
    left: '50%',
    width: 90,
    height: 90,
    marginLeft: -45,
    marginTop: -45,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  
  topButtonDisabled: {
    opacity: 0.35,
  },
  
  // Flat styles for corner buttons
  topOuterFlat: {
    flex: 1,
    borderWidth: 0.75,
  },
  
  // Remove borders for seamless middle join
  leftButton: {
    borderRightWidth: 0,
  },
  
  rightButton: {
    borderLeftWidth: 0,
  },
  
  topButtonFlat: {
    flex: 1,
    margin: 1.5,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  
  // Center button with metallic thick border effect
  centerOuterBorder: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 2.5,
  },
  
  centerFrameBg: {
    flex: 1,
    borderRadius: 15,
    padding: 5,
  },
  
  centerInnerBorder: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 2,
  },
  
  pressableWrapper: {
    position: 'relative',
    zIndex: 10,
    flex: 1,
  },
  
  centerButtonGradient: {
    flex: 1,
    margin: 2,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  
  topButtonContent: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  
  shineEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    overflow: 'hidden',
  },
  
  topButtonText: {
    fontSize: 28,
    fontWeight: '500',
    color: '#2a2a2a',
    textShadowColor: 'rgba(255, 255, 255, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 0,
    zIndex: 50,
  },
});
