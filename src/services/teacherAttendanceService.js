import api from '../api/axios';
export const getAttendance = () => api.get('/teacher-attendance');
export const getAttendanceById = (id) => api.get(`/teacher-attendance/${id}`);
export const createAttendance = (data) => api.post('/teacher-attendance', data);
export const updateAttendance = (id, data) => api.put(`/teacher-attendance/${id}`, data);
export const deleteAttendance = (id) => api.delete(`/teacher-attendance/${id}`);