const { createRoom, joinRoom, leaveRoom } = require('./gameManager');

function roomHandler(io, socket) {

  // When a player creates a room
  socket.on('create_room', (playerName) => {
    const room = createRoom(playerName, socket.id);
    // socket.join puts this player into a Socket.io "room"
    // This means we can send messages to everyone in the room at once
    socket.join(room.roomCode);
    // Send the room details back to the player who created it
    socket.emit('room_created', room);
    console.log(`Room ${room.roomCode} created by ${playerName}`);
  });

  // When a player joins a room
  socket.on('join_room', ({ roomCode, playerName }) => {
    const result = joinRoom(roomCode, playerName, socket.id);
    if (result.error) {
      // Send error back to just this player
      socket.emit('join_error', result.error);
      return;
    }
    socket.join(roomCode);
    // Send updated room to the player who just joined
    socket.emit('room_joined', result);
    // Tell everyone else in the room someone new joined
    socket.to(roomCode).emit('player_joined', result);
    console.log(`${playerName} joined room ${roomCode}`);
  });

  // When a player disconnects
  socket.on('disconnect', () => {
    const result = leaveRoom(socket.id);
    if (!result) return;
    const { roomCode, leftPlayerName, room } = result;
    // Inform everyone who is still in the room
    if (room) {
      io.to(roomCode).emit('player_left', { room, playerName: leftPlayerName });
    } else {
      // Room was deleted (last player left)
      io.to(roomCode).emit('player_left', { room: null, playerName: leftPlayerName });
    }
  });
}

module.exports = roomHandler;