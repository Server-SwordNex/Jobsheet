import { useEffect, useRef } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getItem } from '../../utils/storage';
import { toast } from 'react-toastify';

function SuperAdminRoute() {
  const auth = getItem('auth');
  const token = getItem('token');
  const warnedRef = useRef(false);

  useEffect(() => {
    if (token && auth && auth.role !== 'superadmin' && !warnedRef.current) {
      warnedRef.current = true;
      toast.error('Unauthorized Access: Admin privileges required.');
    }
  }, [token, auth]);

  // If not logged in at all, redirect to Admin login
  if (!token || !auth) {
    return <Navigate to="/superadmin/login" replace />;
  }

  // If logged in as normal user, block access to Admin panel and redirect to User Dashboard
  if (auth.role !== 'superadmin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default SuperAdminRoute;
