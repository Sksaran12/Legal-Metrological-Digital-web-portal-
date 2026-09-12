import { Router } from 'express';
import { body } from 'express-validator';
import { getAllOfficers, createOfficer, updateOfficer } from '../controllers/officerController';
import { handleValidationErrors } from '../middleware/validate';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';

const router = Router();

router.get('/', authenticateJWT, authorizeRoles('administrator'), getAllOfficers);

router.post(
  '/',
  authenticateJWT,
  authorizeRoles('administrator'),
  [
    body('name').trim().notEmpty().withMessage('Officer name is required.'),
    body('badgeNo').trim().notEmpty().withMessage('Badge number is required.')
  ],
  handleValidationErrors,
  createOfficer
);

router.put('/:id', authenticateJWT, authorizeRoles('administrator'), updateOfficer);

export default router;
