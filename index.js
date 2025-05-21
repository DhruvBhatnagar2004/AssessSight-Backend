// Express server setup for Website Accessibility Analyzer
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Fixed missing closing parenthesis

// MongoDB connection (update URI as needed)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/webanalyzer';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Mount routers
const scanRouter = require('./scan');
const historyRouter = require('./history');
const authRouter = require('./auth');

app.use('/api/scan', scanRouter);
app.use('/api/history', historyRouter);
app.use('/api/auth', authRouter);

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
