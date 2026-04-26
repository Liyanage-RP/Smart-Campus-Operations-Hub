import api from './axiosConfig';

export const bookingApi = {
  create: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my'),
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  approve: (id, remarks) => api.patch(`/bookings/${id}/approve`, { remarks }),
  reject: (id, remarks) => api.patch(`/bookings/${id}/reject`, { remarks }),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`),
  getQrCode: (id) => api.get(`/bookings/${id}/qr`, { responseType: 'blob' }),
};
