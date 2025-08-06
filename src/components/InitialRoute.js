import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const InitialRoute = ({ children }) => {
  const navigate = useNavigate();
  const { user, token, loading } = useAuth();
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const checkUserStatus = async () => {
      // Only check if we have a user and token, and we're not loading
      if (!loading && user && token && !isChecking) {
        setIsChecking(true);
        
        try {
          console.log('Checking assessment status for user:', user.email);
          
          // Check if user has completed assessment
          const response = await fetch('https://thewriterpro.com/api/assessment/status', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('Assessment status response:', response.status);

          if (response.ok) {
            const data = await response.json();
            console.log('Assessment status data:', data);
            
            if (!data.hasCompletedAssessment) {
              // User hasn't completed assessment, redirect to assessment
              console.log('User has not completed assessment, redirecting to assessment');
              navigate('/assessment', { replace: true });
              return;
            }
          } else if (response.status === 429) {
            // Rate limited - wait and retry once
            console.log('Rate limited, retrying assessment status check in 3 seconds...');
            setTimeout(() => {
              checkUserStatus();
            }, 3000);
            return;
          } else {
            console.log('Assessment status check failed:', response.status);
          }
          
          // User has completed assessment or there was an error, redirect to exercises
          console.log('User has completed assessment or error occurred, redirecting to exercises');
          navigate('/exercises', { replace: true });
        } catch (error) {
          console.error('Error checking user status:', error);
          // On error, redirect to exercises as fallback
          navigate('/exercises', { replace: true });
        } finally {
          setIsChecking(false);
        }
      }
    };

    checkUserStatus();
  }, [user, token, loading]); // Removed navigate from dependencies to prevent re-runs

  // Show loading while checking user status
  if (loading || isChecking) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your personalized experience...</p>
      </div>
    );
  }

  // If not authenticated, show the children (home page)
  if (!user) {
    return children;
  }

  // If authenticated, show loading while redirecting
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Redirecting to your dashboard...</p>
    </div>
  );
};

export default InitialRoute; 