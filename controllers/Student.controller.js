const StudentModel = require('../models/Student.model');
const EducationModel = require('../models/Education.model');
const PaymentModel = require('../models/Payment.model');
const { askGroupUpAI } = require('../services/groupupAI.service');
const crypto = require('crypto');
const { sendLoginCode } = require('../services/email.service');

const LOGIN_OTP_DURATION_MS = 10 * 60 * 1000;

const createLoginOtp = () => String(crypto.randomInt(100000, 1000000));

const hashLoginOtp = (code) => crypto.createHash('sha256').update(code).digest('hex');

const publicStudent = (student) => {
  const data = student.toObject();
  delete data.password;
  delete data.loginOtpHash;
  delete data.loginOtpExpiresAt;
  return data;
};

exports.signUp = async (req, res) => {
  try {
    const student = await StudentModel.create(req.body);
    res.status(201).json({ success: true, data: student });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email && email.trim().toLowerCase();
    const student = await StudentModel.findOne({ email: normalizedEmail, password, login: true })
      .select('+loginOtpHash +loginOtpExpiresAt');
    if (!student) {
      return res.status(401).json({ success: false, message: 'Email or password is incorrect' });
    }

    const code = createLoginOtp();
    student.loginOtpHash = hashLoginOtp(code);
    student.loginOtpExpiresAt = new Date(Date.now() + LOGIN_OTP_DURATION_MS);
    await student.save();
    await sendLoginCode(student.email, code);

    res.status(200).json({
      success: true,
      requiresVerification: true,
      data: { studentId: student._id, email: student.email, expiresIn: 600 }
    });
  } catch (error) {
    res.status(error.status || 400).json({ success: false, message: error.message });
  }
};

exports.verifyLogin = async (req, res) => {
  try {
    const { studentId, code } = req.body;
    if (!studentId || !/^\d{6}$/.test(String(code || ''))) {
      return res.status(400).json({ success: false, message: 'studentId and a 6-digit code are required' });
    }

    const student = await StudentModel.findById(studentId).select('+loginOtpHash +loginOtpExpiresAt');
    if (!student || !student.loginOtpHash) {
      return res.status(401).json({ success: false, message: 'Verification code is invalid or expired' });
    }
    if (!student.loginOtpExpiresAt || student.loginOtpExpiresAt.getTime() < Date.now()) {
      return res.status(401).json({ success: false, message: 'Verification code is expired' });
    }
    if (hashLoginOtp(String(code)) !== student.loginOtpHash) {
      return res.status(401).json({ success: false, message: 'Verification code is incorrect' });
    }

    student.loginOtpHash = undefined;
    student.loginOtpExpiresAt = undefined;
    await student.save();
    res.status(200).json({ success: true, data: publicStudent(student) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.resendLoginCode = async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ success: false, message: 'studentId is required' });

    const student = await StudentModel.findById(studentId).select('+loginOtpHash +loginOtpExpiresAt');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const code = createLoginOtp();
    student.loginOtpHash = hashLoginOtp(code);
    student.loginOtpExpiresAt = new Date(Date.now() + LOGIN_OTP_DURATION_MS);
    await student.save();
    await sendLoginCode(student.email, code);
    res.status(200).json({ success: true, message: 'Verification code sent', expiresIn: 600 });
  } catch (error) {
    res.status(error.status || 400).json({ success: false, message: error.message });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const student = await StudentModel.create(req.body);
    res.status(201).json({ success: true, data: student });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const students = await StudentModel.find();
    res.status(200).json({ success: true, data: students });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await StudentModel.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const student = await StudentModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await StudentModel.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.status(200).json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.purchaseCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const [student, course] = await Promise.all([
      StudentModel.findById(req.params.id),
      EducationModel.findById(courseId)
    ]);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    if (!student.courses.some((id) => id.toString() === courseId)) {
      student.courses.push(course._id);
      await student.save();
    }
    if (!course.students.some((id) => id.toString() === req.params.id)) {
      course.students.push(student._id);
      await course.save();
    }
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.doQuiz = async (req, res) => {
  try {
    const student = await StudentModel.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    const { quizId, answers = [] } = req.body;
    if (!quizId) return res.status(400).json({ success: false, message: 'quizId is required' });
    res.status(200).json({ success: true, data: { studentId: student._id, quizId, answers, completedAt: new Date() } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.discussWithAI = async (req, res) => {
  try {
    if (!req.body.message) return res.status(400).json({ success: false, message: 'message is required' });
    const answer = await askGroupUpAI({ role: 'student', userId: req.params.id, message: req.body.message });
    res.status(200).json({ success: true, data: { answer } });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

exports.askQuestionToAI = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ success: false, message: 'question is required' });
    const answer = await askGroupUpAI({ role: 'student', userId: req.params.id, message: question });
    res.status(200).json({ success: true, data: { answer } });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

exports.analyzeProgressWithAI = async (req, res) => {
  try {
    const answer = await askGroupUpAI({
      role: 'student',
      userId: req.params.id,
      message: 'Analyse ma progression dans mes formations.'
    });
    res.status(200).json({ success: true, data: { answer } });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

exports.makePayment = async (req, res) => {
  try {
    const { courseId, amount } = req.body;
    const student = await StudentModel.findById(req.params.id);
    const course = await EducationModel.findById(courseId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ success: false, message: 'amount must be greater than 0' });
    }
    const payment = await PaymentModel.create({ studentId: student._id, educationId: course._id, amount, status: 'pending' });
    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.joinLiveCourse = async (req, res) => {
  try {
    const [student, course] = await Promise.all([
      StudentModel.findById(req.params.id),
      EducationModel.findById(req.body.courseId)
    ]);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.status(200).json({ success: true, data: { studentId: student._id, courseId: course._id, joinedAt: new Date() } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
