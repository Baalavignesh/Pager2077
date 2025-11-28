# Design Document

## Overview

This feature enhances the NumPad component with haptic and audio feedback to create a more immersive user experience. When users press any button on the numpad, they will receive immediate tactile feedback through device vibration and audio feedback through a click sound. This mimics the satisfying physical feedback of pressing buttons on real pager and phone devices.

The implementation consists of three main parts:
1. **Audio Service** - A reusable service for loading and playing sound effects
2. **Haptic Integration** - Integration of expo-haptics for tactile feedback
3. **NumPad Enhancement** - Modification of NumPadButton to trigger both feedback types

## Architecture

### Component Hierarchy

```
NumPad (parent component)
└── NumPadButton (child component - 15 instances)
    ├── Haptic Feedback (expo-haptics)
    ├── Audio Feedback (audioService)
    └── Visual Feedback (existing press state)
```

### Service Layer

```
audioService.ts
├── loadSound(soundId, assetPath) - Load audio file
├── playSound(soundId) - Play loaded sound
├── unloadSound(soundId) - Clean up audio resource
└── unloadAll() - Clean up all audio resources
```

### Data Flow

```
User Press → NumPadButton.handlePressIn()
                ├→ Trigger Haptics (async)
                ├→ Play Click Sound (async)
                ├→ Update Visual State (sync)
                └→ Execute onPress Callback (sync)
```

## Components and Interfaces

### Audio Service Interface

```typescript
// frontend/src/services/audioService.ts

interface AudioService {
  /**
   * Load a sound file from assets
   * @param soundId - Unique identifier for the sound
   * @param assetPath - Path to the audio file (e.g., require('../assets/click.mp3'))
   * @returns Promise that resolves when sound is loaded
   */
  loadSound(soundId: string, assetPath: any): Promise<void>;
  
  /**
   * Play a previously loaded sound
   * @param soundId - Identifier of the sound to play
   * @returns Promise that resolves when playback starts
   */
  playSound(soundId: string): Promise<void>;
  
  /**
   * Unload a specific sound to free memory
   * @param soundId - Identifier of the sound to unload
   */
  unloadSound(soundId: string): Promise<void>;
  
  /**
   * Unload all sounds
   */
  unloadAll(): Promise<void>;
}
```

### NumPadButton Enhancement

The existing `NumPadButton` component will be enhanced with:

```typescript
const handlePressIn = async () => {
  if (disabled) return;
  
  // Trigger feedback concurrently (non-blocking)
  triggerFeedback();
  
  // Update visual state
  setIsPressed(true);
};

const triggerFeedback = async () => {
  // Execute haptic and audio in parallel
  await Promise.allSettled([
    triggerHaptic(),
    playClickSound()
  ]);
};
```

### Haptic Feedback Integration

```typescript
import * as Haptics from 'expo-haptics';

const triggerHaptic = async () => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    console.warn('Haptic feedback failed:', error);
  }
};
```

## Data Models

### Sound Cache Structure

```typescript
type SoundCache = {
  [soundId: string]: {
    sound: Audio.Sound;
    isLoaded: boolean;
  }
};
```

### Audio Configuration

