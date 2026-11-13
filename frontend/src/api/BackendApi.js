const BASE = import.meta.env.VITE_API_URL ?? '';

export const API = {
  updateProfile: (uid) => `${BASE}/api/profile/${uid}`,
  changePassword: `${BASE}/api/security/change-password`,
  getSubUsers: (uid) => `${BASE}/api/subusers/${uid}`,
  createSubUser: (uid) => `${BASE}/api/subusers/${uid}`,
  deleteSubUser: (uid) => `${BASE}/api/subusers/${uid}`,
  loadUserSupportTickets: (email) => `${BASE}/api/support/tickets/${email}`,
  submitQuery: `${BASE}/api/support/tickets`,
  getSubUserPrice: `${BASE}/api/sub-user-price`,
};
