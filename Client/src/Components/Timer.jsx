import React, { useState, useEffect } from 'react';
import './Timer.css';

function Timer() {
  const [timeLeft, setTimeLeft] = useState(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    if (timeLeft <= 0) {
      setRunning(false);
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [running, timeLeft]);

  function startTurn() {
    setTimeLeft(30);
    setRunning(true);
  }

  function getButtonLabel() {
    if (timeLeft === null) return 'Start Turn';
    if (timeLeft <= 0) return 'Turn Over!';
    return `Time: ${timeLeft}s`;
  }

  return (
    <div id="timer">
      <button id="timer-button" onClick={startTurn}>
        {getButtonLabel()}
      </button>
    </div>
  );
}

export default Timer;