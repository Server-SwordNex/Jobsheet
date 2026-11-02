import { Timestamp } from "firebase-admin/firestore";

export const createSubuserModel = (data) => {
  return {
    uid: data.uid || "",
    parentUserId: data.parentUserId || "",
    role: data.role || "team",
    empId: data.empId || "",
    password: data.password || "",

    jobSheetGenerated: Number(data.jobSheetGenerated || 0),

    // Aligned fields with userModel
    username: data.username || data.subUserName || "",
    mobileNo: data.mobileNo || data.phone || "",
    companyName: data.companyName || data.businessName || "",

    // Compatibility fields with frontend
    subUserName: data.subUserName || data.username || "",
    phone: data.phone || data.mobileNo || "",
    businessName: data.businessName || data.companyName || "",

    // Fields aligned with jobsheet model
    company: data.company || data.companyName || "",
    address1: data.address1 || data.addressLine1 || "",
    address2: data.address2 || data.addressLine2 || "",
    website: data.website || "",

    invoicesGenerated: Number(data.invoicesGenerated || 0),
    subBranchName: data.subBranchName || "",
    addressLine1: data.addressLine1 || "",
    addressLine2: data.addressLine2 || "",
    city: data.city || "",
    state: data.state || "",
    pincode: data.pincode || "",
    ownedBy: data.ownedBy || "",
    gstin: data.gstin || "",
    pan: data.pan || "",
    jobSheetPrefix: data.jobSheetPrefix || "JS",
    jobSheetSuffix: data.jobSheetSuffix || "001",
    terms: data.terms || "",
    createdAt: data.createdAt || Timestamp.now(),
    updatedAt: data.updatedAt || Timestamp.now(),
  };
};
