import { usePermission } from '../hooks/usePermission';
const PermissionButton = ({ moduleCode, action, children, ...props }) => {
  const { can } = usePermission();
  if (!can(moduleCode, action)) return null;
  return <button {...props}>{children}</button>;
};
export default PermissionButton;