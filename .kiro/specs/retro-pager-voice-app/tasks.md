# Implementation Plan

- [x] 1. Initialize project structure and dependencies
  - Create root directory with `frontend/` and `backend/` folders
  - Initialize React Native project in frontend/ using Expo with TypeScript template
  - Initialize Bun project in backend/ with TypeScript configuration
  - Install NativeBase and required dependencies in frontend
  - Install AWS SDK, database client (pg), and required dependencies in backend
  - Set up ESLint and Prettier for both projects
  - _Requirements: 8.1, 8.6_

- [ ] 2. Set up backend database schema and migrations
  - [ ] 2.1 Create database migration files for all tables
    - Write SQL migration for users table with indexes
    - Write SQL migration for friend_requests table with indexes
    - Write SQL migration for friendships table with indexes and constraints
    - Write SQL migration for voice_notes table with indexes and expiration
    - _Requirements: 8.3, 8.7_
  
  - [ ] 2.2 Implement database connection and migration runner
    - Create database connection utility with connection pooling
    - Implement migration runner script to execute SQL files
    - Add environment variable configuration for database credentials
    - _Requirements: 8.3_

- [ ] 3. Implement backend data models and repositories
  - [ ] 3.1 Create TypeScript interfaces for all data models
    - Define User, FriendRequest, Friendship, VoiceNote interfaces
    - Create request/response DTOs for API endpoints
    - _Requirements: 8.1_
  
  - [ ] 3.2 Implement repository layer for database operations
    - Create UserRepository with CRUD operations and hex code generation
    - Create FriendshipRepository with relationship queries
    - Create VoiceNoteRepository with expiration handling
    - _Requirements: 1.1, 1.2, 2.2, 2.6, 2.7, 8.3_
  
  - [ ]* 3.3 Write unit tests for repositories
    - Test hex code uniqueness and generation
    - Test friendship bidirectional queries
    - Test voice note expiration logic
    - _Requirements: 1.1, 2.6, 8.3_

- [ ] 4. Implement backend service layer
  - [ ] 4.1 Create UserService with registration and status management
    - Implement user registration with hex code generation
    - Implement status update (online/offline) logic
    - Implement getUserByHexCode and getUserFriends methods
    - _Requirements: 1.1, 1.2, 1.5, 9.1, 9.2_
  
  - [ ] 4.2 Create FriendshipService with request handling
    - Implement sendFriendRequest with validation (no self-add, user exists)
    - Implement getPendingRequests for incoming requests
    - Implement acceptFriendRequest to create bidirectional friendship
    - Implement rejectFriendRequest to update status
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_
  
  - [ ] 4.3 Create VoiceNoteService with S3 integration
    - Implement generateUploadUrl for S3 presigned URLs
    - Implement processVoiceNote to store metadata after upload
    - Implement generateDownloadUrl for S3 presigned download URLs
    - _Requirements: 5.1, 5.2, 6.4_
  
  - [ ] 4.4 Create NotificationService with SNS integration
    - Implement sendPushNotification using AWS SNS
    - Implement registerDevice to store device tokens
    - Implement notifyRecipient for voice note delivery
    - _Requirements: 5.3, 6.2_
  
  - [ ]* 4.5 Write unit tests for service layer
    - Test user registration flow and hex code uniqueness
    - Test friend request validation logic
    - Test S3 presigned URL generation
    - _Requirements: 1.1, 2.2, 2.3, 2.4_

- [ ] 5. Implement Lambda handlers and API endpoints
  - [ ] 5.1 Create authentication middleware and JWT utilities
    - Implement JWT token generation on user registration
    - Create authentication middleware to verify JWT tokens
    - Add error handling for unauthorized requests
    - _Requirements: 1.2, 1.5_
  
  - [ ] 5.2 Implement user management endpoints
    - Create POST /api/users/register handler
    - Create GET /api/users/me handler
    - Create PUT /api/users/status handler
    - _Requirements: 1.1, 1.2, 9.1, 9.2_
  
  - [ ] 5.3 Implement friendship management endpoints
    - Create POST /api/friends/request handler
    - Create GET /api/friends/requests/pending handler
    - Create POST /api/friends/requests/:id/accept handler
    - Create POST /api/friends/requests/:id/reject handler
    - Create GET /api/friends handler with status information
    - _Requirements: 2.1, 2.2, 2.5, 2.6, 2.7, 2.8, 3.2_
  
  - [ ] 5.4 Implement voice note endpoints
    - Create POST /api/voice-notes/upload-url handler
    - Create POST /api/voice-notes/:id/complete handler with SNS notification
    - Create GET /api/voice-notes/:id/download-url handler
    - _Requirements: 5.1, 5.2, 5.3, 6.4_
  
  - [ ]* 5.5 Write integration tests for API endpoints
    - Test user registration and authentication flow
    - Test friend request lifecycle (send, accept, reject)
    - Test voice note upload and notification flow
    - _Requirements: 1.1, 2.2, 2.6, 5.1, 5.3_

