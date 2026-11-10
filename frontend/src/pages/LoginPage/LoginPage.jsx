import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login } from '../../api/auth';
import { setItem } from '../../utils/storage';
import { X } from 'lucide-react';
import { forgotPasswordSendOtp, forgotPasswordVerifyOtp, forgotPasswordResetPassword } from '../../api/security';
import TypingText from '../../components/TypingText/TypingText';
import logo from '../../assets/jobsheet-logo.png';
import styles from './LoginPage.module.css';

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
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

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const Spinner = () => (
  <svg className={styles.spinner} width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

function LoginPage() {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginRole, setLoginRole] = useState('admin');

  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleForgotSendOtp = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error("Please enter your email");
      return;
    }
    setForgotLoading(true);
    try {
      await forgotPasswordSendOtp(forgotEmail);
      toast.success("OTP sent to your email!");
      setForgotStep(2);
    } catch (err) {
      toast.error(err.error || err.message || "Failed to send OTP");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode) {
      toast.error("Please enter the OTP code");
      return;
    }
    setForgotLoading(true);
    try {
      await forgotPasswordVerifyOtp(forgotEmail, otpCode);
      toast.success("OTP verified successfully!");
      setForgotStep(3);
    } catch (err) {
      toast.error(err.error || err.message || "Invalid OTP");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmNewPassword) {
      toast.error("Please fill in both fields");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setForgotLoading(true);
    try {
      await forgotPasswordResetPassword(forgotEmail, newPassword);
      toast.success("Password reset successfully! Please sign in with your new password.");
      setShowForgot(false);
      setForgotStep(1);
      setForgotEmail('');
      setOtpCode('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      toast.error(err.error || err.message || "Failed to reset password");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
    if (loginError) setLoginError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      setLoginError('Please fill in all fields');
      return;
    }
    setLoginError('');
    setLoading(true);
    try {
      const email = loginData.email.trim();
      const data = await login(email, loginData.password, loginRole);
      setItem('token', data.token);
      setItem('auth', { token: data.token, role: data.user?.role || loginRole, email });
      setItem('user', data.user);
      toast.success('Signed in successfully');
      if (data.user?.role === 'superadmin') {
        navigate('/superadmin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err?.error || err?.message || (typeof err === 'string' ? err : null) || 'Login failed. Please try again.';
      setLoginError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {};

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.leftContent}>
          <div className={styles.brandLogo}>
            <img src={logo} alt="SwordNex" className={styles.logoImg} />
          </div>
          <div className={styles.brandTagline}>
            <h1 className={styles.brandTitle}>
              <TypingText text="Jobsheet Management" speed={60} />
            </h1>
            <p className={styles.brandDesc}>
              Track, manage, and update work orders seamlessly. Stay on top of every job from start to finish.
            </p>
          </div>
        </div>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.gridPattern} />
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.formContent}>
          <div className={styles.tabPanel}>
            <div className={styles.loginToggle}>
              <button
                type="button"
                className={`${styles.toggleTab} ${loginRole === 'admin' ? styles.toggleTabActive : ''}`}
                onClick={() => {
                  setLoginRole('admin');
                  setLoginError('');
                }}
              >
                Admin Login
              </button>
              <button
                type="button"
                className={`${styles.toggleTab} ${loginRole === 'team' ? styles.toggleTabActive : ''}`}
                onClick={() => {
                  setLoginRole('team');
                  setLoginError('');
                }}
              >
                Team Login
              </button>
            </div>
            <form onSubmit={handleLoginSubmit} className={styles.form}>
              {loginError && <div className={styles.errorMsg}>{loginError}</div>}
              <div className={styles.field}>
                <input
                  type="email"
                  id="loginEmail"
                  name="email"
                  placeholder=" "
                  value={loginData.email}
                  onChange={handleLoginChange}
                  className={styles.input}
                />
                <label htmlFor="loginEmail" className={styles.label}>
                  {loginRole === 'team' ? 'Team Email' : 'Admin Email'}
                </label>
              </div>
              <div className={styles.field}>
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  id="loginPassword"
                  name="password"
                  placeholder=" "
                  value={loginData.password}
                  onChange={handleLoginChange}
                  className={styles.input}
                />
                <label htmlFor="loginPassword" className={styles.label}>Password</label>
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className={styles.eyeBtn}
                  tabIndex={-1}
                  aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                >
                  {showLoginPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              <div className={styles.forgotLinkContainer}>
                <button
                  type="button"
                  onClick={() => {
                    setForgotStep(1);
                    setShowForgot(true);
                  }}
                  className={styles.forgotLink}
                >
                  Forgot Password?
                </button>
              </div>
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? <Spinner /> : <LockIcon />}
                {loading ? 'Signing In...' : loginRole === 'team' ? 'Sign In as Team' : 'Sign In as Admin'}
              </button>
            </form>

            {/* <div className={styles.divider}>
              <span>or continue with</span>
            </div>

            <button onClick={handleGoogleAuth} className={styles.googleBtn}>
              <GoogleIcon />
              <span>Continue with Google</span>
            </button> */}


          </div>
        </div>

        <div className={styles.footer}>
          <p>&copy; 2026 SwordNex. All rights reserved.</p>
          <div className={styles.footerLinks}>
            <Link to="/search">Search</Link>
            <Link to="/register">Register</Link>
            <Link to="/admin/login">Admin Login</Link>
          </div>
        </div>
      </div>
      {showForgot && (
        <div className={styles.modalOverlay} onClick={() => setShowForgot(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Reset Password</h3>
              <button className={styles.modalCloseBtn} onClick={() => setShowForgot(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className={styles.stepIndicator}>
              <span className={`${styles.stepDot} ${forgotStep >= 1 ? styles.stepDotActive : ''}`}>1</span>
              <span className={styles.stepLine} />
              <span className={`${styles.stepDot} ${forgotStep >= 2 ? styles.stepDotActive : ''}`}>2</span>
              <span className={styles.stepLine} />
              <span className={`${styles.stepDot} ${forgotStep >= 3 ? styles.stepDotActive : ''}`}>3</span>
            </div>

            {forgotStep === 1 && (
              <form onSubmit={handleForgotSendOtp} className={styles.modalForm}>
                <p className={styles.modalText}>Enter your email address to receive a verification OTP.</p>
                <div className={styles.field}>
                  <input
                    type="email"
                    required
                    placeholder=" "
                    className={styles.input}
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                  <label className={styles.label}>Email Address</label>
                </div>
                <button type="submit" className={styles.submitBtn} disabled={forgotLoading}>
                  {forgotLoading ? <Spinner /> : null}
                  {forgotLoading ? 'Sending...' : 'Send OTP'}
                </button>
              </form>
            )}

            {forgotStep === 2 && (
              <form onSubmit={handleForgotVerifyOtp} className={styles.modalForm}>
                <p className={styles.modalText}>We sent a 6-digit OTP code to <strong>{forgotEmail}</strong>. Enter the code to verify.</p>
                <div className={styles.field}>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder=" "
                    className={styles.input}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                  />
                  <label className={styles.label}>6-Digit OTP Code</label>
                </div>
                <button type="submit" className={styles.submitBtn} disabled={forgotLoading}>
                  {forgotLoading ? <Spinner /> : null}
                  {forgotLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button type="button" className={styles.backBtn} onClick={() => setForgotStep(1)}>
                  Back
                </button>
              </form>
            )}

            {forgotStep === 3 && (
              <form onSubmit={handleForgotResetPassword} className={styles.modalForm}>
                <p className={styles.modalText}>Enter your new password below.</p>
                <div className={styles.field}>
                  <input
                    type="password"
                    required
                    placeholder=" "
                    className={styles.input}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <label className={styles.label}>New Password</label>
                </div>
                <div className={styles.field}>
                  <input
                    type="password"
                    required
                    placeholder=" "
                    className={styles.input}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                  />
                  <label className={styles.label}>Confirm New Password</label>
                </div>
                <button type="submit" className={styles.submitBtn} disabled={forgotLoading}>
                  {forgotLoading ? <Spinner /> : null}
                  {forgotLoading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginPage;
