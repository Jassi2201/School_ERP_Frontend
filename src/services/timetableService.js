import api from '../api/axios';

export const getTimetableEntries = () => api.get('/timetable');
export const getTimetableEntry = (id) => api.get(`/timetable/${id}`);
export const createTimetableEntry = (data) => api.post('/timetable', data);
export const updateTimetableEntry = (id, data) => api.put(`/timetable/${id}`, data);
export const deleteTimetableEntry = (id) => api.delete(`/timetable/${id}`);