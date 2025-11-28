# Requirements Document

## Introduction

This document specifies the requirements for adding user display names to the Pager2077 frontend application. Currently, users are identified solely by their 6-digit hexadecimal codes throughout the application. This feature will allow users to set a display name during first-time setup, which will be stored locally and shown in place of hex codes in the friends list, friend requests, and messages screens for improved readability and user experience.

**Note:** This specification covers only the frontend implementation. Backend API integration will be implemented separately.

## Glossary

- **User**: An individual who has registered with the Pager2077 application
- **Display Name**: A human-readable text string chosen by the user to identify themselves
- **Hex Code**: A unique 6-digit hexadecimal identifier automatically assigned to each user upon registration
- **First-Time Setup**: The initial configuration flow that occurs when a user first launches the application after registration
- **Frontend**: The React Native mobile application running on the user's device
- **Secure Storage**: The device's secure credential storage system (react-native-keychain)
- **Local Storage**: Client-side storage for user preferences and display name mappings

## Requirements

### Requirement 1

**User Story:** As a new user, I want to set my display name when I first use the app, so that my friends can identify me by a readable name instead of just a hex code.

#### Acceptance Criteria

1. WHEN a user completes registration and has no stored display name THEN the Frontend SHALL display a name entry screen before showing the main menu
2. WHEN the name entry screen is displayed THEN the Frontend SHALL show a text input field with a numpad interface for entering the display name
3. WHEN a user enters a valid display name and confirms THEN the Frontend SHALL store the display name in Secure Storage and proceed to the main menu
4. WHEN a user has previously set a display name THEN the Frontend SHALL skip the name entry screen and proceed directly to the main menu
5. WHEN a display name is stored THEN the Frontend SHALL associate it with the user's hex code in Local Storage

### Requirement 2

**User Story:** As a user, I want to store display names for my friends locally, so that I can see readable names even before backend integration is complete.

#### Acceptance Criteria

1. WHEN the Frontend receives friend data with hex codes THEN the Frontend SHALL check Local Storage for associated display names
2. WHEN a display name mapping exists for a hex code THEN the Frontend SHALL use the display name for display purposes
3. WHEN no display name mapping exists for a hex code THEN the Frontend SHALL display the hex code as a fallback
4. WHEN the Frontend stores a display name THEN the Frontend SHALL validate the display name is between 1 and 20 characters
5. WHEN the Frontend stores a display name THEN the Frontend SHALL persist the hex-code-to-display-name mapping in Local Storage

### Requirement 3

**User Story:** As a user, I want to see my friends' display names in the friends list, so that I can quickly identify who is who without memorizing hex codes.

#### Acceptance Criteria

1. WHEN the Frontend displays the friends list THEN the Frontend SHALL show each friend's display name if available in Local Storage
2. WHEN a friend has no display name mapping THEN the Frontend SHALL display their hex code as a fallback
3. WHEN displaying a friend entry THEN the Frontend SHALL show the display name in the primary position
4. WHEN the Frontend renders the friends list THEN the Frontend SHALL look up display names for all friend hex codes from Local Storage

### Requirement 4

**User Story:** As a user, I want to see display names in friend requests, so that I can recognize who is requesting to be my friend.

#### Acceptance Criteria

1. WHEN the Frontend displays pending friend requests THEN the Frontend SHALL show the requester's display name if available in Local Storage
2. WHEN a requester has no display name mapping THEN the Frontend SHALL display their hex code as a fallback
3. WHEN displaying a friend request THEN the Frontend SHALL show the display name prominently to aid recognition
4. WHEN the Frontend renders friend requests THEN the Frontend SHALL look up display names for all requester hex codes from Local Storage

### Requirement 5

**User Story:** As a user, I want to see display names in my messages, so that I know who sent each message without having to remember hex codes.

#### Acceptance Criteria

