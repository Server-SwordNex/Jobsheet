import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getPlans } from '../../api/endpoints';
import { getItem, removeItem } from '../../utils/storage';
import { completeSignUp, fetchPricingEnabled, isActivationExpired } from '../../utils/signup';
import styles from './PricingPage.module.css';

// shown only if the plans cannot be loaded (sign-up needs plans that exist on the server)
const defaultPlans = [
  { id: 'free', name: 'Free', billingType: 'free', price: 0, tagLine: 'Perfect for small teams getting started', jobSheetLimit: 25, features: ['Up to 25 job sheets / month', 'Up to 2 technicians', '1 team member'] },
  { id: 'starter-monthly', name: 'Starter Monthly', billingType: 'monthly', price: 499, tagLine: 'Great for growing service centers', jobSheetLimit: 100, features: ['Up to 100 job sheets / month', 'Up to 5 technicians', '3 team members'] },
  { id: 'pro-monthly', name: 'Pro Monthly', billingType: 'monthly', price: 999, tagLine: 'Full access with priority support', jobSheetLimit: 500, popular: true, features: ['Up to 500 job sheets / month', 'Up to 15 technicians', '10 team members', 'Priority support'] },
  { id: 'starter-annual', name: 'Starter Annual', billingType: 'annual', price: 4999, tagLine: 'Annual value pack for established providers', jobSheetLimit: 200, features: ['Up to 200 job sheets / month', 'Up to 10 technicians', '5 team members'] },
  { id: 'pro-annual', name: 'Pro Annual', billingType: 'annual', price: 9999, tagLine: 'Ultimate power for large teams', jobSheetLimit: 2000, features: ['Up to 2000 job sheets / month', 'Up to 50 technicians', '25 team members', 'Priority support'] },
];

const BILLING_TABS = [
  { key: 'free', label: 'Free' },
  { key: 'monthly', label: 'Monthly Billing' },
  { key: 'annual', label: 'Yearly Billing' },
];

// older plan documents used "yearly"
const normalizeBilling = (type) => (type === 'yearly' ? 'annual' : type);

function PricingPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [selectedBilling, setSelectedBilling] = useState(null);
  const [submittingId, setSubmittingId] = useState(null);
  const isLoggedIn = Boolean(getItem('token') && getItem('user'));

  useEffect(() => {
    const registerData = getItem('registerData');
    if (!isLoggedIn && (!registerData?.formData || (!registerData?.password && !registerData?.isGoogleAuth && !registerData?.activationToken))) {
      navigate('/register', { replace: true });
      return;
    }
    fetchPricingEnabled().then((pricingOn) => {
      if (!pricingOn) {
        // pricing is switched off: Jobsheet is free, so there is nothing to choose here
        navigate(isLoggedIn ? '/dashboard' : '/register', { replace: true });
        return;
      }
      getPlans()
        .then((data) => setPlans(Array.isArray(data) && data.length > 0 ? data : defaultPlans))
        .catch(() => setPlans(defaultPlans))
        .finally(() => setPlansLoading(false));
    });
  }, [isLoggedIn, navigate]);

  const normalized = useMemo(
    () => plans.map((p) => ({ ...p, billingType: normalizeBilling(p.billingType) })),
    [plans]
  );

  const availableTabs = BILLING_TABS.filter((t) => normalized.some((p) => p.billingType === t.key));
  const activeBilling =
    selectedBilling && availableTabs.some((t) => t.key === selectedBilling)
      ? selectedBilling
      : (normalized.find((p) => p.popular)?.billingType || availableTabs[0]?.key || 'monthly');
  const shownPlans = normalized.filter((p) => p.billingType === activeBilling);
  const freePlan = normalized.find((p) => p.billingType === 'free');

  const handleAction = async (plan) => {
    const planId = plan?._id || plan?.id;
    if (!planId) { toast.error('Invalid plan'); return; }
    if (isLoggedIn) {
      navigate('/subscription');
      return;
    }
    const registerData = getItem('registerData');
    if (!registerData?.formData || (!registerData?.password && !registerData?.isGoogleAuth && !registerData?.activationToken)) {
      toast.error('Registration data not found. Please register again.');
      navigate('/register', { replace: true });
      return;
    }
    setSubmittingId(planId);
    try {
      await completeSignUp(registerData, plan);
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (err) {
      if (registerData.activationToken && isActivationExpired(err)) {
        removeItem('registerData');
        toast.error('Your sign-in expired. Please sign in again.');
        navigate('/login', { replace: true });
        return;
      }
      toast.error(err?.error || err?.message || 'Registration failed');
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <section className={`${styles.section} ${styles.scrl}`}>
      <div className={styles.header}>
        <h2>Simple, Transparent Pricing</h2>
        <p>Choose the perfect plan for your business</p>

        {availableTabs.length > 1 && (
          <div className={styles.toggle}>
            {availableTabs.map((t) => (
              <button key={t.key} className={activeBilling === t.key ? styles.active : ''} onClick={() => setSelectedBilling(t.key)}>
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {plansLoading ? (
        <div className={styles.loadingWrapper}>
          <div className={styles.spinner}></div>
          <p>Loading Pricing Plans...</p>
        </div>
      ) : (
        <div className={styles.cards}>
          {shownPlans.map((plan, index) => {
            const id = plan._id || plan.id || index;
            return (
              <div key={id} className={`${styles.card} ${plan.popular ? styles.popularCard : ''}`}>
                {plan.popular && <div className={styles.badge}>Most Popular</div>}

                <div className={styles.planHeader}>
                  <div className={styles.icon}>₹</div>
                  <h3>{plan.name}</h3>

                  <div className={styles.price}>
                    {plan.billingType === 'free' ? (
                      'Free'
                    ) : (
                      <>
                        ₹{plan.price}
                        <span>/{plan.billingType === 'monthly' ? 'month' : 'year'}</span>
                      </>
                    )}
                  </div>

                  <div className={styles.limitBox}>
                    <div>
                      <strong>{Number(plan.jobSheetLimit) > 0 ? plan.jobSheetLimit : '∞'}</strong>
                      <span>Job sheets / month</span>
                    </div>
                  </div>

                  <div className={styles.employeeText}>{plan.tagLine}</div>
                </div>

                <ul className={styles.featureList}>
                  {(plan.features || []).map((feature, i) => (
                    <li key={i} className={styles.included}>
                      ✓ {feature}
                    </li>
                  ))}
                </ul>

                <button className={styles.button} onClick={() => handleAction(plan)} disabled={submittingId === id}>
                  {submittingId === id ? 'Creating your account...' : <>Get Started with {plan.name}</>}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {!plansLoading && freePlan && !isLoggedIn && (
        <div className={styles.trialBox}>
          <div>
            <h4>Not sure yet?</h4>
            <p>Start with the free plan and upgrade whenever you need more.</p>
          </div>
          <button className={styles.trialButton} onClick={() => handleAction(freePlan)} disabled={Boolean(submittingId)}>
            Start Free
          </button>
        </div>
      )}
    </section>
  );
}

export default PricingPage;
