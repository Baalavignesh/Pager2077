# Implementation Plan

- [x] 1. Create NumPad component with basic structure
  - Create new file `frontend/src/components/NumPad.tsx`
  - Define NumPadProps interface matching ControlWheel interface plus optional onNavigateLeft and onNavigateRight
  - Set up basic component structure with container View
  - Export NumPad component
  - _Requirements: 1.5, 5.1, 5.2, 5.3_

- [x] 2. Implement NumPadButton sub-component
  - Define NumPadButtonProps interface with number, letters, symbol, onPress, disabled, and type properties
  - Create NumPadButton functional component using Pressable
  - Implement conditional rendering for symbol vs number+letters display
  - Add pressed state styling with opacity and scale transform
  - Add disabled state styling with reduced opacity
  - _Requirements: 1.3, 5.5, 6.5_

- [x] 3. Create button configuration data structures
  - Define topActionButtons array with Back, Menu, and Select button configs
  - Define placeholderButtons array with Record and Stop button configs (disabled)
  - Define numberButtons 2D array with all number keys (1-9, *, 0, #) and their letter labels
  - Map navigation callbacks to appropriate number buttons (2=up, 4=left, 5=menu, 6=right, 8=down)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3_

- [x] 4. Implement NumPad layout structure
  - Create topActionRow View with flexDirection row and space-between justification
  - Create placeholderRow View with centered layout and gap spacing
  - Create numberGrid View with vertical layout
  - Create numberRow Views for each row with horizontal layout and gap spacing
  - Render all buttons using map functions over configuration arrays
  - _Requirements: 1.1, 1.4, 3.5, 4.5, 7.3, 7.4, 7.5_

- [x] 5. Style NumPad component with flat minimalist design
  - Create StyleSheet with container, row, and button styles
  - Apply white background (#FFFFFF) and black text (#000000) colors
  - Set button dimensions (80x60 for numbers, 70x50 for actions, 60x40 for placeholders)
  - Add rounded corners (borderRadius: 10) and subtle borders
  - Add spacing between buttons (horizontal: 12px, vertical: 10px)
  - Apply subtle shadows for depth (shadowOpacity: 0.1)
  - _Requirements: 1.3, 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.4_

- [x] 6. Implement button press interactions and feedback
  - Add pressed state styling with opacity: 0.7 and scale: 0.95
  - Add disabled state styling with opacity: 0.3
  - Implement safe callback invocation with undefined checks
  - Add error handling with try-catch around callback execution
  - _Requirements: 6.5, 4.4_

- [x] 7. Integrate NumPad into PagerBody component
  - Update PagerBody imports to replace ControlWheel with NumPad
  - Update PagerBodyProps interface to include optional onNavigateLeft and onNavigateRight
  - Replace ControlWheel component with NumPad in JSX
  - Pass all navigation callbacks to NumPad component
  - Adjust contentArea padding if needed for numpad height
  - Adjust logo position to maintain visibility below numpad
  - _Requirements: 1.5, 5.4_

- [x] 8. Update App.tsx to support new navigation callbacks
  - Add onNavigateLeft and onNavigateRight callback handlers (can be no-ops initially)
  - Pass new callbacks to PagerBody component
  - Verify all existing screens continue to work with numpad navigation
  - _Requirements: 5.1, 5.4_

- [x] 9. Remove deprecated ControlWheel component
  - Delete `frontend/src/components/ControlWheel.tsx` file
  - Verify no other files import or reference ControlWheel
  - Update project documentation to reflect numpad interface
  - _Requirements: 1.5_

- [ ]* 10. Test numpad functionality across all screens
  - Verify navigation works on MainMenuScreen (up/down through menu items)
  - Verify navigation works on FriendsListScreen (up/down through friends)
  - Verify navigation works on AddFriendScreen (input interaction)
  - Verify navigation works on FriendRequestsScreen (up/down through requests)
  - Test Back button returns to previous screen
  - Test Select button confirms selections
  - Test Menu button returns to main menu
  - Verify placeholder buttons are disabled and non-interactive
  - Verify button press feedback is smooth and responsive
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.2, 3.3, 3.4, 4.4, 6.5_
