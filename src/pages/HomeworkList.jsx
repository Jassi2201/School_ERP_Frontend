import { useState, useEffect } from 'react';
import { getHomeworkList, createHomework, updateHomework, deleteHomework } from '../services/homeworkService';
import { getClasses, getSectionsByClass } from '../services/classSectionService';
import { getSubjects } from '../services/subjectService';
import { useModulePermissions } from '../hooks/useModulePermissions';
import { useAuth } from '../context/AuthContext';
import { Search, ChevronDown, Pencil, Trash2, Plus, Eye } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';

const HomeworkList = () => {
  const { user } = useAuth();
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Master data for dropdowns
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({
    class_id: '',
    section_id: '',
    subject_id: '',
    title: '',
    description: '',
    due_date: '',
  });
  const [attachmentFile, setAttachmentFile] = useState(null);

  const { canCreate, canUpdate, canDelete } = useModulePermissions();

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [hwRes, classesRes, subjectsRes] = await Promise.all([
        getHomeworkList(),
        getClasses(),
        getSubjects(),
      ]);
      setHomework(hwRes.data.data);
      setClasses(classesRes.data.data);
      setSubjects(subjectsRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load');
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

  const handleFileChange = (e) => {
    setAttachmentFile(e.target.files[0]);
  };

  const resetForm = () => {
    setForm({
      class_id: '',
      section_id: '',
      subject_id: '',
      title: '',
      description: '',
      due_date: '',
    });
    setSelectedClassId('');
    setSections([]);
    setAttachmentFile(null);
  };

  const openCreateModal = () => {
    setEditingId(null);
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (hw) => {
    setEditingId(hw.id);
    setForm({
      class_id: hw.class_id,
      section_id: hw.section_id,
      subject_id: hw.subject_id,
      title: hw.title,
      description: hw.description || '',
      due_date: hw.due_date,
    });
    setSelectedClassId(hw.class_id);
    if (hw.class_id) {
      getSectionsByClass(hw.class_id).then(res => setSections(res.data.data)).catch(() => setSections([]));
    }
    setAttachmentFile(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (form[key]) formData.append(key, form[key]);
      });
      if (attachmentFile) formData.append('attachment', attachmentFile);

      if (editingId) {
        await updateHomework(editingId, formData);
      } else {
        await createHomework(formData);
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
      await deleteHomework(deleteId);
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
      {/* Filter Bar */}
      <div className="bg-[#ededed] border-b px-3 py-3 -mx-4 -mt-4 mb-4">
        <div className="bg-white border px-4 py-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 border rounded px-3 h-10 bg-white">
              <Search size={15} className="text-gray-400" />
              <input type="text" placeholder="Search homework..." className="w-[220px] outline-none text-sm" />
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
                <Plus size={16} /> Add Homework
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attachment</th>
              {(canUpdate || canDelete) && (
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {homework.map((hw, index) => (
              <tr key={hw.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 text-sm">{index + 1}</td>
                <td className="px-4 py-3 text-sm font-medium">{hw.title}</td>
                <td className="px-4 py-3 text-sm">{hw.class_name}</td>
                <td className="px-4 py-3 text-sm">{hw.section_name}</td>
                <td className="px-4 py-3 text-sm">{hw.subject_name}</td>
                <td className="px-4 py-3 text-sm">{new Date(hw.due_date).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-sm">
                  {hw.attachment ? (
                    <a href={`${import.meta.env.VITE_BASE_URL || 'http://localhost:5000'}${hw.attachment}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      View
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
                {(canUpdate || canDelete) && (
                  <td className="px-4 py-3 text-right space-x-2">
                    {canUpdate && (
                      <button onClick={() => openEditModal(hw)} className="text-blue-600 hover:text-blue-800 p-1">
                        <Pencil size={16} />
                      </button>
                    )}
                    {canDelete && (
                      <button onClick={() => openConfirmModal(hw.id)} className="text-red-500 hover:text-red-700 p-1">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {homework.length === 0 && (
              <tr><td colSpan="9" className="text-center py-8 text-gray-500">No homework found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Create/Edit */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Homework' : 'Add Homework'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
              <select
                name="class_id"
                value={form.class_id}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="">Select Class</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section *</label>
              <select
                name="section_id"
                value={form.section_id}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={!selectedClassId}
                required
              >
                <option value="">Select Section</option>
                {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
              <select
                name="subject_id"
                value={form.subject_id}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="">Select Subject</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
              <input
                type="date"
                name="due_date"
                value={form.due_date}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="3"
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Attachment (PDF/Image)</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileChange}
                className="w-full border p-2 rounded focus:outline-none"
              />
              {editingId && !attachmentFile && (
                <p className="text-xs text-gray-500 mt-1">Leave empty to keep existing file</p>
              )}
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

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Homework"
        message="Are you sure you want to delete this homework?"
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
      />
    </div>
  );
};

export default HomeworkList;