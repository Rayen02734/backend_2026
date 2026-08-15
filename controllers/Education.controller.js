const EducationModel = require('../models/Education.model');

exports.createEducation = async (req, res) => {
  try {
    const education = await EducationModel.create(req.body);
    res.status(201).json({ success: true, data: education });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllEducations = async (req, res) => {
  try {
    const educations = await EducationModel.find().populate('studentId').populate('teacherId');
    res.status(200).json({ success: true, data: educations });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getEducationById = async (req, res) => {
  try {
    const education = await EducationModel.findById(req.params.id).populate('studentId').populate('teacherId');
    if (!education) {
      return res.status(404).json({ success: false, message: 'Education not found' });
    }
    res.status(200).json({ success: true, data: education });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateEducation = async (req, res) => {
  try {
    const education = await EducationModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('studentId').populate('teacherId');
    if (!education) {
      return res.status(404).json({ success: false, message: 'Education not found' });
    }
    res.status(200).json({ success: true, data: education });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteEducation = async (req, res) => {
  try {
    const education = await EducationModel.findByIdAndDelete(req.params.id);
    if (!education) {
      return res.status(404).json({ success: false, message: 'Education not found' });
    }
    res.status(200).json({ success: true, message: 'Education deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
