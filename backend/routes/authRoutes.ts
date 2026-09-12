import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getMe, logout } from '../controllers/authController';
import { authenticateJWT } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validate';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post(
  '/register',
  authRateLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').trim().isEmail().withMessage('A valid email is required.').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.'),
    body('role')
      .optional()
      .isIn(['owner', 'business', 'manufacturer', 'dealer', 'repairer', 'importer', 'citizen', 'administrator', 'officer'])
      .withMessage('Unsupported registration role.')
  ],
  handleValidationErrors,
  register
);

router.post(
  '/login',
  authRateLimiter,
  [
    body('email').trim().isEmail().withMessage('A valid email is required.').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required.')
  ],
  handleValidationErrors,
  login
);

router.get('/me', authenticateJWT, getMe);
router.post('/logout', logout);

export default router;
