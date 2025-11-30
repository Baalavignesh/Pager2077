# Requirements Document

## Introduction

This specification defines the requirements for fully integrating the Pager2077 frontend (React Native/Expo) with the backend (Bun/SQLite). Currently, the frontend uses mock/dummy data for friends, messages, and friend requests. The goal is to replace all dummy data with real API calls, implement proper user authentication flow, add messaging functionality with Live Activity push notifications, and store Live Activity tokens for remote updates.

## Glossary

- **Pager2077_System**: The complete Pager2077 application including frontend and backend components
- **Frontend**: The React Native/Expo mobile application
- **Backend**: The Bun-based API server with SQLite database
- **Hex_Code**: A unique 8-character identifier assigned to each user (e.g., "BF010BA2")
- **Device_Token**: The APNS token used for push notifications
- **Live_Activity_Token**: The push token specific to iOS Live Activities for remote updates
- **Auth_Token**: JWT token used for API authentication
- **Display_Name**: User-chosen name (1-20 characters) shown instead of hex code
- **Friend_Request**: A pending invitation from one user to another to become friends
- **Friendship**: A confirmed bidirectional relationship between two users
- **Message**: A text message sent between friends (max 500 characters)
- **Live_Activity**: iOS feature showing real-time updates on lock screen and Dynamic Island

## Requirements

### Requirement 1

**User Story:** As a new user, I want to automatically register when I first open the app, so that I can start using the pager without manual sign-up.

#### Acceptance Criteria

1. WHEN the app launches for the first time THEN the Pager2077_System SHALL request push notification permissions from iOS
2. WHEN push notification permissions are granted THEN the Pager2077_System SHALL obtain the APNS device token
3. WHEN the device token is obtained THEN the Pager2077_System SHALL send a registration request to the backend with the device token
4. WHEN registration succeeds THEN the Pager2077_System SHALL store the user credentials (userId, hexCode, authToken, deviceToken) in secure storage
5. WHEN registration succeeds THEN the Pager2077_System SHALL display the assigned hex code on the MY HEX screen
6. IF registration fails due to network error THEN the Pager2077_System SHALL display an error message and allow retry

### Requirement 2

**User Story:** As a returning user, I want my credentials to persist across app restarts, so that I don't need to re-register.

#### Acceptance Criteria

1. WHEN the app launches THEN the Pager2077_System SHALL check secure storage for existing credentials
2. WHEN valid credentials exist THEN the Pager2077_System SHALL restore the authentication state without re-registering
3. WHEN stored credentials are found THEN the Pager2077_System SHALL validate the auth token with the backend
4. IF the auth token is expired or invalid THEN the Pager2077_System SHALL re-register the user with the stored device token

### Requirement 3

**User Story:** As a user, I want to see my real friends list from the server, so that I can communicate with actual friends instead of dummy data.

#### Acceptance Criteria

1. WHEN the user navigates to the FRIENDS screen THEN the Pager2077_System SHALL fetch the friends list from the backend API
2. WHEN the friends list is fetched THEN the Pager2077_System SHALL display each friend's hex code or display name
3. WHEN the friends list is fetched THEN the Pager2077_System SHALL display each friend's online/offline status
4. WHEN the friends list is empty THEN the Pager2077_System SHALL display "NO FRIENDS YET" message
5. IF the friends list fetch fails THEN the Pager2077_System SHALL display an error message and allow retry

### Requirement 4

**User Story:** As a user, I want to send friend requests using a 6-digit code, so that I can add new friends.

#### Acceptance Criteria

1. WHEN the user enters a 6-digit hex code and presses the call button THEN the Pager2077_System SHALL send a friend request to the backend
2. WHEN the friend request is sent successfully THEN the Pager2077_System SHALL display a success message and return to the friends screen
3. IF the hex code does not exist THEN the Pager2077_System SHALL display "USER NOT FOUND" error
4. IF a friend request already exists THEN the Pager2077_System SHALL display "REQUEST ALREADY SENT" error
5. IF the users are already friends THEN the Pager2077_System SHALL display "ALREADY FRIENDS" error

