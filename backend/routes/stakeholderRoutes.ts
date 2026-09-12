import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllStakeholders,
  createStakeholder,
  updateStakeholderStatus
} from '../controllers/stakeholderController';
import { handleValidationErrors } from '../middleware/validate';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';

const router = Router();

router.get('/', authenticateJWT, authorizeRoles('administrator'), getAllStakeholders);

router.post(
  '/',
  authenticateJWT,
  authorizeRoles('administrator'),
  [
    body('enterpriseName').trim().notEmpty().withMessage('Enterprise name is required.'),
    body('ownerName').trim().notEmpty().withMessage('Owner name is required.')
  ],
  handleValidationErrors,
  createStakeholder
);

router.put('/:id/status', authenticateJWT, authorizeRoles('administrator'), [
  body('status').isIn(['Active', 'Inactive', 'Notice Issued', 'Suspended']).withMessage('Valid stakeholder status is required.')
], handleValidationErrors, updateStakeholderStatus);

export default router;
