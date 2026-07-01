import api from '../api/axios';

export const getMeetLinks = () => api.get('/online-meet-links');
export const getMeetLink = (id) => api.get(`/online-meet-links/${id}`);
export const createMeetLink = (data) => api.post('/online-meet-links', data);
export const updateMeetLink = (id, data) => api.put(`/online-meet-links/${id}`, data);
export const deleteMeetLink = (id) => api.delete(`/online-meet-links/${id}`);