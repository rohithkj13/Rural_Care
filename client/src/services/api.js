import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Attach the latest token before every request.
// This ensures the header is always fresh even if the token was set after app init.
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  adminLogin: (data) => API.post('/auth/admin-login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data)
};

export const doctorAPI = {
  getAll: (params) => API.get('/doctors', { params }),
  getById: (id) => API.get(`/doctors/${id}`),
  getStats: () => API.get('/doctors/stats')
};

export const appointmentAPI = {
  create: (data) => API.post('/appointments', data),
  getAll: () => API.get('/appointments'),
  getPatientAppointments: () => API.get('/appointments/patient'),
  getById: (id) => API.get(`/appointments/${id}`),
  updateStatus: (id, data) => API.put(`/appointments/${id}/status`, data),
  cancel: (id) => API.put(`/appointments/${id}/cancel`)
};

export const prescriptionAPI = {
  create: (data) => API.post('/prescriptions', data),
  getAll: () => API.get('/prescriptions'),
  getById: (id) => API.get(`/prescriptions/${id}`),
  searchPatient: (q) => API.get(`/prescriptions/search-patient?q=${encodeURIComponent(q)}`)
};

export const reportAPI = {
  upload: (formData) => API.post('/reports', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAll: () => API.get('/reports'),
  getById: (id) => API.get(`/reports/${id}`),
  getPatientReports: (patientId) => API.get(`/reports/patient/${patientId}`),
  addDoctorNote: (id, data) => API.put(`/reports/${id}/doctor-note`, data),
  delete: (id) => API.delete(`/reports/${id}`)
};

export const notificationAPI = {
  getAll: () => API.get('/notifications'),
  markAsRead: (id) => API.put(`/notifications/${id}/read`),
  markAllAsRead: () => API.put('/notifications/read-all')
};

export const consultationAPI = {
  create: (data) => API.post('/consultations', data),
  end: (id, data) => API.put(`/consultations/${id}/end`, data),
  getAll: () => API.get('/consultations')
};

export const adminAPI = {
  getStats: () => API.get('/admin/stats'),
  getAnalytics: () => API.get('/admin/analytics'),
  downloadReport: (type = 'daily', format = 'csv') =>
    API.get(`/admin/reports/download?type=${type}&format=${format}`, { responseType: 'blob' }),
  // Doctors
  getDoctors: (params) => API.get('/admin/doctors', { params }),
  addDoctor: (data) => API.post('/admin/doctors', data),
  approveDoctor: (id) => API.put(`/admin/doctors/${id}/approve`),
  updateDoctor: (id, data) => API.put(`/admin/doctors/${id}`, data),
  deleteDoctor: (id) => API.delete(`/admin/doctors/${id}`),
  // Patients
  getPatients: (params) => API.get('/admin/patients', { params }),
  getPatientHistory: (id) => API.get(`/admin/patients/${id}/history`),
  updatePatient: (id, data) => API.put(`/admin/patients/${id}`, data),
  togglePatientStatus: (id) => API.put(`/admin/patients/${id}/toggle-status`),
  // Prescriptions
  getPrescriptions: (params) => API.get('/admin/prescriptions', { params }),
  // Symptom logs
  getSymptomLogs: () => API.get('/admin/symptom-logs'),
  // Complaints
  getComplaints: (params) => API.get('/admin/complaints', { params }),
  respondToComplaint: (id, data) => API.put(`/admin/complaints/${id}/respond`, data),
  // Patient complaint actions
  createComplaint: (data) => API.post('/admin/complaints', data),
  getMyComplaints: () => API.get('/admin/complaints/mine')
};

export const labAPI = {
  getTests: (params) => API.get('/lab/tests', { params }),
  createOrder: (data) => API.post('/lab/orders', data),
  getMyOrders: () => API.get('/lab/orders/mine'),
  cancelOrder: (id) => API.put(`/lab/orders/${id}/cancel`)
};

export const healthFeedAPI = {
  getPosts: (params) => API.get('/health-feed', { params }),
  getPostBySlug: (slug) => API.get(`/health-feed/slug/${slug}`),
  likePost: (id) => API.put(`/health-feed/${id}/like`)
};

export const reviewAPI = {
  submit:    (doctorId, data) => API.post(`/doctors/${doctorId}/review`, data),
  delete:    (doctorId)      => API.delete(`/doctors/${doctorId}/review`),
  getForDoctor: (doctorId)  => API.get(`/doctors/${doctorId}/reviews`),
  getMine:   ()             => API.get('/doctors/reviews/mine'),
};

export const reminderAPI = {
  create: (data) => API.post('/reminders', data),
  getAll: () => API.get('/reminders'),
  update: (id, data) => API.put(`/reminders/${id}`, data),
  delete: (id) => API.delete(`/reminders/${id}`)
};

export const fitnessAPI = {
  getToday: () => API.get('/fitness/today'),
  getHistory: (days = 7) => API.get(`/fitness/history?days=${days}`),
  updateToday: (data) => API.put('/fitness/today', data),
  addFood: (data) => API.post('/fitness/food', data),
  removeFood: (index) => API.delete(`/fitness/food/${index}`),
  addWorkout: (data) => API.post('/fitness/workout', data),
  removeWorkout: (index) => API.delete(`/fitness/workout/${index}`),
  // Doctor
  getDoctorPatients: () => API.get('/fitness/doctor/patients'),
  getPatientFitness: (patientId, days = 14) => API.get(`/fitness/doctor/patient/${patientId}?days=${days}`),
  setPatientGoals: (patientId, data) => API.put(`/fitness/doctor/patient/${patientId}/goals`, data)
};

export const bloodAPI = {
  getDonors: (params) => API.get('/blood/donors', { params }),
  registerDonor: (data) => API.post('/blood/donors', data),
  getMyDonorProfile: () => API.get('/blood/donors/me'),
  updateMyDonorProfile: (data) => API.put('/blood/donors/me', data),
  updateDonor: (id, data) => API.put(`/blood/donors/${id}`, data),
  deleteDonor: (id) => API.delete(`/blood/donors/${id}`),
  getStats: () => API.get('/blood/stats'),
  createRequest: (data) => API.post('/blood/requests', data),
  getMyRequests: () => API.get('/blood/requests/mine'),
  getAllRequests: (params) => API.get('/blood/requests/all', { params }),
  updateRequestStatus: (id, data) => API.put(`/blood/requests/${id}/status`, data),
  getAllRequestsAdmin: () => API.get('/blood/requests'),
  getAllDonorsAdmin: () => API.get('/blood/donors/admin')
};

export default API;
