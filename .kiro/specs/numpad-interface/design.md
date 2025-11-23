# NumPad Interface Design Document

## Overview

This design document outlines the implementation of a custom phone numpad-style interface to replace the circular control wheel in the Pager2077 app. The numpad will provide intuitive navigation using familiar phone keypad conventions while maintaining the retro aesthetic with a flat, minimalist black-and-white design.

## Architecture

### Component Hierarchy

```
PagerBody (existing)
└── NumPad (new - replaces ControlWheel)
    ├── TopActionRow
    │   ├── BackButton (-)
    │   ├── MenuButton (rounded square)
    │   └── SelectButton (-)
    ├── PlaceholderRow
    │   ├── RecordButton (∩) [disabled]
    │   └── StopButton (-) [disabled]
    └── NumberGrid
        ├── Row 1: [1] [2 abc] [3 def]
        ├── Row 2: [4 ghi] [5 jkl] [6 mno]
        ├── Row 3: [7 pqrs] [8 tuv] [9 wxyz]
        └── Row 4: [* +] [0 _] [# ⇧⇩]
```

### Component Responsibilities

**NumPad Component:**
- Renders the complete numpad interface
- Manages button press interactions
- Delegates navigation actions to parent callbacks
- Handles visual feedback for button presses
- Maintains consistent styling across all buttons

**PagerBody Component:**
- Provides container and metallic frame styling
- Passes navigation callbacks to NumPad
- Maintains logo and overall layout structure

## Components and Interfaces

### NumPad Component Interface

```typescript
interface NumPadProps {
  // Existing callbacks (matching ControlWheel)
  onSelect: () => void;
  onBack: () => void;
  onNavigateUp: () => void;
  onNavigateDown: () => void;
  onMenu: () => void;
  
  // New callbacks for horizontal navigation
  onNavigateLeft?: () => void;
  onNavigateRight?: () => void;
}

interface NumPadButton {
  number: string;
  letters?: string;
  symbol?: string;
  onPress?: () => void;
  disabled?: boolean;
  type: 'number' | 'action' | 'placeholder';
}
```

### Button Configuration

The numpad will use a data-driven approach with button configurations:

```typescript
const topActionButtons: NumPadButton[] = [
  { symbol: '−', onPress: onBack, type: 'action' },
  { symbol: '⬜', onPress: onMenu, type: 'action' },
  { symbol: '−', onPress: onSelect, type: 'action' }
];

const placeholderButtons: NumPadButton[] = [
  { symbol: '∩', disabled: true, type: 'placeholder' },
  { symbol: '−', disabled: true, type: 'placeholder' }
];

const numberButtons: NumPadButton[][] = [
  [
    { number: '1', letters: '' },
    { number: '2', letters: 'abc', onPress: onNavigateUp },
    { number: '3', letters: 'def' }
  ],
  [
    { number: '4', letters: 'ghi', onPress: onNavigateLeft },
    { number: '5', letters: 'jkl', onPress: onMenu },
    { number: '6', letters: 'mno', onPress: onNavigateRight }
  ],
  [
    { number: '7', letters: 'pqrs' },
    { number: '8', letters: 'tuv', onPress: onNavigateDown },
    { number: '9', letters: 'wxyz' }
  ],
  [
    { number: '*', letters: '+' },
    { number: '0', letters: '_' },
    { number: '#', letters: '⇧⇩' }
  ]
];
```

## Data Models

### Button State

```typescript
interface ButtonState {
  isPressed: boolean;
  isDisabled: boolean;
}
```

### Style Configuration

```typescript
interface NumPadStyles {
  button: {
    width: number;
    height: number;
    borderRadius: number;
    backgroundColor: string;
    borderWidth: number;
    borderColor: string;
  };
  buttonPressed: {
    opacity: number;
    transform: [{ scale: number }];
  };
  buttonDisabled: {
    opacity: number;
  };
  spacing: {
    horizontal: number;
    vertical: number;
    rowGap: number;
  };
}
```

## Visual Design Specifications

### Color Palette

```typescript
const colors = {
  buttonBackground: '#FFFFFF',
  buttonBorder: '#E0E0E0',
  textPrimary: '#000000',
  textSecondary: '#666666',
  disabledOpacity: 0.3,
  pressedOpacity: 0.7
};
```

### Typography

```typescript
const typography = {
  number: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary
  },
  letters: {
    fontSize: 10,
    fontWeight: '400',
    color: colors.textSecondary,
    letterSpacing: 1
  },
  symbol: {
    fontSize: 20,
    fontWeight: '500',
    color: colors.textPrimary
  }
};
```

### Button Dimensions

```typescript
const dimensions = {
  buttonWidth: 80,
  buttonHeight: 60,
  topButtonHeight: 50,
  placeholderButtonHeight: 40,
  borderRadius: 10,
  horizontalSpacing: 12,
  verticalSpacing: 10,
  rowGap: 16
};
```

