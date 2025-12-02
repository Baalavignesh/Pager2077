# Implementation Plan

- [x] 1. Create shared game components
  - [x] 1.1 Create GameHeader component
    - Create `frontend/src/components/games/GameHeader.tsx`
    - Display game title, score, optional level and extra info
    - Use retro LCD styling consistent with existing screens
    - _Requirements: 2.3_

  - [x] 1.2 Create GameOverlay component
    - Create `frontend/src/components/games/GameOverlay.tsx`
    - Display status text and optional instructions
    - Semi-transparent overlay with retro styling
    - _Requirements: 3.2, 4.1_

  - [x] 1.3 Create GameGrid component
    - Create `frontend/src/components/games/GameGrid.tsx`
    - Accept rows, cols, cellSize, and renderCell function
    - Render grid with border styling
    - _Requirements: 1.1_

  - [x] 1.4 Create GameControls component
    - Create `frontend/src/components/games/GameControls.tsx`
    - Display control hints text at bottom of game area
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 1.7_

  - [x] 1.5 Create LeaderboardView component
    - Create `frontend/src/components/games/LeaderboardView.tsx`
    - Display ranked scores with dates
    - Handle empty state with custom message
    - _Requirements: 5.1, 5.3_

  - [x] 1.6 Create shared components index
    - Create `frontend/src/components/games/index.ts`
    - Export all shared game components
    - _Requirements: 7.1_

- [x] 2. Generalize game service for multiple games
  - [x] 2.1 Refactor gameService.ts to support multiple games
    - Add GameId type ('snake' | 'tetris')
    - Create generic getLeaderboard(gameId) function
    - Create generic addScore(gameId, score) function
    - Maintain backward-compatible aliases for Snake
    - Add Tetris-specific aliases
    - _Requirements: 5.2, 5.3_

  - [ ]* 2.2 Write property test for leaderboard sorting
    - **Property 10: Leaderboard maintains sorted order**
    - **Validates: Requirements 5.2, 5.3**

- [x] 3. Implement Tetris game logic utilities
  - [x] 3.1 Create tetrisLogic.ts with core game functions
    - Create `frontend/src/utils/tetrisLogic.ts`
    - Define tetromino shapes for all 7 types with rotation states
    - Implement createEmptyPlayfield() function
    - Implement getTetrominoBlocks(type, rotation, position) function
    - Implement collision detection: canPlace(playfield, blocks)
    - _Requirements: 1.1, 1.2_

  - [ ]* 3.2 Write property test for spawned piece validity
    - **Property 1: Spawned pieces are valid tetromino types**
    - **Validates: Requirements 1.2**

  - [x] 3.3 Implement movement functions
    - Implement moveLeft(state) function
    - Implement moveRight(state) function
    - Implement moveDown(state) function (soft drop)
    - All functions check collision before applying
    - _Requirements: 1.3, 1.4, 1.5_

  - [ ]* 3.4 Write property test for movement validity
    - **Property 2: Movement preserves piece validity**
    - **Validates: Requirements 1.3, 1.4, 1.5**

  - [x] 3.5 Implement rotation function
    - Implement rotate(state) function for clockwise rotation
    - Check collision after rotation
    - _Requirements: 1.6_

  - [ ]* 3.6 Write property test for rotation validity
    - **Property 3: Rotation preserves piece validity**
    - **Validates: Requirements 1.6**

  - [x] 3.7 Implement hard drop function
    - Implement hardDrop(state) function
    - Find lowest valid y position
    - Lock piece immediately
    - _Requirements: 1.7_

  - [ ]* 3.8 Write property test for hard drop
    - **Property 4: Hard drop places piece at lowest valid position**
    - **Validates: Requirements 1.7**

  - [x] 3.9 Implement line clearing function
    - Implement clearLines(playfield) function
    - Detect complete rows
    - Remove complete rows and shift above rows down
    - Return number of lines cleared
    - _Requirements: 2.1_

  - [ ]* 3.10 Write property test for line clearing
    - **Property 5: Line clearing shifts rows correctly**
    - **Validates: Requirements 2.1**

  - [x] 3.11 Implement scoring function
    - Implement calculateScore(linesCleared, level) function
    - Apply scoring formula: 100/300/500/800 × level
    - _Requirements: 2.2_

  - [ ]* 3.12 Write property test for scoring
    - **Property 6: Scoring calculation is correct**
    - **Validates: Requirements 2.2**

  - [x] 3.13 Implement level progression function
    - Implement calculateLevel(totalLinesCleared) function
    - Level = 1 + floor(lines / 10)
    - _Requirements: 2.4_

  - [ ]* 3.14 Write property test for level progression
    - **Property 7: Level progression is correct**
    - **Validates: Requirements 2.4**

  - [x] 3.15 Implement game over detection
    - Implement isGameOver(playfield) function
    - Check if spawn area is blocked
    - _Requirements: 3.1_

  - [ ]* 3.16 Write property test for game over detection
    - **Property 8: Game over detection is correct**
    - **Validates: Requirements 3.1**

  - [x] 3.17 Implement game state serialization
    - Implement serializeGameState(state) function
    - Implement deserializeGameState(json) function
    - _Requirements: 9.1, 9.2_

  - [ ]* 3.18 Write property test for serialization round-trip
    - **Property 12: Game state serialization round-trip**
    - **Validates: Requirements 9.1, 9.2, 9.3**

