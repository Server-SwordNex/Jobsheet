/* The plan capabilities a super admin can set (keep in step with backend/functions/utils/planCapabilities.js).
   "limit" = a number or Unlimited, "toggle" = Enabled / Disabled. */

export const LIMITS = [
  { key: "jobsheets", label: "Job sheets per month", help: "How many job sheets a business (and its team) can create each month." },
  { key: "technicians", label: "Technicians", help: "How many technicians the business can add." },
  { key: "teamMembers", label: "Team members", help: "How many sub-user logins the owner can add. Unlimited = no cap, 0 = none." },
];

export const TOGGLES = [
  { key: "customerUpdates", label: "WhatsApp updates to customers", help: "Off: no WhatsApp message is sent to the customer when a job sheet is created or completed." },
  { key: "reports", label: "Reports & team records", help: "Off: the Reports page is hidden and its data is blocked." },
  { key: "customerSearch", label: "Customer search & tracking", help: "Off: customers cannot look up this business's job sheets on the public search page." },
  { key: "prioritySupport", label: "Priority support", help: "Shown on the pricing card only." },
];

/* the form's values for a plan; a plan saved before capabilities existed keeps everything on */
export const formFromPlan = (p = {}) => {
  const caps = p.capabilities || {};
  return {
    name: p.name || "",
    billingType: p.billingType === "yearly" ? "annual" : p.billingType || "monthly",
    price: p.price ?? "",
    tagLine: p.tagLine || "",
    popular: Boolean(p.popular),
    jobsheetsUnlimited: !(Number(p.jobSheetLimit) > 0),
    jobsheets: Number(p.jobSheetLimit) > 0 ? p.jobSheetLimit : "",
    techniciansUnlimited: !(Number(p.staffLimit) > 0),
    technicians: Number(p.staffLimit) > 0 ? p.staffLimit : "",
    teamMembersUnlimited: p.subuserLimit === null,
    teamMembers: p.subuserLimit === null || p.subuserLimit === undefined ? "" : p.subuserLimit,
    customerUpdates: caps.customerUpdates?.enabled ?? true,
    reports: caps.reports?.enabled ?? true,
    customerSearch: caps.customerSearch?.enabled ?? true,
    prioritySupport: caps.prioritySupport?.enabled ?? false,
    extraFeatures: (p.extraFeatures || []).join("\n"),
  };
};

/* what is sent to the server */
export const bodyFromForm = (f) => ({
  name: f.name.trim(),
  billingType: f.billingType,
  price: f.billingType === "free" ? 0 : Number(f.price) || 0,
  tagLine: f.tagLine.trim(),
  popular: f.popular,
  jobSheetLimit: f.jobsheetsUnlimited ? 0 : Number(f.jobsheets) || 0,
  staffLimit: f.techniciansUnlimited ? 0 : Number(f.technicians) || 0,
  subuserLimit: f.teamMembersUnlimited ? null : Number(f.teamMembers) || 0,
  capabilities: {
    customerUpdates: { enabled: f.customerUpdates },
    reports: { enabled: f.reports },
    customerSearch: { enabled: f.customerSearch },
    prioritySupport: { enabled: f.prioritySupport },
  },
  extraFeatures: f.extraFeatures.split("\n").map((l) => l.trim()).filter(Boolean),
});
