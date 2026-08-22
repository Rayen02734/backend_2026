const AdminModel = require('../models/Admin.model');
const StudentModel = require('../models/Student.model');
const TeacherModel = require('../models/Teacher.model');
const EducationModel = require('../models/Education.model');
const PaymentModel = require('../models/Payment.model');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await AdminModel.findOne({ email, password });

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Email or password is incorrect' });
    }

    res.status(200).json({ success: true, data: admin });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.managePayments = async (req, res) => {
  try {
    const payments = await PaymentModel.find()
      .populate('studentId', 'name firstName email')
      .populate('educationId', 'programme');
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.manageCourses = async (req, res) => {
  try {
    const courses = await EducationModel.find().populate('teacherId', 'name firstName email');
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.manageUsers = async (req, res) => {
  try {
    const [students, teachers] = await Promise.all([
      StudentModel.find(),
      TeacherModel.find()
    ]);
    res.status(200).json({ success: true, data: { students, teachers } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.viewStatistics = async (req, res) => {
  try {
    const [admins, students, teachers, courses, payments] = await Promise.all([
      AdminModel.countDocuments(),
      StudentModel.countDocuments(),
      TeacherModel.countDocuments(),
      EducationModel.countDocuments(),
      PaymentModel.countDocuments()
    ]);
    res.status(200).json({
      success: true,
      data: { admins, students, teachers, courses, payments }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const admin = await AdminModel.create(req.body);
    res.status(201).json({ success: true, data: admin });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await AdminModel.find();
    res.status(200).json({ success: true, data: admins });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAdminById = async (req, res) => {
  try {
    const admin = await AdminModel.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    res.status(200).json({ success: true, data: admin });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const admin = await AdminModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    res.status(200).json({ success: true, data: admin });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const admin = await AdminModel.findByIdAndDelete(req.params.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    res.status(200).json({ success: true, message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
