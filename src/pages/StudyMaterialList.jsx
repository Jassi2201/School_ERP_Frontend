import { useState, useEffect } from 'react';
import { getMaterials, createMaterial, updateMaterial, deleteMaterial } from '../services/studyMaterialService';
import { getClasses, getSectionsByClass } from '../services/classSectionService';
import { getSubjects } from '../services/subjectService';
import { useModulePermissions } from '../hooks/useModulePermissions';
import { Search, ChevronDown, Pencil, Trash2, Plus } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';

const TYPES = ['pdf', 'note', 'video', 'ppt', 'lecture', 'ebook', 'link'];

const StudyMaterialList = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');

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
    type: 'pdf',
    link_url: '',
  });
  const [file, setFile] = useState(null);

  const { canCreate, canUpdate, canDelete } = useModulePermissions();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [matRes, classesRes, subjectsRes] = await Promise.all([
        getMaterials(),
        getClasses(),
        getSubjects(),
      ]);
      setMaterials(matRes.data.data);
      setClasses(classesRes.data.data);
      setSubjects(subjectsRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (selectedClassId) {
      getSectionsByClass(selectedClassId).then(res => setSections(res.data.data)).catch(() => setSections([]));
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

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const resetForm = () => {
    setForm({ class_id: '', section_id: '', subject_id: '', title: '', description: '', type: 'pdf', link_url: '' });
    setSelectedClassId('');
    setSections([]);
    setFile(null);
  };

  const openCreateModal = () => {
    setEditingId(null);
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setForm({
      class_id: item.class_id,
      section_id: item.section_id,
      subject_id: item.subject_id,
      title: item.title,
      description: item.description || '',
      type: item.type,
      link_url: item.link_url || '',
    });
    setSelectedClassId(item.class_id);
    if (item.class_id) {
      getSectionsByClass(item.class_id).then(res => setSections(res.data.data)).catch(() => setSections([]));
    }
    setFile(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => formData.append(key, form[key]));
      if (file && form.type !== 'link') formData.append('file', file);

      if (editingId) {
        await updateMaterial(editingId, formData);
      } else {
        await createMaterial(formData);
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
      await deleteMaterial(deleteId);
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

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
            <button className="text-sm text-gray-600">1 filter applied <ChevronDown size={14} /></button>
            <button className="text-sm text-red-500">Clear Filter</button>
            {canCreate && (
              <button onClick={openCreateModal} className="h-10 px-5 text-white text-sm rounded bg-gradient-to-r from-[#d94d59] to-[#e47b4a] flex items-center gap-2">
                <Plus size={16} /> Add Material
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">File/Link</th>
              {(canUpdate || canDelete) && <th className="px-4 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {materials.map((item, i) => (
              <tr key={item.id} className="hover:bg-gray-50 transition border-t">
                <td className="px-4 py-3">{i+1}</td>
                <td className="px-4 py-3 font-medium">{item.title}</td>
                <td className="px-4 py-3">{item.class_name}</td>
                <td className="px-4 py-3">{item.section_name}</td>
                <td className="px-4 py-3">{item.subject_name}</td>
                <td className="px-4 py-3 uppercase text-xs">{item.type}</td>
                <td className="px-4 py-3">
                  {item.type === 'link' ? (
                    <a href={item.link_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Open Link</a>
                  ) : item.file_path ? (
                    <a href={`${baseURL}${item.file_path}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Download</a>
                  ) : '—'}
                </td>
                {(canUpdate || canDelete) && (
                  <td className="px-4 py-3 text-right space-x-2">
                    {canUpdate && <button onClick={() => openEditModal(item)} className="text-blue-600 p-1"><Pencil size={16} /></button>}
                    {canDelete && <button onClick={() => openConfirmModal(item.id)} className="text-red-500 p-1"><Trash2 size={16} /></button>}
                  </td>
                )}
              </tr>
            ))}
            {materials.length === 0 && <tr><td colSpan="8" className="text-center py-8">No materials found.</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Material' : 'Add Material'} maxWidth="max-w-2xl">
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
              <label className="block text-sm font-medium">Subject *</label>
              <select name="subject_id" value={form.subject_id} onChange={handleChange} className="w-full border p-2 rounded" required>
                <option value="">Select</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Type *</label>
              <select name="type" value={form.type} onChange={handleChange} className="w-full border p-2 rounded" required>
                {TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium">Title *</label>
              <input type="text" name="title" value={form.title} onChange={handleChange} className="w-full border p-2 rounded" required />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows="3" className="w-full border p-2 rounded" />
            </div>
            {form.type === 'link' ? (
              <div className="col-span-2">
                <label className="block text-sm font-medium">Link URL *</label>
                <input type="url" name="link_url" value={form.link_url} onChange={handleChange} className="w-full border p-2 rounded" placeholder="https://..." required={form.type === 'link'} />
              </div>
            ) : (
              <div className="col-span-2">
                <label className="block text-sm font-medium">Upload File</label>
                <input type="file" onChange={handleFileChange} className="w-full border p-2 rounded" />
                {editingId && !file && <p className="text-xs text-gray-500 mt-1">Leave empty to keep existing file</p>}
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-gradient-to-r from-[#d94d59] to-[#e47b4a] text-white rounded">{editingId ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="Delete Material" message="Are you sure?" />
    </div>
  );
};

export default StudyMaterialList;