```typescript
const AUDIO_CONFIG = {
  shouldPlay: true,
  isLooping: false,
  volume: 0.6, // Reduced by 40% from 1.0 for more subtle feedback
  // Allow multiple instances to play simultaneously
  staysActiveInBackground: false,
  interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
  playsInSilentModeIOS: true,
  interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
  shouldDuckAndroid: false,
};
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Haptic feedback triggers for all enabled buttons

*For any* enabled NumPad button, when pressed, haptic feedback should be triggered using Expo Haptics.
**Validates: Requirements 1.1**

### Property 2: Haptic errors don't break functionality

*For any* button press, if haptic feedback fails, the button's onPress callback should still execute successfully.
**Validates: Requirements 1.3**

### Property 3: Haptic feedback precedes callback execution

*For any* button press, haptic feedback should be triggered before the button's onPress callback is executed.
**Validates: Requirements 1.4**

### Property 4: Disabled buttons don't trigger haptics

*For any* disabled NumPad button, pressing it should not trigger haptic feedback.
**Validates: Requirements 1.5**

### Property 5: Click sound plays for all enabled buttons

*For any* enabled NumPad button, when pressed, the click.mp3 audio file should be played.
**Validates: Requirements 2.1**

### Property 6: Audio errors don't break functionality

*For any* button press, if audio playback fails, the button's onPress callback should still execute successfully.
**Validates: Requirements 2.3**

### Property 7: Click sound precedes callback execution

*For any* button press, the click sound should be triggered before the button's onPress callback is executed.
**Validates: Requirements 2.4**

### Property 8: Disabled buttons don't play sounds

*For any* disabled NumPad button, pressing it should not play the click sound.
**Validates: Requirements 2.5**

### Property 9: Both feedback types trigger concurrently

*For any* enabled button press, both haptic feedback and click sound should be triggered in the same interaction.
**Validates: Requirements 3.1**

### Property 10: Feedback doesn't block callback

*For any* button press, the onPress callback should execute without waiting for haptic or audio feedback to complete.
**Validates: Requirements 3.2**

### Property 11: Partial feedback failure resilience

*For any* button press, if either haptic or audio feedback fails, the other feedback type and the onPress callback should still execute.
**Validates: Requirements 3.3**

### Property 12: Feedback completes within time limit

*For any* button press, all feedback operations (haptic and audio) should complete within 50 milliseconds.
**Validates: Requirements 3.5**

### Property 13: Sound caching prevents reloading

*For any* sound identifier, after loading once, subsequent plays should use the cached sound without reloading from assets.
**Validates: Requirements 4.3**

### Property 14: Rapid presses don't cut off sounds

*For any* sequence of rapid button presses, each press should play its click sound completely without cutting off previous sounds.
**Validates: Requirements 5.2**

### Property 15: Sounds play immediately without queuing

*For any* button press, the click sound should start playing immediately without being queued behind other sounds.
**Validates: Requirements 5.4**

### Property 16: Consistent haptic feedback across button types

*For any* two enabled buttons (regardless of type: number, action, or navigation), both should trigger the same haptic feedback style.
**Validates: Requirements 6.1**

### Property 17: Consistent audio feedback across button types

*For any* two enabled buttons (regardless of type), both should play the same click sound.
**Validates: Requirements 6.2**

### Property 18: Consistent feedback timing across buttons

*For any* enabled button, feedback should be triggered at the onPressIn event, not onPress or onPressOut.
**Validates: Requirements 6.3**

### Property 19: Visual feedback accompanies sensory feedback

*For any* button press, when haptic and audio feedback are triggered, the visual pressed state should also be set.
**Validates: Requirements 6.4**

### Property 20: Timing consistency across all buttons

*For any* two button presses, the time between press and feedback completion should be consistent (within 10ms variance).
**Validates: Requirements 6.5**

## Error Handling

### Haptic Feedback Errors

**Scenario**: Device doesn't support haptics or haptics permission is denied
- **Handling**: Wrap haptic calls in try-catch, log warning to console, continue execution
- **User Impact**: No haptic feedback, but audio and visual feedback still work
- **Recovery**: None needed - graceful degradation

### Audio Playback Errors

**Scenario**: Audio file fails to load or play
- **Handling**: Wrap audio calls in try-catch, log error to console, continue execution
- **User Impact**: No click sound, but haptic and visual feedback still work
- **Recovery**: Attempt to reload sound on next app launch

### Memory Pressure

**Scenario**: Device is low on memory
- **Handling**: Audio service unloads sounds when app backgrounds, reloads on foreground
- **User Impact**: Brief delay on first button press after returning to app
- **Recovery**: Automatic reload on next interaction

### Concurrent Playback Limits

**Scenario**: Too many sounds playing simultaneously
- **Handling**: expo-av handles mixing automatically, older sounds may be stopped
- **User Impact**: Minimal - click sounds are very short (< 100ms)
- **Recovery**: None needed - natural behavior

## Testing Strategy

### Unit Testing

**NumPadButton Component Tests**:
- Test that handlePressIn calls both triggerHaptic and playClickSound
- Test that disabled buttons don't trigger feedback
- Test that onPress callback is called after feedback
- Test error handling when haptics fail
- Test error handling when audio fails

**Audio Service Tests**:
- Test loadSound successfully loads audio files
- Test playSound plays loaded sounds
- Test sound caching (load once, play multiple times)
- Test unloadSound cleans up resources
- Test unloadAll cleans up all resources
- Test error handling for invalid sound IDs

### Property-Based Testing

We will use **fast-check** (JavaScript property-based testing library) to verify the correctness properties. Each property test will run a minimum of 100 iterations with randomly generated inputs.

**Property Test Configuration**:
```typescript
import fc from 'fast-check';

