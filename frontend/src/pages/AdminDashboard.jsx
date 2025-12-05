import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import * as api from '../services/api';

const AdminDashboard = ({ admin, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [tabLoading, setTabLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [workerWorkHistory, setWorkerWorkHistory] = useState([]);
  
  // Dashboard data - initialize as empty arrays
  const [users, setUsers] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [skillTypes, setSkillTypes] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [workRequests, setWorkRequests] = useState([]);

  // Load data based on active tab
  const loadDataForTab = useCallback(async () => {
    // Don't show main loading spinner for dashboard tab (we'll load minimal data)
    if (activeTab !== 'dashboard') {
      setTabLoading(true);
    }
    setError('');
    
    try {
      switch (activeTab) {
        case 'users':
          try {
            const usersResponse = await api.getAllUsers();
            setUsers(usersResponse.data || []);
          } catch (err) {
            console.error('Error loading users data:', err);
            const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
            setError(`Failed to load users data: ${errorMessage}.`);
          }
          break;
          
        case 'workers':
          try {
            const workersResponse = await api.getAllWorkers();
            setWorkers(workersResponse.data || []);
          } catch (err) {
            console.error('Error loading workers data:', err);
            const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
            setError(`Failed to load workers data: ${errorMessage}.`);
          }
          break;
          
        case 'skills':
          try {
            const skillTypesResponse = await api.getSkillTypes();
            setSkillTypes(skillTypesResponse.data || []);
          } catch (err) {
            console.error('Error loading skills data:', err);
            const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
            setError(`Failed to load skills data: ${errorMessage}.`);
          }
          break;
          
        case 'workRequests':
          try {
            const workRequestsResponse = await api.getAllWorkRequests();
            setWorkRequests(workRequestsResponse.data || []);
          } catch (err) {
            console.error('Error loading work requests data:', err);
            const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
            setError(`Failed to load work requests data: ${errorMessage}.`);
          }
          break;
          
        case 'feedback':
          try {
            const feedbacksResponse = await api.getAllFeedback();
            setFeedbacks(feedbacksResponse.data || []);
          } catch (err) {
            console.error('Error loading feedback data:', err);
            const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
            setError(`Failed to load feedback data: ${errorMessage}.`);
          }
          break;
          
        default:
          // Dashboard tab - load only essential data for charts
          try {
            if (workers.length === 0) {
              const workersResponse = await api.getAllWorkers();
              setWorkers(workersResponse.data || []);
            }
            if (feedbacks.length === 0) {
              const feedbacksResponse = await api.getAllFeedback();
              setFeedbacks(feedbacksResponse.data || []);
            }
            if (notifications.length === 0) {
              const notificationsResponse = await api.getAdminNotifications();
              setNotifications(notificationsResponse.data || []);
            }
          } catch (err) {
            console.error('Error loading dashboard data:', err);
            const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
            setError(`Failed to load dashboard data: ${errorMessage}.`);
          }
          break;
      }
    } catch (err) {
      console.error(`Error loading ${activeTab} data:`, err);
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
      setError(`Failed to load ${activeTab} data: ${errorMessage}.`);
    } finally {
      if (activeTab !== 'dashboard') {
        setTabLoading(false);
      }
    }
  }, [activeTab, workers.length, feedbacks.length, notifications.length]);

  useEffect(() => {
    loadDataForTab();
  }, [loadDataForTab]);

  // Calculate statistics
  const totalUsers = users.length;
  const totalWorkers = workers.length;
  const totalSkillTypes = skillTypes.length;
  const totalFeedbacks = feedbacks.length;
  const totalNotifications = notifications.length;
  const totalWorkRequests = workRequests.length;

  // Process data for charts
  const getWorkerSkillsData = () => {
    try {
      const skillCount = {};
      workers.forEach(worker => {
        if (worker.skills) {
          // Handle both string and array formats for skills
          let skillsArray = [];
          if (typeof worker.skills === 'string') {
            // If skills is a comma-separated string
            skillsArray = worker.skills.split(',').map(skill => skill.trim());
          } else if (Array.isArray(worker.skills)) {
            // If skills is an array of objects
            skillsArray = worker.skills.map(skill => 
              skill.skill_type ? skill.skill_type.name : 'Unknown'
            );
          }
          
          skillsArray.forEach(skillName => {
            if (skillName && skillName !== 'Unknown') {
              skillCount[skillName] = (skillCount[skillName] || 0) + 1;
            }
          });
        }
      });
      
      return Object.entries(skillCount).map(([skill, count]) => ({
        name: skill,
        value: count
      }));
    } catch (err) {
      console.error('Error processing worker skills data:', err);
      return [];
    }
  };

  const getFeedbackRatingData = () => {
    try {
      const ratingCount = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      feedbacks.forEach(feedback => {
        if (feedback.rating) {
          const rating = Math.round(feedback.rating);
          if (rating >= 1 && rating <= 5) {
            ratingCount[rating] += 1;
          }
        }
      });
      
      return Object.entries(ratingCount).map(([rating, count]) => ({
        name: `${rating} Star${rating > 1 ? 's' : ''}`,
        value: count
      }));
    } catch (err) {
      console.error('Error processing feedback rating data:', err);
      return [];
    }
  };

  // Simple Bar Chart Component
  const BarChart = ({ data, title, color = 'blue' }) => {
    if (!data || data.length === 0) {
      return (
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20 card-3d">
          <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
          <p className="text-white text-opacity-70">No data available</p>
        </div>
      );
    }
    
    const maxValue = Math.max(...data.map(item => item.value), 1);
    
    // Map color names to actual CSS classes
    const colorClasses = {
      blue: 'bg-gradient-to-r from-blue-400 to-blue-600',
      green: 'bg-gradient-to-r from-green-400 to-green-600',
      purple: 'bg-gradient-to-r from-purple-400 to-purple-600',
      red: 'bg-gradient-to-r from-red-400 to-red-600',
      yellow: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
      cyan: 'bg-gradient-to-r from-cyan-400 to-cyan-600'
    };
    
    const textColorClasses = {
      blue: 'text-blue-300',
      green: 'text-green-300',
      purple: 'text-purple-300',
      red: 'text-red-300',
      yellow: 'text-yellow-300',
      cyan: 'text-cyan-300'
    };
    
    const selectedColorClass = colorClasses[color] || colorClasses.blue;
    const selectedTextColorClass = textColorClasses[color] || textColorClasses.blue;
    
    return (
      <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20 card-3d">
        <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center">
              <div className="w-32 text-white text-sm truncate">{item.name}</div>
              <div className="flex-1 ml-2">
                <div 
                  className={`h-6 rounded-md ${selectedColorClass} btn-3d`}
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                ></div>
              </div>
              <div className={`w-10 text-right font-medium ${selectedTextColorClass}`}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Tab Navigation Component
  const TabNavigation = () => (
    <div className="flex flex-wrap gap-2 mb-6">
      {[
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'users', label: 'Manage Users' },
        { id: 'workers', label: 'Manage Workers' },
        { id: 'skills', label: 'Manage Skills' },
        { id: 'workRequests', label: 'Work Requests' },
        { id: 'feedback', label: 'Feedback' }
      ].map((tab) => (
        <motion.button
          key={tab.id}
          className={`px-4 py-2 rounded-full font-medium transition-all ${
            activeTab === tab.id
              ? 'bg-gradient-primary text-white shadow-lg'
              : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
          } btn-3d`}
          onClick={() => setActiveTab(tab.id)}
          whileHover={{ scale: 1.05, y: -3, z: 10 }}
          whileTap={{ scale: 0.95 }}
        >
          {tab.label}
        </motion.button>
      ))}
    </div>
  );

  // Dashboard Overview Tab
  const DashboardOverview = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[
          { title: 'Total Users', value: totalUsers, color: 'blue' },
          { title: 'Total Workers', value: totalWorkers, color: 'green' },
          { title: 'Skill Types', value: totalSkillTypes, color: 'purple' },
          { title: 'Notifications', value: totalNotifications, color: 'yellow' },
          { title: 'Feedback', value: totalFeedbacks, color: 'red' }
        ].map((stat, index) => (
          <motion.div
            key={index}
            className={`bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border-l-4 border-${stat.color}-500 shadow-xl border border-white border-opacity-20 glass card-3d`}
            initial={{ opacity: 0, y: 20, z: -30 }}
            animate={{ opacity: 1, y: 0, z: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -10, z: 20 }}
          >
            <div className="flex items-center">
              <div>
                <p className="text-white text-opacity-80 text-sm">{stat.title}</p>
                <p className={`text-3xl font-bold text-${stat.color}-300`}>{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart 
          data={getWorkerSkillsData()} 
          title="Workers by Skill Type" 
          color="green" 
        />
        <BarChart 
          data={getFeedbackRatingData()} 
          title="Feedback Ratings Distribution" 
          color="purple" 
        />
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white border-opacity-20 glass card-3d">
        <h3 className="text-xl font-bold text-white mb-4">Recent Notifications</h3>
        {notifications && notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.slice(0, 5).map((notification) => (
              <motion.div 
                key={notification.notification_id || notification.id || Math.random()} 
                className="p-3 bg-white bg-opacity-10 rounded-lg glass card-3d"
                whileHover={{ scale: 1.02, y: -3, z: 5 }}
              >
                <p className="text-white">{notification.message || 'No message'}</p>
                <p className="text-white text-opacity-70 text-sm mt-1">
                  {notification.created_at ? new Date(notification.created_at).toLocaleString() : 'Unknown date'}
                </p>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-white text-opacity-70">No recent notifications</p>
        )}
      </div>
    </motion.div>
  );

  // Manage Users Tab
  const ManageUsers = () => {
    const [deletingUserId, setDeletingUserId] = useState(null);
  
    const handleDeleteUser = async (userId) => {
      if (window.confirm('Are you sure you want to delete this user?')) {
        try {
          setDeletingUserId(userId);
          await api.deleteUser(userId);
          // Refresh users list
          try {
            const response = await api.getAllUsers();
            setUsers(response.data || []);
          } catch (err) {
            console.error('Error refreshing users:', err);
            const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
            setError(prev => prev ? `${prev} Failed to refresh users: ${errorMessage}.` : `Failed to refresh users: ${errorMessage}.`);
          }
          alert('User deleted successfully');
        } catch (err) {
          console.error('Error deleting user:', err);
          const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
          setError(prev => prev ? `${prev} Failed to delete user: ${errorMessage}.` : `Failed to delete user: ${errorMessage}.`);
          alert('Failed to delete user: ' + errorMessage);
        } finally {
          setDeletingUserId(null);
        }
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white border-opacity-20 glass card-3d">
          <h2 className="text-2xl font-bold text-white mb-6">Manage Users</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users && users.length > 0 ? (
                  users.map((user) => (
                    <motion.tr 
                      key={user.login_id || user.id || Math.random()}
                      whileHover={{ backgroundColor: "rgba(255,255,255,0.1)", y: -2 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        {user.first_name && user.last_name ? 
                          `${user.first_name} ${user.last_name}` : 
                          (user.first_name || user.last_name || user.username || 'N/A')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">{user.email || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">{user.phone_number || user.phone_number1 || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors btn-3d"
                          onClick={() => handleDeleteUser(user.login_id || user.user_id)}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          disabled={deletingUserId === (user.login_id || user.user_id)}
                        >
                          {deletingUserId === (user.login_id || user.user_id) ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-white">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    );
  };

  // Manage Workers Tab
  const ManageWorkers = () => {
    const [deletingWorkerId, setDeletingWorkerId] = useState(null);
  
    const handleDeleteWorker = async (workerId) => {
      if (window.confirm('Are you sure you want to delete this worker?')) {
        try {
          setDeletingWorkerId(workerId);
          await api.deleteWorker(workerId);
          // Refresh workers list
          try {
            const response = await api.getAllWorkers();
            setWorkers(response.data || []);
          } catch (err) {
            console.error('Error refreshing workers:', err);
            const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
            setError(prev => prev ? `${prev} Failed to refresh workers: ${errorMessage}.` : `Failed to refresh workers: ${errorMessage}.`);
          }
          alert('Worker deleted successfully');
        } catch (err) {
          console.error('Error deleting worker:', err);
          const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
          setError(prev => prev ? `${prev} Failed to delete worker: ${errorMessage}.` : `Failed to delete worker: ${errorMessage}.`);
          alert('Failed to delete worker: ' + errorMessage);
        } finally {
          setDeletingWorkerId(null);
        }
      }
    };

    // Calculate total work hours from completed work requests
    const calculateTotalWorkHours = (workHistory) => {
      // For simplicity, we'll assume each completed work request is 8 hours
      // In a real application, this would be based on actual time tracking
      const completedRequests = workHistory.filter(request => request.status === 'Completed');
      return completedRequests.length * 8; // 8 hours per completed request
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {selectedWorker ? (
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white border-opacity-20 glass card-3d">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Worker Details</h2>
              <button 
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors btn-3d"
                onClick={closeWorkerDetails}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Back to Workers
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white bg-opacity-10 rounded-xl p-4">
                <h3 className="text-xl font-semibold text-white mb-3">Personal Information</h3>
                <div className="space-y-2 text-white">
                  <p><span className="font-medium">Name:</span> {selectedWorker.first_name} {selectedWorker.last_name}</p>
                  <p><span className="font-medium">Email:</span> {selectedWorker.email || 'N/A'}</p>
                  <p><span className="font-medium">Phone:</span> {selectedWorker.phone_number1 || selectedWorker.phone_number || 'N/A'}</p>
                  <p><span className="font-medium">Address:</span> {selectedWorker.address || 'N/A'}</p>
                </div>
              </div>
              
              <div className="bg-white bg-opacity-10 rounded-xl p-4">
                <h3 className="text-xl font-semibold text-white mb-3">Work Information</h3>
                <div className="space-y-2 text-white">
                  <p><span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      selectedWorker.available_status === 'Available' ? 'bg-green-500 bg-opacity-20 text-green-300' :
                      selectedWorker.available_status === 'At Work' ? 'bg-blue-500 bg-opacity-20 text-blue-300' :
                      'bg-yellow-500 bg-opacity-20 text-yellow-300'
                    }`}>
                      {selectedWorker.available_status || 'Available'}
                    </span>
                  </p>
                  <p><span className="font-medium">Experience:</span> {selectedWorker.experience_years || 'N/A'} years</p>
                  <p><span className="font-medium">Total Work Hours:</span> {calculateTotalWorkHours(workerWorkHistory)} hours</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-xl p-4 mb-6">
              <h3 className="text-xl font-semibold text-white mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {selectedWorker.skills ? (
                  typeof selectedWorker.skills === 'string' ? 
                    selectedWorker.skills.split(',').map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-500 bg-opacity-20 text-purple-300 rounded-full text-sm">
                        {skill.trim()}
                      </span>
                    )) :
                    selectedWorker.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-500 bg-opacity-20 text-purple-300 rounded-full text-sm">
                        {skill.skill_type ? skill.skill_type.name : skill}
                      </span>
                    ))
                ) : (
                  <p className="text-white">No skills listed</p>
                )}
              </div>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-xl p-4">
              <h3 className="text-xl font-semibold text-white mb-3">Work History</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Request ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Skill</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {workerWorkHistory && workerWorkHistory.length > 0 ? (
                      workerWorkHistory.map((request) => (
                        <tr key={request.request_id}>
                          <td className="px-6 py-4 whitespace-nowrap text-white">#{request.request_id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-white">{request.skill_name || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              request.status === 'Pending' ? 'bg-yellow-500 bg-opacity-20 text-yellow-300' :
                              request.status === 'Accepted' ? 'bg-blue-500 bg-opacity-20 text-blue-300' :
                              request.status === 'Completed' ? 'bg-green-500 bg-opacity-20 text-green-300' :
                              'bg-red-500 bg-opacity-20 text-red-300'
                            }`}>
                              {request.status || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-white">
                            {request.request_date ? new Date(request.request_date).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-white">
                            {request.amount ? `₹${request.amount}` : 'N/A'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-white">
                          No work history found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white border-opacity-20 glass card-3d">
            <h2 className="text-2xl font-bold text-white mb-6">Manage Workers</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Skills</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {workers && workers.length > 0 ? (
                    workers.map((worker) => (
                      <motion.tr 
                        key={worker.login_id || worker.id || Math.random()}
                        whileHover={{ backgroundColor: "rgba(255,255,255,0.1)", y: -2 }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-white">
                          {worker.first_name && worker.last_name ? 
                            `${worker.first_name} ${worker.last_name}` : 
                            (worker.first_name || worker.last_name || worker.username || 'N/A')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-white">{worker.email || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-white">{worker.phone_number || worker.phone_number1 || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-white">
                          {worker.skills ? (
                            typeof worker.skills === 'string' ? 
                              worker.skills : 
                              worker.skills.map(skill => 
                                skill.skill_type ? skill.skill_type.name : 'Unknown'
                              ).join(', ')
                          ) : 'None'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            worker.available_status === 'Available' ? 'bg-green-500 bg-opacity-20 text-green-300' :
                            worker.available_status === 'At Work' ? 'bg-blue-500 bg-opacity-20 text-blue-300' :
                            worker.available_status === 'Leave' ? 'bg-yellow-500 bg-opacity-20 text-yellow-300' :
                            'bg-gray-500 bg-opacity-20 text-gray-300'
                          }`}>
                            {worker.available_status || 'Available'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                          <button 
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors btn-3d"
                            onClick={() => handleViewWorkerDetails(worker)}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            View
                          </button>
                          <button 
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors btn-3d"
                            onClick={() => handleDeleteWorker(worker.login_id || worker.worker_id)}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={deletingWorkerId === (worker.login_id || worker.worker_id)}
                          >
                            {deletingWorkerId === (worker.login_id || worker.worker_id) ? 'Deleting...' : 'Delete'}
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-white">
                        No workers found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  // Manage Skills Tab
  const ManageSkills = () => {
    const [newSkillName, setNewSkillName] = useState('');
    const [newSkillDescription, setNewSkillDescription] = useState('');
    const [addingSkill, setAddingSkill] = useState(false);
    const [editingSkillId, setEditingSkillId] = useState(null);
    const [deletingSkillId, setDeletingSkillId] = useState(null);

    const handleAddSkill = async () => {
      if (!newSkillName.trim()) {
        alert('Please enter a skill name');
        return;
      }

      try {
        setAddingSkill(true);
        await api.addSkillType({
          skill_name: newSkillName
        });
      
        // Refresh skill types list
        try {
          const response = await api.getSkillTypes();
          setSkillTypes(response.data || []);
        } catch (err) {
          console.error('Error refreshing skill types:', err);
          const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
          setError(prev => prev ? `${prev} Failed to refresh skill types: ${errorMessage}.` : `Failed to refresh skill types: ${errorMessage}.`);
        }
      
        // Clear form
        setNewSkillName('');
        setNewSkillDescription('');
      
        alert('Skill added successfully');
      } catch (err) {
        console.error('Error adding skill:', err);
        const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
        setError(prev => prev ? `${prev} Failed to add skill: ${errorMessage}.` : `Failed to add skill: ${errorMessage}.`);
        alert('Failed to add skill: ' + errorMessage);
      } finally {
        setAddingSkill(false);
      }
    };

    const handleEditSkill = async (skillId) => {
      const skill = skillTypes.find(s => s.skill_type_id === skillId);
      if (!skill) return;
    
      const newName = prompt('Enter new skill name:', skill.skill_name || skill.name);
    
      if (newName) {
        try {
          setEditingSkillId(skillId);
          await api.updateSkillType(skillId, { skill_name: newName });
        
          // Refresh skill types list
          try {
            const response = await api.getSkillTypes();
            setSkillTypes(response.data || []);
          } catch (err) {
            console.error('Error refreshing skill types:', err);
            const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
            setError(prev => prev ? `${prev} Failed to refresh skill types: ${errorMessage}.` : `Failed to refresh skill types: ${errorMessage}.`);
          }
        
          alert('Skill updated successfully');
        } catch (err) {
          console.error('Error editing skill:', err);
          const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
          setError(prev => prev ? `${prev} Failed to edit skill: ${errorMessage}.` : `Failed to edit skill: ${errorMessage}.`);
          alert('Failed to edit skill: ' + errorMessage);
        } finally {
          setEditingSkillId(null);
        }
      }
    };

    const handleDeleteSkill = async (skillId) => {
      if (window.confirm('Are you sure you want to delete this skill?')) {
        try {
          setDeletingSkillId(skillId);
          await api.deleteSkillType(skillId);
        
          // Refresh skill types list
          try {
            const response = await api.getSkillTypes();
            setSkillTypes(response.data || []);
          } catch (err) {
            console.error('Error refreshing skill types:', err);
            const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
            setError(prev => prev ? `${prev} Failed to refresh skill types: ${errorMessage}.` : `Failed to refresh skill types: ${errorMessage}.`);
          }
        
          alert('Skill deleted successfully');
        } catch (err) {
          console.error('Error deleting skill:', err);
          const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
          setError(prev => prev ? `${prev} Failed to delete skill: ${errorMessage}.` : `Failed to delete skill: ${errorMessage}.`);
          alert('Failed to delete skill: ' + errorMessage);
        } finally {
          setDeletingSkillId(null);
        }
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white bg-opacity-70 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-gray-200 border-opacity-50 glass card-3d">
          <h2 className="text-2xl font-bold text-white mb-6">Manage Skill Types</h2>
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">Add New Skill Type</h3>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Skill name" 
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 input-3d"
              />
              <input 
                type="text" 
                placeholder="Description" 
                value={newSkillDescription}
                onChange={(e) => setNewSkillDescription(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 input-3d"
              />
              <button 
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors btn-3d"
                onClick={handleAddSkill}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                disabled={addingSkill}
              >
                {addingSkill ? 'Adding...' : 'Add Skill'}
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Skill Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {skillTypes && skillTypes.length > 0 ? (
                  skillTypes.map((skill) => (
                    <motion.tr 
                      key={skill.skill_type_id || skill.id || Math.random()}
                      whileHover={{ backgroundColor: "rgba(255,255,255,0.1)", y: -2 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-white">{skill.skill_name || skill.name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">{skill.description || 'No description'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button 
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors btn-3d"
                            onClick={() => handleEditSkill(skill.skill_type_id)}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={editingSkillId === skill.skill_type_id}
                          >
                            {editingSkillId === skill.skill_type_id ? 'Editing...' : 'Edit'}
                          </button>
                          <button 
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors btn-3d"
                            onClick={() => handleDeleteSkill(skill.skill_type_id)}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={deletingSkillId === skill.skill_type_id}
                          >
                            {deletingSkillId === skill.skill_type_id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-center text-white">
                      No skill types found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    );
  };

  // Work Requests Tab
  const WorkRequests = () => {
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmingArrival, setConfirmingArrival] = useState(null);
    
    // Filter work requests based on status and search term
    const filteredWorkRequests = workRequests.filter(request => {
      const matchesStatus = filterStatus === 'All' || request.status === filterStatus;
      const matchesSearch = searchTerm === '' || 
        (request.user_first_name && request.user_first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (request.user_last_name && request.user_last_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (request.worker_first_name && request.worker_first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (request.worker_last_name && request.worker_last_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (request.skill_name && request.skill_name.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesStatus && matchesSearch;
    });

    console.log('Work requests:', workRequests);
    console.log('Filtered work requests:', filteredWorkRequests);
    console.log('Filter status:', filterStatus);
    console.log('Search term:', searchTerm);

    // Format date safely
    const formatDate = (dateString) => {
      try {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
      } catch (error) {
        console.error('Error formatting date:', error);
        return 'N/A';
      }
    };

    // Handle confirm arrival
    const handleConfirmArrival = async (requestId, userId, confirmationStatus) => {
      try {
        setConfirmingArrival({ requestId, status: confirmationStatus });
        await api.confirmWorkerArrival(userId, requestId, confirmationStatus);
        
        // Refresh work requests
        try {
          const response = await api.getAllWorkRequests();
          setWorkRequests(response.data || []);
        } catch (err) {
          console.error('Error refreshing work requests:', err);
          const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
          setError(prev => prev ? `${prev} Failed to refresh work requests: ${errorMessage}.` : `Failed to refresh work requests: ${errorMessage}.`);
        }
        
        alert(`Worker arrival time ${confirmationStatus.toLowerCase()} successfully`);
      } catch (err) {
        console.error('Error confirming arrival:', err);
        const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
        setError(prev => prev ? `${prev} Failed to confirm arrival: ${errorMessage}.` : `Failed to confirm arrival: ${errorMessage}.`);
        alert('Failed to confirm arrival: ' + errorMessage);
      } finally {
        setConfirmingArrival(null);
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white border-opacity-20 glass card-3d">
          <h2 className="text-2xl font-bold text-white mb-6">Work Requests</h2>
          <div className="mb-4 flex gap-2">
            <select 
              className="px-4 py-2 rounded-lg bg-white bg-opacity-20 text-white input-3d"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option className="text-black" value="All">All Status</option>
              <option className="text-black" value="Pending">Pending</option>
              <option className="text-black" value="Accepted">Accepted</option>
              <option className="text-black" value="Completed">Completed</option>
              <option className="text-black" value="Cancelled">Cancelled</option>
            </select>
            <input 
              type="text" 
              placeholder="Search by user or worker..." 
              className="flex-1 px-4 py-2 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 input-3d"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Request ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Worker</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Skill</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Arrival Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">User Confirmation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredWorkRequests && filteredWorkRequests.length > 0 ? (
                  filteredWorkRequests.map((request) => (
                    <motion.tr 
                      key={request.request_id}
                      whileHover={{ backgroundColor: "rgba(255,255,255,0.1)", y: -2 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-white">#{request.request_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        {request.user_first_name && request.user_last_name ? 
                          `${request.user_first_name} ${request.user_last_name}` : 
                          (request.user_first_name || request.user_last_name || 'N/A')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        {request.worker_first_name && request.worker_last_name ? 
                          `${request.worker_first_name} ${request.worker_last_name}` : 
                          (request.worker_first_name || request.worker_last_name) || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">{request.skill_name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          request.status === 'Pending' ? 'bg-yellow-500 bg-opacity-20 text-yellow-300' :
                          request.status === 'Accepted' ? 'bg-blue-500 bg-opacity-20 text-blue-300' :
                          request.status === 'Completed' ? 'bg-green-500 bg-opacity-20 text-green-300' :
                          'bg-red-500 bg-opacity-20 text-red-300'
                        }`}>
                          {request.status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        {formatDate(request.request_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        {request.worker_arrival_time || 'Not set'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          request.user_confirmation_status === 'Confirmed' ? 'bg-green-500 bg-opacity-20 text-green-300' :
                          request.user_confirmation_status === 'Rejected' ? 'bg-red-500 bg-opacity-20 text-red-300' :
                          'bg-yellow-500 bg-opacity-20 text-yellow-300'
                        }`}>
                          {request.user_confirmation_status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {request.worker_arrival_time && request.status === 'Accepted' && (!request.user_confirmation_status || request.user_confirmation_status === 'Pending') ? (
                          <div className="flex gap-2">
                            <button
                              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors btn-3d"
                              onClick={() => handleConfirmArrival(request.request_id, request.user_id, 'Confirmed')}
                              disabled={confirmingArrival && confirmingArrival.requestId === request.request_id && confirmingArrival.status === 'Confirmed'}
                            >
                              {confirmingArrival && confirmingArrival.requestId === request.request_id && confirmingArrival.status === 'Confirmed' ? 'Confirming...' : 'Confirm'}
                            </button>
                            <button
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors btn-3d"
                              onClick={() => handleConfirmArrival(request.request_id, request.user_id, 'Rejected')}
                              disabled={confirmingArrival && confirmingArrival.requestId === request.request_id && confirmingArrival.status === 'Rejected'}
                            >
                              {confirmingArrival && confirmingArrival.requestId === request.request_id && confirmingArrival.status === 'Rejected' ? 'Rejecting...' : 'Reject'}
                            </button>
                          </div>
                        ) : request.worker_arrival_time ? (
                          <span className="text-white text-opacity-70">Arrival time set</span>
                        ) : (
                          <span className="text-white text-opacity-70">Not applicable</span>
                        )}
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="px-6 py-4 text-center text-white">
                      No work requests found
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>
        </div>
      </motion.div>
    );
  };

  // Feedback Tab
  const FeedbackTab = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white border-opacity-20 glass card-3d">
        <h2 className="text-2xl font-bold text-white mb-6">User Feedback</h2>
        <div className="space-y-4">
          {feedbacks && feedbacks.length > 0 ? (
            feedbacks.map((feedback) => (
              <motion.div 
                key={feedback.feedback_id || feedback.id || Math.random()} 
                className="p-4 bg-white bg-opacity-10 rounded-lg glass card-3d"
                whileHover={{ scale: 1.02, y: -3, z: 5 }}
              >
                <div className="flex justify-between">
                  <span className="font-medium text-white">Worker: {feedback.worker?.username || feedback.worker_name || 'Unknown'}</span>
                  <span className="text-yellow-300">
                    {feedback.rating ? '★'.repeat(Math.round(feedback.rating)) + '☆'.repeat(5 - Math.round(feedback.rating)) : 'No rating'}
                  </span>
                </div>
                <p className="text-white mt-2">{feedback.comment || feedback.comments || feedback.feedback_text || 'No comment'}</p>
                <p className="text-white text-opacity-70 text-sm mt-2">
                  By: {feedback.user?.username || feedback.user_name || 'Anonymous'} | {feedback.created_at ? new Date(feedback.created_at).toLocaleDateString() : 'Unknown date'}
                </p>
              </motion.div>
            ))
          ) : (
            <p className="text-white text-opacity-70">No feedback available</p>
          )}
        </div>
      </div>
    </motion.div>
  );

  const fetchWorkerWorkHistory = async (workerId) => {
    try {
      const response = await api.getWorkerWorkRequests(workerId);
      setWorkerWorkHistory(response.data || []);
      return response.data || [];
    } catch (err) {
      console.error('Error fetching worker work history:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
      setError(prev => prev ? `${prev} Failed to load worker work history: ${errorMessage}.` : `Failed to load worker work history: ${errorMessage}.`);
      setWorkerWorkHistory([]);
      return [];
    }
  };

  const handleViewWorkerDetails = async (worker) => {
    setSelectedWorker(worker);
    await fetchWorkerWorkHistory(worker.login_id || worker.worker_id);
  };

  const closeWorkerDetails = () => {
    setSelectedWorker(null);
    setWorkerWorkHistory([]);
  };

  // Loading dots component
  const LoadingDots = () => (
    <div className="flex justify-center items-center py-12">
      <div className="flex space-x-2">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-4 h-4 bg-white rounded-full shadow-lg"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: index * 0.2
            }}
          />
        ))}
      </div>
    </div>
  );

  // Show loading screen only on initial load
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <motion.div 
          className="text-3xl font-bold text-white"
          animate={{ 
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Loading Dashboard...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        ></motion.div>
        <motion.div 
          className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        ></motion.div>
      </div>

      {/* Header */}
      <motion.header 
        className="bg-white bg-opacity-10 backdrop-blur-lg shadow-xl rounded-b-2xl border-b border-white border-opacity-20"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <motion.div
            className="flex items-center"
            initial={{ x: -50 }}
            animate={{ x: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
          >
            {/* Replaced logo with enhanced text - keep both Skill and Hive on a single line */}
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-purple to-secondary-cyan drop-shadow-[0_0_5px_rgba(139,92,246,0.7)]">
                Skill
              </span>
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-secondary-cyan to-accent-cyan drop-shadow-[0_0_5px_rgba(6,182,212,0.7)]">
                Hive
              </span>
            </div>
            <span className="text-2xl font-bold text-white ml-2">Admin Dashboard</span>
          </motion.div>
          <div className="flex items-center space-x-4">
            <motion.span 
              className="text-white font-medium bg-gradient-primary bg-opacity-30 px-4 py-2 rounded-full backdrop-blur-sm glass"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Welcome, Admin
            </motion.span>
            <motion.button
              onClick={onLogout}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-2 px-6 rounded-full shadow-lg btn-3d"
              whileHover={{ scale: 1.05, boxShadow: "0 15px 25px rgba(0,0,0,0.3)", y: -3, z: 15 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              Logout
            </motion.button>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {error && (
          <motion.div 
            className="rounded-md bg-red-500 bg-opacity-20 p-4 mb-6 border border-red-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-sm text-red-200">{error}</div>
          </motion.div>
        )}

        <TabNavigation />

        {tabLoading ? (
          <LoadingDots />
        ) : (
          <>
            {activeTab === 'dashboard' && <DashboardOverview />}
            {activeTab === 'users' && <ManageUsers />}
            {activeTab === 'workers' && <ManageWorkers />}
            {activeTab === 'skills' && <ManageSkills />}
            {activeTab === 'workRequests' && <WorkRequests />}
            {activeTab === 'feedback' && <FeedbackTab />}
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;