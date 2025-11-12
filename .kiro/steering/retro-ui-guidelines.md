---
inclusion: fileMatch
fileMatchPattern: "frontend/src/**/*.tsx"
---

# Retro UI Guidelines for Pager2077

This steering document is automatically included when working on frontend UI components.

## 90s Pager Aesthetic Rules

### Visual Style
- **Monochrome LCD Display**: Use only the defined color palette
- **Pixelated Look**: Sharp edges, no anti-aliasing effects
- **Chunky Buttons**: Large, bulky buttons with thick borders
- **No Gradients**: Flat colors only
- **No Shadows**: Keep it flat and simple
- **Geometric Shapes**: Rectangles and squares, no organic shapes

### Component Styling Checklist

When creating or modifying UI components, ensure:

- [ ] `borderRadius: 0` (sharp corners)
- [ ] Border width: 2px for containers, 4px for buttons
- [ ] Colors from theme palette only
- [ ] Uppercase text for buttons and labels
- [ ] Monospace font for hex codes and technical data
- [ ] Spacing follows 8px grid (8, 16, 24, 32px)
- [ ] No smooth transitions (use stepped animations if needed)
- [ ] High contrast between foreground and background

### Color Usage

```typescript
// Import from theme
import { useTheme } from 'native-base';

const { colors } = useTheme();

// Use semantic colors:
colors.background  // LCD green-gray background
colors.foreground  // Dark text and borders
colors.accent      // Highlights and active states
colors.disabled    // Inactive/disabled states
colors.online      // Online status indicator
colors.offline     // Offline status indicator
```

### Button States

```typescript
// Default state
<Button
  borderRadius={0}
  borderWidth={4}
  borderColor="foreground"
  bg="accent"
>
  <Text color="background" fontWeight="bold" textTransform="uppercase">
    BUTTON TEXT
  </Text>
</Button>

// Pressed state
_pressed={{
  transform: [{ scale: 0.95 }],
  bg: 'foreground',
}}

// Disabled state
_disabled={{
  bg: 'disabled',
  borderColor: 'disabled',
  opacity: 0.6,
}}
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

## Component Examples

### Retro Card
```typescript
<Box
  borderWidth={2}
  borderColor="foreground"
  bg="background"
  p={4}
  mb={2}
>
  <Text fontSize="xs" color="foreground" opacity={0.7} mb={1}>
    LABEL
  </Text>
  <Text fontSize="lg" fontFamily="mono" color="foreground">
    CONTENT
  </Text>
</Box>
```

### Retro List Item
```typescript
<Pressable onPress={onSelect}>
  <Box
    borderWidth={isSelected ? 4 : 2}
    borderColor={isSelected ? 'accent' : 'foreground'}
    bg={isSelected ? 'accent' : 'background'}
    p={3}
  >
    <HStack justifyContent="space-between" alignItems="center">
      <Text
        fontSize="md"
        fontFamily="mono"
        color={isSelected ? 'background' : 'foreground'}
      >
        {text}
      </Text>
      <StatusIndicator />
    </HStack>
  </Box>
</Pressable>
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
- `HexCodeDisplay.tsx` - Tap-to-copy with retro styling
- `FriendList.tsx` - List with selection states
- `VoiceControls.tsx` - Button states and layouts
- `AddFriendButton.tsx` - Simple button styling

## When Adding New Components

1. Start with NativeBase base component
2. Override styles to match retro aesthetic
3. Remove any rounded corners
4. Add thick borders
5. Use theme colors
6. Test on both iOS and Android
7. Verify accessibility

Remember: The goal is to look like a 90s electronic device display - think pagers, early PDAs, and monochrome LCD screens!
