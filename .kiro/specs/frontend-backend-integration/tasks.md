# Implementation Plan

## Phase 1: Backend Database and Core Services

- [x] 1. Update database schema and models
  - [x] 1.1 Add display_name and live_activity_token columns to users table in schema.sql
    - Add `display_name TEXT` column
    - Add `live_activity_token TEXT` column
    - _Requirements: 11.2, 16.1_
  - [x] 1.2 Create messages table in schema.sql
    - Create table with id, sender_id, recipient_id, text, is_read, created_at
    - Add indexes for conversation queries and unread messages
    - _Requirements: 15.1, 15.2_
  - [x] 1.3 Update User interface in backend/src/models/index.ts
    - Add displayName and liveActivityToken fields
    - _Requirements: 11.2, 16.1_
  - [x] 1.4 Add Message interface to backend/src/models/index.ts
    - Define Message type with all fields
    - Define Conversation type for unread messages
    - _Requirements: 15.1, 15.2_

- [x] 2. Implement Message Repository
  - [x] 2.1 Create backend/src/repositories/MessageRepository.ts
    - Implement create() method for new messages
    - Implement getByConversation() for message history
    - Implement getUnreadCount() for unread message counts
    - Implement markRead() to mark messages as read
    - _Requirements: 15.1, 15.2_
  - [ ]* 2.2 Write property test for message creation and retrieval
    - **Property 4: Message Creation and Retrieval**
    - **Validates: Requirements 6.1, 15.1, 15.2**

- [x] 3. Implement Message Service
  - [x] 3.1 Create backend/src/services/MessageService.ts
    - Implement createMessage() with notification logic
    - Implement getMessageHistory() for fetching messages
    - Implement getConversationsWithUnread() for unread list
    - Check for Live Activity token before sending notifications
    - _Requirements: 15.1, 15.2, 15.3, 15.4_
  - [ ]* 3.2 Write property test for Live Activity priority
    - **Property 5: Live Activity Priority Over Push Notifications**
    - **Validates: Requirements 8.1, 8.5, 9.4, 15.3, 15.4**

- [x] 4. Enhance User Repository and Service
  - [x] 4.1 Update UserRepository with display name and LA token methods
    - Add updateDisplayName() method
    - Add updateLiveActivityToken() method
    - Add getLiveActivityToken() method
    - Update mapRowToUser() to include new fields
    - _Requirements: 11.2, 16.1, 17.1_
  - [x] 4.2 Update UserService with display name validation
    - Add updateDisplayName() with validation (1-20 chars, valid characters)
    - Add updateLiveActivityToken() method
    - _Requirements: 11.2, 16.1, 17.1, 17.3_
  - [ ]* 4.3 Write property test for display name storage
    - **Property 7: Display Name Storage Round Trip**
    - **Validates: Requirements 11.1, 11.2, 12.1, 12.2, 17.1, 17.2**
  - [ ]* 4.4 Write property test for display name validation
    - **Property 10: Display Name Validation**
    - **Validates: Requirements 17.3**

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 2: Backend API Endpoints

- [x] 6. Add messaging API endpoints
  - [x] 6.1 Add POST /api/messages endpoint in backend/src/index.ts
    - Validate sender and recipient are friends
    - Create message via MessageService
    - Return message ID and timestamp
    - _Requirements: 15.1_
  - [x] 6.2 Add GET /api/messages/:friendId endpoint
    - Fetch message history with limit parameter
    - Include sender display names in response
    - _Requirements: 15.2, 13.3_
  - [x] 6.3 Add GET /api/conversations endpoint
    - Return conversations with unread messages
    - Include friend display names
    - _Requirements: 10.1, 10.2_

- [x] 7. Add user management API endpoints
  - [x] 7.1 Add PUT /api/users/display-name endpoint
    - Validate display name format
    - Update user's display name
    - Return updated user data
    - _Requirements: 17.1, 17.2, 17.3_
  - [x] 7.2 Add PUT /api/users/live-activity-token endpoint
    - Store Live Activity push token
    - Allow null to clear token
    - _Requirements: 16.1_
  - [ ]* 7.3 Write property test for Live Activity token storage
    - **Property 6: Live Activity Token Storage Round Trip**
    - **Validates: Requirements 9.3, 16.1, 16.2**

- [x] 8. Enhance existing API responses with display names
  - [x] 8.1 Update GET /api/friends to include display names
    - Add displayName field to each friend in response
    - _Requirements: 13.1_
  - [x] 8.2 Update GET /api/friends/requests/pending to include display names
    - Add displayName field for each requester
    - _Requirements: 13.2_
  - [ ]* 8.3 Write property test for display names in API responses
    - **Property 8: Display Name in API Responses**
    - **Validates: Requirements 13.1, 13.2, 13.3**

- [-] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 3: Frontend API Client and Services

- [ ] 10. Enhance API client with new endpoints
  - [ ] 10.1 Add friends API methods to frontend/src/services/apiClient.ts
    - Add getFriends() method
    - Add sendFriendRequest() method
    - Add getPendingRequests() method
    - Add acceptFriendRequest() method
    - Add rejectFriendRequest() method
    - _Requirements: 3.1, 4.1, 5.1, 5.3, 5.4_
  - [ ] 10.2 Add conversations API method
    - Add getConversations() method for unread messages
    - _Requirements: 10.1_
  - [ ] 10.3 Add user management API methods
    - Add updateDisplayName() method
    - Add updateLiveActivityToken() method
    - _Requirements: 11.1, 12.1, 9.3_
  - [ ]* 10.4 Write property test for friend request API format
    - **Property 2: Friend Request API Format**
    - **Validates: Requirements 4.1**

