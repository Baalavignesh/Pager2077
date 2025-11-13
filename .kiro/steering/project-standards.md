---
inclusion: always
---

# Pager2077 Project Standards

## Project Overview
Pager2077 is a retro-futuristic voice messaging app with a 90s pager aesthetic. The project uses a monorepo structure with React Native frontend and Bun/AWS backend.

## Code Style Guidelines

### TypeScript Standards
- Use strict TypeScript mode
- Always define explicit types for function parameters and return values
- Use interfaces for data models, types for unions/intersections
- Prefer `const` over `let`, avoid `var`
- Use async/await over promises chains

### React Native / Frontend
- Use functional components with hooks (no class components)
- Keep components small and focused (single responsibility)
- Extract reusable logic into custom hooks
- Use React Native core components (View, Text, Pressable) with StyleSheet.create()
- Each component/screen must have its own StyleSheet.create() at the bottom of the file
- No centralized styles files - keep styles colocated with components
- Use NativeBase only for theme provider and complex components
- Follow the retro design system:
  - Sharp corners (borderRadius: 0)
  - Thick borders (4px for buttons, 2px for containers)
  - Monochrome color palette from theme
  - Pixelated/monospace fonts
  - 8px grid spacing system

### Backend / Bun
- Use service/repository pattern for separation of concerns
- Keep handlers thin - delegate to services
- Use repositories for all database operations
- Always use parameterized queries (prevent SQL injection)
- Return consistent API response format: `{ success, data?, error? }`

## File Organization

### Frontend Structure
```
frontend/src/
├── components/     # Reusable UI components (each with own StyleSheet)
├── screens/        # Screen-level components (each with own StyleSheet)
├── hooks/          # Custom React hooks
├── services/       # API clients, audio, notifications
├── theme/          # Theme configuration (NativeBase theme only)
├── types/          # TypeScript interfaces
└── utils/          # Helper functions
```

**Note:** No centralized styles directory - each component/screen has its own `StyleSheet.create()` at the bottom of the file.

### Backend Structure
```
backend/src/
├── handlers/       # Lambda function handlers
├── services/       # Business logic
├── repositories/   # Database access
├── models/         # TypeScript interfaces
└── utils/          # Helper functions
```

## Naming Conventions

### Files
- Components: PascalCase (e.g., `PagerButton.tsx`)
- Screens: PascalCase with 'Screen' suffix (e.g., `MainMenuScreen.tsx`)
- Hooks: camelCase with 'use' prefix (e.g., `useAudioRecorder.ts`)
- Services: camelCase with 'Service' suffix (e.g., `audioService.ts`)
- Types: PascalCase (e.g., `User`, `VoiceNote`)
- No separate style files - styles are defined within component files

### Variables & Functions
- camelCase for variables and functions
- PascalCase for components and classes
- UPPER_SNAKE_CASE for constants
- Prefix boolean variables with `is`, `has`, `should`

## Git Workflow

### Commit Messages
Follow conventional commits:
- `feat:` - New features
- `fix:` - Bug fixes
- `refactor:` - Code refactoring
- `style:` - UI/styling changes
- `docs:` - Documentation updates
- `test:` - Test additions/updates
- `chore:` - Build/config changes

**Rules:**
- No emojis in commit messages
- Keep messages concise and descriptive
- Use present tense ("add" not "added")
- Capitalize first letter after colon

Example: `feat: add voice recording functionality`

### Branch Strategy
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - New features
- `fix/*` - Bug fixes

## Testing Guidelines

### What to Test
- Core business logic (services, repositories)
- Complex UI interactions
- API endpoints
- Error handling scenarios

### What NOT to Test
- Simple presentational components
- Third-party library wrappers
- Configuration files

### Test File Location
- Place test files next to the code they test
- Use `.test.ts` or `.test.tsx` extension

## Error Handling

### Frontend
- Show user-friendly error messages (no technical jargon)
- Use toast notifications for temporary feedback
- Log errors to console in development
- Handle network errors gracefully with retry options

### Backend
- Use custom error classes with status codes
- Return consistent error format
- Log errors with context (user ID, request ID)
- Never expose sensitive information in error messages

## Performance Guidelines

### Frontend
- Lazy load screens and heavy components
- Optimize images and assets
- Use React.memo for expensive components
- Debounce user input handlers
- Minimize re-renders

### Backend
- Use database indexes on frequently queried fields
- Implement connection pooling
- Cache frequently accessed data
- Set appropriate Lambda timeout values
- Use S3 presigned URLs for file uploads/downloads

## Security Best Practices

### Frontend
- Store JWT tokens in secure storage (react-native-keychain)
- Validate all user inputs
- Use HTTPS only
- Request minimum necessary permissions

### Backend
- Use parameterized queries (prevent SQL injection)
- Validate and sanitize all inputs
- Implement rate limiting
- Use least privilege IAM roles
- Encrypt sensitive data at rest
- Set short expiration on presigned URLs (5 minutes)

## Retro Design System

