// This object stores all active game rooms
// It looks like this when a room is created:
// {
//   "ABC123": {
//     roomCode: "ABC123",
//     players: [
//       { id: "socket123", name: "Player 1" }
//     ],
//     gameStarted: false
//   }
// }
const rooms = {};

// Generate a random 6 character room code
function generateRoomCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

// Create a new room and return it
function createRoom(playerName, socketId) {
  const roomCode = generateRoomCode();
  rooms[roomCode] = {
    roomCode,
    players: [{ id: socketId, name: playerName }],
    gameStarted: false
  };
  return rooms[roomCode];
}

// Add a player to an existing room
function joinRoom(roomCode, playerName, socketId) {
  const room = rooms[roomCode];
  if (!room) return { error: 'Room not found' };
  if (room.gameStarted) return { error: 'Game already started' };
  if (room.players.length >= 4) return { error: 'Room is full' };

  room.players.push({ id: socketId, name: playerName });
  return room;
}

// Remove a player from a room when they disconnect
function leaveRoom(socketId) {
  for (const code in rooms) {
    const room = rooms[code];
    room.players = room.players.filter(p => p.id !== socketId);
    // Delete the room if it's empty
    if (room.players.length === 0) {
      delete rooms[code];
    }
  }
}

// Get a room by its code
function getRoom(roomCode) {
  return rooms[roomCode];
}

module.exports = { createRoom, joinRoom, leaveRoom, getRoom };