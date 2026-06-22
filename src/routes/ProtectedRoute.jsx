import { Navigate } from 'react-router-dom';
import { usePermission } from '../hooks/usePermission';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ moduleCode, children }) => {
  const { user } = useAuth();        // Check authentication first
  const { can } = usePermission();

  // If not logged in, go to login
  if (!user) return <Navigate to="/login" replace />;

  // If logged in but lacks view permission, show 403
  if (moduleCode && !can(moduleCode, 'VIEW')) {
    return <Navigate to="/403" replace />;
  }

  return children;
};

export default ProtectedRoute;