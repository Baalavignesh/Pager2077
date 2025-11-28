# Pager 2077 - Retro Voice Messaging App

A minimalist React Native mobile application that recreates the nostalgic experience of 90s pager communication with modern voice messaging capabilities.

## Project Structure

```
pager2077/
├── frontend/          # React Native mobile app (Expo + TypeScript)
├── backend/           # AWS serverless backend (Bun + TypeScript)
└── .kiro/specs/       # Design specifications and requirements
```

## Features

- Unique 6-digit user codes (simplified from hex IDs)
- User display names with T9 text input
- Simple friend request system with confirmation flow
- Voice note recording and sending
- Retro 90s pager-style UI (monochrome, pixelated)
- Real-time voice note delivery with auto-play
- Online/offline status indicators
- Phone numpad-style navigation interface
- Single-screen interface with intuitive controls

## Tech Stack

### Frontend

- **Framework**: React Native (Expo)
- **UI Library**: NativeBase (customized for retro aesthetic)
- **Language**: TypeScript
- **State Management**: React Context
- **Audio**: react-native-audio-recorder-player (to be added)

### Backend

- **Runtime**: Bun
- **Language**: TypeScript
- **Infrastructure**: AWS (Lambda, API Gateway, RDS PostgreSQL, S3, SNS)
- **IaC**: Terraform

## Getting Started

### Frontend Development

**For Push Notifications (Recommended):**

```bash
cd frontend
npm install

# Build with Xcode (required for push notifications)
npx expo prebuild --platform ios
open ios/Pager2077.xcworkspace
# Configure signing and click Play

# Daily development (after first build)
npx expo start --dev-client
# Press 'i' for iOS - instant launch + hot reload!
```

**Why Xcode Build?**
- Push notifications require proper Apple entitlements
- Expo Go doesn't support custom push notifications
- Build once with Xcode, then use dev client for fast iteration
- Works on iOS Simulator (iOS 16+)
- Completely FREE

**For Quick UI Testing (No Push Notifications):**

```bash
cd frontend
npm start        # For mobile (iOS/Android)
npm run web      # For web development and debugging
```

This will start the Expo development server. You can:

- Press `i` for iOS simulator
- Press `a` for Android emulator
- Press `w` for web browser
- Scan QR code with Expo Go app on your phone

**Important Notes:**

- Ensure React versions match: react@19.1.0 and react-dom@19.1.0
- For debugging, Kiro can run the dev server in background
- Web development available at http://localhost:8081
- **Push notifications only work with Xcode build**, not Expo Go
- See `frontend/LOCAL_BUILD_GUIDE.md` for setup

### Backend Development

```bash
cd backend
bun install
bun run dev
```

The backend server will start on `http://localhost:3000` with hot reload enabled.

## Current Status

**Completed:**

- Project structure initialized
- Frontend base setup with Expo + TypeScript
- Retro theme configuration (monochrome color palette)
- Core UI components:
  - HexCodeDisplay (with tap-to-copy)
  - FriendList (scrollable with status indicators)
  - VoiceControls (TALK/STOP/CLEAR/PLAY/SEND buttons)
  - AddFriendButton
  - NumPad (phone numpad-style navigation)
  - ChatNumPad (chat-specific numpad with T9 input)
  - PagerBody (container for NumPad)
  - ChatPagerBody (compact container for ChatNumPad)
  - BatteryIndicator (real-time battery status)
- Main PagerScreen layout
- Friends management system:
  - FriendsListScreen with 6-digit codes
  - AddFriendScreen with numpad entry
  - FriendRequestsScreen
  - FriendRequestConfirmationScreen
- Display names feature:
  - NameEntryScreen with T9 text input
  - EditNameScreen for changing display name
  - Local storage for display name mappings
  - Display names shown throughout app (friends, requests, messages)
- Messaging system:
  - IndividualChatScreen for one-on-one text messaging
  - T9 text input for message composition (500 character limit)
  - Message history display with sent/received indicators
  - Message validation and sanitization
  - Error handling with user-friendly messages
  - Haptic feedback for send/success/error states
- Backend project structure
- TypeScript interfaces for data models

**To Do:**

- Audio recording integration
- Complete messaging API integration (sendMessage and getMessageHistory endpoints)
- Backend API endpoints
- Database schema and migrations
- AWS infrastructure (Terraform)
- Push notifications
- Status management
- Backend display name sync
- Message composer component (MessageComposer.tsx)
- Message history component (MessageHistory.tsx)
- Message bubble component (MessageBubble.tsx)

## Development Notes

### Frontend

- The app uses a single-screen design (PagerScreen)
- All components follow the retro aesthetic (sharp corners, thick borders, pixelated fonts)
- Mock data is currently used for development
- NativeBase theme is heavily customized in `src/theme/index.ts`
- Display names stored locally using Secure Storage (user's own name) and AsyncStorage (mappings)
- T9 text input system for entering names using numpad (multi-tap character entry)

### Backend

- Basic Bun server setup is complete
- Models and interfaces are defined in `src/models/index.ts`
- Directory structure follows service/repository pattern
- Ready for API endpoint implementation

## Design Documents

Full specifications are available in `.kiro/specs/retro-pager-voice-app/`:

- `requirements.md` - Detailed requirements with acceptance criteria
- `design.md` - Technical architecture and component design
- `tasks.md` - Implementation task breakdown

## Kiro Features

This project is set up with advanced Kiro features:

### Spec-Driven Development

- Complete specifications in `.kiro/specs/retro-pager-voice-app/`
- Requirements, design, and task breakdown
- Click "Start task" in `tasks.md` to begin implementation

### Steering Documents

- **Project Standards** - Always active coding guidelines
- **Retro UI Guidelines** - Auto-loaded for frontend components
- **Backend API Standards** - Auto-loaded for backend code
- **AWS/Terraform Guidelines** - Auto-loaded for infrastructure code

### Agent Hooks

- **Format and Lint** - Auto-format on save
- **Check Retro Styling** - Verify UI follows design system
- **Update Tests** - Generate test suggestions
- **API Documentation** - Auto-generate API docs
- **Commit Message Helper** - Generate conventional commits

### MCP Integration

- **AWS Documentation** - Search AWS docs directly
- **Git** - Enhanced git operations
- **Filesystem** - Advanced file operations

See `.kiro/KIRO_FEATURES.md` for detailed usage guide.

## Team

- Baalavignesh Arunachalam
- Mithilesh Chellappan
