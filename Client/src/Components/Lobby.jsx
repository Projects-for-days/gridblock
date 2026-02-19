import React, { useState, useEffect } from 'react';
import { useSocket } from '../Context/SocketContext';
import './Lobby.css';

function Lobby({ onRoomReady }) {
  const { socket } = useSocket();
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // When room is successfully created
    socket.on('room_created', (room) => {
      onRoomReady(room, playerName);
    });
    // When room is successfully joined
    socket.on('room_joined', (room) => {
      onRoomReady(room, playerName);
    });
    // When there's an error joining
    socket.on('join_error', (message) => {
      setError(message);
    });

    return () => {
      socket.off('room_created');
      socket.off('room_joined');
      socket.off('join_error');
    };
  }, [socket, playerName, onRoomReady]);

  function handleCreate() {
    if (!playerName.trim()) return setError('Please enter your name');
    socket.emit('create_room', playerName);
  }

  function handleJoin() {
    if (!playerName.trim()) return setError('Please enter your name');
    if (!roomCode.trim()) return setError('Please enter a room code');
    socket.emit('join_room', { roomCode: roomCode.toUpperCase(), playerName });
  }

  return (
    <div className="lobby">
      <h1>GridBlock</h1>
      <div className="lobby-card">
        <input
          type="text"
          placeholder="Enter your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="lobby-input"
        />
        {error && <p className="lobby-error">{error}</p>}
        <button className="lobby-button create" onClick={handleCreate}>
          Create Room
        </button>
        <div className="lobby-divider">OR</div>
        <input
          type="text"
          placeholder="Enter room code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          className="lobby-input"
        />
        <button className="lobby-button join" onClick={handleJoin}>
          Join Room
        </button>
      </div>
    </div>
  );
}

export default Lobby;