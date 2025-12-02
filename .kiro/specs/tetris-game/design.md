# Tetris Game Design Document

## Overview

This document describes the design for implementing a classic Tetris game within the Pager2077 application. The game follows the established patterns from the Snake game implementation, using React Native with TypeScript, integrating with the existing numpad controls, and maintaining the retro LCD aesthetic.

The Tetris game features:
- Standard 10x20 playfield with 7 tetromino shapes
- Numpad-based controls (2=rotate, 4=left, 6=right, 8=soft drop, 5=hard drop)
- Line clearing with combo scoring
- Level progression with increasing speed
- Next piece preview
- Leaderboard integration via Game_Service
- Pause/resume functionality

## Architecture

The Tetris game uses a shared game component architecture that enables code reuse across Snake, Tetris, and future games:

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                              │
│  (Navigation, Game State Management, Numpad Event Routing)   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Shared Game Components                      │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │   GameHeader    │  │   GameOverlay   │                   │
│  │ (title, score)  │  │ (status, hints) │                   │
│  └─────────────────┘  └─────────────────┘                   │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │   GameGrid      │  │  GameControls   │                   │
│  │ (cell renderer) │  │ (control hints) │                   │
│  └─────────────────┘  └─────────────────┘                   │
│  ┌─────────────────┐                                        │
│  │ LeaderboardView │                                        │
│  │ (scores list)   │                                        │
│  └─────────────────┘                                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    TetrisGameScreen                          │
│  (Game Logic, State Machine, uses shared components)         │
│  - forwardRef with imperative handle                         │
│  - handleDirection(dir), handleSelect(), handleBack()        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      gameService.ts                          │
│  (Leaderboard Storage via AsyncStorage)                      │
│  - getLeaderboard(gameId)                                    │
│  - addScore(gameId, score)                                   │
│  - Game-specific helpers                                     │
└─────────────────────────────────────────────────────────────┘
```

### Shared Game Components

These components will be created in `frontend/src/components/games/` and reused by Snake, Tetris, and future games:

1. **GameHeader** - Displays game title and score with consistent retro styling
2. **GameOverlay** - Shows status messages (READY, PAUSED, GAME OVER) with optional instructions
3. **GameGrid** - Renders a grid of cells with customizable cell renderer
4. **GameControls** - Displays control hints at the bottom of the screen
5. **LeaderboardView** - Displays top scores with dates (shared between Snake and Tetris leaderboard screens)

## Components and Interfaces

### Shared Game Interfaces

```typescript
// Common direction type used by all games
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

// Common game handle interface - all games expose these methods
export interface GameScreenHandle {
  handleDirection: (dir: Direction) => void;
  handleSelect: () => void;
  handleBack?: () => void; // Optional, for games with pause support
}

// Common game props interface
interface GameScreenProps {
  onGameOver: (score: number) => void;
  onExit?: () => void;
  soundEnabled: boolean;
  vibrateEnabled: boolean;
}
```

### Shared Game Components

```typescript
// GameHeader - displays title and score
interface GameHeaderProps {
  title: string;
  score: number;
  level?: number; // Optional level display
  extraInfo?: string; // Optional extra info (e.g., lines cleared)
}

// GameOverlay - displays status messages
interface GameOverlayProps {
  visible: boolean;
  statusText: string;
  instructions?: string;
}

// GameGrid - renders a grid with custom cell renderer
interface GameGridProps {
  rows: number;
  cols: number;
  cellSize: number;
  renderCell: (x: number, y: number) => React.ReactElement;
}

// GameControls - displays control hints
interface GameControlsProps {
  controlText: string;
}

// LeaderboardView - displays scores list
interface LeaderboardViewProps {
  title: string;
  scores: LeaderboardEntry[];
  emptyMessage?: string;
}
```

### TetrisGameScreen Component

```typescript
// Tetris-specific handle extends base game handle
export interface TetrisGameScreenHandle extends GameScreenHandle {
  handleBack: () => void; // Required for pause support
}

interface TetrisGameScreenProps extends GameScreenProps {
  onExit: () => void; // Required for exit on pause
}
```

### Game State Types

```typescript
type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';
type GameState = 'READY' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';
type Rotation = 0 | 1 | 2 | 3; // 0°, 90°, 180°, 270°

interface Position {
  x: number;
  y: number;
}

