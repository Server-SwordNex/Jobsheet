import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env.local (never deployed) holds secrets for local runs and wins over .env.
// Variables already in the environment (e.g. Secret Manager values) always win.
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

// Values are read lazily (getters) so import order can never freeze an empty value.
// Secrets (bound to the function in index.js) use JOBSHEET_* names; the shared
// SwordNex super admin login is used when present. Older names remain as fallbacks
// for local development.
export const config = {
  get superadminEmail() {
    return process.env.SWORDNEX_SUPERADMIN_USERNAME || process.env.SUPERADMIN_EMAIL || process.env.SUPER_ADMIN_EMAIL;
  },
  get superadminPassword() {
    return process.env.SWORDNEX_SUPERADMIN_PASSWORD || process.env.SUPERADMIN_PASSWORD || process.env.SUPER_ADMIN_PASSWORD;
  },
  get jwtSecret() {
    return process.env.JOBSHEET_JWT_SECRET || process.env.JWT_SECRET;
  },
  // Shared SwordNex login: accounts live in the project-wide Firebase Auth pool, so one
  // email + password works across the SwordNex apps. Off = Jobsheet-only accounts.
  get sharedLogin() {
    return String(process.env.JOBSHEET_SHARED_LOGIN || '').toLowerCase() === 'true';
  },
  // the public Firebase web API key (it is in every web bundle; not a secret)
  get webApiKey() {
    return process.env.FB_WEB_API_KEY;
  },
  get jwtExpiresIn() {
    return process.env.JWT_EXPIRES_IN || '7d';
  },
  get myappRoot() {
    return process.env.MYAPP_ROOT;
  },
  get myappTenantId() {
    return process.env.MYAPP_TENANT_ID;
  },
  get smtpHost() {
    return process.env.SMTP_HOST;
  },
  get smtpPort() {
    return parseInt(process.env.SMTP_PORT || '587', 10);
  },
  get emailUser() {
    return process.env.SMTP_USER || process.env.EMAIL_USER;
  },
  get emailPass() {
    return process.env.JOBSHEET_SMTP_PASS || process.env.SMTP_PASS || process.env.EMAIL_PASS;
  },
  get senderEmail() {
    return process.env.SENDER_EMAIL || this.emailUser;
  },
  get senderName() {
    return process.env.SENDER_NAME || 'SwordNex JobSheet';
  },
  get whatsappMetaPhoneNumberId() {
    return process.env.WHATSAPP_META_PHONE_NUMBER_ID;
  },
  get whatsappMetaAccessToken() {
    return process.env.JOBSHEET_WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_META_ACCESS_TOKEN;
  },
  get whatsappProvider() {
    return process.env.WHATSAPP_PROVIDER || 'meta';
  },
};
