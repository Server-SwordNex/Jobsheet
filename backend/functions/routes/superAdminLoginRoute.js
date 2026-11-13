import { Router } from 'express';
import { superadminLogin } from '../controllers/superAdminLoginController.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = Router();

const superAdminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts. Please try again in a few minutes.',
});

router.post('/api/auth/superadmin-login', superAdminLimiter, superadminLogin);

export default router;
