import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronRight, ChevronLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/AssessmentPage.css';

const AssessmentPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  // State management
  const [assessment, setAssessment] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [timeSpent, setTimeSpent] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  // Check if user has already completed assessment
  useEffect(() => {
    const checkAssessmentStatus = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/assessment/status', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.hasCompletedAssessment) {
            // User has already completed assessment, show warning and redirect
            setError('You have already completed the English level assessment. Redirecting to exercises...');
            setTimeout(() => {
              navigate('/exercises', { replace: true });
            }, 3000);
            return;
          }
        }
        
        // User hasn't completed assessment, fetch questions
        fetchAssessmentQuestions();
      } catch (error) {
        console.error('Error checking assessment status:', error);
        // On error, try to fetch questions anyway
        fetchAssessmentQuestions();
      }
    };

    checkAssessmentStatus();
  }, [token, navigate]);

  // Set start time when assessment loads
  useEffect(() => {
    if (assessment && !startTime) {
      setStartTime(new Date());
      setQuestionStartTime(new Date());
    }
  }, [assessment, startTime]);

  // Track time spent on each question
  useEffect(() => {
    setQuestionStartTime(new Date());
  }, [currentQuestionIndex]);

  const fetchAssessmentQuestions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/assessment/questions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAssessment(data.assessment);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load assessment');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error fetching assessment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, selectedAnswer) => {
    // Record time spent on this question
    if (questionStartTime) {
      const timeSpentOnQuestion = Math.floor((new Date() - questionStartTime) / 1000);
      setTimeSpent(prev => ({
        ...prev,
        [questionId]: timeSpentOnQuestion
      }));
    }

    setResponses(prev => ({
      ...prev,
      [questionId]: selectedAnswer
    }));
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < assessment.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const submitAssessment = async () => {
    setIsSubmitting(true);
    
    try {
      // Calculate total time spent
      const endTime = new Date();
      const totalTimeSpent = Math.floor((endTime - startTime) / 1000);

      // Prepare responses data
      const formattedResponses = Object.entries(responses).map(([questionId, selectedAnswer]) => ({
        questionId: parseInt(questionId),
        selectedAnswer,
        timeSpent: timeSpent[questionId] || 0
      }));

      const submissionData = {
        assessmentId: assessment._id,
        responses: formattedResponses,
        timeData: {
          startedAt: startTime.toISOString(),
          completedAt: endTime.toISOString(),
          totalTimeSpent
        }
      };

      const response = await fetch('http://localhost:5000/api/assessment/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submissionData)
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.results);
        setShowResults(true);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to submit assessment');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error submitting assessment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteAssessment = () => {
    // Navigate to exercises page after completing assessment
    navigate('/exercises', { replace: true });
  };

  if (isLoading) {
    return (
      <div className="assessment-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your English level assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="assessment-page">
        <div className="error-container">
          <AlertCircle className="error-icon" />
          <h2>Unable to Load Assessment</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (showResults && results) {
    return (
      <div className="assessment-page">
        <div className="results-container">
          <div className="results-header">
            <CheckCircle className="success-icon" />
            <h1>Assessment Complete!</h1>
            <p>Congratulations! You've completed your English level assessment.</p>
          </div>

          <div className="results-summary">
            <div className="level-result">
              <h2>Your English Level</h2>
              <div className="level-badge">
                {results.userFriendlyLevel}
              </div>
              <p>Level: {results.level} • Score: {results.correctAnswers}/{results.totalQuestions} ({results.percentage}%)</p>
            </div>

            <div className="skills-breakdown">
              <h3>Skills Breakdown</h3>
              <div className="skills-grid">
                {Object.entries(results.skillsBreakdown).map(([skill, data]) => (
                  <div key={skill} className="skill-item">
                    <span className="skill-name">{skill.charAt(0).toUpperCase() + skill.slice(1)}</span>
                    <div className="skill-bar">
                      <div 
                        className="skill-fill" 
                        style={{ width: `${data.percentage}%` }}
                      ></div>
                    </div>
                    <span className="skill-percentage">{data.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="results-actions">
            <button onClick={handleCompleteAssessment} className="continue-btn">
              Continue to Exercises
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return null;
  }

  const currentQuestion = assessment.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / assessment.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === assessment.questions.length - 1;
  const hasAnswer = responses[currentQuestion.id];
  const allQuestionsAnswered = assessment.questions.every(q => responses[q.id]);

  return (
    <div className="assessment-page">
      <div className="assessment-container">
        {/* Header */}
        <div className="assessment-header">
          <div className="assessment-title">
            <h1>English Level Assessment</h1>
            <p>Complete this 15-question assessment to determine your English proficiency level</p>
          </div>
          
          <div className="assessment-progress">
            <div className="progress-info">
              <span>Question {currentQuestionIndex + 1} of {assessment.questions.length}</span>
              <Clock className="clock-icon" />
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="question-container">
          <div className="question-header">
            <span className="question-category">{currentQuestion.category}</span>
            <span className="question-difficulty">{currentQuestion.difficulty} Level</span>
          </div>
          
          <h2 className="question-text">{currentQuestion.question}</h2>
          
          <div className="options-container">
            {currentQuestion.options.map((option, index) => (
              <div 
                key={index}
                className={`option ${responses[currentQuestion.id] === option.text ? 'selected' : ''}`}
                onClick={() => handleAnswerSelect(currentQuestion.id, option.text)}
              >
                <div className="option-indicator">
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="option-text">{option.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="assessment-navigation">
          <button 
            onClick={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="nav-btn prev-btn"
          >
            <ChevronLeft />
            Previous
          </button>

          <div className="question-indicators">
            {assessment.questions.map((_, index) => (
              <div 
                key={index}
                className={`indicator ${index === currentQuestionIndex ? 'current' : ''} ${responses[assessment.questions[index].id] ? 'answered' : ''}`}
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {index + 1}
              </div>
            ))}
          </div>

          {isLastQuestion ? (
            <button 
              onClick={submitAssessment}
              disabled={!allQuestionsAnswered || isSubmitting}
              className="nav-btn submit-btn"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
            </button>
          ) : (
            <button 
              onClick={goToNextQuestion}
              disabled={!hasAnswer}
              className="nav-btn next-btn"
            >
              Next
              <ChevronRight />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentPage; 