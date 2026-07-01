import { useState, useEffect } from 'react';
import { getAttendance, getAttendanceById, createAttendance, updateAttendance, deleteAttendance } from '../services/teacherAttendanceService';
import { useModulePermissions } from '../hooks/useModulePermissions';
import { Search, ChevronDown, Pencil, Trash2, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';

const TeacherAttendance = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({
    teacher_id: '',
    attendance_date: '',
    status: 'Present',
    check_in_time: '',
    check_out_time: '',
  });

  const { user } = useAuth();
const { canCreate, canUpdate, canDelete } = useModulePermissions();

  const isTeacher = user?.role === 'Teacher';

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getAttendance();
      setRecords(res.data.data);
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
      teacher_id: isTeacher ? user.id : '',
      attendance_date: '',
      status: 'Present',
      check_in_time: '',
      check_out_time: '',
    });
    setModalOpen(true);
  };

  const openEditModal = async (record) => {
    try {
      setLoading(true);
      const res = await getAttendanceById(record.id);
      const data = res.data.data;
      setEditingId(data.id);
      setForm({
        teacher_id: data.teacher_id,
        attendance_date: data.attendance_date || '',
        status: data.status || 'Present',
        check_in_time: data.check_in_time || '',
        check_out_time: data.check_out_time || '',
      });
      setModalOpen(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load record');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateAttendance(editingId, form);
      } else {
        await createAttendance(form);
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
      await deleteAttendance(deleteId);
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
    return <div className="flex justify-center items-center h-64">Loading...</div>;
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
              <input type="text" placeholder="Search teacher..." className="w-[220px] outline-none text-sm" />
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
                <Plus size={16} /> Mark Attendance
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
              {(canUpdate || canDelete) && (
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.map((rec) => (
              <tr key={rec.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 text-sm">{new Date(rec.attendance_date).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-sm font-medium">{rec.teacher_name}</td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium
                    ${rec.status === 'Present' ? 'bg-green-100 text-green-700' :
                      rec.status === 'Absent' ? 'bg-red-100 text-red-700' :
                      rec.status === 'Late' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'}`}>
                    {rec.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">{rec.check_in_time || '—'}</td>
                <td className="px-4 py-3 text-sm">{rec.check_out_time || '—'}</td>
                {(canUpdate || canDelete) && (
                  <td className="px-4 py-3 text-right space-x-2">
                    {canUpdate && (
                      <button onClick={() => openEditModal(rec)} className="text-blue-600 hover:text-blue-800 p-1">
                        <Pencil size={16} />
                      </button>
                    )}
                    {canDelete && (
                      <button onClick={() => openConfirmModal(rec.id)} className="text-red-500 hover:text-red-700 p-1">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {records.length === 0 && (
              <tr><td colSpan="8" className="text-center py-8 text-gray-500">No records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Reusable Modal for Create/Edit */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Attendance' : 'Mark Attendance'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-3">
            {!isTeacher && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teacher ID *</label>
                <input
                  type="number"
                  name="teacher_id"
                  value={form.teacher_id}
                  onChange={handleChange}
                  className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                name="attendance_date"
                value={form.attendance_date}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
                <option value="Leave">Leave</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check In Time</label>
              <input
                type="time"
                name="check_in_time"
                value={form.check_in_time}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check Out Time</label>
              <input
                type="time"
                name="check_out_time"
                value={form.check_out_time}
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
        title="Delete Attendance"
        message="Are you sure you want to delete this attendance record?"
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
      />
    </div>
  );
};

export default TeacherAttendance;