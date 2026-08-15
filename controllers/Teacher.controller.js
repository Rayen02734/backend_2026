const TeacherModel = require('../models/Teacher.model');

exports.createTeacher = async (req, res) => {
  try {
    const teacher = await TeacherModel.create(req.body);
    res.status(201).json({ success: true, data: teacher });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await TeacherModel.find();
    res.status(200).json({ success: true, data: teachers });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getTeacherById = async (req, res) => {
  try {
    const teacher = await TeacherModel.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    res.status(200).json({ success: true, data: teacher });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateTeacher = async (req, res) => {
  try {
    const teacher = await TeacherModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    res.status(200).json({ success: true, data: teacher });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteTeacher = async (req, res) => {
  try {
    const teacher = await TeacherModel.findByIdAndDelete(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    res.status(200).json({ success: true, message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
