# Requirements Document

## Introduction

This document specifies the requirements for a Social Leaderboard feature in Pager2077. The feature enables users to compete with their friends by tracking and displaying high scores for games (Snake, Tetris). Each user's highest score per game is stored server-side, and leaderboards are filtered to show only scores from the user's friends list. The client only submits scores when a new personal best is achieved, minimizing unnecessary API calls.

## Glossary

- **Leaderboard_System**: The backend service responsible for storing, updating, and retrieving game high scores
- **High_Score**: A user's best score for a specific game, stored as a single record per user per game
- **Friends_Leaderboard**: A ranked list of high scores filtered to include only the current user's friends
- **Game_Identifier**: A string identifier for each supported game (e.g., "snake", "tetris")
- **Score_Record**: A database entry containing userId, game, score, and updatedAt fields

## Requirements

### Requirement 1

**User Story:** As a player, I want my highest game score to be saved to the server, so that my friends can see my best performance.

#### Acceptance Criteria

1. WHEN a user achieves a new high score that exceeds their stored high score THEN the Leaderboard_System SHALL accept and store the new score
2. WHEN a user submits a score equal to or lower than their stored high score THEN the Leaderboard_System SHALL reject the update and return the current stored score
3. WHEN a score is successfully updated THEN the Leaderboard_System SHALL record the current timestamp as updatedAt
4. WHEN a user has no existing score for a game THEN the Leaderboard_System SHALL create a new Score_Record for that user and game

### Requirement 2

**User Story:** As a player, I want to see a leaderboard of my friends' high scores, so that I can compare my performance with people I know.

#### Acceptance Criteria

1. WHEN a user requests the leaderboard for a game THEN the Leaderboard_System SHALL return scores only from users in the requester's friends list
2. WHEN returning leaderboard data THEN the Leaderboard_System SHALL include the user's own score in the results
3. WHEN returning leaderboard data THEN the Leaderboard_System SHALL sort entries by score in descending order
4. WHEN returning leaderboard entries THEN the Leaderboard_System SHALL include the friend's display name, hex code, score, and updatedAt timestamp

### Requirement 3

**User Story:** As a player, I want the app to only send my score to the server when I beat my personal best, so that network usage is minimized.

#### Acceptance Criteria

1. WHEN a game ends with a score higher than the locally stored high score THEN the Client SHALL send the score to the Leaderboard_System
2. WHEN a game ends with a score equal to or lower than the locally stored high score THEN the Client SHALL NOT send a request to the Leaderboard_System
3. WHEN the Leaderboard_System confirms a score update THEN the Client SHALL update the locally stored high score

### Requirement 4

**User Story:** As a player, I want to see the friends leaderboard in the game UI, so that I can view rankings without leaving the game context.

#### Acceptance Criteria

1. WHEN the leaderboard view is displayed THEN the Client SHALL fetch the friends leaderboard from the Leaderboard_System
2. WHEN displaying leaderboard entries THEN the Client SHALL show rank, display name (or hex code if no name), score, and date
3. WHEN the current user appears in the leaderboard THEN the Client SHALL visually highlight their entry
4. WHEN the leaderboard is empty (no friends have scores) THEN the Client SHALL display an appropriate empty state message

### Requirement 5

**User Story:** As a system administrator, I want the leaderboard data to be stored efficiently, so that the system performs well at scale.

#### Acceptance Criteria

1. THE Leaderboard_System SHALL store at most one Score_Record per user per game combination
2. THE Leaderboard_System SHALL use database indexes on userId and game columns for efficient querying
3. WHEN querying the friends leaderboard THEN the Leaderboard_System SHALL use a single database query joining scores with friendships
