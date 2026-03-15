const { 
  createRoom, 
  joinRoom, 
  leaveRoom, 
  getRoom,
  setPlayerReady,
  startGame,
  makeMove,
  resetGame
} = require('./gameManager');

function roomHandler(io, socket) {

  // When a player creates a room
  socket.on('create_room', (playerName) => {
    const room = createRoom(playerName, socket.id);
    socket.join(room.roomCode);
    socket.emit('room_created', room);
  });

  // When a player joins a room
  socket.on('join_room', ({ roomCode, playerName }) => {
    const result = joinRoom(roomCode, playerName, socket.id);
    
    if (result.error) {
      socket.emit('join_error', result.error);
      return;
    }
    
    socket.join(roomCode);
    socket.emit('room_joined', result);
    
    // Notify all players in the room
    io.to(roomCode).emit('room_updated', result);
  });

  // When a player toggles ready status
  socket.on('toggle_ready', (roomCode) => {
    const room = getRoom(roomCode);
    if (!room) {
      socket.emit('error', 'Room not found');
      return;
    }
    
    const player = room.players.find(p => p.id === socket.id);
    if (!player) {
      socket.emit('error', 'Player not found');
      return;
    }
    
    const result = setPlayerReady(roomCode, socket.id, !player.ready);
    
    if (result.error) {
      socket.emit('error', result.error);
      return;
    }
    
    // Broadcast updated room state to all players
    io.to(roomCode).emit('room_updated', result.room);
    
    // If all players are ready, auto-start the game
    if (result.allReady) {
      setTimeout(() => {
        const startResult = startGame(roomCode);
        if (!startResult.error) {
          io.to(roomCode).emit('game_started', startResult);
          startTurnTimer(io, roomCode);
        }
      }, 1000); // Small delay before starting
    }
  });

  // When a player starts the game manually
  socket.on('start_game', (roomCode) => {
    const result = startGame(roomCode);
    
    if (result.error) {
      socket.emit('error', result.error);
      return;
    }
    
    io.to(roomCode).emit('game_started', result);
    startTurnTimer(io, roomCode);
  });

  // When a player makes a move
  socket.on('make_move', ({ roomCode, number }) => {
    const result = makeMove(roomCode, socket.id, number);

    if (result.error) {
      socket.emit('move_error', result.error);
      return;
    }

    // Broadcast the move to all players
    io.to(roomCode).emit('move_made', {
      room: result.room,
      number,
      playerId: socket.id,
      lines: result.lines
    });
    
    // If there's a winner, announce it
    if (result.winner) {
      const winner = result.room.players.find(p => p.id === result.winner);
      io.to(roomCode).emit('game_over', {
        winner: winner,
        room: result.room
      });
    } else {
      // Start timer for next turn
      startTurnTimer(io, roomCode);
    }
  });

  // Request current room state
  socket.on('get_room_state', (roomCode) => {
    const room = getRoom(roomCode);
    if (room) {
      socket.emit('room_state', room);
    } else {
      socket.emit('error', 'Room not found');
    }
  });

  // Reset game for rematch
  socket.on('reset_game', (roomCode) => {
    const result = resetGame(roomCode);
    
    if (result.error) {
      socket.emit('error', result.error);
      return;
    }
    
    io.to(roomCode).emit('game_reset', result);
  });

  // Chat message
  socket.on('send_message', ({ roomCode, message }) => {
    const room = getRoom(roomCode);
    if (!room) return;
    
    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;
    
    io.to(roomCode).emit('chat_message', {
      playerName: player.name,
      message,
      timestamp: Date.now()
    });
  });

  // When a player disconnects
  socket.on('disconnect', () => {
    const result = leaveRoom(socket.id);
    
    if (result && result.room) {
      // Notify remaining players
      io.to(result.roomCode).emit('player_left', result.room);
      io.to(result.roomCode).emit('room_updated', result.room);
    }
  });
}

// Timer management for turns
const turnTimers = {};

function startTurnTimer(io, roomCode) {
  // Clear existing timer if any
  if (turnTimers[roomCode]) {
    clearInterval(turnTimers[roomCode]);
  }
  
  const room = getRoom(roomCode);
  if (!room || !room.gameState.started || room.gameState.winner) {
    return;
  }
  
  let timeLeft = room.settings.turnTime;
  
  turnTimers[roomCode] = setInterval(() => {
    timeLeft--;
    
    // Broadcast time update
    io.to(roomCode).emit('turn_timer_update', timeLeft);
    
    if (timeLeft <= 0) {
      clearInterval(turnTimers[roomCode]);
      delete turnTimers[roomCode];
      
      // Auto-skip to next player
      const room = getRoom(roomCode);
      if (room && room.gameState.started && !room.gameState.winner) {
        const currentIndex = room.players.findIndex(p => p.id === room.gameState.currentTurn);
        const nextIndex = (currentIndex + 1) % room.players.length;
        room.gameState.currentTurn = room.players[nextIndex].id;
        room.gameState.turnTimeLeft = room.settings.turnTime;
        
        io.to(roomCode).emit('turn_skipped', room);
        startTurnTimer(io, roomCode);
      }
    }
  }, 1000);
}

module.exports = roomHandler;
