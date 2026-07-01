import api from '../api/axios';
export const getClassTeachers = () => api.get('/class-teachers');
export const createClassTeacher = (data) => api.post('/class-teachers', data);
export const updateClassTeacher = (id, data) => api.put(`/class-teachers/${id}`, data);
export const deleteClassTeacher = (id) => api.delete(`/class-teachers/${id}`);