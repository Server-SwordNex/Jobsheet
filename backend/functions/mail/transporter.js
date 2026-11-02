// // utils/mail/transporter.js

// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   service: "gmail",

//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// export default transporter;

import nodemailer from "nodemailer";
import { config } from "../config/envConfig.js";

const transporter = nodemailer.createTransport({

  host: "smtp.office365.com",

  port: 587,

  secure: false,

  auth: {

    user: config.emailUser,

    pass: config.emailPass,
  },

  tls: {
    ciphers: "SSLv3",
  },
});

export default transporter;