- [ ] 11. Enhance Live Activity service
  - [ ] 11.1 Add push token retrieval to frontend/src/services/liveActivityService.ts
    - Implement getPushToken() to get Live Activity push token
    - Register token with backend on app start
    - _Requirements: 9.2, 9.3_
  - [ ] 11.2 Update App.tsx to register Live Activity token on startup
    - Check if Live Activities are enabled
    - Get push token and send to backend
    - _Requirements: 9.1, 9.2, 9.3_

- [ ] 12. Enhance storage service
  - [ ] 12.1 Update frontend/src/services/storageService.ts
    - Add display name to credentials storage
    - _Requirements: 1.4, 11.1_
  - [ ]* 12.2 Write property test for credential storage
    - **Property 1: Credential Storage Round Trip**
    - **Validates: Requirements 1.4, 2.1, 2.2**

- [ ] 13. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 4: Frontend Auth and Display Name Flow

- [ ] 14. Enhance AuthContext
  - [ ] 14.1 Update frontend/src/context/AuthContext.tsx
    - Add displayName to context state
    - Add updateDisplayName() method that calls backend
    - Load display name from stored credentials
    - _Requirements: 11.1, 12.1, 12.3_
  - [ ] 14.2 Update registration flow to save display name
    - After name entry, send display name to backend
    - Store display name in secure storage
    - _Requirements: 11.1, 11.2_

- [ ] 15. Update name entry and edit screens
  - [ ] 15.1 Update frontend/src/screens/NameEntryScreen.tsx
    - Call backend API to save display name on completion
    - Handle API errors with retry option
    - _Requirements: 11.1, 11.4_
  - [ ] 15.2 Update frontend/src/screens/EditNameScreen.tsx
    - Call backend API to update display name
    - Update local state on success
    - _Requirements: 12.1, 12.2, 12.3_
  - [ ]* 15.3 Write property test for display name fallback
    - **Property 9: Display Name Fallback**
    - **Validates: Requirements 13.4**

## Phase 5: Frontend Friends Integration

- [ ] 16. Replace mock friends data with real API calls
  - [ ] 16.1 Create frontend/src/hooks/useFriends.ts hook
    - Fetch friends list from backend
    - Manage loading and error states
    - Provide refresh function
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  - [ ] 16.2 Update App.tsx to use real friends data
    - Replace mockFriends with useFriends hook
    - Pass real data to FriendsListScreen
    - _Requirements: 3.1, 3.2_

- [ ] 17. Implement friend request functionality
  - [ ] 17.1 Create frontend/src/hooks/useFriendRequests.ts hook
    - Fetch pending requests from backend
    - Provide accept/reject functions
    - Manage loading and error states
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [ ] 17.2 Update App.tsx to use real friend requests
    - Replace mockFriendRequests with useFriendRequests hook
    - Wire up accept/reject handlers to API
    - _Requirements: 5.1, 5.5, 5.6_
  - [ ] 17.3 Update AddFriendScreen handlers in App.tsx
    - Call sendFriendRequest API on submit
    - Handle error responses (USER_NOT_FOUND, DUPLICATE_REQUEST, FRIENDSHIP_EXISTS)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  - [ ]* 17.4 Write property test for friend request state transitions
    - **Property 3: Friend Request State Transitions**
    - **Validates: Requirements 5.3, 5.4, 5.5, 5.6**

- [ ] 18. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 6: Frontend Messages Integration

- [ ] 19. Replace mock messages with real API calls
  - [ ] 19.1 Create frontend/src/hooks/useConversations.ts hook
    - Fetch conversations with unread messages
    - Manage loading and error states
    - _Requirements: 10.1, 10.2_
  - [ ] 19.2 Update App.tsx to use real conversations
    - Replace mockMessages with useConversations hook
    - Pass real data to MessagesScreen
    - _Requirements: 10.1, 10.2, 10.4_

- [ ] 20. Update IndividualChatScreen for real messaging
  - [ ] 20.1 Verify IndividualChatScreen uses real API
    - Confirm sendMessage and getMessageHistory are called correctly
    - Ensure display names are shown for messages
    - _Requirements: 6.1, 6.2, 6.3, 7.1, 7.2, 7.3_

## Phase 7: Status and Notifications

- [ ] 21. Implement online/offline status updates
  - [ ] 21.1 Add AppState listener in App.tsx
    - Update status to "online" when app becomes active
    - Update status to "offline" when app goes to background
    - _Requirements: 14.1, 14.2_
  - [ ]* 21.2 Write property test for status change notifications
    - **Property 11: Status Change Notifications**
    - **Validates: Requirements 14.3**

- [ ] 22. Implement notification handling
  - [ ] 22.1 Update useNotifications hook for message notifications
    - Handle message notification type
    - Navigate to chat on notification tap
    - _Requirements: 8.3, 8.4_
  - [ ] 22.2 Update backend notification service for Live Activity fallback
    - Check if LA token is valid before sending
    - Fall back to regular push if LA fails
    - _Requirements: 9.7, 12_
  - [ ]* 22.3 Write property test for Live Activity fallback
    - **Property 12: Live Activity Token Invalidation Fallback**
    - **Validates: Requirements 9.7, 16.3**

- [ ] 23. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 8: Enable Auto-Registration

- [ ] 24. Enable auto-registration flow
  - [ ] 24.1 Uncomment auto-registration in App.tsx
    - Enable the useEffect that triggers registration
    - Test full registration flow on fresh install
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_
  - [ ] 24.2 Test credential persistence
    - Verify credentials persist across app restarts
    - Test token validation on app launch
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 25. Final integration testing
  - [ ] 25.1 End-to-end test: Registration → Name Entry → Friends → Messaging
    - Test complete user flow from fresh install
    - Verify all screens show real data
    - _Requirements: All_
