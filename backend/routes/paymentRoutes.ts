import { Router } from 'express';
import { body } from 'express-validator';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';
import { createPaymentOrder, handlePaymentWebhook, verifyPayment } from '../controllers/paymentController';
import { handleValidationErrors } from '../middleware/validate';

const router = Router();
router.post('/orders', authenticateJWT, authorizeRoles('owner', 'business', 'administrator'), [
  body('applicationId').isMongoId().withMessage('A valid application ID is required.')
], handleValidationErrors, createPaymentOrder);
router.post('/verify', authenticateJWT, authorizeRoles('owner', 'business', 'administrator'), [
  body('razorpay_order_id').trim().notEmpty(),
  body('razorpay_payment_id').trim().notEmpty(),
  body('razorpay_signature').trim().isLength({ min: 64, max: 64 }),
  body('applicationId').isMongoId().withMessage('A valid application ID is required.')
], handleValidationErrors, verifyPayment);
router.post('/webhook', handlePaymentWebhook);
export default router;
