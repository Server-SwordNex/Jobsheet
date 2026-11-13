import { Timestamp } from "firebase-admin/firestore";

export const createSessionModel = (data) => {
  return {
    userId: data.userId || "",
    deviceInfo: data.deviceInfo || "",
    ipAddress: data.ipAddress || "",
    isActive: data.isActive !== undefined ? data.isActive : true,
    createdAt: Timestamp.now(),
    expiresAt: data.expiresAt || null,
    lastActivityAt: Timestamp.now(),
  };
};
