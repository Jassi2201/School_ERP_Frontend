import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModulePermissions } from '../hooks/useModulePermissions';
import { ModuleProvider } from '../context/ModuleContext';

const ProtectedRoute = ({ moduleCode, children }) => {
  const { user } = useAuth();
  const { canView } = useModulePermissions(moduleCode);

  if (!user) return <Navigate to="/login" replace />;
  if (moduleCode && !canView) return <Navigate to="/403" replace />;

  return <ModuleProvider moduleCode={moduleCode}>{children}</ModuleProvider>;
};

export default ProtectedRoute;