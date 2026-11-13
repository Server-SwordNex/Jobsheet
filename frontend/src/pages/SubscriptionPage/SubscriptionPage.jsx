import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Check, Sparkles, Shield, Zap, Crown } from 'lucide-react';
import { getPlans } from '../../api/endpoints';
import { getItem } from '../../utils/storage';
import { useEntitlements } from '../../context/EntitlementsContext';
import styles from './SubscriptionPage.module.css';

const defaultPlans = [
  {
    id: 'free',
    name: 'Free',
    billingType: 'free',
    price: 0,
    tagLine: 'Perfect for small teams getting started with job sheets',
    jobSheetLimit: 25,
    staffLimit: 2,
    subuserLimit: 1,
    popular: false,
    features: [
      'Up to 25 Job Sheets / month',
      'Up to 2 Service Technicians',
      '1 Sub-user account',
      'Standard PDF generation',
      'Basic reports & dashboard',
      'Email support',
    ],
  },
  {
    id: 'starter-monthly',
    name: 'Starter Monthly',
    billingType: 'monthly',
    price: 499,
    tagLine: 'Great for growing service centers and technicians',
    jobSheetLimit: 100,
    staffLimit: 5,
    subuserLimit: 3,
    popular: false,
    features: [
      'Up to 100 Job Sheets / month',
      'Up to 5 Service Technicians',
      '3 Sub-user accounts',
      'Custom branding & company logo',
      'Advanced reporting & exports',
      'Priority email support',
    ],
  },
  {
    id: 'pro-monthly',
    name: 'Pro Monthly',
    billingType: 'monthly',
    price: 999,
    tagLine: 'Full access with high volume limits and analytics',
    jobSheetLimit: 500,
    staffLimit: 15,
    subuserLimit: 10,
    popular: true,
    features: [
      'Up to 500 Job Sheets / month',
      'Up to 15 Service Technicians',
      '10 Sub-user accounts',
      'Custom branding & watermark',
      'Customer search & tracking',
      '24/7 Priority support',
    ],
  },
  {
    id: 'starter-yearly',
    name: 'Starter Yearly',
    billingType: 'yearly',
    price: 4999,
    tagLine: 'Annual value pack for established service providers',
    jobSheetLimit: 200,
    staffLimit: 10,
    subuserLimit: 5,
    popular: false,
    features: [
      'Up to 200 Job Sheets / month',
      'Up to 10 Service Technicians',
      '5 Sub-user accounts',
      'Custom branding & invoice template',
      'Save ~20% with annual billing',
      'Dedicated account assistance',
    ],
  },
  {
    id: 'pro-yearly',
    name: 'Pro Yearly',
    billingType: 'yearly',
    price: 9999,
    tagLine: 'Ultimate enterprise power and unlimited capability',
    jobSheetLimit: 2000,
    staffLimit: 50,
    subuserLimit: 25,
    popular: false,
    features: [
      'Unlimited Job Sheets',
      'Up to 50 Service Technicians',
      '25 Sub-user accounts',
      'Custom domain & branding',
      'Full API & export integrations',
      'Dedicated Account Manager',
    ],
  },
];

