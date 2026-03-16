import React, { useState, useEffect } from 'react';
import { useSocket } from '../Context/SocketContext';
import './Lobby.css';

function Lobby({ onRoomReady, colorTheme, onThemeChange, darkMode, onDarkModeChange }) {
  const { socket, connected, connectionError } = useSocket();
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [customColor, setCustomColor] = useState('#00ff88');
  const [volume, setVolume] = useState(() => {
    return parseFloat(localStorage.getItem('gridblock-volume')) || 0.5;
  });

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

  const handleCustomColorChange = (color) => {
    setCustomColor(color);
    onThemeChange(color); // Pass the hex color directly
  };

  // Preset themes - only 4
  const presetThemes = [
    { name: 'green', color: '#00ff88', label: 'Matrix Green' },
    { name: 'blue', color: '#00d4ff', label: 'Cyber Blue' },
    { name: 'purple', color: '#b84dff', label: 'Neon Purple' },
    { name: 'pink', color: '#ff4d9e', label: 'Hot Pink' },
  ];

  const isCustomColor = !presetThemes.some(theme => theme.name === colorTheme);

  return (
    <div className="lobby">
      <div className="lobby-background">
        <button 
          className="settings-button"
          onClick={() => setShowSettings(!showSettings)}
          title="Settings"
        >
          ⚙️
        </button>

        {showSettings && (
          <div className="settings-modal" onClick={() => setShowSettings(false)}>
            <div className="settings-content" onClick={(e) => e.stopPropagation()}>
              <div className="settings-header">
                <h3>⚙️ Settings</h3>
                <button 
                  className="close-settings"
                  onClick={() => setShowSettings(false)}
                >
                  ✕
                </button>
              </div>
              
              <div className="settings-body">
                {/* Dark/Light Mode Toggle */}
                <div className="settings-section">
                  <h4>🌓 Display Mode</h4>
                  <div className="mode-toggle">
                    <button
                      className={`mode-btn ${darkMode ? 'active' : ''}`}
                      onClick={() => onDarkModeChange(true)}
                    >
                      🌙 Dark Mode
                    </button>
                    <button
                      className={`mode-btn ${!darkMode ? 'active' : ''}`}
                      onClick={() => onDarkModeChange(false)}
                    >
                      ☀️ Light Mode
                    </button>
                  </div>
                </div>

                {/* Color Theme - Presets */}
                <div className="settings-section">
                  <h4>🎨 Color Theme - Presets</h4>
                  <div className="preset-grid">
                    {presetThemes.map(theme => (
                      <button
                        key={theme.name}
                        className={`theme-option ${colorTheme === theme.name ? 'active' : ''}`}
                        onClick={() => onThemeChange(theme.name)}
                        style={{
                          borderColor: theme.color,
                          background: colorTheme === theme.name 
                            ? `linear-gradient(135deg, ${theme.color}22, ${theme.color}11)`
                            : 'transparent'
                        }}
                      >
                        <div 
                          className="theme-color-preview"
                          style={{ background: theme.color }}
                        />
                        <span>{theme.label}</span>
                        {colorTheme === theme.name && <span className="check">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Color Picker */}
                <div className="settings-section">
                  <h4>🎨 Custom Color</h4>
                  <div className="color-picker-section">
                    <div className="color-picker-container">
                      <input
                        type="color"
                        id="colorPicker"
                        className="color-picker-input"
                        value={isCustomColor ? colorTheme : customColor}
                        onChange={(e) => handleCustomColorChange(e.target.value)}
                      />
                      <label htmlFor="colorPicker" className="color-picker-label">
                        <div 
                          className="color-preview-large"
                          style={{ 
                            background: isCustomColor ? colorTheme : customColor 
                          }}
                        />
                        <span>Pick Your Color</span>
                      </label>
                    </div>
                    <div className="color-hex-display">
                      {isCustomColor ? colorTheme : customColor}
                    </div>

                {/* Volume Control */}
                <div className="settings-section">
                  <h4>🔊 Sound Volume</h4>
                  <div className="volume-control">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="volume-slider"
                    />
                    <div className="volume-label">
                      {Math.round(volume * 100)}%
                    </div>
                  </div>
                </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
              {connectionError}
            </div>
          )}

          {!connected && (
            <div className="connection-status">
              Connecting to server...
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

            {error && <div className="lobby-error">{error}</div>}

            <button 
              className="lobby-btn lobby-btn-create"
              onClick={handleCreate}
              disabled={loading || !connected}
            >
              {loading ? 'Creating...' : 'Create Room'}
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
              {loading ? 'Joining...' : 'Join Room'}
            </button>

            <div className="lobby-hint">
              Tip: Share the room code with friends to play together!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Lobby;
