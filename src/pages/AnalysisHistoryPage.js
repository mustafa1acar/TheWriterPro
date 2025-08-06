import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, BookOpen, Target, TrendingUp, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/AnalysisHistoryPage.css';

const AnalysisHistoryPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [analyses, setAnalyses] = useState([]);
  const [stats, setStats] = useState({});
  const [levelStats, setLevelStats] = useState([]);
  const [pagination, setPagination] = useState({});
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState('');

  useEffect(() => {
    fetchAnalysisHistory();
    fetchUserProfile();
  }, [currentPage, selectedLevel]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('👤 User profile in history:', data.user);
        setUserProfile(data.user);
      } else {
        console.error('Failed to fetch user profile');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchAnalysisHistory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10
      });
      
      if (selectedLevel) {
        params.append('level', selectedLevel);
      }

      const response = await fetch(`/api/analysis/history?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Analysis history stats:', data.stats);
        setAnalyses(data.analyses);
        setStats(data.stats);
        setLevelStats(data.levelStats);
        setPagination(data.pagination);
      } else {
        console.error('Failed to fetch analysis history');
      }
    } catch (error) {
      console.error('Error fetching analysis history:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAnalysis = async (analysisId) => {
    if (!window.confirm('Are you sure you want to delete this analysis?')) {
      return;
    }

    try {
      const response = await fetch(`/api/analysis/${analysisId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Refresh the list
        fetchAnalysisHistory();
      } else {
        alert('Failed to delete analysis');
      }
    } catch (error) {
      console.error('Error deleting analysis:', error);
      alert('Error deleting analysis');
    }
  };

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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 70) return '#3b82f6';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const StatCard = ({ title, value, icon: Icon, color = '#6366f1' }) => (
    <div className="stat-card">
      <div className="stat-icon" style={{ backgroundColor: color }}>
        <Icon size={20} />
      </div>
      <div className="stat-content">
        <h3 className="stat-title">{title}</h3>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="analysis-history-page">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading analysis history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="analysis-history-page">
      <div className="container">
        <div className="history-header">
          <button onClick={() => navigate(-1)} className="back-btn">
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="header-content">
            <h1>Analysis History</h1>
            <p>Track your writing progress and improvement over time</p>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="stats-section">
          <h2>Your Writing Statistics</h2>
          <div className="stats-grid">
            <StatCard
              title="Total Analyses"
              value={stats.totalAnalyses || 0}
              icon={BookOpen}
              color="#6366f1"
            />
            <StatCard
              title="Average Score"
              value={`${Math.round(stats.averageScore || 0)}%`}
              icon={TrendingUp}
              color="#10b981"
            />
            <StatCard
              title="Best Score"
              value={`${Math.round(stats.bestScore || 0)}%`}
              icon={Target}
              color="#f59e0b"
            />
            <StatCard
              title="Total Words"
              value={(stats.totalWords || 0).toLocaleString()}
              icon={Clock}
              color="#8b5cf6"
            />
          </div>
        </div>

        {/* Level Distribution */}
        {levelStats.length > 0 && (
          <div className="level-stats-section">
            <h2>Performance by Level</h2>
            <div className="level-stats-grid">
              {levelStats.map((levelStat) => (
                <div key={levelStat._id} className="level-stat-card">
                  <h3>{levelStat._id}</h3>
                  <div className="level-stat-details">
                    <span className="level-count">{levelStat.count} analyses</span>
                    <span 
                      className="level-average"
                      style={{ color: getScoreColor(levelStat.averageScore) }}
                    >
                      {Math.round(levelStat.averageScore)}% avg
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter Section */}
        <div className="filter-section">
          <div className="filter-controls">
            <select
              value={selectedLevel}
              onChange={(e) => {
                setSelectedLevel(e.target.value);
                setCurrentPage(1);
              }}
              className="level-filter"
            >
              <option value="">All Levels</option>
              <option value="Beginner (A1-A2)">Beginner (A1-A2)</option>
              <option value="Intermediate (B1)">Intermediate (B1)</option>
              <option value="Upper-Intermediate (B2)">Upper-Intermediate (B2)</option>
              <option value="Advanced (C1-C2)">Advanced (C1-C2)</option>
            </select>
          </div>
        </div>

        {/* Analyses List */}
        <div className="analyses-section">
          <h2>Recent Analyses</h2>
          
          {analyses.length === 0 ? (
            <div className="empty-state">
              <BookOpen size={48} />
              <h3>No analyses yet</h3>
              <p>Start writing exercises to see your analysis history here.</p>
              <button 
                onClick={() => navigate('/exercises')}
                className="btn-primary"
              >
                Start Writing
              </button>
            </div>
          ) : (
            <div className="analyses-list">
              {analyses.map((analysis) => (
                <div key={analysis._id} className="analysis-card">
                  <div className="analysis-header">
                    <div className="analysis-meta">
                      <h3 className="analysis-question">{analysis.question}</h3>
                      <div className="analysis-details">
                        <span className="analysis-level">{analysis.level}</span>
                        <span className="analysis-date">
                          <Calendar size={14} />
                          {formatDate(analysis.createdAt)}
                        </span>
                        <span className="analysis-time">
                          <Clock size={14} />
                          {formatTime(analysis.timeSpent)}
                        </span>
                        <span className="analysis-words">{analysis.wordCount} words</span>
                      </div>
                    </div>
                    <div className="analysis-score">
                      <span 
                        className="score-value"
                        style={{ color: getScoreColor(analysis.result.overallScore) }}
                      >
                        {analysis.result.overallScore}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="analysis-scores">
                    <div className="score-item">
                      <span className="score-label">IELTS</span>
                      <span className="score-value">{analysis.result.scores.ielts}</span>
                    </div>
                    <div className="score-item">
                      <span className="score-label">TOEFL</span>
                      <span className="score-value">{analysis.result.scores.toefl}</span>
                    </div>
                    <div className="score-item">
                      <span className="score-label">PTE</span>
                      <span className="score-value">{analysis.result.scores.pte}</span>
                    </div>
                  </div>

                  <div className="analysis-actions">
                    <button
                      onClick={() => viewAnalysis(analysis)}
                      className="btn-secondary btn-view"
                    >
                      <Eye size={16} />
                      View Details
                    </button>
                    <button
                      onClick={() => deleteAnalysis(analysis._id)}
                      className="btn-danger btn-delete"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="pagination-btn"
              >
                Previous
              </button>
              
              <span className="pagination-info">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisHistoryPage; 