- [ ] 6. Set up Terraform infrastructure
  - [ ] 6.1 Create Terraform configuration for core infrastructure
    - Define VPC, subnets, and security groups
    - Configure RDS PostgreSQL instance with security settings
    - Create S3 bucket with lifecycle policy for 48-hour deletion
    - _Requirements: 8.2, 8.3, 8.4, 8.6_
  
  - [ ] 6.2 Configure Lambda functions and API Gateway
    - Create Lambda function resources with Bun runtime layer
    - Configure API Gateway with REST API endpoints
    - Set up Lambda permissions and IAM roles
    - Configure API Gateway authorization with JWT
    - _Requirements: 8.1, 8.2, 8.6_
  
  - [ ] 6.3 Set up SNS for push notifications
    - Create SNS topics for iOS and Android platforms
    - Configure platform applications for APNS and FCM
    - Set up IAM permissions for Lambda to publish to SNS
    - _Requirements: 8.5, 8.6_
  
  - [ ] 6.4 Configure environment variables and outputs
    - Define Terraform variables for configurable values
    - Create outputs for API Gateway URL, S3 bucket name
    - Set up parameter store for sensitive configuration
    - _Requirements: 8.6_

- [ ] 7. Initialize React Native frontend with retro theme
  - [ ] 7.1 Set up NativeBase theme with retro styling
    - Create custom theme with monochrome color palette
    - Configure pixelated fonts (PressStart2P, CourierPrime)
    - Define component style overrides for bulky buttons and sharp edges
    - Set up 8px grid spacing system
    - _Requirements: 7.1, 7.2, 7.5_
  
  - [ ] 7.2 Create base screen layout and navigation
    - Implement single PagerScreen component as root
    - Set up React Context for global state management
    - Configure status bar styling for retro aesthetic
    - _Requirements: 7.3, 7.4_
  
  - [ ] 7.3 Set up API client and authentication
    - Create axios-based API client with base URL configuration
    - Implement JWT token storage using react-native-keychain
    - Add authentication interceptor to include JWT in requests
    - Implement error handling and retry logic
    - _Requirements: 1.2, 1.5_

- [ ] 8. Implement user registration and hex code display
  - [ ] 8.1 Create user registration flow
    - Implement device token retrieval for push notifications
    - Create registration API call on first app launch
    - Store user ID and JWT token in secure storage
    - Handle registration errors with retry mechanism
    - _Requirements: 1.1, 1.2, 1.5_
  
  - [ ] 8.2 Build HexCodeDisplay component
    - Create component to display hex code in retro monospace font
    - Implement tap-to-copy functionality using Clipboard API
    - Add visual feedback (toast message) on successful copy
    - Style with pixelated border and retro aesthetic
    - _Requirements: 1.3, 1.4, 7.1, 7.2_
  
  - [ ]* 8.3 Write component tests for HexCodeDisplay
    - Test rendering with different hex codes
    - Test clipboard copy functionality
    - Test visual feedback on tap
    - _Requirements: 1.3, 1.4_

- [ ] 9. Implement friend request system
  - [ ] 9.1 Create AddFriendModal component
    - Build modal with hex code input field
    - Implement 8-character hex validation
    - Add submit button with loading state
    - Style with retro modal design (thick borders, pixelated)
    - _Requirements: 2.1, 7.2_
  
  - [ ] 9.2 Implement friend request sending logic
    - Create API call to POST /api/friends/request
    - Handle validation errors (user not found, self-add, duplicate)
    - Display error messages in retro style
    - Close modal and show success feedback on successful request
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ] 9.3 Build FriendRequestList component
    - Create collapsible section for pending requests
    - Display request count badge when collapsed
    - Show sender hex code for each request
    - Add Accept and Reject buttons with retro styling
    - _Requirements: 2.5, 7.2_
  
  - [ ] 9.4 Implement request acceptance and rejection
    - Create API calls for accept and reject actions
    - Update local state to remove processed requests
    - Add accepted friend to friend list immediately
    - Show confirmation feedback for both actions
    - _Requirements: 2.6, 2.7, 2.8_
  
  - [ ]* 9.5 Write integration tests for friend request flow
    - Test sending friend request with valid hex code
    - Test error handling for invalid hex codes
    - Test accept and reject functionality
    - _Requirements: 2.1, 2.2, 2.6, 2.7_

