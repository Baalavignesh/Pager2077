---
inclusion: fileMatch
fileMatchPattern: "frontend/src/**/*.tsx"
---

# Retro UI Guidelines for Pager2077

This steering document is automatically included when working on frontend UI components.

## 90s Pager Aesthetic Rules

### Visual Style
- **Monochrome LCD Display**: Use only the defined color palette
- **Pixelated Look**: Custom 'MyPager' font for all text
- **Chunky Buttons**: Large, bulky buttons with thick borders (3px) and rounded corners (10px)
- **Physical Device Frame**: Display containers with thick borders (8px) and rounded corners (16px)
- **LCD Screen Elements**: Sharp corners (0px) for menu items and text
- **No Gradients**: Flat colors only
- **No Shadows**: Keep it flat and simple
- **Geometric Shapes**: Rectangles and rounded rectangles

### Component Styling Checklist

When creating or modifying UI components, ensure:

- [ ] Physical device elements (buttons, display frame): rounded corners (10-16px)
- [ ] LCD screen elements (menu items, text): sharp corners (0px)
- [ ] Border width: 8px for display frame, 3px for buttons, 2px for containers, 0px for body
- [ ] Colors from defined palette only
- [ ] Uppercase text for buttons and labels
- [ ] fontFamily: 'MyPager' for all text
- [ ] Spacing follows 8px grid (8, 12, 16, 20, 24, 32px)
- [ ] No smooth transitions (use stepped animations if needed)
- [ ] High contrast between foreground and background

### Color Usage

```typescript
// Direct color values (use in StyleSheet.create())
const COLORS = {
  // Main palette
  background: '#C7D3C0',      // LCD green-gray (main background)
  foreground: '#1A1A1A',      // Dark text/borders
  accent: '#2D4A2B',          // Dark green highlights
  disabled: '#8B9B88',        // Muted inactive
  online: '#009819ff',        // Green online status LED
  offline: '#FF4444',         // Red offline status LED
  
  // Component-specific
  displayBg: '#dadadaff',     // Light gray for display/body backgrounds
  buttonBg: '#4A4A4A',        // Dark gray for buttons
  buttonBorder: '#2A2A2A',    // Darker gray for button borders
  buttonText: '#E0E0E0',      // Light gray for button text
  selectedBg: '#1A1A1A',      // Dark background for selected items
  selectedText: '#9CB4A8',    // Light green text for selected items
};

// Or import from theme (for NativeBase components only)
import { useTheme } from 'native-base';
const { colors } = useTheme();
```

### Button States

```typescript
// Using StyleSheet.create() (preferred)
const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4A4A4A',
    borderWidth: 3,
    borderRadius: 10,
    borderColor: '#2A2A2A',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E0E0E0',
    fontFamily: 'MyPager',
  },
  actionButton: {
    width: 112,
  },
  navButton: {
    width: 60,
    marginHorizontal: 12,
  },
});

// Or with NativeBase (for complex components)
<Button
  borderRadius={10}
  borderWidth={3}
  borderColor="#2A2A2A"
  bg="#4A4A4A"
  _pressed={{
    transform: [{ scale: 0.95 }],
  }}
>
  <Text color="#E0E0E0" fontWeight="bold" textTransform="uppercase" fontFamily="MyPager">
    BUTTON TEXT
  </Text>
</Button>
```

### Typography

```typescript
// Headings and labels
<Text fontSize="lg" fontWeight="bold" color="foreground">
  HEADING TEXT
</Text>

// Hex codes and technical data
<Text fontFamily="mono" letterSpacing={2} fontSize="xl">
  A1B2C3D4
</Text>

// Body text
<Text fontSize="md" color="foreground">
  Regular text content
</Text>

// Small labels
<Text fontSize="xs" color="foreground" opacity={0.7}>
  SMALL LABEL
</Text>
```

### Layout Patterns

#### Container with Border
```typescript
<Box
  borderWidth={2}
  borderColor="foreground"
  bg="background"
  p={4}
>
  {/* Content */}
</Box>
```

#### Section Divider
```typescript
<Box
  borderBottomWidth={4}
  borderBottomColor="foreground"
  pb={4}
  mb={4}
>
  {/* Section content */}
</Box>
```

#### Pressable Area
```typescript
<Pressable
  onPress={handlePress}
  _pressed={{ bg: 'accent' }}
>
  <Box borderWidth={2} borderColor="foreground" p={3}>
    {/* Pressable content */}
  </Box>
</Pressable>
```

### Animation Guidelines

- **No smooth easing**: Use `linear` or stepped animations
- **Quick transitions**: Keep under 200ms
- **Scale effects**: Use `scale(0.95)` for button press
- **No fade effects**: Instant show/hide preferred
- **Blinking text**: For loading states (like old terminals)

### Status Indicators

```typescript
// Online/Offline dot
<Box
  w={3}
  h={3}
  borderRadius="full"
  bg={isOnline ? 'online' : 'offline'}
/>

// Status text
<Text
  fontSize="xs"
  color={isOnline ? 'online' : 'offline'}
  fontWeight="bold"
>
  {isOnline ? 'ONLINE' : 'OFFLINE'}
</Text>
```

### Input Fields

