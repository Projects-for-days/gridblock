
export function getWinningIndices(
  clickedMap,
  rows,
  cols,
  index,
  required = 5,
) {
  // `required` defaults to 5 for a 5x5 grid; callers can override for other sizes
  const dirs = [
    [0, 1], // horizontal movement
    [1, 0], // vertical movement
    [1, 1], // diagonal down-right movement
    [1, -1], // diagonal down-left movement
  ];
  // dirs defines the 4 directions to check: right, down, diagonal down-right, diagonal down-left

  const r0 = Math.floor(index / cols);
  const c0 = index % cols;
  const winners = new Set();

  // r0/c0 convert linear index -> (row, col)
  // winners stores unique winning linear indices

  for (const [dr, dc] of dirs) {
    // dr and dc are the row and column deltas for the current direction
    const seq = [[r0, c0]];
    // seq will store the coordinates of the clicked boxes in the current direction, starting with the newly clicked box at (r0, c0)

    // forward direction
    let rr = r0 + dr;
    let cc = c0 + dc;
    // we keep moving in the current direction (dr, dc) until we go out of bounds or find an unclicked box
    while (rr >= 0 && rr < rows && cc >= 0 && cc < cols) {
      // i converts the (rr, cc) coordinates back to the index in the clickedMap
      const i = rr * cols + cc;
      if (!clickedMap[i]) break;
      seq.push([rr, cc]);
      rr += dr;
      cc += dc;
    }

    // backward direction
    rr = r0 - dr;
    cc = c0 - dc;
    while (rr >= 0 && rr < rows && cc >= 0 && cc < cols) {
      const i = rr * cols + cc;
      if (!clickedMap[i]) break;
      seq.unshift([rr, cc]);
      rr -= dr;
      cc -= dc;
    }

    // indicates the line is a winning line
    if (seq.length >= required) {
      for (const [sr, sc] of seq) winners.add(sr * cols + sc);
    }
  }
  //changes the set of winning indices to an array of numbers and returns it and makes sure to convert them to numbers (since set stores them as strings)
  return Array.from(winners).map(Number);
}
