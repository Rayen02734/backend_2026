const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/Payment.controller');
//crud
router.post('/', paymentController.createPayment);
router.get('/', paymentController.getAllPayments);
router.get('/:id', paymentController.getPaymentById);
router.put('/:id', paymentController.updatePayment);
router.delete('/:id', paymentController.deletePayment);
//methode
router.post('/:id/process', paymentController.processPayment);
router.put('/:id/validate', paymentController.validatePayment);
router.put('/:id/refund', paymentController.refundPayment);

module.exports = router;
