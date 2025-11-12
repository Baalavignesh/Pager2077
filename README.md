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

- 🔢 Unique hexadecimal user IDs (no traditional auth)
- 👥 Simple friend request system
- 🎤 Voice note recording and sending
- 📟 Retro 90s pager-style UI (monochrome, pixelated)
- 🔔 Real-time voice note delivery with auto-play
- 🟢 Online/offline status indicators
- 📱 Single-screen interface

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

```bash
cd frontend
npm install
npm start
```

This will start the Expo development server. You can:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

### Backend Development

```bash
cd backend
bun install
bun run dev
```

The backend server will start on `http://localhost:3000` with hot reload enabled.

## Current Status

✅ **Completed:**
- Project structure initialized
- Frontend base setup with Expo + TypeScript
- Retro theme configuration (monochrome color palette)
- Core UI components:
  - HexCodeDisplay (with tap-to-copy)
  - FriendList (scrollable with status indicators)
  - VoiceControls (TALK/STOP/CLEAR/PLAY/SEND buttons)
  - AddFriendButton
- Main PagerScreen layout
- Backend project structure
- TypeScript interfaces for data models

🚧 **To Do:**
- Audio recording integration
- API client setup
- Backend API endpoints
- Database schema and migrations
- AWS infrastructure (Terraform)
- Push notifications
- Friend request modal
- Status management

## Development Notes

### Frontend
- The app uses a single-screen design (PagerScreen)
- All components follow the retro aesthetic (sharp corners, thick borders, pixelated fonts)
- Mock data is currently used for development
- NativeBase theme is heavily customized in `src/theme/index.ts`

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

## Team

- **UI/Frontend**: [Your Name]
- **Backend**: [Friend's Name]

## License

Private project - All rights reserved
