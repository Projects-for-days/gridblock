import { useState, useRef } from "react";

export default function Timer() {
  const [time, setTime] = useState(0);
  const intervalRef = useRef(null);

  function startTimer(seconds) {
    clearInterval(intervalRef.current);

    setTime(seconds);

    intervalRef.current = setInterval(() => {
      setTime((prev) => {
        if (prev == 0) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  return (
    <div>
      <h1>{time}</h1>
      <button onClick={() => startTimer(15)}>Start Game</button>
    </div>
  );
}