```typescript
<Input
  borderRadius={0}
  borderWidth={2}
  borderColor="foreground"
  bg="background"
  color="foreground"
  fontFamily="mono"
  fontSize="md"
  _focus={{
    borderColor: 'accent',
    bg: 'background',
  }}
  placeholder="ENTER HEX CODE"
  placeholderTextColor="disabled"
/>
```

### Loading States

```typescript
// Blinking text (retro terminal style)
<Text fontSize="md" color="foreground">
  LOADING...
</Text>

// Or pixelated spinner
<Box
  w={4}
  h={4}
  borderWidth={2}
  borderColor="foreground"
  // Add rotation animation
/>
```

### Error Messages

```typescript
<Box
  borderWidth={2}
  borderColor="foreground"
  bg="background"
  p={3}
>
  <Text fontSize="sm" color="foreground" textAlign="center">
    ERROR: {errorMessage}
  </Text>
</Box>
```

### Toast Notifications

```typescript
toast.show({
  description: 'ACTION COMPLETED',
  duration: 2000,
  placement: 'top',
  // Style to match retro theme
  style: {
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.foreground,
    borderRadius: 0,
  },
});
```

## Styling Approach

**IMPORTANT:** All components and screens must use `StyleSheet.create()` defined within the same file.

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const MyComponent: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Content</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderColor: '#1A1A1A',
    backgroundColor: '#9CB4A8',
    padding: 16,
  },
  text: {
    fontSize: 14,
    color: '#1A1A1A',
  },
});
```

**Rules:**
- ❌ No centralized style files
- ❌ No importing styles from other files
- ✅ Each component has its own StyleSheet.create()
- ✅ Styles defined at the bottom of the component file
- ✅ Use React Native core components (View, Text, Pressable)

## Component Examples

### Retro Card
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const RetroCard: React.FC = () => {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>LABEL</Text>
      <Text style={styles.content}>CONTENT</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderColor: '#1A1A1A',
    backgroundColor: '#9CB4A8',
    padding: 16,
    marginBottom: 8,
  },
  label: {
    fontSize: 10,
    color: '#1A1A1A',
    opacity: 0.7,
    marginBottom: 4,
  },
  content: {
    fontSize: 18,
    fontFamily: 'monospace',
    color: '#1A1A1A',
  },
});
```

### Retro List Item
```typescript
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface RetroListItemProps {
  text: string;
  isSelected: boolean;
  onSelect: () => void;
}

export const RetroListItem: React.FC<RetroListItemProps> = ({ text, isSelected, onSelect }) => {
  return (
    <Pressable onPress={onSelect}>
      <View style={[styles.item, isSelected && styles.itemSelected]}>
        <Text style={[styles.text, isSelected && styles.textSelected]}>
          {text}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  item: {
    borderWidth: 2,
    borderColor: '#1A1A1A',
    backgroundColor: '#9CB4A8',
    padding: 12,
  },
  itemSelected: {
    borderWidth: 4,
    borderColor: '#2D4A2B',
    backgroundColor: '#2D4A2B',
  },
  text: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#1A1A1A',
  },
  textSelected: {
    color: '#9CB4A8',
  },
});
```

## Anti-Patterns to Avoid

❌ **Don't use:**
- Rounded corners (`borderRadius > 0`)
- Smooth gradients
- Drop shadows
- Blur effects
- Smooth easing functions
- Pastel or bright colors
- Thin borders (< 2px)
- Small fonts (< 10px)
- Lowercase button text

✅ **Do use:**
- Sharp corners
- Flat colors
- High contrast
- Thick borders
- Pixelated/monospace fonts
- Uppercase labels
- 8px grid spacing
- Geometric shapes

## Accessibility with Retro Style

Even with retro aesthetics, maintain accessibility:

- Ensure color contrast ratio meets WCAG standards (already high contrast)
- Add accessibility labels to all interactive elements
- Make touch targets at least 44x44px (chunky buttons help!)
- Support screen readers with proper labels
- Test with VoiceOver/TalkBack

## Reference Components

Look at these existing components for style reference:
- `PagerButton.tsx` - Button with 3D border effect
- `PagerDisplay.tsx` - LCD display container
- `StatusLEDs.tsx` - Status indicator dots
- `MainMenuScreen.tsx` - Menu with selection states
- `NavigationControls.tsx` - Navigation button layout

## When Adding New Components

1. Import React Native core components (View, Text, Pressable, StyleSheet)
2. Define component with TypeScript interface for props
3. Implement JSX with style references
4. Add `StyleSheet.create()` at the bottom of the file
5. Follow retro aesthetic rules:
   - Sharp corners (borderRadius: 0)
   - Thick borders (2-4px)
   - Monochrome colors (#1A1A1A, #9CB4A8, #2D4A2B)
   - 8px grid spacing
6. Test on both iOS and Android
7. Verify accessibility

**Template:**
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MyComponentProps {
  // Props
}

export const MyComponent: React.FC<MyComponentProps> = (props) => {
  return (
    <View style={styles.container}>
      {/* Component content */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Styles here
  },
});
```

Remember: The goal is to look like a 90s electronic device display - think pagers, early PDAs, and monochrome LCD screens!
