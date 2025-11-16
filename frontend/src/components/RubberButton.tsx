import React, { useState } from 'react';
import { Pressable, View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type ButtonType = 'select' | 'back' | 'nav';

interface RubberButtonProps {
  label: string;
  onPress: () => void;
  isNavButton?: boolean;
  style?: object;
}

export const RubberButton: React.FC<RubberButtonProps> = ({ 
  label, 
  onPress, 
  isNavButton = false, 
  style 
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];
  const depthAnim = useState(new Animated.Value(0))[0];

  // Determine button type and indicator color
  const getButtonType = (): ButtonType => {
    if (label === 'SELECT') return 'select';
    if (label === 'BACK') return 'back';
    return 'nav';
  };

  const getIndicatorColor = (): string => {
    const type = getButtonType();
    if (type === 'select') return '#4eff4eff'; // Green
    if (type === 'back') return '#ff5b5bff'; // Red
    return '#ffffff'; // White for nav
  };

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.96,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(depthAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(depthAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const buttonType = getButtonType();
  const showIndicator = buttonType === 'select' || buttonType === 'back';

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          transform: [
            { scale: scaleAnim },
            { translateY: Animated.multiply(depthAnim, 2) },
          ],
        },
        style,
      ]}
    >
      {/* Rubber button with gradient for depth */}
      <LinearGradient
        colors={
          isPressed
            ? ['#3a3a3a', '#2a2a2a', '#1a1a1a'] // Darker when pressed
            : ['#5a5a5a', '#4a4a4a', '#3a3a3a'] // Normal grey rubber
        }
        style={styles.rubberButton}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.pressable}
        >
          {/* Inner recessed area */}
          <View style={styles.innerRecess}>
            <LinearGradient
              colors={['#747D87', '#7b7b7bff', '#747D87']}
              style={styles.recessGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            >
              {showIndicator ? (
                // Colored indicator line for SELECT/BACK
                <View style={styles.indicatorContainer}>
                  <View
                    style={[
                      styles.indicator,
                      { backgroundColor: getIndicatorColor() },
                    ]}
                  />
                </View>
              ) : (
                // Arrow symbol for nav buttons
                <View style={styles.navSymbol}>
                  <View style={styles.navArrow} />
                </View>
              )}
            </LinearGradient>
          </View>
        </Pressable>
      </LinearGradient>


    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    borderRadius: 50, // Oval shape
  },
  rubberButton: {
    borderRadius: 50, // Oval shape
    borderWidth: 2,
    borderColor: '#1a1a1a',
    overflow: 'hidden',
    // Rubber texture effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  pressable: {
    padding: 6,
    paddingHorizontal: 8,
  },
  innerRecess: {
    borderRadius: 50, // Match outer oval
    overflow: 'hidden',
    height: 44,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    // Inner shadow for recessed look
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  recessGradient: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorContainer: {
    width: '70%',
    height: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: '50%',
    height: 6,
    borderRadius: 3,
  },
  navSymbol: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navArrow: {
    width: 12,
    height: 12,
    backgroundColor: '#ffffff',
    opacity: 0.6,
  },

});

// Wrapper for backward compatibility
interface PagerButtonProps {
  label: string;
  onPress: () => void;
  isNavButton?: boolean;
  style?: object;
}

export const PagerButton: React.FC<PagerButtonProps> = (props) => {
  return <RubberButton {...props} />;
};
