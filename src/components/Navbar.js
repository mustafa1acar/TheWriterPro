import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, PenTool, User, LogIn, BookOpen, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <PenTool className="nav-logo-icon" />
          <span>WriterPro</span>
        </Link>
        
        <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link 
            to="/home" 
            className={`nav-link ${isActive('/home') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          
          {/* Links only visible to authenticated users */}
          {isAuthenticated && (
            <>
              <Link 
                to="/exercises" 
                className={`nav-link ${isActive('/exercises') ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <BookOpen size={18} />
                Exercises
              </Link>
              <Link 
                to="/profile" 
                className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <User size={18} />
                Profile
              </Link>
            </>
          )}
          
          {/* Authentication links - show login/register for non-authenticated, logout for authenticated */}
          {!isAuthenticated ? (
            <>
              <Link 
                to="/login" 
                className={`nav-link nav-button ${isActive('/login') ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <LogIn size={18} />
                Login
              </Link>
              <Link 
                to="/register" 
                className={`nav-link nav-button-primary ${isActive('/register') ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Get Started
              </Link>
            </>
          ) : (
            <>
              <span className="nav-user-greeting">
                Hello, {user?.firstName || 'User'}
              </span>
              <button 
                onClick={handleLogout}
                className="nav-link nav-button logout-button"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          )}
        </div>

        <div className="nav-toggle" onClick={toggleMenu}>
          {isMenuOpen ? <X /> : <Menu />}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 