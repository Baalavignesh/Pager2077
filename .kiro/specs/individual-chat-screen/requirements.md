# Requirements Document

## Introduction

The Individual Chat Screen feature enables users to compose and send text messages to specific friends using a T9-style numpad interface. When a user selects a friend from the Messages screen, they enter a dedicated chat interface where they can type messages using multi-tap T9 input and send them via the call button. This feature extends the existing Pager2077 messaging system with text-based communication while maintaining the retro aesthetic.

## Glossary

- **Pager_App**: The React Native mobile application
- **Individual_Chat_Screen**: The dedicated screen for composing and sending messages to a specific friend
- **T9_Input**: Multi-tap text entry system where number keys cycle through letters (e.g., 2 = a→b→c→2)
- **ChatNumPad**: The numpad component designed for T9 text input with all number keys (0-9) used for typing
- **ChatPagerBody**: The full-height metallic container component that wraps the ChatNumPad
- **Message_Composer**: The text input area where the user's typed message is displayed
- **Friend**: A user with an accepted bidirectional friendship relationship
- **Backend_System**: The Bun-based backend server that handles message transmission
- **Message**: A text-based communication sent from one User to another Friend

## Requirements

### Requirement 1: Chat Screen Navigation

**User Story:** As a user, I want to select a friend from my messages list and enter a chat screen, so that I can compose and send them a text message.

#### Acceptance Criteria

1.1 WHEN a User selects a friend from the Messages screen, THE Pager_App SHALL navigate to the Individual_Chat_Screen for that specific Friend

1.2 WHEN the Individual_Chat_Screen loads, THE Pager_App SHALL display the Friend's display name or six-digit code in the screen title

1.3 WHEN the Individual_Chat_Screen loads, THE Pager_App SHALL display an empty Message_Composer ready for text input

1.4 WHEN the Individual_Chat_Screen loads, THE Pager_App SHALL render the ChatPagerBody component with the ChatNumPad interface

1.5 WHEN a User presses the back button on the Individual_Chat_Screen, THE Pager_App SHALL return to the Messages screen

### Requirement 2: T9 Text Input

**User Story:** As a user, I want to type messages using the numpad with T9 multi-tap input, so that I can compose text messages on the retro interface.

#### Acceptance Criteria

2.1 WHEN a User presses a number key (2-9) on the ChatNumPad, THE Pager_App SHALL cycle through the letters associated with that key followed by the number itself

2.2 WHEN a User presses the same number key multiple times within 1 second, THE Pager_App SHALL replace the current character with the next character in the cycle

2.3 WHEN a User presses a different number key or waits more than 1 second, THE Pager_App SHALL confirm the current character and move the cursor to the next position

2.4 WHEN a User presses the 0 key, THE Pager_App SHALL insert a space character

2.5 WHEN a User presses the 1 key, THE Pager_App SHALL insert the number 1

2.6 WHEN a User presses the # key, THE Pager_App SHALL delete the last character from the Message_Composer

2.7 WHEN a User presses the center circle button on the ChatNumPad, THE Pager_App SHALL confirm the current character and advance the cursor

2.8 THE Pager_App SHALL display the current message text in the Message_Composer with a visible cursor position

### Requirement 3: Message Display

**User Story:** As a user, I want to see my typed message clearly on the screen, so that I can review it before sending.

#### Acceptance Criteria

3.1 THE Pager_App SHALL display the Message_Composer text using the Chicago font consistent with the retro aesthetic

3.2 WHEN the message text exceeds the visible width of the Message_Composer, THE Pager_App SHALL scroll the text horizontally to keep the cursor visible

3.3 WHEN the message text exceeds the visible height of the Message_Composer, THE Pager_App SHALL scroll the text vertically to keep the cursor visible

3.4 THE Pager_App SHALL display a blinking cursor at the current input position

3.5 THE Pager_App SHALL limit message length to 500 characters maximum

3.6 WHEN the message reaches 500 characters, THE Pager_App SHALL prevent further character input and ignore additional key presses

### Requirement 4: Message Sending

**User Story:** As a user, I want to send my composed message by pressing the call button, so that my friend receives my text message.

#### Acceptance Criteria

4.1 WHEN a User presses the call button with a non-empty message, THE Pager_App SHALL send the message text to the Backend_System

4.2 WHEN the message send operation begins, THE Pager_App SHALL display a "SENDING..." indicator in the Message_Composer

4.3 WHEN the Backend_System successfully receives the message, THE Backend_System SHALL store the message with sender ID, recipient ID, message text, and timestamp

