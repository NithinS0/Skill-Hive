import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getUser, getUserWorkRequests, createWorkRequest, getSkillTypes, getUserNotifications, submitFeedback, cancelWorkRequest, confirmWorkerArrival, updateUser } from '../services/api';

const UserDashboard = ({ user, onLogout }) => {
  const [userData, setUserData] = useState(null);
  const [workRequests, setWorkRequests] = useState([]);
  const [skillTypes, setSkillTypes] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('post-request');
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [cancellingRequestId, setCancellingRequestId] = useState(null);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number1: '',
    phone_number2: ''
  });

  const [formData, setFormData] = useState({
    skill_type_id: '',
    description: '',
    request_date: '',
    location: '',
    city: '',
    pincode: '',
    door_no: '',
    street_name: '',
    area: ''
  });
  
  const [feedbackData, setFeedbackData] = useState({
    request_id: '',
    comments: '',
    rating: 5
  });
  
  // Fetch only essential data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching initial data for user:', user.login_id);
        // Only fetch user data and skill types initially
        // Other data will be loaded on demand
        const [userResponse, skillsResponse] = await Promise.all([
          getUser(user.login_id),
          getSkillTypes()
        ]);
        
        console.log('User data response:', userResponse);
        console.log('Skills data response:', skillsResponse);
        
        setUserData(userResponse.data);
        setSkillTypes(skillsResponse.data);
        // Set profile data
        setProfileData({
          first_name: userResponse.data.first_name || '',
          last_name: userResponse.data.last_name || '',
          email: userResponse.data.email || '',
          phone_number1: userResponse.data.phone_number1 || '',
          phone_number2: userResponse.data.phone_number2 || ''
        });
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
        console.error('Error response:', err.response);
        const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
        setError(`Failed to fetch initial data: ${errorMessage}. Please check your connection and try again.`);
        setLoading(false);
      }
    };

    if (user && user.login_id) {
      fetchData();
    }
  }, [user.login_id]);

  // Fetch specific data when tab changes
  const fetchTabData = useCallback(async () => {
    if (loading) return; // Don't fetch if still loading initial data
    
    if (activeTab === 'track-requests') {
      try {
        setTabLoading(true);
        console.log('Fetching work requests for user:', user.login_id);
        const response = await getUserWorkRequests(user.login_id);
        console.log('Work requests response:', response);
        setWorkRequests(response.data);
        setTabLoading(false);
      } catch (err) {
        console.error('Failed to fetch work requests:', err);
        console.error('Error response:', err.response);
        const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
        setError(`Failed to fetch work requests: ${errorMessage}. Please try again.`);
        setTabLoading(false);
      }
    } else if (activeTab === 'notifications') {
      try {
        setTabLoading(true);
        console.log('Fetching notifications for user:', user.login_id);
        const response = await getUserNotifications(user.login_id);
        console.log('Notifications response:', response);
        setNotifications(response.data);
        setTabLoading(false);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
        console.error('Error response:', err.response);
        const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
        setError(`Failed to fetch notifications: ${errorMessage}. Please try again.`);
        setTabLoading(false);
      }
    } else if (activeTab === 'feedback') {
      // For feedback tab, we need updated work requests
      try {
        setTabLoading(true);
        console.log('Fetching data for feedback tab for user:', user.login_id);
        const [requestsResponse, skillsResponse] = await Promise.all([
          getUserWorkRequests(user.login_id),
          getSkillTypes()
        ]);
        console.log('Requests response:', requestsResponse);
        console.log('Skills response:', skillsResponse);
        setWorkRequests(requestsResponse.data);
        setSkillTypes(skillsResponse.data);
        setTabLoading(false);
      } catch (err) {
        console.error('Failed to fetch data for feedback:', err);
        console.error('Error response:', err.response);
        const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
        setError(`Failed to fetch data for feedback: ${errorMessage}. Please try again.`);
        setTabLoading(false);
      }
    } else if (activeTab === 'confirm-arrival') {
      // For confirm arrival tab, we need updated work requests
      try {
        setTabLoading(true);
        console.log('Fetching data for confirm arrival tab for user:', user.login_id);
        const response = await getUserWorkRequests(user.login_id);
        console.log('Requests response:', response);
        setWorkRequests(response.data);
        setTabLoading(false);
      } catch (err) {
        console.error('Failed to fetch data for confirm arrival:', err);
        console.error('Error response:', err.response);
        const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
        setError(`Failed to fetch data for confirm arrival: ${errorMessage}. Please try again.`);
        setTabLoading(false);
      }
    }
  }, [activeTab, user.login_id, loading]);

  useEffect(() => {
    fetchTabData();
  }, [fetchTabData]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFeedbackChange = (e) => {
    setFeedbackData({
      ...feedbackData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateUser(user.login_id, profileData);
      alert('Profile updated successfully!');
      // Update userData state as well
      setUserData({
        ...userData,
        ...profileData
      });
    } catch (err) {
      console.error('Failed to update profile:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
      setError(`Failed to update profile: ${errorMessage}. Please try again.`);
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    try {
      setSubmittingRequest(true);
      const requestData = {
        ...formData,
        user_id: user.login_id,
        request_date: formData.request_date || new Date().toISOString().split('T')[0]
      };
      
      await createWorkRequest(requestData);
      alert('Work request submitted successfully!');
      
      // Reset form
      setFormData({
        skill_type_id: '',
        description: '',
        request_date: '',
        location: '',
        city: '',
        pincode: '',
        door_no: '',
        street_name: '',
        area: ''
      });
      
      // Refresh requests on the track-requests tab
      if (activeTab === 'track-requests') {
        try {
          const response = await getUserWorkRequests(user.login_id);
          setWorkRequests(response.data);
        } catch (err) {
          console.error('Failed to refresh work requests:', err);
          const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
          setError(`Failed to refresh work requests: ${errorMessage}.`);
        }
      }
    } catch (err) {
      console.error('Failed to submit work request:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
      setError(`Failed to submit work request: ${errorMessage}. Please check your input and try again.`);
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    try {
      setSubmittingFeedback(true);
      await submitFeedback(feedbackData);
      alert('Feedback submitted successfully!');
      
      // Reset form
      setFeedbackData({
        request_id: '',
        comments: '',
        rating: 5
      });
      
      // Only refresh data relevant to current tab
      if (activeTab === 'track-requests') {
        try {
          const requestsResponse = await getUserWorkRequests(user.login_id);
          setWorkRequests(requestsResponse.data);
        } catch (err) {
          console.error('Failed to refresh work requests:', err);
          const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
          setError(`Failed to refresh work requests: ${errorMessage}.`);
        }
      } else if (activeTab === 'notifications') {
        try {
          const notificationsResponse = await getUserNotifications(user.login_id);
          setNotifications(notificationsResponse.data);
        } catch (err) {
          console.error('Failed to refresh notifications:', err);
          const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
          setError(`Failed to refresh notifications: ${errorMessage}.`);
        }
      }
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
      setError(`Failed to submit feedback: ${errorMessage}. Please check your input and try again.`);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (window.confirm('Are you sure you want to cancel this work request?')) {
      try {
        setCancellingRequestId(requestId);
        await cancelWorkRequest(requestId, user.login_id);
        alert('Work request cancelled successfully!');
        
        // Refresh requests on the track-requests tab
        if (activeTab === 'track-requests') {
          try {
            const response = await getUserWorkRequests(user.login_id);
            setWorkRequests(response.data);
          } catch (err) {
            console.error('Failed to refresh work requests:', err);
            const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
            setError(`Failed to refresh work requests: ${errorMessage}.`);
          }
        }
      } catch (err) {
        console.error('Failed to cancel work request:', err);
        const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
        setError(`Failed to cancel work request: ${errorMessage}. Please try again.`);
      } finally {
        setCancellingRequestId(null);
      }
    }
  };

  const handleConfirmArrival = async (requestId, confirmationStatus) => {
    try {
      await confirmWorkerArrival(user.login_id, requestId, confirmationStatus);
      alert(`Worker arrival ${confirmationStatus.toLowerCase()} successfully!`);
      
      // Refresh requests
      try {
        const response = await getUserWorkRequests(user.login_id);
        setWorkRequests(response.data);
      } catch (err) {
        console.error('Failed to refresh work requests:', err);
        const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
        setError(`Failed to refresh work requests: ${errorMessage}.`);
      }
    } catch (err) {
      console.error('Failed to confirm worker arrival:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
      setError(`Failed to confirm worker arrival: ${errorMessage}. Please try again.`);
    }
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-bg to-dark-card">
        <div className="text-3xl font-bold text-dark-text animate-pulse">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-card to-dark-bg">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary-purple rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-cyan rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-primary-rose rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <motion.header 
        className="bg-dark-card bg-opacity-70 backdrop-blur-lg shadow-xl rounded-b-2xl border-b border-dark-accent border-opacity-50"
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
            <span className="text-2xl font-bold text-dark-text ml-2">User Dashboard</span>
          </motion.div>
          <div className="flex items-center space-x-4">
            <motion.span 
              className="text-dark-text font-medium bg-gradient-primary bg-opacity-30 px-4 py-2 rounded-full backdrop-blur-sm glass"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Welcome, {userData?.first_name} {userData?.last_name}
              <br />
              <span className="text-sm text-light-text">
                {userData?.phone_number1} {userData?.phone_number2 && `, ${userData?.phone_number2}`}
              </span>
            </motion.span>
            <motion.button
              onClick={onLogout}
              className="bg-gradient-to-r from-primary-rose to-secondary-rose hover:from-rose-700 hover:to-rose-800 text-white font-bold py-2 px-6 rounded-full shadow-lg shadow-dark-glow btn-3d"
              whileHover={{ scale: 1.05, boxShadow: "0 15px 25px rgba(0,0,0,0.3)", y: -3, z: 15 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              Logout
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Navigation Tabs */}
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="border-b border-white border-opacity-20">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {[
              { id: 'post-request', label: 'Post Work Request' },
              { id: 'track-requests', label: 'Track Requests' },
              { id: 'notifications', label: 'Notifications' },
              { id: 'feedback', label: 'Feedback' },
              { id: 'profile', label: 'Edit Profile' },
              { id: 'confirm-arrival', label: 'Confirm Arrival' }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-primary-purple text-dark-text bg-dark-card bg-opacity-70'
                    : 'border-transparent text-light-text hover:text-primary-purple hover:border-primary-purple'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm rounded-t-lg transition-all duration-300 btn-3d`}
                whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.2)", z: 10 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </nav>
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {error && (
          <motion.div 
            className="rounded-md bg-primary-rose bg-opacity-20 p-4 mb-6 border border-secondary-rose"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-sm text-dark-text">{error}</div>
            <button 
              onClick={() => setError('')} 
              className="mt-2 text-sm text-accent-rose underline"
            >
              Dismiss
            </button>
          </motion.div>
        )}

        {tabLoading ? (
          <LoadingDots />
        ) : (
          <>
            {activeTab === 'post-request' && (
              <motion.div 
                className="bg-dark-card bg-opacity-70 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-dark-accent border-opacity-50 glass card-3d"
                initial={{ opacity: 0, y: 20, z: -30 }}
                animate={{ opacity: 1, y: 0, z: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -10, z: 20 }}
              >
                <h2 className="text-2xl font-bold mb-6 text-dark-text">Post a New Work Request</h2>
                <form onSubmit={handleSubmitRequest} className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label htmlFor="skill_type_id" className="block text-sm font-medium text-dark-text mb-2">
                      Skill Type
                    </label>
                    <select
                      id="skill_type_id"
                      name="skill_type_id"
                      required
                      value={formData.skill_type_id}
                      onChange={handleInputChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-dark-accent focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent sm:text-sm rounded-lg bg-dark-accent text-white input-3d"
                    >
                      <option value="">Select a skill type</option>
                      {skillTypes.map((skill) => (
                        <option key={skill.skill_type_id} value={skill.skill_type_id}>
                          {skill.skill_name}
                        </option>
                      ))}
                    </select>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label htmlFor="description" className="block text-sm font-medium text-dark-text mb-2">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      required
                      value={formData.description}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-dark-accent rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent sm:text-sm bg-dark-accent text-white input-3d"
                      placeholder="Describe the work you need done..."
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label htmlFor="request_date" className="block text-sm font-medium text-dark-text mb-2">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      id="request_date"
                      name="request_date"
                      value={formData.request_date}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="mt-1 block w-full border border-dark-accent rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent sm:text-sm bg-dark-accent text-white input-3d"
                    />
                  </motion.div>

                  <h3 className="text-lg font-medium text-dark-text mt-6 mb-3">Location Details</h3>
                  
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label htmlFor="location" className="block text-sm font-medium text-dark-text mb-2">
                      Location Name
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      required
                      value={formData.location}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-dark-accent rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent sm:text-sm bg-dark-accent text-white input-3d"
                      placeholder="e.g., Home, Office"
                    />
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <label htmlFor="city" className="block text-sm font-medium text-dark-text mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-dark-accent rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent sm:text-sm bg-dark-accent text-white input-3d"
                        placeholder="City"
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <label htmlFor="pincode" className="block text-sm font-medium text-dark-text mb-2">
                        Pincode
                      </label>
                      <input
                        type="text"
                        id="pincode"
                        name="pincode"
                        required
                        value={formData.pincode}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-dark-accent rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent sm:text-sm bg-dark-accent text-white input-3d"
                        placeholder="Pincode"
                      />
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <label htmlFor="door_no" className="block text-sm font-medium text-dark-text mb-2">
                        Door No
                      </label>
                      <input
                        type="text"
                        id="door_no"
                        name="door_no"
                        required
                        value={formData.door_no}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-dark-accent rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent sm:text-sm bg-dark-accent text-white input-3d"
                        placeholder="Door No"
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <label htmlFor="street_name" className="block text-sm font-medium text-dark-text mb-2">
                        Street Name
                      </label>
                      <input
                        type="text"
                        id="street_name"
                        name="street_name"
                        required
                        value={formData.street_name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-dark-accent rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent sm:text-sm bg-dark-accent text-white input-3d"
                        placeholder="Street Name"
                      />
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <label htmlFor="area" className="block text-sm font-medium text-dark-text mb-2">
                      Area
                    </label>
                    <input
                      type="text"
                      id="area"
                      name="area"
                      required
                      value={formData.area}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-dark-accent rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent sm:text-sm bg-dark-accent text-white input-3d"
                      placeholder="Area"
                    />
                  </motion.div>

                  <motion.div 
                    className="flex justify-end"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                  >
                    <motion.button
                      type="submit"
                      disabled={submittingRequest}
                      className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 btn-3d disabled:opacity-50"
                      whileHover={{ scale: 1.05, boxShadow: "0 15px 25px rgba(0,0,0,0.3)", y: -3, z: 15 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {submittingRequest ? 'Submitting...' : 'Submit Request'}
                    </motion.button>
                  </motion.div>
                </form>
              </motion.div>
            )}

            {activeTab === 'track-requests' && (
              <motion.div 
                className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white border-opacity-20 glass card-3d"
                initial={{ opacity: 0, y: 20, z: -30 }}
                animate={{ opacity: 1, y: 0, z: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -10, z: 20 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Track Your Work Requests</h2>
                  <motion.button
                    onClick={async () => {
                      try {
                        setTabLoading(true);
                        const response = await getUserWorkRequests(user.login_id);
                        setWorkRequests(response.data);
                      } catch (err) {
                        console.error('Failed to refresh work requests:', err);
                        const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
                        setError(`Failed to refresh work requests: ${errorMessage}.`);
                      } finally {
                        setTabLoading(false);
                      }
                    }}
                    className="bg-gradient-to-r from-green-600 to-teal-700 hover:from-green-600 hover:to-teal-800 text-white font-bold py-2 px-4 rounded-full shadow-lg btn-3d"
                    whileHover={{ scale: 1.05, boxShadow: "0 15px 25px rgba(0,0,0,0.3)", y: -3, z: 10 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Refresh
                  </motion.button>
                </div>
                
                {workRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <motion.p 
                      className="text-white text-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      You haven't submitted any work requests yet.
                    </motion.p>
                  </div>
                ) : (
                  <motion.div 
                    className="overflow-x-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <table className="min-w-full divide-y divide-white divide-opacity-20">
                      <thead className="bg-white bg-opacity-10">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Request ID
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Skill Type
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Description
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Request Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white bg-opacity-5 divide-y divide-white divide-opacity-10">
                        {workRequests.map((request) => (
                          <motion.tr 
                            key={request.request_id}
                            whileHover={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                            transition={{ duration: 0.2 }}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                              {request.request_id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                              {request.skill_name}
                            </td>
                            <td className="px-6 py-4 text-sm text-white">
                              {request.description.substring(0, 50)}...
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                              {new Date(request.request_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                request.status === 'Pending' ? 'bg-yellow-500 bg-opacity-20 text-yellow-200' :
                                request.status === 'Accepted' ? 'bg-green-500 bg-opacity-20 text-green-200' :
                                request.status === 'Completed' ? 'bg-blue-500 bg-opacity-20 text-blue-200' :
                                request.status === 'Cancelled' ? 'bg-red-500 bg-opacity-20 text-red-200' :
                                'bg-gray-500 bg-opacity-20 text-gray-200'
                              } glass`}>
                                {request.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                              {(request.status === 'Pending' || request.status === 'Accepted') && (
                                <motion.button
                                  onClick={() => handleCancelRequest(request.request_id)}
                                  disabled={cancellingRequestId === request.request_id}
                                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs btn-3d"
                                  whileHover={{ scale: 1.05, y: -2 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  {cancellingRequestId === request.request_id ? 'Cancelling...' : 'Cancel'}
                                </motion.button>
                              )}
                              {request.status === 'Completed' && (
                                <span className="text-green-400 text-xs">Completed</span>
                              )}
                              {request.status === 'Cancelled' && (
                                <span className="text-red-400 text-xs">Cancelled</span>
                              )}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div 
                className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white border-opacity-20 glass card-3d"
                initial={{ opacity: 0, y: 20, z: -30 }}
                animate={{ opacity: 1, y: 0, z: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -10, z: 20 }}
              >
                <h2 className="text-2xl font-bold mb-6 text-white">Notifications</h2>
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <motion.p 
                      className="text-white text-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      You don't have any notifications yet.
                    </motion.p>
                  </div>
                ) : (
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {notifications.map((notification) => (
                      <motion.div 
                        key={notification.notification_id} 
                        className="border border-white border-opacity-20 rounded-lg p-4 bg-white bg-opacity-5 glass card-3d"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ scale: 1.02, y: -5, z: 10 }}
                      >
                        <div className="flex justify-between">
                          <h3 className="text-lg font-medium text-white">{notification.message}</h3>
                          <span className="text-sm text-white text-opacity-70">
                            {new Date(notification.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-white text-opacity-70 mt-1">
                          Related to: {notification.skill_name} request #{notification.request_id}
                        </p>
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            notification.status === 'Read' ? 'bg-green-500 bg-opacity-20 text-green-200' : 'bg-yellow-500 bg-opacity-20 text-yellow-200'
                          }`}>
                            {notification.status}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === 'feedback' && (
              <motion.div 
                className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white border-opacity-20 glass card-3d"
                initial={{ opacity: 0, y: 20, z: -30 }}
                animate={{ opacity: 1, y: 0, z: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -10, z: 20 }}
              >
                <h2 className="text-2xl font-bold mb-6 text-white">Give Feedback</h2>
                <form onSubmit={handleSubmitFeedback} className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label htmlFor="request_id" className="block text-sm font-medium text-white">
                      Work Request
                    </label>
                    <select
                      id="request_id"
                      name="request_id"
                      required
                      value={feedbackData.request_id}
                      onChange={handleFeedbackChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm rounded-lg bg-gray-800 text-white input-3d"
                    >
                      <option value="">Select a completed work request</option>
                      {workRequests
                        .filter(request => request.status === 'Completed')
                        .map((request) => (
                          <option key={request.request_id} value={request.request_id}>
                            #{request.request_id} - {request.skill_name} (Requested on {new Date(request.request_date).toLocaleDateString()})
                          </option>
                        ))}
                    </select>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-white">
                      Rating
                    </label>
                    <div className="flex items-center mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackData({ ...feedbackData, rating: star })}
                          className="text-2xl focus:outline-none"
                        >
                          {star <= feedbackData.rating ? (
                            <span className="text-yellow-400">★</span>
                          ) : (
                            <span className="text-gray-400">☆</span>
                          )}
                        </button>
                      ))}
                      <span className="ml-2 text-white">{feedbackData.rating} Star{feedbackData.rating !== 1 ? 's' : ''}</span>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label htmlFor="comments" className="block text-sm font-medium text-white">
                      Comments
                    </label>
                    <textarea
                      id="comments"
                      name="comments"
                      rows={4}
                      value={feedbackData.comments}
                      onChange={handleFeedbackChange}
                      className="mt-1 block w-full border border-gray-700 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm bg-gray-800 text-white input-3d"
                      placeholder="Share your experience..."
                    />
                  </motion.div>

                  <motion.div
                    className="flex justify-end"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <motion.button
                      type="submit"
                      disabled={submittingFeedback}
                      className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 btn-3d disabled:opacity-50"
                      whileHover={{ scale: 1.05, boxShadow: "0 15px 25px rgba(0,0,0,0.3)", y: -3, z: 15 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                    </motion.button>
                  </motion.div>
                </form>
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div 
                className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white border-opacity-20 glass card-3d"
                initial={{ opacity: 0, y: 20, z: -30 }}
                animate={{ opacity: 1, y: 0, z: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -10, z: 20 }}
              >
                <h2 className="text-2xl font-bold mb-6 text-white">Edit Profile</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <label htmlFor="first_name" className="block text-sm font-medium text-white mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="first_name"
                        name="first_name"
                        value={profileData.first_name}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 rounded-lg bg-dark-accent text-white placeholder-light-text border border-dark-accent focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent input-3d"
                        placeholder="First Name"
                      />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <label htmlFor="last_name" className="block text-sm font-medium text-white mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        value={profileData.last_name}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 rounded-lg bg-dark-accent text-white placeholder-light-text border border-dark-accent focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent input-3d"
                        placeholder="Last Name"
                      />
                    </motion.div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <label htmlFor="phone_number1" className="block text-sm font-medium text-white mb-2">
                        Primary Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone_number1"
                        name="phone_number1"
                        value={profileData.phone_number1}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 rounded-lg bg-dark-accent text-white placeholder-light-text border border-dark-accent focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent input-3d"
                        placeholder="Primary Phone Number"
                      />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <label htmlFor="phone_number2" className="block text-sm font-medium text-white mb-2">
                        Secondary Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone_number2"
                        name="phone_number2"
                        value={profileData.phone_number2}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 rounded-lg bg-dark-accent text-white placeholder-light-text border border-dark-accent focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent input-3d"
                        placeholder="Secondary Phone Number"
                      />
                    </motion.div>
                  </div>
                  
                  <motion.div
                    className="flex justify-end pt-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <motion.button
                      type="submit"
                      className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 btn-3d"
                      whileHover={{ scale: 1.05, boxShadow: "0 15px 25px rgba(0,0,0,0.3)", y: -3, z: 15 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Update Profile
                    </motion.button>
                  </motion.div>
                </form>
              </motion.div>
            )}
            
            {activeTab === 'confirm-arrival' && (
              <motion.div 
                className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white border-opacity-20 glass card-3d"
                initial={{ opacity: 0, y: 20, z: -30 }}
                animate={{ opacity: 1, y: 0, z: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -10, z: 20 }}
              >
                <h2 className="text-2xl font-bold mb-6 text-white">Confirm Worker Arrival</h2>
                {workRequests.filter(request => request.status === 'Accepted' && request.worker_arrival_time).length === 0 ? (
                  <p className="text-white text-opacity-70">No work requests with arrival times to confirm.</p>
                ) : (
                  <div className="space-y-4">
                    {workRequests
                      .filter(request => request.status === 'Accepted' && request.worker_arrival_time)
                      .map((request) => (
                        <motion.div 
                          key={request.request_id} 
                          className="border border-white border-opacity-20 rounded-lg p-4 bg-white bg-opacity-5"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex justify-between">
                            <h3 className="text-lg font-medium text-white">
                              #{request.request_id} - {request.skill_name}
                            </h3>
                            <span className="text-sm text-white text-opacity-70">
                              {new Date(request.request_date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-white text-opacity-70 mt-1">
                            {request.description.substring(0, 100)}...
                          </p>
                          <div className="mt-3 flex items-center justify-between">
                            <div>
                              <p className="text-white">
                                Worker: {request.worker_first_name} {request.worker_last_name}
                              </p>
                              <p className="text-white">
                                Arrival Time: {request.worker_arrival_time}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <motion.button
                                onClick={() => handleConfirmArrival(request.request_id, 'Confirmed')}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors btn-3d"
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Confirm
                              </motion.button>
                              <motion.button
                                onClick={() => handleConfirmArrival(request.request_id, 'Rejected')}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors btn-3d"
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Reject
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                )}
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;