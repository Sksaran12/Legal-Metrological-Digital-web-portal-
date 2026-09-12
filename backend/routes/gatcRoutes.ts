import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllGatcCentres,
  createGatcCentre,
  submitSecondScheduleApplication,
  getSecondScheduleApplications,
  updateSecondScheduleApplicationStatus
} from '../controllers/gatcController';
import { handleValidationErrors } from '../middleware/validate';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';

const router = Router();

// GATC Centres
router.get('/', getAllGatcCentres);
router.post(
  '/',
  authenticateJWT,
  authorizeRoles('administrator'),
  [
    body('name').trim().notEmpty().withMessage('GATC centre name is required.'),
    body('code').trim().notEmpty().withMessage('GATC centre code is required.')
  ],
  handleValidationErrors,
  createGatcCentre
);

// Second Schedule [Rule 5(1)] Applications
router.get('/applications', authenticateJWT, authorizeRoles('administrator', 'officer', 'lmo'), getSecondScheduleApplications);
router.post(
  '/applications',
  [
    body('applicantFullName').trim().notEmpty().withMessage('Applicant name is required.'),
    body('applicantAddress').trim().notEmpty().withMessage('Applicant address is required.'),
    body('contactEmail').isEmail().withMessage('Valid contact email is required.')
  ],
  handleValidationErrors,
  submitSecondScheduleApplication
);
router.put(
  '/applications/:id/status',
  authenticateJWT,
  authorizeRoles('administrator', 'officer', 'lmo'),
  updateSecondScheduleApplicationStatus
);

export default router;
