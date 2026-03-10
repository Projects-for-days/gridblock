const SIZE = 5;

// Count completed lines on a 5x5 board (rows, columns, two diagonals).
// markedNumbers: array of numbers that are marked on this board.
function countCompletedLines(markedNumbers, board) {
  const markedSet = new Set(markedNumbers);
  const grid = [];
  for (let r = 0; r < SIZE; r++) {
    grid[r] = board.slice(r * SIZE, (r + 1) * SIZE);
  }
  let lines = 0;
  for (let r = 0; r < SIZE; r++) {
    if (grid[r].every(n => markedSet.has(n))) lines++;
  }
  for (let c = 0; c < SIZE; c++) {
    if (grid.every(row => markedSet.has(row[c]))) lines++;
  }
  if (grid.every((row, i) => markedSet.has(row[i]))) lines++;
  if (grid.every((row, i) => markedSet.has(row[SIZE - 1 - i]))) lines++;
  return lines;
}

// Return the set of numbers that belong to at least one completed line (for highlighting).
function getCompletedLineNumbers(markedNumbers, board) {
  const markedSet = new Set(markedNumbers);
  const result = new Set();
  const grid = [];
  for (let r = 0; r < SIZE; r++) {
    grid[r] = board.slice(r * SIZE, (r + 1) * SIZE);
  }
  // Rows
  for (let r = 0; r < SIZE; r++) {
    if (grid[r].every(n => markedSet.has(n))) {
      grid[r].forEach(n => result.add(n));
    }
  }
  // Columns
  for (let c = 0; c < SIZE; c++) {
    if (grid.every(row => markedSet.has(row[c]))) {
      grid.forEach(row => result.add(row[c]));
    }
  }
  // Diagonals
  if (grid.every((row, i) => markedSet.has(row[i]))) {
    grid.forEach((row, i) => result.add(row[i]));
  }
  if (grid.every((row, i) => markedSet.has(row[SIZE - 1 - i]))) {
    grid.forEach((row, i) => result.add(row[SIZE - 1 - i]));
  }
  return result;
}

export { countCompletedLines, getCompletedLineNumbers };
