import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllAlerts,
  createAlertOrGrievance,
  updateAlertStatus
} from '../controllers/alertController';
import { handleValidationErrors } from '../middleware/validate';
import { reportRateLimiter } from '../middleware/rateLimiter';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';

const router = Router();

router.get('/', authenticateJWT, authorizeRoles('administrator', 'officer', 'lmo'), getAllAlerts);

router.post(
  '/',
  reportRateLimiter,
  [
    body('type').trim().notEmpty().withMessage('Alert / Complaint type is required.'),
    body('entityName').trim().notEmpty().withMessage('Entity name is required.')
  ],
  handleValidationErrors,
  createAlertOrGrievance
);

router.put(
  '/:id',
  authenticateJWT,
  authorizeRoles('administrator', 'officer', 'lmo'),
  updateAlertStatus
);

export default router;
