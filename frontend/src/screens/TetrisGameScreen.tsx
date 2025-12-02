import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { View, StyleSheet, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  TetrisState,
  GameState,
  PLAYFIELD_ROWS,
  PLAYFIELD_COLS,
  createInitialState,
  spawnNextPiece,
  moveLeft,
  moveRight,
  moveDown,
  rotate,
  hardDrop,
  tick,
  getTetrominoBlocks,
  getGhostPosition,
  calculateFallSpeed,
  TETROMINO_SHAPES,
} from '../utils/tetrisLogic';
import { addTetrisScore } from '../services/gameService';

// Game constants - cell size for the Tetris grid
// Grid is 10 columns x 20 rows
// Using 14px cells: 14 * 20 = 280px height, 14 * 10 = 140px width
// This fills the LCD screen area nicely
const CELL_SIZE = 14;

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface TetrisGameScreenHandle {
  handleDirection: (dir: Direction) => void;
  handleSelect: () => void;
  handleBack: () => void;
}

interface TetrisGameScreenProps {
  onGameOver: (score: number) => void;
  onExit: () => void;
  soundEnabled: boolean;
  vibrateEnabled: boolean;
}

export const TetrisGameScreen = forwardRef<TetrisGameScreenHandle, TetrisGameScreenProps>(
  ({ onGameOver, onExit, vibrateEnabled }, ref) => {
    // Game state
    const [gameState, setGameState] = useState<TetrisState>(createInitialState());
    
    // Refs for game loop and state tracking
    const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
    const gameStateRef = useRef<GameState>('READY');
    const tetrisStateRef = useRef<TetrisState>(gameState);
    const mountedTimeRef = useRef<number>(Date.now());
    const gameOverCalledRef = useRef(false);

    // Keep refs in sync with state
    useEffect(() => {
      gameStateRef.current = gameState.gameState;
      tetrisStateRef.current = gameState;
    }, [gameState]);

    // ============================================
    // Game Loop (Requirement 4.1, 4.2, 4.3)
    // ============================================
    
    const gameTick = useCallback(() => {
      setGameState(prevState => {
        if (prevState.gameState !== 'PLAYING') return prevState;
        
        const newState = tick(prevState);
        
        // Check if lines were cleared for haptic feedback
        if (newState.linesCleared > prevState.linesCleared && vibrateEnabled) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        
        return newState;
      });
    }, [vibrateEnabled]);

    // Game loop effect
    useEffect(() => {
      if (gameState.gameState === 'PLAYING') {
        const speed = calculateFallSpeed(gameState.level);
        gameLoopRef.current = setInterval(gameTick, speed);
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
    }, [gameState.gameState, gameState.level, gameTick]);

    // ============================================
    // Game Over Handling (Requirements 3.2, 3.3, 3.4)
    // ============================================
    
    useEffect(() => {
      if (gameState.gameState === 'GAME_OVER' && !gameOverCalledRef.current) {
        gameOverCalledRef.current = true;
        
        // Haptic feedback for game over
        if (vibrateEnabled) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        
        // Save score to leaderboard
        addTetrisScore(gameState.score);
        
        // Notify parent
        onGameOver(gameState.score);
      } else if (gameState.gameState !== 'GAME_OVER') {
        gameOverCalledRef.current = false;
      }
    }, [gameState.gameState, gameState.score, onGameOver, vibrateEnabled]);

    // ============================================
    // Game Control Functions
    // ============================================
    
    const startGame = useCallback(() => {
      // Prevent accidental start within 300ms of mounting
      if (Date.now() - mountedTimeRef.current < 300) {
        return;
      }
      
      if (gameState.gameState === 'READY' || gameState.gameState === 'GAME_OVER') {
        // Reset and start new game
        const initialState = createInitialState();
        const stateWithPiece = spawnNextPiece({
          ...initialState,
          gameState: 'PLAYING',
        });
        setGameState(stateWithPiece);
      } else if (gameState.gameState === 'PAUSED') {
        // Resume game
        setGameState(prev => ({ ...prev, gameState: 'PLAYING' }));
      }
    }, [gameState.gameState]);

    const pauseGame = useCallback(() => {
      if (gameState.gameState === 'PLAYING') {
        setGameState(prev => ({ ...prev, gameState: 'PAUSED' }));
      } else if (gameState.gameState === 'PAUSED') {
        // Exit to menu when pressing back while paused
        onExit();
      }
    }, [gameState.gameState, onExit]);

    // ============================================
    // Direction Handling (Requirements 1.3, 1.4, 1.5, 1.6)
    // ============================================
    
    const handleDirection = useCallback((dir: Direction) => {
      if (gameStateRef.current !== 'PLAYING') return;
      
      setGameState(prevState => {
        let newState = prevState;
        
        switch (dir) {
          case 'LEFT':
            newState = moveLeft(prevState);
            break;
          case 'RIGHT':
            newState = moveRight(prevState);
            break;
          case 'DOWN':
            newState = moveDown(prevState);
            break;
          case 'UP':
            newState = rotate(prevState);
            break;
        }
        
        // Haptic feedback if piece moved/rotated
        if (newState !== prevState && vibrateEnabled) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        
        return newState;
      });
    }, [vibrateEnabled]);

    // ============================================
    // Hard Drop (Requirement 1.7)
    // ============================================
    
    const handleHardDrop = useCallback(() => {
      if (gameStateRef.current !== 'PLAYING') return;
      
      setGameState(prevState => {
        const droppedState = hardDrop(prevState);
        
        // Haptic feedback for hard drop
        if (vibrateEnabled) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }
        
        // Spawn next piece after hard drop
        if (!droppedState.currentPiece) {
          return spawnNextPiece(droppedState);
        }
        
        return droppedState;
      });
    }, [vibrateEnabled]);

    // ============================================
    // Select Button Handler
    // ============================================
    
    const handleSelect = useCallback(() => {
      if (gameState.gameState === 'PLAYING') {
        // Hard drop during gameplay
        handleHardDrop();
      } else {
        // Start/resume game
        startGame();
      }
    }, [gameState.gameState, handleHardDrop, startGame]);

    // ============================================
    // Imperative Handle
    // ============================================
    
    useImperativeHandle(ref, () => ({
      handleDirection,
      handleSelect,
      handleBack: pauseGame,
    }));


    // ============================================
    // Rendering
    // ============================================
    
    // Get current piece blocks for rendering
    const currentPieceBlocks = gameState.currentPiece
      ? getTetrominoBlocks(
          gameState.currentPiece.type,
          gameState.currentPiece.rotation,
          gameState.currentPiece.position
        )
      : [];
    
    // Get ghost piece position
    const ghostY = getGhostPosition(gameState);
    const ghostBlocks = gameState.currentPiece && ghostY !== null
      ? getTetrominoBlocks(
          gameState.currentPiece.type,
          gameState.currentPiece.rotation,
          { x: gameState.currentPiece.position.x, y: ghostY }
        )
      : [];

    // Get status text for overlay
    const getStatusText = () => {
      switch (gameState.gameState) {
        case 'READY':
          return 'PRESS SELECT TO START';
        case 'PAUSED':
          return 'PAUSED';
        case 'GAME_OVER':
          return `GAME OVER - ${gameState.score} PTS`;
        default:
          return '';
      }
    };

    // Get instructions for overlay
    const getInstructions = () => {
      switch (gameState.gameState) {
        case 'READY':
          return '2=ROTATE 4/6=MOVE 8=DROP';
        case 'PAUSED':
          return 'SELECT=RESUME BACK=EXIT';
        case 'GAME_OVER':
          return 'SELECT TO RESTART';
        default:
          return '';
      }
    };

    // Render the game grid
    const renderGrid = () => {
      const rows: React.ReactElement[] = [];
      
      for (let y = 0; y < PLAYFIELD_ROWS; y++) {
        const rowCells: React.ReactElement[] = [];
        for (let x = 0; x < PLAYFIELD_COLS; x++) {
          // Check if cell is part of current piece
          const isCurrentPiece = currentPieceBlocks.some(
            block => block.x === x && block.y === y
          );
          
          // Check if cell is part of ghost piece
          const isGhostPiece = !isCurrentPiece && ghostBlocks.some(
            block => block.x === x && block.y === y
          );
          
          // Check if cell is locked
          const lockedType = gameState.playfield[y]?.[x];
          
          let cellStyle = styles.cell;
          if (isCurrentPiece) {
            cellStyle = { ...styles.cell, ...styles.activeCell };
          } else if (isGhostPiece) {
            cellStyle = { ...styles.cell, ...styles.ghostCell };
          } else if (lockedType) {
            cellStyle = { ...styles.cell, ...styles.lockedCell };
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

    // Render next piece preview
    const renderNextPiecePreview = () => {
      const nextType = gameState.nextPiece;
      const shape = TETROMINO_SHAPES[nextType][0]; // Use rotation 0
      
      // Calculate bounding box for centering
      const minX = Math.min(...shape.map(p => p.x));
      const maxX = Math.max(...shape.map(p => p.x));
      const minY = Math.min(...shape.map(p => p.y));
      const maxY = Math.max(...shape.map(p => p.y));
      
      const width = maxX - minX + 1;
      const height = maxY - minY + 1;
      
      const previewCells: React.ReactElement[] = [];
      const previewSize = 4;
      const previewCellSize = 12;
      
      for (let py = 0; py < previewSize; py++) {
        const rowCells: React.ReactElement[] = [];
        for (let px = 0; px < previewSize; px++) {
          // Center the piece in the preview
          const offsetX = Math.floor((previewSize - width) / 2) - minX;
          const offsetY = Math.floor((previewSize - height) / 2) - minY;
          
          const isBlock = shape.some(
            p => p.x + offsetX === px && p.y + offsetY === py
          );
          
          rowCells.push(
            <View
              key={`preview-${px}-${py}`}
              style={[
                styles.previewCell,
                { width: previewCellSize, height: previewCellSize },
                isBlock && styles.previewActiveCell,
              ]}
            />
          );
        }
        previewCells.push(
          <View key={`preview-row-${py}`} style={styles.previewRow}>
            {rowCells}
          </View>
        );
      }
      
      return (
        <View style={styles.nextPieceContainer}>
          <Text style={styles.nextLabel}>NEXT</Text>
          <View style={styles.nextPiecePreview}>
            {previewCells}
          </View>
        </View>
      );
    };

    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>TETRIS</Text>
          <Text style={styles.score}>
            {gameState.score.toString().padStart(5, '0')}
          </Text>
        </View>
        
        {/* Game Area */}
        <View style={styles.gameArea}>
          {/* Main Grid */}
          <View style={styles.grid}>
            {renderGrid()}
          </View>
          
          {/* Side Panel */}
          <View style={styles.sidePanel}>
            {renderNextPiecePreview()}
            <View style={styles.statsContainer}>
              <Text style={styles.statLabel}>LVL</Text>
              <Text style={styles.statValue}>{gameState.level}</Text>
              <Text style={styles.statLabel}>LNS</Text>
              <Text style={styles.statValue}>{gameState.linesCleared}</Text>
            </View>
          </View>
        </View>
        
        {/* Overlay for non-playing states */}
        {gameState.gameState !== 'PLAYING' && (
          <View style={styles.overlay}>
            <Text style={styles.statusText}>{getStatusText()}</Text>
            <Text style={styles.instructions}>{getInstructions()}</Text>
          </View>
        )}
        
        {/* Controls hint */}
        <View style={styles.controls}>
          <Text style={styles.controlText}>2=↻ 4=← 6=→ 8=↓ 5=DROP</Text>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#3d3d3d',
    marginBottom: 4,
  },
  title: {
    fontFamily: 'Chicago',
    fontSize: 12,
    fontWeight: '700',
    color: '#1a2618',
    letterSpacing: 1,
  },
  score: {
    fontFamily: 'Chicago',
    fontSize: 12,
    fontWeight: '700',
    color: '#1a2618',
    letterSpacing: 1,
  },
  gameArea: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 6,
  },
  grid: {
    borderWidth: 1,
    borderColor: '#3d3d3d',
    backgroundColor: '#a8b8a0',
  },
  gridRow: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  activeCell: {
    backgroundColor: '#1a2618',
  },
  ghostCell: {
    backgroundColor: 'rgba(26, 38, 24, 0.25)',
  },
  lockedCell: {
    backgroundColor: '#3d4d38',
  },
  sidePanel: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 8,
  },
  nextPieceContainer: {
    alignItems: 'center',
  },
  nextLabel: {
    fontFamily: 'Chicago',
    fontSize: 10,
    fontWeight: '700',
    color: '#3d4d38',
    letterSpacing: 1,
    marginBottom: 2,
  },
  nextPiecePreview: {
    borderWidth: 1,
    borderColor: '#3d3d3d',
    backgroundColor: '#a8b8a0',
    padding: 1,
  },
  previewRow: {
    flexDirection: 'row',
  },
  previewCell: {
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  previewActiveCell: {
    backgroundColor: '#1a2618',
  },
  statsContainer: {
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: 'Chicago',
    fontSize: 9,
    fontWeight: '700',
    color: '#3d4d38',
    letterSpacing: 1,
    marginTop: 6,
  },
  statValue: {
    fontFamily: 'Chicago',
    fontSize: 12,
    fontWeight: '700',
    color: '#1a2618',
    letterSpacing: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(168, 184, 160, 0.92)',
  },
  statusText: {
    fontFamily: 'Chicago',
    fontSize: 12,
    fontWeight: '700',
    color: '#1a2618',
    letterSpacing: 1,
    textAlign: 'center',
  },
  instructions: {
    fontFamily: 'Chicago',
    fontSize: 8,
    fontWeight: '700',
    color: '#3d4d38',
    letterSpacing: 1,
    marginTop: 6,
  },
  controls: {
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#3d3d3d',
    alignItems: 'center',
  },
  controlText: {
    fontFamily: 'Chicago',
    fontSize: 7,
    fontWeight: '700',
    color: '#3d4d38',
    letterSpacing: 0.5,
  },
});
