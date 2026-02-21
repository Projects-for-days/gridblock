Gridlock — ajii feature                  

Purpose
A short, beginner-friendly guide showing important files and how to run the app.

Where the important code lives

- `src/Components/Board.jsx` — UI + component state: `numbers`, `clicked`, `highlights`.
- `src/Utils/board.js` — `shuffleNumbers()` creates a randomized 1..25 array.
- `src/Utils/algorithm.js` — `getWinningIndices()` finds contiguous clicked lines including the last click.
- `src/Components/Timer.jsx` — countdown timer

How to run (Client/myapp)

```bash
npm install
npm run dev
```

(If using Vite, `npm run dev` usually starts the dev server.)
