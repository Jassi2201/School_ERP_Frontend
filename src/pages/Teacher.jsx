import { useState, useEffect } from 'react';
import { getTeachers, getTeacherById, createTeacher, updateTeacher, deleteTeacher } from '../services/teacherService';
import { usePermission } from '../hooks/usePermission';
import { Search, ChevronDown, Pencil, Trash2, Plus } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';

const Teacher = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({
    login_id: '',
    password: '',
    full_name: '',
    email: '',
    mobile: '',
    department: '',
    qualification: '',
    joining_date: '',
    subject: '',
  });

  const { can } = usePermission();
  const canCreate = can('TEACHER', 'CREATE');
  const canUpdate = can('TEACHER', 'UPDATE');
  const canDelete = can('TEACHER', 'DELETE');

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getTeachers();
      setTeachers(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      login_id: '',
      password: '',
      full_name: '',
      email: '',
      mobile: '',
      department: '',
      qualification: '',
      joining_date: '',
      subject: '',
    });
    setModalOpen(true);
  };

  const openEditModal = async (teacher) => {
    try {
      setLoading(true);
      const res = await getTeacherById(teacher.id);
      const data = res.data.data;
      setEditingId(data.id);
      setForm({
        login_id: data.login_id,
        password: '',
        full_name: data.full_name || '',
        email: data.email || '',
        mobile: data.mobile || '',
        department: data.department || '',
        qualification: data.qualification || '',
        joining_date: data.joining_date || '',
        subject: data.subject || '',
      });
      setModalOpen(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load teacher data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await updateTeacher(editingId, payload);
      } else {
        if (!form.password) {
          alert('Password is required for new teacher');
          return;
        }
        await createTeacher(form);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTeacher(deleteId);
      setConfirmOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const openConfirmModal = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading teachers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border p-4 rounded">
        {error}
        <button onClick={fetchData} className="ml-4 underline">Retry</button>
      </div>
    );
  }

  return (
    <div>
      {/* Filter Bar */}
      <div className="bg-[#ededed] border-b px-3 py-3 -mx-4 -mt-4 mb-4">
        <div className="bg-white border px-4 py-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 border rounded px-3 h-10 bg-white">
              <Search size={15} className="text-gray-400" />
              <input type="text" placeholder="Search teachers..." className="w-[220px] outline-none text-sm" />
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <button className="text-sm text-gray-600 flex items-center gap-2">1 filter applied <ChevronDown size={14} /></button>
            <button className="text-sm text-red-500">Clear Filter</button>
            {canCreate && (
              <button
                onClick={openCreateModal}
                className="h-10 px-5 text-white text-sm rounded bg-gradient-to-r from-[#d94d59] to-[#e47b4a] flex items-center gap-2"
              >
                <Plus size={16} /> Add Teacher
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Login ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qualification</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mobile</th>
              {(canUpdate || canDelete) && (
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {teachers.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 text-sm">{t.id}</td>
                <td className="px-4 py-3 text-sm font-medium">{t.full_name}</td>
                <td className="px-4 py-3 text-sm">{t.login_id}</td>
                <td className="px-4 py-3 text-sm">{t.department || '—'}</td>
                <td className="px-4 py-3 text-sm">{t.qualification || '—'}</td>
                <td className="px-4 py-3 text-sm">{t.subject || '—'}</td>
                <td className="px-4 py-3 text-sm">{t.email || '—'}</td>
                <td className="px-4 py-3 text-sm">{t.mobile || '—'}</td>
                {(canUpdate || canDelete) && (
                  <td className="px-4 py-3 text-right space-x-2">
                    {canUpdate && (
                      <button
                        onClick={() => openEditModal(t)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <Pencil size={16} />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => openConfirmModal(t.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {teachers.length === 0 && (
              <tr><td colSpan="10" className="text-center py-8 text-gray-500">No teachers found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Reusable Modal for Create/Edit */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Teacher' : 'Add Teacher'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Login ID *</label>
              <input
                type="text"
                name="login_id"
                value={form.login_id}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password {editingId ? '(leave blank to keep)' : '*'}
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                required={!editingId}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
              <input
                type="text"
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input
                type="text"
                name="department"
                value={form.department}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
              <input
                type="text"
                name="qualification"
                value={form.qualification}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
              <input
                type="date"
                name="joining_date"
                value={form.joining_date}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-[#d94d59] to-[#e47b4a] text-white rounded hover:opacity-90"
            >
              {editingId ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reusable Confirm Modal */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Teacher"
        message="Are you sure you want to delete this teacher? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
      />
    </div>
  );
};

export default Teacher;