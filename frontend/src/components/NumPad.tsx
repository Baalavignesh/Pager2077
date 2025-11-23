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
    gap: 12,
    justifyContent: 'center',
  },
  
  // Number button styles
  button: {
    width: 100,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: "14%",
    // borderWidth: 1,
    // borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
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
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  
  buttonDisabled: {
    opacity: 0.3,
  },
  
  // Button content styles
  buttonContent: {
    alignItems: 'center',
    // gap: 2,
  },
  
  number: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
  },
  
  letters: {
    fontSize: 10,
    fontWeight: '400',
    color: '#666666',
    letterSpacing: 1,
    textTransform: 'lowercase',
  },
  
  symbol: {
    fontSize: 20,
    fontWeight: '500',
    color: '#000000',
  },
});
