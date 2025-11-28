# Design Document: User Display Names

## Overview

This design document outlines the frontend implementation for adding user display names to the Pager2077 application. The feature allows users to set a human-readable display name during first-time setup and view display names throughout the app (friends list, friend requests, messages) instead of hex codes.

The implementation is frontend-only, using local storage for persistence. Display names are stored in two locations:
1. **Secure Storage**: The current user's own display name
2. **Local Storage (AsyncStorage)**: A mapping of hex codes to display names for all known users

This approach allows the feature to work immediately without backend changes, while remaining compatible with future backend integration.

## Architecture

### Component Structure

```
App.tsx
├── AuthContext (existing)
│   └── Enhanced with display name management
├── NameEntryScreen (new)
│   └── First-time setup screen for entering display name
├── EditNameScreen (new)
│   └── Settings screen for changing display name
├── FriendsListScreen (modified)
│   └── Display names instead of hex codes
├── FriendRequestsScreen (modified)
│   └── Display names for requesters
├── MessagesScreen (modified)
│   └── Display names for senders
└── SettingsScreen (modified)
    └── Add "EDIT NAME" option

Services
├── storageService.ts (modified)
│   ├── saveDisplayName()
│   ├── getDisplayName()
│   ├── saveDisplayNameMapping()
│   ├── getDisplayNameMapping()
│   └── getAllDisplayNameMappings()
└── displayNameService.ts (new)
    ├── validateDisplayName()
    ├── getDisplayNameForHexCode()
    └── setDisplayNameForHexCode()
```

### Data Flow

1. **First-Time Setup**:
   - User completes registration (or in dev mode without auth) → AuthContext checks for display name
   - No display name found → Show NameEntryScreen
   - User enters name via T9 numpad → Validate → Save to Secure Storage
   - Create mapping: hexCode → displayName in AsyncStorage (uses mock hex code 'ABC123' in dev mode)
   - Proceed to main menu

2. **Displaying Names**:
   - Screen needs to display hex code → Call getDisplayNameForHexCode()
   - Service checks AsyncStorage for mapping
   - Returns display name if found, otherwise returns hex code
   - Screen renders the result

3. **Editing Name**:
   - User selects "EDIT NAME" in settings → Show EditNameScreen
   - Pre-fill with current display name
   - User modifies name → Validate → Save to Secure Storage
   - Update mapping in AsyncStorage
   - Return to settings

## Components and Interfaces

### 1. NameEntryScreen Component

**Purpose**: First-time setup screen for entering display name using T9 numpad input.

**Props**:
```typescript
interface NameEntryScreenProps {
  onComplete: (displayName: string) => void;
  onSkip?: () => void;
}
```

**State**:
```typescript
{
  input: string;              // Current text input
  currentKey: string | null;  // Currently pressed number key
  keyPressCount: number;      // Number of times current key pressed
  error: string | null;       // Validation error message
  isProcessing: boolean;      // Saving in progress
}
```

**T9 Character Mapping**:
```typescript
const T9_MAP = {
  '0': [' ', '0'],
  '1': ['1'],
  '2': ['a', 'b', 'c', '2'],
  '3': ['d', 'e', 'f', '3'],
  '4': ['g', 'h', 'i', '4'],
  '5': ['j', 'k', 'l', '5'],
  '6': ['m', 'n', 'o', '6'],
  '7': ['p', 'q', 'r', 's', '7'],
  '8': ['t', 'u', 'v', '8'],
  '9': ['w', 'x', 'y', 'z', '9'],
};
```

