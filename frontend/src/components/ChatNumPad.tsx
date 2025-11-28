/**
 * ChatNumPad Component
 * 
 * Phone numpad-style interface for T9 text input (name entry, chat messages).
 * All number keys (0-9) are used for multi-tap text entry.
 * 
 * Layout:
 * - 5 rows x 3 columns grid
 * - Top row: Back icon (left), Circle icon for Select (center), Call icon (right)
 * - Rows 2-4: Number keys 1-9 with letter labels for T9 input
 * - Bottom row: * (menu), 0 (space/0), # (backspace)
 * 
 * T9 Text Input:
 * - All number keys 0-9 trigger onNumberPress for multi-tap text entry
 * - Center circle icon triggers onSelect (confirm character/move cursor)
 * - # key triggers onNumberPress('#') for backspace
 * - No navigation keys (2/4/5/6/8) - all used for text input
 * 
 * Design:
 * - Dark background (#1a1a1a) with grey text (#888888)
 * - Minimal borders (0.5px) between buttons
 * - Press state: darker background (#0a0a0a)
 * - Uses FuturaCyrillicBook font for numbers and letters
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, AppState, AppStateStatus } from 'react-native';
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { audioService } from '../services/audioService';

type IconConfig = {
  library: 'ionicons' | 'fontawesome' | 'materialicons';
  name: string;
  size?: number;
};

interface ChatNumPadButtonProps {
  number?: string;
  letters?: string;
  symbol?: string;
  icon?: IconConfig;
  onPress?: () => void;
  disabled?: boolean;
  type: 'number' | 'action' | 'placeholder';
  triggerFeedback?: () => Promise<void>;
}

const ChatNumPadButton: React.FC<ChatNumPadButtonProps> = ({
  number,
  letters,
  symbol,
  icon,
  onPress,
  disabled,
  type,
  triggerFeedback
}) => {
  const [isPressed, setIsPressed] = useState(false);

  // Safe callback invocation with error handling
  const handlePress = () => {
    if (!onPress || disabled) {
      return;
    }
    
    try {
      onPress();
    } catch (error) {
      console.error('Error executing button press callback:', error);
    }
  };

  const handlePressIn = () => {
    if (disabled) return;
    
    // Trigger feedback (non-blocking)
    if (triggerFeedback) {
      triggerFeedback();
    }
    
    // Update visual state
    setIsPressed(true);
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  return (
    <View
      style={[
        styles.buttonWrapper,
        type === 'action' && styles.actionButtonWrapper,
        type === 'placeholder' && styles.placeholderButtonWrapper,
        disabled && styles.buttonDisabled,
      ]}
    >
      <Pressable
        style={styles.pressable}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
      >
        <View style={[
          styles.buttonInner,
          isPressed && styles.buttonPressed
        ]}>
          {icon ? (
            <>
              {icon.library === 'ionicons' && (
                <Ionicons 
                  name={icon.name as any}
                  size={icon.size || 24}
                  style={styles.iconStyle}
                  color="#898989ff" 
                />
              )}
              {icon.library === 'fontawesome' && (
                <FontAwesome
                  name={icon.name as any}
                  size={icon.size || 24}
                  style={styles.iconStyle}
                  color="#898989ff" 
                />
              )}
              {icon.library === 'materialicons' && (
                <MaterialIcons 
                  name={icon.name as any}
                  size={icon.size || 24}
                  style={styles.iconStyle}
                  color="#898989ff" 
                />
              )}
            </>
          ) : symbol ? (
            <Text style={styles.symbol}>{symbol}</Text>
          ) : (
            <View style={styles.buttonContent}>
              <Text style={[
                styles.number,
                number === '–' && styles.dashNumber
              ]}>
                {number}
              </Text>
              {letters && (
                <Text style={styles.letters}>
                  {letters}
                </Text>
              )}
            </View>
          )}
        </View>
      </Pressable>
    </View>
  );
};

interface ChatNumPadProps {
  // Text input callbacks
  onNumberPress: (number: string) => void;
  onConfirm: () => void;  // Center circle - confirm character
  onBack: () => void;
  onCall: () => void;     // Submit/save
  onMenu: () => void;
  
  // Settings
  soundEnabled?: boolean;
  vibrateEnabled?: boolean;
}

export const ChatNumPad: React.FC<ChatNumPadProps> = ({
  onNumberPress,
  onConfirm,
  onBack,
  onCall,
  onMenu,
  soundEnabled = true,
  vibrateEnabled = true
}) => {
  // Load click sound on mount, unload on unmount
  useEffect(() => {
    const loadClickSound = async () => {
      try {
        await audioService.loadSound('click', require('../../assets/click.mp3'));
      } catch (error) {
        console.error('Failed to load click sound:', error);
      }
    };

    loadClickSound();

    return () => {
      audioService.unloadSound('click');
    };
  }, []);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background') {
        // Unload sounds when app goes to background
        await audioService.unloadAll();
      } else if (nextAppState === 'active') {
        // Reload sounds when app comes to foreground
        try {
          await audioService.loadSound('click', require('../../assets/click.mp3'));
        } catch (error) {
          console.error('Failed to reload click sound:', error);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  // Trigger haptic feedback
  const triggerHaptic = async () => {
    if (!vibrateEnabled) return;
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  };

  // Play click sound
  const playClickSound = async () => {
    if (!soundEnabled) return;
    
    try {
      await audioService.playSound('click');
    } catch (error) {
      console.warn('Click sound failed:', error);
    }
  };

  // Trigger both feedback types concurrently
  const triggerFeedback = async () => {
    const feedbackPromises = [];
    
    if (vibrateEnabled) {
      feedbackPromises.push(triggerHaptic());
    }
    
    if (soundEnabled) {
      feedbackPromises.push(playClickSound());
    }
    
    if (feedbackPromises.length > 0) {
      await Promise.allSettled(feedbackPromises);
    }
  };

  // Number buttons configuration - all number keys for T9 text input
  const numberButtons: ChatNumPadButtonProps[][] = [
    [
      { icon: { library: 'ionicons', name: 'arrow-back', size: 24 }, onPress: onBack, type: 'number' },
      { icon: { library: 'materialicons', name: 'circle', size: 18 }, onPress: onConfirm, type: 'number' },
      { icon: { library: 'ionicons', name: 'call-outline', size: 24 }, onPress: onCall, type: 'number' }
    ],
    [
      { number: '1', letters: '', onPress: () => onNumberPress('1'), type: 'number' },
      { number: '2', letters: 'abc', onPress: () => onNumberPress('2'), type: 'number' },
      { number: '3', letters: 'def', onPress: () => onNumberPress('3'), type: 'number' }
    ],
    [
      { number: '4', letters: 'ghi', onPress: () => onNumberPress('4'), type: 'number' },
      { number: '5', letters: 'jkl', onPress: () => onNumberPress('5'), type: 'number' },
      { number: '6', letters: 'mno', onPress: () => onNumberPress('6'), type: 'number' }
    ],
    [
      { number: '7', letters: 'pqrs', onPress: () => onNumberPress('7'), type: 'number' },
      { number: '8', letters: 'tuv', onPress: () => onNumberPress('8'), type: 'number' },
      { number: '9', letters: 'wxyz', onPress: () => onNumberPress('9'), type: 'number' }
    ],
    [
      { number: '*', letters: '', onPress: onMenu, type: 'number' },
      { number: '0', letters: '␣', onPress: () => onNumberPress('0'), type: 'number' },
      { number: '#', letters: '', onPress: () => onNumberPress('#'), type: 'number' }
    ]
  ];

  return (
    <View style={styles.container}>
      {numberButtons.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={rowIndex === numberButtons.length - 1 ? styles.numberRowLast : styles.numberRow}>
          {row.map((button, colIndex) => (
            <ChatNumPadButton 
              key={`num-${rowIndex}-${colIndex}`} 
              {...button} 
              triggerFeedback={triggerFeedback}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a1a',
  },
  iconStyle: {
    marginTop: 8,
  },
  numberRow: {
    flexDirection: 'row',
    height: '20%',
  },
    numberRowLast: {
    flexDirection: 'row',
    height: '25%',
    paddingBottom: 20
  },
  buttonWrapper: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: '#0a0a0a',
    margin: -0.5,
  },
  actionButtonWrapper: {
    flex: 1,
  },
  placeholderButtonWrapper: {
    flex: 1,
    opacity: 0,
  },
  pressable: {
    flex: 1,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonInner: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPressed: {
    backgroundColor: '#0a0a0a',
  },
  buttonContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },


    number: {
    fontSize: 28,
    fontWeight: '800',
    color: '#888888',
    fontFamily: 'FuturaCyrillicBook',
    marginBottom: -4,
  },
  dashNumber: {
    fontSize: 36,
    fontWeight: '600',
    fontFamily: 'System',
    letterSpacing: -2,
  },
  letters: {
    fontSize: 16,
    fontWeight: '300',
    color: '#afafafff',
    letterSpacing: 0.5,
    textTransform: 'lowercase',
    fontFamily: 'FuturaCyrillicBook',
  },
  symbol: {
    fontSize: 32,
    fontWeight: '800',
    color: '#888888',
    fontFamily: 'FuturaCyrillicBook',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
