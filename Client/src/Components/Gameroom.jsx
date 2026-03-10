import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Board from './Board';
import Timer from './Timer';
import { useSocket } from '../Context/SocketContext';
import { countCompletedLines, getCompletedLineNumbers } from '../Utils/gamelogic';
import './Gameroom.css';

const PLAYER_COLORS = [
  { bg: '#4a90d9', fg: '#fff', light: '#e8f2fc' },   // blue
  { bg: '#d9534f', fg: '#fff', light: '#fce8e8' },   // red
  { bg: '#5cb85c', fg: '#fff', light: '#e8f5e9' },   // green
  { bg: '#f0ad4e', fg: '#fff', light: '#fff8e8' },   // amber
];

function getPlayerColor(index) {
  return PLAYER_COLORS[index % PLAYER_COLORS.length];
}

export default function Gameroom({ room, playerName }) {
  const { socket } = useSocket();
  const [board, setBoard] = useState([]);
  const [markedNumbers, setMarkedNumbers] = useState([]);
  const [calledNumbers, setCalledNumbers] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(null);
  const [currentTurnName, setCurrentTurnName] = useState('');
  const [players, setPlayers] = useState([]);
  const [gameError, setGameError] = useState('');
  const [winnerName, setWinnerName] = useState(null);
  const [calledNumbersWithCaller, setCalledNumbersWithCaller] = useState([]);
  const [notice, setNotice] = useState('');

  const myId = socket?.id;
  const isMyTurn = currentTurn === myId;

  // Win check: 5 completed lines
  const lines = board.length ? countCompletedLines(markedNumbers, board) : 0;
  const emitWinIfReady = useCallback(() => {
    if (lines >= 5 && room?.roomCode) {
      socket.emit('player_won', { roomCode: room.roomCode, playerName });
    }
  }, [lines, room?.roomCode, playerName, socket]);

  useEffect(() => {
    if (lines >= 5) emitWinIfReady();
  }, [lines, emitWinIfReady]);

  useEffect(() => {
    if (!socket || !room) return;

    socket.on('game_started', (data) => {
      setBoard(data.board);
      setMarkedNumbers(data.markedNumbers || []);
      setCalledNumbers(data.calledNumbers || []);
      setCalledNumbersWithCaller(data.calledNumbersWithCaller || []);
      setCurrentTurn(data.currentTurn);
      setCurrentTurnName(data.currentTurnName || '');
      setPlayers(data.players || []);
      setWinnerName(null);
      setNotice('');
    });

    socket.on('number_called', (data) => {
      setCalledNumbers(data.calledNumbers || []);
      setCalledNumbersWithCaller(data.calledNumbersWithCaller || []);
      setCurrentTurn(data.currentTurn);
      setCurrentTurnName(data.currentTurnName || '');
      const me = data.playerUpdates?.find(p => p.id === myId);
      if (me) setMarkedNumbers(me.markedNumbers || []);
    });

    socket.on('turn_skipped', (data) => {
      setCurrentTurn(data.currentTurn);
      setCurrentTurnName(data.currentTurnName || '');
    });

    socket.on('game_over', (data) => {
      setWinnerName(data.winnerName || null);
    });

    socket.on('room_reset', (data) => {
      // Back to waiting screen; App will update `room` prop too
      setBoard([]);
      setMarkedNumbers([]);
      setCalledNumbers([]);
      setCalledNumbersWithCaller([]);
      setCurrentTurn(null);
      setCurrentTurnName('');
      setPlayers(data?.players || []);
      setWinnerName(null);
      setGameError('');
      setNotice('New game ready. Waiting for host to start.');
    });

    socket.on('player_left', ({ room: updatedRoom, playerName: leftName }) => {
      if (updatedRoom?.players) {
        setPlayers(updatedRoom.players.map(p => ({ id: p.id, name: p.name })));
      }
      if (leftName) {
        setNotice(`${leftName} disconnected.`);
        setTimeout(() => setNotice(''), 4000);
      }
    });

    socket.on('game_error', (msg) => {
      setGameError(msg);
    });

    return () => {
      socket.off('game_started');
      socket.off('number_called');
      socket.off('turn_skipped');
      socket.off('game_over');
      socket.off('room_reset');
      socket.off('player_left');
      socket.off('game_error');
    };
  }, [socket, room, myId]);

  function handleStartGame() {
    setGameError('');
    if (room?.roomCode) socket.emit('start_game', room.roomCode);
  }

  function handleNumberClick(num) {
    setGameError('');
    if (!room?.roomCode || !isMyTurn || calledNumbers.includes(num)) return;
    socket.emit('call_number', { roomCode: room.roomCode, number: num });
  }

  function handleTimeout() {
    if (room?.roomCode) socket.emit('turn_timeout', room.roomCode);
  }

  // Map each marked number to the color of the player who called it (for board X colors)
  const markedNumberColors = useMemo(() => {
    const map = {};
    (calledNumbersWithCaller || []).forEach(({ number, calledBy }) => {
      const idx = (players || []).findIndex(p => p.id === calledBy);
      if (idx >= 0) map[number] = getPlayerColor(idx).bg;
    });
    return map;
  }, [calledNumbersWithCaller, players]);

  // Numbers that form completed lines on this player's board (for uniform highlight)
  const completedLineNumbers = useMemo(() => {
    if (!board?.length) return new Set();
    return getCompletedLineNumbers(markedNumbers, board);
  }, [markedNumbers, board]);

  // Waiting for game to start (show waiting until we receive game_started and have board data)
  if (board.length === 0) {
    const isHost = room?.players?.[0]?.id === myId;
    return (
      <div className="gameroom-waiting">
        <div className="waiting-card">
          <div className="room-code">Room: {room?.roomCode}</div>
          <div className="players-list">
            {(room?.players || []).map((p, i) => {
              const c = getPlayerColor(i);
              return (
                <div
                  key={p.id}
                  className="player-tag"
                  style={{ backgroundColor: c.bg, color: c.fg }}
                >
                  {p.name}
                </div>
              );
            })}
          </div>
          {room?.players?.length < 2 && (
            <p className="waiting-text">Waiting for at least 2 players...</p>
          )}
          {isHost && room?.players?.length >= 2 && (
            <button className="start-button" onClick={handleStartGame}>
              Start Game
            </button>
          )}
          {!isHost && room?.players?.length >= 2 && (
            <p className="waiting-text">Waiting for host to start...</p>
          )}
        </div>
      </div>
    );
  }

  // Winner screen
  if (winnerName) {
    return (
      <div className="gameroom-winner">
        <h1>Game Over</h1>
        <p>{winnerName} wins!</p>
        <button
          className="play-again-button"
          onClick={() => room?.roomCode && socket.emit('play_again', room.roomCode)}
        >
          Play Again
        </button>
      </div>
    );
  }

  // In-game
  return (
    <div className="gameroom">
      <div className="gameroom-header">
        <h1>GridBlock</h1>
        <div className="turn-indicator">
          {(() => {
            const turnIndex = players.findIndex(p => p.id === currentTurn);
            const turnColor = turnIndex >= 0 ? getPlayerColor(turnIndex) : null;
            return (
              <>
                {turnColor && (
                  <span
                    className="turn-indicator-dot"
                    style={{ backgroundColor: turnColor.bg }}
                  />
                )}
                {isMyTurn ? 'Your turn' : `${currentTurnName || 'Waiting'}...`}
              </>
            );
          })()}
        </div>
        <div className="line-count">Lines: {lines}/5</div>
      </div>
      {notice && <div className="notice-banner">{notice}</div>}
      {gameError && <p className="lobby-error">{gameError}</p>}
      <div className="gameroom-main">
        <div className="gameroom-left">
          <Timer
            isMyTurn={isMyTurn}
            currentTurn={currentTurn}
            onTimeout={handleTimeout}
          />
          <Board
            board={board}
            markedNumbers={markedNumbers}
            calledNumbers={calledNumbers}
            markedNumberColors={markedNumberColors}
            completedLineNumbers={completedLineNumbers}
            isMyTurn={isMyTurn}
            onNumberClick={handleNumberClick}
          />
        </div>
        <div className="gameroom-right">
          <div className="players-panel">
            <h3>Players</h3>
            {(players || []).map((p, i) => {
              const c = getPlayerColor(i);
              const isActive = p.id === currentTurn;
              return (
                <div
                  key={p.id}
                  className={`player-row ${isActive ? 'active-turn' : ''}`}
                  style={{
                    borderLeftColor: c.bg,
                    backgroundColor: isActive ? c.light : 'transparent',
                  }}
                >
                  <span
                    className="player-row-dot"
                    style={{ backgroundColor: c.bg }}
                  />
                  {p.name}
                </div>
              );
            })}
          </div>
          <div className="called-numbers">
            <h3>Called Numbers</h3>
            <div className="called-list">
              {calledNumbers.length === 0 ? (
                <span className="no-calls">None yet</span>
              ) : (
                calledNumbers.map(n => (
                  <span key={n} className="called-chip">{n}</span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
