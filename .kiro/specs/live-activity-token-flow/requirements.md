# Requirements Document

## Introduction

This document specifies the requirements for analyzing and fixing the Live Activity token flow in the Pager2077 application. The current implementation has a potential logic error where the system may be confusing the Live Activity push-to-start token with the regular APNS device token. These are two distinct tokens with different purposes:

1. **Device Token (APNS)**: Used for regular push notifications (alerts, badges, sounds)
2. **Push-to-Start Token (Live Activity)**: Used specifically to remotely start Live Activities on a user's device (iOS 17.2+)

The push-to-start token is obtained via `Activity<PagerActivityAttributes>.pushToStartTokenUpdates` and must be sent to the backend separately from the device token. The backend must use the correct token type when sending Live Activity push-to-start notifications.

## Glossary

- **Device Token**: A unique identifier provided by APNS for sending regular push notifications to a specific device
- **Push-to-Start Token**: A unique identifier provided by ActivityKit (iOS 17.2+) for remotely starting Live Activities on a device
- **Live Activity**: An iOS feature (iOS 16.1+) that displays real-time information on the lock screen and Dynamic Island
- **Push-to-Start**: The ability to remotely start a Live Activity via a push notification (requires iOS 17.2+)
- **APNS**: Apple Push Notification Service
- **ActivityKit**: Apple's framework for managing Live Activities
- **Content State**: The dynamic data displayed in a Live Activity (sender, message, timestamp, etc.)
- **Attributes**: Static data that defines the Live Activity type

## Requirements

### Requirement 1

**User Story:** As a developer, I want to understand the complete token flow for Live Activities, so that I can identify and fix any logic errors in the current implementation.

#### Acceptance Criteria

1. WHEN analyzing the frontend token registration THEN the analysis SHALL document how the push-to-start token is obtained from ActivityKit
2. WHEN analyzing the frontend token registration THEN the analysis SHALL document how the token is sent to the backend API
3. WHEN analyzing the backend token storage THEN the analysis SHALL document how the liveActivityToken field is stored in the database
4. WHEN analyzing the backend notification sending THEN the analysis SHALL document how the token is used when sending Live Activity push-to-start notifications

### Requirement 2

**User Story:** As a developer, I want to verify that the frontend correctly obtains and sends the push-to-start token, so that the backend receives the correct token for Live Activity notifications.

#### Acceptance Criteria

1. WHEN the frontend obtains a push-to-start token THEN the system SHALL use `Activity<PagerActivityAttributes>.pushToStartTokenUpdates` (not the device token)
2. WHEN the frontend sends the token to the backend THEN the system SHALL use the `/api/users/live-activity-token` endpoint
3. WHEN the frontend registers the token THEN the system SHALL only do so after confirming Live Activities are enabled on the device
4. WHEN the push-to-start token is not available (iOS < 17.2) THEN the system SHALL gracefully handle this and not send an invalid token

### Requirement 3

**User Story:** As a developer, I want to verify that the backend correctly stores and uses the push-to-start token, so that Live Activity notifications are sent to the correct token.

#### Acceptance Criteria

1. WHEN the backend receives a Live Activity token THEN the system SHALL store it in the `live_activity_token` field (separate from `device_token`)
2. WHEN the backend sends a Live Activity push-to-start notification THEN the system SHALL use the `liveActivityToken` field (not the `deviceToken`)
3. WHEN the backend sends a Live Activity notification THEN the system SHALL use the correct APNS topic: `{bundleId}.push-type.liveactivity`
4. WHEN the backend sends a Live Activity notification THEN the system SHALL use push-type `liveactivity` (not `alert` or `background`)

### Requirement 4

**User Story:** As a developer, I want to verify that the APNS payload format is correct for push-to-start notifications, so that iOS correctly starts the Live Activity.

#### Acceptance Criteria

1. WHEN the backend constructs a push-to-start payload THEN the system SHALL include `event: "start"` in the `aps` dictionary
2. WHEN the backend constructs a push-to-start payload THEN the system SHALL include `content-state` with the Live Activity content (sender, message, timestamp, isDemo, messageIndex, totalMessages)
3. WHEN the backend constructs a push-to-start payload THEN the system SHALL include `attributes-type` matching the Swift struct name (`PagerActivityAttributes`)
4. WHEN the backend constructs a push-to-start payload THEN the system SHALL include `attributes` with static activity data
5. WHEN the backend constructs a push-to-start payload THEN the system SHALL include a `timestamp` field in the `aps` dictionary (Unix timestamp)

### Requirement 5

**User Story:** As a developer, I want to verify that the frontend Live Activity widget can receive and display push-to-start notifications, so that users see the Live Activity on their lock screen.

#### Acceptance Criteria

1. WHEN the widget receives a push-to-start notification THEN the system SHALL parse the `content-state` into `PagerActivityAttributes.ContentState`
2. WHEN the widget receives a push-to-start notification THEN the system SHALL display the sender, message, and timestamp in the retro LCD view
3. WHEN the widget receives a push-to-start notification THEN the system SHALL handle the `isDemo`, `messageIndex`, and `totalMessages` fields correctly
4. WHEN the widget extension is configured THEN the system SHALL have matching `PagerActivityAttributes` struct in both main app and widget extension

### Requirement 6

**User Story:** As a developer, I want to document the differences between the two token types, so that future developers understand the distinction.

#### Acceptance Criteria

1. WHEN documenting the token flow THEN the documentation SHALL clearly distinguish between device token and push-to-start token
2. WHEN documenting the token flow THEN the documentation SHALL explain when each token type is used
3. WHEN documenting the token flow THEN the documentation SHALL include the iOS version requirements (push-to-start requires iOS 17.2+)
4. WHEN documenting the token flow THEN the documentation SHALL include the correct APNS topic format for each notification type