### Layout Structure

```
┌─────────────────────────────────────┐
│  PagerBody Container                │
│  ┌───────────────────────────────┐  │
│  │ Top Action Row                │  │
│  │  [−]    [⬜]    [−]           │  │
│  │  BACK   MENU   SELECT         │  │
│  ├───────────────────────────────┤  │
│  │ Placeholder Row               │  │
│  │     [∩]      [−]              │  │
│  │   RECORD    STOP              │  │
│  ├───────────────────────────────┤  │
│  │ Number Grid                   │  │
│  │  [1]   [2]   [3]              │  │
│  │        abc   def               │  │
│  │  [4]   [5]   [6]              │  │
│  │  ghi   jkl   mno              │  │
│  │  [7]   [8]   [9]              │  │
│  │  pqrs  tuv   wxyz             │  │
│  │  [*]   [0]   [#]              │  │
│  │   +     _    ⇧⇩               │  │
│  └───────────────────────────────┘  │
│  PAGER 2077 (logo)                  │
└─────────────────────────────────────┘
```

## Component Implementation Details

### NumPad Component Structure

```typescript
export const NumPad: React.FC<NumPadProps> = ({
  onSelect,
  onBack,
  onNavigateUp,
  onNavigateDown,
  onMenu,
  onNavigateLeft,
  onNavigateRight
}) => {
  return (
    <View style={styles.container}>
      {/* Top Action Row */}
      <View style={styles.topActionRow}>
        <NumPadButton {...backButton} />
        <NumPadButton {...menuButton} />
        <NumPadButton {...selectButton} />
      </View>
      
      {/* Placeholder Row */}
      <View style={styles.placeholderRow}>
        <NumPadButton {...recordButton} />
        <NumPadButton {...stopButton} />
      </View>
      
      {/* Number Grid */}
      <View style={styles.numberGrid}>
        {numberButtons.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.numberRow}>
            {row.map((button, colIndex) => (
              <NumPadButton key={colIndex} {...button} />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};
```

### NumPadButton Sub-Component

```typescript
interface NumPadButtonProps {
  number?: string;
  letters?: string;
  symbol?: string;
  onPress?: () => void;
  disabled?: boolean;
  type: 'number' | 'action' | 'placeholder';
}

const NumPadButton: React.FC<NumPadButtonProps> = ({
  number,
  letters,
  symbol,
  onPress,
  disabled,
  type
}) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        type === 'action' && styles.actionButton,
        type === 'placeholder' && styles.placeholderButton,
        pressed && !disabled && styles.buttonPressed,
        disabled && styles.buttonDisabled
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      {symbol ? (
        <Text style={styles.symbol}>{symbol}</Text>
      ) : (
        <View style={styles.buttonContent}>
          <Text style={styles.number}>{number}</Text>
          {letters && <Text style={styles.letters}>{letters}</Text>}
        </View>
      )}
    </Pressable>
  );
};
```

## Interaction Design

### Button Press Feedback

1. **Visual Feedback:**
   - Opacity reduces to 0.7 on press
   - Subtle scale animation (0.95) for tactile feel
   - Immediate response (no delay)

2. **Disabled State:**
   - Opacity reduced to 0.3
   - No press interaction
   - Maintains visual consistency

