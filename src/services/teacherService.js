import api from '../api/axios';

export const getTeachers = () => api.get('/teacher');
export const getTeacherById = (id) => api.get(`/teacher/${id}`);
export const createTeacher = (data) => api.post('/teacher', data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateTeacher = (id, data) => api.put(`/teacher/${id}`, data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteTeacher = (id) => api.delete(`/teacher/${id}`);