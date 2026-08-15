const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  programme: { type: String, required: true, trim: true },
  attendance: { type: Number, default: 0 },
  progress: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'completed', 'pending'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Education', educationSchema);
