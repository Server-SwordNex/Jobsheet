import { api } from '../api/client';
import { setItem, removeItem } from './storage';

/**
 * Creates the business for a sign-up that is waiting in `registerData` (set by the Register or Activate
 * page) and signs the person in. `plan` is the chosen plan, or null while pricing is OFF (no plan needed).
 * Resolves with the server response; rejects with the API error body.
 */
export async function completeSignUp(registerData, plan) {
  const { formData, password } = registerData;

  const payload = {
    email: formData.email,
    isGoogleAuth: registerData.isGoogleAuth || false,
    companyName: formData.companyName,
    website: formData.website,
    gstin: formData.gstin,
    addressLine1: formData.addressLine1,
    addressLine2: formData.addressLine2,
    city: formData.city,
    state: formData.state,
    pincode: formData.pincode,
  };
  if (plan) {
    payload.planName = plan.name;
    payload.billingType = plan.billingType;
  }
  if (password) payload.password = password;
  if (formData.username) payload.username = formData.username;
  if (formData.mobileNo) payload.mobileNo = formData.mobileNo;

  // someone who already has a SwordNex account sets up a business instead of registering
  const activating = Boolean(registerData.activationToken);
  if (activating) payload.activationToken = registerData.activationToken;

  const res = await api.post(activating ? '/api/auth/activate' : '/api/auth/register', payload, { skipAuthRedirect: true });

  removeItem('registerData');
  setItem('token', res.token);
  setItem('auth', {
    token: res.token,
    role: res.user?.role || 'admin',
    email: res.user?.email || formData.email,
    planId: plan?._id || plan?.id,
  });
  setItem('user', res.user);
  return res;
}

/** True when the sign-in behind an activation has expired and the person must sign in again. */
export const isActivationExpired = (err) => String(err?.error || '').toLowerCase().includes('sign in again');

/** Is pricing switched ON? Unknown (network problem) counts as ON so a plan is never skipped by mistake. */
export async function fetchPricingEnabled() {
  try {
    const res = await api.get('/api/pricing-status', { skipAuthRedirect: true });
    return res?.pricingEnabled !== false;
  } catch {
    return true;
  }
}
