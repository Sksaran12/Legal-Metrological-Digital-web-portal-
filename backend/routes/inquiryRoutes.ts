import { Router } from 'express';
import { body } from 'express-validator';
import {
  createInquiry,
  getAllInquiries,
  updateInquiryStatus
} from '../controllers/inquiryController';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validate';

const router = Router();

// Public submission route
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Legal name is required.'),
    body('email').isEmail().withMessage('Valid email address is required.'),
    body('message').trim().notEmpty().withMessage('Message particulars are required.')
  ],
  handleValidationErrors,
  createInquiry
);

// Authenticated administration routes
router.get('/', authenticateJWT, authorizeRoles('administrator', 'officer', 'lmo'), getAllInquiries);
router.put('/:id/status', authenticateJWT, authorizeRoles('administrator', 'officer', 'lmo'), updateInquiryStatus);

export default router;
