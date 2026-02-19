import React, { useState } from 'react';
import Lobby from './Components/Lobby';
import Board from './Components/Board';
import Timer from './Components/Timer';
import './App.css';

function App() {
  const [room, setRoom] = useState(null);
  const [playerName, setPlayerName] = useState('');

  function handleRoomReady(roomData, name) {
    setRoom(roomData);
    setPlayerName(name);
  }

  // If no room yet, show the lobby
  if (!room) {
    return <Lobby onRoomReady={handleRoomReady} />;
  }

  // Once in a room, show the game
  return (
    <div className="app">
      <h1>GridBlock</h1>
      <p>Room: <strong>{room.roomCode}</strong></p>
      <p>Players: {room.players.map(p => p.name).join(', ')}</p>
      <Board />
      <Timer />
    </div>
  );
}

export default App;
