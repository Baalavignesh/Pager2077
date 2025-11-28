# Design Document: Friends UI Revamp

## Overview

This design document outlines the revamp of the Friends management UI in Pager2077, transitioning from a hex code-based system to a simpler 6-digit number system. The changes include a new confirmation flow for friend requests and a streamlined add friend interface that leverages the existing NumPad component for input.

## Architecture

### Component Structure

The revamp involves modifications to three main screens and the addition of one new screen:

1. **FriendRequestsScreen** - Displays pending friend requests (existing, modified)
2. **FriendRequestConfirmationScreen** - New screen for confirming accept/reject actions
3. **AddFriendScreen** - Simplified 6-digit number entry (existing, completely redesigned)
4. **FriendsScreen** - Friends list view (existing, minimal changes)

### Navigation Flow

```
FriendsScreen
├── AddFriendScreen
│   └── (on success) → FriendsScreen
└── FriendRequestsScreen
    └── FriendRequestConfirmationScreen
        └── (on action) → FriendRequestsScreen
```

### State Management

State will continue to be managed in `App.tsx` with the following additions:

- `friendRequestInput: string` - The 6-digit number being entered
- `confirmingRequest: FriendRequest | null` - The request being confirmed
- `confirmationFocusedButton: 'yes' | 'no' | null` - Which button is focused on confirmation screen

## Components and Interfaces

### FriendRequestConfirmationScreen (New)

A new screen component that displays a single friend request with Yes/No options.

```typescript
interface FriendRequestConfirmationScreenProps {
  request: FriendRequest;
  focusedButton: 'yes' | 'no' | null;
}
```

**Visual Layout:**
```
CONFIRM REQUEST
─────────────
FROM: 123456

ACCEPT THIS REQUEST?

◄ NO        YES ►
```

**Behavior:**
- Left button (4 key) focuses "NO"
- Right button (6 key) focuses "YES"
- Select button confirms the focused action
- Back button returns to FriendRequestsScreen without action

### AddFriendScreen (Redesigned)

Complete redesign to support 6-digit number entry with NumPad input.

```typescript
interface AddFriendScreenProps {
  digitInput: string;        // Current input (0-6 digits)
  focusedElement: 'input' | 'send';  // What's currently focused
}
```

**Visual Layout:**
```
ADD FRIEND
─────────────
ENTER 6-DIGIT CODE:

  [1 2 3 4 5 6]

> SEND FRIEND REQUEST

Backspace - #
```

**Behavior:**
- Number keys (0-9) append to input (max 6 digits)
- # key removes last digit (backspace)
- Down arrow (8 key) moves focus to "SEND FRIEND REQUEST"
- Up arrow (2 key) moves focus back to input
- Select on "SEND FRIEND REQUEST" sends the request
- Back button returns to FriendsScreen

### FriendRequestsScreen (Modified)

Updated to support navigation to confirmation screen instead of immediate accept/reject.

```typescript
interface FriendRequestsScreenProps {
  requests: FriendRequest[];
  selectedIndex: number;
}
```

**Visual Layout:**
```
FRIEND REQUESTS
─────────────
> 123456
  789012
  345678

SELECT: VIEW
```

**Behavior:**
- Up/Down arrows navigate through requests
- Select button navigates to FriendRequestConfirmationScreen
- Back button returns to FriendsScreen

### Data Models

