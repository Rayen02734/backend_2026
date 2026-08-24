const StudentModel = require('../models/Student.model');
const EducationModel = require('../models/Education.model');
const PaymentModel = require('../models/Payment.model');

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
    const student = await StudentModel.findOne({ email, password, login: true });
    if (!student) {
      return res.status(401).json({ success: false, message: 'Email or password is incorrect' });
    }
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
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
    const student = await StudentModel.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    if (!req.body.message) return res.status(400).json({ success: false, message: 'message is required' });
    res.status(200).json({ success: true, data: `Bonjour ${student.firstName}, votre message a bien ete recu.` });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.askQuestionToAI = async (req, res) => {
  try {
    const student = await StudentModel.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    const { question } = req.body;
    if (!question) return res.status(400).json({ success: false, message: 'question is required' });
    res.status(200).json({ success: true, data: `Question recue : ${question}` });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.analyzeProgressWithAI = async (req, res) => {
  try {
    const student = await StudentModel.findById(req.params.id).populate('courses');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    const totalProgress = student.courses.reduce((total, course) => total + (course.progress || 0), 0);
    const progress = student.courses.length ? Math.round(totalProgress / student.courses.length) : 0;
    res.status(200).json({ success: true, data: `Progression moyenne de ${progress}% sur ${student.courses.length} cours.` });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
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
