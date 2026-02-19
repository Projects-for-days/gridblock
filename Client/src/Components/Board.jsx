import React, { useState } from 'react';
import './Board.css';

function generateShuffledBoard() {
  let numbers = [];
  for (let i = 1; i <= 25; i++) {
    numbers.push(i);
  }
  for (let i = numbers.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  return numbers;
}

function Board() {
  const [numbers] = useState(generateShuffledBoard);
  const [marked, setMarked] = useState([]);

  function handleCellClick(num) {
    if (marked.includes(num)) return;
    setMarked([...marked, num]);
  }

  return (
    <div id="board">
      {numbers.map((num) => {
        const isMarked = marked.includes(num);
        return (
          <div
            key={num}
            className={`cell ${isMarked ? 'clicked' : ''}`}
            onClick={() => handleCellClick(num)}
          >
            {isMarked ? 'X' : num}
          </div>
        );
      })}
    </div>
  );
}

export default Board;