require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const researchCellRoutes = require('./routes/researchCellRoutes');
const proposalRoutes = require('./routes/proposalRoutes');
const userRoutes = require('./routes/userRoutes');
const noticeRoutes = require('./routes/noticeRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

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

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});