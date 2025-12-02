import React from 'react';
import { View, StyleSheet } from 'react-native';

interface GameGridProps {
  rows: number;
  cols: number;
  cellSize: number;
  renderCell: (x: number, y: number) => React.ReactElement;
}

export const GameGrid: React.FC<GameGridProps> = ({
  rows,
  cols,
  cellSize,
  renderCell,
}) => {
  const gridRows: React.ReactElement[] = [];

  for (let y = 0; y < rows; y++) {
    const rowCells: React.ReactElement[] = [];
    for (let x = 0; x < cols; x++) {
      rowCells.push(
        <View
          key={`${x}-${y}`}
          style={[styles.cell, { width: cellSize, height: cellSize }]}
        >
          {renderCell(x, y)}
        </View>
      );
    }
    gridRows.push(
      <View key={`row-${y}`} style={styles.gridRow}>
        {rowCells}
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {gridRows}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    borderWidth: 2,
    borderColor: '#3d3d3d',
    backgroundColor: '#a8b8a0',
  },
  gridRow: {
    flexDirection: 'row',
  },
  cell: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
});