```typescript
interface FriendRequest {
  userId: string;           // Backend user ID
  sixDigitCode: string;     // Display code (6 digits)
  timestamp: string;        // ISO 8601 timestamp
}

interface Friend {
  userId: string;
  sixDigitCode: string;
  status: 'ONLINE' | 'OFFLINE';
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified several redundancies:
- Requirements 2.2 and 3.5 both test input length constraint (combined into Property 1)
- Requirements 1.4 and 1.5 both test navigation return after actions (combined into Property 5)
- Requirements 2.6 and focus navigation are part of the same bidirectional focus system (combined into Property 6)

### Property 1: Input length constraint
*For any* sequence of digit inputs on the AddFriendScreen, the displayed input string should never exceed 6 characters in length.
**Validates: Requirements 2.2, 3.5**

### Property 2: Backspace removes last character
*For any* non-empty input string, pressing the # button should result in a string that is one character shorter and matches the original string minus its last character.
**Validates: Requirements 2.4**

### Property 3: Numeric input only
*For any* input string on the AddFriendScreen, all characters should be digits from 0-9.
**Validates: Requirements 3.4**

### Property 4: Friend requests display completeness
*For any* list of pending friend requests, all requests should appear in the rendered Friend Requests screen.
**Validates: Requirements 1.1**

### Property 5: Request selection navigation
*For any* friend request in the list, selecting it should navigate to the confirmation screen with that specific request's data.
**Validates: Requirements 1.2**

### Property 6: Confirmation button mapping
*For any* state on the confirmation screen, pressing the left button should focus "NO" and pressing the right button should focus "YES".
**Validates: Requirements 1.3**

### Property 7: Action completion navigation
*For any* completed action (accept, reject, send request), the system should navigate to the appropriate return screen (FriendRequestsScreen for accept/reject, FriendsScreen for send).
**Validates: Requirements 1.4, 1.5, 2.8**

### Property 8: Focus state transitions
*For any* focus state on AddFriendScreen, pressing down from "input" should move to "send", and pressing up from "send" should return to "input".
**Validates: Requirements 2.6**

### Property 9: Send action trigger
*For any* valid 6-digit input, when "Send Friend Request" is focused and select is pressed, the send friend request function should be called with that input.
**Validates: Requirements 2.7**

### Property 10: Back button clears state
*For any* input state on AddFriendScreen, pressing back should clear the input and navigate to FriendsScreen.
**Validates: Requirements 2.9**

### Property 11: Back button navigation
*For any* friend management screen, pressing back should navigate to the previous screen in the navigation hierarchy.
**Validates: Requirements 4.1**

### Property 12: Error handling behavior
*For any* error during friend request operations, the system should display an error message and remain on the current screen.
**Validates: Requirements 4.4**

## Error Handling

### Input Validation Errors

**Invalid 6-digit code (user doesn't exist):**
- Display: "USER NOT FOUND"
- Action: Remain on AddFriendScreen, clear input
- User can retry or press back to cancel

**Network errors:**
- Display: "CONNECTION ERROR"
- Action: Remain on current screen
- User can retry or press back to cancel

**Already friends:**
- Display: "ALREADY FRIENDS"
- Action: Return to FriendsScreen after 2 seconds

**Request already sent:**
- Display: "REQUEST PENDING"
- Action: Return to FriendsScreen after 2 seconds

### API Error Responses

All API calls should handle:
- 404: User not found
- 409: Conflict (already friends, request pending)
- 500: Server error
- Network timeout

## Testing Strategy

### Unit Testing

**AddFriendScreen Input Logic:**
- Test digit appending up to 6 characters
- Test backspace (#) removes last character
- Test backspace on empty string does nothing
- Test non-numeric input is rejected
- Test focus transitions between input and send button

**FriendRequestConfirmationScreen Navigation:**
- Test left button focuses "NO"
- Test right button focuses "YES"
- Test select on "YES" calls accept handler
- Test select on "NO" calls reject handler
- Test back button returns without action

**Navigation Flow:**
- Test AddFriendScreen → FriendsScreen on success
- Test FriendRequestsScreen → ConfirmationScreen → FriendRequestsScreen
- Test back button behavior on each screen

### Property-Based Testing

We will use **fast-check** (JavaScript/TypeScript property-based testing library) for property-based tests.

Each property-based test should run a minimum of 100 iterations.

**Property Test 1: Input Length Constraint**
- Generate random sequences of digit inputs (0-9) of varying lengths
- Verify the displayed input never exceeds 6 characters
- Tag: **Feature: friends-ui-revamp, Property 1: Input length constraint**

**Property Test 2: Backspace Behavior**
- Generate random non-empty input strings (1-6 digits)
- Apply backspace operation
- Verify result is original minus last character
- Tag: **Feature: friends-ui-revamp, Property 2: Backspace removes last character**

**Property Test 3: Numeric Input Only**
- Generate random input strings from the AddFriendScreen
- Verify all characters are digits 0-9
- Tag: **Feature: friends-ui-revamp, Property 3: Numeric input only**

**Property Test 4: Friend Requests Display Completeness**
- Generate random lists of friend requests
- Verify all requests appear in rendered output
- Tag: **Feature: friends-ui-revamp, Property 4: Friend requests display completeness**

**Property Test 5: Request Selection Navigation**
- Generate random friend request lists and selection indices
- Verify selecting any request navigates to confirmation with correct data
- Tag: **Feature: friends-ui-revamp, Property 5: Request selection navigation**

**Property Test 6: Confirmation Button Mapping**
- Generate random sequences of left/right button presses
- Verify left always focuses "NO" and right always focuses "YES"
- Tag: **Feature: friends-ui-revamp, Property 6: Confirmation button mapping**

**Property Test 7: Action Completion Navigation**
- Generate random completed actions (accept, reject, send)
- Verify navigation goes to correct screen for each action type
- Tag: **Feature: friends-ui-revamp, Property 7: Action completion navigation**

**Property Test 8: Focus State Transitions**
- Generate random sequences of up/down presses
- Verify focus alternates correctly between "input" and "send"
- Tag: **Feature: friends-ui-revamp, Property 8: Focus state transitions**

**Property Test 9: Send Action Trigger**
- Generate random valid 6-digit inputs
- Verify send function is called with correct input when select is pressed
- Tag: **Feature: friends-ui-revamp, Property 9: Send action trigger**

**Property Test 10: Back Button Clears State**
- Generate random input states
- Verify back button clears input and navigates to FriendsScreen
- Tag: **Feature: friends-ui-revamp, Property 10: Back button clears state**

**Property Test 11: Back Button Navigation**
- Generate random friend management screens
- Verify back button navigates to previous screen
- Tag: **Feature: friends-ui-revamp, Property 11: Back button navigation**

**Property Test 12: Error Handling Behavior**
- Generate random error scenarios
- Verify error message displays and screen doesn't change
- Tag: **Feature: friends-ui-revamp, Property 12: Error handling behavior**

### Integration Testing

- Test complete flow: FriendsScreen → AddFriendScreen → enter code → send → return
- Test complete flow: FriendsScreen → FriendRequestsScreen → select → confirm → return
- Test error scenarios with mock API responses

## Implementation Notes

### Reusing Existing Components

- **PagerScreen**: Use for all screen layouts
- **PagerText**: Use for all text display with selection states
- **NumPad**: Existing component handles all button inputs

### State Management in App.tsx

Add new state variables:
```typescript
const [friendRequestInput, setFriendRequestInput] = useState('');
const [friendRequestFocus, setFriendRequestFocus] = useState<'input' | 'send'>('input');
const [confirmingRequest, setConfirmingRequest] = useState<FriendRequest | null>(null);
const [confirmationFocusedButton, setConfirmationFocusedButton] = useState<'yes' | 'no' | null>(null);
```

### Navigation Handler Updates

**handleSelect():**
- On FriendRequestsScreen: Navigate to FriendRequestConfirmationScreen
- On FriendRequestConfirmationScreen: Execute accept/reject based on focused button
- On AddFriendScreen with focus on "send": Call API to send friend request

**handleNavigateLeft/Right():**
- On FriendRequestConfirmationScreen: Toggle between "NO" and "YES"

**handleNavigateUp/Down():**
- On AddFriendScreen: Toggle between "input" and "send" focus

**Number key handlers (0-9):**
- On AddFriendScreen with focus on "input": Append digit to input (max 6)

**# key handler:**
- On AddFriendScreen with focus on "input": Remove last character from input

### API Integration

**Send Friend Request:**
```typescript
POST /api/friends/request
Body: { sixDigitCode: string }
Response: { success: boolean, error?: string }
```

**Accept Friend Request:**
```typescript
POST /api/friends/accept
Body: { userId: string }
Response: { success: boolean, error?: string }
```

**Reject Friend Request:**
```typescript
POST /api/friends/reject
Body: { userId: string }
Response: { success: boolean, error?: string }
```

### Styling Consistency

All screens should follow the existing retro design system:
- Use PagerScreen for consistent layout
- Use PagerText with `selected` prop for focused items
- Use `>` prefix for selected items in lists
- Use `─────────────` for visual separators
- Use `◄` and `►` for left/right indicators
- Maintain monospace Chicago font
- Keep LCD green aesthetic

## Performance Considerations

- Input state updates should be immediate (no debouncing needed for 6 digits)
- API calls should have 5-second timeout
- Show loading state during API calls ("SENDING..." or "PROCESSING...")
- Cache friend list to avoid unnecessary API calls

## Accessibility

- All interactive elements use PagerButton with proper labels
- Visual focus indicators (>) for keyboard navigation
- Clear helper text ("Backspace - #")
- Confirmation step prevents accidental actions

## Future Enhancements

- Add haptic feedback on button presses (covered in separate spec)
- Add audio feedback on button presses (covered in separate spec)
- Support for blocking users
- Friend nicknames/aliases
- Last seen timestamps
