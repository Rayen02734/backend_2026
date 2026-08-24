const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/Teacher.controller');

router.post('/', teacherController.createTeacher);
router.get('/', teacherController.getAllTeachers);
router.get('/:id', teacherController.getTeacherById);
router.put('/:id', teacherController.updateTeacher);
router.delete('/:id', teacherController.deleteTeacher);
router.get('/:id/courses', teacherController.manageCourses);
router.get('/:id/courses/:courseId/quizzes', teacherController.manageQuizzes);
router.post('/:id/courses/:courseId/quizzes', teacherController.manageQuizzes);
router.post('/:id/courses/:courseId/live', teacherController.joinLiveCourse);
router.put('/:id/courses/:courseId/attendance', teacherController.manageStudentAttendance);
router.put('/:id/courses/:courseId/progress', teacherController.trackStudentProgress);

module.exports = router;
