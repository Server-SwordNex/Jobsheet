import { api } from './client';

export function changePassword(email, newPassword, uid) {
  return api.post('/api/security/change-password', { email, newPassword, uid });
}

export function forgotPasswordSendOtp(email) {
  return api.post('/api/security/forgot-password/send-otp', { email });
}

export function forgotPasswordVerifyOtp(email, otp) {
  return api.post('/api/security/forgot-password/verify-otp', { email, otp });
}

export function forgotPasswordResetPassword(email, newPassword) {
  return api.post('/api/security/forgot-password/reset-password', { email, newPassword });
}
