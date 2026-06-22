import { useState, useEffect } from 'react';
import { getRoles, getRolePermissions, updateRolePermissions } from '../services/rolePermissionService';
import { usePermission } from '../hooks/usePermission';
import { Search, ChevronDown, Save, RefreshCw } from 'lucide-react';

const RolePermissions = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { can } = usePermission();
  const canUpdate = can('ROLE_PERMISSION', 'UPDATE');

  // Load roles on mount
  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await getRoles();
      setRoles(res.data.data);
      if (res.data.data.length > 0) {
        setSelectedRoleId(res.data.data[0].id);
      }
    } catch (err) {
      setError('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  // Load permissions when role changes
  useEffect(() => {
    if (selectedRoleId) {
      fetchPermissions(selectedRoleId);
    }
  }, [selectedRoleId]);

  const fetchPermissions = async (roleId) => {
    try {
      setLoading(true);
      const res = await getRolePermissions(roleId);
      setPermissions(res.data.data);
      setError('');
    } catch (err) {
      setError('Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (moduleId, field) => (e) => {
    const checked = e.target.checked;
    setPermissions(prev =>
      prev.map(p =>
        p.id === moduleId ? { ...p, [field]: checked ? 1 : 0 } : p
      )
    );
  };

  const handleSave = async () => {
    if (!canUpdate) {
      alert('You do not have permission to update permissions.');
      return;
    }
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      const payload = permissions.map(p => ({
        module_id: p.id,
        can_view: p.can_view,
        can_create: p.can_create,
        can_update: p.can_update,
        can_delete: p.can_delete,
      }));
      await updateRolePermissions(selectedRoleId, payload);
      setSuccess('Permissions updated successfully!');
      // Refresh to reflect changes
      await fetchPermissions(selectedRoleId);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = (e) => {
    setSelectedRoleId(Number(e.target.value));
  };

  if (loading && roles.length === 0) {
    return <div className="flex justify-center items-center h-64">Loading roles...</div>;
  }

  return (
    <div>
      {/* Header with role selector and save button */}
      <div className="bg-[#ededed] border-b px-3 py-3 -mx-4 -mt-4 mb-4">
        <div className="bg-white border px-4 py-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-sm font-medium text-gray-700">Select Role:</label>
            <select
              value={selectedRoleId || ''}
              onChange={handleRoleChange}
              className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {roles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.role_name} ({role.user_count} users)
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving || !canUpdate}
              className="h-10 px-5 text-white text-sm rounded bg-gradient-to-r from-[#d94d59] to-[#e47b4a] flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={16} /> {saving ? 'Saving...' : 'Save Permissions'}
            </button>
          </div>
        </div>
      </div>

      {/* Feedback messages */}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded mb-4">{success}</div>}

      {/* Permissions Table */}
      {selectedRoleId && (
        <div className="bg-white rounded shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Module</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">View</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Create</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Update</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {permissions.map((module) => (
                  <tr key={module.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm font-medium">{module.module_name}</td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={module.can_view === 1}
                        onChange={handleCheckboxChange(module.id, 'can_view')}
                        disabled={!canUpdate}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={module.can_create === 1}
                        onChange={handleCheckboxChange(module.id, 'can_create')}
                        disabled={!canUpdate}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={module.can_update === 1}
                        onChange={handleCheckboxChange(module.id, 'can_update')}
                        disabled={!canUpdate}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={module.can_delete === 1}
                        onChange={handleCheckboxChange(module.id, 'can_delete')}
                        disabled={!canUpdate}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  </tr>
                ))}
                {permissions.length === 0 && (
                  <tr><td colSpan="5" className="text-center py-8 text-gray-500">No modules found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolePermissions;