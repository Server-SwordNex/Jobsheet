import { api } from './client';

// Identity comes from the signed-in session; the server verifies the current password.
export function changePassword(currentPassword, newPassword) {
  return api.post('/api/security/change-password', { currentPassword, newPassword });
}

export function forgotPasswordSendOtp(email) {
  return api.post('/api/security/forgot-password/send-otp', { email }, { skipAuthRedirect: true });
}

// Resolves with { token }: a short-lived reset token required by forgotPasswordResetPassword.
export function forgotPasswordVerifyOtp(email, otp) {
  return api.post('/api/security/forgot-password/verify-otp', { email, otp }, { skipAuthRedirect: true });
}

export function forgotPasswordResetPassword(email, newPassword, token) {
  return api.post('/api/security/forgot-password/reset-password', { email, newPassword, token }, { skipAuthRedirect: true });
}
