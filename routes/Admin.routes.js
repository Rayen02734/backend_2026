const express = require('express');
const router = express.Router();
const adminController = require('../controllers/Admin.controller');


router.post('/', adminController.createAdmin);
router.get('/', adminController.getAllAdmins);
router.get('/:id',adminController.getAdminById);
router.put('/:id', adminController.updateAdmin);
router.delete('/:id', adminController.deleteAdmin);

router.post('/login', adminController.login);
router.get('/payments', adminController.managePayments);
router.get('/courses', adminController.manageCourses);
router.get('/users', adminController.manageUsers);
router.get('/statistics', adminController.viewStatistics);

module.exports = router;
