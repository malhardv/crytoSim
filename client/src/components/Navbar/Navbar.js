import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { FaMoon, FaSun, FaHome, FaChartPie, FaTrophy, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage for theme preference
    return localStorage.getItem('theme') === 'dark';
  });

  // Debug log for user state
  useEffect(() => {
    console.log('Navbar user state:', user);
  }, [user]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="logo">
          <img src="/logo.png" alt="CryptoSim Logo" style={{ height: '2.1rem', marginRight: '0.6rem', verticalAlign: 'middle', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }} />
          CryptoSim
        </Link>
      </div>
      <div className="nav-links">
        <Link to="/" className="nav-link"><FaHome style={{ marginRight: 6, verticalAlign: 'middle' }} />Home</Link>
        {user && (
          <Link to="/portfolio" className="nav-link"><FaChartPie style={{ marginRight: 6, verticalAlign: 'middle' }} />Portfolio</Link>
        )}
        <Link to="/leaderboard" className="nav-link"><FaTrophy style={{ marginRight: 6, verticalAlign: 'middle', color: '#ffd700' }} />Leaderboard</Link>
      </div>
      <div className="auth-links">
        {user ? (
          <>
            <div className="user-info">
              <FaUser />
              <span className="username">{user.username}</span>
            </div>
            <button onClick={handleLogout} className="nav-link logout">
              <FaSignOutAlt style={{ marginRight: 6 }} />
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/signup" className="nav-link signup">Sign Up</Link>
          </>
        )}
        <button
          className="darkmode-toggle"
          onClick={() => setDarkMode((prev) => !prev)}
          aria-label="Toggle dark mode"
        >
          <span className="darkmode-icon">
            {darkMode ? <FaSun /> : <FaMoon />}
          </span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar; 