- [x] 4. Checkpoint - Make sure all tests are passing
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement TetrisGameScreen component
  - [x] 5.1 Create TetrisGameScreen with basic structure
    - Create `frontend/src/screens/TetrisGameScreen.tsx`
    - Use forwardRef with TetrisGameScreenHandle
    - Set up game state with useState
    - Use shared GameHeader, GameGrid, GameOverlay, GameControls components
    - _Requirements: 1.1, 7.3_

  - [x] 5.2 Implement game loop and state machine
    - Implement READY, PLAYING, PAUSED, GAME_OVER states
    - Set up game loop with useEffect and setInterval
    - Handle automatic piece falling based on level speed
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ]* 5.3 Write property test for pause state
    - **Property 9: Pause state freezes game**
    - **Validates: Requirements 4.1, 4.2, 4.3**

  - [x] 5.4 Implement piece spawning and next piece preview
    - Generate random next piece on spawn
    - Display next piece in preview area
    - _Requirements: 1.2, 8.1, 8.2_

  - [ ]* 5.5 Write property test for next piece queue
    - **Property 11: Next piece queue is always populated**
    - **Validates: Requirements 8.1, 8.2**

  - [x] 5.6 Wire up imperative handle methods
    - Implement handleDirection for movement and rotation
    - Implement handleSelect for hard drop and game start/resume
    - Implement handleBack for pause and exit
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 1.7, 4.1, 4.3, 4.4_

  - [x] 5.7 Implement haptic feedback
    - Add light haptic on move/rotate
    - Add medium haptic on line clear
    - Add impact haptic on hard drop
    - Add error haptic on game over
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 5.8 Implement game over handling
    - Call onGameOver callback with final score
    - Save score to leaderboard via gameService
    - _Requirements: 3.2, 3.3, 3.4_

- [x] 6. Create TetrisLeaderboardScreen
  - [x] 6.1 Create TetrisLeaderboardScreen component
    - Create `frontend/src/screens/TetrisLeaderboardScreen.tsx`
    - Use shared LeaderboardView component
    - Fetch scores from gameService
    - _Requirements: 5.1, 5.3_

- [x] 7. Integrate Tetris into games menu and navigation
  - [x] 7.1 Update GamesMenuScreen to include Tetris
    - Add Tetris as second game option
    - Handle Tetris submenu (Play, Leaderboard)
    - _Requirements: 7.1, 7.2_

  - [x] 7.2 Update App.tsx navigation for Tetris
    - Add 'tetrisGame' and 'tetrisLeaderboard' screen types
    - Add tetrisGameRef for imperative handle
    - Wire numpad controls to Tetris game
    - Handle navigation to/from Tetris screens
    - _Requirements: 7.1, 7.2, 7.3_

- [ ] 8. Refactor Snake game to use shared components
  - [ ] 8.1 Update SnakeGameScreen to use shared components
    - Replace inline header with GameHeader
    - Replace inline overlay with GameOverlay
    - Replace inline controls with GameControls
    - Ensure visual consistency with Tetris
    - _Requirements: 7.1_

  - [ ] 8.2 Update SnakeLeaderboardScreen to use LeaderboardView
    - Replace inline leaderboard rendering with LeaderboardView
    - _Requirements: 5.1_

- [ ] 9. Final Checkpoint - Make sure all tests are passing
  - Ensure all tests pass, ask the user if questions arise.
