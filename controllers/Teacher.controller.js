const TeacherModel = require('../models/Teacher.model');
const EducationModel = require('../models/Education.model');


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

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const teacher = await TeacherModel.findOne({
      email: email.trim().toLowerCase(),
      password,
      login: true
    });

    if (!teacher) {
      return res.status(401).json({ success: false, message: 'Email or password is incorrect' });
    }

    res.status(200).json({ success: true, data: teacher });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.manageCourses = async (req, res) => {
  try {
    const courses = await EducationModel.find({ teacherId: req.params.id })
      .populate('students', 'name firstName email');
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    res.status(error.status || 400).json({ success: false, message: error.message });
  }
};

const findTeacherCourse = async (teacherId, courseId) => {
  const course = await EducationModel.findOne({ _id: courseId, teacherId });
  if (!course) {
    const error = new Error('Course not found for this teacher');
    error.status = 404;
    throw error;
  }
  return course;
};

exports.manageQuizzes = async (req, res) => {
  try {
    const course = await findTeacherCourse(req.params.id, req.params.courseId);
    if (req.method === 'GET') {
      return res.status(200).json({ success: true, data: course.quizzes || [] });
    }

    course.quizzes.push(req.body);
    await course.save();
    res.status(201).json({ success: true, data: course.quizzes[course.quizzes.length - 1] });
  } catch (error) {
    res.status(error.status || 400).json({ success: false, message: error.message });
  }
};

exports.joinLiveCourse = async (req, res) => {
  try {
    const course = await findTeacherCourse(req.params.id, req.params.courseId);
    res.status(200).json({
      success: true,
      message: 'Teacher joined the live course successfully',
      data: { courseId: course._id, programme: course.programme, joinedAt: new Date() }
    });
  } catch (error) {
    res.status(error.status || 400).json({ success: false, message: error.message });
  }
};

exports.manageStudentAttendance = async (req, res) => {
  try {
    const { attendance } = req.body;
    if (typeof attendance !== 'number' || attendance < 0 || attendance > 100) {
      return res.status(400).json({ success: false, message: 'Attendance must be a number between 0 and 100' });
    }
    const course = await findTeacherCourse(req.params.id, req.params.courseId);
    course.attendance = attendance;
    await course.save();
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    res.status(error.status || 400).json({ success: false, message: error.message });
  }
};

exports.trackStudentProgress = async (req, res) => {
  try {
    const { progress } = req.body;
    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return res.status(400).json({ success: false, message: 'Progress must be a number between 0 and 100' });
    }
    const course = await findTeacherCourse(req.params.id, req.params.courseId);
    course.progress = progress;
    await course.save();
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    res.status(error.status || 400).json({ success: false, message: error.message });
  }
};
