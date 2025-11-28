# Implementation Plan

- [x] 1. Install required dependencies
  - Install expo-haptics and expo-av packages using npx expo install
  - Verify packages are added to package.json
  - _Requirements: 1.1, 2.1, 4.5_

- [x] 2. Create audio service module
  - Create frontend/src/services/audioService.ts file
  - Implement loadSound function to load audio files from assets
  - Implement playSound function to play loaded sounds by identifier
  - Implement sound caching to avoid reloading on subsequent plays
  - Implement unloadSound function to clean up specific audio resources
  - Implement unloadAll function to clean up all audio resources
  - Configure audio playback to allow simultaneous sound instances
  - Add error handling for audio loading and playback failures
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 2.3_

- [ ]* 2.1 Write property test for sound caching
  - **Property 13: Sound caching prevents reloading**
  - **Validates: Requirements 4.3**

- [x] 3. Enhance NumPad component with feedback hooks
  - Import expo-haptics and audioService in NumPad.tsx
  - Add useEffect hook to load click.mp3 on component mount
  - Add cleanup in useEffect to unload sound on unmount
  - Create triggerHaptic helper function with error handling
  - Create playClickSound helper function with error handling
  - Create triggerFeedback function that calls both helpers concurrently using Promise.allSettled
  - _Requirements: 2.2, 1.3, 2.3, 3.1, 3.3_

- [ ]* 3.1 Write property test for concurrent feedback
  - **Property 9: Both feedback types trigger concurrently**
  - **Validates: Requirements 3.1**

- [ ]* 3.2 Write property test for partial failure resilience
  - **Property 11: Partial feedback failure resilience**
  - **Validates: Requirements 3.3**

- [x] 4. Integrate feedback into NumPadButton press handler
  - Modify handlePressIn to call triggerFeedback before setting pressed state
  - Ensure triggerFeedback is non-blocking (don't await)
  - Ensure disabled buttons skip feedback calls
  - Maintain existing visual feedback behavior
  - _Requirements: 1.4, 2.4, 3.2, 1.5, 2.5, 6.3, 6.4_

- [ ]* 4.1 Write property test for haptic feedback on enabled buttons
  - **Property 1: Haptic feedback triggers for all enabled buttons**
  - **Validates: Requirements 1.1**

- [ ]* 4.2 Write property test for click sound on enabled buttons
  - **Property 5: Click sound plays for all enabled buttons**
  - **Validates: Requirements 2.1**

- [ ]* 4.3 Write property test for disabled buttons don't trigger haptics
  - **Property 4: Disabled buttons don't trigger haptics**
  - **Validates: Requirements 1.5**

- [ ]* 4.4 Write property test for disabled buttons don't play sounds
  - **Property 8: Disabled buttons don't play sounds**
  - **Validates: Requirements 2.5**

- [ ]* 4.5 Write property test for feedback doesn't block callback
  - **Property 10: Feedback doesn't block callback**
  - **Validates: Requirements 3.2**

- [x] 5. Add haptic feedback style configuration
  - Configure haptic feedback to use ImpactFeedbackStyle.Light
  - Verify haptic style is consistent across all button types
  - _Requirements: 1.2, 6.1_

- [ ]* 5.1 Write unit test for haptic style configuration
  - Verify ImpactFeedbackStyle.Light is used for all button presses
  - _Requirements: 1.2_

- [x] 6. Implement error handling and graceful degradation
  - Add try-catch blocks around haptic calls with console warnings
  - Add try-catch blocks around audio calls with console errors
  - Ensure button functionality continues when feedback fails
  - _Requirements: 1.3, 2.3, 3.3_

- [ ]* 6.1 Write property test for haptic error handling
  - **Property 2: Haptic errors don't break functionality**
  - **Validates: Requirements 1.3**

- [ ]* 6.2 Write property test for audio error handling
  - **Property 6: Audio errors don't break functionality**
  - **Validates: Requirements 2.3**

- [x] 7. Verify feedback consistency across button types
  - Test that number buttons, action buttons, and navigation buttons all trigger same feedback
  - Verify feedback timing is consistent across all button types
  - _Requirements: 6.1, 6.2, 6.5_

- [ ]* 7.1 Write property test for consistent haptic feedback
  - **Property 16: Consistent haptic feedback across button types**
  - **Validates: Requirements 6.1**

- [ ]* 7.2 Write property test for consistent audio feedback
  - **Property 17: Consistent audio feedback across button types**
  - **Validates: Requirements 6.2**

- [ ]* 7.3 Write property test for consistent feedback timing
  - **Property 18: Consistent feedback timing across buttons**
  - **Validates: Requirements 6.3**

- [ ]* 7.4 Write property test for timing consistency
  - **Property 20: Timing consistency across all buttons**
  - **Validates: Requirements 6.5**

- [x] 8. Test rapid button press handling
  - Verify overlapping sounds play without cutting off
  - Verify sounds play immediately without queuing
  - Test performance with rapid sequential presses
  - _Requirements: 5.2, 5.4_

- [ ]* 8.1 Write property test for rapid press sound handling
  - **Property 14: Rapid presses don't cut off sounds**
  - **Validates: Requirements 5.2**

- [ ]* 8.2 Write property test for immediate sound playback
  - **Property 15: Sounds play immediately without queuing**
  - **Validates: Requirements 5.4**

- [x] 9. Implement app lifecycle handling
  - Add app state listener to unload sounds when app backgrounds
  - Reload sounds when app returns to foreground
  - _Requirements: 4.4, 5.5_

- [ ]* 9.1 Write unit test for app backgrounding cleanup
  - Verify sounds are unloaded when app backgrounds
  - _Requirements: 5.5_

- [x] 10. Verify feedback timing performance
  - Measure time from button press to feedback completion
  - Ensure all feedback completes within 50ms
  - _Requirements: 3.5_

- [ ]* 10.1 Write property test for feedback timing
  - **Property 12: Feedback completes within time limit**
  - **Validates: Requirements 3.5**

- [x] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
