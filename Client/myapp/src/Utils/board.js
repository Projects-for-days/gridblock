//Board generator function
export function shuffleNumbers() {
  // Create numbers 1..25 for a 5x5 board
  const numbers = [];
  for (let i = 1; i <= 25; i++) numbers.push(i);

  // Fisher–Yates shuffle (uniform and efficient)
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = numbers[i];
    numbers[i] = numbers[j];
    numbers[j] = tmp;
  }

  return numbers;
}