- [ ] 10. Build friend list with status indicators
  - [ ] 10.1 Create FriendList component with scroll picker
    - Implement iOS alarm-style vertical scroll picker using Reanimated
    - Add snap-to-item behavior for centered selection
    - Display friend hex codes in pixelated font
    - Highlight centered/selected friend with border or background
    - _Requirements: 3.1, 3.3, 3.4, 7.2_
  
  - [ ] 10.2 Implement online/offline status indicators
    - Add visual indicator (dot or icon) for online/offline status
    - Use distinct colors from retro palette (dark green for online, gray for offline)
    - Update indicators in real-time when status changes
    - _Requirements: 3.2, 9.5_
  
  - [ ] 10.3 Add empty state for no friends
    - Display "No friends yet. Add a friend to start!" message
    - Style message with retro pixelated font
    - Show message when friend list is empty
    - _Requirements: 3.5_
  
  - [ ] 10.4 Implement friend status polling
    - Create polling mechanism to fetch friend statuses every 30 seconds
    - Update friend list state with new status information
    - Optimize to only poll when app is in foreground
    - _Requirements: 9.4_
  
  - [ ]* 10.5 Write component tests for FriendList
    - Test rendering with multiple friends
    - Test scroll and selection behavior
    - Test status indicator updates
    - Test empty state display
    - _Requirements: 3.1, 3.2, 3.5_

- [ ] 11. Implement voice recording functionality
  - [ ] 11.1 Set up audio recording service
    - Install and configure react-native-audio-recorder-player
    - Request microphone permissions with user-friendly explanation
    - Create AudioService wrapper for recording operations
    - Handle permission denial with settings redirect
    - _Requirements: 4.3, 4.4_
  
  - [ ] 11.2 Build VoiceControls component with state management
    - Create component with three states: idle, recording, recorded
    - Implement state transitions based on user actions
    - Add recording duration tracking (max 60 seconds)
    - Style buttons with large, bulky retro design
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.8, 7.2_
  
  - [ ] 11.3 Implement TALK button and recording start
    - Disable button when no friend is selected
    - Enable button when friend is selected
    - Start recording on button press
    - Change button to "STOP" during recording
    - Show recording duration indicator
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [ ] 11.4 Implement STOP button and recording end
    - Stop recording on button press
    - Save audio file to temporary storage
    - Transition to recorded state with three buttons
    - Display CLEAR, PLAY, and SEND buttons
    - _Requirements: 4.5_
  
  - [ ] 11.5 Implement CLEAR, PLAY, and SEND actions
    - CLEAR: Delete audio file and return to idle state
    - PLAY: Play recorded audio through device speaker
    - SEND: Proceed to upload flow (implemented in next task)
    - Style all three buttons with equal width and retro design
    - _Requirements: 4.6, 4.7_
  
  - [ ]* 11.6 Write tests for recording functionality
    - Test state transitions (idle → recording → recorded)
    - Test button enable/disable logic
    - Test recording duration limit
    - Mock audio recording APIs
    - _Requirements: 4.1, 4.2, 4.3, 4.8_

- [ ] 12. Implement voice note sending and receiving
  - [ ] 12.1 Create voice note upload flow
    - Request presigned upload URL from API
    - Upload audio file to S3 using presigned URL
    - Call completion endpoint to finalize voice note
    - Show loading indicator during upload
    - Handle upload errors with retry option
    - _Requirements: 5.1, 5.2, 5.4_
  
  - [ ] 12.2 Implement upload success and error handling
    - Display success confirmation message on successful send
    - Return to idle state after successful send
    - Show error message and retain recording on failure
    - Keep CLEAR, PLAY, SEND buttons available on error
    - _Requirements: 5.4, 5.5_
  
  - [ ] 12.3 Set up push notification handling
    - Configure Firebase Cloud Messaging (FCM) for Android
    - Configure Apple Push Notification Service (APNS) for iOS
    - Register device token with backend on app launch
    - Set up notification listeners for foreground and background
    - _Requirements: 5.3, 6.2_
  
  - [ ] 12.4 Implement foreground voice note reception
    - Listen for incoming voice note notifications when app is open
    - Play beep sound immediately on notification
    - Download voice note audio file from S3
    - Auto-play voice note audio after beep
    - Return to default screen state after playback
    - _Requirements: 6.1, 6.3, 6.4, 6.5_
  
  - [ ] 12.5 Implement background voice note reception
    - Display system notification with sender hex code
    - Handle notification tap to open app
    - Download and auto-play voice note when app opens from notification
    - _Requirements: 6.2, 6.3, 6.4_
  
  - [ ]* 12.6 Write integration tests for voice note flow
    - Test upload flow with mocked S3 upload
    - Test notification handling in foreground
    - Test notification handling in background
    - Mock push notification events
    - _Requirements: 5.1, 6.1, 6.2_

