# Implementation Plan: User Display Names

## Task List

- [x] 1. Set up storage infrastructure and validation
  - Add display name storage functions to storageService.ts
  - Create displayNameService.ts with validation and CRUD operations
  - Add TypeScript interfaces to types/index.ts
  - _Requirements: 1.5, 2.4, 2.5, 7.1, 7.2, 7.4, 7.5_

- [ ]* 1.1 Write property test for display name validation
  - **Property 4: Length validation enforces bounds**
  - **Property 5: Character validation enforces allowed set**
  - **Property 6: Validation rejects whitespace-only input**
  - **Validates: Requirements 2.4, 7.1, 7.2, 7.4**

- [ ]* 1.2 Write property test for storage and retrieval
  - **Property 1: Display name storage creates mapping**
  - **Property 2: Display name lookup returns mapping or fallback**
  - **Validates: Requirements 1.5, 2.2, 2.3, 2.5**

- [x] 2. Implement T9 text input system
  - Create T9 character map and constants
  - Implement T9InputHandler class with multi-tap logic
  - Add timeout handling for character finalization
  - Handle backspace functionality
  - _Requirements: 8.2, 8.3_

- [ ]* 2.1 Write property test for T9 input
  - **Property 11: T9 multi-tap cycles through characters**
  - **Property 12: Hash key deletes last character**
  - **Validates: Requirements 8.2, 8.3**

- [x] 3. Create NameEntryScreen component
  - Build screen layout with PagerScreen wrapper
  - Integrate T9InputHandler for text entry
  - Add numpad key press handlers (0-9, #, call button)
  - Display current input with formatting
  - Show validation errors inline
  - Handle call button submit with validation
  - Handle back button skip (use hex code as default)
  - _Requirements: 1.1, 1.2, 1.3, 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ]* 3.1 Write property test for name entry submission
  - **Property 13: Call button triggers validation and submit**
  - **Property 7: Valid input allows save**
  - **Property 8: Invalid input shows error**
  - **Validates: Requirements 7.3, 7.5, 8.4**

- [x] 4. Create EditNameScreen component
  - Build screen layout similar to NameEntryScreen
  - Pre-fill input with current display name
  - Integrate T9InputHandler with initial value
  - Add save and cancel handlers
  - _Requirements: 6.2, 6.3_

- [ ]* 4.1 Write property test for display name updates
  - **Property 9: Display name update persists to Secure Storage**
  - **Property 10: Display name update updates mapping**
  - **Validates: Requirements 6.4, 6.5**

- [x] 5. Integrate first-time setup flow in App.tsx
  - Add state for needsDisplayName and displayNameMap
  - Check for display name on authentication
  - Conditionally render NameEntryScreen before main app
  - Handle display name completion callback
  - Load display name mappings into state
  - _Requirements: 1.1, 1.3, 1.4_

- [x] 6. Modify FriendsListScreen to show display names
  - Add displayNameMap prop to component
  - Replace hex code display with display name lookup
  - Ensure fallback to hex code when no mapping exists
  - _Requirements: 3.1, 3.2, 3.4_

- [ ]* 6.1 Write property test for batch display name lookup
  - **Property 3: Batch lookup processes all hex codes**
  - **Validates: Requirements 3.1, 3.4, 4.1, 4.4, 5.1, 5.4**

- [x] 7. Modify FriendRequestsScreen to show display names
  - Add displayNameMap prop to component
  - Replace requester hex code with display name lookup
  - Ensure fallback to hex code when no mapping exists
  - _Requirements: 4.1, 4.2, 4.4_

- [x] 8. Modify MessagesScreen to show display names
  - Add displayNameMap prop to component
  - Replace sender hex code with display name lookup in message headers
  - Ensure fallback to hex code when no mapping exists
  - _Requirements: 5.1, 5.2, 5.4_

- [x] 9. Add "EDIT NAME" option to SettingsScreen
  - Add new menu item at index 4 (after Help)
  - Add state for editNameView
  - Handle navigation to EditNameScreen
  - Handle save callback to update display name
  - Reload display name mappings after save
  - _Requirements: 6.1, 6.2_

- [x] 10. Update FriendRequestConfirmationScreen to show display names
  - Add displayNameMap prop to component
  - Display requester's display name instead of hex code
  - Ensure fallback to hex code when no mapping exists
  - _Requirements: 4.1, 4.2_

- [x] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Implementation Notes

### T9 Input Behavior
- Each number key (0-9) maps to multiple characters
- Each key starts with its number (e.g., pressing 2 once gives '2', twice gives 'd')
- Pressing the same key multiple times cycles through its characters
- 1-second timeout between presses finalizes the current character
- Hash key (#) acts as backspace
- Call button submits the input

### Display Name Validation
- Length: 1-20 characters
- Allowed: alphanumeric, spaces, hyphens, underscores
- Rejected: whitespace-only strings
- Error messages shown inline on validation failure

### Storage Strategy
- **Secure Storage**: Current user's display name only
- **AsyncStorage**: Hex-code-to-display-name mappings for all users
- Mappings loaded once on app start and cached in App.tsx state
- Reloaded after any display name changes

### Fallback Behavior
- Always show display name if mapping exists
- Fall back to hex code if no mapping found
- No error states for missing display names

### Testing Focus
- Property-based tests for validation rules (length, characters, whitespace)
- Property-based tests for storage operations (save, retrieve, update)
- Property-based tests for T9 input (multi-tap, backspace)
- Property-based tests for batch lookups
- Example tests for UI flows (first-time setup, edit flow)

### Screen Integration
All modified screens (FriendsListScreen, FriendRequestsScreen, MessagesScreen, FriendRequestConfirmationScreen) receive `displayNameMap` as a prop from App.tsx. They use this map to look up display names for hex codes, falling back to the hex code itself if no mapping exists.

### Future Backend Integration
The local storage approach is designed to be easily upgraded to sync with a backend:
1. Add API calls to save/retrieve display names from server
2. Sync local mappings with server on app start
3. Handle conflicts (local vs server) with last-write-wins or user prompt
4. Receive real-time updates when other users change their names

No changes to component interfaces will be needed - just update the service layer to call APIs instead of/in addition to local storage.
