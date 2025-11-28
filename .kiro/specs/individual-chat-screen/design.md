# Design Document

## Overview

The Individual Chat Screen feature enables users to compose and send text messages to friends using a T9-style numpad interface. The design leverages existing components (ChatNumPad, ChatPagerBody, PagerScreen) and the T9InputHandler utility to provide a retro pager messaging experience. The screen displays message history, a text input area with cursor, and provides real-time feedback during message composition and sending.

## Architecture

### Component Hierarchy

```
App.tsx
└── IndividualChatScreen
    ├── PagerDisplay
    │   └── PagerScreen (title: friend's name/code)
    │       ├── MessageHistory (scrollable list)
    │       │   └── MessageBubble[] (sent/received messages)
    │       └── MessageComposer
    │           ├── InputText (with cursor)
    │           └── StatusIndicator (SENDING.../SENT/ERROR)
    └── ChatPagerBody
        └── ChatNumPad
            ├── Back button (return to messages)
            ├── Circle button (confirm character)
            ├── Call button (send message)
            └── Number keys 0-9, *, # (T9 input)
```

### State Management

The IndividualChatScreen component manages:
- **messageText**: Current message being composed (string)
- **messageHistory**: Array of previous messages with sender, text, timestamp
- **sendStatus**: 'idle' | 'sending' | 'sent' | 'error'
- **errorMessage**: Error text to display (string | null)
- **selectedFriend**: Friend object with sixDigitCode and displayName
- **t9Handler**: Instance of T9InputHandler for multi-tap text entry
- **cursorPosition**: Current cursor position in message text (number)

### Navigation Flow

1. User selects friend from MessagesScreen
2. App navigates to IndividualChatScreen with friend data
3. Screen loads message history from backend
4. User composes message using T9 input
5. User sends message via call button
6. On success: message added to history, composer cleared
7. On back: return to MessagesScreen

## Components and Interfaces

### IndividualChatScreen Component

**Props:**
```typescript
interface IndividualChatScreenProps {
  friend: {
    sixDigitCode: string;
    displayName?: string;
  };
  onBack: () => void;
  soundEnabled: boolean;
  vibrateEnabled: boolean;
}
```

**State:**
```typescript
interface ChatScreenState {
  messageText: string;
  messageHistory: Message[];
  sendStatus: 'idle' | 'sending' | 'sent' | 'error';
  errorMessage: string | null;
  isLoadingHistory: boolean;
}

interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  text: string;
  timestamp: string;
  isSent: boolean; // true if current user sent it
}
```

### MessageComposer Component

**Props:**
```typescript
interface MessageComposerProps {
  messageText: string;
  cursorPosition: number;
  sendStatus: 'idle' | 'sending' | 'sent' | 'error';
  errorMessage: string | null;
  maxLength: number;
}
```

**Rendering:**
- Displays message text with blinking cursor at cursorPosition
- Shows character count: `{messageText.length}/500`
- Displays status indicator based on sendStatus
- Auto-scrolls to keep cursor visible

### MessageHistory Component

**Props:**
```typescript
interface MessageHistoryProps {
  messages: Message[];
  currentUserId: string;
  displayNameMap: Record<string, string>;
}
```

**Rendering:**
- Scrollable list of messages (oldest at top)
- Sent messages aligned right with distinct styling
- Received messages aligned left
- Each message shows: sender name, text, timestamp
- Empty state: "NO MESSAGES YET"

### MessageBubble Component

**Props:**
```typescript
interface MessageBubbleProps {
  message: Message;
  isSent: boolean;
  senderName: string;
}
```

**Styling:**
- Sent messages: right-aligned, darker background
- Received messages: left-aligned, lighter background
- Timestamp in smaller font below text
- Sender name above text for received messages

## Data Models

### Message Model

```typescript
interface Message {
  id: string;                    // UUID
  senderId: string;              // 6-digit code
  recipientId: string;           // 6-digit code
  text: string;                  // Message content (max 500 chars)
  timestamp: string;             // ISO 8601 format
  isSent: boolean;               // Derived: true if senderId === currentUserId
  createdAt: string;             // ISO 8601 format
}
```

### API Request/Response Models

**Send Message Request:**
```typescript
interface SendMessageRequest {
  recipientId: string;           // 6-digit code
  text: string;                  // Trimmed message text
}
```

