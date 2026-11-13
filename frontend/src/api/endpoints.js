export const AUTH = {
  LOGIN:     '/api/auth/login',
  LOGOUT:    '/api/auth/logout',
  REGISTER:  '/api/auth/register',
  VERIFY:    '/api/auth/verify',
  SEND_OTP:  '/api/auth/send-otp',
  VERIFY_OTP:'/api/auth/verify-otp',
};

export const JOBSHEETS = {
  LIST:      '/api/jobsheets',
  CREATE:    '/api/jobsheets',
  DRAFT:     '/api/jobsheets/draft',
  BY_ID:     (id) => `/api/jobsheets/${id}`,
  BY_USER:   (uid) => `/api/jobsheets/user/${uid}`,
  STATUS:    (id) => `/api/jobsheets/${id}/status`,
};

export const DASHBOARD = {
  BY_USER: (uid) => `/api/dashboard/${uid}`,
};

export const COMPANY = {
  DETAILS: '/api/company',
};

export const TECHNICIANS = {
  LIST:   '/api/technicians',
  CREATE: '/api/technicians',
  BY_ID:  (id) => `/api/technicians/${id}`,
  BY_USER:(uid) => `/api/technicians/user/${uid}`,
  JOBS:   (id) => `/api/technicians/${id}/jobs`,
};

export const SUBUSERS = {
  CREATE: (parentUid) => `/api/subusers/${parentUid}`,
  DELETE: (subUserUid) => `/api/subusers/${subUserUid}`,
  GET:    (parentUid) => `/api/subusers/${parentUid}`,
  RECORDS:(parentUid, subuserName) => `/api/subusers/records/${parentUid}${subuserName ? `?subuserName=${encodeURIComponent(subuserName)}` : ''}`,
};

export const SUPPORT = {
  CREATE:        '/api/support/tickets',
  LIST_ALL:      '/api/support/tickets/all',
  GET:           (email) => `/api/support/tickets/${email}`,
  UPDATE_STATUS: (ticketId) => `/api/support/tickets/${ticketId}/status`,
};

export const PROFILE = {
  UPDATE:   (uid) => `/api/profile/${uid}`,
  BRANDING: (uid) => `/api/profile/${uid}/branding`,
};

export const ANNOUNCEMENTS = {
  CREATE:      '/api/create-announcement',
  GET_ALL:     (role) => `/api/getall-announcements?role=${role}`,
  TOGGLE:      (id) => `/api/toggle-announcement/${id}`,
  DELETE:      (id) => `/api/delete-announcement/${id}`,
  GET_BY_ROLE: (role) => `/api/announcements?role=${role}`,
};

import { api } from './client';

export function createAnnouncement(data) {
  return api.post(ANNOUNCEMENTS.CREATE, data);
}

export function getAllAnnouncements(role) {
  return api.get(ANNOUNCEMENTS.GET_ALL(role));
}

export function toggleAnnouncement(id) {
  return api.put(ANNOUNCEMENTS.TOGGLE(id));
}

export function deleteAnnouncement(id) {
  return api.delete(ANNOUNCEMENTS.DELETE(id));
}

export function getAnnouncementsByRole(role) {
  return api.get(ANNOUNCEMENTS.GET_BY_ROLE(role));
}

export const PLANS = {
  LIST:      '/api/plans',
  CREATE:    '/api/plans',
  BY_ID:      (id) => `/api/plans/${id}`,
};

export function getPlans() {
  return api.get(PLANS.LIST);
}

export function getPlan(id) {
  return api.get(PLANS.BY_ID(id));
}

export function addPlan(data) {
  return api.post(PLANS.CREATE, data);
}

export function editPlan(id, data) {
  return api.put(PLANS.BY_ID(id), data);
}

export function removePlan(id) {
  return api.delete(PLANS.BY_ID(id));
}

export function getSubUserPrice() {
  return api.get('/api/sub-user-price');
}

export function updateSubUserPrice(pricePerSubUser) {
  return api.put('/api/sub-user-price', { pricePerSubUser });
}

export function sendOtp(email) {
  return api.post(AUTH.SEND_OTP, { email }, { skipAuthRedirect: true });
}

export function verifyOtp(email, otp) {
  return api.post(AUTH.VERIFY_OTP, { email, otp }, { skipAuthRedirect: true });
}

export function getPlatformSettings() {
  return api.get('/api/superadmin/settings');
}

export function updatePlatformSettings(body) {
  return api.put('/api/superadmin/settings', body);
}

export const SUPERADMIN = {
  USERS_DETAILS: '/api/superadmin/users/all-details',
};

export function getSuperAdminUsersDetails() {
  return api.get(SUPERADMIN.USERS_DETAILS);
}

export const PUBLIC = {
  SEARCH_JOBSHEET: (jobId, mobileNumber, name) =>
    `/api/jobsheets/search?jobId=${encodeURIComponent(jobId)}&mobileNumber=${encodeURIComponent(mobileNumber)}${name ? `&name=${encodeURIComponent(name)}` : ''}`,
};

export function searchJobsheet(jobId, mobileNumber, name) {
  return api.get(PUBLIC.SEARCH_JOBSHEET(jobId, mobileNumber, name), { skipAuthRedirect: true });
}


