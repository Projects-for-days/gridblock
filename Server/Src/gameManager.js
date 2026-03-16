// This object stores all active game rooms with complete game state
const rooms = {};

// Player color palette
const PLAYER_COLORS = [
  '#00ff88', // Green
  '#00d4ff', // Cyan
  '#ff4d9e', // Pink
  '#b84dff', // Purple
];

function generateRoomCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  if (rooms[code]) {
    return generateRoomCode();
  }
  return code;
}

function generateBoard(size = 5) {
  const numbers = [];
  for (let i = 0; i < size * size; i++) {
    numbers.push(i);
  }
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  return numbers;
}

function createRoom(playerName, socketId) {
  const roomCode = generateRoomCode();
  const boardSize = 5;
  
  rooms[roomCode] = {
    roomCode,
    players: [{ 
      id: socketId, 
      name: playerName,
      score: 0,
      ready: false,
      board: generateBoard(boardSize),
      marked: Array(boardSize * boardSize).fill(false),
      color: PLAYER_COLORS[0]
    }],
    gameState: {
      started: false,
      calledNumbers: [],
      numberCallers: {},
      currentTurn: null,
      turnTimeLeft: 30,
      winners: null,
      boardSize: boardSize
    },
    settings: {
      maxPlayers: 4,
      turnTime: 30
    },
    createdAt: Date.now()
  };
  
  console.log(`✨ Room ${roomCode} created`);
  return rooms[roomCode];
}

function joinRoom(roomCode, playerName, socketId) {
  const room = rooms[roomCode];
  
  if (!room) {
    return { error: 'Room not found' };
  }
  
  if (room.gameState.started) {
    return { error: 'Game already in progress' };
  }
  
  if (room.players.length >= room.settings.maxPlayers) {
    return { error: 'Room is full' };
  }
  
  if (room.players.some(p => p.name === playerName)) {
    return { error: 'Name already taken in this room' };
  }
  
  const boardSize = room.gameState.boardSize;
  const playerColor = PLAYER_COLORS[room.players.length % PLAYER_COLORS.length];
  
  room.players.push({ 
    id: socketId, 
    name: playerName,
    score: 0,
    ready: false,
    board: generateBoard(boardSize),
    marked: Array(boardSize * boardSize).fill(false),
    color: playerColor
  });
  
  console.log(`👤 ${playerName} joined room ${roomCode}`);
  return room;
}

function leaveRoom(socketId) {
  for (const code in rooms) {
    const room = rooms[code];
    const playerIndex = room.players.findIndex(p => p.id === socketId);
    
    if (playerIndex !== -1) {
      const playerName = room.players[playerIndex].name;
      room.players.splice(playerIndex, 1);
      
      console.log(`👋 ${playerName} left room ${code}`);
      
      if (room.gameState.started && room.gameState.currentTurn === socketId) {
        if (room.players.length > 0) {
          room.gameState.currentTurn = room.players[0].id;
        }
      }
      
      if (room.players.length === 0) {
        delete rooms[code];
        console.log(`🗑️  Room ${code} deleted (empty)`);
      }
      
      return { roomCode: code, room: rooms[code], playerName: playerName };
    }
  }
  return null;
}

function getRoom(roomCode) {
  return rooms[roomCode];
}

function setPlayerReady(roomCode, socketId, ready) {
  const room = rooms[roomCode];
  if (!room) return { error: 'Room not found' };
  
  const player = room.players.find(p => p.id === socketId);
  if (!player) return { error: 'Player not found' };
  
  player.ready = ready;
  
  const allReady = room.players.length >= 2 && room.players.every(p => p.ready);
  
  return { room, allReady };
}

function startGame(roomCode) {
  const room = rooms[roomCode];
  if (!room) return { error: 'Room not found' };
  if (room.players.length < 2) return { error: 'Need at least 2 players' };
  
  const boardSize = room.gameState.boardSize;
  room.players.forEach(player => {
    player.board = generateBoard(boardSize);
    player.marked = Array(boardSize * boardSize).fill(false);
  });
  
  room.gameState.calledNumbers = [];
  room.gameState.numberCallers = {};
  room.gameState.started = true;
  room.gameState.currentTurn = room.players[0].id;
  room.gameState.turnTimeLeft = room.settings.turnTime;
  room.gameState.winners = null;
  
  console.log(`🎮 Game started in room ${roomCode}`);
  return room;
}

