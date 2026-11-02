import { api } from './client';
import { PROFILE } from './endpoints';

export function updateProfile(uid, data) {
  return api.put(PROFILE.UPDATE(uid), data);
}

export function getBrandingImages(uid) {
  return api.get(PROFILE.BRANDING(uid));
}
