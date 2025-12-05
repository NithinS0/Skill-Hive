import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { login, registerUser, registerWorker, getSkillTypes } from '../services/api';

const LoginPage = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [role, setRole] = useState('User');
  const [skillTypes, setSkillTypes] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number1: '',
    phone_number2: '',
    address: '',
    city: '',
    pincode: '',
    door_no: '',
    street_name: '',
    area: '',
    experience_years: '',
    // Availability timing fields
    morning_start: '09:30',
    morning_end: '12:00',
    afternoon_start: '13:00',
    afternoon_end: '18:00'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch skill types for worker registration
    if (isRegistering && role === 'Worker') {
      const fetchSkillTypes = async () => {
        try {
          const response = await getSkillTypes();
          setSkillTypes(response.data);
        } catch (err) {
          setError('Failed to fetch skill types');
        }
      };
      fetchSkillTypes();
    }
  }, [isRegistering, role]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSkillToggle = (skillId) => {
    if (selectedSkills.includes(skillId)) {
      setSelectedSkills(selectedSkills.filter(id => id !== skillId));
    } else {
      if (selectedSkills.length < 3) {
        setSelectedSkills([...selectedSkills, skillId]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegistering) {
        if (role === 'User') {
          // Register user
          await registerUser({
            username: formData.username,
            password: formData.password,
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            phone_number1: formData.phone_number1,
            phone_number2: formData.phone_number2
          });
          alert('User registered successfully! Please login.');
          setIsRegistering(false);
        } else if (role === 'Worker') {
          // Register worker
          await registerWorker({
            username: formData.username,
            password: formData.password,
            first_name: formData.first_name,
            last_name: formData.last_name,
            address: formData.address,
            city: formData.city,
            pincode: formData.pincode,
            door_no: formData.door_no,
            street_name: formData.street_name,
            area: formData.area,
            experience_years: parseInt(formData.experience_years) || 0,
            phone_number1: formData.phone_number1,
            phone_number2: formData.phone_number2,
            skill_ids: selectedSkills
          });
          alert('Worker registered successfully! Please login.');
          setIsRegistering(false);
        }
      } else {
        // Login
        const response = await login(formData.username, formData.password, role);
        onLogin(response.data);
      }
    } catch (err) {
      if (role === 'Admin' && formData.username === 'nithin' && formData.password === '123456789') {
        setError('Admin login failed. Please check that the backend server is running.');
      } else {
        setError(err.response?.data?.error || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
  };

  const toggleRole = (selectedRole) => {
    setRole(selectedRole);
    setError('');
    if (selectedRole === 'Worker') {
      setSelectedSkills([]);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-bg via-dark-card to-dark-bg py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-primary rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-secondary rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-gradient-accent rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float animation-delay-4000"></div>
      </motion.div>

      {/* 3D Floating Elements */}
      <motion.div
        className="absolute top-20 left-10 text-5xl opacity-30 text-dark-text"
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 10, 0]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        🔧
      </motion.div>
      
      <motion.div
        className="absolute bottom-20 right-10 text-5xl opacity-30 text-dark-text"
        animate={{ 
          y: [0, 20, 0],
          rotate: [0, -10, 0]
        }}
        transition={{ 
          duration: 5,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        🛠️
      </motion.div>

      <motion.div
        className="max-w-2xl w-full space-y-8 relative z-10"
        initial={{ opacity: 0, y: 20, z: -50 }}
        animate={{ opacity: 1, y: 0, z: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="text-center"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <motion.div
            className="mt-6 flex justify-center"
            animate={{ 
              textShadow: [
                "0 0 10px rgba(139, 92, 246, 0.5)",
                "0 0 20px rgba(139, 92, 246, 0.7)",
                "0 0 30px rgba(139, 92, 246, 0.9)",
                "0 0 20px rgba(139, 92, 246, 0.7)",
                "0 0 5px #c4b5fd"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {/* Keep both Skill and Hive on a single line */}
            <div className="flex items-center justify-center space-x-2">
              <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-purple to-secondary-cyan drop-shadow-[0_0_10px_rgba(139,92,246,0.7)]">
                Skill
              </span>
              <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-secondary-cyan to-accent-cyan drop-shadow-[0_0_10px_rgba(6,182,212,0.7)]">
                Hive
              </span>
            </div>
          </motion.div>
          <motion.p className="mt-4 text-center text-xl font-medium text-dark-text">
            {isRegistering ? 'Create an account' : 'Sign in to your account'}
          </motion.p>
        </motion.div>

        <motion.div
          className="bg-dark-card bg-opacity-70 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-dark-accent border-opacity-50 glass card-3d"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ 
            boxShadow: "0 30px 40px -5px rgba(0, 0, 0, 0.6), 0 15px 20px -5px rgba(0, 0, 0, 0.4)",
            y: -10,
            z: 20
          }}
        >
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <motion.div
                className="rounded-md bg-primary-rose bg-opacity-20 p-4 border border-secondary-rose"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-sm text-dark-text">{error}</div>
              </motion.div>
            )}

            {!isRegistering && (
              <>
                <div className="flex space-x-2">
                  {['User', 'Worker', 'Admin'].map((roleType) => (
                    <motion.button
                      key={roleType}
                      type="button"
                      onClick={() => toggleRole(roleType)}
                      className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                        role === roleType
                          ? 'bg-gradient-to-r from-primary-purple to-secondary-cyan text-white shadow-lg shadow-dark-glow'
                          : 'bg-dark-accent bg-opacity-50 text-dark-text hover:bg-opacity-70'
                      } btn-3d`}
                      whileHover={{ scale: 1.05, y: -3, z: 10 }}
                      whileTap={{ scale: 0.95 }}
                      animate={{
                        boxShadow: role === roleType 
                          ? ["0 0 5px rgba(139, 92, 246, 0.5)", "0 0 15px rgba(139, 92, 246, 0.8)", "0 0 5px rgba(139, 92, 246, 0.5)"]
                          : "none"
                      }}
                      transition={{ duration: 2, repeat: role === roleType ? Infinity : 0 }}
                    >
                      {roleType}
                    </motion.button>
                  ))}
                </div>
              </>
            )}

            <div className="space-y-6">
              {/* Username and Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  className=""
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <label htmlFor="username" className="block text-sm font-medium text-dark-text mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">👤</span>
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      className="appearance-none rounded-xl relative block w-full px-4 py-3 pl-10 border border-dark-accent placeholder-light-text text-white focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent focus:z-10 sm:text-sm bg-dark-accent input-3d"
                      placeholder="Username"
                    />
                  </div>
                </motion.div>
                <motion.div
                  className=""
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <label htmlFor="password" className="block text-sm font-medium text-dark-text mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">🔒</span>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="appearance-none rounded-xl relative block w-full px-4 py-3 pl-10 border border-dark-accent placeholder-light-text text-white focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent focus:z-10 sm:text-sm bg-dark-accent input-3d"
                      placeholder="Password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className="text-light-text hover:text-dark-text transition-colors">
                        {showPassword ? (
                          // Eye with slash icon for hide password
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          // Eye icon for show password
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                          </svg>
                        )}
                      </span>
                    </button>
                  </div>
                </motion.div>
              </div>

              {isRegistering && (
                <>
                  {/* Name Fields */}
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div>
                      <label htmlFor="first_name" className="block text-sm font-medium text-dark-text mb-2">
                        First Name
                      </label>
                      <input
                        id="first_name"
                        name="first_name"
                        type="text"
                        required
                        value={formData.first_name}
                        onChange={handleChange}
                        className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-dark-accent placeholder-light-text text-white focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent focus:z-10 sm:text-sm bg-dark-accent input-3d"
                        placeholder="First Name"
                      />
                    </div>
                    <div>
                      <label htmlFor="last_name" className="block text-sm font-medium text-dark-text mb-2">
                        Last Name
                      </label>
                      <input
                        id="last_name"
                        name="last_name"
                        type="text"
                        required
                        value={formData.last_name}
                        onChange={handleChange}
                        className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-dark-accent placeholder-light-text text-white focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent focus:z-10 sm:text-sm bg-dark-accent input-3d"
                        placeholder="Last Name"
                      />
                    </div>
                  </motion.div>

                  {/* Email Field (for all except Admin) */}
                  {role !== 'Admin' && (
                    <motion.div
                      className=""
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <label htmlFor="email" className="block text-sm font-medium text-dark-text mb-2">
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required={role !== 'Admin'}
                        value={formData.email}
                        onChange={handleChange}
                        className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-dark-accent placeholder-light-text text-white focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent focus:z-10 sm:text-sm bg-dark-accent input-3d"
                        placeholder="Email"
                      />
                    </motion.div>
                  )}

                  {/* Phone Numbers */}
                  {role !== 'Admin' && (
                    <motion.div
                      className="grid grid-cols-1 md:grid-cols-2 gap-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <div>
                        <label htmlFor="phone_number1" className="block text-sm font-medium text-dark-text mb-2">
                          Phone Number 1
                        </label>
                        <input
                          id="phone_number1"
                          name="phone_number1"
                          type="text"
                          required
                          value={formData.phone_number1}
                          onChange={handleChange}
                          className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-dark-accent placeholder-light-text text-white focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent focus:z-10 sm:text-sm bg-dark-accent input-3d"
                          placeholder="Phone Number 1"
                        />
                      </div>
                      <div>
                        <label htmlFor="phone_number2" className="block text-sm font-medium text-dark-text mb-2">
                          Phone Number 2 (Optional)
                        </label>
                        <input
                          id="phone_number2"
                          name="phone_number2"
                          type="text"
                          value={formData.phone_number2}
                          onChange={handleChange}
                          className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-dark-accent placeholder-light-text text-white focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent focus:z-10 sm:text-sm bg-dark-accent input-3d"
                          placeholder="Phone Number 2 (Optional)"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Address Section for Worker */}
                  {role === 'Worker' && (
                    <>
                      <motion.div
                        className=""
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <label htmlFor="address" className="block text-sm font-medium text-dark-text mb-2">
                          Address
                        </label>
                        <input
                          id="address"
                          name="address"
                          type="text"
                          required
                          value={formData.address}
                          onChange={handleChange}
                          className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-dark-accent placeholder-light-text text-white focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent focus:z-10 sm:text-sm bg-dark-accent input-3d"
                          placeholder="Address"
                        />
                      </motion.div>
                      
                      <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.0 }}
                      >
                        <div>
                          <label htmlFor="city" className="block text-sm font-medium text-dark-text mb-2">
                            City
                          </label>
                          <input
                            id="city"
                            name="city"
                            type="text"
                            required
                            value={formData.city}
                            onChange={handleChange}
                            className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-dark-accent placeholder-light-text text-white focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent focus:z-10 sm:text-sm bg-dark-accent input-3d"
                            placeholder="City"
                          />
                        </div>
                        <div>
                          <label htmlFor="pincode" className="block text-sm font-medium text-dark-text mb-2">
                            Pincode
                          </label>
                          <input
                            id="pincode"
                            name="pincode"
                            type="text"
                            required
                            value={formData.pincode}
                            onChange={handleChange}
                            className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-dark-accent placeholder-light-text text-white focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent focus:z-10 sm:text-sm bg-dark-accent input-3d"
                            placeholder="Pincode"
                          />
                        </div>
                      </motion.div>
                      
                      <motion.div
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.1 }}
                      >
                        <div>
                          <label htmlFor="door_no" className="block text-sm font-medium text-dark-text mb-2">
                            Door No
                          </label>
                          <input
                            id="door_no"
                            name="door_no"
                            type="text"
                            required
                            value={formData.door_no}
                            onChange={handleChange}
                            className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-dark-accent placeholder-light-text text-white focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent focus:z-10 sm:text-sm bg-dark-accent input-3d"
                            placeholder="Door No"
                          />
                        </div>
                        <div>
                          <label htmlFor="street_name" className="block text-sm font-medium text-dark-text mb-2">
                            Street Name
                          </label>
                          <input
                            id="street_name"
                            name="street_name"
                            type="text"
                            required
                            value={formData.street_name}
                            onChange={handleChange}
                            className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-dark-accent placeholder-light-text text-white focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent focus:z-10 sm:text-sm bg-dark-accent input-3d"
                            placeholder="Street Name"
                          />
                        </div>
                        <div>
                          <label htmlFor="area" className="block text-sm font-medium text-dark-text mb-2">
                            Area
                          </label>
                          <input
                            id="area"
                            name="area"
                            type="text"
                            required
                            value={formData.area}
                            onChange={handleChange}
                            className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-dark-accent placeholder-light-text text-white focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent focus:z-10 sm:text-sm bg-dark-accent input-3d"
                            placeholder="Area"
                          />
                        </div>
                      </motion.div>
                      
                      <motion.div
                        className=""
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <label htmlFor="experience_years" className="block text-sm font-medium text-dark-text mb-2">
                          Experience (Years)
                        </label>
                        <input
                          id="experience_years"
                          name="experience_years"
                          type="number"
                          required
                          value={formData.experience_years}
                          onChange={handleChange}
                          className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-dark-accent placeholder-light-text text-white focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent focus:z-10 sm:text-sm bg-dark-accent input-3d"
                          placeholder="Experience (Years)"
                        />
                      </motion.div>
                      
                      {/* Skill Selection */}
                      <motion.div
                        className=""
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.3 }}
                      >
                        <label className="block text-sm font-medium text-dark-text mb-2">
                          Select Skills (Choose up to 3)
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {skillTypes.map((skill) => (
                            <motion.div
                              key={skill.skill_type_id}
                              className="flex items-center bg-dark-accent bg-opacity-50 rounded-lg p-3 btn-3d"
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <input
                                id={`skill-${skill.skill_type_id}`}
                                name={`skill-${skill.skill_type_id}`}
                                type="checkbox"
                                checked={selectedSkills.includes(skill.skill_type_id)}
                                onChange={() => handleSkillToggle(skill.skill_type_id)}
                                className="h-4 w-4 text-primary-purple border-dark-accent rounded focus:ring-primary-purple bg-dark-card bg-opacity-90"
                                disabled={!selectedSkills.includes(skill.skill_type_id) && selectedSkills.length >= 3}
                              />
                              <label
                                htmlFor={`skill-${skill.skill_type_id}`}
                                className="ml-2 block text-sm text-dark-text"
                              >
                                {skill.skill_name}
                              </label>
                            </motion.div>
                          ))}
                        </div>
                        {selectedSkills.length >= 3 && (
                          <p className="mt-2 text-sm text-accent-cyan">
                            You have selected the maximum of 3 skills.
                          </p>
                        )}
                      </motion.div>
                    </>
                  )}
                </>
              )}
            </div>

            <motion.div
              className="pt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
            >
              <motion.button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-primary-purple to-secondary-cyan hover:from-purple-700 hover:to-cyan-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-purple shadow-lg shadow-dark-glow transition-all duration-300 btn-3d"
                whileHover={{ scale: 1.03, boxShadow: "0 15px 25px rgba(0,0,0,0.4)", y: -5, z: 15 }}
                whileTap={{ scale: 0.98 }}
                animate={{
                  boxShadow: [
                    "0 0 10px rgba(139, 92, 246, 0.6)",
                    "0 0 20px rgba(139, 92, 246, 0.9)",
                    "0 0 10px rgba(139, 92, 246, 0.6)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {loading ? (
                  <div className="flex items-center">
                    <motion.div 
                      className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    ></motion.div>
                    Processing...
                  </div>
                ) : isRegistering ? (
                  'Register'
                ) : (
                  'Sign in'
                )}
              </motion.button>
            </motion.div>
          </form>

          <motion.div
            className="text-sm text-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            {isRegistering ? (
              <p className="text-dark-text">
                Already have an account?{' '}
                <motion.button
                  onClick={toggleMode}
                  className="font-medium text-secondary-cyan hover:text-accent-cyan transition-colors btn-3d"
                  whileHover={{ scale: 1.05, textShadow: "0 0 8px rgba(139, 92, 246, 0.8)", y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign in
                </motion.button>
              </p>
            ) : (
              role !== 'Admin' && (
                <p className="text-dark-text">
                  Don't have an account?{' '}
                  <motion.button
                    onClick={toggleMode}
                    className="font-medium text-secondary-cyan hover:text-accent-cyan transition-colors btn-3d"
                    whileHover={{ scale: 1.05, textShadow: "0 0 8px rgba(139, 92, 246, 0.8)", y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Register
                  </motion.button>
                </p>
              )
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;