import React from 'react';
import './Board.css';

function Board({ board, marked, boardSize, onCellClick, disabled }) {
  return (
    <div 
      className="board-container"
      style={{
        gridTemplateColumns: `repeat(${boardSize}, 1fr)`
      }}
    >
      {board.map((number, index) => (
        <div
          key={index}
          className={`board-cell ${marked[index] ? 'marked' : ''} ${disabled ? 'disabled' : ''}`}
          onClick={() => !disabled && !marked[index] && onCellClick(index)}
        >
          {marked[index] ? 'X' : number}
        </div>
      ))}
    </div>
  );
}

export default Board;