3. **Active Navigation Keys:**
   - Keys 2, 4, 5, 6, 8 have active press handlers
   - Other number keys (1, 3, 7, 9, *, 0, #) are pressable but have no action (future functionality)

### Navigation Mapping

| Button | Action | Callback |
|--------|--------|----------|
| 2 | Navigate Up | onNavigateUp |
| 4 | Navigate Left | onNavigateLeft |
| 5 | Home/Menu | onMenu |
| 6 | Navigate Right | onNavigateRight |
| 8 | Navigate Down | onNavigateDown |
| Top Left (-) | Back | onBack |
| Top Center (⬜) | Menu | onMenu |
| Top Right (-) | Select | onSelect |

## Integration with PagerBody

### Updated PagerBody Props

```typescript
interface PagerBodyProps {
  onSelect: () => void;
  onBack: () => void;
  onNavigateUp: () => void;
  onNavigateDown: () => void;
  onMenu: () => void;
  onNavigateLeft?: () => void;  // New optional prop
  onNavigateRight?: () => void; // New optional prop
}
```

### PagerBody Changes

1. **Import Change:**
   ```typescript
   // Remove: import { ControlWheel } from './ControlWheel';
   // Add: import { NumPad } from './NumPad';
   ```

2. **Component Replacement:**
   ```typescript
   // Replace ControlWheel with NumPad
   <NumPad
     onSelect={onSelect}
     onBack={onBack}
     onNavigateUp={onNavigateUp}
     onNavigateDown={onNavigateDown}
     onMenu={onMenu}
     onNavigateLeft={onNavigateLeft}
     onNavigateRight={onNavigateRight}
   />
   ```

3. **Layout Adjustments:**
   - Increase contentArea padding if needed
   - Adjust logo position to accommodate taller numpad
   - Maintain existing metallic frame styling

## Styling Strategy

### StyleSheet Organization

```typescript
const styles = StyleSheet.create({
  // Container
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10
  },
  
  // Rows
  topActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
    paddingHorizontal: 20
  },
  
  placeholderRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    marginBottom: 16
  },
  
  numberGrid: {
    gap: 10
  },
  
  numberRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center'
  },
  
  // Buttons
  button: {
    width: 80,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  
  actionButton: {
    width: 70,
    height: 50
  },
  
  placeholderButton: {
    width: 60,
    height: 40
  },
  
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }]
  },
  
  buttonDisabled: {
    opacity: 0.3
  },
  
  // Text
  buttonContent: {
    alignItems: 'center',
    gap: 2
  },
  
  number: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000'
  },
  
  letters: {
    fontSize: 10,
    fontWeight: '400',
    color: '#666666',
    letterSpacing: 1,
    textTransform: 'lowercase'
  },
  
  symbol: {
    fontSize: 20,
    fontWeight: '500',
    color: '#000000'
  }
});
```

## Error Handling

### Missing Callbacks

- Optional callbacks (onNavigateLeft, onNavigateRight) should be checked before invocation
- Provide no-op fallback if callback is undefined

```typescript
const handlePress = (callback?: () => void) => {
  if (callback) {
    callback();
  }
};
```

### Button Press Errors

- Wrap onPress handlers in try-catch to prevent crashes
- Log errors to console in development mode
- Provide visual feedback even if callback fails

## Testing Strategy

### Unit Tests

1. **Component Rendering:**
   - NumPad renders all buttons correctly
   - Button labels and symbols display properly
   - Disabled buttons have correct styling

2. **Interaction Tests:**
   - Button presses trigger correct callbacks
   - Disabled buttons don't trigger callbacks
   - Visual feedback applies on press

3. **Integration Tests:**
   - NumPad integrates with PagerBody correctly
   - Navigation callbacks propagate to screens
   - Layout adapts to different screen sizes

### Manual Testing Checklist

- [ ] All buttons render with correct labels
- [ ] Navigation keys (2, 4, 5, 6, 8) trigger correct actions
- [ ] Top action buttons (Back, Menu, Select) work correctly
- [ ] Placeholder buttons are disabled and styled correctly
- [ ] Button press feedback is smooth and responsive
- [ ] Layout fits within PagerBody container
- [ ] Logo remains visible below numpad
- [ ] Styling matches reference image aesthetic

## Performance Considerations

### Optimization Strategies

1. **Memoization:**
   - Use React.memo for NumPadButton to prevent unnecessary re-renders
   - Memoize button configurations to avoid recreation on each render

2. **Event Handlers:**
   - Define button press handlers outside render to maintain referential equality
   - Use useCallback for callback props if parent re-renders frequently

3. **Layout:**
   - Use flexbox for efficient layout calculations
   - Avoid nested views where possible
   - Use StyleSheet.create for style optimization

## Accessibility

### Touch Targets

- All buttons meet minimum 44x44px touch target size
- Adequate spacing prevents accidental presses
- Buttons are large enough for users with motor impairments

### Visual Feedback

- Clear pressed state for all interactive buttons
- Disabled state is visually distinct
- High contrast between text and background (black on white)

## Future Enhancements

### Phase 2 Features

1. **Recording Functionality:**
   - Enable placeholder buttons
   - Implement record/stop callbacks
   - Add visual recording indicator

2. **Haptic Feedback:**
   - Add vibration on button press
   - Different patterns for different button types

3. **Sound Effects:**
   - Optional button press sounds
   - Classic phone keypad tones

4. **Customization:**
   - Theme support (light/dark modes)
   - Adjustable button sizes
   - Custom button mappings

## Migration Path

### Step-by-Step Implementation

1. Create NumPad component with basic structure
2. Implement NumPadButton sub-component
3. Add button configurations and styling
4. Integrate with PagerBody (replace ControlWheel)
5. Update App.tsx to pass new optional callbacks
6. Test navigation across all screens
7. Remove ControlWheel component and related files
8. Update documentation and project standards

### Backward Compatibility

- Maintain existing callback interface (onSelect, onBack, etc.)
- New callbacks (onNavigateLeft, onNavigateRight) are optional
- Screens continue to work without modification
- Only PagerBody and App.tsx require updates

## Dependencies

### Required Packages

- react-native (existing)
- expo-linear-gradient (existing - for PagerBody frame)

### No New Dependencies

- Custom implementation requires no additional packages
- Uses only React Native core components
- Maintains lightweight bundle size
