const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000", // Replace with your React app's URL
    methods: ["GET", "POST"]
  }
});

const rooms = {};

io.on('connection', (socket) => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    rooms[roomId] = rooms[roomId] || { users: {} };
    rooms[roomId].users[userId] = userId;

    // Broadcast to everyone in the room that a new user has joined
    io.to(roomId).emit('user-connected', userId);

    socket.on('offer', (data) => {
      io.to(data.roomId).emit('offer', data);
    });

    socket.on('answer', (data) => {
      io.to(data.roomId).emit('answer', data);
    });

    socket.on('ice-candidate', (data) => {
      io.to(data.roomId).emit('ice-candidate', data);
    });

    socket.on('disconnect', () => {
      delete rooms[roomId].users[userId];
      io.to(roomId).emit('user-disconnected', userId);
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
