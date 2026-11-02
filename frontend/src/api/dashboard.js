import { api } from './client';

export function getDashboardData(uid, subuserId) {
  const params = subuserId ? `?subuserId=${subuserId}` : '';
  return api.get(`/api/dashboard/${uid}${params}`);
}
