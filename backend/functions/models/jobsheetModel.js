import { Timestamp } from "firebase-admin/firestore";

export default class JobsheetModel {
  constructor(data = {}) {
    this.jobsheetId = data.jobsheetId || "";
    this.jobsheetNo = data.jobsheetNo || "";
    this.date = data.date || "";
    this.time = data.time || "";
    this.company = data.company || "";
    this.gstin = data.gstin || "";
    this.customer = data.customer || "";
    this.mobile = data.mobile || "";
    this.address1 = data.address1 || "";
    this.address2 = data.address2 || "";
    this.city = data.city || "";
    this.state = data.state || "";
    this.pincode = data.pincode || "";
    this.category = data.category || "";
    this.serviceType = data.serviceType || "";
    this.productName = data.productName || "";
    this.modelName = data.modelName || "";
    this.serialNumber = data.serialNumber || "";
    this.description = data.description || "";
    this.cost = Number(data.cost || 0);
    this.additionalCharges = Number(data.additionalCharges || 0);
    this.discount = Number(data.discount || 0);
    this.total = Number(data.total || 0);
    this.notes = data.notes || "";
    this.terms = data.terms || "";
    this.generatedBy = data.generatedBy || "";
    this.generatedById = data.generatedById || "";
    this.technician = data.technician || "";
    this.technicianId = data.technicianId || "";
    this.pdfLink = data.pdfLink || "";
    this.pdfStoragePath = data.pdfStoragePath || "";
    this.status = data.status || "initiated";
    this.createdAt = data.createdAt || Timestamp.now();
    this.updatedAt = data.updatedAt || Timestamp.now();
  }

  toFirestore() {
    return {
      jobsheetId: this.jobsheetId,
      jobsheetNo: this.jobsheetNo,
      date: this.date,
      time: this.time,
      company: this.company,
      gstin: this.gstin,
      customer: this.customer,
      mobile: this.mobile,
      address1: this.address1,
      address2: this.address2,
      city: this.city,
      state: this.state,
      pincode: this.pincode,
      category: this.category,
      serviceType: this.serviceType,
      productName: this.productName,
      modelName: this.modelName,
      serialNumber: this.serialNumber,
      description: this.description,
      cost: this.cost,
      additionalCharges: this.additionalCharges,
      discount: this.discount,
      total: this.total,
      notes: this.notes,
      terms: this.terms,
      generatedBy: this.generatedBy,
      generatedById: this.generatedById,
      technician: this.technician,
      technicianId: this.technicianId,
      pdfLink: this.pdfLink,
      pdfStoragePath: this.pdfStoragePath,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
