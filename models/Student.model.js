const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  firstName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  login: { type: Boolean, default: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }, // realation
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Education' }], // relation 
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
