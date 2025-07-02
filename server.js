const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');
const connectDB = require('./src/database/database');
require('dotenv').config();

const Message = require('./src/models/message.model');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", credentials: true },
});

connectDB();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', require('./src/routes/auth.route'));
app.use('/api', require('./src/routes/chat.route'));

const userSocketMap = {};

io.on('connection', (socket) => {
  socket.on('register', (userId) => {
    userSocketMap[userId] = socket.id;
  });

  socket.on('private message', async ({ senderId, receiverId, message }) => {
    try {
      const newMsg = new Message({ senderId, receiverId, message });
      const saved = await newMsg.save();

      const receiverSocket = userSocketMap[receiverId];
      const senderSocket = userSocketMap[senderId];

      if (receiverSocket) io.to(receiverSocket).emit('private message', saved);
      if (senderSocket) io.to(senderSocket).emit('private message', saved);

    } catch (error) {
      console.error('❌ Socket message error:', error);
    }
  });

  socket.on('disconnect', () => {
    for (let userId in userSocketMap) {
      if (userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
        break;
      }
    }
  });
});

server.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
});