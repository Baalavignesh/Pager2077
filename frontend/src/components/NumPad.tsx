import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { TopActionButtons } from './TopActionButtons';

interface NumPadButtonProps {
  number?: string;
  letters?: string;
  symbol?: string;
  onPress?: () => void;
  disabled?: boolean;
  type: 'number' | 'action' | 'placeholder';
}

const NumPadButton: React.FC<NumPadButtonProps> = ({
  number,
  letters,
  symbol,
  onPress,
  disabled,
  type
}) => {
  // Safe callback invocation with error handling
  const handlePress = () => {
    if (!onPress) {
      return;
    }
    
    try {
      onPress();
    } catch (error) {
      console.error('Error executing button press callback:', error);
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        type === 'action' && styles.actionButton,
        type === 'placeholder' && styles.placeholderButton,
        pressed && !disabled && styles.buttonPressed,
        disabled && styles.buttonDisabled
      ]}
      onPress={handlePress}
      disabled={disabled}
    >
      {symbol ? (
        <Text style={styles.symbol}>{symbol}</Text>
      ) : (
        <View style={styles.buttonContent}>
          <Text style={styles.number}>{number}</Text>
          {letters && <Text style={styles.letters}>{letters}</Text>}
        </View>
      )}
    </Pressable>
  );
};

interface NumPadProps {
  // Existing callbacks (matching ControlWheel)
  onSelect: () => void;
  onBack: () => void;
  onNavigateUp: () => void;
  onNavigateDown: () => void;
  onMenu: () => void;
  
  // New callbacks for horizontal navigation
  onNavigateLeft?: () => void;
  onNavigateRight?: () => void;
}

export const NumPad: React.FC<NumPadProps> = ({
  onSelect,
  onBack,
  onNavigateUp,
  onNavigateDown,
  onMenu,
  onNavigateLeft,
  onNavigateRight
}) => {


  // Number buttons configuration with navigation mapping
  const numberButtons: NumPadButtonProps[][] = [
    [
      { number: '1', letters: '', type: 'number' },
      { number: '2', letters: 'abc', onPress: onNavigateUp, type: 'number' },
      { number: '3', letters: 'def', type: 'number' }
    ],
    [
      { number: '4', letters: 'ghi', onPress: onNavigateLeft, type: 'number' },
      { number: '5', letters: 'jkl', onPress: onMenu, type: 'number' },
      { number: '6', letters: 'mno', onPress: onNavigateRight, type: 'number' }
    ],
    [
      { number: '7', letters: 'pqrs', type: 'number' },
      { number: '8', letters: 'tuv', onPress: onNavigateDown, type: 'number' },
      { number: '9', letters: 'wxyz', type: 'number' }
    ],
    [
      { number: '*', letters: '+', type: 'number' },
      { number: '0', letters: '_', type: 'number' },
      { number: '#', letters: '⇧⇩', type: 'number' }
    ]
  ];

  return (
    <View style={styles.container}>
      {/* Top Action Buttons - 4 full-width buttons + center menu */}
      <TopActionButtons 
        onSelect={onSelect}
        onBack={onBack}
        onMenu={onMenu}
      />
      
      {/* Number Grid */}
      <View style={styles.numberGrid}>
        {numberButtons.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.numberRow}>
            {row.map((button, colIndex) => (
              <NumPadButton key={`num-${rowIndex}-${colIndex}`} {...button} />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Number grid
  numberGrid: {
    gap: 10,
    marginTop: 10
  },
  
  numberRow: {
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
  },
  
  // Number button styles
  button: {
    width: 112,
    height: 50,
    backgroundColor: '#E5E5E5',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#A0A0A0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  
  actionButton: {
    width: 70,
    height: 50,
  },
  
  placeholderButton: {
    width: 60,
    height: 40,
  },
  
  buttonPressed: {
    backgroundColor: '#CCCCCC',
    transform: [{ scale: 0.97 }],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
  },
  
  buttonDisabled: {
    opacity: 0.3,
  },
  
  // Button content styles
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  
  number: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'FuturaCyrillicBook',
  },
  
  letters: {
    fontSize: 14,
    fontWeight: '400',
    color: '#4A4A4A',
    letterSpacing: 0.5,
    textTransform: 'lowercase',
    fontFamily: 'FuturaCyrillicBook',
  },
  
  symbol: {
    fontSize: 20,
    fontWeight: '500',
    color: '#1A1A1A',
    fontFamily: 'FuturaCyrillicBook',
  },
});
