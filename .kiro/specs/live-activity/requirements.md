# Requirements Document

## Introduction

This document specifies the requirements for implementing iOS Live Activity support in the Pager2077 React Native application. Live Activity is an iOS feature that displays real-time, glanceable information on the lock screen and Dynamic Island. This feature will be used to show incoming message notifications from friends, providing a retro-futuristic pager experience that persists on the user's lock screen.

## Glossary

- **Live Activity**: An iOS feature (iOS 16.1+) that displays real-time information on the lock screen and Dynamic Island
- **Dynamic Island**: The pill-shaped cutout on iPhone 14 Pro and later that can display Live Activity content
- **Widget Extension**: A separate iOS target that renders Live Activity UI using SwiftUI
- **ActivityKit**: Apple's framework for managing Live Activities
- **Push Token**: A device-specific token used to update Live Activities remotely via push notifications
- **Pager2077**: The retro-futuristic voice messaging application
- **Message Notification**: An alert triggered when a friend sends a message to the user

## Requirements

### Requirement 1

**User Story:** As a user, I want to see incoming messages displayed on my lock screen as a Live Activity, so that I can quickly glance at new messages without unlocking my phone.

#### Acceptance Criteria

1. WHEN a friend sends a message THEN the Pager2077 app SHALL start a Live Activity displaying the sender's identifier and message preview
2. WHEN a Live Activity is active THEN the system SHALL display the activity on the lock screen with the retro pager aesthetic
3. WHEN the user taps on the Live Activity THEN the system SHALL open the Pager2077 app to the relevant chat screen
4. WHEN the Live Activity has been displayed for 8 hours THEN the system SHALL automatically end the activity

### Requirement 2

**User Story:** As a user, I want to see Live Activity content in the Dynamic Island on supported devices, so that I can view message notifications in a compact, always-visible format.

#### Acceptance Criteria

1. WHEN a Live Activity starts on a device with Dynamic Island THEN the system SHALL display a compact view in the Dynamic Island
2. WHEN the user long-presses the Dynamic Island THEN the system SHALL expand to show the full Live Activity view
3. WHEN the Dynamic Island displays the Live Activity THEN the system SHALL show the sender identifier in the minimal view

### Requirement 3

**User Story:** As a developer, I want to start and update Live Activities from React Native code, so that I can integrate the feature with the existing notification system.

#### Acceptance Criteria

1. WHEN the React Native app calls the start activity function THEN the system SHALL create a new Live Activity with the provided content
2. WHEN the React Native app calls the update activity function THEN the system SHALL update the existing Live Activity content
3. WHEN the React Native app calls the end activity function THEN the system SHALL dismiss the Live Activity from the lock screen
4. WHEN the native module receives a request THEN the system SHALL return success or failure status to the React Native layer

### Requirement 4

**User Story:** As a developer, I want to set up the iOS Widget Extension for Live Activity, so that the native iOS components are properly configured.

#### Acceptance Criteria

1. WHEN the iOS app is built THEN the build system SHALL include the Widget Extension target
2. WHEN the Widget Extension is configured THEN the system SHALL support the NSSupportsLiveActivities capability
3. WHEN the Widget Extension renders THEN the system SHALL display SwiftUI views matching the retro pager aesthetic
4. WHEN the app launches THEN the system SHALL register for Live Activity push token updates

### Requirement 5

**User Story:** As a user, I want the Live Activity to display a demo UI for testing purposes, so that I can verify the feature works before connecting it to real messages.

#### Acceptance Criteria

1. WHEN a demo Live Activity is triggered THEN the system SHALL display placeholder content with sender "DEMO" and a test message
2. WHEN the demo Live Activity is active THEN the system SHALL allow manual update and end actions for testing
3. WHEN testing the Live Activity THEN the system SHALL log activity state changes for debugging purposes
