/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

/* What the signed-in business's plan allows (limits and features). The server enforces all of it;
   this only lets the app hide screens and buttons that the plan does not include. */

const EntitlementsContext = createContext({ entitlements: null, loading: true });

export function EntitlementsProvider({ children }) {
  const [state, setState] = useState({ entitlements: null, loading: true });

  useEffect(() => {
    let alive = true;
    api
      .get('/api/me/entitlements')
      .then((res) => alive && setState({ entitlements: res?.data || null, loading: false }))
      .catch(() => alive && setState({ entitlements: null, loading: false }));
    return () => {
      alive = false;
    };
  }, []);

  return <EntitlementsContext.Provider value={state}>{children}</EntitlementsContext.Provider>;
}

export const useEntitlements = () => useContext(EntitlementsContext);

/** True unless the plan explicitly lacks the feature (unknown while loading / on error = allowed). */
export const useHasFeature = (feature) => {
  const { entitlements } = useEntitlements();
  return entitlements ? entitlements.features?.[feature] !== false : true;
};

/** Renders its children only when the plan includes `feature`; otherwise an upgrade notice. */
export function RequireFeature({ feature, what, children }) {
  const { loading } = useEntitlements();
  const allowed = useHasFeature(feature);

  if (loading) return null;
  if (allowed) return children;

  return (
    <div style={{ maxWidth: 520, margin: '64px auto', textAlign: 'center' }}>
      <h2 style={{ margin: '0 0 8px', color: 'var(--dark)' }}>{what} is not in your plan</h2>
      <p style={{ margin: '0 0 18px', color: 'rgba(var(--dark-rgb), 0.6)' }}>
        Upgrade your subscription to use {what.toLowerCase()}.
      </p>
      <Link to="/subscription" style={{ color: 'var(--accent)', fontWeight: 600 }}>
        View plans
      </Link>
    </div>
  );
}
