/**
 * Tetris Game Logic Utilities
 * Core game functions for the Tetris implementation
 */

// ============================================
// Types
// ============================================

export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';
export type GameState = 'READY' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';
export type Rotation = 0 | 1 | 2 | 3;

export interface Position {
  x: number;
  y: number;
}

export interface Tetromino {
  type: TetrominoType;
  position: Position;
  rotation: Rotation;
}

export interface TetrisState {
  playfield: (TetrominoType | null)[][];
  currentPiece: Tetromino | null;
  nextPiece: TetrominoType;
  score: number;
  level: number;
  linesCleared: number;
  gameState: GameState;
}

// ============================================
// Constants
// ============================================

export const PLAYFIELD_ROWS = 20;
export const PLAYFIELD_COLS = 10;
export const SPAWN_POSITION: Position = { x: 4, y: 0 };

export const TETROMINO_TYPES: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

// Scoring values for 1, 2, 3, 4 lines cleared
export const LINE_SCORES: Record<number, number> = {
  1: 100,
  2: 300,
  3: 500,
  4: 800,
};

/**
 * Tetromino shapes defined by block positions relative to center
 * Each tetromino has 4 rotation states (0°, 90°, 180°, 270°)
 */
export const TETROMINO_SHAPES: Record<TetrominoType, Position[][]> = {
  I: [
    [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }],   // 0° horizontal
    [{ x: 1, y: -1 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }],   // 90° vertical
    [{ x: -1, y: 1 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }],   // 180° horizontal
    [{ x: 0, y: -1 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }],   // 270° vertical
  ],
  O: [
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],    // All rotations same
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
  ],
  T: [
    [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: -1 }],  // 0° T pointing up
    [{ x: 0, y: -1 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }],   // 90° T pointing right
    [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }],   // 180° T pointing down
    [{ x: 0, y: -1 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }],  // 270° T pointing left
  ],
  S: [
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: 1 }],   // 0° horizontal S
    [{ x: 0, y: -1 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }],   // 90° vertical S
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: 1 }],   // 180° same as 0°
    [{ x: -1, y: -1 }, { x: -1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 }], // 270° vertical S
  ],
  Z: [
    [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],   // 0° horizontal Z
    [{ x: 1, y: -1 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }],   // 90° vertical Z
    [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],   // 180° same as 0°
    [{ x: 0, y: -1 }, { x: -1, y: 0 }, { x: 0, y: 0 }, { x: -1, y: 1 }], // 270° vertical Z
  ],
  J: [
    [{ x: -1, y: -1 }, { x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }], // 0° J pointing up-left
    [{ x: 0, y: -1 }, { x: 1, y: -1 }, { x: 0, y: 0 }, { x: 0, y: 1 }],  // 90° J pointing up-right
    [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }],   // 180° J pointing down-right
    [{ x: 0, y: -1 }, { x: 0, y: 0 }, { x: -1, y: 1 }, { x: 0, y: 1 }],  // 270° J pointing down-left
  ],
  L: [
    [{ x: 1, y: -1 }, { x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }],  // 0° L pointing up-right
    [{ x: 0, y: -1 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],   // 90° L pointing down-right
    [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: -1, y: 1 }],  // 180° L pointing down-left
    [{ x: -1, y: -1 }, { x: 0, y: -1 }, { x: 0, y: 0 }, { x: 0, y: 1 }], // 270° L pointing up-left
  ],
};

// ============================================
// Core Functions
// ============================================

/**
 * Creates an empty 20x10 playfield
 * @returns Empty playfield with all null cells
 */
export function createEmptyPlayfield(): (TetrominoType | null)[][] {
  return Array(PLAYFIELD_ROWS)
    .fill(null)
    .map(() => Array(PLAYFIELD_COLS).fill(null));
}

/**
 * Gets the absolute block positions for a tetromino
 * @param type - The tetromino type
 * @param rotation - The rotation state (0-3)
 * @param position - The center position of the tetromino
 * @returns Array of absolute positions for each block
 */
export function getTetrominoBlocks(
  type: TetrominoType,
  rotation: Rotation,
  position: Position
): Position[] {
  const shape = TETROMINO_SHAPES[type][rotation];
  return shape.map(offset => ({
    x: position.x + offset.x,
    y: position.y + offset.y,
  }));
}

/**
 * Checks if blocks can be placed on the playfield without collision
 * @param playfield - The current playfield state
 * @param blocks - Array of block positions to check
 * @returns True if all blocks can be placed
 */
