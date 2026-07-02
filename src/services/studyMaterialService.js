import api from '../api/axios';

export const getMaterials = () => api.get('/study-material');
export const getMaterial = (id) => api.get(`/study-material/${id}`);
export const createMaterial = (data) => api.post('/study-material', data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateMaterial = (id, data) => api.put(`/study-material/${id}`, data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteMaterial = (id) => api.delete(`/study-material/${id}`);