import { Timestamp } from "firebase-admin/firestore";

export default class TechnicianModel {
  constructor(data = {}) {
    this.id = data.id || "";
    this.name = data.name || "";
    this.email = data.email || "";
    this.mobileNo = data.mobileNo || "";
    this.technicianOf = data.technicianOf || "";
    this.totalAssignedJobs = Number(data.totalAssignedJobs || 0);
    this.assignedJobsheets = Array.isArray(data.assignedJobsheets) ? data.assignedJobsheets : [];
    this.createdAt = data.createdAt || Timestamp.now();
    this.updatedAt = data.updatedAt || Timestamp.now();
  }

  toFirestore() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      mobileNo: this.mobileNo,
      technicianOf: this.technicianOf,
      totalAssignedJobs: this.totalAssignedJobs,
      assignedJobsheets: this.assignedJobsheets,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
