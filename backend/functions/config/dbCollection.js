import { getCollection } from "./firebaseTenantConfig.js";

export const USERS = "users";
export const JOBS = "jobs";
export const APPLICATIONS = "applications";
export const NOTIFICATIONS = "notifications";
export const AUDIT_LOGS = "auditLogs";

export const usersCollections = getCollection(USERS);
export const jobsCollections = getCollection(JOBS);
export const applicationsCollections = getCollection(APPLICATIONS);
export const notificationsCollections = getCollection(NOTIFICATIONS);
export const auditLogsCollections = getCollection(AUDIT_LOGS);

export const PRICING_PLANS = "pricingPlans";
export const pricingPlansCollections = getCollection(PRICING_PLANS);

export const TEMP_OTPS = "tempOtps";
export const tempOtpsCollections = getCollection(TEMP_OTPS);

export const SESSIONS = "userSessions";
export const userSessionsCollections = getCollection(SESSIONS);

export const TECHNICIANS = "technicians";
export const techniciansCollections = getCollection(TECHNICIANS);

export const JOBSHEETS = "jobsheets";
export const jobsheetsCollections = getCollection(JOBSHEETS);

export const SUBUSERS = "subusers";
export const subUsersCollection = getCollection(SUBUSERS);

export const SUPPORT_TICKETS = "supportTickets";
export const supportTicketsCollection = getCollection(SUPPORT_TICKETS);


export const ANNOUNCEMENTS = "announcements";
export const announcementsCollection = getCollection(ANNOUNCEMENTS);

export const EMAIL_OTPS = "emailOtps";
export const emailOtpsCollection = getCollection(EMAIL_OTPS);

export const SUB_USER_PRICE = "subUserPrice";
export const subUserPriceCollection = getCollection(SUB_USER_PRICE);