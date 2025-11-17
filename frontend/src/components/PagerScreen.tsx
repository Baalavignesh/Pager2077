import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';

interface PagerScreenProps {
  title?: string;
  children: React.ReactNode;
  scrollable?: boolean;
}

/**
 * Base screen component for all pager screens
 * Provides consistent LCD screen styling across all screens
 * Individual screens should only handle content and functionality
 * 
 * ALL screen UI styling (fonts, sizes, spacing) is defined here
 */
export const PagerScreen: React.FC<PagerScreenProps> = ({ 
  title, 
  children, 
  scrollable = false 
}) => {

  // Generate realistic LCD scanline effect with 3-color pattern
  const renderScanlines = () => {
    const lines: React.ReactElement[] = [];
    const totalLines = 300; // More lines for tighter effect
    
    for (let i = 0; i < totalLines; i++) {
      // 3-color pattern for realistic LCD pixel grid
      let opacity;
      const pattern = i % 3;
      if (pattern === 0) {
        opacity = 0.12; // Darker line (more visible)
      } else if (pattern === 1) {
        opacity = 0.06; // Medium line
      } else {
        opacity = 0.02; // Lighter line
      }
      
      lines.push(
        <View
          key={i}
          style={{
            flex: 1, // Fill available space evenly
            backgroundColor: `rgba(0, 0, 0, ${opacity})`,
            width: '100%',
          }}
        />
      );
    }
    return lines;
  };

  // Second layer for vertical pixel grid effect
  const renderVerticalGrid = () => {
    const columns: React.ReactElement[] = [];
    const totalColumns = 150;
    
    for (let i = 0; i < totalColumns; i++) {
      const pattern = i % 3;
      let opacity;
      if (pattern === 0) {
        opacity = 0.04;
      } else if (pattern === 1) {
        opacity = 0.02;
      } else {
        opacity = 0.01;
      }
      
      columns.push(
        <View
          key={`v-${i}`}
          style={{
            flex: 1,
            backgroundColor: `rgba(0, 0, 0, ${opacity})`,
            height: '100%',
          }}
        />
      );
    }
    return columns;
  };

  const content = (
    <>
      {title && (
        <>
          <Text style={styles.title}>{title}</Text>
          <Text> </Text>
        </>
      )}
      {children}
    </>
  );

  if (scrollable) {
    return (
      <View style={styles.screenContainer}>
        <View style={styles.scanlines} pointerEvents="none">
          {renderScanlines()}
        </View>
        <View style={styles.verticalGrid} pointerEvents="none">
          {renderVerticalGrid()}
        </View>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.screenContainer}>
      <View style={styles.scanlines} pointerEvents="none">
        {renderScanlines()}
      </View>
      <View style={styles.verticalGrid} pointerEvents="none">
        {renderVerticalGrid()}
      </View>
      <View style={styles.content}>
        {content}
      </View>
    </View>
  );
};

/**
 * PagerText component for consistent text styling
 * Use this for all text within screens
 */
interface PagerTextProps {
  children: React.ReactNode;
  selected?: boolean;
  style?: object;
}

export const PagerText: React.FC<PagerTextProps> = ({ children, selected = false, style }) => {
  const flickerAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!selected) return;

    // Flicker effect for selected item only
    const flicker = () => {
      Animated.sequence([
        Animated.timing(flickerAnim, {
          toValue: 0.75,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(flickerAnim, {
          toValue: 0.85,
          duration: 35,
          useNativeDriver: true,
        }),
        Animated.timing(flickerAnim, {
          toValue: 1,
          duration: 70,
          useNativeDriver: true,
        }),
      ]).start();
    };

    // Flicker every 2 seconds
    const interval = setInterval(() => {
      flicker();
    }, 2000);

    return () => clearInterval(interval);
  }, [selected, flickerAnim]);

  if (selected) {
    return (
      <Animated.Text style={[styles.text, styles.textSelected, style, { opacity: flickerAnim }]}>
        {children}
      </Animated.Text>
    );
  }

  return (
    <Text style={[styles.text, style]}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  scanlines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'column',
    zIndex: 1,
    justifyContent: 'space-between',
  },
  verticalGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    zIndex: 1,
    justifyContent: 'space-between',
  },
  content: {
    position: 'relative',
    zIndex: 2,
    padding: 12,
  },
  title: {
    fontFamily: 'Chicago',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1a2618',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  text: {
    fontFamily: 'Chicago',
    fontSize: 14,
    fontWeight: '700',
    color: '#1a2618',
    letterSpacing: 1.5,
    lineHeight: 20,
    paddingHorizontal: 4,
    margin: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  textSelected: {
    color: '#8B9D7F',
    backgroundColor: '#1a2618',
    padding: 6,
  },
});
