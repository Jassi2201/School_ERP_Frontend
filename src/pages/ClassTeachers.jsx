import { useState, useEffect } from 'react';
import { getClassTeachers, createClassTeacher, updateClassTeacher, deleteClassTeacher } from '../services/classTeacherService';
import { getTeachers } from '../services/teacherService';
import { getClasses, getSectionsByClass } from '../services/classSectionService';
import { useModulePermissions } from '../hooks/useModulePermissions';
import { Search, ChevronDown, Pencil, Trash2, Plus } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';

const ClassTeachers = () => {
  const [records, setRecords] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({
    teacher_id: '',
    class_id: '',
    section_id: '',
    academic_year: '',
  });

  const { canCreate, canUpdate, canDelete } = useModulePermissions();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ctRes, teachersRes, classesRes] = await Promise.all([
        getClassTeachers(),
        getTeachers(),
        getClasses(),
      ]);
      setRecords(ctRes.data.data);
      setTeachers(teachersRes.data.data);
      setClasses(classesRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

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
    setForm({ teacher_id: '', class_id: '', section_id: '', academic_year: '' });
    setSelectedClassId('');
    setSections([]);
  };

  const openCreateModal = () => {
    setEditingId(null);
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingId(record.id);
    setForm({
      teacher_id: record.teacher_id,
      class_id: record.class_id,
      section_id: record.section_id,
      academic_year: record.academic_year,
    });
    setSelectedClassId(record.class_id);
    if (record.class_id) {
      getSectionsByClass(record.class_id).then(res => setSections(res.data.data)).catch(() => setSections([]));
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateClassTeacher(editingId, form);
      } else {
        await createClassTeacher(form);
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
      await deleteClassTeacher(deleteId);
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
  if (error) return <div className="bg-red-50 border p-4 rounded">{error} <button onClick={fetchData} className="ml-4 underline">Retry</button></div>;

  return (
    <div>
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
                <Plus size={16} /> Add Class Teacher
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.No.</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Academic Year</th>
              {(canUpdate || canDelete) && <th className="px-4 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.map((r, i) => (
              <tr key={r.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 text-sm">{i + 1}</td>
                <td className="px-4 py-3 text-sm font-medium">{r.teacher_name}</td>
                <td className="px-4 py-3 text-sm">{r.class_name}</td>
                <td className="px-4 py-3 text-sm">{r.section_name}</td>
                <td className="px-4 py-3 text-sm">{r.academic_year}</td>
                {(canUpdate || canDelete) && (
                  <td className="px-4 py-3 text-right space-x-2">
                    {canUpdate && <button onClick={() => openEditModal(r)} className="text-blue-600 p-1"><Pencil size={16} /></button>}
                    {canDelete && <button onClick={() => openConfirmModal(r.id)} className="text-red-500 p-1"><Trash2 size={16} /></button>}
                  </td>
                )}
              </tr>
            ))}
            {records.length === 0 && <tr><td colSpan="6" className="text-center py-8 text-gray-500">No records found.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Class Teacher' : 'Add Class Teacher'} maxWidth="max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium">Teacher *</label>
              <select name="teacher_id" value={form.teacher_id} onChange={handleChange} className="w-full border p-2 rounded" required>
                <option value="">Select</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
              </select>
            </div>
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
              <label className="block text-sm font-medium">Academic Year *</label>
              <input type="text" name="academic_year" value={form.academic_year} onChange={handleChange} className="w-full border p-2 rounded" required />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-gradient-to-r from-[#d94d59] to-[#e47b4a] text-white rounded">{editingId ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="Delete Class Teacher" message="Are you sure?" />
    </div>
  );
};

export default ClassTeachers;