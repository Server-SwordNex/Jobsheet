import { Timestamp } from "firebase-admin/firestore";

export const createSessionModel = (data) => {
  return {
    userId: data.userId || "",
    token: data.token || "",
    deviceInfo: data.deviceInfo || "",
    ipAddress: data.ipAddress || "",
    isActive: data.isActive !== undefined ? data.isActive : true,
    createdAt: Timestamp.now(),
    expiresAt: data.expiresAt || null,
    lastActivityAt: Timestamp.now(),
  };
};