interface Tetromino {
  type: TetrominoType;
  position: Position;
  rotation: Rotation;
}

interface TetrisState {
  playfield: (TetrominoType | null)[][]; // 20 rows x 10 cols
  currentPiece: Tetromino | null;
  nextPiece: TetrominoType;
  score: number;
  level: number;
  linesCleared: number;
  gameState: GameState;
}
```

### Tetromino Shapes

Each tetromino is defined by its block positions relative to a center point for each rotation state:

```typescript
const TETROMINO_SHAPES: Record<TetrominoType, Position[][]> = {
  I: [
    [{x: -1, y: 0}, {x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}],   // 0°
    [{x: 0, y: -1}, {x: 0, y: 0}, {x: 0, y: 1}, {x: 0, y: 2}],   // 90°
    [{x: -1, y: 0}, {x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}],   // 180°
    [{x: 0, y: -1}, {x: 0, y: 0}, {x: 0, y: 1}, {x: 0, y: 2}],   // 270°
  ],
  O: [
    [{x: 0, y: 0}, {x: 1, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}],    // All rotations same
    [{x: 0, y: 0}, {x: 1, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}],
    [{x: 0, y: 0}, {x: 1, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}],
    [{x: 0, y: 0}, {x: 1, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}],
  ],
  // T, S, Z, J, L shapes defined similarly...
};
```

### Game Service (Generalized)

```typescript
// Generalized game service supporting multiple games
type GameId = 'snake' | 'tetris';

const KEYS: Record<GameId, string> = {
  snake: 'snakeLeaderboard',
  tetris: 'tetrisLeaderboard',
};

// Generic leaderboard functions
export async function getLeaderboard(gameId: GameId): Promise<LeaderboardEntry[]>;
export async function addScore(gameId: GameId, score: number): Promise<void>;
export async function clearLeaderboard(gameId: GameId): Promise<void>;
export async function isHighScore(gameId: GameId, score: number): Promise<boolean>;

// Backward-compatible aliases for Snake (existing code)
export const getSnakeLeaderboard = () => getLeaderboard('snake');
export const addSnakeScore = (score: number) => addScore('snake', score);

// Tetris-specific aliases
export const getTetrisLeaderboard = () => getLeaderboard('tetris');
export const addTetrisScore = (score: number) => addScore('tetris', score);
```

## Data Models

### Playfield Representation

The playfield is a 2D array where:
- `null` represents an empty cell
- A `TetrominoType` value represents a locked block of that piece type (for potential color coding)

```typescript
// 20 rows (0 = top, 19 = bottom), 10 columns (0 = left, 9 = right)
type Playfield = (TetrominoType | null)[][];

// Initial empty playfield
const createEmptyPlayfield = (): Playfield => 
  Array(20).fill(null).map(() => Array(10).fill(null));
