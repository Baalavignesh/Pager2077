# Requirements Document

## Introduction

The Retro Pager Voice App is a minimalist React Native mobile application that recreates the nostalgic experience of 90s beeper/pager communication with modern voice messaging capabilities. Users receive a unique hexadecimal identifier upon installation, can add friends via their hex codes, and send quick voice notes in a retro monochrome interface. The system emphasizes simplicity with a single-screen design, temporary message storage, and instant voice playback notifications.

## Glossary

- **Pager_App**: The React Native mobile application
- **Backend_System**: The Bun-based backend server (SQLite database, S3-compatible object storage, APNS integration)
- **User**: An individual who has installed the Pager_App
- **Hex_Code**: A unique hexadecimal identifier automatically assigned to each User upon first app launch
- **Friend_Request**: A pending invitation sent from one User to another User using their Hex_Code
- **Friendship**: An accepted bidirectional relationship between two Users
- **Voice_Note**: A temporary audio recording sent from one User to another User
- **Friend_List**: A scrollable UI component displaying all accepted Friendships with online/offline status
- **Recording_Session**: The active state when a User is capturing audio via the talk button
- **Pager_Screen**: The main display area showing User information, Friend_List, and Voice_Note controls

## Requirements

### Requirement 1: User Identity Management

**User Story:** As a new user, I want to receive a unique identifier when I first open the app, so that I can share it with friends and be discoverable.

#### Acceptance Criteria

1.1 WHEN the Pager_App launches for the first time on a device, THE Backend_System SHALL generate a unique Hex_Code consisting of 8 hexadecimal characters

1.2 WHEN the Pager_App requests User registration, THE Backend_System SHALL store the Hex_Code with device token and creation timestamp in the database within 2 seconds

1.3 THE Pager_App SHALL display the User's Hex_Code prominently on the Pager_Screen at all times

1.4 WHEN a User taps on their displayed Hex_Code, THE Pager_App SHALL copy the Hex_Code to the device clipboard

1.5 WHEN the Pager_App launches on a device with existing User data, THE Pager_App SHALL retrieve and display the stored Hex_Code without generating a new one

### Requirement 2: Friend Request Management

**User Story:** As a user, I want to send and receive friend requests using hex codes, so that I can build my contact list.

#### Acceptance Criteria

2.1 WHEN a User taps the add friend button on the Pager_Screen, THE Pager_App SHALL display an input field for entering a Hex_Code

2.2 WHEN a User submits a valid Hex_Code that exists in the Backend_System, THE Backend_System SHALL create a Friend_Request with status "pending" within 2 seconds

2.3 WHEN a User submits a Hex_Code that does not exist, THE Pager_App SHALL display an error message "User not found"

2.4 WHEN a User submits their own Hex_Code, THE Pager_App SHALL display an error message "Cannot add yourself"

2.5 THE Pager_App SHALL display all pending incoming Friend_Requests in a dedicated section of the Pager_Screen

2.6 WHEN a User taps accept on a Friend_Request, THE Backend_System SHALL update the Friend_Request status to "accepted" and create a bidirectional Friendship within 2 seconds

2.7 WHEN a User taps reject on a Friend_Request, THE Backend_System SHALL update the Friend_Request status to "rejected" and remove it from the pending list within 2 seconds

2.8 WHEN a Friendship is created, THE Pager_App SHALL add the new friend to the Friend_List immediately

### Requirement 3: Friend List Display

**User Story:** As a user, I want to see my friends in a scrollable list with their online status, so that I can select who to send voice notes to.

#### Acceptance Criteria

3.1 THE Pager_App SHALL display all accepted Friendships in the Friend_List using a vertically scrollable interface similar to iOS alarm picker style

3.2 WHEN the Backend_System receives User status updates, THE Pager_App SHALL display each friend's online or offline status in real-time with a visual indicator

3.3 WHEN a User scrolls through the Friend_List, THE Pager_App SHALL highlight the currently centered friend entry

3.4 WHEN a User taps on a friend entry in the Friend_List, THE Pager_App SHALL select that friend as the active recipient for voice messaging

3.5 WHEN the Friend_List contains zero Friendships, THE Pager_App SHALL display the message "No friends yet. Add a friend to start!"

### Requirement 4: Voice Note Recording

**User Story:** As a user, I want to record voice notes by pressing and releasing a talk button, so that I can send quick audio messages to my selected friend.

#### Acceptance Criteria

4.1 WHEN no friend is selected from the Friend_List, THE Pager_App SHALL disable the talk button and display it in an inactive visual state

4.2 WHEN a friend is selected from the Friend_List, THE Pager_App SHALL enable the talk button and display it in an active visual state

4.3 WHEN a User taps the enabled talk button, THE Pager_App SHALL start a Recording_Session and change the button label to "Stop"