export function canPlace(
  playfield: (TetrominoType | null)[][],
  blocks: Position[]
): boolean {
  return blocks.every(block => {
    // Check horizontal bounds
    if (block.x < 0 || block.x >= PLAYFIELD_COLS) return false;
    // Check bottom bound (pieces can be above the playfield during spawn)
    if (block.y >= PLAYFIELD_ROWS) return false;
    // Allow blocks above the playfield (y < 0) - they're valid during spawn
    if (block.y < 0) return true;
    // Check collision with locked blocks (only for visible area)
    if (playfield[block.y][block.x] !== null) return false;
    return true;
  });
}


// ============================================
// Movement Functions (Requirements 1.3, 1.4, 1.5)
// ============================================

/**
 * Moves the current piece left if possible
 * @param state - Current game state
 * @returns New state with piece moved left, or unchanged if blocked
 */
export function moveLeft(state: TetrisState): TetrisState {
  if (!state.currentPiece || state.gameState !== 'PLAYING') return state;

  const newPosition: Position = {
    x: state.currentPiece.position.x - 1,
    y: state.currentPiece.position.y,
  };

  const newBlocks = getTetrominoBlocks(
    state.currentPiece.type,
    state.currentPiece.rotation,
    newPosition
  );

  if (canPlace(state.playfield, newBlocks)) {
    return {
      ...state,
      currentPiece: {
        ...state.currentPiece,
        position: newPosition,
      },
    };
  }

  return state;
}

/**
 * Moves the current piece right if possible
 * @param state - Current game state
 * @returns New state with piece moved right, or unchanged if blocked
 */
export function moveRight(state: TetrisState): TetrisState {
  if (!state.currentPiece || state.gameState !== 'PLAYING') return state;

  const newPosition: Position = {
    x: state.currentPiece.position.x + 1,
    y: state.currentPiece.position.y,
  };

  const newBlocks = getTetrominoBlocks(
    state.currentPiece.type,
    state.currentPiece.rotation,
    newPosition
  );

  if (canPlace(state.playfield, newBlocks)) {
    return {
      ...state,
      currentPiece: {
        ...state.currentPiece,
        position: newPosition,
      },
    };
  }

  return state;
}

/**
 * Moves the current piece down (soft drop) if possible
 * @param state - Current game state
 * @returns New state with piece moved down, or unchanged if blocked
 */
export function moveDown(state: TetrisState): TetrisState {
  if (!state.currentPiece || state.gameState !== 'PLAYING') return state;

  const newPosition: Position = {
    x: state.currentPiece.position.x,
    y: state.currentPiece.position.y + 1,
  };

  const newBlocks = getTetrominoBlocks(
    state.currentPiece.type,
    state.currentPiece.rotation,
    newPosition
  );

  if (canPlace(state.playfield, newBlocks)) {
    return {
      ...state,
      currentPiece: {
        ...state.currentPiece,
        position: newPosition,
      },
    };
  }

  return state;
}


// ============================================
// Rotation Function (Requirement 1.6)
// ============================================

/**
 * Rotates the current piece clockwise if possible
 * @param state - Current game state
 * @returns New state with piece rotated, or unchanged if blocked
 */
export function rotate(state: TetrisState): TetrisState {
  if (!state.currentPiece || state.gameState !== 'PLAYING') return state;

  const newRotation = ((state.currentPiece.rotation + 1) % 4) as Rotation;

  const newBlocks = getTetrominoBlocks(
    state.currentPiece.type,
    newRotation,
    state.currentPiece.position
  );

  if (canPlace(state.playfield, newBlocks)) {
    return {
      ...state,
      currentPiece: {
        ...state.currentPiece,
        rotation: newRotation,
      },
    };
  }

  return state;
}


// ============================================
// Hard Drop Function (Requirement 1.7)
// ============================================

/**
 * Locks the current piece into the playfield
 * @param playfield - The current playfield
 * @param piece - The piece to lock
 * @returns New playfield with piece locked in place
 */
export function lockPiece(
  playfield: (TetrominoType | null)[][],
  piece: Tetromino
): (TetrominoType | null)[][] {
  const newPlayfield = playfield.map(row => [...row]);
  const blocks = getTetrominoBlocks(piece.type, piece.rotation, piece.position);

  blocks.forEach(block => {
    if (block.y >= 0 && block.y < PLAYFIELD_ROWS && block.x >= 0 && block.x < PLAYFIELD_COLS) {
      newPlayfield[block.y][block.x] = piece.type;
    }
  });

  return newPlayfield;
}

/**
 * Performs a hard drop - instantly places piece at lowest valid position
 * @param state - Current game state
 * @returns New state with piece at lowest position and locked
 */
