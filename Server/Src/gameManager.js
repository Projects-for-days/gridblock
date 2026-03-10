const rooms = {};

function generateRoomCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

// Generate a shuffled board of 25 numbers (1-25)
function generateBoard() {
  let numbers = [];
  for (let i = 1; i <= 25; i++) numbers.push(i);
  for (let i = numbers.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  return numbers;
}

function createRoom(playerName, socketId) {
  const roomCode = generateRoomCode();
  rooms[roomCode] = {
    roomCode,
    players: [{
      id: socketId,
      name: playerName,
      board: generateBoard(),  // Each player gets their own shuffled board
      markedNumbers: []        // Tracks which numbers are marked on their board
    }],
    gameStarted: false,
    currentTurnIndex: 0,       // Index of whose turn it is in the players array
    calledNumbers: [],         // Master list of all numbers called this game
    calledNumbersWithCaller: [] // [{ number, calledBy: playerId }] for UI colors
  };
  return rooms[roomCode];
}

function joinRoom(roomCode, playerName, socketId) {
  const room = rooms[roomCode];
  if (!room) return { error: 'Room not found' };
  if (room.gameStarted) return { error: 'Game already started' };
  if (room.players.length >= 4) return { error: 'Room is full' };

  room.players.push({
    id: socketId,
    name: playerName,
    board: generateBoard(),
    markedNumbers: []
  });
  return room;
}

function leaveRoom(socketId) {
  for (const code in rooms) {
    const room = rooms[code];
    const leavingIndex = room.players.findIndex(p => p.id === socketId);
    if (leavingIndex === -1) continue;

    const leavingPlayer = room.players[leavingIndex];
    room.players.splice(leavingIndex, 1);

    // Keep currentTurnIndex valid after removal
    if (room.currentTurnIndex > leavingIndex) room.currentTurnIndex--;
    if (room.currentTurnIndex >= room.players.length) room.currentTurnIndex = 0;

    if (room.players.length === 0) {
      delete rooms[code];
      return { roomCode: code, leftPlayerName: leavingPlayer.name, room: null };
    }

    return { roomCode: code, leftPlayerName: leavingPlayer.name, room };
  }
  return null;
}

function getRoom(roomCode) {
  return rooms[roomCode];
}

// Mark a number on ALL players' boards in a room (callerId = who called it, for UI colors)
function markNumberOnAllBoards(roomCode, number, callerId) {
  const room = rooms[roomCode];
  if (!room) return;
  room.players.forEach(player => {
    if (player.board.includes(number)) {
      player.markedNumbers.push(number);
    }
  });
  room.calledNumbers.push(number);
  room.calledNumbersWithCaller.push({ number, calledBy: callerId });
}

// Advance the turn to the next player
function advanceTurn(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;
  room.currentTurnIndex = (room.currentTurnIndex + 1) % room.players.length;
  return room.players[room.currentTurnIndex];
}

// Get the player whose turn it currently is
function getCurrentPlayer(roomCode) {
  const room = rooms[roomCode];
  if (!room) return null;
  return room.players[room.currentTurnIndex];
}

function resetGame(roomCode) {
  const room = rooms[roomCode];
  if (!room) return null;

  room.players = room.players.map(p => ({
    ...p,
    board: generateBoard(),
    markedNumbers: []
  }));
  room.gameStarted = false;
  room.currentTurnIndex = 0;
  room.calledNumbers = [];
  room.calledNumbersWithCaller = [];
  return room;
}

module.exports = {
  createRoom, joinRoom, leaveRoom, getRoom,
  markNumberOnAllBoards, advanceTurn, getCurrentPlayer, resetGame
};