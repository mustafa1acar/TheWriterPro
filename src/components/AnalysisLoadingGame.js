import React, { useState, useEffect, useRef } from 'react';
import { Brain, BookOpen, Target, Zap } from 'lucide-react';
import './AnalysisLoadingGame.css';

const AnalysisLoadingGame = ({ onComplete }) => {
  const [score, setScore] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [fallingLetters, setFallingLetters] = useState([]);
  const [caughtLetters, setCaughtLetters] = useState([]);
  const [currentWord, setCurrentWord] = useState('');
  const [completedWords, setCompletedWords] = useState([]);
  const [gameActive, setGameActive] = useState(true);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const gameAreaRef = useRef(null);
  const animationRef = useRef(null);

  // English words for the game
  const wordList = [
    'GRAMMAR', 'VOCABULARY', 'WRITING', 'ENGLISH', 'LEARNING', 'STUDY',
    'PRACTICE', 'IMPROVE', 'SKILLS', 'KNOWLEDGE', 'EDUCATION', 'LANGUAGE',
    'SENTENCE', 'PARAGRAPH', 'ESSAY', 'ANALYSIS', 'FEEDBACK', 'SCORE'
  ];

  // Analysis progress messages
  const progressMessages = [
    'Analyzing grammar and structure...',
    'Checking vocabulary usage...',
    'Evaluating coherence and flow...',
    'Assessing task response...',
    'Calculating scores...',
    'Generating feedback...',
    'Almost done...'
  ];

  useEffect(() => {
    if (!gameActive) return;

    // Game timer
    const gameTimer = setInterval(() => {
      setGameTime(prev => prev + 1);
    }, 1000);

    // Analysis progress simulation
    const progressTimer = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + Math.random() * 8;
      });
    }, 2500);

    // Spawn falling letters
    const letterSpawner = setInterval(() => {
      if (fallingLetters.length < 5) {
        const newLetter = {
          id: Date.now() + Math.random(),
          char: String.fromCharCode(65 + Math.floor(Math.random() * 26)), // A-Z
          x: Math.random() * 70 + 15, // 15-85% of width (avoiding edges on mobile)
          speed: 3 + Math.random() * 2 // 3-5 seconds duration
        };
        setFallingLetters(prev => [...prev, newLetter]);
        
        // Remove letter after animation completes
        setTimeout(() => {
          setFallingLetters(prev => prev.filter(l => l.id !== newLetter.id));
        }, newLetter.speed * 1000);
      }
    }, 1500);

    return () => {
      clearInterval(gameTimer);
      clearInterval(progressTimer);
      clearInterval(letterSpawner);
    };
  }, [gameActive, fallingLetters.length]);

  // Handle letter catching
  const handleLetterClick = (letter) => {
    setScore(prev => prev + 10);
    setCaughtLetters(prev => [...prev, letter.char]);
    setFallingLetters(prev => prev.filter(l => l.id !== letter.id));
    
    // Check if we can form a word
    const newCaughtLetters = [...caughtLetters, letter.char];
    checkForWords(newCaughtLetters);
  };

  // Check if caught letters can form any words
  const checkForWords = (letters) => {
    const letterString = letters.join('');
    
    for (const word of wordList) {
      if (canFormWord(letterString, word)) {
        // Word completed!
        setCompletedWords(prev => [...prev, word]);
        setScore(prev => prev + 100);
        setCaughtLetters([]);
        setCurrentWord(word);
        
        // Remove used letters
        const remainingLetters = removeUsedLetters(letters, word);
        setCaughtLetters(remainingLetters);
        break;
      }
    }
  };

  // Check if we can form a word from available letters
  const canFormWord = (available, word) => {
    const availableCount = {};
    const wordCount = {};
    
    for (const char of available) {
      availableCount[char] = (availableCount[char] || 0) + 1;
    }
    
    for (const char of word) {
      wordCount[char] = (wordCount[char] || 0) + 1;
    }
    
    for (const char in wordCount) {
      if (!availableCount[char] || availableCount[char] < wordCount[char]) {
        return false;
      }
    }
    return true;
  };

  // Remove used letters from available letters
  const removeUsedLetters = (available, word) => {
    const availableArray = [...available];
    const wordArray = word.split('');
    
    for (const char of wordArray) {
      const index = availableArray.indexOf(char);
      if (index > -1) {
        availableArray.splice(index, 1);
      }
    }
    
    return availableArray;
  };

  // Handle game completion
  useEffect(() => {
    if (analysisProgress >= 100) {
      setGameActive(false);
      setTimeout(() => {
        onComplete();
      }, 2000);
    }
  }, [analysisProgress, onComplete]);

  const currentProgressMessage = progressMessages[Math.floor((analysisProgress / 100) * progressMessages.length)] || progressMessages[progressMessages.length - 1];

  return (
    <div className="analysis-loading-game">
      <div className="loading-overlay">
        <div className="loading-content">
          {/* Header */}
          <div className="loading-header">
            <div className="ai-processing">
              <Brain className="ai-icon" />
              <h2>AI is analyzing your writing...</h2>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${analysisProgress}%` }}
              ></div>
            </div>
            <p className="progress-message">{currentProgressMessage}</p>
          </div>

          {/* Game Area */}
          <div className="game-container">
            <div className="game-info">
              <div className="score-board">
                <span>Score: {score}</span>
                <span>Time: {gameTime}s</span>
              </div>
              <div className="caught-letters">
                <span>Letters: {caughtLetters.join('')}</span>
              </div>
            </div>

            <div className="game-area" ref={gameAreaRef}>
              {/* Falling Letters */}
              {fallingLetters.map(letter => (
                <div
                  key={letter.id}
                  className="falling-letter"
                  style={{
                    left: `${letter.x}%`,
                    animationDuration: `${letter.speed}s`
                  }}
                  onClick={() => handleLetterClick(letter)}
                >
                  {letter.char}
                </div>
              ))}

              {/* Completed Words */}
              {completedWords.length > 0 && (
                <div className="completed-words">
                  <h3>Words Completed:</h3>
                  <div className="word-list">
                    {completedWords.map((word, index) => (
                      <span key={index} className="completed-word">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Word Highlight */}
              {currentWord && (
                <div className="current-word-highlight">
                  <Target className="target-icon" />
                  <span>Great! You found: {currentWord}</span>
                </div>
              )}
            </div>

            {/* Game Instructions */}
            <div className="game-instructions">
              <h3>How to Play:</h3>
              <ul>
                <li>Click falling letters to catch them</li>
                <li>Form English words to score points</li>
                <li>Longer words = more points!</li>
                <li>Keep playing while AI analyzes your writing</li>
              </ul>
            </div>
          </div>

          {/* Fun Facts */}
          <div className="fun-facts">
            <div className="fact-card">
              <BookOpen className="fact-icon" />
              <p>Did you know? The average person writes about 40,000 words per year!</p>
            </div>
            <div className="fact-card">
              <Zap className="fact-icon" />
              <p>AI can analyze your writing in seconds - faster than a human teacher!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisLoadingGame; 