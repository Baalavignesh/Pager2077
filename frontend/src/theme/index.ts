import { extendTheme } from 'native-base';

// Retro 90s Pager Color Palette (Monochrome)
const colors = {
  background: '#C7D3C0',      // Pager LCD green-gray
  foreground: '#1A1A1A',      // Dark text/borders
  accent: '#2D4A2B',          // Darker green for highlights
  disabled: '#8B9B88',        // Muted for inactive states
  online: '#2D4A2B',          // Online indicator
  offline: '#5A5A5A',         // Offline indicator
};

// Retro Theme Configuration
export const retroTheme = extendTheme({
  colors: {
    primary: {
      50: colors.background,
      100: colors.background,
      200: colors.background,
      300: colors.accent,
      400: colors.accent,
      500: colors.accent,
      600: colors.foreground,
      700: colors.foreground,
      800: colors.foreground,
      900: colors.foreground,
    },
    background: colors.background,
    foreground: colors.foreground,
    accent: colors.accent,
    disabled: colors.disabled,
    online: colors.online,
    offline: colors.offline,
  },
  fonts: {
    heading: 'MyPager',
    body: 'MyPager',
    mono: 'MyPager',
  },
  fontSizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 18,
    xl: 24,
  },
  space: {
    // 8px grid system
    1: 8,
    2: 16,
    3: 24,
    4: 32,
    5: 40,
    6: 48,
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: 0,           // Sharp corners
        borderWidth: 4,            // Thick borders
        _text: {
          fontWeight: 'bold',
          textTransform: 'uppercase',
        },
      },
      defaultProps: {
        size: 'lg',
      },
      variants: {
        solid: {
          bg: 'accent',
          borderColor: 'foreground',
          _text: {
            color: 'background',
          },
          _pressed: {
            transform: [{ scale: 0.95 }],
            bg: 'foreground',
          },
          _disabled: {
            bg: 'disabled',
            borderColor: 'disabled',
            opacity: 0.6,
          },
        },
      },
    },
    Box: {
      baseStyle: {
        borderRadius: 0,  // Sharp corners for all boxes
      },
    },
    Text: {
      baseStyle: {
        color: 'foreground',
        fontFamily: 'MyPager',
      },
      variants: {
        pixelated: {
          fontFamily: 'MyPager',
          letterSpacing: 1,
        },
      },
    },
  },
  config: {
    initialColorMode: 'light',
  },
});