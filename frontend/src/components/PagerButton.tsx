import React, { useState } from 'react';
import { Pressable, Text, StyleSheet, View, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type ColorVariant = 'default' | 'primary' | 'success' | 'error' | 'gold' | 'bronze';

interface MetalButtonProps {
  children?: string;
  variant?: ColorVariant;
  onPress?: () => void;
  style?: object;
}

const colorVariants: Record<
  ColorVariant,
  {
    outer: readonly [string, string];
    inner: readonly [string, string, string];
    button: readonly [string, string];
    textColor: string;
  }
> = {
  default: {
    outer: ['#000', '#A0A0A0'] as const,
    inner: ['#FAFAFA', '#3E3E3E', '#E5E5E5'] as const,
    button: ['#B9B9B9', '#969696'] as const,
    textColor: '#FFFFFF',
  },
  primary: {
    outer: ['#0051B4', '#90C2FF'] as const,
    inner: ['#C4EBFF', '#0B3F89', '#A6DDFB'] as const,
    button: ['#96C6EA', '#2D7CCA'] as const,
    textColor: '#FFF7F0',
  },
  success: {
    outer: ['#005A43', '#7CCB9B'] as const,
    inner: ['#E5F8F0', '#00352F', '#D1F0E6'] as const,
    button: ['#9ADBC8', '#3E8F7C'] as const,
    textColor: '#FFF7F0',
  },
  error: {
    outer: ['#5A0000', '#FFAEB0'] as const,
    inner: ['#FFDEDE', '#680002', '#FFE9E9'] as const,
    button: ['#F08D8F', '#A45253'] as const,
    textColor: '#FFF7F0',
  },
  gold: {
    outer: ['#917100', '#EAD98F'] as const,
    inner: ['#FFFDDD', '#856807', '#FFF1B3'] as const,
    button: ['#FFEBA1', '#9B873F'] as const,
    textColor: '#FFFDE5',
  },
  bronze: {
    outer: ['#864813', '#E9B486'] as const,
    inner: ['#EDC5A1', '#5F2D01', '#FFDEC1'] as const,
    button: ['#FFE3C9', '#A36F3D'] as const,
    textColor: '#FFF7F0',
  },
};

export const MetalButton: React.FC<MetalButtonProps> = ({
  children = 'Button',
  variant = 'default',
  onPress,
  style,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];
  const translateYAnim = useState(new Animated.Value(0))[0];

  const colors = colorVariants[variant];

  const handlePressIn = () => {
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

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          transform: [{ translateY: translateYAnim }, { scale: 0.99 }],
        },
        style,
      ]}
    >
      <LinearGradient
        colors={colors.outer}
        style={styles.outerGradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <LinearGradient
          colors={colors.inner}
          style={styles.innerGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.pressableWrapper}
        >
          <LinearGradient
            colors={colors.button}
            style={styles.buttonGradient}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          >
            <Animated.View
              style={[
                styles.buttonContent,
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
              <Text
                style={[
                  styles.buttonText,
                  { color: colors.textColor },
                ]}
              >
                {children}
              </Text>
            </Animated.View>
          </LinearGradient>
        </Pressable>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  outerGradient: {
    borderRadius: 9999,
    padding: 1.25,
  },
  innerGradient: {
    position: 'absolute',
    top: 1,
    left: 1,
    right: 1,
    bottom: 1,
    borderRadius: 9999,
  },
  pressableWrapper: {
    position: 'relative',
    zIndex: 10,
  },
  buttonGradient: {
    margin: 2.5,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    overflow: 'hidden',
  },
  buttonContent: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 20,
    textShadowColor: 'rgba(80, 80, 80, 1)',
    textShadowOffset: { width: 0, height: -1 },
    textShadowRadius: 0,
    zIndex: 50,
  },
  shineEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    borderRadius: 9999,
    overflow: 'hidden',
    opacity: 0.2,
  },
  shineGradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

// Wrapper component for backward compatibility with ButtonGrid
interface PagerButtonProps {
  label: string;
  onPress: () => void;
  isNavButton?: boolean;
  style?: object;
}

export const PagerButton: React.FC<PagerButtonProps> = ({ 
  label, 
  onPress, 
  isNavButton = false, 
  style 
}) => {
  // Map button types to variants
  const getVariant = (): ColorVariant => {
    if (label === 'SELECT') return 'primary';
    if (label === 'BACK') return 'error';
    if (isNavButton) return 'default';
    return 'default';
  };

  return (
    <MetalButton 
      variant={getVariant()} 
      onPress={onPress}
      style={style}
    >
      {label}
    </MetalButton>
  );
};