### Requirement 5

**User Story:** As a user, I want to see and respond to pending friend requests, so that I can accept or reject friendship invitations.

#### Acceptance Criteria

1. WHEN the user navigates to the FRIEND REQUESTS screen THEN the Pager2077_System SHALL fetch pending requests from the backend
2. WHEN pending requests exist THEN the Pager2077_System SHALL display each requester's hex code or display name
3. WHEN the user accepts a friend request THEN the Pager2077_System SHALL send an accept request to the backend
4. WHEN the user rejects a friend request THEN the Pager2077_System SHALL send a reject request to the backend
5. WHEN a friend request is accepted THEN the Pager2077_System SHALL add the new friend to the friends list
6. WHEN a friend request is accepted or rejected THEN the Pager2077_System SHALL remove the request from the pending list

### Requirement 6

**User Story:** As a user, I want to send text messages to my friends, so that I can communicate with them.

#### Acceptance Criteria

1. WHEN the user composes a message and presses the call button THEN the Pager2077_System SHALL send the message to the backend
2. WHEN the message is sent successfully THEN the Pager2077_System SHALL clear the composer and display "SENT" confirmation
3. WHEN the message is sent successfully THEN the Pager2077_System SHALL update the conversation state to "WAITING FOR REPLY"
4. IF the message send fails due to network error THEN the Pager2077_System SHALL display "NETWORK ERROR" and allow retry
5. IF the message send times out THEN the Pager2077_System SHALL display "TIMEOUT" error

### Requirement 7

**User Story:** As a user, I want to see my message history with each friend, so that I can view past conversations.

#### Acceptance Criteria

1. WHEN the user opens a chat with a friend THEN the Pager2077_System SHALL fetch the latest message from the backend
2. WHEN messages exist THEN the Pager2077_System SHALL display the most recent message with sender and timestamp
3. WHEN no messages exist THEN the Pager2077_System SHALL display "NO MESSAGES"
4. WHEN a new message is received THEN the Pager2077_System SHALL update the conversation display

### Requirement 8

**User Story:** As a user, I want to receive push notifications when someone sends me a message and Live Activity is not available, so that I know when new messages arrive.

#### Acceptance Criteria

1. WHEN a user sends a message AND the recipient does not have Live Activity enabled THEN the Backend SHALL queue a push notification for the recipient
2. WHEN the push notification is processed THEN the Backend SHALL send an APNS alert notification to the recipient's device
3. WHEN the notification is received THEN the Pager2077_System SHALL display the notification banner with sender and message preview
4. WHEN the user taps the notification THEN the Pager2077_System SHALL navigate to the chat with that friend
5. WHEN the recipient has Live Activity enabled THEN the Backend SHALL NOT send a regular push notification (Live Activity takes priority)

### Requirement 9

**User Story:** As a user, I want Live Activities to auto-start on my lock screen when I receive a message, so that I can see messages without opening the app.

#### Acceptance Criteria

1. WHEN the app starts THEN the Pager2077_System SHALL check if Live Activities are enabled on the device
2. WHEN Live Activities are enabled THEN the Pager2077_System SHALL obtain the Live Activity push token for remote start
3. WHEN the Live Activity push token is obtained THEN the Pager2077_System SHALL send the token to the backend for storage
4. WHEN a message is received AND the recipient has a Live Activity token THEN the Backend SHALL send a push-to-start notification to auto-start the Live Activity
5. WHEN the Live Activity is auto-started THEN the iOS system SHALL display the pager-style message on the lock screen and Dynamic Island without user interaction
6. WHEN the user opens the app from Live Activity THEN the Pager2077_System SHALL navigate to the relevant chat
7. WHEN the Live Activity token becomes invalid THEN the Backend SHALL fall back to regular push notifications

