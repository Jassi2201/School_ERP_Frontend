import api from '../api/axios';

// Classes
export const getClasses = () => api.get('/class-section/classes');
export const createClass = (data) => api.post('/class-section/classes', data);
export const updateClass = (id, data) => api.put(`/class-section/classes/${id}`, data);
export const deleteClass = (id) => api.delete(`/class-section/classes/${id}`);

// Sections
export const getSectionsByClass = (classId) => api.get(`/class-section/classes/${classId}/sections`);
export const createSection = (data) => api.post('/class-section/sections', data);
export const updateSection = (id, data) => api.put(`/class-section/sections/${id}`, data);
export const deleteSection = (id) => api.delete(`/class-section/sections/${id}`);