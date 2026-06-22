import api from '../api/axios';

export const getRoles = () => api.get('/role-permissions/roles');
export const getRolePermissions = (roleId) => api.get(`/role-permissions/role/${roleId}`);
export const updateRolePermissions = (roleId, permissions) =>
  api.put(`/role-permissions/role/${roleId}`, { permissions });