// This object stores all active game rooms with complete game state
const rooms = {};

// Generate a random 6 character room code
function generateRoomCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  // Check if code already exists (rare but possible)
  if (rooms[code]) {
    return generateRoomCode();
  }
  return code;
}

// Generate shuffled board for the game
function generateBoard(size = 5) {
  const numbers = [];
  for (let i = 0; i < size * size; i++) {
    numbers.push(i);
  }
  // Fisher-Yates shuffle
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  return numbers;
}

// Create a new room and return it
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
      marked: Array(boardSize * boardSize).fill(false)
    }],
    gameState: {
      started: false,
      calledNumbers: [],
      currentTurn: null,
      turnTimeLeft: 30,
      winner: null,
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

// Add a player to an existing room
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
  
  // Check if player with same name already exists
  if (room.players.some(p => p.name === playerName)) {
    return { error: 'Name already taken in this room' };
  }
  
  room.players.push({
    id: socketId,
    name: playerName,
    score: 0,
    ready: false,
    board: generateBoard(room.gameState.boardSize),
    marked: Array(room.gameState.boardSize * room.gameState.boardSize).fill(false)
  });
  
  console.log(`👤 ${playerName} joined room ${roomCode}`);
  return room;
}

// Remove a player from a room when they disconnect
function leaveRoom(socketId) {
  for (const code in rooms) {
    const room = rooms[code];
    const playerIndex = room.players.findIndex(p => p.id === socketId);
    
    if (playerIndex !== -1) {
      const playerName = room.players[playerIndex].name;
      room.players.splice(playerIndex, 1);
      
      console.log(`👋 ${playerName} left room ${code}`);
      
      // If game was in progress and player was current turn, move to next player
      if (room.gameState.started && room.gameState.currentTurn === socketId) {
        if (room.players.length > 0) {
          room.gameState.currentTurn = room.players[0].id;
        }
      }
      
      // Delete the room if it's empty
      if (room.players.length === 0) {
        delete rooms[code];
        console.log(`🗑️  Room ${code} deleted (empty)`);
      }
      
      return { roomCode: code, room: rooms[code] };
    }
  }
  return null;
}

// Get a room by its code
function getRoom(roomCode) {
  return rooms[roomCode];
}

// Set player ready status
function setPlayerReady(roomCode, socketId, ready) {
  const room = rooms[roomCode];
  if (!room) return { error: 'Room not found' };
  
  const player = room.players.find(p => p.id === socketId);
  if (!player) return { error: 'Player not found' };
  
  player.ready = ready;
  
  // Check if all players are ready
  const allReady = room.players.length >= 2 && room.players.every(p => p.ready);
  
  return { room, allReady };
}

// Start the game
function startGame(roomCode) {
  const room = rooms[roomCode];
  if (!room) return { error: 'Room not found' };
  if (room.players.length < 2) return { error: 'Need at least 2 players' };
  
  // Give every player a fresh randomized board
  room.players.forEach(player => {
    player.board = generateBoard(room.gameState.boardSize);
    player.marked = Array(room.gameState.boardSize * room.gameState.boardSize).fill(false);
  });
  room.gameState.calledNumbers = [];
  room.gameState.started = true;
  room.gameState.currentTurn = room.players[0].id;
  room.gameState.turnTimeLeft = room.settings.turnTime;
  room.gameState.winner = null;
  
  console.log(`🎮 Game started in room ${roomCode}`);
  return room;
}

// Make a move (call a number)
function makeMove(roomCode, socketId, number) {
  const room = rooms[roomCode];
  if (!room) return { error: 'Room not found' };
  if (!room.gameState.started) return { error: 'Game not started' };
  if (room.gameState.currentTurn !== socketId) return { error: 'Not your turn' };
  if (room.gameState.winner) return { error: 'Game already finished' };

  // Check if already called
  if (room.gameState.calledNumbers.includes(number)) {
    return { error: 'Number already called' };
  }

  // Mark this number on every player's board
  room.players.forEach(player => {
    const idx = player.board.indexOf(number);
    if (idx !== -1) {
      player.marked[idx] = true;
    }
  });
  room.gameState.calledNumbers.push(number);

  // Check if the active player has won
  const activePlayer = room.players.find(p => p.id === socketId);
  const lines = countCompletedLines(activePlayer.marked, room.gameState.boardSize);
  if (lines >= 5) {
    room.gameState.winner = socketId;
    activePlayer.score += 1;
    console.log(`🏆 ${activePlayer.name} won in room ${roomCode}!`);
  } else {
    // Move to next player
    const currentIndex = room.players.findIndex(p => p.id === socketId);
    const nextIndex = (currentIndex + 1) % room.players.length;
    room.gameState.currentTurn = room.players[nextIndex].id;
    room.gameState.turnTimeLeft = room.settings.turnTime;
  }

  return { room, lines, winner: room.gameState.winner };
}

// Count completed lines (rows, columns, diagonals)
function countCompletedLines(marked, size) {
  let count = 0;
  
  // Check rows
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
  
  // Check columns
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
  
  // Check diagonal (top-left to bottom-right)
  let diag1Complete = true;
  for (let i = 0; i < size; i++) {
    if (!marked[i * size + i]) {
      diag1Complete = false;
      break;
    }
  }
  if (diag1Complete) count++;
  
  // Check diagonal (top-right to bottom-left)
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

// Reset game for rematch
function resetGame(roomCode) {
  const room = rooms[roomCode];
  if (!room) return { error: 'Room not found' };
  
  room.players.forEach(player => {
    player.board = generateBoard(room.gameState.boardSize);
    player.marked = Array(room.gameState.boardSize * room.gameState.boardSize).fill(false);
    player.ready = false;
  });
  room.gameState.calledNumbers = [];
  room.gameState.started = false;
  room.gameState.currentTurn = null;
  room.gameState.winner = null;
  
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
