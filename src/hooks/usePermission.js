import { useAuth } from '../context/AuthContext';
export const usePermission = () => {
  const { modules } = useAuth();
  const can = (code, action) => {
    const m = modules.find(m => m.module_code === code);
    if (!m) return false;
    switch (action) {
      case 'VIEW': return m.can_view;
      case 'CREATE': return m.can_create;
      case 'UPDATE': return m.can_update;
      case 'DELETE': return m.can_delete;
      default: return false;
    }
  };
  return { can };
};