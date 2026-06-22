import api from '../api/axios';
export const getAttendance = () => api.get('/student-attendance');
export const getAttendanceById = (id) => api.get(`/student-attendance/${id}`);
export const createAttendance = (data) => api.post('/student-attendance', data);
export const updateAttendance = (id, data) => api.put(`/student-attendance/${id}`, data);
export const deleteAttendance = (id) => api.delete(`/student-attendance/${id}`);