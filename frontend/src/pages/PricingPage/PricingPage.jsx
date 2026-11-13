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

const defaultPlans = [
  {
    id: 'free',
    name: 'Free',
    billingType: 'free',
    price: 0,
    tagLine: 'Perfect for small teams getting started',
    jobSheetLimit: 25,
    staffLimit: 2,
    subuserLimit: 1,
    popular: false,
    features: ['Up to 25 Job Sheets / mo', 'Up to 2 Service Technicians', '1 Sub-user account', 'Standard PDF generation', 'Basic reports & dashboard'],
  },
  {
    id: 'starter-monthly',
    name: 'Starter Monthly',
    billingType: 'monthly',
    price: 499,
    tagLine: 'Great for growing service centers',
    jobSheetLimit: 100,
    staffLimit: 5,
    subuserLimit: 3,
    popular: false,
    features: ['Up to 100 Job Sheets / mo', 'Up to 5 Service Technicians', '3 Sub-user accounts', 'Custom branding & logo', 'Advanced reporting & exports'],
  },
  {
    id: 'pro-monthly',
    name: 'Pro Monthly',
    billingType: 'monthly',
    price: 999,
    tagLine: 'Full access with priority support',
    jobSheetLimit: 500,
    staffLimit: 15,
    subuserLimit: 10,
    popular: true,
    features: ['Up to 500 Job Sheets / mo', 'Up to 15 Service Technicians', '10 Sub-user accounts', 'Custom branding & watermark', 'Customer search & tracking', '24/7 Priority support'],
  },
  {
    id: 'starter-yearly',
    name: 'Starter Yearly',
    billingType: 'yearly',
    price: 4999,
    tagLine: 'Annual value pack for established providers',
    jobSheetLimit: 200,
    staffLimit: 10,
    subuserLimit: 5,
    popular: false,
    features: ['Up to 200 Job Sheets / mo', 'Up to 10 Service Technicians', '5 Sub-user accounts', 'Custom branding & invoice template', 'Save ~20% with annual billing'],
  },
  {
    id: 'pro-yearly',
    name: 'Pro Yearly',
    billingType: 'yearly',
    price: 9999,
    tagLine: 'Ultimate enterprise power',
    jobSheetLimit: 2000,
    staffLimit: 50,
    subuserLimit: 25,
    popular: false,
    features: ['Unlimited Job Sheets', 'Up to 50 Service Technicians', '25 Sub-user accounts', 'Custom domain & branding', 'Dedicated Account Manager'],
  },
];

function PricingPage() {
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plansLoading, setPlansLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const isLoggedIn = Boolean(getItem('token') && getItem('user'));

  useEffect(() => {
    const registerData = getItem('registerData');
    if (!isLoggedIn && (!registerData?.formData || (!registerData?.password && !registerData?.isGoogleAuth))) {
      navigate('/register', { replace: true });
      return;
    }

    getPlans()
      .then((data) => {
        const list = Array.isArray(data) && data.length > 0 ? data : defaultPlans;
        setPlans(list);
        setSelectedPlan(list.find((p) => p.popular) || list[0] || null);
      })
      .catch(() => {
        setPlans(defaultPlans);
        setSelectedPlan(defaultPlans[0]);
      })
      .finally(() => setPlansLoading(false));
  }, [isLoggedIn, navigate]);

  const handleAction = async (plan) => {
    const planId = plan?._id || plan?.id;
    if (!planId) { toast.error('Invalid plan'); return; }

    if (isLoggedIn) {
      navigate('/subscription');
      return;
    }

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

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.topRow}>
          <div className={styles.topLeft}>
            <h1 className={styles.title}>Choose a Plan</h1>
            <p className={styles.subtitle}>Select an available plan to get started with SwordNex Jobsheet</p>
          </div>
        </div>

        {plansLoading ? (
          <p className={styles.loading}>Loading plans...</p>
        ) : (
          <div className={styles.horizontalWrapper}>
            <div className={styles.grid}>
              {plans.map((plan) => {
                const id = plan._id || plan.id;
                const isSelected = (selectedPlan?._id || selectedPlan?.id) === id;
                const isYearly = plan.billingType === 'yearly';
                const isFree = plan.billingType === 'free' || Number(plan.price) === 0;

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
                        <div className={styles.billingBadge}>
                          {isFree ? 'Free' : isYearly ? 'Yearly' : 'Monthly'}
                        </div>
                        <h5 className={styles.cardName}>{plan.name}</h5>

                        {isFree ? (
                          <span className={styles.cardPrice}>Free</span>
                        ) : (
                          <>
                            <span className={styles.cardPrice}>₹{plan.price}</span>
                            <span className={styles.cardInterval}>
                              {isYearly ? 'per year' : 'per month'}
                            </span>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleAction(plan); }}
                          disabled={submitting}
                          className={styles.cta}
                        >
                          <div className={styles.ctaSlide} />
                          <span className={styles.ctaText}>
                            {submitting ? (
                              <span className={styles.spinner} />
                            ) : isLoggedIn ? (
                              'Select Plan'
                            ) : (
                              'Create Account'
                            )}
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
          </div>
        )}
      </div>
    </div>
  );
}

export default PricingPage;
