import { useState, useEffect } from 'react';
import { getTimetableEntries, createTimetableEntry, updateTimetableEntry, deleteTimetableEntry } from '../services/timetableService';
import { getClasses, getSectionsByClass } from '../services/classSectionService';
import { getSubjects } from '../services/subjectService';
import { getTeachers } from '../services/teacherService';
import { useModulePermissions } from '../hooks/useModulePermissions';
import { Search, ChevronDown, Pencil, Trash2, Plus } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

const TimetableManagement = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Master data for dropdowns
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');

  const [form, setForm] = useState({
    class_id: '',
    section_id: '',
    day_of_week: 'Monday',
    period_number: 1,
    subject_id: '',
    teacher_id: '',
    room: '',
    online_link: '',
    academic_year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
  });

  const { canCreate, canUpdate, canDelete } = useModulePermissions();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [entriesRes, classesRes, subjectsRes, teachersRes] = await Promise.all([
        getTimetableEntries(),
        getClasses(),
        getSubjects(),
        getTeachers(),
      ]);
      setEntries(entriesRes.data.data);
      setClasses(classesRes.data.data);
      setSubjects(subjectsRes.data.data);
      setTeachers(teachersRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Fetch sections when class changes
  useEffect(() => {
    if (selectedClassId) {
      const fetchSections = async () => {
        try {
          const res = await getSectionsByClass(selectedClassId);
          setSections(res.data.data);
        } catch {
          setSections([]);
        }
      };
      fetchSections();
    } else {
      setSections([]);
    }
  }, [selectedClassId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === 'class_id') {
      setSelectedClassId(value);
      setForm(prev => ({ ...prev, section_id: '' }));
    }
  };

  const resetForm = () => {
    setForm({
      class_id: '',
      section_id: '',
      day_of_week: 'Monday',
      period_number: 1,
      subject_id: '',
      teacher_id: '',
      room: '',
      online_link: '',
      academic_year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    });
    setSelectedClassId('');
    setSections([]);
  };

  const openCreateModal = () => {
    setEditingId(null);
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = async (entry) => {
    setEditingId(entry.id);
    setForm({
      class_id: entry.class_id,
      section_id: entry.section_id,
      day_of_week: entry.day_of_week,
      period_number: entry.period_number,
      subject_id: entry.subject_id,
      teacher_id: entry.teacher_id,
      room: entry.room || '',
      online_link: entry.online_link || '',
      academic_year: entry.academic_year,
    });
    setSelectedClassId(entry.class_id);
    if (entry.class_id) {
      try {
        const res = await getSectionsByClass(entry.class_id);
        setSections(res.data.data);
      } catch {
        setSections([]);
      }
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateTimetableEntry(editingId, form);
      } else {
        await createTimetableEntry(form);
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
      await deleteTimetableEntry(deleteId);
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

  if (loading) return <div className="flex justify-center items-center h-64">Loading timetable...</div>;
  if (error) return <div className="bg-red-50 border p-4 rounded">{error} <button onClick={fetchData} className="ml-4 underline">Retry</button></div>;

  return (
    <div>
      {/* Filter Bar */}
      <div className="bg-[#ededed] border-b px-3 py-3 -mx-4 -mt-4 mb-4">
        <div className="bg-white border px-4 py-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 border rounded px-3 h-10 bg-white">
              <Search size={15} className="text-gray-400" />
              <input type="text" placeholder="Search..." className="w-[220px] outline-none text-sm" />
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <button className="text-sm text-gray-600 flex items-center gap-2">1 filter applied <ChevronDown size={14} /></button>
            <button className="text-sm text-red-500">Clear Filter</button>
            {canCreate && (
              <button onClick={openCreateModal} className="h-10 px-5 text-white text-sm rounded bg-gradient-to-r from-[#d94d59] to-[#e47b4a] flex items-center gap-2">
                <Plus size={16} /> Add Timetable Entry
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
              {(canUpdate || canDelete) && <th className="px-4 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {entries.map((item, i) => (
              <tr key={item.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 text-sm">{i + 1}</td>
                <td className="px-4 py-3 text-sm">{item.class_name}</td>
                <td className="px-4 py-3 text-sm">{item.section_name}</td>
                <td className="px-4 py-3 text-sm">{item.day_of_week}</td>
                <td className="px-4 py-3 text-sm">{item.period_number}</td>
                <td className="px-4 py-3 text-sm">{item.subject_name}</td>
                <td className="px-4 py-3 text-sm">{item.teacher_name}</td>
                <td className="px-4 py-3 text-sm">{item.room || '—'}</td>
                <td className="px-4 py-3 text-sm">{item.academic_year}</td>
                {(canUpdate || canDelete) && (
                  <td className="px-4 py-3 text-right space-x-2">
                    {canUpdate && <button onClick={() => openEditModal(item)} className="text-blue-600 p-1"><Pencil size={16} /></button>}
                    {canDelete && <button onClick={() => openConfirmModal(item.id)} className="text-red-500 p-1"><Trash2 size={16} /></button>}
                  </td>
                )}
              </tr>
            ))}
            {entries.length === 0 && <tr><td colSpan="10" className="text-center py-8 text-gray-500">No entries found.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Timetable Entry' : 'Add Timetable Entry'} maxWidth="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Class *</label>
              <select name="class_id" value={form.class_id} onChange={handleChange} className="w-full border p-2 rounded" required>
                <option value="">Select</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Section *</label>
              <select name="section_id" value={form.section_id} onChange={handleChange} className="w-full border p-2 rounded" disabled={!selectedClassId} required>
                <option value="">Select</option>
                {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Day *</label>
              <select name="day_of_week" value={form.day_of_week} onChange={handleChange} className="w-full border p-2 rounded" required>
                {DAYS.map(day => <option key={day} value={day}>{day}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Period Number *</label>
              <select name="period_number" value={form.period_number} onChange={handleChange} className="w-full border p-2 rounded" required>
                {PERIODS.map(p => <option key={p} value={p}>Period {p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Subject *</label>
              <select name="subject_id" value={form.subject_id} onChange={handleChange} className="w-full border p-2 rounded" required>
                <option value="">Select</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Teacher *</label>
              <select name="teacher_id" value={form.teacher_id} onChange={handleChange} className="w-full border p-2 rounded" required>
                <option value="">Select</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Room</label>
              <input type="text" name="room" value={form.room} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium">Academic Year *</label>
              <input type="text" name="academic_year" value={form.academic_year} onChange={handleChange} className="w-full border p-2 rounded" required />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium">Online Class Link</label>
              <input type="url" name="online_link" value={form.online_link} onChange={handleChange} className="w-full border p-2 rounded" placeholder="https://zoom.us/..." />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-gradient-to-r from-[#d94d59] to-[#e47b4a] text-white rounded hover:opacity-90">{editingId ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="Delete Entry" message="Are you sure?" />
    </div>
  );
};

export default TimetableManagement;