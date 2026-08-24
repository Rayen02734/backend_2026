const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true }, 
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  programme: { type: String, required: true, trim: true },
  quizzes: [{
    title: { type: String, required: true, trim: true },
    questions: [{
      question: { type: String, required: true, trim: true },
      options: [{ type: String, trim: true }],
      answer: { type: String, required: true, trim: true }
    }]
  }],
  attendance: { type: Number, default: 0 },
  progress: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'completed', 'pending'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Education', educationSchema);
