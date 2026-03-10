import React, { useState, useEffect } from 'react';
import './Timer.css';

function Timer({ isMyTurn, currentTurn, onTimeout }) {
  const [timeLeft, setTimeLeft] = useState(30);

  // Reset timer every time the turn changes
  useEffect(() => {
    setTimeLeft(30);
  }, [currentTurn]);

  // Count down only when it's your turn
  useEffect(() => {
    if (!isMyTurn) return;
    if (timeLeft <= 0) {
      onTimeout();
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isMyTurn, timeLeft, onTimeout]);

  return (
    <div id="timer">
      <button
        id="timer-button"
        style={{ backgroundColor: timeLeft <= 10 ? '#ffdddd' : '#f0f0f0' }}
      >
        {isMyTurn
          ? `Your turn: ${timeLeft}s`
          : `Next turn: ${timeLeft}s`}
      </button>
    </div>
  );
}

export default Timer;