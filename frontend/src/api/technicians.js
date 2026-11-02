import { api } from './client';
import { TECHNICIANS } from './endpoints';

export function getTechnicians() {
  return api.get(TECHNICIANS.LIST);
}

export function getTechnician(id) {
  return api.get(TECHNICIANS.BY_ID(id));
}

export function getTechniciansByUser(uid) {
  return api.get(TECHNICIANS.BY_USER(uid));
}

export function addTechnician(data) {
  return api.post(TECHNICIANS.CREATE, data);
}

export function editTechnician(id, data) {
  return api.put(TECHNICIANS.BY_ID(id), data);
}

export function removeTechnician(id) {
  return api.delete(TECHNICIANS.BY_ID(id));
}

export function getTechnicianWithJobsheets(id) {
  return api.get(TECHNICIANS.JOBS(id));
}