### Colors
```typescript
// Main palette
background: '#C7D3C0'    // LCD green-gray (main background)
foreground: '#1A1A1A'    // Dark text/borders
accent: '#2D4A2B'        // Dark green highlights
disabled: '#8B9B88'      // Muted inactive
online: '#009819ff'      // Green online status LED
offline: '#FF4444'       // Red offline status LED

// Component-specific
displayBg: '#dadadaff'   // Light gray for display/body backgrounds
buttonBg: '#4A4A4A'      // Dark gray for buttons
buttonBorder: '#2A2A2A'  // Darker gray for button borders
buttonText: '#E0E0E0'    // Light gray for button text
selectedBg: '#1A1A1A'    // Dark background for selected items
selectedText: '#9CB4A8'  // Light green text for selected items
```

### Typography
- Primary font: 'MyPager' (custom pixelated font)
- All text uses fontFamily: 'MyPager'
- Sizes: 10, 12, 14, 16, 18, 20, 24px
- Button text: bold, uppercase
- Menu items: size 20px
- Titles: size 18px, bold

### Spacing
Use 8px grid: 8, 12, 16, 20, 24, 32, 40, 48px

### Border Radius
- Display containers: 16px (rounded corners for physical device look)
- Buttons: 10px (slightly rounded for tactile feel)
- LEDs: 6px (circular, borderRadius: 50%)
- Most UI elements: 0px (sharp corners for retro LCD aesthetic)

### Border Widths
- Display outer border: 8px (thick frame)
- Button borders: 3px
- Container borders: 2px
- No borders (0px) for body containers

### Components
- Rounded corners for physical device elements (display frame, buttons)
- Sharp corners for LCD screen elements (menu items, text)
- Thick borders for buttons and display frame
- Uppercase text for buttons and labels
- High contrast between text and backgrounds
- Minimal animations (stepped, not smooth)

## Dependencies Management

### Adding New Dependencies
- Check bundle size impact
- Verify maintenance status
- Prefer well-maintained packages
- Document why the dependency is needed

### Frontend
- Use `npx expo install` for Expo-compatible packages
- Keep Expo SDK version consistent

### Backend
- Use `bun add` for dependencies
- Pin versions in package.json

## Documentation

### Code Comments
- Explain WHY, not WHAT
- Document complex algorithms
- Add JSDoc for public APIs
- Keep comments up to date

### README Updates
- Document new features
- Update setup instructions
- Add troubleshooting tips
- Keep dependencies list current

## API Design

### REST Endpoints
- Use RESTful conventions
- Plural nouns for resources (`/users`, `/friends`)
- Use HTTP methods correctly (GET, POST, PUT, DELETE)
- Return appropriate status codes
- Include pagination for lists

### Request/Response Format
```typescript
// Request
{
  // camelCase fields
}

// Success Response
{
  success: true,
  data: { ... }
}

// Error Response
{
  success: false,
  error: {
    code: 'ERROR_CODE',
    message: 'User-friendly message'
  }
}
```

## Environment Variables

### Frontend
- Prefix with `EXPO_PUBLIC_` for client-side access
- Store in `.env` (gitignored)
- Document all variables in README

### Backend
- Use AWS Parameter Store for sensitive values
- Document all variables in terraform
- Never commit secrets to git

## Accessibility

### Frontend
- Add accessibility labels to interactive elements
- Ensure sufficient color contrast
- Support screen readers
- Test with VoiceOver/TalkBack
- Make touch targets at least 44x44px

## Development Workflow

### Frontend Debugging
- For frontend debugging, Kiro can run the development server in background
- Use `controlBashProcess` with `npm run web` in frontend/ directory
- Web server runs on http://localhost:8081
- Ensure React versions match exactly (react@19.1.0, react-dom@19.1.0)
- Check browser console for errors and warnings

### Background Process Management
- Use `controlBashProcess` tool for long-running commands
- Start: `action: "start"` with appropriate command and path
- Stop: `action: "stop"` with processId
- Monitor: `getProcessOutput` to check logs and errors

### Debugging Steps
1. Start development server in background
2. Check process output for errors
3. Open browser to test changes
4. Monitor console for runtime errors
5. Stop process when debugging complete

## Component/Screen Template

When creating new components or screens, follow this structure:

```typescript
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface MyComponentProps {
  // Props definition
}

export const MyComponent: React.FC<MyComponentProps> = ({ /* props */ }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Content</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Container styles
  },
  text: {
    // Text styles
  },
});
```

**Rules:**
- Always use `StyleSheet.create()` at the bottom of the file
- Never create separate style files
- Keep styles colocated with the component
- Use React Native core components (View, Text, Pressable)
- Follow retro design guidelines (sharp corners, thick borders, monochrome)

## When in Doubt
- Keep it simple (KISS principle)
- Follow existing patterns in the codebase
- Ask for code review
- Refer to the design document in `.kiro/specs/`
- Use background processes for debugging frontend issues
- Always include StyleSheet.create() in new components/screens
