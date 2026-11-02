import { api } from './client';
import { JOBSHEETS } from './endpoints';

export function createJobsheet(formData) {
  return api.post(JOBSHEETS.CREATE, formData);
}

export function getJobsheetsByUser(uid) {
  return api.get(JOBSHEETS.BY_USER(uid));
}

export function updateJobsheetStatus(jobsheetId, status) {
  return api.patch(JOBSHEETS.STATUS(jobsheetId), { status });
}
