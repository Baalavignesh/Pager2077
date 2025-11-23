import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface TopActionButtonProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  isCenter?: boolean;
}

const TopActionButton: React.FC<TopActionButtonProps> = ({
  label,
  onPress,
  disabled,
  isCenter = false
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];
  const translateYAnim = useState(new Animated.Value(0))[0];

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
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.97,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 2.5,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Default metallic colors
  const colors = {
    outer: ['#000', '#A0A0A0'] as const,
    inner: ['#FAFAFA', '#3E3E3E', '#E5E5E5'] as const,
    button: ['#B9B9B9', '#969696'] as const,
  };

  return (
    <Animated.View
      style={[
        isCenter ? styles.centerButtonWrapper : styles.topButtonWrapper,
        {
          transform: [{ translateY: translateYAnim }, { scale: 0.99 }],
        },
        disabled && styles.topButtonDisabled,
      ]}
    >
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          style={styles.pressableWrapper}
        >
          <LinearGradient
            colors={colors.button}
            style={isCenter ? styles.centerButtonGradient : styles.topButtonGradient}
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
                <View style={styles.shineEffect}>
                  <LinearGradient
                    colors={['transparent', 'rgba(243, 244, 246, 0.2)', 'transparent']}
                    style={styles.shineGradient}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                  />
                </View>
              )}
              <Text style={styles.topButtonText}>{label}</Text>
            </Animated.View>
          </LinearGradient>
        </Pressable>
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
  return (
    <View style={styles.topActionsContainer}>
      {/* Top row: BACK and SELECT - full width */}
      <View style={styles.topActionRow}>
        <TopActionButton label="−" onPress={onBack} />
        <TopActionButton label="−" onPress={onSelect} />
      </View>
      
      {/* Bottom row: RECORD and STOP - full width */}
      <View style={styles.bottomActionRow}>
        <TopActionButton label="−" disabled={true} />
        <TopActionButton label="−" disabled={true} />
      </View>
      
      {/* Center MENU button - absolutely positioned on top */}
      <TopActionButton label="−" onPress={onMenu} isCenter={true} />
    </View>
  );
};

const styles = StyleSheet.create({
  // Top action buttons container
  topActionsContainer: {
    width: '100%',
    position: 'relative',
    height: 110,
  },
  
  topActionRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 0,
  },
  
  bottomActionRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 0,
  },
  
  // Top button wrapper styles
  topButtonWrapper: {
    flex: 1,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    height: 55,
    // elevation: 3,
  },
  
  centerButtonWrapper: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 90,
    height: 90,
    marginLeft: -45,
    marginTop: -45,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  
  topButtonDisabled: {
    opacity: 0.3,
  },
  
  // Gradient layers for top buttons
  topOuterGradient: {
    flex: 1,
    borderRadius: 12,
    padding: 1.25,
  },
  
  topInnerGradient: {
    position: 'absolute',
    top: 1,
    left: 1,
    right: 1,
    bottom: 1,
    borderRadius: 12,
  },
  
  // Gradient layers for center button
  centerOuterGradient: {
    flex: 1,
    borderRadius: 20,
    padding: 1.25,
  },
  
  centerInnerGradient: {
    position: 'absolute',
    top: 1,
    left: 1,
    right: 1,
    bottom: 1,
    borderRadius: 20,
  },
  
  pressableWrapper: {
    position: 'relative',
    zIndex: 10,
    flex: 1,
  },
  
  topButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  
  centerButtonGradient: {
    flex: 1,
    margin: 2.5,
    borderRadius: 18,
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
    opacity: 0.2,
  },
  
  shineGradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  
  topButtonText: {
    fontSize: 28,
    fontWeight: '400',
    color: '#FFFFFF',
    textShadowColor: 'rgba(80, 80, 80, 1)',
    textShadowOffset: { width: 0, height: -1 },
    textShadowRadius: 0,
    zIndex: 50,
  },
});
