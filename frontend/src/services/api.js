import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.response) {
      // Server responded with error status
      console.error('Error Status:', error.response.status);
      console.error('Error Data:', error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
    } else {
      // Something else happened
      console.error('Error Message:', error.message);
    }
    return Promise.reject(error);
  }
);

// Authentication
export const login = (username, password, role) => {
  console.log('Attempting login with:', { username, role });
  return api.post('/login', { username, password, role });
};

export const adminLogin = (username, password) => {
  console.log('Attempting admin login with:', { username });
  return api.post('/admin/login', { username, password });
};

export const registerUser = (userData) => {
  return api.post('/register/user', userData);
};

export const registerWorker = (workerData) => {
  return api.post('/register/worker', workerData);
};

// User APIs
export const getUser = (userId) => {
  console.log('Fetching user data for ID:', userId);
  return api.get(`/users/${userId}`);
};

export const updateUser = (userId, userData) => {
  return api.put(`/users/${userId}`, userData);
};

export const createWorkRequest = (requestData) => {
  return api.post('/work-requests', requestData);
};

export const getUserWorkRequests = (userId) => {
  console.log('Fetching work requests for user ID:', userId);
  return api.get(`/work-requests/user/${userId}`);
};

// Worker APIs
export const getWorker = (workerId) => {
  return api.get(`/workers/${workerId}`);
};

export const updateWorker = (workerId, workerData) => {
  return api.put(`/workers/${workerId}`, workerData);
};

export const getWorkerSkills = (workerId) => {
  return api.get(`/workers/${workerId}/skills`);
};

export const updateWorkerAvailability = (workerId, availabilityData) => {
  return api.post(`/workers/${workerId}/availability`, availabilityData);
};

export const updateWorkerStatus = (workerId, status) => {
  return api.put(`/workers/${workerId}/status`, { status });
};

export const getWorkerFeedback = (workerId) => {
  return api.get(`/feedback/worker/${workerId}`);
};

// Skill Types
export const getSkillTypes = () => {
  console.log('Fetching skill types');
  return api.get('/skill-types');
};

export const addSkillType = (skillData) => {
  return api.post('/skill-types', skillData);
};

export const updateSkillType = (skillTypeId, skillData) => {
  return api.put(`/skill-types/${skillTypeId}`, skillData);
};

export const deleteSkillType = (skillTypeId) => {
  return api.delete(`/skill-types/${skillTypeId}`);
};

// Notifications
export const getUserNotifications = (userId) => {
  console.log('Fetching notifications for user ID:', userId);
  return api.get(`/notifications/user/${userId}`);
};

export const getWorkerNotifications = (workerId) => {
  return api.get(`/notifications/worker/${workerId}`);
};

export const getWorkerWorkRequests = (workerId) => {
  return api.get(`/work-requests/worker/${workerId}`);
};

export const getAvailableWorkRequests = (workerId) => {
  return api.get(`/work-requests/available/${workerId}`);
};

export const acceptWorkRequest = (workerId, requestId, timeSlot, arrivalTime) => {
  return api.post(`/work-requests/${requestId}/accept`, { workerId, timeSlot, arrivalTime });
};

export const declineWorkRequest = (workerId, requestId) => {
  return api.post(`/work-requests/${requestId}/decline`, { workerId });
};

export const completeWorkRequest = (workerId, requestId, amount) => {
  return api.post(`/work-requests/${requestId}/complete`, { workerId, amount });
};

export const cancelWorkRequest = (requestId, userId) => {
  return api.post(`/work-requests/${requestId}/cancel`, { "userId": userId });
};

export const setWorkerArrivalTime = (workerId, requestId, arrivalTime) => {
  return api.post(`/work-requests/${requestId}/set-arrival-time`, { workerId, arrivalTime });
};

export const confirmWorkerArrival = (userId, requestId, confirmationStatus) => {
  return api.post(`/work-requests/${requestId}/confirm-arrival`, { userId, confirmationStatus });
};

export const getAdminNotifications = () => {
  return api.get('/notifications/admin');
};

export const markNotificationAsRead = (notificationId) => {
  return api.put(`/notifications/${notificationId}/read`);
};

// Feedback
export const submitFeedback = (feedbackData) => {
  return api.post('/feedback', feedbackData);
};

export const getFeedbackForRequest = (requestId) => {
  return api.get(`/feedback/request/${requestId}`);
};

export const getAllFeedback = () => {
  return api.get('/feedback/admin');
};

// Admin APIs
export const getAllUsers = () => {
  return api.get('/admin/users');
};

export const getAllWorkers = () => {
  return api.get('/admin/workers');
};

export const getAllWorkRequests = () => {
  return api.get('/admin/work-requests');
};

export const getAllWorkersWithSkills = () => {
  return api.get('/admin/workers-with-skills');
};

export const deleteUser = (userId) => {
  return api.delete(`/admin/users/${userId}`);
};

export const deleteWorker = (workerId) => {
  return api.delete(`/admin/workers/${workerId}`);
};

export default api;