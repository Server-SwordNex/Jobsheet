import { Navigate, Outlet } from 'react-router-dom';
import { getItem } from '../../utils/storage';

function SuperAdminRoute() {
  const auth = getItem('auth');
  if (!auth || auth.role !== 'superadmin') {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

export default SuperAdminRoute;
