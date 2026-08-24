const express = require('express');
const router = express.Router();
const studentController = require('../controllers/Student.controller');

// crud
router.post('/', studentController.createStudent);
router.get('/', studentController.getAllStudents);
router.get('/:id', studentController.getStudentById);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);

// methodes
router.post('/signup', studentController.signUp);
router.post('/login', studentController.login);
router.post('/:id/purchase-course', studentController.purchaseCourse);
router.post('/:id/quiz', studentController.doQuiz);
router.post('/:id/discuss-ai', studentController.discussWithAI);
router.post('/:id/ask-ai', studentController.askQuestionToAI);
router.get('/:id/analyze-progress', studentController.analyzeProgressWithAI);
router.post('/:id/payment', studentController.makePayment);
router.post('/:id/live-course', studentController.joinLiveCourse);


module.exports = router;
