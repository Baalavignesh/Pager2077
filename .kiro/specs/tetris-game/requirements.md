# Requirements Document

## Introduction

This document specifies the requirements for implementing a classic Tetris game within the Pager2077 retro-futuristic pager application. The Tetris game will follow the same patterns established by the existing Snake game, integrating seamlessly with the Games menu, using the numpad controls for gameplay, and maintaining the retro LCD aesthetic. The game will feature standard Tetris mechanics including falling tetrominoes, line clearing, scoring, and increasing difficulty.

## Glossary

- **Tetris_Game**: The classic puzzle game where players manipulate falling tetrominoes to complete horizontal lines
- **Tetromino**: A geometric shape composed of four square blocks arranged in various configurations (I, O, T, S, Z, J, L pieces)
- **Playfield**: The 10-column by 20-row grid where tetrominoes fall and stack
- **Line_Clear**: The action of completing a horizontal row with blocks, causing it to disappear and award points
- **Ghost_Piece**: A preview showing where the current tetromino will land if dropped
- **Hard_Drop**: Instantly dropping the current tetromino to the bottom of the playfield
- **Soft_Drop**: Accelerating the fall speed of the current tetromino
- **Level**: The current difficulty tier that determines fall speed
- **Game_Service**: The service responsible for storing and retrieving game scores and leaderboard data

## Requirements

### Requirement 1

**User Story:** As a player, I want to see and control falling tetrominoes, so that I can strategically place them to complete lines.

#### Acceptance Criteria

1. WHEN the Tetris_Game starts THEN THE Tetris_Game SHALL display a 10x20 Playfield grid with the retro LCD aesthetic
2. WHEN a new tetromino spawns THEN THE Tetris_Game SHALL randomly select one of seven standard tetromino shapes (I, O, T, S, Z, J, L)
3. WHEN the player presses the left navigation key (4) THEN THE Tetris_Game SHALL move the current tetromino one cell left if space permits
4. WHEN the player presses the right navigation key (6) THEN THE Tetris_Game SHALL move the current tetromino one cell right if space permits
5. WHEN the player presses the down navigation key (8) THEN THE Tetris_Game SHALL perform a soft drop, accelerating the tetromino downward
6. WHEN the player presses the up navigation key (2) THEN THE Tetris_Game SHALL rotate the current tetromino clockwise if space permits
7. WHEN the player presses the select button (5) THEN THE Tetris_Game SHALL perform a hard drop, instantly placing the tetromino at the lowest valid position

### Requirement 2

**User Story:** As a player, I want completed lines to clear and award points, so that I can achieve high scores.

#### Acceptance Criteria

1. WHEN a horizontal row is completely filled with blocks THEN THE Tetris_Game SHALL clear that row and shift all rows above it down by one
2. WHEN multiple rows are cleared simultaneously THEN THE Tetris_Game SHALL award bonus points based on the number of rows cleared (1=100, 2=300, 3=500, 4=800 multiplied by level)
3. WHEN rows are cleared THEN THE Tetris_Game SHALL update the displayed score immediately
4. WHEN the player clears 10 lines THEN THE Tetris_Game SHALL increase the level by one and increase the fall speed

### Requirement 3

**User Story:** As a player, I want the game to end when I can no longer place pieces, so that I know when my game session is complete.

#### Acceptance Criteria

1. WHEN a new tetromino cannot spawn because the spawn area is blocked THEN THE Tetris_Game SHALL transition to the game over state
2. WHEN the game over state is reached THEN THE Tetris_Game SHALL display the final score and prompt to restart
3. WHEN the game over state is reached THEN THE Tetris_Game SHALL save the score to the leaderboard via Game_Service
4. WHEN the player presses select in the game over state THEN THE Tetris_Game SHALL reset and start a new game

### Requirement 4

**User Story:** As a player, I want to pause and resume the game, so that I can take breaks without losing progress.

#### Acceptance Criteria

1. WHEN the player presses the back button during gameplay THEN THE Tetris_Game SHALL pause the game and display a pause overlay
2. WHEN the game is paused THEN THE Tetris_Game SHALL stop all tetromino movement and timer progression
3. WHEN the player presses select while paused THEN THE Tetris_Game SHALL resume gameplay from the paused state
4. WHEN the player presses back while paused THEN THE Tetris_Game SHALL exit to the games menu

### Requirement 5

**User Story:** As a player, I want to see my high scores, so that I can track my progress and compete with myself.

#### Acceptance Criteria

1. WHEN the player selects leaderboard from the Tetris menu THEN THE Tetris_Game SHALL display the top 10 scores with dates
2. WHEN a game ends with a qualifying score THEN THE Game_Service SHALL add the score to the leaderboard
3. WHEN displaying the leaderboard THEN THE Tetris_Game SHALL sort scores in descending order

### Requirement 6

**User Story:** As a player, I want the game to provide feedback through haptics and sound, so that I have an engaging gameplay experience.

#### Acceptance Criteria

1. WHEN a tetromino is moved or rotated THEN THE Tetris_Game SHALL trigger light haptic feedback if vibration is enabled
2. WHEN a line is cleared THEN THE Tetris_Game SHALL trigger medium haptic feedback if vibration is enabled
3. WHEN the game ends THEN THE Tetris_Game SHALL trigger error haptic feedback if vibration is enabled
4. WHEN a hard drop is performed THEN THE Tetris_Game SHALL trigger impact haptic feedback if vibration is enabled

### Requirement 7

**User Story:** As a player, I want to access Tetris from the games menu, so that I can easily find and play the game.

#### Acceptance Criteria

1. WHEN the player navigates to the games menu THEN THE Tetris_Game SHALL appear as a selectable option alongside Snake
2. WHEN the player selects Tetris from the games menu THEN THE Tetris_Game SHALL display a submenu with Play and Leaderboard options
3. WHEN the player selects Play THEN THE Tetris_Game SHALL start a new game in the ready state

### Requirement 8

**User Story:** As a player, I want to see a preview of the next piece, so that I can plan my strategy.

#### Acceptance Criteria

1. WHEN a tetromino is active THEN THE Tetris_Game SHALL display the next tetromino in a preview area
2. WHEN the current tetromino locks in place THEN THE Tetris_Game SHALL update the preview to show the subsequent piece

### Requirement 9

**User Story:** As a player, I want the game state to be serialized and deserialized correctly, so that game logic remains consistent.

#### Acceptance Criteria

1. WHEN serializing game state to JSON THEN THE Tetris_Game SHALL encode all playfield cells, current piece position, and score
2. WHEN deserializing game state from JSON THEN THE Tetris_Game SHALL restore the exact same game state
3. WHEN serializing then deserializing game state THEN THE Tetris_Game SHALL produce an equivalent game state (round-trip consistency)
