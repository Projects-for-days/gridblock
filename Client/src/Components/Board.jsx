import React from 'react';
import './Board.css';

function Board({ board, marked, boardSize, onCellClick, disabled, room, currentPlayerId }) {
  // Get who called each number
  const numberCallers = room?.gameState?.numberCallers || {};
  const players = room?.players || [];
  
  // Find the color for a given number
  const getNumberColor = (number) => {
    const callerId = numberCallers[number];
    if (!callerId) return null;
    
    const caller = players.find(p => p.id === callerId);
    return caller?.color || '#ff4444';
  };
  
  return (
    <div 
      className='board-container'
      style={{
        gridTemplateColumns: 'repeat(' + boardSize + ', 1fr)'
      }}
    >
      {board.map((number, index) => {
        const isMarked = marked[index];
        const callerColor = isMarked ? getNumberColor(number) : null;
        
        return (
          <div
            key={index}
            className={'board-cell ' + (isMarked ? 'marked ' : '') + (disabled ? 'disabled' : '')}
            onClick={() => !disabled && !isMarked && onCellClick(index)}
            style={isMarked && callerColor ? {
              background: 'linear-gradient(135deg, ' + callerColor + ' 0%, ' + callerColor + 'cc 100%)',
              borderColor: callerColor,
              boxShadow: '0 0 10px ' + callerColor + '66'
            } : {}}
          >
            {isMarked ? 'X' : number}
          </div>
        );
      })}
    </div>
  );
}

export default Board;
