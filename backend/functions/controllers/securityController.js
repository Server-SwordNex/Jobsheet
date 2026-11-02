import {
  changePasswordService,
  forgotPasswordSendOtpService,
  forgotPasswordVerifyOtpService,
  forgotPasswordResetPasswordService,
} from "../services/securityService.js";

export async function changePasswordHandler(req, res) {
  try {
    const { email, newPassword, uid } = req.body;
    const result = await changePasswordService({ email, newPassword, uid });
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

export async function forgotPasswordSendOtpHandler(req, res) {
  try {
    const { email } = req.body;
    const result = await forgotPasswordSendOtpService(email);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

export async function forgotPasswordVerifyOtpHandler(req, res) {
  try {
    const { email, otp } = req.body;
    const result = await forgotPasswordVerifyOtpService(email, otp);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

export async function forgotPasswordResetPasswordHandler(req, res) {
  try {
    const { email, newPassword } = req.body;
    const result = await forgotPasswordResetPasswordService(email, newPassword);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}
