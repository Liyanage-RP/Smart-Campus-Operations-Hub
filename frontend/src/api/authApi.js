import api from './axiosConfig';

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  getAllUsers: () => api.get('/auth/users'),
  updateRole: (id, role) => api.patch(`/auth/users/${id}/role`, { role }),
  getTechnicians: () => api.get('/auth/technicians'),
};
