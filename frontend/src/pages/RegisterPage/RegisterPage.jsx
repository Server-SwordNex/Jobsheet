import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Building2, Globe, FileText, MapPin, User, Phone, Mail, Lock, CheckCircle2 } from 'lucide-react';
import { sendOtp, verifyOtp } from '../../api/endpoints';
import { setItem } from '../../utils/storage';
import { completeSignUp, fetchPricingEnabled } from '../../utils/signup';
import { indianStates } from '../../utils/indianStates';
import AuthShell from '../../components/AuthShell/AuthShell';
import ui from '../../components/AuthShell/AuthShell.module.css';
import { Field, SelectField, PasswordField, Button } from '../../components/AuthShell/AuthFields';

const STEPS = ['Company', 'Address', 'Account', 'Password'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    gstin: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    username: '',
    mobileNo: '',
    email: '',
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [emailVerified, setEmailVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const clearError = (name) =>
    setErrors((prev) => Object.fromEntries(Object.entries(prev).filter(([key]) => key !== name)));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearError(name);
    // a different email needs its own verification
    if (name === 'email' && (emailVerified || otpSent)) {
      setEmailVerified(false);
      setOtpSent(false);
      setOtp('');
    }
  };

  const validateStep = () => {
    const e = {};
    if (step === 1 && !formData.companyName.trim()) e.companyName = 'Enter your company name.';
    if (step === 2) {
      if (!formData.addressLine1.trim()) e.addressLine1 = 'Enter your address.';
      if (!formData.city.trim()) e.city = 'Enter your city.';
      if (!formData.state.trim()) e.state = 'Choose your state.';
      if (!formData.pincode.trim()) e.pincode = 'Enter your pincode.';
    }
    if (step === 3) {
      if (!formData.username.trim()) e.username = 'Enter your name.';
      if (!formData.mobileNo.trim()) e.mobileNo = 'Enter your mobile number.';
      if (!EMAIL.test(formData.email.trim())) e.email = 'Enter a valid email address.';
      else if (!emailVerified) e.email = 'Verify your email with the code before continuing.';
    }
    if (step === 4) {
      if (password.length < 6) e.password = 'Password must be at least 6 characters.';
      if (confirmPassword !== password) e.confirmPassword = 'Passwords do not match.';
    }
    setErrors(e);
    if (Object.keys(e).length) {
      document.getElementsByName(Object.keys(e)[0])[0]?.focus();
      return false;
    }
    return true;
  };

  const handleNext = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    if (step !== 4) {
      setStep((s) => s + 1);
      return;
    }

    const registerData = { formData, password };
    setSubmitting(true);
    try {
      if (await fetchPricingEnabled()) {
        setItem('registerData', registerData);
        navigate('/pricing');
        return;
      }
      // pricing is switched off: Jobsheet is free, so there is no plan to choose
      await completeSignUp(registerData, null);
      toast.success('Welcome to Jobsheet! Your account is ready.');
      navigate('/dashboard');
    } catch (err) {
      setErrors({ confirmPassword: err?.error || err?.message || 'Registration failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendOtp = async () => {
    if (!EMAIL.test(formData.email.trim())) {
      setErrors({ email: 'Enter a valid email address.' });
      return;
    }
    setOtpSending(true);
    try {
      await sendOtp(formData.email.trim());
      setOtpSent(true);
      setOtp('');
      setCooldown(60);
      toast.success('A code has been sent to your email.');
    } catch (err) {
      setErrors({ email: err?.error || err?.message || 'Could not send the code.' });
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otp.trim())) {
      setErrors({ otp: 'Enter the 6-digit code.' });
      return;
    }
    setOtpVerifying(true);
    try {
      await verifyOtp(formData.email.trim(), otp.trim());
      setEmailVerified(true);
      setErrors({});
      toast.success('Email verified');
    } catch (err) {
      setErrors({ otp: err?.error || err?.message || 'That code is not right.' });
    } finally {
      setOtpVerifying(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Register your company to manage job sheets.">
      <div className={ui.form}>
        <div>
          <div className={ui.steps}>
            {STEPS.map((label, i) => (
              <div key={label} className={`${ui.step} ${i < step ? ui.stepDone : ''}`} />
            ))}
          </div>
          <p className={ui.stepLabel}>
            Step {step} of {STEPS.length}: {STEPS[step - 1]}
          </p>
        </div>

        <form className={ui.form} onSubmit={handleNext} noValidate>
          {step === 1 && (
            <>
              <Field label="Company name" required name="companyName" icon={Building2} placeholder="Your company" value={formData.companyName} onChange={handleChange} error={errors.companyName} autoFocus />
              <Field label="Website (optional)" name="website" icon={Globe} placeholder="www.example.com" value={formData.website} onChange={handleChange} />
              <Field label="GSTIN (optional)" name="gstin" icon={FileText} placeholder="15-character GSTIN" value={formData.gstin} onChange={handleChange} />
            </>
          )}

          {step === 2 && (
            <>
              <Field label="Address line 1" required name="addressLine1" icon={MapPin} placeholder="Street address" value={formData.addressLine1} onChange={handleChange} error={errors.addressLine1} autoFocus />
              <Field label="Address line 2 (optional)" name="addressLine2" placeholder="Area, landmark" value={formData.addressLine2} onChange={handleChange} />
              <div className={ui.grid2}>
                <Field label="City" required name="city" placeholder="City" value={formData.city} onChange={handleChange} error={errors.city} />
                <SelectField label="State" required name="state" value={formData.state} onChange={handleChange} error={errors.state}>
                  <option value="">Select state</option>
                  {indianStates.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </SelectField>
              </div>
              <Field label="Pincode" required name="pincode" inputMode="numeric" maxLength={6} placeholder="6-digit pincode" value={formData.pincode} onChange={(e) => handleChange({ target: { name: 'pincode', value: e.target.value.replace(/\D/g, '') } })} error={errors.pincode} />
            </>
          )}

          {step === 3 && (
            <>
              <Field label="Your name" required name="username" icon={User} autoComplete="name" placeholder="Full name" value={formData.username} onChange={handleChange} error={errors.username} autoFocus />
              <Field label="WhatsApp number" required name="mobileNo" type="tel" icon={Phone} autoComplete="tel-national" inputMode="numeric" maxLength={10} placeholder="10-digit number" value={formData.mobileNo} onChange={(e) => handleChange({ target: { name: 'mobileNo', value: e.target.value.replace(/\D/g, '') } })} error={errors.mobileNo} />
              <Field label="Email address" required name="email" type="email" icon={Mail} autoComplete="email" placeholder="name@company.com" value={formData.email} onChange={handleChange} error={errors.email} />

              {emailVerified ? (
                <div className={ui.notice} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={17} /> Email verified
                </div>
              ) : otpSent ? (
                <div className={ui.field}>
                  <label className={ui.label} htmlFor="otp">
                    6-digit code
                  </label>
                  <input
                    id="otp"
                    name="otp"
                    className={`${ui.input} ${ui.otp} ${errors.otp ? ui.invalid : ''}`}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="······"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, ''));
                      clearError('otp');
                    }}
                  />
                  {errors.otp && <p className={ui.errorText}>{errors.otp}</p>}
                  <div className={ui.grid2} style={{ marginTop: 10 }}>
                    <Button type="button" loading={otpVerifying} onClick={handleVerifyOtp}>
                      Verify code
                    </Button>
                    <button type="button" className={ui.btnGhost} disabled={otpSending || cooldown > 0} onClick={handleSendOtp}>
                      {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" className={ui.btnGhost} disabled={otpSending} onClick={handleSendOtp}>
                  {otpSending ? 'Sending...' : 'Send verification code'}
                </button>
              )}
            </>
          )}

          {step === 4 && (
            <>
              <PasswordField label="Password" required name="password" icon={Lock} autoComplete="new-password" placeholder="At least 6 characters" value={password} onChange={(e) => { setPassword(e.target.value); clearError('password'); }} error={errors.password} autoFocus />
              <PasswordField label="Confirm password" required name="confirmPassword" icon={Lock} autoComplete="new-password" placeholder="Repeat the password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); clearError('confirmPassword'); }} error={errors.confirmPassword} />
            </>
          )}

          <div className={step > 1 ? ui.grid2 : undefined}>
            {step > 1 && (
              <button type="button" className={ui.btnGhost} onClick={() => { setErrors({}); setStep((s) => s - 1); }}>
                Back
              </button>
            )}
            <Button type="submit" loading={submitting}>
              {step === STEPS.length ? 'Create account' : 'Continue'}
            </Button>
          </div>
        </form>
      </div>

      <p className={ui.switchLine}>
        Already have an account?{' '}
        <Link to="/login" className={ui.link}>
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