// Configure to run 100 iterations minimum
const testConfig = { numRuns: 100 };
```

**Test Generators**:
```typescript
// Generate random button configurations
const buttonConfigGen = fc.record({
  disabled: fc.boolean(),
  type: fc.constantFrom('number', 'action', 'placeholder'),
  hasOnPress: fc.boolean()
});

// Generate random button press sequences
const buttonPressSequenceGen = fc.array(
  fc.record({
    buttonIndex: fc.integer({ min: 0, max: 14 }),
    timestamp: fc.integer({ min: 0, max: 1000 })
  }),
  { minLength: 1, maxLength: 20 }
);
```

**Property Test Examples**:

1. **Property 1: Haptic feedback for enabled buttons**
   - Generate random enabled button configurations
   - Simulate press
   - Verify haptic API was called

2. **Property 5: Click sound for enabled buttons**
   - Generate random enabled button configurations
   - Simulate press
   - Verify audio service playSound was called

3. **Property 14: Rapid presses don't cut off sounds**
   - Generate random rapid press sequences
   - Simulate all presses
   - Verify each press triggered a separate sound instance

### Integration Testing

**Full Interaction Flow**:
- Mount NumPad component
- Simulate button press
- Verify haptic feedback triggered
- Verify click sound played
- Verify onPress callback executed
- Verify visual state updated

**Error Recovery Flow**:
- Mock haptics to throw error
- Simulate button press
- Verify audio still plays
- Verify callback still executes

### Manual Testing

**Device Testing**:
- Test on iOS device with haptics enabled
- Test on iOS device with haptics disabled (Settings)
- Test with device on silent mode
- Test with device volume at different levels
- Test rapid button presses (stress test)
- Test app backgrounding/foregrounding

**Accessibility Testing**:
- Test with VoiceOver enabled
- Verify haptics don't interfere with screen reader
- Verify audio feedback is appropriate volume

## Performance Considerations

### Audio Loading

- Load click.mp3 once during NumPad component mount
- Keep sound in memory while component is mounted
- Unload when component unmounts or app backgrounds
- File size should be < 10KB for fast loading

### Haptic Feedback

- Haptic calls are lightweight (< 5ms)
- Use ImpactFeedbackStyle.Light for minimal battery impact
- No caching needed - API is fast enough

### Concurrent Feedback

- Use Promise.allSettled to run haptic and audio in parallel
- Don't await feedback completion before executing callback
- Maximum 50ms total feedback time ensures responsive UI

### Memory Usage

- Single click sound: ~10KB in memory
- 15 buttons sharing same sound: no duplication
- Total memory impact: negligible (< 50KB)

## Dependencies

### New Dependencies

```json
{
  "expo-haptics": "~15.0.7",
  "expo-av": "~15.0.7"
}
```

### Installation

```bash
cd frontend
npx expo install expo-haptics expo-av
```

### Existing Dependencies

- React Native core (Pressable, View, Text)
- expo-font (already installed for FuturaCyrillicBook)
- @expo/vector-icons (already installed for icons)

## Implementation Notes

### File Structure

```
frontend/src/
├── components/
│   └── NumPad.tsx (modify)
├── services/
│   └── audioService.ts (create)
└── assets/
    └── click.mp3 (already exists)
```

### Backward Compatibility

- No breaking changes to NumPad props interface
- Existing screens using NumPad require no modifications
- Feedback is additive - doesn't change navigation behavior

### Platform Considerations

**iOS**:
- Haptics work on iPhone 7 and later
- Graceful degradation on older devices
- Respects system haptic settings

**Android**:
- Haptics work on most modern devices
- May vary by manufacturer
- Graceful degradation if unsupported

**Web**:
- Haptics not supported (no-op)
- Audio works normally
- No errors thrown

### Audio File Requirements

The click.mp3 file should meet these specifications:
- Format: MP3
- Duration: 50-100ms
- Sample rate: 44.1kHz
- Bit rate: 128kbps
- Mono channel (stereo not needed)
- No silence padding at start/end
- Normalized volume (prevent clipping)
