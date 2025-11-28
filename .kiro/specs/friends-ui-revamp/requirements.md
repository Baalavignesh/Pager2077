# Requirements Document

## Introduction

This document outlines the requirements for revamping the Friends management UI in Pager2077. The changes focus on simplifying the friend request workflow and modernizing the add friend flow to use a 6-digit number system instead of hex codes.

## Glossary

- **Friend Request**: An invitation sent from one user to another to establish a friendship connection
- **6-Digit Number**: A unique numeric identifier (similar to a phone number) used to identify users instead of hex codes
- **Confirmation Page**: A screen that prompts the user to confirm an action (accept/reject friend request)
- **NumPad**: The phone-style numeric keypad interface used for navigation and input
- **Friend Requests Screen**: The screen displaying all pending incoming friend requests
- **Add Friend Screen**: The screen where users can enter a 6-digit number to send friend requests

## Requirements

### Requirement 1

**User Story:** As a user, I want to view and respond to friend requests with a clear confirmation flow, so that I can carefully decide whether to accept or reject each request.

#### Acceptance Criteria

1. WHEN a user navigates to the Friend Requests screen THEN the system SHALL display all pending incoming friend requests
2. WHEN a user selects a friend request THEN the system SHALL navigate to a confirmation page showing the selected request details
3. WHEN the confirmation page is displayed THEN the system SHALL map the right navigation button to "Yes" (accept) and the left navigation button to "No" (reject)
4. WHEN a user presses the right button on the confirmation page THEN the system SHALL accept the friend request and return to the Friend Requests screen
5. WHEN a user presses the left button on the confirmation page THEN the system SHALL reject the friend request and return to the Friend Requests screen

### Requirement 2

**User Story:** As a user, I want to add friends using a simple 6-digit number, so that I can easily share and remember my friend code.

#### Acceptance Criteria

1. WHEN a user navigates to the Add Friend screen THEN the system SHALL display a 6-digit number input field
2. WHEN a user presses number keys on the NumPad THEN the system SHALL append the digit to the input field up to a maximum of 6 digits
3. WHEN the input field contains digits THEN the system SHALL display them in a clear, readable format
4. WHEN a user presses the # button THEN the system SHALL remove the last digit from the input field
5. WHEN the Add Friend screen is displayed THEN the system SHALL show helper text indicating "Backspace - #"
6. WHEN a user presses the down arrow key THEN the system SHALL focus on the "Send Friend Request" action text
7. WHEN the "Send Friend Request" text is focused and the user presses select THEN the system SHALL send a friend request to the user with the entered 6-digit number
8. WHEN a friend request is successfully sent THEN the system SHALL navigate back to the Friends screen
9. WHEN a user presses the back button THEN the system SHALL clear the input and return to the Friends screen

### Requirement 3

**User Story:** As a user, I want the hex code and clipboard paste features removed from the Add Friend screen, so that the interface is simpler and focused on the 6-digit number system.

#### Acceptance Criteria

1. THE Add Friend screen SHALL NOT display hex code information
2. THE Add Friend screen SHALL NOT provide a paste from clipboard option
3. THE Add Friend screen SHALL NOT provide a manual hex entry toggle
4. THE Add Friend screen SHALL only accept numeric input from 0-9
5. THE Add Friend screen SHALL prevent input beyond 6 digits

### Requirement 4

**User Story:** As a user, I want consistent navigation behavior across friend management screens, so that the interface feels predictable and easy to use.

#### Acceptance Criteria

1. WHEN a user is on any friend management screen THEN the system SHALL support back button navigation to return to the previous screen
2. WHEN a user completes an action (accept, reject, send request) THEN the system SHALL provide visual feedback before navigation
3. WHEN navigation occurs THEN the system SHALL maintain the retro pager aesthetic with appropriate transitions
4. WHEN an error occurs during friend request operations THEN the system SHALL display an error message and remain on the current screen
