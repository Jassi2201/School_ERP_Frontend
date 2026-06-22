import api from '../api/axios';
export const getStudents = () => api.get('/student');
export const getStudentById = (id) => api.get(`/student/${id}`);
export const createStudent = (data) => api.post('/student', data);
export const updateStudent = (id, data) => api.put(`/student/${id}`, data);
export const deleteStudent = (id) => api.delete(`/student/${id}`);