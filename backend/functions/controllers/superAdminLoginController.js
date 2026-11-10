import { validateSuperAdmin, generateToken } from '../services/superAdminLoginService.js';

export async function superadminLogin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    await validateSuperAdmin(email, password);

    const token = generateToken({ email, role: 'superadmin' });

    res.status(200).json({
      token,
      user: {
        id: 'superadmin',
        uid: 'superadmin',
        email,
        role: 'superadmin',
        username: 'Super Admin',
        companyName: 'Super Admin',
      },
    });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ error: error.message || 'Internal server error' });
  }
}
