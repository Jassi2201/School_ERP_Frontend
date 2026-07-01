import api from '../api/axios';

export const getStudents = () => api.get('/student');
export const getStudentById = (id) => api.get(`/student/${id}`);
export const createStudent = (data) => api.post('/student', data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateStudent = (id, data) => api.put(`/student/${id}`, data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteStudent = (id) => api.delete(`/student/${id}`);