import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getWorker, updateWorkerAvailability, updateWorkerStatus, getWorkerNotifications, getWorkerSkills, getWorkerWorkRequests, getAvailableWorkRequests, acceptWorkRequest, declineWorkRequest, completeWorkRequest, getWorkerFeedback } from '../services/api';

const WorkerDashboard = ({ worker, onLogout }) => {
  const [workerData, setWorkerData] = useState(null);
  const [workerSkills, setWorkerSkills] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [workRequests, setWorkRequests] = useState([]);
  const [availableRequests, setAvailableRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('availability');
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [workerResponse, notificationsResponse, skillsResponse, feedbackResponse] = await Promise.all([
          getWorker(worker.login_id),
          getWorkerNotifications(worker.login_id),
          getWorkerSkills(worker.login_id),
          getWorkerFeedback(worker.login_id)
        ]);
        
        setWorkerData(workerResponse.data);
        setNotifications(notificationsResponse.data);
        setWorkerSkills(skillsResponse.data);
        setFeedbacks(feedbackResponse.data || []);
        setWorkerStatus(workerResponse.data?.available_status || 'Available');
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to fetch data: ' + (err.response?.data?.error || err.message));
        setLoading(false);
      }
    };

    fetchData();
  }, [worker.login_id]);

  // Fetch available work requests when the requests tab is activated
  useEffect(() => {
    const fetchWorkRequests = async () => {
      if (activeTab === 'requests') {
        try {
          // Fetch both assigned and available work requests
          const [assignedResponse, availableResponse] = await Promise.all([
            getWorkerWorkRequests(worker.login_id),
            getAvailableWorkRequests(worker.login_id)
          ]);
          setWorkRequests(assignedResponse.data);
          setAvailableRequests(availableResponse.data);
        } catch (err) {
          console.error('Failed to fetch work requests:', err);
          setError('Failed to fetch work requests: ' + (err.response?.data?.error || err.message));
        }
      }
    };

    fetchWorkRequests();
  }, [activeTab, worker.login_id]);

  const handleAvailabilityChange = (e) => {
    setAvailabilityData({
      ...availabilityData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitAvailability = async (e) => {
    e.preventDefault();
    try {
      await updateWorkerAvailability(worker.login_id, availabilityData);
      alert('Availability updated successfully!');
    } catch (err) {
      setError('Failed to update availability: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleAcceptRequest = async (requestId) => {
    // Show the time slot modal instead of directly accepting
    setSelectedRequestId(requestId);
    setShowTimeSlotModal(true);
  };

  const handleConfirmAccept = async () => {
    try {
      await acceptWorkRequest(worker.login_id, selectedRequestId, timeSlot);
      // Refresh the available requests and assigned requests
      const [assignedResponse, availableResponse] = await Promise.all([
        getWorkerWorkRequests(worker.login_id),
        getAvailableWorkRequests(worker.login_id)
      ]);
      setWorkRequests(assignedResponse.data);
      setAvailableRequests(availableResponse.data);
      alert('Work request accepted successfully!');
      // Close the modal and reset state
      setShowTimeSlotModal(false);
      setSelectedRequestId(null);
      setTimeSlot('');
    } catch (err) {
      setError('Failed to accept work request: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      await declineWorkRequest(worker.login_id, requestId);
      // Refresh the available requests and assigned requests
      const [assignedResponse, availableResponse] = await Promise.all([
        getWorkerWorkRequests(worker.login_id),
        getAvailableWorkRequests(worker.login_id)
      ]);
      setWorkRequests(assignedResponse.data);
      setAvailableRequests(availableResponse.data);
      alert('Work request declined successfully!');
    } catch (err) {
      setError('Failed to decline work request: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleCompleteRequest = async (requestId) => {
    // Show the completion modal
    setSelectedRequestIdForCompletion(requestId);
    setShowCompleteModal(true);
  };

  const handleConfirmComplete = async () => {
    try {
      await completeWorkRequest(worker.login_id, selectedRequestIdForCompletion, amount);
      // Refresh the available requests and assigned requests
      const [assignedResponse, availableResponse] = await Promise.all([
        getWorkerWorkRequests(worker.login_id),
        getAvailableWorkRequests(worker.login_id)
      ]);
      setWorkRequests(assignedResponse.data);
      setAvailableRequests(availableResponse.data);
      alert('Work request completed successfully!');
      // Close the modal and reset state
      setShowCompleteModal(false);
      setSelectedRequestIdForCompletion(null);
      setAmount('');
    } catch (err) {
      setError('Failed to complete work request: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleStatusChange = async (status) => {
    try {
      await updateWorkerStatus(worker.login_id, status);
      setWorkerStatus(status);
      alert(`Status updated to ${status}`);
    } catch (err) {
      setError('Failed to update status: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 to-teal-900">
        <div className="text-3xl font-bold text-white">
          Loading Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-teal-900">
      {/* Time Slot Modal */}
      {showTimeSlotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white border-opacity-20 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-white">Select Time Slot</h2>
            <p className="text-white mb-4">Please provide a time slot for this work request:</p>
            <input
              type="text"
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              placeholder="e.g., 10:00 AM - 12:00 PM"
              className="w-full px-4 py-2 rounded-lg bg-dark-accent border border-dark-accent text-white placeholder-light-text focus:outline-none focus:ring-2 focus:ring-primary-purple mb-4"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowTimeSlotModal(false);
                  setSelectedRequestId(null);
                  setTimeSlot('');
                }}
                className="px-4 py-2 rounded-lg border border-white border-opacity-20 text-white hover:bg-white hover:bg-opacity-10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAccept}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-teal-700 text-white hover:from-green-700 hover:to-teal-800 transition-colors"
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
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white border-opacity-20 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-white">Complete Work Request</h2>
            <p className="text-white mb-4">Please enter the amount for this work:</p>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount in ₹"
              className="w-full px-4 py-2 rounded-lg bg-dark-accent border border-dark-accent text-white placeholder-light-text focus:outline-none focus:ring-2 focus:ring-primary-purple mb-4"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCompleteModal(false);
                  setSelectedRequestIdForCompletion(null);
                  setAmount('');
                }}
                className="px-4 py-2 rounded-lg border border-white border-opacity-20 text-white hover:bg-white hover:bg-opacity-10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmComplete}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-teal-700 text-white hover:from-green-700 hover:to-teal-800 transition-colors"
              >
                Confirm Completion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <motion.header 
        className="bg-white bg-opacity-10 backdrop-blur-lg shadow-2xl border-b border-white border-opacity-20"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <motion.h1 
            className="text-3xl font-bold text-white"
            initial={{ x: -50 }}
            animate={{ x: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
          >
            SkillHive - Worker Dashboard
          </motion.h1>
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
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-2 px-6 rounded-full shadow-lg"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
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
              { id: 'feedback', label: 'User Feedback' }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-300 bg-white bg-opacity-10 shadow-lg'
                    : 'border-transparent text-white hover:text-green-200 hover:border-white hover:border-opacity-30'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm rounded-t-lg transition-all duration-300`}
                whileHover={{ y: -5, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
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
            <div className="text-sm text-red-200">{error}</div>
            <button 
              onClick={() => setError('')} 
              className="mt-2 text-sm text-red-100 underline"
            >
              Dismiss
            </button>
          </motion.div>
        )}

        {activeTab === 'availability' && (
          <motion.div 
            className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white border-opacity-20 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Test element to verify styling */}
            <div className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full"></div>
            <h2 className="text-2xl font-bold mb-6 text-white">Update Availability</h2>
            
            {/* Worker Status Buttons */}
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4 text-white">Set Your Status</h3>
              <div className="flex flex-wrap gap-4">
                <motion.button
                  onClick={() => handleStatusChange('Available')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                    workerStatus === 'Available'
                      ? 'bg-gradient-to-r from-green-600 to-teal-700 text-white shadow-lg'
                      : 'bg-white bg-opacity-10 text-white border border-white border-opacity-20 hover:bg-opacity-20'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Available
                </motion.button>
                <motion.button
                  onClick={() => handleStatusChange('At Work')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                    workerStatus === 'At Work'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg'
                      : 'bg-white bg-opacity-10 text-white border border-white border-opacity-20 hover:bg-opacity-20'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  At Work
                </motion.button>
                <motion.button
                  onClick={() => handleStatusChange('Leave')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                    workerStatus === 'Leave'
                      ? 'bg-gradient-to-r from-red-600 to-orange-700 text-white shadow-lg'
                      : 'bg-white bg-opacity-10 text-white border border-white border-opacity-20 hover:bg-opacity-20'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Leave
                </motion.button>
              </div>
              <p className="mt-2 text-white text-opacity-70">Current Status: <span className="font-medium">{workerStatus}</span></p>
            </div>
            
            <form onSubmit={handleSubmitAvailability} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="border border-white border-opacity-20 rounded-lg p-4 bg-white bg-opacity-5"
                >
                  <h3 className="text-lg font-medium text-white mb-4">Morning Shift</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="morning_start" className="block text-sm font-medium text-white">
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
                      <label htmlFor="morning_end" className="block text-sm font-medium text-white">
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
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="border border-white border-opacity-20 rounded-lg p-4 bg-white bg-opacity-5"
                >
                  <h3 className="text-lg font-medium text-white mb-4">Afternoon Shift</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="afternoon_start" className="block text-sm font-medium text-white">
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
                      <label htmlFor="afternoon_end" className="block text-sm font-medium text-white">
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
                </motion.div>
              </div>

              <motion.div
                className="flex justify-end"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.button
                  type="submit"
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-teal-700 hover:from-green-700 hover:to-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  Update Availability
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        )}

        {activeTab === 'requests' && (
          <motion.div 
            className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white border-opacity-20 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Test element to verify styling */}
            <div className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full"></div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Work Requests</h2>
              <motion.button
                onClick={async () => {
                  try {
                    const [assignedResponse, availableResponse] = await Promise.all([
                      getWorkerWorkRequests(worker.login_id),
                      getAvailableWorkRequests(worker.login_id)
                    ]);
                    setWorkRequests(assignedResponse.data);
                    setAvailableRequests(availableResponse.data);
                  } catch (err) {
                    console.error('Failed to fetch work requests:', err);
                    setError('Failed to fetch work requests: ' + (err.response?.data?.error || err.message));
                  }
                }}
                className="bg-gradient-to-r from-green-600 to-teal-700 hover:from-green-700 hover:to-teal-800 text-white font-bold py-2 px-4 rounded-full shadow-lg"
                whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
                whileTap={{ scale: 0.95 }}
              >
                Refresh
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
                          className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-medium py-2 px-4 rounded-lg shadow transition-all duration-300"
                          whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Accept Request
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
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-2 px-4 rounded-lg shadow transition-all duration-300"
                            whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Decline Request
                          </motion.button>
                          <motion.button
                            onClick={() => handleCompleteRequest(request.request_id)}
                            className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-medium py-2 px-4 rounded-lg shadow transition-all duration-300"
                            whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Mark as Completed
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
            className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white border-opacity-20 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
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
            className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white border-opacity-20 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
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
            className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white border-opacity-20 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
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
                      <h3 className="text-lg font-medium text-white">Feedback for {feedback.skill_name} Request</h3>
                      <span className="text-sm text-white text-opacity-70">
                        {new Date(feedback.feedback_id ? new Date().toISOString() : feedback.feedback_id).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-white text-opacity-70 mt-1">
                      Request #{feedback.request_id} | User: {feedback.user_first_name} {feedback.user_last_name}
                    </p>
                    <div className="mt-3">
                      <div className="flex items-center mb-2">
                        <span className="text-white font-medium mr-2">Rating:</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span 
                              key={star} 
                              className={`text-xl ${star <= feedback.rating ? 'text-yellow-400' : 'text-gray-400'}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-white ml-2">({feedback.rating}/5)</span>
                      </div>
                      <div className="mt-2">
                        <span className="text-white font-medium">Comments:</span>
                        <p className="text-white text-opacity-90 mt-1">{feedback.comments}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default WorkerDashboard;