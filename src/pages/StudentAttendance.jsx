import { useState, useEffect } from 'react';
import { getAttendance, getAttendanceById, createAttendance, updateAttendance, deleteAttendance } from '../services/studentAttendanceService';
import { getStudents } from '../services/studentService';
import { useModulePermissions } from '../hooks/useModulePermissions';
import { Search, ChevronDown, Pencil, Trash2, Plus } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';

const StudentAttendance = () => {
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({
    student_id: '',
    attendance_date: '',
    status: 'Present',
    remarks: '',
  });

  const { canCreate, canUpdate, canDelete } = useModulePermissions();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [attRes, studentsRes] = await Promise.all([
        getAttendance(),
        getStudents(),
      ]);
      setRecords(attRes.data.data);
      setStudents(studentsRes.data.data);
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
      student_id: '',
      attendance_date: '',
      status: 'Present',
      remarks: '',
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
        student_id: data.student_id,
        attendance_date: data.attendance_date || '',
        status: data.status || 'Present',
        remarks: data.remarks || '',
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
        await updateAttendance(editingId, { status: form.status, remarks: form.remarks });
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

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (error) return (
    <div className="bg-red-50 border p-4 rounded">
      {error} <button onClick={fetchData} className="ml-4 underline">Retry</button>
    </div>
  );

  return (
    <div>
      {/* Filter Bar */}
      <div className="bg-[#ededed] border-b px-3 py-3 -mx-4 -mt-4 mb-4">
        <div className="bg-white border px-4 py-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 border rounded px-3 h-10 bg-white">
              <Search size={15} className="text-gray-400" />
              <input type="text" placeholder="Search attendance..." className="w-[220px] outline-none text-sm" />
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.No.</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
              {(canUpdate || canDelete) && (
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.map((r, index) => (
              <tr key={r.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 text-sm">{index + 1}</td>
                <td className="px-4 py-3 text-sm font-medium">{r.student_name}</td>
                <td className="px-4 py-3 text-sm">{r.class || '—'}</td>
                <td className="px-4 py-3 text-sm">{r.section || '—'}</td>
                <td className="px-4 py-3 text-sm">{new Date(r.attendance_date).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium
                    ${r.status === 'Present' ? 'bg-green-100 text-green-700' :
                      r.status === 'Absent' ? 'bg-red-100 text-red-700' :
                      r.status === 'Late' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">{r.remarks || '—'}</td>
                {(canUpdate || canDelete) && (
                  <td className="px-4 py-3 text-right space-x-2">
                    {canUpdate && <button onClick={() => openEditModal(r)} className="text-blue-600 hover:text-blue-800 p-1"><Pencil size={16} /></button>}
                    {canDelete && <button onClick={() => openConfirmModal(r.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16} /></button>}
                  </td>
                )}
              </tr>
            ))}
            {records.length === 0 && (
              <tr><td colSpan="10" className="text-center py-8 text-gray-500">No records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Attendance' : 'Mark Attendance'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-3">
            {!editingId && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
                  <select
                    name="student_id"
                    value={form.student_id}
                    onChange={handleChange}
                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  >
                    <option value="">Select Student</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.full_name} ({s.class || 'No Class'} - {s.section || 'No Section'})
                      </option>
                    ))}
                  </select>
                </div>
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
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <textarea
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows="2"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-gradient-to-r from-[#d94d59] to-[#e47b4a] text-white rounded hover:opacity-90">
              {editingId ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Attendance"
        message="Are you sure you want to delete this attendance record?"
      />
    </div>
  );
};

export default StudentAttendance;