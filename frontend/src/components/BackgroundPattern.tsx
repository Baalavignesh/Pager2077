import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Gyroscope } from 'expo-sensors';

interface Particle {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  flickerAnim: Animated.Value;
}

export const BackgroundPattern: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const offsetX = useRef(new Animated.Value(0)).current;
  const offsetY = useRef(new Animated.Value(0)).current;

  // Generate static particles once with fixed positions
  useEffect(() => {
    const staticParticles: Particle[] = [];
    const count = 180; // More particles
    
    for (let i = 0; i < count; i++) {
      staticParticles.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2.5 + 2, // Larger: 2-4.5px
        baseOpacity: Math.random() * 0.4 + 0.4, // More visible: 0.4-0.8
        flickerAnim: new Animated.Value(1),
      });
    }
    
    setParticles(staticParticles);
  }, []);

  // Gyroscope parallax effect
  useEffect(() => {
    Gyroscope.setUpdateInterval(100);
    
    const subscription = Gyroscope.addListener((gyroscopeData) => {
      // Subtle parallax movement based on phone tilt
      // Swap and invert axes for correct movement
      const { x, y } = gyroscopeData;
      
      Animated.parallel([
        Animated.spring(offsetX, {
          toValue: -y * 15, // Use -y for horizontal (inverted)
          useNativeDriver: true,
          friction: 8,
          tension: 10,
        }),
        Animated.spring(offsetY, {
          toValue: x * 15, // Use x for vertical
          useNativeDriver: true,
          friction: 8,
          tension: 10,
        }),
      ]).start();
    });

    return () => subscription && subscription.remove();
  }, [offsetX, offsetY]);

  // Animate individual particle flicker
  useEffect(() => {
    if (particles.length === 0) return;

    const animations = particles.map((particle) => {
      const flicker = () => {
        Animated.sequence([
          Animated.timing(particle.flickerAnim, {
            toValue: Math.random() * 0.5 + 0.5, // 0.5-1.0
            duration: 300 + Math.random() * 400, // 300-700ms
            useNativeDriver: true,
          }),
          Animated.timing(particle.flickerAnim, {
            toValue: 1,
            duration: 300 + Math.random() * 400,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Random delay before next flicker
          setTimeout(flicker, Math.random() * 1000);
        });
      };
      
      // Start with random delay
      setTimeout(flicker, Math.random() * 2000);
      
      return particle.flickerAnim;
    });

    return () => {
      animations.forEach(anim => anim.stopAnimation());
    };
  }, [particles]);

  // Subtle pulse animation
  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, [fadeAnim]);

  return (
    <View style={styles.container}>
      {/* Diagonal stripe pattern background */}
      <View style={styles.stripePattern} />
      
      {/* Animated static layer on top */}
      <Animated.View 
        style={[
          styles.staticLayer,
          { 
            opacity: fadeAnim,
            transform: [
              { translateX: offsetX },
              { translateY: offsetY },
            ],
          }
        ]}
      >
        {/* Scanline effect */}
        <View style={styles.scanlines} />
        
        {/* Static noise */}
        <View style={styles.staticContainer}>
          {particles.map((particle, index) => (
            <Animated.View
              key={`static-${index}`}
              style={[
                styles.staticParticle,
                {
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  width: particle.size,
                  height: particle.size,
                  opacity: Animated.multiply(particle.flickerAnim, particle.baseOpacity),
                },
              ]}
            />
          ))}
        </View>
        
        {/* Subtle grid overlay */}
        <View style={styles.gridOverlay} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  stripePattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1a1a1a',
    // Create diagonal stripe pattern using border
    borderWidth: 0,
    opacity: 0.3,
    // Simulate stripes with shadow
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
  },
  staticLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scanlines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    opacity: 0.5,
  },
  staticContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.35,
  },
  staticParticle: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    borderRadius: 1,
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
    opacity: 0.4,
  },
});