export function hardDrop(state: TetrisState): TetrisState {
  if (!state.currentPiece || state.gameState !== 'PLAYING') return state;

  let dropY = state.currentPiece.position.y;

  // Find lowest valid y position
  while (true) {
    const testPosition: Position = {
      x: state.currentPiece.position.x,
      y: dropY + 1,
    };

    const testBlocks = getTetrominoBlocks(
      state.currentPiece.type,
      state.currentPiece.rotation,
      testPosition
    );

    if (!canPlace(state.playfield, testBlocks)) {
      break;
    }

    dropY++;
  }

  // Lock piece at final position
  const finalPiece: Tetromino = {
    ...state.currentPiece,
    position: { x: state.currentPiece.position.x, y: dropY },
  };

  const newPlayfield = lockPiece(state.playfield, finalPiece);

  return {
    ...state,
    playfield: newPlayfield,
    currentPiece: null,
  };
}

/**
 * Gets the ghost piece position (preview of where piece will land)
 * @param state - Current game state
 * @returns Y position where piece would land, or null if no piece
 */
export function getGhostPosition(state: TetrisState): number | null {
  if (!state.currentPiece) return null;

  let dropY = state.currentPiece.position.y;

  while (true) {
    const testPosition: Position = {
      x: state.currentPiece.position.x,
      y: dropY + 1,
    };

    const testBlocks = getTetrominoBlocks(
      state.currentPiece.type,
      state.currentPiece.rotation,
      testPosition
    );

    if (!canPlace(state.playfield, testBlocks)) {
      break;
    }

    dropY++;
  }

  return dropY;
}


// ============================================
// Line Clearing Function (Requirement 2.1)
// ============================================

/**
 * Clears complete lines from the playfield
 * @param playfield - The current playfield
 * @returns Object with new playfield and number of lines cleared
 */
export function clearLines(playfield: (TetrominoType | null)[][]): {
  playfield: (TetrominoType | null)[][];
  linesCleared: number;
} {
  // Find complete rows (all cells filled)
  const completeRows: number[] = [];
  
  for (let y = 0; y < PLAYFIELD_ROWS; y++) {
    if (playfield[y].every(cell => cell !== null)) {
      completeRows.push(y);
    }
  }

  if (completeRows.length === 0) {
    return { playfield, linesCleared: 0 };
  }

  // Create new playfield without complete rows
  const newPlayfield = playfield.filter((_, index) => !completeRows.includes(index));

  // Add empty rows at the top
  const emptyRows = completeRows.length;
  for (let i = 0; i < emptyRows; i++) {
    newPlayfield.unshift(Array(PLAYFIELD_COLS).fill(null));
  }

  return {
    playfield: newPlayfield,
    linesCleared: completeRows.length,
  };
}


// ============================================
// Scoring Function (Requirement 2.2)
// ============================================

/**
 * Calculates score for cleared lines
 * @param linesCleared - Number of lines cleared (1-4)
 * @param level - Current level
 * @returns Score to award
 */
export function calculateScore(linesCleared: number, level: number): number {
  if (linesCleared < 1 || linesCleared > 4) return 0;
  return LINE_SCORES[linesCleared] * level;
}


// ============================================
// Level Progression Function (Requirement 2.4)
// ============================================

/**
 * Calculates level based on total lines cleared
 * @param totalLinesCleared - Total number of lines cleared in the game
 * @returns Current level (1+)
 */
export function calculateLevel(totalLinesCleared: number): number {
  return 1 + Math.floor(totalLinesCleared / 10);
}

/**
 * Calculates fall speed based on level
 * @param level - Current level
 * @returns Fall interval in milliseconds
 */
export function calculateFallSpeed(level: number): number {
  // Speed decreases with each level: 500ms at level 1, minimum 100ms
  return Math.max(100, 500 - (level - 1) * 50);
}


// ============================================
// Game Over Detection (Requirement 3.1)
// ============================================

/**
 * Checks if the game is over (spawn area blocked)
 * @param playfield - The current playfield
 * @returns True if spawn area is blocked
 */
