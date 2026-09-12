import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  assignOfficer,
  submitVerification,
  deleteApplication
} from '../controllers/appController';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validate';

const router = Router();

router.get('/', authenticateJWT, getAllApplications);
router.get('/:id', authenticateJWT, getApplicationById);

router.post(
  '/',
  authenticateJWT,
  authorizeRoles('owner', 'business', 'administrator'),
  [
    body('enterpriseName').trim().notEmpty().withMessage('Enterprise name is required.'),
    body('equipmentName').trim().notEmpty().withMessage('Equipment name is required.')
  ],
  handleValidationErrors,
  createApplication
);

router.put('/:id', authenticateJWT, [
  body('status').optional().isIn(['DRAFT', 'SUBMITTED', 'UNDER REVIEW', 'ASSIGNED', 'SCHEDULED', 'UNDER VERIFICATION', 'VERIFIED', 'CERTIFICATE ISSUED', 'FAIL', 'ADJUSTMENT/REPAIR', 'RE-VERIFICATION']),
  body('gpsCoordinates').optional().isString().trim().isLength({ max: 200 }),
  body('notes').optional().isString().trim().isLength({ max: 2000 })
], handleValidationErrors, updateApplication);

router.put('/assign/:id', authenticateJWT, authorizeRoles('administrator', 'officer', 'lmo'), assignOfficer);
router.patch('/assign/:id', authenticateJWT, authorizeRoles('administrator', 'officer', 'lmo'), assignOfficer);
router.put('/:id/assign', authenticateJWT, authorizeRoles('administrator', 'officer', 'lmo'), assignOfficer);
router.patch('/:id/assign', authenticateJWT, authorizeRoles('administrator', 'officer', 'lmo'), assignOfficer);

const verificationValidation = [
  body('maxCapacity').isFloat({ gt: 0 }),
  body('eInterval').isFloat({ gt: 0 }),
  body('dDivision').optional().isFloat({ gt: 0 }),
  body('accuracyClass').trim().notEmpty(),
  body('repeatability').isObject(),
  body('repeatability.testLoad').isFloat({ min: 0 }),
  body('repeatability.observedError').isFloat(),
  body('eccentricity').isObject(),
  body('eccentricity.testLoad').isFloat({ min: 0 }),
  body('eccentricity.observedError').isFloat(),
  body('linearity').isObject(),
  body('linearity.testLoad').isFloat({ min: 0 }),
  body('linearity.observedError').isFloat(),
  body('remarks').optional().trim().isLength({ max: 2000 })
];

router.post('/verify/:id', authenticateJWT, authorizeRoles('officer', 'lmo', 'gatc', 'administrator'), verificationValidation, handleValidationErrors, submitVerification);
router.post('/:id/verify', authenticateJWT, authorizeRoles('officer', 'lmo', 'gatc', 'administrator'), verificationValidation, handleValidationErrors, submitVerification);

router.delete('/:id', authenticateJWT, authorizeRoles('administrator'), deleteApplication);

export default router;
