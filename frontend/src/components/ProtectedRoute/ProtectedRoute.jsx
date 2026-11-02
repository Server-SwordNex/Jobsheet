import { Navigate, Outlet } from 'react-router-dom';
import { getItem } from '../../utils/storage';

function ProtectedRoute() {
  const token = getItem('token');
  const auth = getItem('auth');

  if (!token || !auth) {
    return <Navigate to="/login" replace />;
  }

  if (auth.role === 'superadmin') {
    return <Navigate to="/superadmin/dashboard" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