export function isGameOver(playfield: (TetrominoType | null)[][]): boolean {
  // Check if spawn area (top 2 rows, center columns 3-6) has any blocks
  // This is where new pieces spawn
  for (let y = 0; y < 2; y++) {
    for (let x = 3; x <= 6; x++) {
      if (playfield[y][x] !== null) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Checks if a new piece can be spawned
 * @param playfield - The current playfield
 * @param pieceType - The type of piece to spawn
 * @returns True if piece can be spawned
 */
export function canSpawnPiece(
  playfield: (TetrominoType | null)[][],
  pieceType: TetrominoType
): boolean {
  const blocks = getTetrominoBlocks(pieceType, 0, SPAWN_POSITION);
  return canPlace(playfield, blocks);
}


// ============================================
// Game State Serialization (Requirements 9.1, 9.2)
// ============================================

export interface SerializedTetrisState {
  playfield: (TetrominoType | null)[][];
  currentPiece: {
    type: TetrominoType;
    position: { x: number; y: number };
    rotation: number;
  } | null;
  nextPiece: TetrominoType;
  score: number;
  level: number;
  linesCleared: number;
  gameState: GameState;
}

/**
 * Serializes game state to JSON string
 * @param state - The game state to serialize
 * @returns JSON string representation
 */
export function serializeGameState(state: TetrisState): string {
  const serialized: SerializedTetrisState = {
    playfield: state.playfield,
    currentPiece: state.currentPiece
      ? {
          type: state.currentPiece.type,
          position: {
            x: state.currentPiece.position.x,
            y: state.currentPiece.position.y,
          },
          rotation: state.currentPiece.rotation,
        }
      : null,
    nextPiece: state.nextPiece,
    score: state.score,
    level: state.level,
    linesCleared: state.linesCleared,
    gameState: state.gameState,
  };
  return JSON.stringify(serialized);
}

/**
 * Deserializes game state from JSON string
 * @param json - JSON string to deserialize
 * @returns Restored game state
 */
export function deserializeGameState(json: string): TetrisState {
  const parsed: SerializedTetrisState = JSON.parse(json);
  return {
    playfield: parsed.playfield,
    currentPiece: parsed.currentPiece
      ? {
          type: parsed.currentPiece.type,
          position: {
            x: parsed.currentPiece.position.x,
            y: parsed.currentPiece.position.y,
          },
          rotation: parsed.currentPiece.rotation as Rotation,
        }
      : null,
    nextPiece: parsed.nextPiece,
    score: parsed.score,
    level: parsed.level,
    linesCleared: parsed.linesCleared,
    gameState: parsed.gameState,
  };
}


// ============================================
// Helper Functions
// ============================================

/**
 * Gets a random tetromino type
 * @returns Random tetromino type
 */
export function getRandomTetrominoType(): TetrominoType {
  const index = Math.floor(Math.random() * TETROMINO_TYPES.length);
  return TETROMINO_TYPES[index];
}

/**
 * Creates a new tetromino at spawn position
 * @param type - The tetromino type
 * @returns New tetromino object
 */
export function createTetromino(type: TetrominoType): Tetromino {
  return {
    type,
    position: { ...SPAWN_POSITION },
    rotation: 0,
  };
}

/**
 * Creates initial game state
 * @returns Initial TetrisState
 */
export function createInitialState(): TetrisState {
  return {
    playfield: createEmptyPlayfield(),
    currentPiece: null,
    nextPiece: getRandomTetrominoType(),
    score: 0,
    level: 1,
    linesCleared: 0,
    gameState: 'READY',
  };
}

/**
 * Spawns the next piece and generates a new next piece
 * @param state - Current game state
 * @returns New state with spawned piece, or game over state if blocked
 */
export function spawnNextPiece(state: TetrisState): TetrisState {
  const pieceType = state.nextPiece;
  
  if (!canSpawnPiece(state.playfield, pieceType)) {
    return {
      ...state,
      gameState: 'GAME_OVER',
    };
  }

  return {
    ...state,
    currentPiece: createTetromino(pieceType),
    nextPiece: getRandomTetrominoType(),
  };
}

/**
 * Processes a tick of the game (piece falls down)
 * @param state - Current game state
 * @returns New state after tick
 */
export function tick(state: TetrisState): TetrisState {
  if (state.gameState !== 'PLAYING' || !state.currentPiece) {
    return state;
  }

  // Try to move piece down
  const movedState = moveDown(state);

  // If piece didn't move, it's blocked - lock it
  if (
    movedState.currentPiece &&
    movedState.currentPiece.position.y === state.currentPiece.position.y
  ) {
    // Lock the piece
    const lockedPlayfield = lockPiece(state.playfield, state.currentPiece);
    
    // Clear lines
    const { playfield: clearedPlayfield, linesCleared } = clearLines(lockedPlayfield);
    
    // Calculate new score and level
    const newLinesCleared = state.linesCleared + linesCleared;
    const newLevel = calculateLevel(newLinesCleared);
    const scoreGain = calculateScore(linesCleared, state.level);
    
    // Create state with locked piece
    const newState: TetrisState = {
      ...state,
      playfield: clearedPlayfield,
      currentPiece: null,
      score: state.score + scoreGain,
      level: newLevel,
      linesCleared: newLinesCleared,
    };

    // Spawn next piece
    return spawnNextPiece(newState);
  }

  return movedState;
}
