import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import UserDashboard from './pages/UserDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('skillhive_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('skillhive_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('skillhive_user');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-bg to-dark-card">
        <div className="text-2xl font-bold text-dark-text">Loading SkillHive...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  console.log('Current user:', currentUser);

  return currentUser.role === 'User' ? (
    <UserDashboard user={currentUser} onLogout={handleLogout} />
  ) : currentUser.role === 'Worker' ? (
    <WorkerDashboard worker={currentUser} onLogout={handleLogout} />
  ) : currentUser.role === 'Admin' ? (
    <AdminDashboard admin={currentUser} onLogout={handleLogout} />
  ) : (
    <LoginPage onLogin={handleLogin} />
  );
}

export default App;