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
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// 🟢 MongoDB Connect
connectDB();

// 🛡️ Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🛣️ Routes
app.use('/api', require('./src/routes/auth.route'));
app.use('/api', require('./src/routes/chat.route'));

// 🧠 Socket Logic
const userSocketMap = {};

io.on('connection', (socket) => {
  console.log('🟢 Socket connected:', socket.id);

  socket.on('register', (userId) => {
    userSocketMap[userId] = socket.id;
    console.log(`📍 Registered ${userId} -> ${socket.id}`);
  });

  socket.on('private message', async ({ senderId, receiverId, message }) => {
    try {
      const newMsg = await Message.create({ senderId, receiverId, message });

      const receiverSocket = userSocketMap[receiverId];
      if (receiverSocket) {
        io.to(receiverSocket).emit('private message', { senderId, message });
      }

      socket.emit('private message', { senderId, message });
    } catch (err) {
      console.error('❌ Socket Error:', err.message);
    }
  });

  socket.on('disconnect', () => {
    for (let userId in userSocketMap) {
      if (userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
        break;
      }
    }
    console.log('🔴 Socket disconnected:', socket.id);
  });
});

// 🚀 Start server
server.listen(process.env.PORT, () => {
  console.log(`🚀 Server: http://localhost:${process.env.PORT}`);
});


