import { useState, useEffect } from 'react';
import { getStudents, getStudentById, createStudent, updateStudent, deleteStudent } from '../services/studentService';
import { getClasses, getSectionsByClass } from '../services/classSectionService';
import { useModulePermissions } from '../hooks/useModulePermissions';
import { Search, ChevronDown, Pencil, Trash2, Plus } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';

const Student = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // For class/section dropdowns
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');

  const [form, setForm] = useState({
    login_id: '',
    password: '',
    full_name: '',
    email: '',
    mobile: '',
    class_id: '',
    section_id: '',
    father_name: '',
    mother_name: '',
    dob: '',
    gender: '',
    roll_number: '',
    admission_date: '',
    address: '',
    father_phone: '',
    mother_phone: '',
    blood_group: '',
    father_occupation: '',
    mother_occupation: '',
    sibling_details: '',
  });

  const { canCreate, canUpdate, canDelete } = useModulePermissions();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsRes, classesRes] = await Promise.all([
        getStudents(),
        getClasses(),
      ]);
      setStudents(studentsRes.data.data);
      setClasses(classesRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Fetch sections when class selection changes (in the modal)
  useEffect(() => {
    if (selectedClassId) {
      const fetchSections = async () => {
        try {
          const res = await getSectionsByClass(selectedClassId);
          setSections(res.data.data);
        } catch (err) {
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

    // If class changes, update selectedClassId and reset section
    if (name === 'class_id') {
      setSelectedClassId(value);
      setForm(prev => ({ ...prev, section_id: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setForm({
      login_id: '',
      password: '',
      full_name: '',
      email: '',
      mobile: '',
      class_id: '',
      section_id: '',
      father_name: '',
      mother_name: '',
      dob: '',
      gender: '',
      roll_number: '',
      admission_date: '',
      address: '',
      father_phone: '',
      mother_phone: '',
      blood_group: '',
      father_occupation: '',
      mother_occupation: '',
      sibling_details: '',
    });
    setSelectedClassId('');
    setSections([]);
    setProfileFile(null);
    setPreviewUrl('');
  };

  const openCreateModal = () => {
    setEditingId(null);
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = async (student) => {
    try {
      setLoading(true);
      const res = await getStudentById(student.id);
      const data = res.data.data;
      setEditingId(data.id);
      setForm({
        login_id: data.login_id,
        password: '',
        full_name: data.full_name || '',
        email: data.email || '',
        mobile: data.mobile || '',
        class_id: data.class_id || '',
        section_id: data.section_id || '',
        father_name: data.father_name || '',
        mother_name: data.mother_name || '',
        dob: data.dob || '',
        gender: data.gender || '',
        roll_number: data.roll_number || '',
        admission_date: data.admission_date || '',
        address: data.address || '',
        father_phone: data.father_phone || '',
        mother_phone: data.mother_phone || '',
        blood_group: data.blood_group || '',
        father_occupation: data.father_occupation || '',
        mother_occupation: data.mother_occupation || '',
        sibling_details: data.sibling_details || '',
      });

      // Set selected class id for sections dropdown
      if (data.class_id) {
        setSelectedClassId(data.class_id);
        const secRes = await getSectionsByClass(data.class_id);
        setSections(secRes.data.data);
      } else {
        setSelectedClassId('');
        setSections([]);
      }

      if (data.profile_picture) {
        const baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
        setPreviewUrl(`${baseURL}${data.profile_picture}`);
      } else {
        setPreviewUrl('');
      }
      setProfileFile(null);
      setModalOpen(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (form[key] !== undefined && form[key] !== '') formData.append(key, form[key]);
      });
      if (profileFile) formData.append('profile_picture', profileFile);

      if (editingId) {
        await updateStudent(editingId, formData);
      } else {
        if (!form.password) {
          alert('Password is required for new student');
          return;
        }
        await createStudent(formData);
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
      await deleteStudent(deleteId);
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
        <div className="text-lg text-gray-600">Loading students...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
        {error}
        <button onClick={fetchData} className="ml-4 text-sm underline">Retry</button>
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
              <input
                type="text"
                placeholder="Search students..."
                className="w-[220px] outline-none text-sm"
              />
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
                <Plus size={16} /> Add Student
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.No.</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Photo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Login ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Father</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mobile</th>
                {(canUpdate || canDelete) && (
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((student, index) => (
                <tr key={student.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-sm">{index + 1}</td>
                  <td className="px-4 py-3">
                    {student.profile_picture ? (
                      <img
                        src={`${import.meta.env.VITE_BASE_URL || 'http://localhost:5000'}${student.profile_picture}`}
                        alt={student.full_name}
                        className="w-10 h-10 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">No</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">{student.full_name}</td>
                  <td className="px-4 py-3 text-sm">{student.login_id}</td>
                  <td className="px-4 py-3 text-sm">{student.class || '—'}</td>
                  <td className="px-4 py-3 text-sm">{student.section || '—'}</td>
                  <td className="px-4 py-3 text-sm">{student.roll_number || '—'}</td>
                  <td className="px-4 py-3 text-sm">{student.father_name || '—'}</td>
                  <td className="px-4 py-3 text-sm">{student.mobile || '—'}</td>
                  {(canUpdate || canDelete) && (
                    <td className="px-4 py-3 text-right space-x-2">
                      {canUpdate && (
                        <button onClick={() => openEditModal(student)} className="text-blue-600 hover:text-blue-800 p-1">
                          <Pencil size={16} />
                        </button>
                      )}
                      {canDelete && (
                        <button onClick={() => openConfirmModal(student.id)} className="text-red-500 hover:text-red-700 p-1">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {students.length === 0 && (
                <tr><td colSpan="10" className="text-center py-8 text-gray-500 text-sm">No students found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Student' : 'Add Student'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Login & Password */}
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

            {/* Personal */}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                name="gender"
                value={form.gender || ''}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
              <input
                type="text"
                name="blood_group"
                value={form.blood_group}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={form.dob}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Academic – Class & Section dropdowns */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <select
                name="class_id"
                value={form.class_id}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.display_name || cls.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
              <select
                name="section_id"
                value={form.section_id}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={!selectedClassId}
              >
                <option value="">Select Section</option>
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.display_name || sec.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
              <input
                type="text"
                name="roll_number"
                value={form.roll_number}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admission Date</label>
              <input
                type="date"
                name="admission_date"
                value={form.admission_date}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Parents */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
              <input
                type="text"
                name="father_name"
                value={form.father_name}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Father's Phone</label>
              <input
                type="text"
                name="father_phone"
                value={form.father_phone}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Father's Occupation</label>
              <input
                type="text"
                name="father_occupation"
                value={form.father_occupation}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Name</label>
              <input
                type="text"
                name="mother_name"
                value={form.mother_name}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Phone</label>
              <input
                type="text"
                name="mother_phone"
                value={form.mother_phone}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Occupation</label>
              <input
                type="text"
                name="mother_occupation"
                value={form.mother_occupation}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Address & Sibling */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows="2"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sibling Details</label>
              <textarea
                name="sibling_details"
                value={form.sibling_details}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows="2"
                placeholder="e.g., 2 brothers (ages 10, 15), 1 sister (age 8)"
              />
            </div>

            {/* Photo */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full border p-2 rounded focus:outline-none"
              />
              {previewUrl && (
                <div className="mt-2">
                  <img src={previewUrl} alt="Profile" className="w-16 h-16 rounded-full object-cover border" />
                </div>
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
        title="Delete Student"
        message="Are you sure you want to delete this student? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
      />
    </div>
  );
};

export default Student;