4.4 WHEN the message send operation completes successfully, THE Pager_App SHALL clear the Message_Composer and display a brief "SENT" confirmation

4.5 WHEN the message send operation fails, THE Pager_App SHALL display an error message and retain the message text in the Message_Composer

4.6 WHEN a User presses the call button with an empty message, THE Pager_App SHALL ignore the action and provide no feedback

4.7 WHEN the Backend_System stores a message, THE Backend_System SHALL send a push notification to the recipient User within 2 seconds

### Requirement 5: Message Validation

**User Story:** As a user, I want the system to validate my message before sending, so that I don't send invalid or problematic content.

#### Acceptance Criteria

5.1 WHEN a User attempts to send a message, THE Pager_App SHALL trim leading and trailing whitespace from the message text

5.2 WHEN the trimmed message text is empty (only whitespace), THE Pager_App SHALL treat it as an empty message and ignore the send action

5.3 WHEN the message text contains only valid characters (letters, numbers, spaces, basic punctuation), THE Pager_App SHALL proceed with sending

5.4 THE Pager_App SHALL allow the following characters in messages: letters (a-z, A-Z), numbers (0-9), spaces, and basic punctuation (. , ! ? ' " - )

5.5 WHEN the message text contains invalid characters, THE Pager_App SHALL remove those characters before sending

### Requirement 6: Haptic and Audio Feedback

**User Story:** As a user, I want tactile and audio feedback when typing, so that I have confirmation of my key presses.

#### Acceptance Criteria

6.1 WHEN a User presses any number key on the ChatNumPad, THE Pager_App SHALL trigger haptic feedback if vibration is enabled in settings

6.2 WHEN a User presses any number key on the ChatNumPad, THE Pager_App SHALL play a click sound if audio is enabled in settings

6.3 WHEN a User presses the call button to send a message, THE Pager_App SHALL trigger a distinct haptic pattern

6.4 WHEN a message send operation completes successfully, THE Pager_App SHALL trigger a success haptic pattern

6.5 WHEN a message send operation fails, THE Pager_App SHALL trigger an error haptic pattern

### Requirement 7: Screen Layout and Design

**User Story:** As a user, I want the chat screen to maintain the retro pager aesthetic, so that the experience is consistent with the rest of the app.

#### Acceptance Criteria

7.1 THE Individual_Chat_Screen SHALL use the PagerScreen component for the display area with the Friend's identifier as the title

7.2 THE Individual_Chat_Screen SHALL use the ChatPagerBody component to wrap the ChatNumPad interface

7.3 THE Message_Composer SHALL occupy the main content area of the PagerScreen with appropriate padding

7.4 THE Message_Composer SHALL use monochrome colors consistent with the LCD display aesthetic

7.5 THE Individual_Chat_Screen SHALL maintain the same visual style as other screens (scanlines, LCD background, Chicago font)

### Requirement 8: Error Handling

**User Story:** As a user, I want clear error messages when something goes wrong, so that I understand what happened and can take appropriate action.

#### Acceptance Criteria

8.1 WHEN the Backend_System is unreachable, THE Pager_App SHALL display the error message "NETWORK ERROR"

8.2 WHEN the message send operation times out after 10 seconds, THE Pager_App SHALL display the error message "SEND TIMEOUT"

8.3 WHEN the Backend_System returns an error response, THE Pager_App SHALL display a user-friendly error message based on the error type

8.4 WHEN an error occurs, THE Pager_App SHALL retain the message text in the Message_Composer so the User can retry

8.5 WHEN an error message is displayed, THE Pager_App SHALL automatically clear it after 3 seconds

### Requirement 9: Message History Display

**User Story:** As a user, I want to see previous messages in the chat, so that I have context for the conversation.

#### Acceptance Criteria

9.1 WHEN the Individual_Chat_Screen loads, THE Pager_App SHALL request the message history for the selected Friend from the Backend_System

9.2 WHEN the Backend_System receives a message history request, THE Backend_System SHALL return the most recent 50 messages between the two Users

9.3 THE Pager_App SHALL display message history above the Message_Composer in chronological order (oldest at top)

9.4 THE Pager_App SHALL display each message with the sender's display name or code and timestamp

9.5 THE Pager_App SHALL visually distinguish sent messages from received messages using alignment or indicators

9.6 WHEN new messages are sent or received, THE Pager_App SHALL append them to the message history and scroll to show the latest message

9.7 WHEN the message history is empty, THE Pager_App SHALL display "NO MESSAGES YET" in the history area
