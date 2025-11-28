# Implementation Plan

- [x] 1. Create IndividualChatScreen component with basic structure
  - Create `frontend/src/screens/IndividualChatScreen.tsx` file
  - Implement component with PagerScreen wrapper and friend prop
  - Add state management for messageText, messageHistory, sendStatus, errorMessage
  - Initialize T9InputHandler instance in component
  - Render PagerScreen with friend's display name or code as title
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Implement MessageComposer component
  - Create `frontend/src/components/MessageComposer.tsx` file
  - Display message text with Chicago font and LCD styling
  - Implement blinking cursor at current position
  - Add character counter (X/500)
  - Display status indicator (SENDING.../SENT/ERROR)
  - Implement horizontal and vertical scroll to keep cursor visible
  - _Requirements: 2.8, 3.1, 3.2, 3.3, 3.4_

- [ ]* 2.1 Write property test for cursor visibility during scroll
  - **Property 5: Cursor remains visible during scroll**
  - **Validates: Requirements 3.2, 3.3**

- [x] 3. Integrate T9 input handling with ChatNumPad
  - Wire up onNumberPress callback to T9InputHandler.handleKeyPress
  - Handle backspace (#) key with T9InputHandler.handleBackspace
  - Handle confirm (circle) button to finalize current character
  - Update messageText state on each key press
  - Enforce 500 character limit by rejecting input at max length
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 3.5, 3.6_

- [ ]* 3.1 Write property test for T9 character cycling
  - **Property 1: T9 key press cycles characters**
  - **Validates: Requirements 2.1, 2.2**

- [ ]* 3.2 Write property test for character confirmation
  - **Property 2: Character confirmation on timeout or key change**
  - **Validates: Requirements 2.3, 2.7**

- [ ]* 3.3 Write property test for backspace behavior
  - **Property 3: Backspace removes last character**
  - **Validates: Requirements 2.6**

- [ ]* 3.4 Write property test for message length limit
  - **Property 6: Message length limit enforcement**
  - **Validates: Requirements 3.5, 3.6**

- [x] 4. Implement message validation and sanitization
  - Create validation utility function to trim whitespace
  - Create function to filter invalid characters (keep only a-z, A-Z, 0-9, space, . , ! ? ' " -)
  - Apply validation before sending message
  - Reject empty or whitespace-only messages silently
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 4.1 Write property test for whitespace trimming
  - **Property 10: Whitespace trimming before send**
  - **Validates: Requirements 5.1**

- [ ]* 4.2 Write property test for whitespace-only rejection
  - **Property 11: Whitespace-only messages rejected**
  - **Validates: Requirements 5.2**

- [ ]* 4.3 Write property test for invalid character filtering
  - **Property 12: Invalid character filtering**
  - **Validates: Requirements 5.5**

- [x] 5. Implement message sending functionality
  - Create sendMessage API function in apiClient.ts
  - Add POST /api/messages endpoint call with recipientId and text
  - Handle send button press: validate, set status to 'sending', call API
  - On success: clear messageText, set status to 'sent', show confirmation
  - On error: set status to 'error', set errorMessage, preserve messageText
  - Ignore send action if message is empty or whitespace-only
  - _Requirements: 4.1, 4.2, 4.4, 4.5, 4.6_

- [ ]* 5.1 Write property test for non-empty message send trigger
  - **Property 7: Non-empty message triggers send**
  - **Validates: Requirements 4.1**

- [ ]* 5.2 Write property test for successful send clearing composer
  - **Property 8: Successful send clears composer**
  - **Validates: Requirements 4.4**

- [ ]* 5.3 Write property test for failed send preserving message
  - **Property 9: Failed send preserves message**
  - **Validates: Requirements 4.5, 8.4**

- [x] 6. Implement error handling and display
  - Create error message mapping object (NETWORK_ERROR, TIMEOUT, etc.)
  - Display error message in MessageComposer status area
  - Implement auto-clear timer (3 seconds) for error messages
  - Map backend error codes to user-friendly messages
  - Preserve message text on all errors for retry
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ]* 6.1 Write property test for error message auto-clear
  - **Property 16: Error message auto-clear**
  - **Validates: Requirements 8.5**

- [x] 7. Implement haptic and audio feedback
  - Trigger haptic feedback on all number key presses (if enabled)
  - Play click sound on all number key presses (if enabled)
  - Trigger distinct haptic pattern on call button press
  - Trigger success haptic pattern on successful send
  - Trigger error haptic pattern on failed send
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 7.1 Write property test for feedback on key press
  - **Property 13: Feedback triggers on key press**
  - **Validates: Requirements 6.1, 6.2**

- [ ]* 7.2 Write property test for success feedback
  - **Property 14: Success feedback on send completion**
  - **Validates: Requirements 6.4**

- [ ]* 7.3 Write property test for error feedback
  - **Property 15: Error feedback on send failure**
  - **Validates: Requirements 6.5**

- [x] 8. Create MessageHistory component
  - Create `frontend/src/components/MessageHistory.tsx` file
  - Implement scrollable list of messages
  - Display "NO MESSAGES YET" when history is empty
  - Sort messages by timestamp (oldest at top)
  - Auto-scroll to bottom when new messages added
  - _Requirements: 9.3, 9.6, 9.7_

- [ ]* 8.1 Write property test for message history ordering
  - **Property 17: Message history chronological ordering**
  - **Validates: Requirements 9.3**

- [ ]* 8.2 Write property test for new message append and scroll
  - **Property 20: New messages append and scroll**
  - **Validates: Requirements 9.6**

- [x] 9. Create MessageBubble component
  - Create `frontend/src/components/MessageBubble.tsx` file
  - Display message text, sender name, and timestamp
  - Implement sent vs received styling (alignment, background)
  - Use Chicago font and LCD colors for consistency
  - Format timestamp in readable format (HH:MM)
  - _Requirements: 9.4, 9.5_

- [ ]* 9.1 Write property test for message metadata display
  - **Property 18: Message display includes metadata**
  - **Validates: Requirements 9.4**

- [ ]* 9.2 Write property test for visual distinction
  - **Property 19: Visual distinction between sent and received**
  - **Validates: Requirements 9.5**

- [x] 10. Implement message history loading
  - Create getMessageHistory API function in apiClient.ts
  - Add GET /api/messages/:friendId endpoint call with limit parameter
  - Load message history on component mount
  - Display loading state while fetching
  - Handle API errors gracefully
  - _Requirements: 9.1, 9.2_

- [x] 11. Integrate IndividualChatScreen into App navigation
  - Add 'chat' screen type to App.tsx Screen union
  - Add selectedFriend state to track which friend is being messaged
  - Update MessagesScreen to handle friend selection and navigate to chat
  - Pass friend data, onBack callback, sound/vibrate settings to IndividualChatScreen
  - Wire up back button to return to messages screen
  - _Requirements: 1.1, 1.5_

- [x] 12. Add ChatPagerBody to IndividualChatScreen layout
  - Render ChatPagerBody component below PagerDisplay
  - Wire up onNumberPress, onConfirm, onBack, onCall, onMenu callbacks
  - Pass soundEnabled and vibrateEnabled props from settings
  - Ensure proper layout with full-height metallic container
  - _Requirements: 1.4, 7.2_

- [x] 13. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 14. Write unit tests for component rendering
  - Test IndividualChatScreen renders with correct props
  - Test MessageComposer displays initial empty state
  - Test MessageHistory renders empty state message
  - Test MessageBubble renders sent vs received styling
  - Test navigation callbacks are wired correctly

- [ ]* 15. Write unit tests for edge cases
  - Test pressing 0 inserts space
  - Test pressing 1 inserts "1"
  - Test pressing # on empty message does nothing
  - Test empty message send is ignored
  - Test whitespace-only message send is ignored
  - Test 500 character limit prevents input
  - Test network error displays correct message
  - Test timeout error displays correct message

- [ ]* 16. Write integration tests for user flows
  - Test complete message composition and send flow
  - Test message history loading on mount
  - Test error recovery and retry flow
  - Test T9 input to message composer integration
