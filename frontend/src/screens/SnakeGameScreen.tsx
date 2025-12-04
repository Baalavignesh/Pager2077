import React, { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { submitHighScore, addScore } from '../services/gameService';
import { PagerDisplayGame, GAME_TYPOGRAPHY, GAME_COLORS } from '../components/PagerDisplayGame';

// Game constants
const GRID_SIZE = 12;
// Cell size for compact game grid centered in screen
const CELL_SIZE = 20;
const INITIAL_SPEED = 350; // Slower initial speed for better playability
const SPEED_INCREMENT = 10;
const MIN_SPEED = 120;

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };
type GameState = 'READY' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export interface SnakeGameScreenHandle {
  handleDirection: (dir: Direction) => void;
  handleSelect: () => void;
}

interface SnakeGameScreenProps {
  onGameOver: (score: number) => void;
  soundEnabled: boolean;
  vibrateEnabled: boolean;
}

export const SnakeGameScreen = forwardRef<SnakeGameScreenHandle, SnakeGameScreenProps>(
  ({ onGameOver, soundEnabled, vibrateEnabled }, ref) => {
    const [snake, setSnake] = useState<Position[]>([{ x: 3, y: 6 }]);
    const [food, setFood] = useState<Position>({ x: 8, y: 6 });
    const [direction, setDirection] = useState<Direction>('RIGHT');
    const [gameState, setGameState] = useState<GameState>('READY');
    const [score, setScore] = useState(0);
    const [speed, setSpeed] = useState(INITIAL_SPEED);
    
    const directionRef = useRef<Direction>('RIGHT');
    const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
    const gameStateRef = useRef<GameState>('READY');
    const directionChangedThisTick = useRef<boolean>(false);
    const mountedTimeRef = useRef<number>(Date.now());

    const generateFood = useCallback((currentSnake: Position[]): Position => {
      let newFood: Position;
      do {
        newFood = {
          x: Math.floor(Math.random() * GRID_SIZE),
          y: Math.floor(Math.random() * GRID_SIZE),
        };
      } while (currentSnake.some(seg => seg.x === newFood.x && seg.y === newFood.y));
      return newFood;
    }, []);

    const resetGame = useCallback(() => {
      // Start snake in center, moving right - plenty of room in all directions
      const initialSnake = [{ x: 3, y: 6 }];
      setSnake(initialSnake);
      setFood(generateFood(initialSnake));
      setDirection('RIGHT');
      directionRef.current = 'RIGHT';
      setScore(0);
      setSpeed(INITIAL_SPEED);
    }, [generateFood]);

    const startGame = useCallback(() => {
      // Prevent accidental start within 300ms of mounting (from button press propagation)
      if (Date.now() - mountedTimeRef.current < 300) {
        return;
      }
      
      if (gameState === 'READY' || gameState === 'GAME_OVER') {
        // Reset game state first
        const initialSnake = [{ x: 3, y: 6 }];
        setSnake(initialSnake);
        setFood(generateFood(initialSnake));
        setDirection('RIGHT');
        directionRef.current = 'RIGHT';
        setScore(0);
        setSpeed(INITIAL_SPEED);
        // Then start playing
        setGameState('PLAYING');
        gameStateRef.current = 'PLAYING';
      } else if (gameState === 'PAUSED') {
        setGameState('PLAYING');
        gameStateRef.current = 'PLAYING';
      } else if (gameState === 'PLAYING') {
        setGameState('PAUSED');
        gameStateRef.current = 'PAUSED';
      }
    }, [gameState, generateFood]);


    const moveSnake = useCallback(() => {
      // Allow direction change for next tick
      directionChangedThisTick.current = false;
      
      setSnake(currentSnake => {
        const head = currentSnake[0];
        const dir = directionRef.current;
        
        let newHead: Position;
        switch (dir) {
          case 'UP':
            newHead = { x: head.x, y: head.y - 1 };
            break;
          case 'DOWN':
            newHead = { x: head.x, y: head.y + 1 };
            break;
          case 'LEFT':
            newHead = { x: head.x - 1, y: head.y };
            break;
          case 'RIGHT':
            newHead = { x: head.x + 1, y: head.y };
            break;
        }

        // Wrap around walls (come out the opposite side)
        if (newHead.x < 0) {
          newHead.x = GRID_SIZE - 1;
        } else if (newHead.x >= GRID_SIZE) {
          newHead.x = 0;
        }
        if (newHead.y < 0) {
          newHead.y = GRID_SIZE - 1;
        } else if (newHead.y >= GRID_SIZE) {
          newHead.y = 0;
        }

        // Check self collision
        if (currentSnake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
          setGameState('GAME_OVER');
          gameStateRef.current = 'GAME_OVER';
          if (vibrateEnabled) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
          return currentSnake;
        }

        const newSnake = [newHead, ...currentSnake];

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 10);
          setFood(generateFood(newSnake));
          setSpeed(s => Math.max(MIN_SPEED, s - SPEED_INCREMENT));
          if (vibrateEnabled) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          return newSnake;
        }

        // Remove tail if no food eaten
        newSnake.pop();
        return newSnake;
      });
    }, [food, generateFood, vibrateEnabled]);

    // Game loop
    useEffect(() => {
      if (gameState === 'PLAYING') {
        gameLoopRef.current = setInterval(moveSnake, speed);
      } else {
        if (gameLoopRef.current) {
          clearInterval(gameLoopRef.current);
          gameLoopRef.current = null;
        }
      }

      return () => {
        if (gameLoopRef.current) {
          clearInterval(gameLoopRef.current);
        }
      };
    }, [gameState, speed, moveSnake]);

    // Handle game over - use ref to prevent multiple calls
    const gameOverCalledRef = useRef(false);
    
    useEffect(() => {
      if (gameState === 'GAME_OVER' && !gameOverCalledRef.current) {
        gameOverCalledRef.current = true;
        
        // Save score locally
        addScore('snake', score);
        
        // Requirement 3.1, 3.2: Submit high score to server
        // submitHighScore only calls API if score beats local high
        submitHighScore('snake', score).catch(err => {
          console.error('Failed to submit snake high score:', err);
        });
        
        onGameOver(score);
      } else if (gameState !== 'GAME_OVER') {
        // Reset the flag when game restarts
        gameOverCalledRef.current = false;
      }
    }, [gameState, score, onGameOver]);

    const handleDirection = useCallback((newDir: Direction) => {
      // Use ref to avoid stale closure issues
      if (gameStateRef.current !== 'PLAYING') return;
      
      // Only allow one direction change per tick to prevent diagonal movement
      if (directionChangedThisTick.current) return;
      
      const currentDir = directionRef.current;
      // Prevent 180-degree turns
      if (
        (currentDir === 'UP' && newDir === 'DOWN') ||
        (currentDir === 'DOWN' && newDir === 'UP') ||
        (currentDir === 'LEFT' && newDir === 'RIGHT') ||
        (currentDir === 'RIGHT' && newDir === 'LEFT')
      ) {
        return;
      }
      
      directionRef.current = newDir;
      directionChangedThisTick.current = true;
      setDirection(newDir);
      
      if (vibrateEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }, [vibrateEnabled]);

    useImperativeHandle(ref, () => ({
      handleDirection,
      handleSelect: startGame,
    }));

    const renderGrid = () => {
      const rows: React.ReactElement[] = [];
      
      for (let y = 0; y < GRID_SIZE; y++) {
        const rowCells: React.ReactElement[] = [];
        for (let x = 0; x < GRID_SIZE; x++) {
          const isSnakeHead = snake[0].x === x && snake[0].y === y;
          const isSnakeBody = snake.slice(1).some(seg => seg.x === x && seg.y === y);
          const isFood = food.x === x && food.y === y;
          
          let cellStyle = styles.cell;
          if (isSnakeHead) {
            cellStyle = { ...styles.cell, ...styles.snakeHead };
          } else if (isSnakeBody) {
            cellStyle = { ...styles.cell, ...styles.snakeBody };
          } else if (isFood) {
            cellStyle = { ...styles.cell, ...styles.food };
          }
          
          rowCells.push(
            <View key={`${x}-${y}`} style={cellStyle} />
          );
        }
        rows.push(
          <View key={`row-${y}`} style={styles.gridRow}>
            {rowCells}
          </View>
        );
      }
      
      return rows;
    };


    const getStatusText = () => {
      switch (gameState) {
        case 'READY':
          return 'PRESS SELECT TO START';
        case 'PAUSED':
          return 'PAUSED';
        case 'GAME_OVER':
          return `GAME OVER - ${score} PTS`;
        default:
          return '';
      }
    };

    const getInstructions = () => {
      if (gameState === 'READY') {
        return 'USE 2/4/6/8 TO MOVE';
      }
      return undefined;
    };

    return (
      <PagerDisplayGame>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>SNAKE</Text>
          <Text style={styles.score}>
            SCORE: {score.toString().padStart(4, '0')}
          </Text>
        </View>
        
        <View style={styles.gameArea}>
          <View style={styles.grid}>
            {renderGrid()}
          </View>
        </View>
        
        {/* Overlay for non-playing states */}
        {gameState !== 'PLAYING' && (
          <View style={styles.overlay}>
            <Text style={styles.statusText}>{getStatusText()}</Text>
            {getInstructions() && (
              <Text style={styles.instructions}>{getInstructions()}</Text>
            )}
          </View>
        )}
        
        {/* Controls hint */}
        <View style={styles.controls}>
          <Text style={styles.controlText}>2=UP 4=LEFT 6=RIGHT 8=DOWN</Text>
        </View>
      </PagerDisplayGame>
    );
  }
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: GAME_COLORS.sectionBorder,
    marginBottom: 8,
  },
  title: {
    ...GAME_TYPOGRAPHY.title,
  },
  score: {
    ...GAME_TYPOGRAPHY.score,
  },
  gameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  grid: {
    borderWidth: 2,
    borderColor: GAME_COLORS.gridBorder,
    backgroundColor: GAME_COLORS.gridBackground,
  },
  gridRow: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 1,
    borderColor: GAME_COLORS.cellBorder,
  },
  snakeHead: {
    backgroundColor: GAME_COLORS.activeCell,
  },
  snakeBody: {
    backgroundColor: GAME_COLORS.lockedCell,
  },
  food: {
    backgroundColor: '#8B0000',
  },
  overlay: {
    position: 'absolute',
    top: -110,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: GAME_COLORS.overlayBackground,
  },
  statusText: {
    ...GAME_TYPOGRAPHY.status,
  },
  instructions: {
    ...GAME_TYPOGRAPHY.instructions,
    marginTop: 8,
  },
  controls: {
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: GAME_COLORS.sectionBorder,
    alignItems: 'center',
  },
  controlText: {
    ...GAME_TYPOGRAPHY.controlHint,
  },
});
