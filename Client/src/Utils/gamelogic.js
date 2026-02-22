export function generateBoard(size) {
  const max = size * size;
  const nums = Array.from({ length: max }, (_, i) => i + 1);

  for (let i = nums.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }

  return nums;
}

export function countCompletedLines(marked, size) {
  let lines = 0;

  // rows
  for (let r = 0; r < size; r++) {
    let full = true;
    for (let c = 0; c < size; c++) {
      if (!marked[r * size + c]) { full = false; break; }
    }
    if (full) lines++;
  }

  // cols
  for (let c = 0; c < size; c++) {
    let full = true;
    for (let r = 0; r < size; r++) {
      if (!marked[r * size + c]) { full = false; break; }
    }
    if (full) lines++;
  }

  // main diagonal
  {
    let full = true;
    for (let i = 0; i < size; i++) {
      if (!marked[i * size + i]) { full = false; break; }
    }
    if (full) lines++;
  }

  // anti diagonal
  {
    let full = true;
    for (let i = 0; i < size; i++) {
      if (!marked[i * size + (size - 1 - i)]) { full = false; break; }
    }
    if (full) lines++;
  }

  return lines;
}