function makeMove(roomCode, socketId, number) {
  const room = rooms[roomCode];
  if (!room) return { error: 'Room not found' };
  if (!room.gameState.started) return { error: 'Game not started' };
  if (room.gameState.currentTurn !== socketId) return { error: 'Not your turn' };
  if (room.gameState.winners) return { error: 'Game already finished' };
  
  if (room.gameState.calledNumbers.includes(number)) {
    return { error: 'Number already called' };
  }
  
  room.gameState.calledNumbers.push(number);
  room.gameState.numberCallers[number] = socketId;
  
  room.players.forEach(player => {
    const index = player.board.indexOf(number);
    if (index !== -1) {
      player.marked[index] = true;
    }
  });
  
  const playersWithFiveLines = [];
  for (const player of room.players) {
    const lines = countCompletedLines(player.marked, room.gameState.boardSize);
    if (lines >= 5) {
      playersWithFiveLines.push({
        id: player.id,
        name: player.name,
        lines: lines
      });
    }
  }
  
  if (playersWithFiveLines.length > 0) {
    let winners;
    
    if (playersWithFiveLines.length === 1) {
      winners = [{
        playerId: playersWithFiveLines[0].id,
        playerName: playersWithFiveLines[0].name,
        rank: 1,
        lines: playersWithFiveLines[0].lines
      }];
      
      const winnerPlayer = room.players.find(p => p.id === playersWithFiveLines[0].id);
      if (winnerPlayer) winnerPlayer.score += 1;
      
      console.log(`🏆 ${playersWithFiveLines[0].name} won in room ${roomCode}!`);
    } else {
      winners = [];
      
      const currentTurnWinner = playersWithFiveLines.find(p => p.id === socketId);
      if (currentTurnWinner) {
        winners.push({
          playerId: currentTurnWinner.id,
          playerName: currentTurnWinner.name,
          rank: 1,
          lines: currentTurnWinner.lines
        });
        
        const winnerPlayer = room.players.find(p => p.id === currentTurnWinner.id);
        if (winnerPlayer) winnerPlayer.score += 1;
      }
      
      const currentPlayerIndex = room.players.findIndex(p => p.id === socketId);
      let rank = 2;
      
      for (let i = 1; i < room.players.length; i++) {
        const playerIndex = (currentPlayerIndex + i) % room.players.length;
        const player = room.players[playerIndex];
        
        const hasWon = playersWithFiveLines.find(p => p.id === player.id);
        if (hasWon && player.id !== socketId) {
          winners.push({
            playerId: player.id,
            playerName: player.name,
            rank: rank,
            lines: hasWon.lines
          });
          rank++;
        }
      }
      
      console.log(`🏆 Multiple winners in room ${roomCode}:`, winners);
    }
    
    room.gameState.winners = winners;
    return { room, winners };
  }
  
  const currentIndex = room.players.findIndex(p => p.id === socketId);
  const nextIndex = (currentIndex + 1) % room.players.length;
  room.gameState.currentTurn = room.players[nextIndex].id;
  room.gameState.turnTimeLeft = room.settings.turnTime;
  
  return { room, winners: null };
}

function countCompletedLines(marked, size) {
  let count = 0;
  
  for (let row = 0; row < size; row++) {
    let complete = true;
    for (let col = 0; col < size; col++) {
      if (!marked[row * size + col]) {
        complete = false;
        break;
      }
    }
    if (complete) count++;
  }
  
  for (let col = 0; col < size; col++) {
    let complete = true;
    for (let row = 0; row < size; row++) {
      if (!marked[row * size + col]) {
        complete = false;
        break;
      }
    }
    if (complete) count++;
  }
  
  let diag1Complete = true;
  for (let i = 0; i < size; i++) {
    if (!marked[i * size + i]) {
      diag1Complete = false;
      break;
    }
  }
  if (diag1Complete) count++;
  
  let diag2Complete = true;
  for (let i = 0; i < size; i++) {
    if (!marked[i * size + (size - 1 - i)]) {
      diag2Complete = false;
      break;
    }
  }
  if (diag2Complete) count++;
  
  return count;
}

function resetGame(roomCode) {
  const room = rooms[roomCode];
  if (!room) return { error: 'Room not found' };
  
  const boardSize = room.gameState.boardSize;
  room.players.forEach(player => {
    player.board = generateBoard(boardSize);
    player.marked = Array(boardSize * boardSize).fill(false);
    player.ready = false;
  });
  
  room.gameState.calledNumbers = [];
  room.gameState.numberCallers = {};
  room.gameState.started = false;
  room.gameState.currentTurn = null;
  room.gameState.winners = null;
  
  console.log(`🔄 Game reset in room ${roomCode}`);
  return room;
}

module.exports = { 
  createRoom, 
  joinRoom, 
  leaveRoom, 
  getRoom,
  setPlayerReady,
  startGame,
  makeMove,
  resetGame
};
