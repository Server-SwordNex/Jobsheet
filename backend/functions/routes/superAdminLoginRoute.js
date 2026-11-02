import { Router } from 'express';
import { superadminLogin } from '../controllers/superAdminLoginController.js';

const router = Router();

router.post('/api/auth/superadmin-login', superadminLogin);

export default router;