1. WHEN the Frontend displays the messages list THEN the Frontend SHALL show the sender's display name if available in Local Storage
2. WHEN a sender has no display name mapping THEN the Frontend SHALL display their hex code as a fallback
3. WHEN displaying a message entry THEN the Frontend SHALL show the sender's display name in the message header
4. WHEN the Frontend renders messages THEN the Frontend SHALL look up display names for all sender hex codes from Local Storage

### Requirement 6

**User Story:** As a user, I want to change my display name from the settings screen, so that I can update how I appear to my friends.

#### Acceptance Criteria

1. WHEN a user navigates to the settings screen THEN the Frontend SHALL display an option to edit the display name
2. WHEN a user selects the edit display name option THEN the Frontend SHALL show the name entry interface with the current display name pre-filled
3. WHEN a user updates their display name THEN the Frontend SHALL validate the new display name locally
4. WHEN a display name passes validation THEN the Frontend SHALL update the locally stored display name in Secure Storage
5. WHEN a display name is successfully updated THEN the Frontend SHALL update the hex-code-to-display-name mapping in Local Storage

### Requirement 7

**User Story:** As a user, I want my display name to be validated, so that I know if my chosen name is acceptable.

#### Acceptance Criteria

1. WHEN the Frontend receives a display name input THEN the Frontend SHALL verify the display name length is between 1 and 20 characters
2. WHEN the Frontend receives a display name input THEN the Frontend SHALL verify the display name contains only alphanumeric characters, spaces, hyphens, and underscores
3. WHEN a display name fails validation THEN the Frontend SHALL display an error message to the user
4. WHEN a display name contains only whitespace characters THEN the Frontend SHALL reject the display name as invalid
5. WHEN validation passes THEN the Frontend SHALL allow the user to proceed with saving the display name

### Requirement 8

**User Story:** As a user, I want the name entry interface to use the numpad, so that I can enter my name using the same familiar interface as the rest of the app.

#### Acceptance Criteria

1. WHEN the name entry screen is displayed THEN the Frontend SHALL show the numpad interface for text input
2. WHEN a user presses number keys on the numpad THEN the Frontend SHALL enter characters using T9-style text entry with multi-tap functionality
3. WHEN a user presses the hash key THEN the Frontend SHALL delete the last character from the input
4. WHEN a user presses the call button THEN the Frontend SHALL validate and submit the entered display name
5. WHEN a user presses the back button on first-time setup THEN the Frontend SHALL use the hex code as the default display name and proceed to main menu

---

## Notes for Backend Implementation

When the backend team is ready to implement server-side display name support, the following changes will be needed:

### Database Schema Changes
Add a `display_name` column to the `users` table:
```sql
ALTER TABLE users ADD COLUMN display_name TEXT;
CREATE INDEX idx_users_display_name ON users(display_name);
```

### API Endpoints to Add/Modify

1. **Update User Profile** - `PUT /users/me`
   - Accept `{ displayName: string }` in request body
   - Validate display name (1-20 chars, alphanumeric + spaces/hyphens/underscores)
   - Update user record in database
   - Return updated user object

2. **Get Friends List** - `GET /friends` (modify existing)
   - Include `displayName` field for each friend in response
   - Fall back to hex code if display name is null

3. **Get Friend Requests** - `GET /friend-requests` (modify existing)
   - Include `displayName` field for requester in response
   - Fall back to hex code if display name is null

4. **Get Messages** - `GET /messages` (modify existing)
   - Include `displayName` field for sender in response
   - Fall back to hex code if display name is null

### Validation Rules
- Length: 1-20 characters
- Allowed characters: alphanumeric, spaces, hyphens, underscores
- Reject whitespace-only names
- Trim leading/trailing whitespace before storage

### Response Format Example
```typescript
{
  success: true,
  data: {
    friends: [
      {
        id: "uuid",
        hexCode: "A1B2C3",
        displayName: "Alice",  // New field
        status: "online"
      }
    ]
  }
}
```

### Migration Strategy
1. Add column with NULL default (existing users have no display name)
2. Frontend handles NULL by showing hex code
3. Users can set display name through settings
4. No data migration needed - users set names organically
