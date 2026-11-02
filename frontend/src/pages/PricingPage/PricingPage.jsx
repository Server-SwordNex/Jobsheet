import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../../api/client';
import { getPlans } from '../../api/endpoints';
import { getItem, setItem, removeItem } from '../../utils/storage';
import styles from './PricingPage.module.css';

const CheckIcon = () => (
  <svg viewBox="0 0 20 20">
    <path d="M7.293 13.293l-3-3a1 1 0 011.414-1.414L8 12.586l8.293-8.293a1 1 0 111.414 1.414l-9 9a1 1 0 01-1.414 0z" />
  </svg>
);


function PricingPage() {
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plansLoading, setPlansLoading] = useState(true);
  const [billingTab, setBillingTab] = useState('monthly');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const registerData = getItem('registerData');
    if (!registerData?.formData || (!registerData?.password && !registerData?.isGoogleAuth)) {
      navigate('/register', { replace: true });
      return;
    }
    getPlans()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setPlans(list);
        const monthly = list.filter((p) => p.billingType === 'free' || p.billingType === 'monthly');
        setSelectedPlan(monthly.find((p) => p.billingType === 'free') || monthly[0] || null);
      })
      .catch(() => {
        setPlans([]);
        setSelectedPlan(null);
      })
      .finally(() => setPlansLoading(false));
  }, []);

  const handleTabChange = (tab) => {
    setBillingTab(tab);
    const filtered = plans.filter((p) =>
      tab === 'monthly'
        ? p.billingType === 'free' || p.billingType === 'monthly'
        : p.billingType === 'yearly'
    );
    const currentId = selectedPlan?._id || selectedPlan?.id;
    const stillAvailable = filtered.some((p) => (p._id || p.id) === currentId);
    if (!stillAvailable) setSelectedPlan(filtered[0] || null);
  };

  const handleCreateAccount = async (plan) => {
    console.log('Plan details:', JSON.stringify(plan, null, 2));
    const planId = plan?._id || plan?.id;
    if (!planId) { toast.error('Invalid plan'); return; }
    const registerData = getItem('registerData');
    if (!registerData?.formData || (!registerData?.password && !registerData?.isGoogleAuth)) {
      toast.error('Registration data not found. Please register again.');
      navigate('/register', { replace: true });
      return;
    }
    const { formData, password } = registerData;

    setSubmitting(true);
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
      planName: plan.name,
      billingType: plan.billingType,
    };
    if (password) payload.password = password;
    if (formData.username) payload.username = formData.username;
    if (formData.mobileNo) payload.mobileNo = formData.mobileNo;
    console.log('Register payload:', JSON.stringify(payload, null, 2));
    try {
      const res = await api.post('/api/auth/register', payload, { skipAuthRedirect: true });

      removeItem('registerData');
      setItem('token', res.token);
      setItem('auth', { token: res.token, role: res.role || 'user', email: formData.email || res.email, user: res.user, planId: plan._id || plan.id });
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err?.message || err?.error || 'Registration failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPlans = plans.filter((p) =>
    billingTab === 'monthly'
      ? p.billingType === 'free' || p.billingType === 'monthly'
      : p.billingType === 'yearly'
  );

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.topRow}>
          <div className={styles.topLeft}>
            <h1 className={styles.title}>Choose a Plan</h1>
            <p className={styles.subtitle}>Select a plan to get started with SwordNex Jobsheet</p>
          </div>
          <div className={styles.tabs}>
            <button
              type="button"
              onClick={() => handleTabChange('monthly')}
              className={`${styles.tab} ${billingTab === 'monthly' ? styles.tabActive : ''}`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('yearly')}
              className={`${styles.tab} ${billingTab === 'yearly' ? styles.tabActive : ''}`}
            >
              Yearly
            </button>
          </div>
        </div>

        {plansLoading ? (
          <p className={styles.loading}>Loading plans...</p>
        ) : (
          <>

            {filteredPlans.length === 0 ? (
              <p className={styles.empty}>No {billingTab} plans available.</p>
            ) : (
              <div className={styles.grid}>
                  {filteredPlans.map((plan) => {
                    const id = plan._id || plan.id;
                    const isSelected = (selectedPlan?._id || selectedPlan?.id) === id;
                    return (
                      <div key={id} className={styles.cardWrapper}>
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedPlan(plan)}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedPlan(plan); }}
                          className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}
                        >
                          {plan.popular && (
                            <div className={styles.popular}>
                              <span className={styles.popularBadge}>Popular</span>
                            </div>
                          )}

                          <div className={styles.cardBody}>
                            <h5 className={styles.cardName}>{plan.name}</h5>

                            {plan.billingType === 'free' ? (
                              <span className={styles.cardPrice}>Free</span>
                            ) : (
                              <>
                                <span className={styles.cardPrice}>
                                  ₹{plan.price}
                                </span>
                                <span className={styles.cardInterval}>
                                  {billingTab === 'yearly' ? 'per year' : 'per month'}
                                </span>
                              </>
                            )}


                          

                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleCreateAccount(plan); }}
                              disabled={submitting}
                              className={styles.cta}
                            >
                              <div className={styles.ctaSlide} />
                              <span className={styles.ctaText}>
                                {submitting ? <span className={styles.spinner} /> : 'Create Account'}
                              </span>
                            </button>
                          </div>

                          {plan.features?.length > 0 && (
                            <ul className={styles.features}>
                              {plan.features.map((f, i) => (
                                <li key={i} className={styles.feature}>
                                  <span className={styles.featureIcon}>
                                    <CheckIcon />
                                  </span>
                                  <span className={styles.featureText}>{f}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default PricingPage;
