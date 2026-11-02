import { api } from './client';
import { SUBUSERS } from './endpoints';

export function getSubusers(parentUid) {
  return api.get(SUBUSERS.GET(parentUid));
}

export function createSubuser(parentUid, data) {
  return api.post(SUBUSERS.CREATE(parentUid), data);
}

export function deleteSubuser(subUserUid) {
  return api.delete(SUBUSERS.DELETE(subUserUid));
}

export function getSubuserRecords(parentUid, subuserName = "") {
  return api.get(SUBUSERS.RECORDS(parentUid, subuserName));
}
