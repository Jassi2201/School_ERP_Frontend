import { useAuth } from '../context/AuthContext';
import { useModuleCode } from '../context/ModuleContext';

export const useModulePermissions = (optionalCode) => {
  const { modules } = useAuth();
  const contextCode = useModuleCode();
  const code = optionalCode || contextCode;

  if (!code) {
    return { canView: false, canCreate: false, canUpdate: false, canDelete: false };
  }

  const m = modules.find(mod => mod.module_code === code);
  if (!m) {
    return { canView: false, canCreate: false, canUpdate: false, canDelete: false };
  }

  return {
    canView: Boolean(m.can_view),
    canCreate: Boolean(m.can_create),
    canUpdate: Boolean(m.can_update),
    canDelete: Boolean(m.can_delete),
  };
};