import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getWorker, updateWorker, updateWorkerAvailability, updateWorkerStatus, getWorkerNotifications, getWorkerSkills, getWorkerWorkRequests, getAvailableWorkRequests, acceptWorkRequest, declineWorkRequest, completeWorkRequest, getWorkerFeedback, setWorkerArrivalTime, getSkillTypes } from '../services/api';

const WorkerDashboard = ({ worker, onLogout }) => {
  const [workerData, setWorkerData] = useState(null);
  const [workerSkills, setWorkerSkills] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [workRequests, setWorkRequests] = useState([]);
  const [availableRequests, setAvailableRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('availability');
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [error, setError] = useState('');
  const [availabilityData, setAvailabilityData] = useState({
    morning_start: '09:30',
    morning_end: '12:00',
    afternoon_start: '13:00',
    afternoon_end: '18:00'
  });
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [timeSlot, setTimeSlot] = useState('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedRequestIdForCompletion, setSelectedRequestIdForCompletion] = useState(null);
  const [amount, setAmount] = useState('');
  const [workerStatus, setWorkerStatus] = useState('Available');
  const [feedbacks, setFeedbacks] = useState([]);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);
  const [acceptingRequestId, setAcceptingRequestId] = useState(null);
  const [decliningRequestId, setDecliningRequestId] = useState(null);
  const [completingRequestId, setCompletingRequestId] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    address: '',
    city: '',
    pincode: '',
    door_no: '',
    street_name: '',
    area: '',
    experience_years: '',
    phone_number1: '',
    phone_number2: ''
  });
  const [skillTypes, setSkillTypes] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [arrivalTime, setArrivalTime] = useState('');
  const [showArrivalTimeModal, setShowArrivalTimeModal] = useState(false);
  const [selectedRequestIdForArrival, setSelectedRequestIdForArrival] = useState(null);

  // Fetch only essential data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (!worker || !worker.login_id) return;
      
      try {
        setLoading(true);
        // Fetch worker data, skill types, and worker skills
        const [workerResponse, skillsResponse, workerSkillsResponse] = await Promise.all([
          getWorker(worker.login_id),
          getSkillTypes(),
          getWorkerSkills(worker.login_id)
        ]);
        
        setWorkerData(workerResponse.data);
        setWorkerStatus(workerResponse.data?.available_status || 'Available');
        setSkillTypes(skillsResponse.data);
        
        // Set selected skills from worker skills
        if (workerSkillsResponse.data && Array.isArray(workerSkillsResponse.data)) {
          const skillIds = workerSkillsResponse.data.map(skill => skill.skill_type_id);
          setSelectedSkills(skillIds);
        }
        
        // Set profile data
        setProfileData({
          first_name: workerResponse.data.first_name || '',
          last_name: workerResponse.data.last_name || '',
          address: workerResponse.data.address || '',
          city: workerResponse.data.city || '',
          pincode: workerResponse.data.pincode || '',
          door_no: workerResponse.data.door_no || '',
          street_name: workerResponse.data.street_name || '',
          area: workerResponse.data.area || '',
          experience_years: workerResponse.data.experience_years || '',
          phone_number1: workerResponse.data.phone_number1 || '',
          phone_number2: workerResponse.data.phone_number2 || ''
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
        const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
        setError(`Failed to fetch initial data: ${errorMessage}. Please check your connection and try again.`);
        setLoading(false);
      }
    };

    fetchData();
  }, [worker.login_id]);

  // Fetch specific data when tab changes
  const fetchTabData = useCallback(async () => {
    if (loading || !worker || !worker.login_id) return;
    
    try {
      switch (activeTab) {
        case 'availability':
          // Already have worker data
          break;
          
        case 'requests':
          setTabLoading(true);
          try {
            const [assignedResponse, availableResponse] = await Promise.all([
              getWorkerWorkRequests(worker.login_id),
              getAvailableWorkRequests(worker.login_id)
            ]);
            setWorkRequests(assignedResponse.data);
            setAvailableRequests(availableResponse.data);
          } catch (err) {
            console.error('Failed to fetch work requests:', err);
            const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
            setError(`Failed to fetch work requests: ${errorMessage}. Please try again.`);
          } finally {
            setTabLoading(false);
          }
          break;
          
        case 'notifications':
          setTabLoading(true);
          try {
            const notificationsResponse = await getWorkerNotifications(worker.login_id);
            setNotifications(notificationsResponse.data);
          } catch (err) {
            console.error('Failed to fetch notifications:', err);
            const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
            setError(`Failed to fetch notifications: ${errorMessage}. Please try again.`);
          } finally {
            setTabLoading(false);
          }
          break;
          
        case 'skills':
          setTabLoading(true);
          try {
            const skillsResponse = await getWorkerSkills(worker.login_id);
            setWorkerSkills(skillsResponse.data);
          } catch (err) {
            console.error('Failed to fetch skills:', err);
            const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
            setError(`Failed to fetch skills: ${errorMessage}. Please try again.`);
          } finally {
            setTabLoading(false);
          }
          break;
          
        case 'feedback':
          setTabLoading(true);
          try {
            const feedbackResponse = await getWorkerFeedback(worker.login_id);
            setFeedbacks(feedbackResponse.data || []);
          } catch (err) {
            console.error('Failed to fetch feedback:', err);
            const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
            setError(`Failed to fetch feedback: ${errorMessage}. Please try again.`);
          } finally {
            setTabLoading(false);
          }
          break;
          
        default:
          break;
      }
    } catch (err) {
      console.error(`Failed to fetch ${activeTab} data:`, err);
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
      setError(`Failed to fetch ${activeTab} data: ${errorMessage}. Please try again.`);
      setTabLoading(false);
    }
  }, [activeTab, worker.login_id, loading]);

  useEffect(() => {
    fetchTabData();
  }, [fetchTabData]);

  const handleAvailabilityChange = (e) => {
    setAvailabilityData({
      ...availabilityData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleSkillToggle = (skillId) => {
    if (selectedSkills.includes(skillId)) {
      setSelectedSkills(selectedSkills.filter(id => id !== skillId));
    } else {
      if (selectedSkills.length < 5) { // Limit to 5 skills
        setSelectedSkills([...selectedSkills, skillId]);
      }
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const profileUpdateData = {
        ...profileData,
        skill_ids: selectedSkills
      };
      await updateWorker(worker.login_id, profileUpdateData);
      alert('Profile updated successfully!');
      // Update workerData state as well
      setWorkerData({
        ...workerData,
        ...profileData
      });
    } catch (err) {
      console.error('Failed to update profile:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
      setError(`Failed to update profile: ${errorMessage}. Please try again.`);
    }
  };

  const handleSetArrivalTime = async (requestId) => {
    setSelectedRequestIdForArrival(requestId);
    setShowArrivalTimeModal(true);
  };

  const handleConfirmArrivalTime = async () => {
    try {
      await setWorkerArrivalTime(worker.login_id, selectedRequestIdForArrival, arrivalTime);
      alert('Arrival time set successfully!');
      
      // Refresh the requests
      try {
        const [assignedResponse, availableResponse] = await Promise.all([
          getWorkerWorkRequests(worker.login_id),
          getAvailableWorkRequests(worker.login_id)
        ]);
        setWorkRequests(assignedResponse.data);
        setAvailableRequests(availableResponse.data);
      } catch (err) {
        console.error('Failed to refresh work requests:', err);
        const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
        setError(`Failed to refresh work requests: ${errorMessage}.`);
      }
      
      // Close the modal and reset state
      setShowArrivalTimeModal(false);
      setSelectedRequestIdForArrival(null);
      setArrivalTime('');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
      setError(`Failed to set arrival time: ${errorMessage}. Please try again.`);
    }
  };

  const handleAvailabilitySubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdatingAvailability(true);
      await updateWorkerAvailability(worker.login_id, availabilityData);
      alert('Availability updated successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
      setError(`Failed to update availability: ${errorMessage}. Please check your input and try again.`);
    } finally {
      setUpdatingAvailability(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    // Show the time slot modal instead of directly accepting
    setSelectedRequestId(requestId);
    setShowTimeSlotModal(true);
  };

  const handleConfirmAccept = async () => {
    try {
      setAcceptingRequestId(selectedRequestId);
      await acceptWorkRequest(worker.login_id, selectedRequestId, timeSlot);
      
      // Refresh the available requests and assigned requests
      try {
        const [assignedResponse, availableResponse] = await Promise.all([
          getWorkerWorkRequests(worker.login_id),
          getAvailableWorkRequests(worker.login_id)
        ]);
        setWorkRequests(assignedResponse.data);
        setAvailableRequests(availableResponse.data);
      } catch (err) {
        console.error('Failed to refresh work requests:', err);
        const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
        setError(`Failed to refresh work requests: ${errorMessage}.`);
      }
      
      alert('Work request accepted successfully!');
      // Close the modal and reset state
      setShowTimeSlotModal(false);
      setSelectedRequestId(null);
      setTimeSlot('');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
      setError(`Failed to accept work request: ${errorMessage}. Please try again.`);
    } finally {
      setAcceptingRequestId(null);
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      setDecliningRequestId(requestId);
      await declineWorkRequest(worker.login_id, requestId);
      
      // Refresh the available requests and assigned requests
      try {
        const [assignedResponse, availableResponse] = await Promise.all([
          getWorkerWorkRequests(worker.login_id),
          getAvailableWorkRequests(worker.login_id)
        ]);
        setWorkRequests(assignedResponse.data);
        setAvailableRequests(availableResponse.data);
      } catch (err) {
        console.error('Failed to refresh work requests:', err);
        const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
        setError(`Failed to refresh work requests: ${errorMessage}.`);
      }
      
      alert('Work request declined successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
      setError(`Failed to decline work request: ${errorMessage}. Please try again.`);
    } finally {
      setDecliningRequestId(null);
    }
  };

  const handleCompleteRequest = async (requestId) => {
    // Show the completion modal
    setSelectedRequestIdForCompletion(requestId);
    setShowCompleteModal(true);
  };

  const handleConfirmComplete = async () => {
    try {
      setCompletingRequestId(selectedRequestIdForCompletion);
      await completeWorkRequest(worker.login_id, selectedRequestIdForCompletion, amount);
      
      // Refresh the available requests and assigned requests
      try {
        const [assignedResponse, availableResponse] = await Promise.all([
          getWorkerWorkRequests(worker.login_id),
          getAvailableWorkRequests(worker.login_id)
        ]);
        setWorkRequests(assignedResponse.data);
        setAvailableRequests(availableResponse.data);
      } catch (err) {
        console.error('Failed to refresh work requests:', err);
        const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
        setError(`Failed to refresh work requests: ${errorMessage}.`);
      }
      
      alert('Work request completed successfully!');
      // Close the modal and reset state
      setShowCompleteModal(false);
      setSelectedRequestIdForCompletion(null);
      setAmount('');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
      setError(`Failed to complete work request: ${errorMessage}. Please try again.`);
    } finally {
      setCompletingRequestId(null);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      setUpdatingStatus(true);
      await updateWorkerStatus(worker.login_id, status);
      setWorkerStatus(status);
      alert(`Status updated to ${status}`);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
      setError(`Failed to update status: ${errorMessage}. Please try again.`);
    } finally {
      setUpdatingStatus(false);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-green-900 to-slate-800">
        <div className="text-3xl font-bold text-white">
          Loading Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-800">
      {/* Time Slot Modal */}
      {showTimeSlotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white border-opacity-20 max-w-md w-full mx-4 glass card-3d">
            <h2 className="text-2xl font-bold mb-4 text-white">Select Time Slot</h2>
            <p className="text-white mb-4">Please provide a time slot for this work request:</p>
            <input
              type="text"
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              placeholder="e.g., 10:00 AM - 12:00 PM"
              className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4 input-3d"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowTimeSlotModal(false);
                  setSelectedRequestId(null);
                  setTimeSlot('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-white hover:bg-white hover:bg-opacity-10 transition-colors btn-3d"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAccept}
                className="px-4 py-2 bg-gradient-to-r from-teal-600 to-blue-700 text-white rounded-lg hover:from-teal-700 hover:to-blue-800 transition-all btn-3d"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white border-opacity-20 max-w-md w-full mx-4 glass card-3d">
            <h2 className="text-2xl font-bold mb-4 text-white">Complete Work Request</h2>
            <p className="text-white mb-4">Please enter the amount for this work:</p>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount in ₹"
              className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 mb-4 input-3d"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCompleteModal(false);
                  setSelectedRequestIdForCompletion(null);
                  setAmount('');
                }}
                className="px-4 py-2 rounded-lg border border-white border-opacity-20 text-white hover:bg-white hover:bg-opacity-10 transition-colors btn-3d"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmComplete}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-teal-700 text-white hover:from-green-700 hover:to-teal-800 transition-colors btn-3d"
              >
                Confirm Completion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <motion.header 
        className="bg-white bg-opacity-10 backdrop-blur-lg shadow-2xl border-b border-white border-opacity-20 glass"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        whileHover={{ y: -5, z: 10 }}
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
            <span className="text-2xl font-bold text-white ml-2">Worker Dashboard</span>
          </motion.div>
          <div className="flex items-center space-x-4">
            <motion.span 
              className="text-white font-medium bg-gradient-to-r from-green-500 to-teal-500 bg-opacity-30 px-4 py-2 rounded-full backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Welcome, {workerData?.first_name} {workerData?.last_name}
            </motion.span>
            <motion.button
              onClick={onLogout}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-2 px-6 rounded-full shadow-lg btn-3d"
              whileHover={{ scale: 1.05, boxShadow: "0 15px 25px rgba(0,0,0,0.3)", y: -3, z: 10 }}
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
              { id: 'availability', label: 'Update Availability' },
              { id: 'requests', label: 'View Work Requests' },
              { id: 'notifications', label: 'Notifications' },
              { id: 'skills', label: 'My Skills' },
              { id: 'feedback', label: 'User Feedback' },
              { id: 'profile', label: 'Edit Profile' }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-green-500 text-white bg-white bg-opacity-10 shadow-lg'
                    : 'border-transparent text-gray-200 hover:text-white hover:border-green-500'
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
            className="rounded-md bg-red-500 bg-opacity-20 p-4 mb-6 border border-red-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-sm text-white">{error}</div>
            <button 
              onClick={() => setError('')} 
              className="mt-2 text-sm text-red-100 underline"
            >
              Dismiss
            </button>
          </motion.div>
        )}

        {tabLoading ? (
          <LoadingDots />
        ) : (
          <>
            {activeTab === 'availability' && (
              <motion.div 
                className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white border-opacity-20 relative glass card-3d"
                initial={{ opacity: 0, y: 20, z: -30 }}
                animate={{ opacity: 1, y: 0, z: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -10, z: 20 }}
              >
                <div className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full"></div>
                <h2 className="text-2xl font-bold mb-6 text-white">Update Availability</h2>
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-4 text-white">Set Your Status</h3>
                  <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={() => handleStatusChange('Available')}
                      className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                        workerStatus === 'Available' 
                          ? 'bg-gradient-to-r from-green-600 to-teal-700 text-white shadow-lg' 
                          : 'bg-white bg-opacity-10 text-white border border-white border-opacity-20 hover:bg-opacity-20'
                      }`}
                      disabled={updatingStatus}
                    >
                      {updatingStatus && workerStatus === 'Available' ? 'Updating...' : 'Available'}
                    </button>
                    <button 
                      onClick={() => handleStatusChange('At Work')}
                      className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                        workerStatus === 'At Work' 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg' 
                          : 'bg-white bg-opacity-10 text-white border border-white border-opacity-20 hover:bg-opacity-20'
                      }`}
                      disabled={updatingStatus}
                    >
                      {updatingStatus && workerStatus === 'At Work' ? 'Updating...' : 'At Work'}
                    </button>
                    <button 
                      onClick={() => handleStatusChange('Leave')}
                      className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                        workerStatus === 'Leave' 
                          ? 'bg-gradient-to-r from-amber-600 to-orange-700 text-white shadow-lg' 
                          : 'bg-white bg-opacity-10 text-white border border-white border-opacity-20 hover:bg-opacity-20'
                      }`}
                      disabled={updatingStatus}
                    >
                      {updatingStatus && workerStatus === 'Leave' ? 'Updating...' : 'Leave'}
                    </button>
                  </div>
                  <p className="mt-2 text-gray-200 text-opacity-70">
                    Current Status: <span className="font-medium">{workerStatus || 'Not Set'}</span>
                  </p>
                </div>
                <form onSubmit={handleAvailabilitySubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-white border-opacity-20 rounded-lg p-4 bg-white bg-opacity-5">
                      <h3 className="text-lg font-medium text-white mb-4">Morning Shift</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="morning_start" className="block text-sm font-medium text-gray-200">
                            Start Time
                          </label>
                          <input
                            type="time"
                            id="morning_start"
                            name="morning_start"
                            value={availabilityData.morning_start}
                            onChange={handleAvailabilityChange}
                            className="mt-1 block w-full border border-dark-accent rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent sm:text-sm bg-dark-accent text-white"
                          />
                        </div>
                        <div>
                          <label htmlFor="morning_end" className="block text-sm font-medium text-gray-200">
                            End Time
                          </label>
                          <input
                            type="time"
                            id="morning_end"
                            name="morning_end"
                            value={availabilityData.morning_end}
                            onChange={handleAvailabilityChange}
                            className="mt-1 block w-full border border-dark-accent rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent sm:text-sm bg-dark-accent text-white"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="border border-white border-opacity-20 rounded-lg p-4 bg-white bg-opacity-5">
                      <h3 className="text-lg font-medium text-white mb-4">Afternoon Shift</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="afternoon_start" className="block text-sm font-medium text-gray-200">
                            Start Time
                          </label>
                          <input
                            type="time"
                            id="afternoon_start"
                            name="afternoon_start"
                            value={availabilityData.afternoon_start}
                            onChange={handleAvailabilityChange}
                            className="mt-1 block w-full border border-dark-accent rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent sm:text-sm bg-dark-accent text-white"
                          />
                        </div>
                        <div>
                          <label htmlFor="afternoon_end" className="block text-sm font-medium text-gray-200">
                            End Time
                          </label>
                          <input
                            type="time"
                            id="afternoon_end"
                            name="afternoon_end"
                            value={availabilityData.afternoon_end}
                            onChange={handleAvailabilityChange}
                            className="mt-1 block w-full border border-dark-accent rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent sm:text-sm bg-dark-accent text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-teal-700 hover:from-green-700 hover:to-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 btn-3d"
                      disabled={updatingAvailability}
                    >
                      {updatingAvailability ? 'Updating...' : 'Update Availability'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === 'requests' && (
              <motion.div 
                className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white border-opacity-20 relative glass card-3d"
                initial={{ opacity: 0, y: 20, z: -30 }}
                animate={{ opacity: 1, y: 0, z: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -10, z: 20 }}
              >
                {/* Test element to verify styling */}
                <div className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full"></div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Work Requests</h2>
                  <motion.button
                    onClick={async () => {
                      try {
                        setLoading(true);
                        const [assignedResponse, availableResponse] = await Promise.all([
                          getWorkerWorkRequests(worker.login_id),
                          getAvailableWorkRequests(worker.login_id)
                        ]);
                        setWorkRequests(assignedResponse.data);
                        setAvailableRequests(availableResponse.data);
                        setLoading(false);
                      } catch (err) {
                        console.error('Failed to fetch work requests:', err);
                        setError('Failed to fetch work requests: ' + (err.response?.data?.error || err.message));
                        setLoading(false);
                      }
                    }}
                    className="bg-gradient-to-r from-green-600 to-teal-700 hover:from-green-600 hover:to-teal-800 text-white font-bold py-2 px-4 rounded-full shadow-lg btn-3d"
                    whileHover={{ scale: 1.05, boxShadow: "0 15px 25px rgba(0,0,0,0.3)", y: -3, z: 10 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {loading ? 'Refreshing...' : 'Refresh'}
                  </motion.button>
                </div>
                
                {/* Available Requests Section */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-4 text-white">Available Requests (Match Your Skills)</h3>
                  {availableRequests.length === 0 ? (
                    <motion.div 
                      className="text-center py-6 bg-white bg-opacity-5 rounded-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <p className="text-white text-lg">
                        No available requests matching your skills at the moment.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div 
                      className="space-y-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {availableRequests.map((request) => (
                        <motion.div 
                          key={`available-${request.request_id}`} 
                          className="border border-white border-opacity-20 rounded-lg p-4 bg-white bg-opacity-5"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex justify-between">
                            <h3 className="text-lg font-medium text-white">{request.skill_name}</h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500 bg-opacity-20 text-yellow-200">
                              Available
                            </span>
                          </div>
                          <p className="text-white text-opacity-90 mt-2">{request.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                            <div>
                              <p className="text-sm text-white text-opacity-70">
                                <span className="font-medium">User:</span> {request.user_first_name} {request.user_last_name}
                              </p>
                              <p className="text-sm text-white text-opacity-70">
                                <span className="font-medium">Date:</span> {request.request_date}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-white text-opacity-70">
                                <span className="font-medium">Location:</span> {request.area}, {request.city}
                              </p>
                              <p className="text-sm text-white text-opacity-70">
                                <span className="font-medium">Address:</span> {request.door_no}, {request.street_name}
                              </p>
                            </div>
                          </div>
                          <motion.div className="mt-4">
                            <motion.button
                              onClick={() => handleAcceptRequest(request.request_id)}
                              disabled={acceptingRequestId === request.request_id}
                              className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-500 hover:to-teal-700 text-white font-medium py-2 px-4 rounded-lg shadow transition-all duration-300"
                              whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {acceptingRequestId === request.request_id ? 'Accepting...' : 'Accept Request'}
                            </motion.button>
                          </motion.div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </div>
                
                {/* Assigned Requests Section */}
                <div>
                  <h3 className="text-xl font-bold mb-4 text-white">Your Assigned Requests</h3>
                  {workRequests.length === 0 ? (
                    <motion.div 
                      className="text-center py-6 bg-white bg-opacity-5 rounded-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <p className="text-white text-lg">
                        You don't have any work requests assigned yet.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div 
                      className="space-y-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {workRequests.map((request) => (
                        <motion.div 
                          key={`assigned-${request.request_id}`} 
                          className="border border-white border-opacity-20 rounded-lg p-4 bg-white bg-opacity-5"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex justify-between">
                            <h3 className="text-lg font-medium text-white">{request.skill_name}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              request.status === 'Completed' ? 'bg-green-500 bg-opacity-20 text-green-200' :
                              request.status === 'Accepted' ? 'bg-blue-500 bg-opacity-20 text-blue-200' :
                              'bg-yellow-500 bg-opacity-20 text-yellow-200'
                            }`}>
                              {request.status}
                            </span>
                          </div>
                          <p className="text-white text-opacity-90 mt-2">{request.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                            <div>
                              <p className="text-sm text-white text-opacity-70">
                                <span className="font-medium">User:</span> {request.user_first_name} {request.user_last_name}
                              </p>
                              <p className="text-sm text-white text-opacity-70">
                                <span className="font-medium">Date:</span> {request.request_date}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-white text-opacity-70">
                                <span className="font-medium">Location:</span> {request.area}, {request.city}
                              </p>
                              <p className="text-sm text-white text-opacity-70">
                                <span className="font-medium">Address:</span> {request.door_no}, {request.street_name}
                              </p>
                            </div>
                          </div>
                          {request.status === 'Accepted' && (
                            <motion.div className="mt-4 flex space-x-3">
                              <motion.button
                                onClick={() => handleDeclineRequest(request.request_id)}
                                disabled={decliningRequestId === request.request_id}
                                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-2 px-4 rounded-lg shadow transition-all duration-300"
                                whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {decliningRequestId === request.request_id ? 'Declining...' : 'Decline Request'}
                              </motion.button>
                              <motion.button
                                onClick={() => handleCompleteRequest(request.request_id)}
                                disabled={completingRequestId === request.request_id}
                                className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-500 hover:to-teal-700 text-white font-medium py-2 px-4 rounded-lg shadow transition-all duration-300"
                                whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {completingRequestId === request.request_id ? 'Completing...' : 'Mark as Completed'}
                              </motion.button>
                            </motion.div>
                          )}
                          {request.status === 'Completed' && request.amount && (
                            <motion.div 
                              className="mt-3 p-3 bg-green-500 bg-opacity-20 rounded-lg"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                            >
                              <p className="text-white font-medium">Amount: ₹{request.amount}</p>
                              {request.completed_date && (
                                <p className="text-white text-opacity-70 text-sm">Completed on: {request.completed_date}</p>
                              )}
                            </motion.div>
                          )}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div 
                className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white border-opacity-20 relative glass card-3d"
                initial={{ opacity: 0, y: 20, z: -30 }}
                animate={{ opacity: 1, y: 0, z: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -10, z: 20 }}
              >
                {/* Test element to verify styling */}
                <div className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full"></div>
                <h2 className="text-2xl font-bold mb-6 text-white">Notifications</h2>
                {notifications.length === 0 ? (
                  <motion.div 
                    className="text-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <p className="text-white text-lg">
                      You don't have any notifications yet.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {notifications.map((notification) => (
                      <motion.div 
                        key={notification.notification_id} 
                        className="border border-white border-opacity-20 rounded-lg p-4 bg-white bg-opacity-5"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex justify-between">
                          <h3 className="text-lg font-medium text-white">{notification.message}</h3>
                          <span className="text-sm text-white text-opacity-70">
                            {new Date(notification.date).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
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

            {activeTab === 'skills' && (
              <motion.div 
                className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white border-opacity-20 relative glass card-3d"
                initial={{ opacity: 0, y: 20, z: -30 }}
                animate={{ opacity: 1, y: 0, z: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -10, z: 20 }}
              >
                {/* Test element to verify styling */}
                <div className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full"></div>
                <h2 className="text-2xl font-bold mb-6 text-white">My Skills</h2>
                {workerSkills.length === 0 ? (
                  <motion.div 
                    className="text-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <p className="text-white text-lg">
                      You haven't selected any skills yet.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div 
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {workerSkills.map((skill) => (
                      <motion.div 
                        key={skill.skill_type_id} 
                        className="bg-gradient-to-r from-green-500 to-teal-500 bg-opacity-20 rounded-lg p-4 text-center border border-white border-opacity-20"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <h3 className="text-lg font-medium text-white">{skill.skill_name}</h3>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === 'feedback' && (
              <motion.div 
                className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white border-opacity-20 relative glass card-3d"
                initial={{ opacity: 0, y: 20, z: -30 }}
                animate={{ opacity: 1, y: 0, z: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -10, z: 20 }}
              >
                {/* Test element to verify styling */}
                <div className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full"></div>
                <h2 className="text-2xl font-bold mb-6 text-white">User Feedback</h2>
                {feedbacks.length === 0 ? (
                  <motion.div 
                    className="text-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <p className="text-white text-lg">
                      You don't have any feedback yet.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {feedbacks.map((feedback) => (
                      <motion.div 
                        key={feedback.feedback_id} 
                        className="border border-white border-opacity-20 rounded-lg p-4 bg-white bg-opacity-5"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex justify-between">
                          <h3 className="text-lg font-medium text-white">Feedback from {feedback.user_first_name} {feedback.user_last_name}</h3>
                          <span className="text-sm text-white text-opacity-70">
                            {new Date(feedback.feedback_date).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="mt-3">
                          <p className="text-white text-opacity-90">{feedback.feedback_text}</p>
                          <div className="mt-3 flex items-center">
                            <span className="text-white text-opacity-70 mr-2">Rating:</span>
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-5 h-5 ${i < feedback.rating ? 'text-yellow-400' : 'text-gray-400'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
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
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Profile</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <label htmlFor="first_name" className="block text-sm font-medium text-gray-800 mb-2">
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <label htmlFor="door_no" className="block text-sm font-medium text-white mb-2">
                        Door No
                      </label>
                      <input
                        type="text"
                        id="door_no"
                        name="door_no"
                        value={profileData.door_no}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 rounded-lg bg-dark-accent text-white placeholder-light-text border border-dark-accent focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent input-3d"
                        placeholder="Door No"
                      />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <label htmlFor="street_name" className="block text-sm font-medium text-white mb-2">
                        Street Name
                      </label>
                      <input
                        type="text"
                        id="street_name"
                        name="street_name"
                        value={profileData.street_name}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 rounded-lg bg-dark-accent text-white placeholder-light-text border border-dark-accent focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent input-3d"
                        placeholder="Street Name"
                      />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <label htmlFor="area" className="block text-sm font-medium text-white mb-2">
                        Area
                      </label>
                      <input
                        type="text"
                        id="area"
                        name="area"
                        value={profileData.area}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 rounded-lg bg-dark-accent text-white placeholder-light-text border border-dark-accent focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent input-3d"
                        placeholder="Area"
                      />
                    </motion.div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <label htmlFor="city" className="block text-sm font-medium text-white mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={profileData.city}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 rounded-lg bg-dark-accent text-white placeholder-light-text border border-dark-accent focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent input-3d"
                        placeholder="City"
                      />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <label htmlFor="pincode" className="block text-sm font-medium text-white mb-2">
                        Pincode
                      </label>
                      <input
                        type="text"
                        id="pincode"
                        name="pincode"
                        value={profileData.pincode}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 rounded-lg bg-dark-accent text-white placeholder-light-text border border-dark-accent focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent input-3d"
                        placeholder="Pincode"
                      />
                    </motion.div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <label htmlFor="address" className="block text-sm font-medium text-white mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={profileData.address}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 rounded-lg bg-dark-accent text-white placeholder-light-text border border-dark-accent focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent input-3d"
                        placeholder="Address"
                      />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <label htmlFor="experience_years" className="block text-sm font-medium text-white mb-2">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        id="experience_years"
                        name="experience_years"
                        value={profileData.experience_years}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 rounded-lg bg-dark-accent text-white placeholder-light-text border border-dark-accent focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent input-3d"
                        placeholder="Years of Experience"
                      />
                    </motion.div>
                  </div>
                  
                  <motion.div 
                    className="flex justify-end"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-green-600 to-teal-700 hover:from-green-700 hover:to-teal-800 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 btn-3d"
                    >
                      Update Profile
                    </button>
                  </motion.div>
                </form>
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default WorkerDashboard;
