/* The fixed catalog of plan capabilities (pure code, no database access).

   This list is code, not data: the super admin can only set a VALUE for one of these keys
   (a number for a "limit", on/off for a "toggle"). A capability only exists once a developer
   adds it here AND wires up what it controls.

   The three limits stay on the plan itself because the rest of the app already uses them:
     jobSheetLimit  job sheets a business may create per month   (0 = unlimited)
     staffLimit     technicians a business may add               (0 = unlimited)
     subuserLimit   team members (sub-users) a business may add  (null = unlimited, 0 = none)
   Every on/off feature lives in plan.capabilities. */

export const CAPABILITIES = [
  { key: "jobsheets", type: "limit", planField: "jobSheetLimit", unit: "job sheets / month", enforced: true,
    label: "Job sheets", help: "How many job sheets a business can create each month (team members' count too). Unlimited = no cap." },
  { key: "technicians", type: "limit", planField: "staffLimit", unit: "technicians", enforced: true,
    label: "Technicians", help: "How many technicians the business can add. Unlimited = no cap." },
  { key: "teamMembers", type: "limit", planField: "subuserLimit", unit: "team members", enforced: true,
    label: "Team members", help: "How many sub-user logins the owner can add. Unlimited = no cap, 0 = none." },
  { key: "customerUpdates", type: "toggle", enforced: true,
    label: "WhatsApp updates to customers", help: "Off: no WhatsApp message is sent to the customer when a job sheet is created or completed." },
  { key: "reports", type: "toggle", enforced: true,
    label: "Reports & team records", help: "Off: the Reports page is hidden and its data is blocked." },
  { key: "customerSearch", type: "toggle", enforced: true,
    label: "Customer search & tracking", help: "Off: customers cannot look up this business's job sheets on the public search page." },
  { key: "prioritySupport", type: "toggle", enforced: false,
    label: "Priority support", help: "Shown on the pricing card only. Support priority is a human process." },
];

export const CAPABILITY_KEYS = CAPABILITIES.map((c) => c.key);

export const TOGGLE_KEYS = CAPABILITIES.filter((c) => c.type === "toggle").map((c) => c.key);

/* Everything is on unless the plan says otherwise (priority support was never implied). */
const TOGGLE_DEFAULT = { prioritySupport: false };

/** Cleans whatever was stored/sent into { <toggle>: { enabled } } */
export const normalizeCapabilities = (raw = {}) => {
  const out = {};
  for (const key of TOGGLE_KEYS) {
    const given = raw?.[key]?.enabled;
    out[key] = { enabled: given === undefined ? TOGGLE_DEFAULT[key] ?? true : Boolean(given) };
  }
  return out;
};

/** null (unlimited) or a whole number >= 0 */
export const toTeamLimit = (value) =>
  value === null || value === undefined || value === "" ? null : Math.max(0, Math.floor(Number(value) || 0));

/** Lines shown on pricing cards, built from the plan's numbers and toggles (disabled toggles are left out). */
export const featureLines = (plan = {}) => {
  const caps = normalizeCapabilities(plan.capabilities);
  const lines = [];

  const jobsheets = Number(plan.jobSheetLimit || 0);
  lines.push(jobsheets > 0 ? `Up to ${jobsheets} job sheets / month` : "Unlimited job sheets");

  const technicians = Number(plan.staffLimit || 0);
  lines.push(technicians > 0 ? `Up to ${technicians} technician${technicians === 1 ? "" : "s"}` : "Unlimited technicians");

  const team = toTeamLimit(plan.subuserLimit);
  if (team === null) lines.push("Unlimited team members");
  else if (team > 0) lines.push(`${team} team member${team === 1 ? "" : "s"}`);

  if (caps.customerUpdates.enabled) lines.push("WhatsApp updates to customers");
  if (caps.reports.enabled) lines.push("Reports & team records");
  if (caps.customerSearch.enabled) lines.push("Customer search & tracking");
  if (caps.prioritySupport.enabled) lines.push("Priority support");

  return lines;
};
