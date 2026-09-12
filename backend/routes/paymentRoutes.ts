import { Router } from 'express';
import { body } from 'express-validator';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';
import { createPaymentOrder, handlePaymentWebhook, verifyPayment } from '../controllers/paymentController';
import { handleValidationErrors } from '../middleware/validate';

const router = Router();
router.post('/orders', authenticateJWT, authorizeRoles('owner', 'business', 'administrator'), [
  body('applicationId').optional().isMongoId(),
  body('amount').optional().isFloat({ gt: 0 }),
  body('receipt').optional().trim().isLength({ min: 1, max: 40 })
], handleValidationErrors, createPaymentOrder);
router.post('/verify', authenticateJWT, authorizeRoles('owner', 'business', 'administrator'), [
  body('razorpay_order_id').trim().notEmpty(),
  body('razorpay_payment_id').trim().notEmpty(),
  body('razorpay_signature').trim().isLength({ min: 64, max: 64 }),
  body('applicationId').optional().isMongoId()
], handleValidationErrors, verifyPayment);
router.post('/webhook', handlePaymentWebhook);
export default router;
