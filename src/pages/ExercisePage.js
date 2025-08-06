import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Play, Pause, RotateCcw, AlertCircle, Upload, FileText, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AnalysisLoadingGame from '../components/AnalysisLoadingGame';
import '../styles/ExercisePage.css';

// Modal component - moved outside to prevent re-rendering
const Modal = ({ show, title, message, onConfirm, onCancel }) => {
  if (!show || !title) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <p className="modal-message">{message}</p>
        </div>
        <div className="modal-actions">
          <button 
            className="modal-btn modal-btn-cancel" 
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button 
            className="modal-btn modal-btn-confirm" 
            onClick={onConfirm}
            type="button"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// Custom Dropdown component for questions
const QuestionDropdown = ({ questions, currentIndex, completedQuestions, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);



  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (index) => {
    onSelect(index);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="custom-dropdown" ref={dropdownRef}>
      <button 
        className={`custom-dropdown-button ${completedQuestions.has(currentIndex) ? 'completed' : ''}`}
        onClick={toggleDropdown}
        type="button"
      >
        <span>Question {currentIndex + 1}</span>
        {completedQuestions.has(currentIndex) && (
          <CheckCircle size={16} className="dropdown-checkmark" />
        )}
        <span className="dropdown-arrow">▼</span>
      </button>
      
      {isOpen && (
        <div className="custom-dropdown-menu">
          {questions.map((question, index) => (
            <button
              key={index}
              className={`custom-dropdown-item ${index === currentIndex ? 'active' : ''}`}
              onClick={() => handleSelect(index)}
              type="button"
            >
              <span>Question {index + 1}</span>
              {completedQuestions.has(index) && (
                <CheckCircle size={16} className="dropdown-checkmark" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};



const ExercisePage = () => {
  const navigate = useNavigate();
  const { token, user, refreshUser } = useAuth();
  
  // Assessment status state
  const [assessmentStatus, setAssessmentStatus] = useState(null);
  const [isCheckingAssessment, setIsCheckingAssessment] = useState(true);
  const [isUserDataLoaded, setIsUserDataLoaded] = useState(false);
  const [isAssessmentCheckInProgress, setIsAssessmentCheckInProgress] = useState(false);

  // All original state hooks - moved to top to maintain consistent hook order
  const [selectedLevel, setSelectedLevel] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLimit, setTimeLimit] = useState(25); // Default 25 minutes
  const [timeRemaining, setTimeRemaining] = useState(25 * 60); // In seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [exerciseStarted, setExerciseStarted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {}
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showLoadingGame, setShowLoadingGame] = useState(false);

  // OCR state variables
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [isTesseractProcessing, setIsTesseractProcessing] = useState(false);

  // New state for tracking completed questions
  const [completedQuestions, setCompletedQuestions] = useState(new Set());
  const [questionAnswers, setQuestionAnswers] = useState({});
  const [isLoadingCompletedQuestions, setIsLoadingCompletedQuestions] = useState(false);

  // Function to refresh user data from server - defined early to avoid hoisting issues
  const refreshUserData = useCallback(async () => {
    if (!token) return;
    
    try {
      const refreshedUser = await refreshUser();
      if (refreshedUser) {
        console.log('Refreshed user data:', refreshedUser);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  }, [token, refreshUser]);

  // Questions data structured by levels
  const questionsData = {
    'Beginner (A1-A2)': [
      'Describe your favorite season and explain why you like it.',
      'Write about a memorable day in your life. What happened and how did you feel?',
      'Do you prefer watching movies at home or in the cinema? Give reasons.',
      'Describe your daily routine. What do you do in the morning, afternoon, and evening?'
    ],
    'Intermediate (B1)': [
      'Some people prefer to live in the countryside, while others prefer the city. Which do you prefer and why?',
      'Do you think children should have mobile phones? Give reasons for your opinion.',
      'What are the advantages and disadvantages of online learning?',
      'Describe a problem in your school or community and suggest a solution.'
    ],
    'Upper-Intermediate (B2)': [
      'Do the advantages of studying abroad outweigh the disadvantages?',
      'Some people believe that technology is making people less social. Do you agree or disagree?',
      'What are the causes of traffic congestion in big cities, and how can it be solved?',
      'Should governments spend more money on space exploration or public services?'
    ],
    'Advanced (C1-C2)': [
      'Some argue that climate change cannot be stopped, while others believe action can still be taken. Discuss both views and give your opinion.',
      'In many countries, the gap between rich and poor is increasing. What problems can this cause, and how can they be solved?',
      'Artificial Intelligence is rapidly changing the job market. Do you think this change is positive or negative overall?',
      'To what extent should governments control the content available on the internet?'
    ]
  };

  // State management (moved to top of component)

  // Get current questions based on selected level
  const currentQuestions = selectedLevel ? questionsData[selectedLevel] : [];
  const currentQuestion = currentQuestions[currentQuestionIndex];

  // Map user level to dropdown format
  const getUserLevelDisplayFormat = (userLevel) => {
    const levelMapping = {
      'Beginner': 'Beginner (A1-A2)',
      'Elementary': 'Beginner (A1-A2)', // Fallback to beginner
      'A1': 'Beginner (A1-A2)',
      'A2': 'Beginner (A1-A2)',
      'Intermediate': 'Intermediate (B1)',
      'B1': 'Intermediate (B1)',
      'Upper-Intermediate': 'Upper-Intermediate (B2)',
      'B2': 'Upper-Intermediate (B2)',
      'Advanced': 'Advanced (C1-C2)',
      'Proficient': 'Advanced (C1-C2)', // Fallback to advanced
      'C1': 'Advanced (C1-C2)',
      'C2': 'Advanced (C1-C2)'
    };
    return levelMapping[userLevel] || 'Beginner (A1-A2)';
  };

  const userCurrentLevel = user ? getUserLevelDisplayFormat(user.level) : null;

  // Debug logging
  useEffect(() => {
    console.log('User data:', user);
    console.log('User level:', user?.level);
    console.log('Mapped level:', userCurrentLevel);
    console.log('Selected level:', selectedLevel);
  }, [user, userCurrentLevel, selectedLevel]);

  // Set the user's level as default when component mounts or when user data changes
  useEffect(() => {
    if (userCurrentLevel) {
      setSelectedLevel(userCurrentLevel);
      setIsUserDataLoaded(true);
    }
  }, [userCurrentLevel]);

  // Check if user level is correct, if not refresh data
  useEffect(() => {
    if (user && user.level && userCurrentLevel === 'Beginner (A1-A2)' && user.level !== 'Beginner' && user.level !== 'A1' && user.level !== 'A2') {
      console.log('User level mismatch detected. Expected:', user.level, 'Got:', userCurrentLevel);
      // Refresh user data if there's a mismatch
      refreshUserData();
    }
  }, [user, userCurrentLevel, refreshUserData]);

  // Fallback: if user data takes too long, set a default level after 3 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isUserDataLoaded && user && user.level) {
        const fallbackLevel = getUserLevelDisplayFormat(user.level);
        setSelectedLevel(fallbackLevel);
        setIsUserDataLoaded(true);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [isUserDataLoaded, user]);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => time - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsTimerRunning(false);
      alert('Time is up! Please submit your answer.');
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeRemaining]);

  // Reset timer when time limit changes (but not when just pausing/playing)
  useEffect(() => {
    if (!exerciseStarted) {
      setTimeRemaining(timeLimit * 60);
    }
  }, [timeLimit, exerciseStarted]);



  // Check assessment status and refresh user data on component mount
  useEffect(() => {
    // Only check assessment status once on mount, not on every refreshUserData change
    checkAssessmentStatus();
    refreshUserData();
  }, []); // Empty dependency array to run only once on mount

  // Handle returning from analysis results page
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Save current state before leaving
      if (userAnswer.trim()) {
        setQuestionAnswers(prev => ({
          ...prev,
          [currentQuestionIndex]: userAnswer
        }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [userAnswer, currentQuestionIndex]);

  // Fetch completed questions from database when level changes
  const fetchCompletedQuestions = async (level) => {
    if (!level || !token) return;
    
    setIsLoadingCompletedQuestions(true);
    try {
      const response = await fetch(`/api/completed-questions/${encodeURIComponent(level)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCompletedQuestions(new Set(data.completedQuestions));
      } else {
        console.error('Failed to fetch completed questions');
        setCompletedQuestions(new Set());
      }
    } catch (error) {
      console.error('Error fetching completed questions:', error);
      setCompletedQuestions(new Set());
    } finally {
      setIsLoadingCompletedQuestions(false);
    }
  };

  // Reload completion state when level changes
  useEffect(() => {
    if (selectedLevel) {
      fetchCompletedQuestions(selectedLevel);
    }
  }, [selectedLevel, token]);

  const checkAssessmentStatus = async () => {
    // Prevent multiple simultaneous checks
    if (isAssessmentCheckInProgress) {
      return;
    }
    
    setIsAssessmentCheckInProgress(true);
    
    try {
      const response = await fetch('/api/assessment/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAssessmentStatus(data);
        
        // If user hasn't completed assessment, redirect to assessment page
        if (!data.hasCompletedAssessment) {
          navigate('/assessment', { replace: true });
          return;
        }
      } else if (response.status === 429) {
        // Rate limited - wait a bit and retry once
        console.log('Rate limited, retrying assessment status check in 2 seconds...');
        setTimeout(() => {
          checkAssessmentStatus();
        }, 2000);
        return;
      } else {
        console.error('Failed to check assessment status:', response.status);
      }
    } catch (error) {
      console.error('Error checking assessment status:', error);
    } finally {
      setIsCheckingAssessment(false);
      setIsAssessmentCheckInProgress(false);
    }
  };

  // Format time display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Start exercise
  const startExercise = () => {
    if (selectedLevel) {
      setExerciseStarted(true);
      // Find the first unsolved question
      const firstUnsolvedIndex = currentQuestions.findIndex((_, index) => !completedQuestions.has(index));
      const startIndex = firstUnsolvedIndex !== -1 ? firstUnsolvedIndex : 0;
      setCurrentQuestionIndex(startIndex);
      setUserAnswer('');
      setTimeRemaining(timeLimit * 60);
      // Don't reset completion tracking - keep existing progress
    }
  };

  // Question selection and navigation
  const selectQuestion = (questionIndex) => {
    // Save current answer before switching
    if (userAnswer.trim()) {
      setQuestionAnswers(prev => {
        const newAnswers = {
          ...prev,
          [currentQuestionIndex]: userAnswer
        };
        // Save to localStorage for now
        localStorage.setItem(`questionAnswers_${selectedLevel}`, JSON.stringify(newAnswers));
        return newAnswers;
      });
    }
    
    setCurrentQuestionIndex(questionIndex);
    
    // Load answer for selected question if it exists
    const savedAnswer = questionAnswers[questionIndex] || '';
    setUserAnswer(savedAnswer);
    
    // Reset OCR state when switching questions
    clearOcrData();
    
    // Don't reset timer when navigating between questions
  };

  const markQuestionAsCompleted = async (questionIndex, analysisId) => {
    if (!token || !selectedLevel) return false;
    
    try {
      const response = await fetch(`/api/completed-questions/${encodeURIComponent(selectedLevel)}/${questionIndex}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ analysisId })
      });

      if (response.ok) {
        // Update local state
        setCompletedQuestions(prev => new Set([...prev, questionIndex]));
        return true;
      } else {
        console.error('Failed to mark question as completed');
        return false;
      }
    } catch (error) {
      console.error('Error marking question as completed:', error);
      return false;
    }
  };

  const isQuestionCompleted = (questionIndex) => {
    return completedQuestions.has(questionIndex);
  };

  // Timer controls
  const toggleTimer = () => {
    setIsTimerRunning(prev => !prev);
  };

  const resetTimer = () => {
    // Prevent multiple modal opens
    if (showModal) return;
    
    const handleConfirm = () => {
      setIsTimerRunning(false);
      setTimeRemaining(timeLimit * 60);
      setUserAnswer('');
      setShowModal(false);
    };

    const handleCancel = () => {
      setShowModal(false);
    };

    setModalConfig({
      title: 'Reset Timer',
      message: 'Are you sure you want to reset the timer? This will clear your current answer and restart the timer.',
      onConfirm: handleConfirm,
      onCancel: handleCancel
    });
    
    // Small delay to ensure config is set before showing modal
    setTimeout(() => {
      setShowModal(true);
    }, 10);
  };

  // Reset exercise
  const resetExercise = () => {
    // Prevent multiple modal opens
    if (showModal) return;
    
    const handleConfirm = () => {
      setExerciseStarted(false);
      setCurrentQuestionIndex(0);
      setUserAnswer('');
      setTimeRemaining(timeLimit * 60);
      setIsTimerRunning(false);
      // Reset completion tracking
      setCompletedQuestions(new Set());
      setQuestionAnswers({});
      setShowModal(false);
    };

    const handleCancel = () => {
      setShowModal(false);
    };

    setModalConfig({
      title: 'Back to Setup',
      message: 'Are you sure you want to go back to setup? This will lose your current progress and answers.',
      onConfirm: handleConfirm,
      onCancel: handleCancel
    });
    
    // Small delay to ensure config is set before showing modal
    setTimeout(() => {
      setShowModal(true);
    }, 10);
  };

  // Analyze text function
  const analyzeText = () => {
    // Check if there's text to analyze
    if (!userAnswer.trim()) {
      alert('Please write some text before analyzing.');
      return;
    }

    // Prevent multiple modal opens
    if (showModal) return;
    
    const handleConfirm = async () => {
      setShowModal(false);
      setShowLoadingGame(true);
      
      try {
        const analysisData = {
          text: userAnswer,
          question: currentQuestion,
          level: selectedLevel,
          timeSpent: (timeLimit * 60) - timeRemaining
        };

        const response = await fetch('/api/analysis/analyze', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(analysisData)
        });

        if (response.ok) {
          const result = await response.json();
          
          // Mark current question as completed
          const marked = await markQuestionAsCompleted(currentQuestionIndex, result._id || result.id);
          
          // Find next unsolved question
          const nextUnsolvedIndex = currentQuestions.findIndex((_, index) => 
            index > currentQuestionIndex && !completedQuestions.has(index)
          );
          
          // Navigate to analysis results page with the data
          navigate('/analysis-results', { 
            state: { 
              analysisResult: result,
              originalText: userAnswer,
              question: currentQuestion,
              level: selectedLevel,
              nextQuestionIndex: nextUnsolvedIndex !== -1 ? nextUnsolvedIndex : null
            } 
          });
        } else {
          const errorText = await response.text();
          console.error('Analysis failed:', response.status, errorText);
          
          if (response.status === 404) {
            throw new Error('Backend server is not running. Please start the backend server on port 5000.');
          } else if (response.status === 401) {
            throw new Error('Authentication failed. Please log in again.');
          } else if (response.status === 429) {
            throw new Error('Rate limit exceeded. Please wait a few minutes before trying again.');
          } else {
            throw new Error(`Analysis failed: ${response.status} - ${errorText}`);
          }
        }
      } catch (error) {
        console.error('Analysis error:', error);
        alert('Analysis failed. Please try again.');
        setShowLoadingGame(false);
      }
    };

    const handleCancel = () => {
      setShowModal(false);
    };

    setModalConfig({
      title: 'Analyze Your Writing',
      message: 'This will analyze your writing for grammar, structure, vocabulary, and provide detailed feedback with scoring. Do you want to proceed?',
      onConfirm: handleConfirm,
      onCancel: handleCancel
    });
    
    setShowModal(true);
  };



  // Generate time options (5-60 minutes in 5-minute increments)
  const timeOptions = [];
  for (let i = 5; i <= 60; i += 5) {
    timeOptions.push(i);
  }

  // OCR Functions
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPEG, PNG, etc.)');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const processOCR = async () => {
    if (!selectedFile) {
      alert('Please select an image file first');
      return;
    }

    setIsOcrProcessing(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', selectedFile);

      // Send to backend Gemini OCR endpoint
      const response = await fetch('/api/ocr/extract-text', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data.extractedText) {
        // Put OCR result directly into textarea
        setUserAnswer(result.data.extractedText);
        
        // Start timer automatically when OCR text is added
        if (!isTimerRunning) {
          setIsTimerRunning(true);
        }
        
        // Clear OCR data after putting text in textarea
        setSelectedFile(null);
        setPreviewImage(null);
        // Reset file input
        const fileInput = document.getElementById('ocr-file-input');
        if (fileInput) {
          fileInput.value = '';
        }
      } else {
        throw new Error('No text could be extracted from the image');
      }
    } catch (error) {
      console.error('OCR processing error:', error);
      
      let errorMessage = 'OCR processing failed. Please try again with a clearer image.';
      
      if (error.message.includes('401')) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.message.includes('429')) {
        errorMessage = 'OCR service is temporarily unavailable due to high usage. Please try again later.';
      } else if (error.message.includes('500')) {
        errorMessage = 'OCR service is not properly configured. Please contact support.';
      } else if (error.message.includes('No text could be extracted')) {
        errorMessage = 'No text could be extracted from the image. Please try with a clearer image.';
      }
      
      alert(errorMessage);
    } finally {
      setIsOcrProcessing(false);
    }
  };

  const processTesseract = async () => {
    if (!selectedFile) {
      alert('Please select an image file first');
      return;
    }

    setIsTesseractProcessing(true);

    try {
      // Dynamically import Tesseract to avoid SSR issues
      const Tesseract = await import('tesseract.js');
      
      const result = await Tesseract.recognize(
        selectedFile,
        'eng', // English language
        {
          logger: m => console.log(m) // Optional: for debugging
        }
      );

      // Put OCR result directly into textarea
      setUserAnswer(result.data.text.trim());
      
      // Start timer automatically when OCR text is added
      if (!isTimerRunning) {
        setIsTimerRunning(true);
      }
      
      // Clear OCR data after putting text in textarea
      setSelectedFile(null);
      setPreviewImage(null);
      // Reset file input
      const fileInput = document.getElementById('ocr-file-input');
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      console.error('Tesseract processing error:', error);
      alert('Fast text extraction failed. Please try again with a clearer image.');
    } finally {
      setIsTesseractProcessing(false);
    }
  };



  const clearOcrData = () => {
    setSelectedFile(null);
    setPreviewImage(null);
    // Reset file input to allow re-uploading the same file
    const fileInput = document.getElementById('ocr-file-input');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Show loading while checking assessment status or loading user data
  if (isCheckingAssessment || !isUserDataLoaded) {
    return (
      <div className="exercise-page">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your level information...</p>
          </div>
        </div>
      </div>
    );
  }

  // If assessment not completed, this shouldn't render as user is redirected
  if (assessmentStatus && !assessmentStatus.hasCompletedAssessment) {
    return (
      <div className="exercise-page">
        <div className="container">
          <div className="assessment-required">
            <AlertCircle className="alert-icon" />
            <h2>Assessment Required</h2>
            <p>You need to complete your English level assessment before accessing exercises.</p>
            <button 
              onClick={() => navigate('/assessment')}
              className="assessment-btn"
            >
              Take Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!exerciseStarted) {
    return (
      <div className="exercise-page">
        <div className="container">
          <div className="exercise-setup">
            <div className="setup-header">
              <h1 className="page-title">Writing Exercise</h1>
              <p className="page-description">
                Select your level and time limit to begin your writing practice
              </p>
            </div>

            <div className="setup-form">
              <div className="form-group">
                <label htmlFor="level-select" className="form-label">
                  Select Your Level
                </label>
                <select
                  id="level-select"
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="form-select"
                >
                  <option value="">Choose your level...</option>
                  {Object.keys(questionsData).map(level => (
                    <option key={level} value={level}>
                      {level}{level === userCurrentLevel ? ' (Your Level)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="time-select" className="form-label">
                  Time Limit (minutes)
                </label>
                <select
                  id="time-select"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                  className="form-select"
                >
                  {timeOptions.map(time => (
                    <option key={time} value={time}>{time} minutes</option>
                  ))}
                </select>
              </div>

              {selectedLevel && (
                <div className="level-info">
                  <h3>Level: {selectedLevel}</h3>
                  <p>Questions available: {questionsData[selectedLevel].length}</p>
                  <p>Time per question: {timeLimit} minutes</p>
                </div>
              )}

              <button
                onClick={startExercise}
                disabled={!selectedLevel}
                className="btn-primary btn-start"
              >
                Start Exercise
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="exercise-page">
      <div className="container">
        <div className="exercise-interface">
          {/* Header with question selector and timer */}
          <div className="exercise-header">
            <div className="question-selector-section">
              <h2 className="level-title">{selectedLevel}</h2>
                              <div className="question-dropdown-container">
                  <label className="question-select-label">
                    Select Question:
                  </label>
                  {isLoadingCompletedQuestions ? (
                    <div className="loading-dropdown">
                      <div className="loading-spinner-small"></div>
                      <span>Loading...</span>
                    </div>
                  ) : (
                    <QuestionDropdown
                      questions={currentQuestions}
                      currentIndex={currentQuestionIndex}
                      completedQuestions={completedQuestions}
                      onSelect={selectQuestion}
                    />
                  )}
                  <div className="question-status">
                    {isQuestionCompleted(currentQuestionIndex) && (
                      <div className="completed-indicator">
                        <CheckCircle size={16} />
                        <span>Completed</span>
                      </div>
                    )}
                  </div>
                </div>
            </div>

            <div className="timer-section">
              <div className="timer-display">
                <Clock className="timer-icon" />
                <span className={`timer-text ${timeRemaining < 300 ? 'timer-warning' : ''}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <div className="timer-controls">
                <button 
                  onClick={toggleTimer} 
                  className={`timer-btn ${!isTimerRunning ? 'timer-btn-pulse' : ''}`}
                >
                  {isTimerRunning ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button onClick={resetTimer} className="timer-btn timer-btn-replay">
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Question section */}
          <div className="question-section">
            <div className="question-card">
              <h3 className="question-number">Question {currentQuestionIndex + 1}</h3>
              <p className="question-text">{currentQuestion}</p>
            </div>

            <div className="answer-section">
              {/* OCR Upload Section */}
              <div className="ocr-section">
                <div className="ocr-upload-area">
                  <input
                    type="file"
                    id="ocr-file-input"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="ocr-file-input"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="ocr-file-input" className="ocr-upload-btn">
                    <Upload size={20} />
                    <span>Upload Image for Text Extraction</span>
                  </label>
                  
                  {selectedFile && (
                    <div className="ocr-preview">
                      <div className="ocr-info">
                        <p className="ocr-info-text">
                          <strong>Fast Text Extraction:</strong> Best for printed text, PDFs, and Word documents<br/>
                          <strong>Advanced AI Extract:</strong> Best for handwritten notes and complex layouts
                        </p>
                      </div>
                      <img 
                        src={previewImage} 
                        alt="Preview" 
                        className="ocr-preview-image"
                      />
                      <div className="ocr-preview-actions">
                        <button
                          onClick={processTesseract}
                          disabled={isTesseractProcessing}
                          className="ocr-process-btn ocr-process-btn-fast"
                        >
                          {isTesseractProcessing ? (
                            <>
                              <div className="ocr-spinner"></div>
                              Fast Processing...
                            </>
                          ) : (
                            <>
                              <FileText size={16} />
                              Fast Text Extraction
                            </>
                          )}
                        </button>
                        <button
                          onClick={processOCR}
                          disabled={isOcrProcessing}
                          className="ocr-process-btn ocr-process-btn-ai"
                        >
                          {isOcrProcessing ? (
                            <>
                              <div className="ocr-spinner"></div>
                              AI Processing...
                            </>
                          ) : (
                            <>
                              <FileText size={16} />
                              Advanced AI Extract
                            </>
                          )}
                        </button>
                        <button
                          onClick={clearOcrData}
                          className="ocr-clear-btn"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <label htmlFor="answer" className="answer-label">
                Your Answer
              </label>

              <textarea
                id="answer"
                value={userAnswer}
                onChange={(e) => {
                  const newAnswer = e.target.value;
                  setUserAnswer(newAnswer);
                  // Auto-save answer as user types
                  if (newAnswer.trim()) {
                    setQuestionAnswers(prev => {
                      const newAnswers = {
                        ...prev,
                        [currentQuestionIndex]: newAnswer
                      };
                      // Save to localStorage for now
                      localStorage.setItem(`questionAnswers_${selectedLevel}`, JSON.stringify(newAnswers));
                      return newAnswers;
                    });
                  }
                }}
                placeholder={isTimerRunning ? "Start writing your answer here..." : "Click the play button to start writing..."}
                className="answer-textarea"
                rows="15"
                disabled={!isTimerRunning}
                readOnly={false}
              />
              <div className="word-count">
                Words: {userAnswer.trim() ? userAnswer.trim().split(/\s+/).length : 0}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="exercise-navigation">
            <button
              onClick={resetExercise}
              className="nav-btn nav-btn-reset"
            >
              Back to Setup
            </button>

            <button
              onClick={analyzeText}
              disabled={!userAnswer.trim() || showLoadingGame}
              className="nav-btn nav-btn-analyze"
            >
              {showLoadingGame ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </div>
    
        {/* Modal */}
        <Modal 
          show={showModal}
          title={modalConfig.title}
          message={modalConfig.message}
          onConfirm={modalConfig.onConfirm}
          onCancel={modalConfig.onCancel}
        />

        {/* Loading Game */}
        {showLoadingGame && (
          <AnalysisLoadingGame 
            onComplete={() => setShowLoadingGame(false)}
          />
        )}

      </div>
    </div>
  );
};

export default ExercisePage; 