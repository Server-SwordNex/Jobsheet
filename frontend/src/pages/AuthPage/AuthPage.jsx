import { useState } from 'react';
import logo from '../../assets/jobsheet-logo.png';
import styles from './AuthPage.module.css';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

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

const AuthPage = ({ onRegister }) => {
  const [activeTab, setActiveTab] = useState('search');
  const [searchData, setSearchData] = useState({ jobId: '', mobileNumber: '', name: '' });
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchData(prev => ({ ...prev, [name]: value }));
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
    if (loginError) setLoginError('');
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setSearchResults({
        jobId: searchData.jobId || 'JS-001',
        customerName: 'Rajesh Kumar',
        vehicle: 'Toyota Camry (KA-01-AB-1234)',
        serviceType: 'Full Service',
        status: 'In Progress',
        technician: 'Suresh',
        scheduledDate: '05 Jun 2026',
        estimatedCost: '\u20B98,500',
        description: 'Engine oil change, filter replacement, brake inspection, wheel alignment, and general health check-up.'
      });
      setIsLoading(false);
    }, 800);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      setLoginError('Please fill in all fields');
      return;
    }
    setLoginError('');
  };

  const handleGoogleAuth = () => {};

  const tabs = [
    { id: 'search', label: 'Search', icon: SearchIcon },
    { id: 'login', label: 'Sign In', icon: LockIcon },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.leftContent}>
          <div className={styles.brandLogo}>
            <img src={logo} alt="SwordNex" className={styles.logoImg} />
          </div>

          <div className={styles.brandTagline}>
            <h1 className={styles.brandTitle}>Jobsheet<br />Management</h1>
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
        <div className={styles.tabBar}>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setSearchResults(null); }}
              className={`${styles.tab} ${activeTab === id ? styles.tabActive : ''}`}
            >
              <Icon />
              {label}
            </button>
          ))}
        </div>

        <div className={styles.formContent}>
          {activeTab === 'search' && (
            <div className={styles.tabPanel}>
              <form onSubmit={handleSearch} className={styles.form}>
                <div className={styles.field}>
                  <input
                    type="text"
                    id="jobId"
                    name="jobId"
                    placeholder=" "
                    value={searchData.jobId}
                    onChange={handleSearchChange}
                    className={styles.input}
                  />
                  <label htmlFor="jobId" className={styles.label}>Job ID</label>
                </div>
                <div className={styles.field}>
                  <input
                    type="tel"
                    id="mobileNumber"
                    name="mobileNumber"
                    placeholder=" "
                    value={searchData.mobileNumber}
                    onChange={handleSearchChange}
                    className={styles.input}
                  />
                  <label htmlFor="mobileNumber" className={styles.label}>Mobile Number</label>
                </div>
                <div className={styles.field}>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder=" "
                    value={searchData.name}
                    onChange={handleSearchChange}
                    className={styles.input}
                  />
                  <label htmlFor="name" className={styles.label}>Name (Optional)</label>
                </div>
                <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                  {isLoading ? <Spinner /> : <SearchIcon />}
                  {isLoading ? 'Searching...' : 'Search Jobsheet'}
                </button>
              </form>

              {searchResults && (
                <div className={styles.resultsCard}>
                  <div className={styles.resultsHeader}>
                    <h3 className={styles.jobTitle}>{searchResults.jobId}</h3>
                    <span className={styles.jobCompany}>{searchResults.customerName}</span>
                  </div>
                  <div className={styles.jobMeta}>
                    <span>{searchResults.vehicle}</span>
                    <span className={styles.dot}>·</span>
                    <span>{searchResults.scheduledDate}</span>
                  </div>
                  <div className={styles.jobSalary}>{searchResults.serviceType} &mdash; {searchResults.estimatedCost}</div>
                  <p className={styles.jobDescription}>{searchResults.description}</p>
                  <div className={styles.jobFooter}>
                    <span className={styles.applicants}>Technician: {searchResults.technician}</span>
                    <span className={`${styles.statusBadge} ${searchResults.status === 'In Progress' ? styles.statusProgress : ''}`}>{searchResults.status}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'login' && (
            <div className={styles.tabPanel}>
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
                  <label htmlFor="loginEmail" className={styles.label}>Email</label>
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
                <button type="submit" className={styles.submitBtn}>
                  <LockIcon />
                  Sign In
                </button>
              </form>

              <div className={styles.divider}>
                <span>or continue with</span>
              </div>

              <button onClick={handleGoogleAuth} className={styles.googleBtn}>
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>

              <p className={styles.switchText}>
                Don&apos;t have an account?{' '}
                <button type="button" onClick={onRegister} className={styles.switchBtn}>
                  Register here
                </button>
              </p>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <p>&copy; 2026 SwordNex. All rights reserved.</p>
          <div className={styles.footerLinks}>
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
            <a href="#support">Support</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
