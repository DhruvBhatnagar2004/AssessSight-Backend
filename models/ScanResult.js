const mongoose = require('mongoose');

const ScanResultSchema = new mongoose.Schema({
  url: { type: String, required: true },
  issues: { type: Array, required: true },
  documentTitle: String,
  pageUrl: String,
  score: Number,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ScanResult', ScanResultSchema);
