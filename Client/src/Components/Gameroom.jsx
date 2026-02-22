import React, { useMemo, useState } from "react";
import Board from "./Board";
import Timer from "./Timer";
import { generateBoard, countCompletedLines } from "../Utils/gamelogic";

export default function Gameroom({ room, playerName }) {
  const size = 5;

  const [board, setBoard] = useState(() => generateBoard(size));
  const [marked, setMarked] = useState(() => Array(size * size).fill(false));
  const [calledNumbers, setCalledNumbers] = useState([]);
  const [lines, setLines] = useState(0);
  const [winner, setWinner] = useState(false);

  const calledSet = useMemo(() => new Set(calledNumbers), [calledNumbers]);

  function resetGame() {
    setBoard(generateBoard(size));
    setMarked(Array(size * size).fill(false));
    setCalledNumbers([]);
    setLines(0);
    setWinner(false);
  }

  function callNumber(num) {
    if (winner) return;
    if (calledSet.has(num)) return;

    // Add to called list
    setCalledNumbers((prev) => [...prev, num]);

    // Mark on this board
    const idx = board.indexOf(num);
    if (idx === -1) return;

    const newMarked = [...marked];
    newMarked[idx] = true;
    setMarked(newMarked);

    const newLines = countCompletedLines(newMarked, size);
    setLines(newLines);
    if (newLines >= 5) setWinner(true);
  }

  function handleCellClick(index) {
    const num = board[index];
    callNumber(num);
  }

  return (
    <div className="gameroom">
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Game Room</h2>
        <button onClick={resetGame}>New Game</button>
      </div>

      {room?.roomCode && (
        <p>
          Room: <strong>{room.roomCode}</strong>
        </p>
      )}

      <div style={{ marginTop: 12 }}>
        <Timer />
      </div>

      <div style={{ marginTop: 12 }}>
        <div>
          <b>Lines:</b> {lines} / 5
        </div>
        {winner && (
          <div style={{ marginTop: 8, fontWeight: "bold" }}>🎉 YOU WIN!</div>
        )}
      </div>

      <Board
        size={size}
        board={board}
        marked={marked}
        onCellClick={handleCellClick}
      />

      <div style={{ marginTop: 16 }}>
        <h3>Called Numbers:</h3>
        <div style={{ lineHeight: 1.8 }}>
          {calledNumbers.length === 0 ? "None yet" : calledNumbers.join(", ")}
        </div>
      </div>
    </div>
  );
}