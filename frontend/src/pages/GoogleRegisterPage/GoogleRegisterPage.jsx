import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import StateDropdown from '../../components/StateDropdown/StateDropdown';
import TypingText from '../../components/TypingText/TypingText';
import { setItem } from '../../utils/storage';
import logo from '../../assets/jobsheet-logo.png';
import styles from './GoogleRegisterPage.module.css';

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
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
];

function GoogleRegisterPage() {
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
  });

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
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step === 2) {
      setItem('registerData', { formData, isGoogleAuth: true });
      navigate('/pricing');
      return;
    }
    setStep(prev => prev + 1);
  };

  const handlePrev = () => {
    setStep(prev => prev - 1);
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
            <TypingText text="Complete your company details" speed={60} />
          </h2>
          <p className={styles.brandDesc}>
            You're almost there! Fill in your company information to finish setting up your account.
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
          <h1 className={styles.title}>Complete Registration</h1>
          <p className={styles.subtitle}>Fill in your company details to get started</p>
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

          <div className={styles.btnRow}>
            {step > 1 && (
              <button type="button" onClick={handlePrev} className={styles.prevBtn}>
                Back
              </button>
            )}
            <button type="button" onClick={handleNext} className={styles.nextBtn}>
              {step === 2 ? 'Continue to Pricing' : 'Next'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default GoogleRegisterPage;
