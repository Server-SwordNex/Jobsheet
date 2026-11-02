import { Timestamp } from "firebase-admin/firestore";

export const createUserModel = (data) => {
  return {
    uid: data.uid || "",

    // ================= COMPANY =================

    companyName:
      data.companyName || "",

    website:
      data.website || "",

    gstin:
      data.gstin || "",

    addressLine1:
      data.addressLine1 || "",

    addressLine2:
      data.addressLine2 || "",

    city:
      data.city || "",

    state:
      data.state || "",

    pincode:
      data.pincode || "",

    // ================= USER =================

    username:
      data.username || "",

    mobileNo:
      data.mobileNo || "",

    email:
      data.email || "",

    password:
      data.password || "",

    role:
      data.role || "admin",

    // ================= JOB SHEET =================

    totalJobSheetsCreated: 0,

    // ================= PLAN =================

    plan:
      data.plan || "free",

    planPrice:
      data.planPrice || 0,

    billingType:
      data.billingType || "monthly",

    jobSheetLimit:
      data.jobSheetLimit || 0,

    staffLimit:
      data.staffLimit || 0,

    subuserLimit:
      data.subuserLimit || 0,

    currentStaffs: 0,

    // ================= PLAN DATES =================

    planStartDate:
      data.planStartDate || null,

    planEndDate:
      data.planEndDate || null,

    // ================= SUBSCRIPTION =================

    subscriptionStatus:
      data.subscriptionStatus ||
      "ACTIVE",

    subscriptionReminderHistory: {
      sevenDay: false,
      threeDay: false,
      oneDay: false,
      renewalInvoice: false,
      expired: false,
    },

    // ================= SETTINGS =================

    jobSheetPrefix:
      data.jobSheetPrefix || "JS",

    jobSheetSuffix:
      data.jobSheetSuffix || "001",

    terms:
      data.terms || "",

    // ================= AUTH =================

    isGoogleAuth:
      data.isGoogleAuth || false,

    termsAccepted:
      data.termsAccepted || false,

    isVerified:
      data.isVerified || false,

    // ================= COMMON =================

    createdAt:
      Timestamp.now(),

    updatedAt:
      Timestamp.now(),
  };
};