- [ ] 13. Implement user status management
  - [ ] 13.1 Create status update service
    - Implement API calls to update user status (online/offline)
    - Call status update on app foreground (online)
    - Call status update on app background (offline)
    - Handle status update errors gracefully
    - _Requirements: 9.1, 9.2_
  
  - [ ] 13.2 Set up app state listeners
    - Use React Native AppState to detect foreground/background transitions
    - Trigger status updates on state changes
    - Update local user status in global state
    - _Requirements: 9.1, 9.2_
  
  - [ ] 13.3 Implement friend status broadcasting
    - Backend: Broadcast status changes to all friends via SNS
    - Frontend: Listen for friend status update notifications
    - Update friend list status indicators in real-time
    - _Requirements: 9.3, 9.5_
  
  - [ ]* 13.4 Write tests for status management
    - Test status update on app state changes
    - Test friend status update reception
    - Mock AppState and notification events
    - _Requirements: 9.1, 9.2, 9.3_

- [ ] 14. Polish UI and add retro visual effects
  - [ ] 14.1 Refine retro styling across all components
    - Ensure consistent use of monochrome color palette
    - Apply pixelated fonts to all text elements
    - Add thick borders (4px) to all interactive elements
    - Remove any rounded corners or smooth gradients
    - _Requirements: 7.1, 7.2, 7.5_
  
  - [ ] 14.2 Add button press effects and feedback
    - Implement scale(0.95) effect on button press (no smooth transition)
    - Add haptic feedback for button presses (optional)
    - Ensure all buttons have clear pressed/unpressed states
    - _Requirements: 7.2_
  
  - [ ] 14.3 Implement loading and error states
    - Create retro-styled loading indicator (pixelated spinner or blinking text)
    - Design error message displays with retro aesthetic
    - Add toast notifications for user feedback
    - Style all feedback elements consistently
    - _Requirements: 7.1, 7.2_
  
  - [ ] 14.4 Optimize layout for single-screen design
    - Ensure display area (top) and controls (bottom) are clearly separated
    - Verify all elements fit on screen without scrolling (except friend list)
    - Test layout on different screen sizes
    - Adjust spacing using 8px grid system
    - _Requirements: 7.3, 7.4_

- [ ] 15. Deploy and test end-to-end
  - [ ] 15.1 Deploy backend infrastructure with Terraform
    - Run terraform init and terraform plan
    - Apply Terraform configuration to create AWS resources
    - Verify all resources are created successfully
    - Note API Gateway URL and other outputs
    - _Requirements: 8.6_
  
  - [ ] 15.2 Deploy Lambda functions
    - Bundle Lambda function code with dependencies
    - Upload function code to AWS Lambda
    - Configure environment variables (database URL, S3 bucket, etc.)
    - Test Lambda functions via API Gateway
    - _Requirements: 8.1, 8.2_
  
  - [ ] 15.3 Run database migrations
    - Connect to RDS PostgreSQL instance
    - Execute migration scripts to create tables
    - Verify schema is created correctly with indexes
    - _Requirements: 8.3, 8.7_
  
  - [ ] 15.4 Configure frontend with backend URL
    - Update API client base URL to point to API Gateway
    - Configure push notification credentials (FCM, APNS)
    - Build frontend app for testing (Expo Go or development build)
    - _Requirements: 8.2_
  
  - [ ] 15.5 Perform end-to-end testing
    - Test user registration and hex code generation
    - Test friend request send, accept, and reject
    - Test voice note recording, sending, and receiving
    - Test foreground and background notification handling
    - Test online/offline status updates
    - Verify voice notes expire after 48 hours
    - _Requirements: 1.1, 2.1, 2.6, 5.1, 6.1, 6.2, 9.1_
