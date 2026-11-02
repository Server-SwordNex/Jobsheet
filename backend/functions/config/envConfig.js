import 'dotenv/config';

export const config = {
  superadminEmail: process.env.SUPERADMIN_EMAIL,
  superadminPassword: process.env.SUPERADMIN_PASSWORD,
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
