import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllCertificates,
  getCertificateByIdOrQuery,
  viewCertificateWhitePage,
  downloadCertificateBinaryPdf,
  createCertificate,
  updateCertificateStatus
} from '../controllers/certController';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validate';

const router = Router();

// Public verification route for QR codes and manual serial/ID query
router.get('/public/:query', getCertificateByIdOrQuery);
router.get('/view/:query', viewCertificateWhitePage);
router.get('/download/:query.pdf', downloadCertificateBinaryPdf);
router.get('/download/:query', downloadCertificateBinaryPdf);
router.get('/pdf/:query', downloadCertificateBinaryPdf);

// Authenticated certificate listing & management
router.get('/', authenticateJWT, getAllCertificates);
router.get('/:query', authenticateJWT, getCertificateByIdOrQuery);

router.post(
  '/',
  authenticateJWT,
  authorizeRoles('administrator', 'officer', 'lmo'),
  [
    body('certificateId').trim().notEmpty().withMessage('Certificate ID is required.'),
    body('instrumentId').trim().notEmpty().withMessage('Instrument ID is required.'),
    body('owner').trim().notEmpty().withMessage('Owner name is required.')
  ],
  handleValidationErrors,
  createCertificate
);

router.put(
  '/:certificateId/status',
  authenticateJWT,
  authorizeRoles('administrator', 'officer', 'lmo'),
  [
    body('status')
      .isIn(['valid', 'expiring_soon', 'expired', 'suspended', 'condemned'])
      .withMessage('Valid status value required.')
  ],
  handleValidationErrors,
  updateCertificateStatus
);

export default router;
