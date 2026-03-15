import React, { useState, useEffect } from 'react';
import { useSocket } from '../Context/SocketContext';
import Board from './Board';
import './GameRoom.css';

function GameRoom({ room: initialRoom, playerName, onLeave }) {
  const { socket } = useSocket();
  const [room, setRoom] = useState(initialRoom);
  const [timeLeft, setTimeLeft] = useState(30);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    if (!socket) return;

    // Room state updates
    socket.on('room_updated', (updatedRoom) => {
      setRoom(updatedRoom);
    });

    // Game started
    socket.on('game_started', (updatedRoom) => {
      setRoom(updatedRoom);
      setTimeLeft(updatedRoom.settings.turnTime);
    });

    // Move made
    socket.on('move_made', ({ room: updatedRoom, cellIndex, playerId }) => {
      setRoom(updatedRoom);
      setTimeLeft(updatedRoom.settings.turnTime);
    });

    // Turn timer
    socket.on('turn_timer_update', (time) => {
      setTimeLeft(time);
    });

    // Turn skipped
    socket.on('turn_skipped', (updatedRoom) => {
      setRoom(updatedRoom);
      setTimeLeft(updatedRoom.settings.turnTime);
    });

    // Game over
    socket.on('game_over', ({ winner, room: updatedRoom }) => {
      setRoom(updatedRoom);
    });

    // Game reset
    socket.on('game_reset', (updatedRoom) => {
      setRoom(updatedRoom);
      setTimeLeft(30);
    });

    // Player left
    socket.on('player_left', (updatedRoom) => {
      setRoom(updatedRoom);
    });

    // Chat messages
    socket.on('chat_message', (msg) => {
      setChatMessages(prev => [...prev, msg]);
    });

    // Errors
    socket.on('error', (error) => {
      console.error('Game error:', error);
    });

    socket.on('move_error', (error) => {
      console.error('Move error:', error);
    });

    return () => {
      socket.off('room_updated');
      socket.off('game_started');
      socket.off('move_made');
      socket.off('turn_timer_update');
      socket.off('turn_skipped');
      socket.off('game_over');
      socket.off('game_reset');
      socket.off('player_left');
      socket.off('chat_message');
      socket.off('error');
      socket.off('move_error');
    };
  }, [socket]);

  const handleToggleReady = () => {
    socket.emit('toggle_ready', room.roomCode);
  };

  const handleCellClick = (index) => {
    if (!room.gameState.started) return;
    if (room.gameState.currentTurn !== socket.id) return;
    if (room.gameState.winner) return;

    const myPlayer = room.players.find(p => p.id === socket.id);
    const number = myPlayer.board[index];

    socket.emit('make_move', {
      roomCode: room.roomCode,
      number
    });
  };

  const handleReset = () => {
    socket.emit('reset_game', room.roomCode);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit('send_message', {
        roomCode: room.roomCode,
        message: message.trim()
      });
      setMessage('');
    }
  };

  const currentPlayer = room.players.find(p => p.id === socket.id);
  const isMyTurn = room.gameState.currentTurn === socket.id;
  const currentTurnPlayer = room.players.find(p => p.id === room.gameState.currentTurn);

  // Calculate lines using this player's own marked array
  const lines = currentPlayer
    ? countLines(currentPlayer.marked, room.gameState.boardSize)
    : 0;

  return (
    <div className="game-room">
      {/* Header */}
      <div className="game-header">
        <div className="header-left">
          <h1 className="game-title">
            <span className="title-grid">Grid</span>
            <span className="title-block">Block</span>
          </h1>
          <div className="room-code">
            Room: <span className="code">{room.roomCode}</span>
          </div>
        </div>
        <div className="header-right">
          <button className="help-btn" onClick={() => setShowRules(true)}>
            <img src="question-mark.png" alt="How to Play" />
          </button>
          <button className="leave-btn" onClick={onLeave}>
            ← Leave Room
          </button>
        </div>
      </div>

      <div className="game-container">
        {/* Left Sidebar - Players */}
        <div className="sidebar sidebar-left">
          <h3>Players ({room.players.length}/4)</h3>
          <div className="players-list">
            {room.players.map((player, idx) => (
              <div 
                key={player.id} 
                className={`player-card ${player.id === socket.id ? 'current-player' : ''} ${room.gameState.currentTurn === player.id ? 'active-turn' : ''}`}
              >
                <div className="player-info">
                  <span className="player-name">
                    {player.name}
                    {player.id === socket.id && ' (You)'}
                  </span>
                  {room.gameState.started && (
                    <span className="player-score">Score: {player.score}</span>
                  )}
                </div>
                {!room.gameState.started && (
                  <span className={`ready-status ${player.ready ? 'ready' : ''}`}>
                    {player.ready ? '✓ Ready' : '○ Not Ready'}
                  </span>
                )}
                {room.gameState.currentTurn === player.id && room.gameState.started && (
                  <span className="turn-indicator">🎯 Turn</span>
                )}
              </div>
            ))}
          </div>

          {!room.gameState.started && (
            <button 
              className={`ready-btn ${currentPlayer?.ready ? 'ready' : ''}`}
              onClick={handleToggleReady}
            >
              {currentPlayer?.ready ? '✓ Ready!' : 'Mark as Ready'}
            </button>
          )}

          {room.players.length < 2 && !room.gameState.started && (
            <div className="waiting-message">
              ⏳ Waiting for more players...
            </div>
          )}
        </div>

        {/* Main Game Area */}
        <div className="game-main">
          {/* Game Status */}
          <div className="game-status">
            {!room.gameState.started ? (
              <div className="status-waiting">
                <h2>Waiting to Start</h2>
                <p>All players must be ready to begin</p>
              </div>
            ) : room.gameState.winner ? (
              <div className="status-winner">
                <h2>🏆 Game Over!</h2>
                <p>
                  {room.players.find(p => p.id === room.gameState.winner)?.name} wins!
                </p>
                <button className="reset-btn" onClick={handleReset}>
                  Play Again
                </button>
              </div>
            ) : (
              <div className="status-playing">
                <div className="turn-info">
                  <h3>
                    {isMyTurn ? " Your Turn!" : `${currentTurnPlayer?.name}'s Turn`}
                  </h3>
                  <div className="timer">
                    ⏱️ {timeLeft}s
                  </div>
                </div>
                <div className="lines-counter">
                  Lines: {lines}/5
                </div>
              </div>
            )}
          </div>

          {/* Board */}
          <Board
            board={currentPlayer?.board || []}
            marked={currentPlayer?.marked || []}
            boardSize={room.gameState.boardSize}
            onCellClick={handleCellClick}
            disabled={!isMyTurn || !room.gameState.started || !!room.gameState.winner}
          />

          {/* Called Numbers */}
          {room.gameState.started && (
            <div className="called-numbers">
              <h4>Called Numbers:</h4>
              <div className="numbers-list">
                {room.gameState.calledNumbers.length > 0 
                  ? room.gameState.calledNumbers.join(', ')
                  : 'None yet'}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Chat */}
        <div className="sidebar sidebar-right">
          <h3>Chat</h3>
          <div className="chat-messages">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className="chat-message">
                <span className="chat-name">{msg.playerName}:</span>
                <span className="chat-text">{msg.message}</span>
              </div>
            ))}
          </div>
          <form className="chat-input" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={100}
            />
            <button type="submit">Send</button>
          </form>
        </div>
      </div>

      {/* How to Play Modal */}
      {showRules && (
        <div className="rules-modal-overlay" onClick={() => setShowRules(false)}>
          <div className="rules-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rules-header">
              <h2>How to Play GridBlock</h2>
              <button className="close-btn" onClick={() => setShowRules(false)}>✕</button>
            </div>
            <div className="rules-content">
              <div className="rules-section">
                <h3>Game Rules</h3>
                <ul>
                  <li>Players take turns marking cells on a 5×5 grid</li>
                  <li>Each cell contains a number from 0-24 (randomized each game)</li>
                  <li>On your turn, click any unmarked cell to mark it with an "X"</li>
                  <li>You have 30 seconds to make your move</li>
                  <li>Complete 5 lines to win (rows, columns, or diagonals)</li>
                  <li>If timer runs out, turn automatically passes to next player</li>
                </ul>
              </div>
              
              <div className="rules-section">
                <h3>How to Win</h3>
                <p>Complete 5 lines by marking cells in:</p>
                <ul>
                  <li><strong>Rows:</strong> Mark all 5 cells in any horizontal row</li>
                  <li><strong>Columns:</strong> Mark all 5 cells in any vertical column</li>
                  <li><strong>Diagonals:</strong> Mark all cells along either diagonal</li>
                </ul>
              </div>
              
              <div className="rules-section">
                <h3>Turn Timer</h3>
                <p>Each player has 30 seconds per turn. If you don't make a move in time:</p>
                <ul>
                  <li>Your turn automatically passes to the next player</li>
                  <li>The game continues normally</li>
                </ul>
              </div>
              
              <div className="rules-section">
                <h3>Controls</h3>
                <ul>
                  <li><strong>Mark Cell:</strong> Click any unmarked cell during your turn</li>
                  <li><strong>Chat:</strong> Type messages in the chat box to communicate</li>
                  <li><strong>Ready Up:</strong> Click "Mark as Ready" when you want to start</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to count lines
function countLines(marked, size) {
  let count = 0;
  
  // Rows
  for (let row = 0; row < size; row++) {
    if (marked.slice(row * size, (row + 1) * size).every(m => m)) count++;
  }
  
  // Columns
  for (let col = 0; col < size; col++) {
    let complete = true;
    for (let row = 0; row < size; row++) {
      if (!marked[row * size + col]) complete = false;
    }
    if (complete) count++;
  }
  
  // Diagonals
  if (marked.filter((_, i) => i % (size + 1) === 0).every(m => m)) count++;
  if (marked.filter((_, i) => i % (size - 1) === 0 && i !== 0 && i !== size * size - 1).every(m => m)) count++;
  
  return count;
}

export default GameRoom;
