import React from 'react';
import Board from './Components/Board';
import Timer from './Components/Timer';
import './App.css';

function App() {
  return (
    <div className="app">
      <h1>GridBlock</h1>
      <Board />
      <Timer />
    </div>
  );
}

export default App;