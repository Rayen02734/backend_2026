const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  transactionId: { type: String, trim: true, unique: true, sparse: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  educationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Education', required: true }, 
  amount: { type: Number, required: true, min: 0 },
  paymentDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
