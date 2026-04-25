import api from './axiosConfig';

export const facilityApi = {
  getAll: (params) => api.get('/facilities', { params }),
  getById: (id) => api.get(`/facilities/${id}`),
  create: (data) => api.post('/facilities', data),
  update: (id, data) => api.put(`/facilities/${id}`, data),
  delete: (id) => api.delete(`/facilities/${id}`),
  updateStatus: (id, status) => api.patch(`/facilities/${id}/status`, { status }),
};