**Send Message Response:**
```typescript
interface SendMessageResponse {
  success: boolean;
  data?: {
    messageId: string;
    timestamp: string;
  };
  error?: {
    code: string;
    message: string;
  };
}
```

**Get Message History Request:**
```typescript
interface GetMessageHistoryRequest {
  friendId: string;              // 6-digit code
  limit?: number;                // Default: 50
}
```

**Get Message History Response:**
```typescript
interface GetMessageHistoryResponse {
  success: boolean;
  data?: {
    messages: Message[];
  };
  error?: {
    code: string;
    message: string;
  };
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Acceptance Criteria Testing Prework

1.1 WHEN a User selects a friend from the Messages screen, THE Pager_App SHALL navigate to the Individual_Chat_Screen for that specific Friend
Thoughts: This is testing navigation behavior. We can test that selecting a friend triggers the correct navigation with the correct friend data passed as props.
Testable: yes - example

1.2 WHEN the Individual_Chat_Screen loads, THE Pager_App SHALL display the Friend's display name or six-digit code in the screen title
Thoughts: This is testing that the screen title contains the correct friend identifier. We can generate random friend data and verify the title matches.
Testable: yes - property

1.3 WHEN the Individual_Chat_Screen loads, THE Pager_App SHALL display an empty Message_Composer ready for text input
Thoughts: This is testing initial state. We can verify that on mount, the message text is empty.
Testable: yes - example

1.4 WHEN the Individual_Chat_Screen loads, THE Pager_App SHALL render the ChatPagerBody component with the ChatNumPad interface
Thoughts: This is testing component rendering. We can verify the correct components are present in the tree.
Testable: yes - example

1.5 WHEN a User presses the back button on the Individual_Chat_Screen, THE Pager_App SHALL return to the Messages screen
Thoughts: This is testing navigation behavior. We can verify that pressing back triggers the onBack callback.
Testable: yes - example

2.1 WHEN a User presses a number key (2-9) on the ChatNumPad, THE Pager_App SHALL cycle through the letters associated with that key followed by the number itself
Thoughts: This is testing T9 input behavior across all number keys. We can test that pressing any key 2-9 cycles through its character set correctly.
Testable: yes - property

2.2 WHEN a User presses the same number key multiple times within 1 second, THE Pager_App SHALL replace the current character with the next character in the cycle
Thoughts: This is testing multi-tap behavior. For any key and any number of presses within the timeout, the character should cycle correctly.
Testable: yes - property

2.3 WHEN a User presses a different number key or waits more than 1 second, THE Pager_App SHALL confirm the current character and move the cursor to the next position
Thoughts: This is testing character confirmation behavior. For any sequence of key presses with sufficient delay, characters should be confirmed.
Testable: yes - property

2.4 WHEN a User presses the 0 key, THE Pager_App SHALL insert a space character
Thoughts: This is testing a specific key behavior. We can verify that pressing 0 always inserts a space.
Testable: yes - example

2.5 WHEN a User presses the 1 key, THE Pager_App SHALL insert the number 1
Thoughts: This is testing a specific key behavior. We can verify that pressing 1 always inserts "1".
Testable: yes - example

2.6 WHEN a User presses the # key, THE Pager_App SHALL delete the last character from the Message_Composer
Thoughts: This is testing backspace behavior. For any message text, pressing # should remove the last character.
Testable: yes - property

2.7 WHEN a User presses the center circle button on the ChatNumPad, THE Pager_App SHALL confirm the current character and advance the cursor
Thoughts: This is testing the confirm button behavior. For any T9 state, pressing confirm should finalize the character.
Testable: yes - property

2.8 THE Pager_App SHALL display the current message text in the Message_Composer with a visible cursor position
Thoughts: This is testing UI rendering. For any message text, the display should show the text with a cursor.
Testable: yes - property

3.1 THE Pager_App SHALL display the Message_Composer text using the Chicago font consistent with the retro aesthetic
Thoughts: This is testing styling. We can verify the font family is set correctly.
Testable: yes - example

3.2 WHEN the message text exceeds the visible width of the Message_Composer, THE Pager_App SHALL scroll the text horizontally to keep the cursor visible
Thoughts: This is testing scroll behavior. For any long message, the cursor should remain visible.
Testable: yes - property

3.3 WHEN the message text exceeds the visible height of the Message_Composer, THE Pager_App SHALL scroll the text vertically to keep the cursor visible
Thoughts: This is testing scroll behavior. For any multi-line message, the cursor should remain visible.
Testable: yes - property

3.4 THE Pager_App SHALL display a blinking cursor at the current input position
Thoughts: This is testing cursor animation. We can verify the cursor element exists and has animation.
Testable: yes - example

3.5 THE Pager_App SHALL limit message length to 500 characters maximum
Thoughts: This is testing input validation. For any message at 500 characters, additional input should be rejected.
Testable: yes - property

3.6 WHEN the message reaches 500 characters, THE Pager_App SHALL prevent further character input and ignore additional key presses
Thoughts: This is testing the same constraint as 3.5 - input rejection at max length.
Testable: yes - property (redundant with 3.5)

4.1 WHEN a User presses the call button with a non-empty message, THE Pager_App SHALL send the message text to the Backend_System
Thoughts: This is testing send behavior. For any non-empty message, pressing call should trigger the send API.
Testable: yes - property

4.2 WHEN the message send operation begins, THE Pager_App SHALL display a "SENDING..." indicator in the Message_Composer
Thoughts: This is testing UI state during send. We can verify the status changes to "sending".
Testable: yes - example

4.3 WHEN the Backend_System successfully receives the message, THE Backend_System SHALL store the message with sender ID, recipient ID, message text, and timestamp
Thoughts: This is testing backend behavior. We can verify the database contains the correct message data.
Testable: yes - property

4.4 WHEN the message send operation completes successfully, THE Pager_App SHALL clear the Message_Composer and display a brief "SENT" confirmation
Thoughts: This is testing post-send behavior. For any successful send, the composer should be cleared.
Testable: yes - property

4.5 WHEN the message send operation fails, THE Pager_App SHALL display an error message and retain the message text in the Message_Composer
Thoughts: This is testing error handling. For any send failure, the message should be preserved.
Testable: yes - property

4.6 WHEN a User presses the call button with an empty message, THE Pager_App SHALL ignore the action and provide no feedback
Thoughts: This is testing empty message handling. Pressing call with empty text should do nothing.
Testable: yes - example

4.7 WHEN the Backend_System stores a message, THE Backend_System SHALL send a push notification to the recipient User within 2 seconds
Thoughts: This is testing notification timing. For any stored message, a notification should be sent within the time limit.
Testable: yes - property

5.1 WHEN a User attempts to send a message, THE Pager_App SHALL trim leading and trailing whitespace from the message text
Thoughts: This is testing input sanitization. For any message with whitespace, the trimmed version should be sent.
Testable: yes - property

5.2 WHEN the trimmed message text is empty (only whitespace), THE Pager_App SHALL treat it as an empty message and ignore the send action
Thoughts: This is testing whitespace-only message handling. Any whitespace-only message should be rejected.
Testable: yes - property

5.3 WHEN the message text contains only valid characters (letters, numbers, spaces, basic punctuation), THE Pager_App SHALL proceed with sending
Thoughts: This is testing valid input acceptance. For any message with only valid characters, send should proceed.
Testable: yes - property

5.4 THE Pager_App SHALL allow the following characters in messages: letters (a-z, A-Z), numbers (0-9), spaces, and basic punctuation (. , ! ? ' " - )
Thoughts: This is defining the valid character set. We can test that all these characters are accepted.
Testable: yes - property

5.5 WHEN the message text contains invalid characters, THE Pager_App SHALL remove those characters before sending
Thoughts: This is testing invalid character filtering. For any message with invalid characters, they should be removed.
Testable: yes - property

6.1 WHEN a User presses any number key on the ChatNumPad, THE Pager_App SHALL trigger haptic feedback if vibration is enabled in settings
Thoughts: This is testing haptic feedback. For any key press with vibration enabled, haptic should trigger.
Testable: yes - property

6.2 WHEN a User presses any number key on the ChatNumPad, THE Pager_App SHALL play a click sound if audio is enabled in settings
Thoughts: This is testing audio feedback. For any key press with audio enabled, sound should play.
Testable: yes - property

6.3 WHEN a User presses the call button to send a message, THE Pager_App SHALL trigger a distinct haptic pattern
Thoughts: This is testing send button haptic. Pressing call should trigger a specific haptic.
Testable: yes - example

6.4 WHEN a message send operation completes successfully, THE Pager_App SHALL trigger a success haptic pattern
Thoughts: This is testing success feedback. For any successful send, a success haptic should trigger.
Testable: yes - property

6.5 WHEN a message send operation fails, THE Pager_App SHALL trigger an error haptic pattern
Thoughts: This is testing error feedback. For any failed send, an error haptic should trigger.
Testable: yes - property

7.1 THE Individual_Chat_Screen SHALL use the PagerScreen component for the display area with the Friend's identifier as the title
Thoughts: This is testing component usage. We can verify PagerScreen is rendered with correct props.
Testable: yes - example

7.2 THE Individual_Chat_Screen SHALL use the ChatPagerBody component to wrap the ChatNumPad interface
Thoughts: This is testing component usage. We can verify ChatPagerBody is rendered.
Testable: yes - example

7.3 THE Message_Composer SHALL occupy the main content area of the PagerScreen with appropriate padding
Thoughts: This is testing layout. We can verify the composer has correct positioning and padding.
Testable: yes - example

7.4 THE Message_Composer SHALL use monochrome colors consistent with the LCD display aesthetic
Thoughts: This is testing styling. We can verify color values match the theme.
Testable: yes - example

7.5 THE Individual_Chat_Screen SHALL maintain the same visual style as other screens (scanlines, LCD background, Chicago font)
Thoughts: This is testing visual consistency. We can verify styling matches other screens.
Testable: yes - example

8.1 WHEN the Backend_System is unreachable, THE Pager_App SHALL display the error message "NETWORK ERROR"
Thoughts: This is testing specific error handling. Network errors should show specific message.
Testable: yes - example

8.2 WHEN the message send operation times out after 10 seconds, THE Pager_App SHALL display the error message "SEND TIMEOUT"
Thoughts: This is testing timeout handling. Timeouts should show specific message.
Testable: yes - example

8.3 WHEN the Backend_System returns an error response, THE Pager_App SHALL display a user-friendly error message based on the error type
Thoughts: This is testing error message mapping. For any backend error, a friendly message should be shown.
Testable: yes - property

8.4 WHEN an error occurs, THE Pager_App SHALL retain the message text in the Message_Composer so the User can retry
Thoughts: This is testing error recovery. For any error, the message should be preserved.
Testable: yes - property

8.5 WHEN an error message is displayed, THE Pager_App SHALL automatically clear it after 3 seconds
Thoughts: This is testing error message timeout. For any error, it should clear after 3 seconds.
Testable: yes - property

9.1 WHEN the Individual_Chat_Screen loads, THE Pager_App SHALL request the message history for the selected Friend from the Backend_System
Thoughts: This is testing initial data loading. On mount, history should be requested.
Testable: yes - example

9.2 WHEN the Backend_System receives a message history request, THE Backend_System SHALL return the most recent 50 messages between the two Users
Thoughts: This is testing backend query behavior. For any history request, max 50 messages should be returned.
Testable: yes - property

9.3 THE Pager_App SHALL display message history above the Message_Composer in chronological order (oldest at top)
Thoughts: This is testing message ordering. For any message history, messages should be sorted by timestamp.
Testable: yes - property

9.4 THE Pager_App SHALL display each message with the sender's display name or code and timestamp
Thoughts: This is testing message rendering. For any message, sender and timestamp should be shown.
Testable: yes - property

9.5 THE Pager_App SHALL visually distinguish sent messages from received messages using alignment or indicators
Thoughts: This is testing visual differentiation. Sent and received messages should have different styling.
Testable: yes - property

9.6 WHEN new messages are sent or received, THE Pager_App SHALL append them to the message history and scroll to show the latest message
Thoughts: This is testing dynamic updates. For any new message, it should be added and scrolled into view.
Testable: yes - property

9.7 WHEN the message history is empty, THE Pager_App SHALL display "NO MESSAGES YET" in the history area
Thoughts: This is testing empty state. With no messages, a specific message should be shown.
Testable: yes - example

### Property Reflection

After reviewing all properties, the following redundancies were identified:

- **Properties 3.5 and 3.6** are redundant - both test the 500 character limit. Property 3.5 is sufficient.
- **Properties 3.2 and 3.3** test similar scroll behavior (horizontal vs vertical). These can be combined into a single property about keeping the cursor visible.
- **Properties 6.1 and 6.2** test similar feedback behavior (haptic vs audio). These can be combined into a single property about feedback triggering.

After consolidation, we have the following unique properties:

### Correctness Properties

Property 1: T9 key press cycles characters
*For any* number key (2-9) and any number of consecutive presses within 1 second, the displayed character should cycle through the key's character set (letters then number) in order
**Validates: Requirements 2.1, 2.2**

Property 2: Character confirmation on timeout or key change
*For any* sequence of T9 key presses where either a different key is pressed or more than 1 second elapses, the current character should be confirmed and the cursor should advance
**Validates: Requirements 2.3, 2.7**

Property 3: Backspace removes last character
*For any* non-empty message text, pressing the # key should remove the last character
**Validates: Requirements 2.6**

Property 4: Message text display with cursor
*For any* message text and cursor position, the Message_Composer should display the text with a visible cursor at the specified position
**Validates: Requirements 2.8**

Property 5: Cursor remains visible during scroll
*For any* message text that exceeds the visible area of the Message_Composer, the display should scroll to keep the cursor visible
**Validates: Requirements 3.2, 3.3**

Property 6: Message length limit enforcement
*For any* message at 500 characters, additional character input should be rejected and the message length should remain at 500
**Validates: Requirements 3.5, 3.6**

Property 7: Non-empty message triggers send
*For any* non-empty message text, pressing the call button should trigger the send operation to the Backend_System
**Validates: Requirements 4.1**

Property 8: Successful send clears composer
*For any* message that is successfully sent, the Message_Composer should be cleared and display a "SENT" confirmation
**Validates: Requirements 4.4**

Property 9: Failed send preserves message
*For any* message send operation that fails, the message text should be retained in the Message_Composer and an error message should be displayed
**Validates: Requirements 4.5, 8.4**

Property 10: Whitespace trimming before send
*For any* message text with leading or trailing whitespace, the sent message should have that whitespace removed
**Validates: Requirements 5.1**

Property 11: Whitespace-only messages rejected
*For any* message text consisting only of whitespace characters, pressing the call button should be ignored and no send operation should occur
**Validates: Requirements 5.2**

Property 12: Invalid character filtering
*For any* message text containing characters outside the allowed set (a-z, A-Z, 0-9, space, . , ! ? ' " -), those invalid characters should be removed before sending
**Validates: Requirements 5.5**

Property 13: Feedback triggers on key press
*For any* number key press on the ChatNumPad, haptic feedback should trigger if vibration is enabled and audio feedback should trigger if sound is enabled
**Validates: Requirements 6.1, 6.2**

Property 14: Success feedback on send completion
*For any* successfully completed message send operation, a success haptic pattern should trigger
**Validates: Requirements 6.4**

Property 15: Error feedback on send failure
*For any* failed message send operation, an error haptic pattern should trigger
**Validates: Requirements 6.5**

Property 16: Error message auto-clear
*For any* error message displayed, it should automatically clear after 3 seconds
**Validates: Requirements 8.5**

Property 17: Message history chronological ordering
*For any* message history returned from the Backend_System, messages should be displayed in chronological order with oldest at the top
**Validates: Requirements 9.3**

Property 18: Message display includes metadata
*For any* message in the history, the display should include the sender's display name or code and the timestamp
**Validates: Requirements 9.4**

Property 19: Visual distinction between sent and received
*For any* message in the history, sent messages should be visually distinguished from received messages through alignment or styling
**Validates: Requirements 9.5**

Property 20: New messages append and scroll
*For any* new message (sent or received), it should be appended to the message history and the view should scroll to show the latest message
**Validates: Requirements 9.6**

## Error Handling

### Input Validation Errors

- **Empty message**: Silently ignore send action (no error shown)
- **Whitespace-only message**: Silently ignore send action (no error shown)
- **Message too long**: Prevent additional input at 500 characters (no error shown)
- **Invalid characters**: Automatically filter before sending (no error shown)

### Network Errors

- **Network unreachable**: Display "NETWORK ERROR", retain message, allow retry
- **Request timeout (10s)**: Display "SEND TIMEOUT", retain message, allow retry
- **Server error (5xx)**: Display "SERVER ERROR", retain message, allow retry
- **Client error (4xx)**: Display specific error message based on error code, retain message

### Error Display Pattern

1. Set sendStatus to 'error'
2. Set errorMessage to user-friendly text
3. Trigger error haptic feedback
4. Display error in Message_Composer status area
5. After 3 seconds, clear error and reset to 'idle'
6. Message text remains in composer for retry

### Error Code Mapping

```typescript
const ERROR_MESSAGES: Record<string, string> = {
  'NETWORK_ERROR': 'NETWORK ERROR',
  'TIMEOUT': 'SEND TIMEOUT',
  'SERVER_ERROR': 'SERVER ERROR',
  'INVALID_RECIPIENT': 'FRIEND NOT FOUND',
  'MESSAGE_TOO_LONG': 'MESSAGE TOO LONG',
  'RATE_LIMIT': 'TOO MANY MESSAGES',
  'UNAUTHORIZED': 'NOT AUTHORIZED',
  'UNKNOWN': 'SEND FAILED',
};
```

## Testing Strategy

### Unit Testing

Unit tests will verify specific examples and edge cases:

1. **Component Rendering**
   - IndividualChatScreen renders with correct props
   - MessageComposer displays initial empty state
   - MessageHistory renders empty state message
   - MessageBubble renders sent vs received styling

2. **T9 Input Edge Cases**
   - Pressing 0 inserts space
   - Pressing 1 inserts "1"
   - Pressing # on empty message does nothing
   - Rapid key presses cycle correctly

3. **Message Validation**
   - Empty message send is ignored
   - Whitespace-only message send is ignored
   - 500 character limit prevents input
   - Invalid characters are filtered

4. **Error Handling**
   - Network error displays correct message
   - Timeout error displays correct message
   - Error clears after 3 seconds
   - Message preserved on error

5. **Navigation**
   - Back button calls onBack callback
   - Friend data passed correctly to screen

### Property-Based Testing

Property-based tests will verify universal properties across many inputs using **fast-check** (JavaScript property testing library):

1. **Property 1: T9 character cycling**
   - Generate: random key (2-9), random press count (1-10)
   - Verify: character cycles through key's character set correctly

2. **Property 3: Backspace removes last character**
   - Generate: random message text (non-empty)
   - Verify: after backspace, message length is original length - 1

3. **Property 6: Message length limit**
   - Generate: random message text at 500 characters
   - Verify: additional input is rejected, length stays 500

4. **Property 10: Whitespace trimming**
   - Generate: random message with random leading/trailing whitespace
   - Verify: sent message has whitespace removed

5. **Property 11: Whitespace-only rejection**
   - Generate: random whitespace-only string
   - Verify: send action is ignored

6. **Property 12: Invalid character filtering**
   - Generate: random message with random invalid characters
   - Verify: sent message has invalid characters removed

7. **Property 17: Message history ordering**
   - Generate: random array of messages with random timestamps
   - Verify: displayed messages are sorted by timestamp (oldest first)

8. **Property 18: Message metadata display**
   - Generate: random message with sender and timestamp
   - Verify: rendered output contains sender name and timestamp

9. **Property 19: Visual distinction**
   - Generate: random message with random isSent flag
   - Verify: styling differs based on isSent value

Each property test will run a minimum of 100 iterations to ensure comprehensive coverage across the input space.

### Integration Testing

Integration tests will verify the interaction between components:

1. **T9 Input to Message Composer**
   - Type message using T9 input
   - Verify message appears in composer

2. **Send Message Flow**
   - Type message, press call button
   - Verify API called with correct data
   - Verify composer cleared on success

3. **Message History Loading**
   - Mount screen with friend data
   - Verify API called to fetch history
   - Verify messages displayed correctly

4. **Error Recovery**
   - Trigger send error
   - Verify error displayed
   - Verify message preserved
   - Retry send successfully

### Testing Tools

- **Jest**: Unit test runner
- **React Native Testing Library**: Component testing
- **fast-check**: Property-based testing library
- **MSW (Mock Service Worker)**: API mocking for integration tests

### Test Coverage Goals

- Unit tests: 80% code coverage
- Property tests: All correctness properties implemented
- Integration tests: All user flows covered
- Edge cases: All error conditions tested
