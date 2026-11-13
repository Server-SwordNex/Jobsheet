import { useState, useEffect } from 'react';
import { getPlans } from '../../api/endpoints';
import styles from './PricingInfo.module.css';

export default function PricingInfo() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlans()
      .then((data) => setPlans(Array.isArray(data) ? data : []))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={`${styles.container} publicTheme`}><p className={styles.loading}>Loading...</p></div>;

  return (
    <div className={`${styles.container} publicTheme`}>
      <h1 className={styles.heading}>Pricing Plans</h1>
      {plans.length === 0 ? (
        <p className={styles.empty}>No plans available.</p>
      ) : (
        <div className={styles.grid}>
          {plans.map((plan) => (
            <div key={plan.id || plan._id} className={`${styles.card} ${plan.popular ? styles.popular : ''}`}>
              {plan.popular && <span className={styles.badge}>Popular</span>}
              <h2 className={styles.name}>{plan.name}</h2>
              <p className={styles.billing}>{plan.billingType}</p>
              <p className={styles.price}>₹{plan.price ?? 0}</p>
              {plan.tagLine && <p className={styles.tagline}>{plan.tagLine}</p>}
              {plan.features?.length > 0 && (
                <ul className={styles.features}>
                  {plan.features.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
