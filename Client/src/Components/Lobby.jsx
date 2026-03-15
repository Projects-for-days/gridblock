import React, { useState, useEffect } from 'react';
import { useSocket } from '../Context/SocketContext';
import './Lobby.css';

function Lobby({ onRoomReady }) {
  const { socket, connected, connectionError } = useSocket();
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleRoomCreated = (room) => {
      setLoading(false);
      onRoomReady(room, playerName);
    };

    const handleRoomJoined = (room) => {
      setLoading(false);
      onRoomReady(room, playerName);
    };

    const handleJoinError = (message) => {
      setLoading(false);
      setError(message);
    };

    socket.on('room_created', handleRoomCreated);
    socket.on('room_joined', handleRoomJoined);
    socket.on('join_error', handleJoinError);

    return () => {
      socket.off('room_created', handleRoomCreated);
      socket.off('room_joined', handleRoomJoined);
      socket.off('join_error', handleJoinError);
    };
  }, [socket, playerName, onRoomReady]);

  const handleCreate = () => {
    const name = playerName.trim();
    if (!name) {
      setError('Please enter your name');
      return;
    }
    if (name.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    setError('');
    setLoading(true);
    socket.emit('create_room', name);
  };

  const handleJoin = () => {
    const name = playerName.trim();
    const code = roomCode.trim().toUpperCase();
    
    if (!name) {
      setError('Please enter your name');
      return;
    }
    if (name.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    if (!code) {
      setError('Please enter a room code');
      return;
    }
    if (code.length !== 6) {
      setError('Room code must be 6 characters');
      return;
    }
    
    setError('');
    setLoading(true);
    socket.emit('join_room', { roomCode: code, playerName: name });
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter' && !loading) {
      action();
    }
  };

  return (
    <div className="lobby">
      <div className="lobby-background">
        <div className="lobby-card">
          <div className="lobby-header">
            <h1 className="lobby-title">
              <span className="title-grid">Grid</span>
              <span className="title-block">Block</span>
            </h1>
            <p className="lobby-subtitle">Multiplayer Number Grid Game</p>
          </div>

          {connectionError && (
            <div className="connection-error">
              ⚠️ {connectionError}
            </div>
          )}

          {!connected && (
            <div className="connection-status">
              🔄 Connecting to server...
            </div>
          )}

          <div className="lobby-content">
            <div className="lobby-field">
              <label className="lobby-label">Your Name</label>
              <input
                type="text"
                className="lobby-input"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleCreate)}
                maxLength={20}
                disabled={loading || !connected}
              />
            </div>

            {error && <div className="lobby-error">❌ {error}</div>}

            <button 
              className="lobby-btn lobby-btn-create"
              onClick={handleCreate}
              disabled={loading || !connected}
            >
              {loading ? '⏳ Creating...' : '🎮 Create Room'}
            </button>

            <div className="lobby-divider">
              <span>OR</span>
            </div>

            <div className="lobby-field">
              <label className="lobby-label">Room Code</label>
              <input
                type="text"
                className="lobby-input room-code-input"
                placeholder="Enter 6-digit code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => handleKeyPress(e, handleJoin)}
                maxLength={6}
                disabled={loading || !connected}
              />
            </div>

            <button 
              className="lobby-btn lobby-btn-join"
              onClick={handleJoin}
              disabled={loading || !connected}
            >
              {loading ? '⏳ Joining...' : '🚪 Join Room'}
            </button>

            <div className="lobby-hint">
              💡 Tip: Share the room code with friends to play together!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Lobby;
