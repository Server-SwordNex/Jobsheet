import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import StateDropdown from '../../components/StateDropdown/StateDropdown';
import TypingText from '../../components/TypingText/TypingText';
import { sendOtp, verifyOtp } from '../../api/endpoints';
import { setItem } from '../../utils/storage';
import logo from '../../assets/jobsheet-logo.png';
import styles from './RegisterPage.module.css';

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);

const IllustrationIcon = () => (
  <svg width="200" height="160" viewBox="0 0 200 160" fill="none">
    <rect x="10" y="20" width="180" height="120" rx="12" stroke="#F20519" strokeWidth="2" strokeDasharray="6 4" fill="rgba(242,5,25,0.05)" />
    <rect x="30" y="40" width="60" height="8" rx="4" fill="rgba(242,5,25,0.3)" />
    <rect x="30" y="56" width="100" height="8" rx="4" fill="rgba(242,5,25,0.15)" />
    <rect x="30" y="72" width="80" height="8" rx="4" fill="rgba(242,5,25,0.1)" />
    <rect x="110" y="40" width="60" height="8" rx="4" fill="rgba(242,5,25,0.2)" />
    <rect x="30" y="100" width="100" height="24" rx="6" fill="rgba(242,5,25,0.12)" />
    <rect x="140" y="100" width="30" height="24" rx="6" fill="rgba(242,5,25,0.2)" />
  </svg>
);

const steps = [
  { label: 'Company Info' },
  { label: 'Address' },
  { label: 'Credentials' },
  { label: 'Set Password' },
];

