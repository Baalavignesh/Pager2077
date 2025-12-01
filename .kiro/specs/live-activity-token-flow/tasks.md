# Implementation Plan

- [x] 1. Improve Live Activity token registration reliability
  - [x] 1.1 Add persistent token registration status tracking
    - Store registration status in AsyncStorage
    - Check status on app launch and retry if not registered
    - Clear status when user logs out
    - _Requirements: 2.3, 2.4_
  - [x] 1.2 Add token re-registration on app foreground
    - Listen for AppState changes in the token registration effect
    - Re-register token when app becomes active
    - Debounce to avoid excessive API calls
    - _Requirements: 2.3_
  - [x] 1.3 Increase token timeout and add better error handling
    - Increase timeout from 5 seconds to 10 seconds in LiveActivityBridge.swift
    - Add more detailed logging for debugging
    - _Requirements: 2.4_
  - [ ]* 1.4 Write property test for token validation
    - **Property 1: Token validation before registration**
    - **Validates: Requirements 2.3, 2.4**

- [x] 2. Verify and document token flow
  - [x] 2.1 Add comprehensive logging throughout token flow
    - Log token obtained from ActivityKit
    - Log token sent to backend
    - Log backend response
    - Log token used when sending notifications
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [x] 2.2 Create token flow documentation
    - Document the difference between device token and push-to-start token
    - Document iOS version requirements
    - Document APNS topic formats
    - Add to NOTIFICATION_TESTING.md or create new doc
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [ ]* 2.3 Write property test for correct token usage
    - **Property 2: Correct token usage for Live Activity notifications**
    - **Validates: Requirements 3.2**

- [-] 3. Verify APNS payload format
  - [x] 3.1 Add payload logging in APNSProvider
    - Log the full payload before sending (with token truncated)
    - Log the APNS topic and push-type
    - Log the response status and any errors
    - _Requirements: 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5_
  - [ ]* 3.2 Write property test for APNS configuration
    - **Property 3: Correct APNS configuration for Live Activity**
    - **Validates: Requirements 3.3, 3.4**
  - [ ]* 3.3 Write property test for payload format
    - **Property 4: Valid push-to-start payload format**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**

- [x] 4. Verify widget compatibility
  - [x] 4.1 Verify PagerActivityAttributes struct matches in both files
    - Compare LiveActivityBridge.swift and liveactivityLiveActivity.swift
    - Ensure ContentState fields match exactly
    - Verify Date decoding works with ISO 8601 strings
    - _Requirements: 5.4_
  - [x] 4.2 Test push-to-start notification on physical device
    - Send test notification from backend
    - Verify Live Activity appears on lock screen
    - Verify content displays correctly
    - _Requirements: 5.1, 5.2, 5.3_

- [ ] 5. Checkpoint - Verify token flow works end-to-end
  - Ensure all tests pass, ask the user if questions arise.
  - Test on physical iOS device with iOS 17.2+
  - Verify Live Activity starts when message is sent

- [ ] 6. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

