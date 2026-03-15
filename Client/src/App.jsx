import React, { useState } from 'react';
import { SocketProvider } from './Context/SocketContext';
import Lobby from './Components/Lobby';
import GameRoom from './Components/GameRoom';
import './App.css';

function App() {
  const [currentRoom, setCurrentRoom] = useState(null);
  const [playerName, setPlayerName] = useState('');

  const handleRoomReady = (room, name) => {
    setCurrentRoom(room);
    setPlayerName(name);
  };

  const handleLeaveRoom = () => {
    setCurrentRoom(null);
    setPlayerName('');
  };

  return (
    <SocketProvider>
      <div className="App">
        {!currentRoom ? (
          <Lobby onRoomReady={handleRoomReady} />
        ) : (
          <GameRoom 
            room={currentRoom} 
            playerName={playerName}
            onLeave={handleLeaveRoom}
          />
        )}
      </div>
    </SocketProvider>
  );
}

export default App;
