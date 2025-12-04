import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';

/**
 * PagerDisplayGame - A wrapper component for game screens
 * Provides consistent LCD styling that matches PagerScreen typography
 * 
 * This component is designed to be used inside PagerDisplay and provides:
 * - Consistent padding and layout
 * - Scanline effects (horizontal and vertical grid)
 * - Typography styles that match PagerScreen exactly
 */

interface PagerDisplayGameProps {
  children: React.ReactNode;
}

// Shared typography constants - must match PagerScreen exactly
export const GAME_TYPOGRAPHY = {
  // Title text (e.g., "SNAKE", "TETRIS")
  title: {
    fontFamily: 'Chicago',
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#1a2618',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  // Score/stats text
  score: {
    fontFamily: 'Chicago',
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#1a2618',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  // Labels (e.g., "NEXT", "LVL", "LNS")
  label: {
    fontFamily: 'Chicago',
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#3d4d38',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  // Control hints (e.g., "2=UP 4=LEFT...")
  controlHint: {
    fontFamily: 'Chicago',
    fontSize: 8,
    fontWeight: '700' as const,
    color: '#3d4d38',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  // Status text (e.g., "PRESS SELECT TO START", "GAME OVER")
  status: {
    fontFamily: 'Chicago',
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#1a2618',
    letterSpacing: 1.5,
    textAlign: 'center' as const,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  // Instructions text
  instructions: {
    fontFamily: 'Chicago',
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#3d4d38',
    letterSpacing: 1,
    textAlign: 'center' as const,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
};

// Shared color constants for game grids
// Note: PagerDisplay LCD background is #8B9D7F
export const GAME_COLORS = {
  // Grid background - slightly lighter than LCD (#8B9D7F) for visual separation
  gridBackground: '#9BAD8F',
  // Grid border
  gridBorder: '#3d3d3d',
  // Active/head cells (dark green)
  activeCell: '#1a2618',
  // Locked/body cells (medium green)
  lockedCell: '#3d4d38',
  // Ghost piece (transparent dark)
  ghostCell: 'rgba(26, 38, 24, 0.25)',
  // Cell border
  cellBorder: 'rgba(0,0,0,0.1)',
  // Overlay background - matches PagerDisplay LCD background (#8B9D7F)
  overlayBackground: 'rgba(139, 157, 127, 0.98)',
  // Header/controls border
  sectionBorder: '#3d3d3d',
};

// Scanline configuration - matches PagerScreen for LCD pixel grid effect
const SCANLINE_CONFIG = {
  horizontalCount: 300,
  verticalCount: 150,
  // 3-color pattern opacities for realistic LCD effect
  horizontalOpacity: [0.12, 0.06, 0.02] as const,
  verticalOpacity: [0.04, 0.02, 0.01] as const,
};

export const PagerDisplayGame: React.FC<PagerDisplayGameProps> = ({ children }) => {
  // Memoize scanlines since they're static and expensive to render
  const scanlines = useMemo(() => {
    const lines: React.ReactElement[] = [];
    for (let i = 0; i < SCANLINE_CONFIG.horizontalCount; i++) {
      const opacity = SCANLINE_CONFIG.horizontalOpacity[i % 3];
      lines.push(
        <View
          key={i}
          style={{
            flex: 1,
            backgroundColor: `rgba(0, 0, 0, ${opacity})`,
            width: '100%',
          }}
        />
      );
    }
    return lines;
  }, []);

  // Memoize vertical grid since it's static
  const verticalGrid = useMemo(() => {
    const columns: React.ReactElement[] = [];
    for (let i = 0; i < SCANLINE_CONFIG.verticalCount; i++) {
      const opacity = SCANLINE_CONFIG.verticalOpacity[i % 3];
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
  }, []);

  return (
    <View style={styles.container}>
      {/* Scanline overlay */}
      <View style={styles.scanlines} pointerEvents="none">
        {scanlines}
      </View>
      {/* Vertical grid overlay */}
      <View style={styles.verticalGrid} pointerEvents="none">
        {verticalGrid}
      </View>
      {/* Game content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
    flex: 1,
    position: 'relative',
    zIndex: 2,
    padding: 12,
  },
});
