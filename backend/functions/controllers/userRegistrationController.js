import { sendOtp, verifyOtp, registerUser, activateAccount } from "../services/userRegistrationService.js";

const sendError = (res, error) => {
  const body = { error: error.message || "Internal server error" };
  // machine-readable reason the app reacts to (ACCOUNT_EXISTS, EMAIL_NOT_VERIFIED...)
  if (error.apiCode) body.code = error.apiCode;
  res.status(error.status || 500).json(body);
};

const clientContext = (req) => ({
  deviceInfo: req.headers["user-agent"] || "",
  ipAddress: req.ip || "",
});

export async function sendOtpHandler(req, res) {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const result = await sendOtp(email);
    res.status(200).json(result);
  } catch (error) {
    sendError(res, error);
  }
}

export async function verifyOtpHandler(req, res) {
  try {
    const { email, otp } = req.body || {};
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }
    const result = await verifyOtp(email, otp);
    res.status(200).json(result);
  } catch (error) {
    sendError(res, error);
  }
}

export async function registerHandler(req, res) {
  try {
    const result = await registerUser(req.body || {}, clientContext(req));
    res.status(201).json(result);
  } catch (error) {
    sendError(res, error);
  }
}

/** Set up a Jobsheet business for someone who signed in with a shared SwordNex account. */
export async function activateHandler(req, res) {
  try {
    const result = await activateAccount(req.body || {}, clientContext(req));
    res.status(201).json(result);
  } catch (error) {
    sendError(res, error);
  }
}
