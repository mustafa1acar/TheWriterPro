import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Calendar, Trophy, Target, TrendingUp, BookOpen, Star, Award, Eye } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await fetch('https://thewriterpro.com/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('👤 User profile data:', data.user);
        setUserProfile(data.user);
      } else {
        console.error('Failed to fetch user profile');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const fetchAnalysisHistory = useCallback(async () => {
    try {
      const response = await fetch('https://thewriterpro.com/api/analysis/history?limit=50', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Analysis stats:', data.stats);
        setAnalysisHistory(data.analyses);
      } else {
        console.error('Failed to fetch analysis history');
      }
    } catch (error) {
      console.error('Error fetching analysis history:', error);
    }
  }, [token]);

  useEffect(() => {
    fetchUserProfile();
    fetchAnalysisHistory();
  }, [fetchUserProfile, fetchAnalysisHistory]);

  // Refresh data when user returns to the page
  useEffect(() => {
    const handleFocus = () => {
      fetchUserProfile();
      fetchAnalysisHistory();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchUserProfile, fetchAnalysisHistory]);

  const viewAnalysis = (analysis) => {
    navigate('/analysis-results', {
      state: {
        analysisResult: analysis.result,
        originalText: analysis.text,
        question: analysis.question,
        level: analysis.level,
        isFromHistory: true,
        analysisId: analysis._id
      }
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };



  if (isLoading) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  const userData = userProfile || user || {};
  const joinDate = userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently';

  // Check if user has any completed exercises
  const hasCompletedExercises = (userData.exercisesCompleted || 0) > 0;

  // Real progress data from analysis history
  const progressData = analysisHistory
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((analysis, index) => ({
      month: new Date(analysis.createdAt).toLocaleDateString('en-US', { month: 'short' }),
      score: analysis.result.overallScore,
      date: analysis.createdAt
    }));

  // Skills data from user profile
  const skillsData = [
    { skill: 'Grammar', score: hasCompletedExercises ? Math.round(userData.skills?.grammar || 0) : 0, fullMark: 100 },
    { skill: 'Vocabulary', score: hasCompletedExercises ? Math.round(userData.skills?.vocabulary || 0) : 0, fullMark: 100 },
    { skill: 'Coherence', score: hasCompletedExercises ? Math.round(userData.skills?.structure || 0) : 0, fullMark: 100 },
    { skill: 'Task Response', score: hasCompletedExercises ? Math.round(userData.skills?.clarity || 0) : 0, fullMark: 100 },
    { skill: 'Structure', score: hasCompletedExercises ? Math.round(userData.skills?.structure || 0) : 0, fullMark: 100 },
    { skill: 'Clarity', score: hasCompletedExercises ? Math.round(userData.skills?.clarity || 0) : 0, fullMark: 100 }
  ];

  // Use real analysis history data
  const recentExercises = analysisHistory
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by newest first
    .map(analysis => ({
      id: analysis._id,
      name: analysis.question.length > 30 ? analysis.question.substring(0, 30) + '...' : analysis.question,
      score: analysis.result.overallScore,
      date: formatDate(analysis.createdAt),
      level: analysis.level,
      analysis: analysis
    }));

  // Mock achievements data
  const achievements = [
    { title: 'First Essay', description: 'Completed your first essay', icon: <BookOpen />, earned: hasCompletedExercises },
    { title: 'Grammar Master', description: 'Scored 90+ on grammar exercises 5 times', icon: <Award />, earned: false },
    { title: 'Vocabulary Virtuoso', description: 'Learned 100+ new words', icon: <Star />, earned: false },
    { title: 'Consistent Writer', description: 'Maintained a 30-day streak', icon: <Trophy />, earned: false }
  ];

  // Calculate test scores from overall score
  const calculateTestScores = (overallScore) => {
    if (overallScore === 0) {
      return {
        ielts: 0,
        toefl: 0,
        pte: 0
      };
    }
    return {
      ielts: Math.round((overallScore / 100 * 9) * 10) / 10,
      toefl: Math.round(overallScore / 100 * 120),
      pte: Math.round(overallScore / 100 * 90)
    };
  };

  const testScores = calculateTestScores(userData.overallScore || 0);

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-info">
            <div className="profile-avatar">
              {userData.firstName?.charAt(0)}{userData.lastName?.charAt(0)}
            </div>
            <div className="profile-details">
              <h1 className="profile-name">{userData.firstName} {userData.lastName}</h1>
              <p className="profile-level">{userData.level || 'Beginner'} Writer</p>
              <div className="profile-meta">
                <div className="meta-item">
                  <Mail size={16} />
                  <span>{userData.email}</span>
                </div>
                <div className="meta-item">
                  <Calendar size={16} />
                  <span>Joined {joinDate}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-scores">
            <div className="score-circle main-score">
              <span className="score-number">{hasCompletedExercises ? Math.round(userData.overallScore || 0) : 0}</span>
              <span className="score-label">Overall Score</span>
            </div>
            <div className="test-scores">
              <div className="test-score-item">
                <span className="test-score-number">{hasCompletedExercises ? testScores.ielts.toFixed(1) : '0.0'}</span>
                <span className="test-score-label">IELTS</span>
              </div>
              <div className="test-score-item">
                <span className="test-score-number">{hasCompletedExercises ? testScores.toefl : 0}</span>
                <span className="test-score-label">TOEFL</span>
              </div>
              <div className="test-score-item">
                <span className="test-score-number">{hasCompletedExercises ? testScores.pte : 0}</span>
                <span className="test-score-label">PTE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <BookOpen />
            </div>
            <div className="stat-content">
              <span className="stat-number">{userData.exercisesCompleted || 0}</span>
              <span className="stat-label">Exercises Completed</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Target />
            </div>
            <div className="stat-content">
              <span className="stat-number">{userData.streakDays || 0}</span>
              <span className="stat-label">Day Streak</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <TrendingUp />
            </div>
            <div className="stat-content">
              <span className="stat-number">{(userData.totalWords || 0).toLocaleString()}</span>
              <span className="stat-label">Words Written</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          <div className="chart-card">
            <div className="chart-header">
              <h3>Progress Over Time</h3>
              <p>Your writing score improvement</p>
            </div>
            <div className="chart-container">
              {progressData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#6366f1" 
                      strokeWidth={3}
                      dot={{ fill: '#6366f1', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-chart">
                  <TrendingUp size={48} />
                  <p>No progress data yet</p>
                  <p>Complete your first exercise to see your progress here</p>
                </div>
              )}
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3>Skills Breakdown</h3>
              <p>Your performance across different areas</p>
            </div>
            <div className="chart-container">
              {hasCompletedExercises ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={skillsData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="skill" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-chart">
                  <Target size={48} />
                  <p>No skills data yet</p>
                  <p>Complete exercises to see your skills breakdown</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Exercises and Achievements */}
        <div className="bottom-section">
          <div className="recent-exercises">
            <div className="section-header">
              <h3>Recent Exercises</h3>
              <p>Your latest completed activities</p>
            </div>
            <div className="exercises-list">
              {recentExercises.length > 0 ? (
                recentExercises.map((exercise, index) => (
                  <div key={exercise.id} className="exercise-item" onClick={() => viewAnalysis(exercise.analysis)}>
                    <div className="exercise-info">
                      <h4 className="exercise-name">{exercise.name}</h4>
                      <div className="exercise-meta">
                        <span className="exercise-level">{exercise.level}</span>
                        <span className="exercise-date">{exercise.date}</span>
                      </div>
                    </div>
                    <div className="exercise-actions">
                      <div className="exercise-score" style={{ color: getScoreColor(exercise.score) }}>
                        {exercise.score}%
                      </div>
                      <button className="view-btn" onClick={(e) => {
                        e.stopPropagation();
                        viewAnalysis(exercise.analysis);
                      }}>
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-exercises">
                  <BookOpen size={24} />
                  <p>No exercises completed yet</p>
                  <p>Start writing to see your progress here</p>
                </div>
              )}
            </div>
          </div>

          <div className="achievements">
            <div className="section-header">
              <h3>Achievements</h3>
              <p>Milestones you've unlocked</p>
            </div>
            <div className="achievements-grid">
              {achievements.map((achievement, index) => (
                <div key={index} className={`achievement-card ${achievement.earned ? 'earned' : 'locked'}`}>
                  <div className="achievement-icon">
                    {achievement.icon}
                  </div>
                  <div className="achievement-content">
                    <h4 className="achievement-title">{achievement.title}</h4>
                    <p className="achievement-description">{achievement.description}</p>
                  </div>
                  {achievement.earned && <div className="achievement-badge">✓</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 