### Requirement 10

**User Story:** As a user, I want to see unread messages in my MESSAGES screen, so that I can quickly see who has messaged me.

#### Acceptance Criteria

1. WHEN the user navigates to the MESSAGES screen THEN the Pager2077_System SHALL fetch conversations with unread messages from the backend
2. WHEN unread messages exist THEN the Pager2077_System SHALL display each sender's hex code or display name
3. WHEN the user selects a conversation THEN the Pager2077_System SHALL navigate to the chat with that friend
4. WHEN no unread messages exist THEN the Pager2077_System SHALL display "NO MESSAGES"

### Requirement 11

**User Story:** As a new user, I want to set my display name during onboarding, so that my friends can identify me by name.

#### Acceptance Criteria

1. WHEN the user completes the name entry screen THEN the Pager2077_System SHALL send the display name to the backend
2. WHEN the display name is saved THEN the Backend SHALL store the display name in the users table
3. WHEN the user skips the name entry THEN the Pager2077_System SHALL use the hex code as the default display name
4. IF the display name save fails THEN the Pager2077_System SHALL display an error and allow retry

### Requirement 12

**User Story:** As a user, I want to edit my display name in settings, so that I can change how my friends see me.

#### Acceptance Criteria

1. WHEN the user edits their display name in settings THEN the Pager2077_System SHALL send the updated name to the backend
2. WHEN the display name is updated THEN the Backend SHALL update the display name in the users table
3. WHEN the display name is updated THEN the Pager2077_System SHALL update the local display name state

### Requirement 13

**User Story:** As a user, I want to see my friends' display names, so that I can identify them easily.

#### Acceptance Criteria

1. WHEN fetching friends list THEN the Backend SHALL include each friend's display name in the response
2. WHEN fetching friend requests THEN the Backend SHALL include the requester's display name in the response
3. WHEN fetching messages THEN the Backend SHALL include the sender's display name in the response
4. WHEN displaying a friend THEN the Pager2077_System SHALL show their display name if available, otherwise show hex code

### Requirement 14

**User Story:** As a user, I want to update my online/offline status, so that my friends know when I'm available.

#### Acceptance Criteria

1. WHEN the app becomes active THEN the Pager2077_System SHALL update the user's status to "online" on the backend
2. WHEN the app goes to background THEN the Pager2077_System SHALL update the user's status to "offline" on the backend
3. WHEN a friend's status changes THEN the Backend SHALL send a silent notification to update the friends list

### Requirement 15

**User Story:** As a developer, I want the backend to support messaging endpoints, so that the frontend can send and receive messages.

#### Acceptance Criteria

1. WHEN a POST request is made to /api/messages THEN the Backend SHALL create a new message record
2. WHEN a GET request is made to /api/messages/:friendId THEN the Backend SHALL return the message history
3. WHEN a message is created AND the recipient has a Live Activity token THEN the Backend SHALL send a push-to-start Live Activity notification
4. WHEN a message is created AND the recipient does not have a Live Activity token THEN the Backend SHALL queue a regular push notification

### Requirement 16

**User Story:** As a developer, I want the backend to store Live Activity tokens, so that remote Live Activity updates can be sent.

#### Acceptance Criteria

1. WHEN a PUT request is made to /api/users/live-activity-token THEN the Backend SHALL store the Live Activity push token
2. WHEN sending a Live Activity update THEN the Backend SHALL use the stored Live Activity token
3. WHEN the Live Activity token is invalid THEN the Backend SHALL remove the token from storage

### Requirement 17

**User Story:** As a developer, I want the backend to support display name endpoints, so that users can set and update their names.

#### Acceptance Criteria

1. WHEN a PUT request is made to /api/users/display-name THEN the Backend SHALL update the user's display name
2. WHEN the display name is updated THEN the Backend SHALL return the updated user data
3. IF the display name is invalid (empty, too long, invalid characters) THEN the Backend SHALL return a validation error
