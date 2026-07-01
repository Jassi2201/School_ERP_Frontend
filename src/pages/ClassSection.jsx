import { useState, useEffect } from 'react';
import { getClasses, createClass, updateClass, deleteClass, getSectionsByClass, createSection, updateSection, deleteSection } from '../services/classSectionService';
import { useModulePermissions } from '../hooks/useModulePermissions';
import { Search, ChevronDown, Pencil, Trash2, Plus } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';

const ClassSection = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedClass, setExpandedClass] = useState(null);
  const [sections, setSections] = useState({});

  const [classModalOpen, setClassModalOpen] = useState(false);
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [classForm, setClassForm] = useState({ name: '' });
  const [sectionForm, setSectionForm] = useState({ name: '' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ type: '', id: null });

  const { canCreate, canUpdate, canDelete } = useModulePermissions();

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await getClasses();
      setClasses(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClasses(); }, []);

  const fetchSections = async (classId) => {
    try {
      const res = await getSectionsByClass(classId);
      setSections(prev => ({ ...prev, [classId]: res.data.data }));
    } catch (err) {
      alert('Failed to load sections');
    }
  };

  const toggleExpand = (classId) => {
    if (expandedClass === classId) {
      setExpandedClass(null);
    } else {
      setExpandedClass(classId);
      if (!sections[classId]) fetchSections(classId);
    }
  };

  // Class CRUD
  const openClassModal = (cls = null) => {
    setEditingClass(cls);
    setClassForm(cls ? { name: cls.name } : { name: '' });
    setClassModalOpen(true);
  };

  const handleClassSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClass) {
        await updateClass(editingClass.id, classForm);
      } else {
        await createClass(classForm);
      }
      setClassModalOpen(false);
      fetchClasses();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDeleteClass = async () => {
    try {
      await deleteClass(deleteTarget.id);
      setConfirmOpen(false);
      fetchClasses();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  // Section CRUD
  const openSectionModal = (classId, section = null) => {
    setSelectedClassId(classId);
    setEditingSection(section);
    setSectionForm(section ? { name: section.name } : { name: '' });
    setSectionModalOpen(true);
  };

  const handleSectionSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...sectionForm, class_id: selectedClassId };
      if (editingSection) {
        await updateSection(editingSection.id, data);
      } else {
        await createSection(data);
      }
      setSectionModalOpen(false);
      fetchSections(selectedClassId);
      fetchClasses(); // update section count
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDeleteSection = async () => {
    try {
      await deleteSection(deleteTarget.id);
      setConfirmOpen(false);
      if (selectedClassId) fetchSections(selectedClassId);
      fetchClasses();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const openConfirmModal = (type, id, classId = null) => {
    setDeleteTarget({ type, id });
    setSelectedClassId(classId);
    setConfirmOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border p-4 rounded">
        {error}
        <button onClick={fetchClasses} className="ml-4 underline">Retry</button>
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
              <input type="text" placeholder="Search classes..." className="w-[220px] outline-none text-sm" />
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <button className="text-sm text-gray-600 flex items-center gap-2">1 filter applied <ChevronDown size={14} /></button>
            <button className="text-sm text-red-500">Clear Filter</button>
            {canCreate && (
              <button
                onClick={() => openClassModal()}
                className="h-10 px-5 text-white text-sm rounded bg-gradient-to-r from-[#d94d59] to-[#e47b4a] flex items-center gap-2"
              >
                <Plus size={16} /> Add Class
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Classes List */}
      <div className="bg-white rounded shadow-sm overflow-hidden">
        {classes.map((cls) => (
          <div key={cls.id} className="border-b last:border-b-0">
            <div
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer"
              onClick={() => toggleExpand(cls.id)}
            >
              <div className="flex items-center gap-3">
                <span className="font-medium">{cls.name}</span>
                <span className="text-sm text-gray-500">({cls.section_count || 0} sections)</span>
              </div>
              <div className="flex items-center gap-2">
                {(canUpdate || canDelete) && (
                  <>
                    {canUpdate && (
                      <button
                        onClick={(e) => { e.stopPropagation(); openClassModal(cls); }}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <Pencil size={16} />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={(e) => { e.stopPropagation(); openConfirmModal('class', cls.id); }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </>
                )}
                <ChevronDown
                  size={18}
                  className={`transform transition ${expandedClass === cls.id ? 'rotate-180' : ''}`}
                />
              </div>
            </div>

            {expandedClass === cls.id && (
              <div className="px-4 py-3 bg-gray-50 border-t">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Sections</h4>
                  {canCreate && (
                    <button
                      onClick={() => openSectionModal(cls.id)}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Section
                    </button>
                  )}
                </div>
                {sections[cls.id] && sections[cls.id].length > 0 ? (
                  <ul className="space-y-1">
                    {sections[cls.id].map((sec) => (
                      <li key={sec.id} className="flex items-center justify-between px-3 py-2 bg-white rounded border">
                        <span>{sec.name}</span>
                        {(canUpdate || canDelete) && (
                          <div className="flex gap-2">
                            {canUpdate && (
                              <button
                                onClick={() => openSectionModal(cls.id, sec)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Pencil size={14} />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => openConfirmModal('section', sec.id, cls.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No sections added yet.</p>
                )}
              </div>
            )}
          </div>
        ))}
        {classes.length === 0 && (
          <div className="text-center py-8 text-gray-500">No classes found.</div>
        )}
      </div>

      {/* Class Modal */}
      <Modal
        isOpen={classModalOpen}
        onClose={() => setClassModalOpen(false)}
        title={editingClass ? 'Edit Class' : 'Add Class'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleClassSubmit}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class Name *</label>
              <input
                type="text"
                name="name"
                value={classForm.name}
                onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setClassModalOpen(false)}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-[#d94d59] to-[#e47b4a] text-white rounded hover:opacity-90"
            >
              {editingClass ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Section Modal */}
      <Modal
        isOpen={sectionModalOpen}
        onClose={() => setSectionModalOpen(false)}
        title={editingSection ? 'Edit Section' : 'Add Section'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSectionSubmit}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section Name *</label>
              <input
                type="text"
                name="name"
                value={sectionForm.name}
                onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setSectionModalOpen(false)}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-[#d94d59] to-[#e47b4a] text-white rounded hover:opacity-90"
            >
              {editingSection ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={deleteTarget.type === 'class' ? handleDeleteClass : handleDeleteSection}
        title={`Delete ${deleteTarget.type === 'class' ? 'Class' : 'Section'}`}
        message={`Are you sure you want to delete this ${deleteTarget.type}?`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
      />
    </div>
  );
};

export default ClassSection;