import { validateSuperAdmin, generateToken } from '../services/superAdminLoginService.js';

export function superadminLogin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    validateSuperAdmin(email, password);

    const token = generateToken({ email, role: 'superadmin' });

    res.status(200).json({
      token,
      user: { email, role: 'superadmin' },
    });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ error: error.message || 'Internal server error' });
  }
}
