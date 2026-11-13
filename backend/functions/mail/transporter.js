import nodemailer from "nodemailer";
import { config } from "../config/envConfig.js";

/* Created lazily and ONLY from configuration - there are no built-in credentials.
   TLS certificates are verified. */
let transport = null;

const getTransport = () => {
  if (transport) return transport;

  const host = config.smtpHost || "smtp.office365.com";
  const port = config.smtpPort;
  const user = config.emailUser;
  const pass = config.emailPass;

  if (!user || !pass) {
    throw new Error("SMTP is not configured (SMTP_USER / SMTP_PASS)");
  }

  transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return transport;
};

const transporter = {
  sendMail: (options) => getTransport().sendMail(options),
};

export default transporter;
