import api from './axiosConfig';

export const ticketApi = {
  create: (formData) => api.post('/tickets', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getMyTickets: () => api.get('/tickets/my'),
  getAll: (params) => api.get('/tickets', { params }),
  getAssigned: () => api.get('/tickets/assigned'),
  getById: (id) => api.get(`/tickets/${id}`),
  updateStatus: (id, status, notes) => api.patch(`/tickets/${id}/status`, { status, notes }),
  reject: (id, reason) => api.patch(`/tickets/${id}/reject`, { reason }),
  assign: (id, technicianId) => api.patch(`/tickets/${id}/assign`, { technicianId }),
  addComment: (id, content) => api.post(`/tickets/${id}/comments`, { content }),
  updateComment: (id, commentId, content) => api.put(`/tickets/${id}/comments/${commentId}`, { content }),
  deleteComment: (id, commentId) => api.delete(`/tickets/${id}/comments/${commentId}`),
};
