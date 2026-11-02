import transporter from "./transporter.js";
import { config } from "../config/envConfig.js";

const sendMail = async ({
  to,
  subject,
  html,
}) => {
  await transporter.sendMail({
    from: `"SwordNex JobSheet" <${config.emailUser}>`,
    to,
    subject,
    html,
  });
};

export default sendMail;