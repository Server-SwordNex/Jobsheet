import { api } from './client';

export function superAdminLogin(email, password) {
  return api.post('/api/auth/superadmin-login', { email, password }, { skipAuthRedirect: true });
}

export function login(email, password, role) {
  return api.post('/api/auth/login', { email, password, role }, { skipAuthRedirect: true });
}

export function logoutUser() {
  return api.post('/api/auth/logout');
}
