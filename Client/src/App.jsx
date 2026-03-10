import React, { useState, useEffect } from 'react';
import Lobby from './Components/Lobby';
import GameRoom from './Components/Gameroom';
import { useSocket } from './Context/SocketContext';
import './App.css';

function App() {
  const { socket } = useSocket();
  const [room, setRoom] = useState(null);
  const [playerName, setPlayerName] = useState('');

  function handleRoomReady(roomData, name) {
    setRoom(roomData);
    setPlayerName(name);
  }

  // When someone joins our room, update room state so host sees updated player list and can start
  useEffect(() => {
    if (!socket || !room) return;
    const onPlayerJoined = (updatedRoom) => setRoom(updatedRoom);
    const onPlayerLeft = ({ room: updatedRoom }) => setRoom(updatedRoom);
    const onRoomReset = ({ room: updatedRoom }) => setRoom(updatedRoom);

    socket.on('player_joined', onPlayerJoined);
    socket.on('player_left', onPlayerLeft);
    socket.on('room_reset', onRoomReset);

    return () => {
      socket.off('player_joined', onPlayerJoined);
      socket.off('player_left', onPlayerLeft);
      socket.off('room_reset', onRoomReset);
    };
  }, [socket, room]);

  if (!room) {
    return <Lobby onRoomReady={handleRoomReady} />;
  }

  return (
    <GameRoom
      room={room}
      playerName={playerName}
    />
  );
}

export default App;