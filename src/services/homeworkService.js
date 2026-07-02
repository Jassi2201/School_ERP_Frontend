import api from '../api/axios';

// Homework
export const getHomeworkList = () => api.get('/homework');
export const getHomework = (id) => api.get(`/homework/${id}`);
export const createHomework = (data) => api.post('/homework', data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateHomework = (id, data) => api.put(`/homework/${id}`, data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteHomework = (id) => api.delete(`/homework/${id}`);

// Submissions
export const getSubmissions = (homeworkId) => api.get(`/homework/${homeworkId}/submissions`);
export const submitHomework = (homeworkId, data) => api.post(`/homework/${homeworkId}/submit`, data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const evaluateSubmission = (submissionId, data) => api.put(`/homework/submissions/${submissionId}`, data);