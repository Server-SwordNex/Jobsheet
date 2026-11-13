import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env relative to functions directory first, then process.cwd()

dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

export const config = {
  superadminEmail: process.env.SUPERADMIN_EMAIL || process.env.SUPER_ADMIN_EMAIL,
  superadminPassword: process.env.SUPERADMIN_PASSWORD || process.env.SUPER_ADMIN_PASSWORD,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  myappRoot: process.env.MYAPP_ROOT,
  myappTenantId: process.env.MYAPP_TENANT_ID,
  myappKey: process.env.MYAPP_KEY,
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
  whatsappMetaPhoneNumberId: process.env.WHATSAPP_META_PHONE_NUMBER_ID,
  whatsappMetaAccessToken: process.env.WHATSAPP_META_ACCESS_TOKEN,
  whatsappProvider: process.env.WHATSAPP_PROVIDER || "meta",
};
