require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const researchCellRoutes = require('./routes/researchCellRoutes');
const proposalRoutes = require('./routes/proposalRoutes');
const userRoutes = require('./routes/userRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Import Chat Models and Controllers
const Message = require('./models/Message');
const Proposal = require('./models/Proposal');
const User = require('./models/User');

const app = express();
const httpServer = http.createServer(app); // Create HTTP server from Express app
const PORT = process.env.PORT || 5000;

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Allow your frontend to connect
    methods: ["GET", "POST"]
  }
});

app.set('socketio', io);

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/researchcells', researchCellRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/upload', uploadRoutes);

// Socket.io Logic
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a chat room (based on proposal ID)
  socket.on('joinRoom', async (proposalId) => {
    socket.join(proposalId);
    console.log(`User ${socket.id} joined room: ${proposalId}`);

    // Optionally, send previous messages to the user who just joined
    try {
      const messages = await Message.find({ proposal: proposalId })
        .populate('sender', 'name email')
        .sort({ createdAt: 1 });
      socket.emit('messageHistory', messages);
    } catch (error) {
      console.error('Error fetching message history:', error);
    }
  });

  // Handle new messages
  socket.on('sendMessage', async ({ senderId, proposalId, content, fileUrl, fileType }) => {
    try {
      // Basic Authorization: Check if sender is part of the proposal group
      const proposal = await Proposal.findById(proposalId);
      if (!proposal) {
        console.log('Proposal not found for message');
        return;
      }

      const isMember = proposal.members.includes(senderId);
      const isSupervisor = proposal.supervisorId.toString() === senderId;

      if (!isMember && !isSupervisor) {
        console.log(`User ${senderId} is not authorized to send messages to proposal ${proposalId}`);
        return;
      }

      const newMessage = new Message({
        sender: senderId,
        proposal: proposalId,
        content,
        fileUrl,
        fileType,
      });

      await newMessage.save();

      // Populate sender details before emitting
      const populatedMessage = await newMessage.populate('sender', 'name email');

      io.to(proposalId).emit('newMessage', populatedMessage);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
