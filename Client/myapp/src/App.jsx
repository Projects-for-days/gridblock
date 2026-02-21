import Board from "./Components/Board.jsx";
import Timer from "./Components/Timer.jsx";
import "./App.css";

export default function App() {
  return (
    <div className="App">
      <h1>Grid Block</h1>
      <Timer />
      <Board />
    </div>
  );
}