export default function SubscriptionPage() {
  const { entitlements } = useEntitlements();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upgradingId] = useState(null);

  const user = getItem('user') || {};
  const auth = getItem('auth') || {};
  const currentPlanName = (user.plan || user.planName || auth.planName || 'Free').toLowerCase();

  useEffect(() => {
    getPlans()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPlans(data);
        } else {
          setPlans(defaultPlans);
        }
      })
      .catch(() => {
        setPlans(defaultPlans);
      })
      .finally(() => setLoading(false));
  }, []);

  // Online payment is not set up yet. Do NOT pretend the plan changed: the server is the
  // source of truth for a user's plan, and nothing here talks to it.
  const handleSelectPlan = (plan) => {
    if (isPlanCurrent(plan)) return;
    toast.info(`Online upgrades aren't available yet. Please contact support to switch to ${plan.name}.`);
  };

  const isPlanCurrent = (plan) => {
    const name = (plan.name || '').toLowerCase();
    return name === currentPlanName;
  };

  const getPlanBadgeIcon = (plan) => {
    if (plan.popular) return <Crown size={14} />;
    if (plan.billingType === 'yearly') return <Sparkles size={14} />;
    if (plan.billingType === 'monthly') return <Zap size={14} />;
    return <Shield size={14} />;
  };

  if (entitlements && entitlements.pricingEnabled === false) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Jobsheet is free right now</h1>
            <p className={styles.subtitle}>
              Every feature is included and nothing is limited. There is no plan to buy and no payment to make.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Subscription Plans</h1>
          <p className={styles.subtitle}>
            Manage your subscription and upgrade anytime to scale your service center.
          </p>
        </div>
        <div className={styles.currentBadge}>
          <span className={styles.currentBadgeLabel}>Active Plan</span>
          <span className={styles.currentBadgeValue}>
            {user.plan || user.planName || 'Free Plan'}
          </span>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingWrapper}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Loading available plans...</p>
        </div>
      ) : (
        <div className={styles.horizontalScrollContainer}>
          <div className={styles.cardsRow}>
            {plans.map((plan) => {
              const id = plan._id || plan.id;
              const isCurrent = isPlanCurrent(plan);
              const isYearly = plan.billingType === 'yearly';
              const isFree = plan.billingType === 'free' || Number(plan.price) === 0;

              return (
                <div
                  key={id}
                  className={`${styles.planCard} ${isCurrent ? styles.currentCard : ''} ${
                    plan.popular ? styles.popularCard : ''
                  }`}
                >
                  {plan.popular && (
                    <div className={styles.popularTag}>
                      <Crown size={12} /> Most Popular
                    </div>
                  )}

                  <div className={styles.cardHeader}>
                    <div className={styles.planTypeBadge}>
                      {getPlanBadgeIcon(plan)}
                      <span>
                        {isFree ? 'Free' : isYearly ? 'Yearly Plan' : 'Monthly Plan'}
                      </span>
                    </div>
                    <h3 className={styles.planName}>{plan.name}</h3>
                    <p className={styles.tagline}>{plan.tagLine || 'Features included with this plan'}</p>
                  </div>

                  <div className={styles.priceSection}>
                    {isFree ? (
                      <div className={styles.priceRow}>
                        <span className={styles.priceValue}>Free</span>
                      </div>
                    ) : (
                      <div className={styles.priceRow}>
                        <span className={styles.currencySymbol}>₹</span>
                        <span className={styles.priceValue}>{plan.price}</span>
                        <span className={styles.priceInterval}>
                          {isYearly ? '/ yr' : '/ mo'}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className={`${styles.actionBtn} ${
                      isCurrent
                        ? styles.currentBtn
                        : plan.popular
                        ? styles.popularBtn
                        : styles.standardBtn
                    }`}
                    disabled={isCurrent || upgradingId === id}
                    onClick={() => handleSelectPlan(plan)}
                  >
                    {isCurrent ? (
                      <span className={styles.btnContent}>
                        <Check size={16} /> Current Plan
                      </span>
                    ) : upgradingId === id ? (
                      'Updating...'
                    ) : (
                      'Upgrade Plan'
                    )}
                  </button>

                  <div className={styles.cardDivider} />

                  <div className={styles.limitsBlock}>
                    <div className={styles.limitItem}>
                      <span className={styles.limitLabel}>Job Sheets:</span>
                      <span className={styles.limitValue}>
                        {plan.jobSheetLimit > 0 ? plan.jobSheetLimit : 'Unlimited'}
                      </span>
                    </div>
                    <div className={styles.limitItem}>
                      <span className={styles.limitLabel}>Technicians:</span>
                      <span className={styles.limitValue}>
                        {plan.staffLimit > 0 ? plan.staffLimit : 'Unlimited'}
                      </span>
                    </div>
                    <div className={styles.limitItem}>
                      <span className={styles.limitLabel}>Sub-users:</span>
                      <span className={styles.limitValue}>
                        {plan.subuserLimit > 0 ? plan.subuserLimit : 'Unlimited'}
                      </span>
                    </div>
                  </div>

                  <div className={styles.featuresSection}>
                    <div className={styles.featuresHeading}>What's included:</div>
                    <ul className={styles.featuresList}>
                      {plan.features?.map((feature, idx) => (
                        <li key={idx} className={styles.featureItem}>
                          <span className={styles.checkIcon}>
                            <Check size={14} />
                          </span>
                          <span className={styles.featureText}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