4.4 WHILE a Recording_Session is active, THE Pager_App SHALL capture audio from the device microphone

4.5 WHEN a User taps the stop button during a Recording_Session, THE Pager_App SHALL end the Recording_Session and display three action buttons: Clear, Play, and Send

4.6 WHEN a User taps the Clear button, THE Pager_App SHALL discard the recorded audio and return to the initial talk button state

4.7 WHEN a User taps the Play button, THE Pager_App SHALL play the recorded audio through the device speaker

4.8 THE Pager_App SHALL limit Recording_Session duration to 60 seconds maximum

### Requirement 5: Voice Note Transmission

**User Story:** As a user, I want to send recorded voice notes to my selected friend, so that they can hear my message immediately.

#### Acceptance Criteria

5.1 WHEN a User taps the Send button with a valid recording, THE Pager_App SHALL upload the audio file to the Backend_System within 5 seconds

5.2 WHEN the Backend_System receives a Voice_Note upload, THE Backend_System SHALL store the audio file in S3 with a 48-hour expiration policy

5.3 WHEN the Backend_System successfully stores a Voice_Note, THE Backend_System SHALL send a push notification to the recipient User's device within 2 seconds

5.4 WHEN the Voice_Note send operation completes successfully, THE Pager_App SHALL display a confirmation message and return to the initial talk button state

5.5 WHEN the Voice_Note send operation fails, THE Pager_App SHALL display an error message and retain the recording with Clear, Play, and Send buttons available

### Requirement 6: Voice Note Reception and Playback

**User Story:** As a user, I want to receive voice notes from my friends with immediate audio playback, so that I can hear their messages like a real pager beep.

#### Acceptance Criteria

6.1 WHEN the Pager_App is in the foreground and receives a Voice_Note notification, THE Pager_App SHALL play a beep sound followed by automatic playback of the Voice_Note audio within 1 second

6.2 WHEN the Pager_App is in the background and receives a Voice_Note notification, THE Pager_App SHALL display a system notification with the sender's Hex_Code

6.3 WHEN a User taps a Voice_Note system notification, THE Pager_App SHALL open to the Pager_Screen and automatically play the Voice_Note audio within 2 seconds

6.4 WHEN the Backend_System delivers a Voice_Note, THE Backend_System SHALL provide a temporary download URL valid for 48 hours

6.5 WHEN a Voice_Note playback completes, THE Pager_App SHALL return to the default Pager_Screen state

### Requirement 7: Retro User Interface Design

**User Story:** As a user, I want the app to look like a 90s monochrome pager, so that I can enjoy a nostalgic aesthetic experience.

#### Acceptance Criteria

7.1 THE Pager_App SHALL use a monochrome color scheme with pixelated fonts reminiscent of 90s beeper displays

7.2 THE Pager_App SHALL display all interactive elements as large, bulky buttons with clear visual boundaries

7.3 THE Pager_App SHALL organize the Pager_Screen with a display area at the top and control buttons at the bottom

7.4 THE Pager_App SHALL use a single-screen layout without navigation to other screens

7.5 THE Pager_App SHALL render all UI components with sharp edges and geometric shapes consistent with retro electronic device aesthetics

### Requirement 8: Backend Infrastructure

**User Story:** As a system administrator, I want a simple backend server that handles all operations, so that deployment and maintenance are straightforward.

#### Acceptance Criteria

8.1 THE Backend_System SHALL run as a singleton Bun server using TypeScript

8.2 THE Backend_System SHALL expose RESTful HTTP endpoints for all API operations

8.3 THE Backend_System SHALL use SQLite for relational data storage with tables for Users, Friendships, Friend_Requests, and Voice_Note metadata

8.4 THE Backend_System SHALL use S3-compatible object storage for Voice_Note audio file storage with automatic lifecycle deletion after 48 hours

8.5 THE Backend_System SHALL use APNS (Apple Push Notification Service) for push notification delivery to iOS devices

8.6 THE Backend_System SHALL store the SQLite database file in the backend directory

8.7 THE Backend_System SHALL implement database schema with foreign keys and indexes to support future feature expansion

### Requirement 9: Real-Time Status Updates

**User Story:** As a user, I want to see when my friends are online or offline, so that I know if they are available to receive messages.

#### Acceptance Criteria

9.1 WHEN a User opens the Pager_App, THE Pager_App SHALL send a status update to the Backend_System marking the User as online

9.2 WHEN a User closes or backgrounds the Pager_App, THE Pager_App SHALL send a status update to the Backend_System marking the User as offline

9.3 WHEN the Backend_System receives a status update, THE Backend_System SHALL broadcast the status change to all of that User's friends within 3 seconds

9.4 THE Pager_App SHALL poll the Backend_System for friend status updates every 30 seconds while in the foreground

9.5 THE Pager_App SHALL display online friends with a distinct visual indicator different from offline friends in the Friend_List