**Behavior**:
- Number keys (0-9): Multi-tap T9 text entry (letters first, then number)
- Hash key (#): Backspace (delete last character)
- Call button: Submit name (validate and save)
- Back button: Skip and use hex code as default
- 1-second timeout between key presses to move to next character

### 2. EditNameScreen Component

**Purpose**: Settings screen for changing existing display name.

**Props**:
```typescript
interface EditNameScreenProps {
  currentDisplayName: string;
  onSave: (newDisplayName: string) => void;
  onCancel: () => void;
}
```

**State**: Same as NameEntryScreen

**Behavior**: Same as NameEntryScreen, but pre-filled with current name

### 3. Modified Screen Components

**FriendsListScreen**:
- Add `displayNameMap: Record<string, string>` prop
- Replace hex code display with display name lookup
- Format: `displayName` (no hex code shown unless no display name)

**FriendRequestsScreen**:
- Add `displayNameMap: Record<string, string>` prop
- Show requester's display name instead of hex code

**MessagesScreen**:
- Add `displayNameMap: Record<string, string>` prop
- Show sender's display name in message header

**SettingsScreen**:
- Add "EDIT NAME" menu item (index 4, after Help)
- Navigate to EditNameScreen when selected

## Data Models

### Display Name Storage

**Secure Storage** (user's own name):
```typescript
Key: 'displayName'
Value: string  // e.g., "Alice"
```

**AsyncStorage** (hex code mappings):
```typescript
Key: 'displayNameMappings'
Value: JSON string of Record<string, string>
// e.g., '{"A1B2C3":"Alice","D4E5F6":"Bob"}'
```

### TypeScript Interfaces

```typescript
// Add to frontend/src/types/index.ts

export interface DisplayNameMapping {
  [hexCode: string]: string;
}

export interface T9KeyMap {
  [key: string]: string[];
}

export interface T9InputState {
  input: string;
  currentKey: string | null;
  keyPressCount: number;
  lastKeyPressTime: number;
}
```

## Error Handling

### Validation Errors

**Invalid Length**:
- Error: "NAME MUST BE 1-20 CHARS"
- Trigger: Display name length < 1 or > 20
- Action: Show error, keep user on entry screen

**Invalid Characters**:
- Error: "INVALID CHARACTERS"
- Trigger: Display name contains characters outside allowed set
- Action: Show error, keep user on entry screen

**Whitespace Only**:
- Error: "NAME CANNOT BE EMPTY"
- Trigger: Display name is only whitespace
- Action: Show error, keep user on entry screen

### Storage Errors

**Save Failure**:
- Error: "FAILED TO SAVE NAME"
- Trigger: SecureStore or AsyncStorage write fails
- Action: Show error, allow retry

**Load Failure**:
- Error: Silent fallback to hex code
- Trigger: AsyncStorage read fails
- Action: Log error, display hex code instead

## Testing Strategy

### Unit Tests

**displayNameService.ts**:
- `validateDisplayName()` with valid inputs
- `validateDisplayName()` with invalid inputs (too long, too short, invalid chars, whitespace-only)
- `getDisplayNameForHexCode()` with existing mapping
- `getDisplayNameForHexCode()` with no mapping (returns hex code)
- `setDisplayNameForHexCode()` creates/updates mapping

**T9 Input Logic**:
- Single key press enters first character
- Multiple key presses cycle through characters
- Timeout moves to next character position
- Hash key deletes last character
- Character mapping correctness for all keys

### Integration Tests

**First-Time Setup Flow**:
- User completes registration → NameEntryScreen shown
- User enters valid name → Saved and proceeds to main menu
- User skips name entry → Hex code used as default

**Display Name Rendering**:
- Friends list shows display names for mapped hex codes
- Friends list shows hex codes for unmapped codes
- Friend requests show display names
- Messages show display names

**Edit Name Flow**:
- Settings → Edit Name → Pre-filled with current name
- User changes name → Saved successfully
- Updated name appears throughout app


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the acceptance criteria analysis, the following properties have been identified. Note that several criteria were found to be redundant or UI-focused and have been consolidated or excluded.

### Core Storage and Retrieval Properties

**Property 1: Display name storage creates mapping**
*For any* valid display name and hex code, storing the display name should create a mapping in Local Storage that associates the hex code with the display name.
**Validates: Requirements 1.5, 2.5**

**Property 2: Display name lookup returns mapping or fallback**
*For any* hex code, looking up the display name should return the mapped display name if one exists, otherwise return the hex code itself.
**Validates: Requirements 2.2, 2.3, 3.2, 4.2, 5.2**

**Property 3: Batch lookup processes all hex codes**
*For any* list of hex codes, performing a batch display name lookup should return a result for every hex code in the list (either mapped name or hex code fallback).
**Validates: Requirements 3.1, 3.4, 4.1, 4.4, 5.1, 5.4**

### Validation Properties

**Property 4: Length validation enforces bounds**
*For any* string input, validation should accept strings with length between 1 and 20 characters (inclusive) and reject all others.
**Validates: Requirements 2.4, 7.1**

**Property 5: Character validation enforces allowed set**
*For any* string input, validation should accept strings containing only alphanumeric characters, spaces, hyphens, and underscores, and reject strings containing any other characters.
**Validates: Requirements 7.2**

**Property 6: Validation rejects whitespace-only input**
*For any* string composed entirely of whitespace characters, validation should reject the input as invalid.
**Validates: Requirements 7.4**

**Property 7: Valid input allows save**
*For any* display name that passes all validation rules, the system should allow the user to save the display name.
**Validates: Requirements 7.5**

**Property 8: Invalid input shows error**
*For any* display name that fails validation, the system should display an error message to the user.
**Validates: Requirements 7.3**

### Update Properties

**Property 9: Display name update persists to Secure Storage**
*For any* valid new display name, updating the user's display name should persist the new value to Secure Storage.
**Validates: Requirements 6.4**

**Property 10: Display name update updates mapping**
*For any* hex code with an existing display name, updating the display name should update the mapping in Local Storage to reflect the new name.
**Validates: Requirements 6.5**

### T9 Input Properties

**Property 11: T9 multi-tap cycles through characters**
*For any* number key on the numpad, pressing the key multiple times in succession should cycle through the characters mapped to that key in the T9 character map.
**Validates: Requirements 8.2**

**Property 12: Hash key deletes last character**
*For any* non-empty input string, pressing the hash key should remove the last character from the string.
**Validates: Requirements 8.3**

**Property 13: Call button triggers validation and submit**
*For any* input string, pressing the call button should trigger validation of the input and, if valid, submit the display name for storage.
**Validates: Requirements 8.4**

### Property Reflection

After reviewing all identified properties, the following consolidations were made:

- **Consolidated fallback behavior**: Properties 2.2, 2.3, 3.2, 4.2, and 5.2 all describe the same fallback behavior (return display name if exists, otherwise hex code). These were consolidated into Property 2.

- **Consolidated batch lookup**: Properties 3.1, 3.4, 4.1, 4.4, 5.1, and 5.4 all describe batch lookup behavior across different screens. These were consolidated into Property 3.

- **Excluded UI layout properties**: Requirements 3.3, 4.3, and 5.3 describe UI layout concerns (where display names appear) rather than functional behavior, so no properties were created for these.

- **Validation properties remain separate**: While validation properties (4, 5, 6, 7, 8) are related, they test distinct validation rules and error handling, so they remain separate for comprehensive coverage.

## Service Layer Design

### displayNameService.ts

**Purpose**: Centralized service for display name operations, validation, and storage management.

**Functions**:

```typescript
/**
 * Validate a display name against all rules
 * @returns { valid: boolean, error?: string }
 */
export function validateDisplayName(name: string): ValidationResult {
  // Check length (1-20 characters)
  if (name.length < 1 || name.length > 20) {
    return { valid: false, error: 'NAME MUST BE 1-20 CHARS' };
  }
  
  // Check whitespace-only
  if (name.trim().length === 0) {
    return { valid: false, error: 'NAME CANNOT BE EMPTY' };
  }
  
  // Check allowed characters (alphanumeric, space, hyphen, underscore)
  const allowedPattern = /^[a-zA-Z0-9 _-]+$/;
  if (!allowedPattern.test(name)) {
    return { valid: false, error: 'INVALID CHARACTERS' };
  }
  
  return { valid: true };
}

/**
 * Get display name for a hex code, with fallback to hex code
 */
export async function getDisplayNameForHexCode(hexCode: string): Promise<string> {
  const mappings = await getAllDisplayNameMappings();
  return mappings[hexCode] || hexCode;
}

/**
 * Get display names for multiple hex codes
 */
export async function getDisplayNamesForHexCodes(
  hexCodes: string[]
): Promise<Record<string, string>> {
  const mappings = await getAllDisplayNameMappings();
  const result: Record<string, string> = {};
  
  for (const hexCode of hexCodes) {
    result[hexCode] = mappings[hexCode] || hexCode;
  }
  
  return result;
}

/**
 * Set display name for a hex code
 */
export async function setDisplayNameForHexCode(
  hexCode: string,
  displayName: string
): Promise<void> {
  const validation = validateDisplayName(displayName);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  const mappings = await getAllDisplayNameMappings();
  mappings[hexCode] = displayName;
  await saveAllDisplayNameMappings(mappings);
}

/**
 * Get the current user's display name
 */
export async function getCurrentUserDisplayName(): Promise<string | null> {
  return await getDisplayName();
}

/**
 * Set the current user's display name
 */
export async function setCurrentUserDisplayName(
  hexCode: string,
  displayName: string
): Promise<void> {
  const validation = validateDisplayName(displayName);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  // Save to Secure Storage
  await saveDisplayName(displayName);
  
  // Update mapping
  await setDisplayNameForHexCode(hexCode, displayName);
}
```

### storageService.ts (additions)

**New Functions**:

```typescript
const KEYS = {
  // ... existing keys
  DISPLAY_NAME: 'displayName',
  DISPLAY_NAME_MAPPINGS: 'displayNameMappings',
};

/**
 * Save current user's display name to Secure Storage
 */
export async function saveDisplayName(displayName: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.DISPLAY_NAME, displayName);
}

/**
 * Get current user's display name from Secure Storage
 */
export async function getDisplayName(): Promise<string | null> {
  return await SecureStore.getItemAsync(KEYS.DISPLAY_NAME);
}

/**
 * Save all display name mappings to AsyncStorage
 */
export async function saveAllDisplayNameMappings(
  mappings: Record<string, string>
): Promise<void> {
  await AsyncStorage.setItem(
    KEYS.DISPLAY_NAME_MAPPINGS,
    JSON.stringify(mappings)
  );
}

/**
 * Get all display name mappings from AsyncStorage
 */
export async function getAllDisplayNameMappings(): Promise<Record<string, string>> {
  try {
    const json = await AsyncStorage.getItem(KEYS.DISPLAY_NAME_MAPPINGS);
    return json ? JSON.parse(json) : {};
  } catch (error) {
    console.error('Failed to load display name mappings:', error);
    return {};
  }
}

/**
 * Check if user has set a display name
 */
export async function hasDisplayName(): Promise<boolean> {
  const displayName = await getDisplayName();
  return displayName !== null && displayName.length > 0;
}
```

## T9 Input Implementation

### T9 Character Map

```typescript
export const T9_MAP: Record<string, string[]> = {
  '0': [' ', '0'],
  '1': ['1'],
  '2': ['a', 'b', 'c', '2'],
  '3': ['d', 'e', 'f', '3'],
  '4': ['g', 'h', 'i', '4'],
  '5': ['j', 'k', 'l', '5'],
  '6': ['m', 'n', 'o', '6'],
  '7': ['p', 'q', 'r', 's', '7'],
  '8': ['t', 'u', 'v', '8'],
  '9': ['w', 'x', 'y', 'z', '9'],
};

export const T9_TIMEOUT_MS = 1000; // 1 second between key presses
```

### T9 Input Logic

```typescript
class T9InputHandler {
  private input: string = '';
  private currentKey: string | null = null;
  private keyPressCount: number = 0;
  private lastKeyPressTime: number = 0;
  private timeoutId: NodeJS.Timeout | null = null;

  handleKeyPress(key: string): string {
    const now = Date.now();
    
    // Clear timeout if exists
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    // Check if same key pressed within timeout
    if (key === this.currentKey && (now - this.lastKeyPressTime) < T9_TIMEOUT_MS) {
      // Cycle to next character
      this.keyPressCount++;
      const chars = T9_MAP[key];
      const charIndex = this.keyPressCount % chars.length;
      
      // Replace last character with new one
      this.input = this.input.slice(0, -1) + chars[charIndex];
    } else {
      // New key or timeout expired - add first character
      this.currentKey = key;
      this.keyPressCount = 0;
      const chars = T9_MAP[key];
      this.input += chars[0];
    }
    
    this.lastKeyPressTime = now;
    
    // Set timeout to finalize character
    this.timeoutId = setTimeout(() => {
      this.currentKey = null;
      this.keyPressCount = 0;
    }, T9_TIMEOUT_MS);
    
    return this.input;
  }

  handleBackspace(): string {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    this.input = this.input.slice(0, -1);
    this.currentKey = null;
    this.keyPressCount = 0;
    
    return this.input;
  }

  getInput(): string {
    return this.input;
  }

  setInput(value: string): void {
    this.input = value;
    this.currentKey = null;
    this.keyPressCount = 0;
  }

  clear(): void {
    this.input = '';
    this.currentKey = null;
    this.keyPressCount = 0;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}
```

## Navigation Flow Changes

### App.tsx Modifications

**Add State**:
```typescript
const [needsDisplayName, setNeedsDisplayName] = useState(false);
const [displayNameMap, setDisplayNameMap] = useState<Record<string, string>>({});
```

**Check Display Name on Auth**:
```typescript
useEffect(() => {
  async function checkDisplayName() {
    // In development mode (no auth), use a mock hex code for testing
    const effectiveHexCode = hexCode || 'ABC123';
    
    if (fontLoaded && (isAuthenticated || !hexCode)) {
      const hasName = await hasDisplayName();
      setNeedsDisplayName(!hasName);
      
      // Load display name mappings
      const mappings = await getAllDisplayNameMappings();
      setDisplayNameMap(mappings);
      
      // Load current user's display name
      const { getCurrentUserDisplayName } = await import('./src/services/displayNameService');
      const name = await getCurrentUserDisplayName();
      setCurrentDisplayName(name || effectiveHexCode);
    }
  }
  checkDisplayName();
}, [isAuthenticated, hexCode, fontLoaded]);
```

**Conditional Rendering**:
```typescript
// Show name entry screen if needed
if (needsDisplayName) {
  return <NameEntryScreen onComplete={handleDisplayNameSet} />;
}

// Otherwise show normal app
return (
  <NativeBaseProvider theme={retroTheme}>
    {/* ... existing app content ... */}
  </NativeBaseProvider>
);
```

**Handle Display Name Set**:
```typescript
async function handleDisplayNameSet(displayName: string) {
  try {
    await setCurrentUserDisplayName(hexCode!, displayName);
    setNeedsDisplayName(false);
    
    // Reload mappings
    const mappings = await getAllDisplayNameMappings();
    setDisplayNameMap(mappings);
  } catch (error) {
    console.error('Failed to set display name:', error);
    // Show error to user
  }
}
```

## Performance Considerations

### Caching Strategy

- Display name mappings loaded once on app start
- Cached in App.tsx state for quick access
- Reloaded after any display name changes
- No need for frequent AsyncStorage reads

### Optimization Opportunities

1. **Lazy Loading**: Only load mappings when needed (first time viewing friends/messages)
2. **Incremental Updates**: Update single mapping instead of rewriting entire object
3. **Memory Management**: Limit mapping cache size (e.g., last 100 contacts)

## Future Backend Integration

When backend support is added, the following changes will be minimal:

1. **API Calls**: Add API calls to sync display names with server
2. **Conflict Resolution**: Handle cases where local and server names differ
3. **Real-time Updates**: Receive display name updates from other users
4. **Migration**: One-time sync of local mappings to server

The local storage approach ensures the feature works immediately while remaining compatible with future server integration.
