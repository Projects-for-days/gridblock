import React from 'react';
import './Board.css';

function Board({ board, markedNumbers, calledNumbers, markedNumberColors = {}, completedLineNumbers = new Set(), isMyTurn, onNumberClick }) {
  const completedSet = completedLineNumbers instanceof Set ? completedLineNumbers : new Set(completedLineNumbers);

  return (
    <div id="board">
      {board.map((num, index) => {
        const isMarked = markedNumbers.includes(num);
        const isCalled = calledNumbers.includes(num);
        const isInCompletedLine = completedSet.has(num);
        const cellColor = isMarked ? (markedNumberColors[num] || '#333') : null;

        return (
          <div
            key={index}
            className={`cell 
              ${isMarked ? 'clicked' : ''} 
              ${isInCompletedLine ? 'completed-line' : ''}
              ${isCalled && !isMarked ? 'already-called' : ''}
              ${!isMyTurn ? 'not-your-turn' : ''}
            `}
            style={
              isInCompletedLine
                ? {
                    backgroundColor: '#1a1a2e',
                    color: '#fff',
                    borderColor: '#1a1a2e',
                    borderWidth: '2px',
                  }
                : cellColor
                ? {
                    color: cellColor,
                    backgroundColor: `${cellColor}18`,
                    borderColor: `${cellColor}99`,
                  }
                : undefined
            }
            onClick={() => onNumberClick(num)}
          >
            {isMarked ? 'X' : num}
          </div>
        );
      })}
    </div>
  );
}

export default Board;