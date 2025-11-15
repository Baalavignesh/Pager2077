import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface PagerDisplayProps {
  children: React.ReactNode;
}

export const PagerDisplay: React.FC<PagerDisplayProps> = ({ children }) => {
  return (
    <View style={styles.wrapper}>
      {/* Outer glossy bezel gradient - single piece with balanced lighting */}
      <LinearGradient
        colors={[
          '#2a2a2a', 
          '#3a3a3a',
          '#1a1a1a',
          '#1a1a1a',
        ]}
        style={styles.outerBezel}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Inner bezel for depth with circular gradient */}
        <LinearGradient
          colors={[
            '#2a2a2a', 
            '#2a2a2a',
            '#1a1a1a',
            '#2a2a2a',
            '#2a2a2a'  
          ]}
          style={styles.innerBezel}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        >
          {/* LCD Display Container */}
          <View style={styles.displayContainer}>
            <View style={styles.display}>
              {children}
            </View>
            
            {/* Subtle vignette effect from glass depth */}
            <LinearGradient
              colors={[
                'rgba(0, 0, 0, 0.22)', 
                'rgba(0, 0, 0, 0.12)', 
                'rgba(0, 0, 0, 0.04)', 
                'rgba(0, 0, 0, 0.01)',
                'transparent'
              ]}
              style={styles.vignetteTop}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              pointerEvents="none"
            />
            <LinearGradient
              colors={[
                'rgba(0, 0, 0, 0.22)', 
                'rgba(0, 0, 0, 0.12)', 
                'rgba(0, 0, 0, 0.04)', 
                'rgba(0, 0, 0, 0.01)',
                'transparent'
              ]}
              style={styles.vignetteLeft}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              pointerEvents="none"
            />
            <LinearGradient
              colors={[
                'transparent',
                'rgba(0, 0, 0, 0.01)',
                'rgba(0, 0, 0, 0.04)', 
                'rgba(0, 0, 0, 0.12)', 
                'rgba(0, 0, 0, 0.22)'
              ]}
              style={styles.vignetteRight}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              pointerEvents="none"
            />
            <LinearGradient
              colors={[
                'transparent',
                'rgba(0, 0, 0, 0.01)',
                'rgba(0, 0, 0, 0.04)', 
                'rgba(0, 0, 0, 0.12)', 
                'rgba(0, 0, 0, 0.22)'
              ]}
              style={styles.vignetteBottom}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              pointerEvents="none"
            />
          </View>
        </LinearGradient>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    margin: 16,
    marginTop: 100,
    height: '45%',
    borderRadius: 20,
    // Outer shadow for device depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  outerBezel: {
    flex: 1,
    borderRadius: 20,
    padding: 4,
  },
  innerBezel: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
  },
  displayContainer: {
    flex: 1,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
    // Inner shadow for recessed look
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  display: {
    backgroundColor: '#8B9D7F',
    flex: 1,
    borderWidth: 1,
    borderColor: '#6B7D5F',
  },
  // Subtle vignette gradients for natural depth effect
  vignetteTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  vignetteLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 50,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  vignetteRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 50,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  vignetteBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
});