function RegisterPage() {
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
  const [showPassword, setShowPassword] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep = () => {
    if (step === 1 && !formData.companyName.trim()) {
      toast.error('Company name is required');
      return false;
    }
    if (step === 2) {
      if (!formData.addressLine1.trim()) { toast.error('Address line 1 is required'); return false; }
      if (!formData.city.trim()) { toast.error('City is required'); return false; }
      if (!formData.state.trim()) { toast.error('State is required'); return false; }
      if (!formData.pincode.trim()) { toast.error('Pincode is required'); return false; }
    }
    if (step === 3) {
      if (!formData.username.trim()) { toast.error('Username is required'); return false; }
      if (!formData.mobileNo.trim()) { toast.error('Mobile number is required'); return false; }
      if (!formData.email.trim()) { toast.error('Email is required'); return false; }
      if (!emailVerified) { toast.error('Please verify your email before proceeding'); return false; }
    }
    if (step === 4) {
      if (!password.trim()) { toast.error('Password is required'); return false; }
      if (!confirmPassword.trim()) { toast.error('Please confirm your password'); return false; }
      if (password !== confirmPassword) { toast.error('Passwords do not match'); return false; }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step === 4) {
      setItem('registerData', { formData, password });
      navigate('/pricing');
      return;
    }
    setStep(prev => prev + 1);
  };

  const handlePrev = () => {
    setStep(prev => prev - 1);
  };

  const handleSendOtp = async () => {
    if (!formData.email.trim()) { toast.error('Email is required'); return; }
    setOtpSending(true);
    try {
      await sendOtp(formData.email);
      setOtpSent(true);
      toast.success('OTP sent to your email');
    } catch (err) {
      const msg = err?.message || err?.error || 'Failed to send OTP';
      toast.error(msg);
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.trim().length !== 6) { toast.error('Enter a valid 6-digit OTP'); return; }
    setOtpVerifying(true);
    try {
      await verifyOtp(formData.email, otp.trim());
      setEmailVerified(true);
      toast.success('Email verified successfully');
    } catch (err) {
      const msg = err?.message || err?.error || 'Invalid OTP';
      toast.error(msg);
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleResetOtp = () => {
    setOtpSent(false);
    setOtp('');
    setEmailVerified(false);
  };

  const renderProgress = () => (
    <div className={styles.progress}>
      {steps.map((s, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === step;
        const isCompleted = stepNum < step;
        return (
          <div key={s.label} className={styles.stepItem}>
            <div className={`${styles.stepCircle} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}>
              {isCompleted ? <CheckIcon /> : stepNum}
            </div>
            <span className={`${styles.stepLabel} ${isActive || isCompleted ? styles.stepLabelActive : ''}`}>
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.orb1} />
      <div className={styles.orb2} />

      <div className={styles.leftPanel}>
        <div className={styles.leftContent}>
          <div className={styles.illustration}>
            <IllustrationIcon />
          </div>
          <h2 className={styles.typingHeading}>
            <TypingText text="Manage jobsheets effortlessly" speed={60} />
          </h2>
          <p className={styles.brandDesc}>
            Register your company and start tracking work orders, assigning technicians, and managing reports all in one place.
          </p>
        </div>
        <div className={styles.orbSmall1} />
        <div className={styles.orbSmall2} />
        <div className={styles.gridPattern} />
      </div>

      <div className={styles.rightPanel}>
        <button onClick={() => navigate('/login')} className={styles.backBtn}>
          <ArrowLeftIcon />
          Back to Sign In
        </button>

        <div className={styles.brandLogo}>
          <img src={logo} alt="SwordNex" className={styles.logoImg} />
        </div>

        <div className={styles.header}>
          <h1 className={styles.title}>Create an account</h1>
          <p className={styles.subtitle}>Register your company to manage jobsheets</p>
        </div>

        {renderProgress()}

        <form className={styles.form}>

          {step === 1 && (
            <>
              <div className={styles.field}>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  placeholder="Company Name"
                  value={formData.companyName}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>
              <div className={styles.field}>
                <input
                  type="text"
                  id="website"
                  name="website"
                  placeholder="Website (optional)"
                  value={formData.website}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>
              <div className={styles.field}>
                <input
                  type="text"
                  id="gstin"
                  name="gstin"
                  placeholder="GSTIN (optional)"
                  value={formData.gstin}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className={styles.field}>
                <input
                  type="text"
                  id="addressLine1"
                  name="addressLine1"
                  placeholder="Address Line 1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>
              <div className={styles.field}>
                <input
                  type="text"
                  id="addressLine2"
                  name="addressLine2"
                  placeholder="Address Line 2"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                    className={styles.input}
                  />
                </div>
                <StateDropdown
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.field}>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  placeholder="Pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className={styles.field}>
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>
              <div className={styles.field}>
                <input
                  type="tel"
                  id="mobileNo"
                  name="mobileNo"
                  placeholder="Mobile No"
                  value={formData.mobileNo}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>
              <div className={styles.field}>
                <input
                  type="email"
                  id="regEmail"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className={styles.input}
                  disabled={otpSent}
                />
              </div>

              {!emailVerified && !otpSent && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className={styles.verifyBtn}
                  disabled={!formData.email.trim() || otpSending}
                >
                  <MailIcon />
                  {otpSending ? 'Sending...' : 'Send OTP'}
                </button>
              )}

              {!emailVerified && otpSent && (
                <>
                  <p className={styles.otpInfo}>OTP sent to {formData.email}</p>
                  <div className={styles.otpRow}>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className={styles.otpInput}
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      className={styles.verifyOtpBtn}
                      disabled={otp.trim().length !== 6 || otpVerifying}
                    >
                      {otpVerifying ? 'Verifying...' : 'Verify'}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetOtp}
                    className={styles.changeLink}
                  >
                    Change email
                  </button>
                </>
              )}

              {emailVerified && (
                <div className={styles.verifiedBadge}>
                  <CheckIcon />
                  Email Verified
                </div>
              )}
            </>
          )}

          {step === 4 && (
            <>
              <div className={styles.field}>
                <div className={styles.pwdWrap}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="regPassword"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.input}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.eyeBtn}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
              <div className={styles.field}>
                <input
                  type="password"
                  id="regConfirmPassword"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={styles.input}
                />
              </div>
            </>
          )}

          <div className={styles.btnRow} style={{ display: step === 3 && !emailVerified ? 'none' : undefined }}>
            {step > 1 && (
              <button type="button" onClick={handlePrev} className={styles.prevBtn}>
                Back
              </button>
            )}
            <button type="button" onClick={handleNext} className={styles.nextBtn}>
              {step === 4 ? 'Continue to Pricing' : 'Next'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default RegisterPage;
