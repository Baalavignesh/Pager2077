# Implementation Plan

- [x] 1. Create FriendRequestConfirmationScreen component
  - Create new screen component with Yes/No confirmation UI
  - Implement left/right button focus states
  - Add visual indicators (◄ NO and YES ►)
  - Use PagerScreen and PagerText for consistency
  - _Requirements: 1.2, 1.3_

- [ ]* 1.1 Write property test for confirmation button mapping
  - **Property 6: Confirmation button mapping**
  - **Validates: Requirements 1.3**

- [x] 2. Update FriendRequestsScreen for new navigation flow
  - Remove immediate accept/reject instructions
  - Update to show "SELECT: VIEW" instruction
  - Keep list display with selection indicator
  - _Requirements: 1.1, 1.2_

- [ ]* 2.1 Write property test for friend requests display
  - **Property 4: Friend requests display completeness**
  - **Validates: Requirements 1.1**

- [ ]* 2.2 Write property test for request selection navigation
  - **Property 5: Request selection navigation**
  - **Validates: Requirements 1.2**

- [x] 3. Redesign AddFriendScreen for 6-digit input
  - Remove hex code display and clipboard paste UI
  - Remove manual/paste toggle
  - Add 6-digit input display with brackets
  - Add "SEND FRIEND REQUEST" focusable text
  - Add "Backspace - #" helper text
  - Implement focus states for input vs send button
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3_

- [ ]* 3.1 Write property test for input length constraint
  - **Property 1: Input length constraint**
  - **Validates: Requirements 2.2, 3.5**

- [ ]* 3.2 Write property test for numeric input only
  - **Property 3: Numeric input only**
  - **Validates: Requirements 3.4**

- [ ]* 3.3 Write property test for backspace behavior
  - **Property 2: Backspace removes last character**
  - **Validates: Requirements 2.4**

- [ ]* 3.4 Write property test for focus state transitions
  - **Property 8: Focus state transitions**
  - **Validates: Requirements 2.6**

- [x] 4. Update App.tsx state management for new screens
  - Add `friendRequestInput: string` state
  - Add `friendRequestFocus: 'input' | 'send'` state
  - Add `confirmingRequest: FriendRequest | null` state
  - Add `confirmationFocusedButton: 'yes' | 'no' | null` state
  - Remove old hex code related state variables
  - _Requirements: 1.2, 1.3, 2.1, 2.6_

- [x] 5. Implement navigation handlers for confirmation screen
  - Update handleNavigateLeft to focus "NO" on confirmation screen
  - Update handleNavigateRight to focus "YES" on confirmation screen
  - Update handleSelect to execute accept/reject based on focused button
  - Update handleBack to return to FriendRequestsScreen without action
  - _Requirements: 1.3, 1.4, 1.5_

- [ ]* 5.1 Write property test for action completion navigation
  - **Property 7: Action completion navigation**
  - **Validates: Requirements 1.4, 1.5, 2.8**

- [x] 6. Implement AddFriendScreen input handlers
  - Update number key handlers (0-9) to append digits (max 6)
  - Add # key handler for backspace functionality
  - Update handleNavigateUp/Down for focus switching
  - Update handleSelect to send request when "send" is focused
  - Update handleBack to clear input and return to FriendsScreen
  - _Requirements: 2.2, 2.4, 2.6, 2.7, 2.9_

- [ ]* 6.1 Write property test for send action trigger
  - **Property 9: Send action trigger**
  - **Validates: Requirements 2.7**

- [ ]* 6.2 Write property test for back button clears state
  - **Property 10: Back button clears state**
  - **Validates: Requirements 2.9**

- [x] 7. Update FriendRequestsScreen navigation in App.tsx
  - Update handleSelect to navigate to confirmation screen instead of immediate accept
  - Pass selected request to confirmation screen
  - Initialize confirmation focus state
  - _Requirements: 1.2_

- [x] 8. Implement error handling for friend operations
  - Add error state variables for each screen
  - Display error messages on AddFriendScreen (USER NOT FOUND, CONNECTION ERROR, etc.)
  - Display error messages on confirmation screen
  - Ensure errors keep user on current screen
  - _Requirements: 4.4_

- [ ]* 8.1 Write property test for error handling behavior
  - **Property 12: Error handling behavior**
  - **Validates: Requirements 4.4**

- [x] 9. Update data models and mock data
  - Update FriendRequest interface to use sixDigitCode instead of hexCode
  - Update Friend interface to use sixDigitCode
  - Update mock data in App.tsx to use 6-digit codes
  - _Requirements: 2.1, 3.1_

- [x] 10. Implement back button navigation consistency
  - Verify back button works on all friend management screens
  - Ensure proper navigation hierarchy (AddFriend → Friends, Confirmation → Requests)
  - _Requirements: 4.1_

- [ ]* 10.1 Write property test for back button navigation
  - **Property 11: Back button navigation**
  - **Validates: Requirements 4.1**

- [x] 11. Add visual feedback for actions
  - Show "SENDING..." state when sending friend request
  - Show "PROCESSING..." state when accepting/rejecting
  - Add 1-2 second delay before navigation for user feedback
  - _Requirements: 4.2_

- [x] 12. Final integration and testing
  - Test complete flow: Friends → Add Friend → enter code → send → return
  - Test complete flow: Friends → Requests → select → confirm → return
  - Test error scenarios with various invalid inputs
  - Verify all screens maintain retro aesthetic
  - _Requirements: All_

- [x] 13. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
