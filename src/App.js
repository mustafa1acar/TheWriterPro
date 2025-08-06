import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import InitialRoute from './components/InitialRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ExercisePage from './pages/ExercisePage';
import AssessmentPage from './pages/AssessmentPage';
import AnalysisResultsPage from './pages/AnalysisResultsPage';
import AnalysisHistoryPage from './pages/AnalysisHistoryPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import ContactPage from './pages/ContactPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import './styles/App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={
                <InitialRoute>
                  <HomePage />
                </InitialRoute>
              } />
              <Route path="/home" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/assessment" 
                element={
                  <ProtectedRoute>
                    <AssessmentPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/exercises" 
                element={
                  <ProtectedRoute>
                    <ExercisePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/analysis-results" 
                element={
                  <ProtectedRoute>
                    <AnalysisResultsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/analysis-history" 
                element={
                  <ProtectedRoute>
                    <AnalysisHistoryPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/terms" element={<TermsOfServicePage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
