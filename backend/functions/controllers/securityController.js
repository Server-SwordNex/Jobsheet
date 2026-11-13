import {
  changePasswordService,
  forgotPasswordSendOtpService,
  forgotPasswordVerifyOtpService,
  forgotPasswordResetPasswordService,
} from "../services/securityService.js";

const sendError = (res, error) =>
  res.status(error.status || 500).json({ error: error.message || "Internal server error" });

export async function changePasswordHandler(req, res) {
  try {
    const { currentPassword, newPassword } = req.body || {};
    // identity comes from the verified token, never from the request body
    const result = await changePasswordService({ user: req.user, currentPassword, newPassword });
    res.status(200).json(result);
  } catch (error) {
    sendError(res, error);
  }
}

export async function forgotPasswordSendOtpHandler(req, res) {
  try {
    const { email } = req.body || {};
    const result = await forgotPasswordSendOtpService(email);
    res.status(200).json(result);
  } catch (error) {
    sendError(res, error);
  }
}

export async function forgotPasswordVerifyOtpHandler(req, res) {
  try {
    const { email, otp } = req.body || {};
    const result = await forgotPasswordVerifyOtpService(email, otp);
    res.status(200).json(result);
  } catch (error) {
    sendError(res, error);
  }
}

export async function forgotPasswordResetPasswordHandler(req, res) {
  try {
    const { email, newPassword, token } = req.body || {};
    const result = await forgotPasswordResetPasswordService(email, newPassword, token);
    res.status(200).json(result);
  } catch (error) {
    sendError(res, error);
  }
}