```

### Scoring System

| Lines Cleared | Base Points | Formula |
|---------------|-------------|---------|
| 1 (Single)    | 100         | 100 × level |
| 2 (Double)    | 300         | 300 × level |
| 3 (Triple)    | 500         | 500 × level |
| 4 (Tetris)    | 800         | 800 × level |

### Level Progression

- Level increases every 10 lines cleared
- Fall speed decreases with each level: `speed = max(100, 500 - (level - 1) * 50)` ms

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the prework analysis, the following properties have been identified. Redundant properties have been consolidated.

### Property 1: Spawned pieces are valid tetromino types
*For any* spawned tetromino, the piece type SHALL be one of the seven valid types (I, O, T, S, Z, J, L)
**Validates: Requirements 1.2**

### Property 2: Movement preserves piece validity
*For any* valid game state and movement action (left, right, down), if the move is permitted, the resulting piece position SHALL be within playfield bounds and not colliding with locked blocks
**Validates: Requirements 1.3, 1.4, 1.5**

### Property 3: Rotation preserves piece validity
*For any* valid game state with a rotatable piece, if rotation is permitted, the resulting piece orientation SHALL not collide with playfield boundaries or locked blocks
**Validates: Requirements 1.6**

### Property 4: Hard drop places piece at lowest valid position
*For any* valid game state with an active piece, performing a hard drop SHALL place the piece at the lowest y-position where no collision occurs
**Validates: Requirements 1.7**

### Property 5: Line clearing shifts rows correctly
*For any* playfield with one or more complete rows, clearing those rows SHALL remove them and shift all rows above down by the number of cleared rows, preserving the total number of rows at 20
**Validates: Requirements 2.1**

### Property 6: Scoring calculation is correct
*For any* number of simultaneously cleared lines (1-4) and level, the awarded score SHALL equal the base points (100/300/500/800) multiplied by the current level
**Validates: Requirements 2.2**

### Property 7: Level progression is correct
*For any* game state, the level SHALL equal 1 plus the floor of (total lines cleared / 10)
**Validates: Requirements 2.4**

### Property 8: Game over detection is correct
*For any* playfield where the spawn area (top rows, center columns) contains locked blocks, attempting to spawn a new piece SHALL trigger game over
**Validates: Requirements 3.1**

### Property 9: Pause state freezes game
*For any* paused game state, the playfield, current piece, score, and level SHALL remain unchanged regardless of elapsed time
**Validates: Requirements 4.1, 4.2, 4.3**

### Property 10: Leaderboard maintains sorted order
*For any* leaderboard with scores, the entries SHALL be sorted in descending order by score
**Validates: Requirements 5.2, 5.3**

### Property 11: Next piece queue is always populated
*For any* game state with an active piece, the next piece preview SHALL contain a valid tetromino type
**Validates: Requirements 8.1, 8.2**

### Property 12: Game state serialization round-trip
*For any* valid game state, serializing to JSON and deserializing back SHALL produce an equivalent game state
**Validates: Requirements 9.1, 9.2, 9.3**

## Error Handling

### Collision Detection
- All movement and rotation operations check for collisions before applying
- If a collision would occur, the operation is silently ignored (no error state)

### Spawn Failure
- If a new piece cannot spawn due to blocked spawn area, transition to GAME_OVER state
- Display final score and save to leaderboard

### Invalid Input
- Invalid direction inputs are ignored
- Button presses during invalid states (e.g., movement while paused) are ignored

## Testing Strategy

### Property-Based Testing Library
The implementation will use **fast-check** for property-based testing, consistent with TypeScript/JavaScript ecosystem best practices.

### Dual Testing Approach

**Unit Tests:**
- Tetromino shape definitions are correct
- Initial game state is valid
- Specific edge cases (wall kicks, T-spin scenarios)

**Property-Based Tests:**
- Each correctness property above will have a corresponding property-based test
- Tests will run a minimum of 100 iterations
- Each test will be tagged with the property it validates using format: `**Feature: tetris-game, Property {number}: {property_text}**`

### Test File Structure
```
frontend/src/
├── components/
│   └── games/
│       ├── GameHeader.tsx
│       ├── GameOverlay.tsx
│       ├── GameGrid.tsx
│       ├── GameControls.tsx
│       ├── LeaderboardView.tsx
│       └── index.ts
├── screens/
│   ├── TetrisGameScreen.tsx
│   ├── TetrisGameScreen.test.ts
│   ├── TetrisLeaderboardScreen.tsx
│   ├── SnakeGameScreen.tsx (refactored to use shared components)
│   └── SnakeLeaderboardScreen.tsx (refactored to use shared components)
├── services/
│   ├── gameService.ts (generalized)
│   └── gameService.test.ts
└── utils/
    ├── tetrisLogic.ts
    └── tetrisLogic.test.ts
```

### Generator Strategy for Property Tests

```typescript
// Generate valid tetromino types
const tetrominoTypeArb = fc.constantFrom('I', 'O', 'T', 'S', 'Z', 'J', 'L');

// Generate valid positions within playfield
const positionArb = fc.record({
  x: fc.integer({ min: 0, max: 9 }),
  y: fc.integer({ min: 0, max: 19 }),
});

// Generate valid playfield (sparse representation for efficiency)
const playfieldArb = fc.array(
  fc.record({
    x: fc.integer({ min: 0, max: 9 }),
    y: fc.integer({ min: 0, max: 19 }),
    type: tetrominoTypeArb,
  }),
  { maxLength: 100 }
);

// Generate valid game state
const gameStateArb = fc.record({
  playfield: playfieldArb,
  currentPiece: fc.option(tetrominoArb),
  nextPiece: tetrominoTypeArb,
  score: fc.nat(),
  level: fc.integer({ min: 1, max: 20 }),
  linesCleared: fc.nat(),
  gameState: fc.constantFrom('READY', 'PLAYING', 'PAUSED', 'GAME_OVER'),
});
```
