import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllInstruments,
  getInstrumentMetrics,
  createInstrument,
  updateInstrument
} from '../controllers/instrumentController';
import { authenticateJWT } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validate';

const router = Router();

router.get('/', authenticateJWT, getAllInstruments);
router.get('/metrics', authenticateJWT, getInstrumentMetrics);

router.post(
  '/',
  authenticateJWT,
  [
    body('serialNo').trim().notEmpty().withMessage('Serial number is required.'),
    body('category').trim().notEmpty().withMessage('Category is required.')
  ],
  handleValidationErrors,
  createInstrument
);

router.put('/:id', authenticateJWT, [
  body('status').optional().isIn(['Compliant', 'Due for Renewal', 'Expiring Soon', 'Expired', 'Violation Reported']),
  body('capacity').optional().trim().isLength({ max: 100 }),
  body('location').optional().trim().isLength({ max: 500 }),
  body('accuracyClass').optional().trim().isLength({ max: 100 })
], handleValidationErrors, updateInstrument);

export default router;
