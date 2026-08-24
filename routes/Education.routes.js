const express = require('express');
const router = express.Router();
const educationController = require('../controllers/Education.controller');
//crud
router.post('/', educationController.createEducation);
router.get('/', educationController.getAllEducations);
router.get('/:id', educationController.getEducationById);
router.put('/:id', educationController.updateEducation);
router.delete('/:id', educationController.deleteEducation);
//methode 
router.put('/:id/progress', educationController.trackProgress);
router.put('/:id/attendance', educationController.recordAttendance);
router.put('/:id/status', educationController.updateStatus);

module.exports = router;
