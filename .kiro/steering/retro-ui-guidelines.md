---
inclusion: fileMatch
fileMatchPattern: "frontend/src/**/*.tsx"
---

# Retro UI Guidelines for Pager2077

This steering document is automatically included when working on frontend UI components.

## 90s Pager Aesthetic Rules

### Visual Style
- **90s Pager LCD Display**: Greenish LCD (#8B9D7F) with dual-layer scanlines
- **Pixelated Font**: Chicago font (pixChicago.ttf) for authentic retro look
- **Metallic Buttons**: 3D gradient buttons with 6 variants, press animations, and shine effects
- **Glossy Bezel**: Single-piece nested gradient frame with 3D lifted appearance
- **LCD Scanlines**: 300 horizontal + 150 vertical lines for realistic pixel matrix
- **Flicker Animation**: Subtle opacity pulse every 2 seconds mimicking LCD refresh
- **Animated Background**: Static noise with gyroscope parallax effect
- **Edge Vignettes**: Smooth gradients simulating glass depth

### Component Styling Checklist

When creating or modifying UI components:

- [ ] Use PagerScreen wrapper for all screens
- [ ] Use PagerText for consistent text styling
- [ ] fontFamily: 'Chicago' for all text
- [ ] Let PagerScreen handle LCD styling (scanlines, fonts, spacing)
- [ ] Focus screen components on functionality, not styling
- [ ] Add screen-specific styles only when necessary

### New Components

**NumPad** - Phone numpad-style navigation interface
- 5x3 grid layout with dark background (#1a1a1a)
- Top row: Call-End icon (left, reject/back), Circle icon (center, up nav), Call icon (right, accept/select)
- Uses MaterialIcons from @expo/vector-icons for call/call-end icons
- Number rows: 1-9 with letter labels (abc, def, ghi, jkl, mno, pqrs, tuv, wxyz)
- Bottom row: *, 0, # symbols
- Navigation mapping: 2 (up), 4 (left), 5 (menu), 6 (right), 8 (down)
- Grey text (#888888) with darker grey on press (#0a0a0a background)
- Minimal borders (0.5px) between buttons
- Press animation: background color change only
- Haptic and audio feedback on button press (configurable via soundEnabled/vibrateEnabled props)

**ChatNumPad** - T9 text input numpad interface
- Same 5x3 grid layout and design as NumPad
- **Key difference**: All number keys (0-9) used for T9 multi-tap text entry
- Top row: Back icon (left), Circle icon (center, select/confirm character), Call icon (right, submit)
- Number keys 1-9: Multi-tap cycles through characters (letters first, then number)
  - 1: 1 only
  - 2: a, b, c, 2
  - 3: d, e, f, 3
  - 4: g, h, i, 4
  - 5: j, k, l, 5
  - 6: m, n, o, 6
  - 7: p, q, r, s, 7
  - 8: t, u, v, 8
  - 9: w, x, y, z, 9
- Key 0: Cycles through space and 0
- Key #: Backspace (delete last character)
- Key *: Menu/Home action
- Center circle icon: Confirm current character and move cursor to next position
- No navigation keys - all keys used for text input
- Same haptic and audio feedback system
- Use for name entry, chat messages, and any text input screens

**PagerBody** - Container for NumPad interface
- Wraps NumPad component with metallic frame styling
- Rounded corners with proportional bottom radius (borderBottomEndRadius: 60) for organic curved shape
- Shadow effects for depth and dimension
- Passes through soundEnabled and vibrateEnabled settings to NumPad
- Default values: soundEnabled=true, vibrateEnabled=true
- Props interface includes all NumPad navigation callbacks plus settings

**ChatPagerBody** - Container for ChatNumPad interface
- Wraps ChatNumPad component with metallic frame styling
- Identical design to PagerBody (full-height flex container)
- Rounded corners with proportional bottom radius (borderBottomEndRadius: 60) for organic curved shape
- Shadow effects for depth and dimension
- Passes through soundEnabled and vibrateEnabled settings to ChatNumPad
- Default values: soundEnabled=true, vibrateEnabled=true
- Props interface includes all ChatNumPad navigation callbacks plus settings
- Use for messaging/chat screens where text input is primary function

**BatteryIndicator** - Real-time battery status display
- Shows 0-4 bars based on battery level (25% per bar)
- Blinks when charging using Animated API
- Compact size (26x13px) for top-right corner placement
- Uses expo-battery for native battery access
- Automatically updates every 30 seconds

### Friends Management Screens

**FriendsListScreen** - Main friends list view
- Shows "ADD FRIEND" as first menu item
- Shows "REQUESTS (count)" if pending requests exist
- Displays friends with 6-digit codes and online (●) / offline (○) status indicators
- Empty state message when no friends
- Divider line between menu and friends list

**AddFriendScreen** - Add friend with 6-digit number entry
- Simple 6-digit number input using numpad
- All number keys (0-9, including 2/4/5/6/8) enter digits
- # key acts as backspace to remove last digit
- Call button (top right icon) sends friend request when 6 digits entered
- Visual feedback: "SENDING..." state during API call
- Error handling with inline error messages
- Helper text: "CALL BUTTON: SEND" and "Backspace - #"
- BACK: Clear input and return to friends list
- MENU: Cancel and return to friends list

**FriendRequestsScreen** - View incoming friend requests
- Lists all pending requests with 6-digit codes
- SELECT: Navigate to confirmation screen
- Empty state when no pending requests

**FriendRequestConfirmationScreen** - Confirm accept/reject actions
- Displays request details with 6-digit code
- Two-button confirmation: "NO" (left) and "YES" (right)
- Navigation controls:
  - Up/Down (keys 2/8): Toggle between Yes and No
  - Left/Right (keys 4/6): Select No or Yes
  - SELECT (key 5): Confirm choice
  - BACK: Return to requests list without action
- Visual feedback: "PROCESSING..." state during API call
- Selection indicator: PagerText selected state (inverted colors)

### Settings Screens

**SettingsScreen** - Multi-view settings interface
- Main view with 4 menu items:
  - SOUND: ON/OFF toggle
  - VIBRATE: ON/OFF toggle
  - ABOUT: Navigate to about screen
  - HELP: Navigate to help screen
- Navigation: Up/Down (keys 2/8) to move selection
- SELECT (key 5): Toggle setting or navigate to sub-screen
- Selection indicator: '>' prefix on selected item
- Uses PagerText with selected prop for visual feedback

**SettingsScreen (About View)** - App information
- Displays app name, description, and features
- Multi-line text layout with spacers (8px height)
- Content: App description, messaging features, 6-digit code system
- BACK: Return to main settings view

**SettingsScreen (Help View)** - Control reference guide
- Lists all numpad controls and their functions
- Key mappings: * (home), 5 (select), 2 (up), 8 (down)
- Icon functions: Call icon (accept), Back icon (back)
- Multi-line layout with spacers for readability
- BACK: Return to main settings view

### Color Usage

- Greenish LCD background for authentic pager look
- Dark text on light background for high contrast
- Inverted colors for selected items
- Metallic gradient buttons with multiple color variants
- Colors defined in theme and component files

### Button States

- Use MetalButton component for gradient buttons
- Multiple color variants available (primary, error, default, etc.)
- Automatic press animations (scale and translateY)
- Shine effect on press
- PagerButton wrapper maps labels to appropriate variants

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

**Screen Components:**
```typescript
import { PagerScreen, PagerText } from '../components/PagerScreen';

export const MyScreen: React.FC<Props> = ({ items, selectedIndex }) => {
  return (
    <PagerScreen title="MY SCREEN">
      {items.map((item, index) => (
        <PagerText key={item.id} selected={index === selectedIndex}>
          {index === selectedIndex ? '>' : ' '} {item.label}
        </PagerText>
      ))}
    </PagerScreen>
  );
};
```

**Multi-View Screens:**
```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PagerScreen, PagerText } from '../components/PagerScreen';

interface MyScreenProps {
  currentView: 'main' | 'detail';
  selectedIndex: number;
}

export const MyScreen: React.FC<MyScreenProps> = ({ currentView, selectedIndex }) => {
  if (currentView === 'detail') {
    return (
      <PagerScreen title="DETAIL">
        <PagerText>DETAIL CONTENT</PagerText>
        <View style={styles.spacer} />
        <PagerText>MORE INFO HERE</PagerText>
      </PagerScreen>
    );
  }

  return (
    <PagerScreen title="MAIN">
      <PagerText selected={selectedIndex === 0}>
        {selectedIndex === 0 ? '>' : ' '} OPTION 1
      </PagerText>
    </PagerScreen>
  );
};

const styles = StyleSheet.create({
  spacer: {
    height: 8,
  },
});
```

**Rules:**
- ✅ Use PagerScreen wrapper for all screens
- ✅ Use PagerText for text content
- ✅ PagerScreen handles all LCD styling
- ✅ Add screen-specific styles only when needed (e.g., spacers)
- ✅ Use View with StyleSheet for layout helpers (spacers, dividers)
- ❌ Don't duplicate LCD styling in individual screens

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
