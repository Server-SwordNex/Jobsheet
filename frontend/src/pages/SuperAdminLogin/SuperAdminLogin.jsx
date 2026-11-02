import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { setItem } from '../../utils/storage';
import { superAdminLogin } from '../../api/auth';
import logo from '../../assets/jobsheet-logo.png';
import styles from './SuperAdminLogin.module.css';



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

function SuperAdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email) { toast.error('Email is required'); return; }
    if (!formData.password) { toast.error('Password is required'); return; }
    setLoading(true);
    try {
      const data = await superAdminLogin(formData.email, formData.password);
      setItem('token', data.token);
      setItem('auth', { token: data.token, role: 'superadmin', email: formData.email });
      toast.success('Signed in as Super Admin');
      navigate('/superadmin/dashboard');
    } catch (err) {
      const msg = err?.message || err?.error || (typeof err === 'string' ? err : null) || 'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.leftContent}>
          <div className={styles.brandLogo}>
            <img src={logo} alt="SwordNex" className={styles.logoImg} />
          </div>
          <div className={styles.brandTagline}>
            <h1 className={styles.brandTitle}>Super Admin</h1>
            <p className={styles.brandDesc}>
              Manage users, oversee operations, and control system-wide settings from a single dashboard.
            </p>
          </div>
          <div className={styles.badge}>Authorized personnel only</div>
        </div>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.gridPattern} />
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.formContent}>
          <div className={styles.tabPanel}>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <input
                  type="email"
                  id="saEmail"
                  name="email"
                  placeholder=" "
                  value={formData.email}
                  onChange={handleChange}
                  className={styles.input}
                />
                <label htmlFor="saEmail" className={styles.label}>Email</label>
              </div>
              <div className={styles.field}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="saPassword"
                  name="password"
                  placeholder=" "
                  value={formData.password}
                  onChange={handleChange}
                  className={styles.input}
                />
                <label htmlFor="saPassword" className={styles.label}>Password</label>
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
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                <LockIcon />
                {loading ? 'Signing In...' : 'Sign In as Super Admin'}
              </button>
            </form>
          </div>
        </div>

        <div className={styles.footer}>
          <p>&copy; 2026 SwordNex. All rights reserved.</p>
          <div className={styles.footerLinks}>
            <Link to="/login">User Login</Link>
            <Link to="/search">Search</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuperAdminLogin;
