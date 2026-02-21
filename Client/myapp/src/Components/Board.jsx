import { useState, useEffect } from "react";
import { shuffleNumbers } from "../Utils/board.js";
import { getWinningIndices } from "../Utils/algorithm.js";

export default function Board() {
  //state to store shuffled numbers (25 numbers -> 5x5 grid)
  const [numbers, setNumbers] = useState([]);
  //state to track clicked positions by index (0..24)
  const [clicked, setClicked] = useState({});
  //state to track highlighted positions (winning sequence)
  const [highlights, setHighlights] = useState({});

  // Shuffle numbers ONCE when component mounts
  useEffect(() => {
    setNumbers(shuffleNumbers());
  }, []);

  const grid = 5; // grid size (5x5)

  // Handle clicks: mark clicked, then check for winning sequence and set highlights.
  const handleClick = (num, index) => {
    if (Object.keys(highlights).length > 0) return; // stop clicks after a win
    if (clicked[index]) return; // already clicked, prevents re-clicking

    //store new clicked state with the current index marked as true
    const newClicked = { ...clicked, [index]: true };
    setClicked(newClicked);

    // board is 5x5 (25 numbers) based on shuffleNumbers implementation
    const rows = grid;
    const cols = grid;
    // pass the freshly created `newClicked` so the checker sees this click immediately
    const winning = getWinningIndices(newClicked, rows, cols, index, grid);

    if (winning.length) {
      const map = {};
      for (const i of winning) map[i] = true;
      setHighlights(map);
      // we no longer use alert; UI will show a banner above the board
    }
  };

  // derived flag: whether a win exists (used to show banner)
  const hasWinner = Object.keys(highlights).length > 0;

  return (
    <>
      {hasWinner && <div id="banner">You win!</div>}

      <div id="board">
        {numbers.map((num, index) => (
          <div
            key={index}
            onClick={() => handleClick(num, index)}
            style={{
              cursor: clicked[index] ? "default" : "pointer",
              userSelect: "none",
              background: highlights[index]
                ? "lightgreen"
                : clicked[index]
                  ? "lightpink"
                  : "white",
              boxShadow: highlights[index]
                ? "0 0 12px rgba(255,200,0,0.8)"
                : "none",
              color: clicked[index] ? "#c00" : "#000",
            }}
          >
            {clicked[index] ? "X" : num}
          </div>
        ))}
      </div>
    </>
  );
}
