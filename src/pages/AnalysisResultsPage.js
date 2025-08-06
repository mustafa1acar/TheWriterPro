import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, BookOpen, FileText, Target, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import '../styles/AnalysisResultsPage.css';

const AnalysisResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get data from navigation state or use sample data for development
  const { analysisResult, originalText, question, level } = location.state || {
    analysisResult: getSampleAnalysisResult(),
    originalText: "Sample text for analysis demonstration purposes.",
    question: "Sample question about your favorite hobby",
    level: "Intermediate (B1)"
  };

  // Sample analysis result for development/testing
  function getSampleAnalysisResult() {
    return {
      overallScore: 75,
      scores: {
        ielts: 6.5,
        toefl: 85,
        pte: 68,
        custom: 75
      },
      feedback: {
        grammar: {
          score: 72,
          errors: [
            {
              type: "Subject-Verb Agreement",
              original: "The students was happy",
              corrected: "The students were happy",
              explanation: "Plural subject 'students' requires plural verb 'were'"
            },
            {
              type: "Article Usage",
              original: "I went to school",
              corrected: "I went to the school",
              explanation: "Specific school reference requires definite article 'the'"
            }
          ],
          strengths: ["Good use of complex sentences", "Varied sentence structure"]
        },
        vocabulary: {
          score: 78,
          suggestions: [
            {
              word: "good",
              alternatives: ["excellent", "outstanding", "remarkable"],
              context: "Consider using more sophisticated vocabulary"
            },
            {
              word: "very",
              alternatives: ["extremely", "exceptionally", "tremendously"],
              context: "Avoid overusing basic intensifiers"
            }
          ],
          strengths: ["Appropriate register", "Good collocations"]
        },
        coherence: {
          score: 80,
          feedback: "Good logical flow and organization. Consider using more linking words.",
          strengths: ["Clear paragraph structure", "Good topic development"],
          improvements: ["Add transitional phrases", "Strengthen conclusion"]
        },
        taskResponse: {
          score: 74,
          feedback: "Addresses the question well but could provide more specific examples.",
          strengths: ["Relevant content", "Clear position"],
          improvements: ["More detailed examples", "Stronger conclusion"]
        }
      },
      recommendations: [
        "Practice subject-verb agreement with plural nouns",
        "Expand vocabulary with academic word lists",
        "Use more varied linking words for better coherence",
        "Include specific examples to support your arguments"
      ]
    };
  }

  const goBack = () => {
    navigate(-1);
  };

  const exportToPDF = async () => {
    try {
      // Show loading state
      const exportBtn = document.querySelector('.export-pdf-btn');
      if (exportBtn) {
        exportBtn.disabled = true;
        exportBtn.innerHTML = '<div class="loading-spinner"></div> Exporting...';
      }

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Helper function to add text with word wrapping
      const addWrappedText = (text, x, y, maxWidth, fontSize = 12) => {
        pdf.setFontSize(fontSize);
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y);
        return lines.length * (fontSize * 0.4); // Return height used
      };

      // Helper function to check if we need a new page
      const checkNewPage = (requiredHeight) => {
        if (yPosition + requiredHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // Helper function to add section header
      const addSectionHeader = (title, fontSize = 16) => {
        checkNewPage(fontSize * 0.6);
        pdf.setFontSize(fontSize);
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(99, 102, 241); // Purple color
        pdf.text(title, margin, yPosition);
        yPosition += fontSize * 0.6;
        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(0, 0, 0);
        return fontSize * 0.6;
      };

      // Helper function to add score card
      const addScoreCard = (title, score, maxScore, level) => {
        const cardHeight = 25;
        checkNewPage(cardHeight + 10);
        
        // Card background
        pdf.setFillColor(248, 250, 252);
        pdf.rect(margin, yPosition, contentWidth, cardHeight, 'F');
        
        // Card border
        pdf.setDrawColor(229, 231, 235);
        pdf.rect(margin, yPosition, contentWidth, cardHeight);
        
        // Title
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'bold');
        pdf.text(title, margin + 5, yPosition + 8);
        
        // Score
        pdf.setFontSize(14);
        pdf.text(`${score}${maxScore !== 100 ? '/' + maxScore : ''}`, margin + 5, yPosition + 18);
        
        // Level
        pdf.setFontSize(8);
        pdf.setTextColor(239, 68, 68); // Red for poor scores
        pdf.text(level, margin + 5, yPosition + 22);
        pdf.setTextColor(0, 0, 0);
        
        yPosition += cardHeight + 5;
        return cardHeight + 5;
      };

      // Page 1: Header and Basic Info
      pdf.setFillColor(99, 102, 241);
      pdf.rect(0, 0, pageWidth, 30, 'F');
      
      pdf.setFontSize(20);
      pdf.setFont(undefined, 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.text('Writing Analysis Results', pageWidth / 2, 20, { align: 'center' });
      
      yPosition = 40;
      pdf.setTextColor(0, 0, 0);

      // Basic info
      addSectionHeader('Analysis Summary');
      pdf.setFontSize(12);
      pdf.text(`Level: ${level}`, margin, yPosition);
      yPosition += 8;
      pdf.text(`Overall Score: ${analysisResult.overallScore}/100`, margin, yPosition);
      yPosition += 15;

      // Question and Answer section
      addSectionHeader('Question & Response');
      
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text('Question:', margin, yPosition);
      yPosition += 8;
      
      pdf.setFont(undefined, 'normal');
      const questionHeight = addWrappedText(question, margin, yPosition, contentWidth);
      yPosition += questionHeight + 10;
      
      pdf.setFont(undefined, 'bold');
      pdf.text('Your Writing:', margin, yPosition);
      yPosition += 8;
      
      pdf.setFont(undefined, 'normal');
      const writingHeight = addWrappedText(originalText, margin, yPosition, contentWidth);
      yPosition += writingHeight + 15;

      // Page 2: Test Scores
      pdf.addPage();
      yPosition = margin;
      
      addSectionHeader('Test Scores');
      
      // Create 2x2 grid for scores
      const cardWidth = (contentWidth - 10) / 2;
      const cardHeight = 25;
      
      // Row 1
      checkNewPage(cardHeight + 10);
      addScoreCard('IELTS Score', analysisResult.scores.ielts, 9, 'POOR');
      addScoreCard('TOEFL Score', analysisResult.scores.toefl, 120, 'POOR');
      
      // Row 2
      checkNewPage(cardHeight + 10);
      addScoreCard('PTE Score', analysisResult.scores.pte, 90, 'POOR');
      addScoreCard('Custom Score', analysisResult.scores.custom, 100, 'POOR');

      // Page 3: Skills Breakdown
      pdf.addPage();
      yPosition = margin;
      
      addSectionHeader('Skills Breakdown');
      
      // Grammar Section
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Grammar & Accuracy', margin, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Score: ${analysisResult.feedback.grammar.score}/100`, margin, yPosition);
      yPosition += 10;
      
      if (analysisResult.feedback.grammar.errors.length > 0) {
        pdf.setFont(undefined, 'bold');
        pdf.text('Errors Found:', margin, yPosition);
        yPosition += 8;
        
        pdf.setFont(undefined, 'normal');
        analysisResult.feedback.grammar.errors.forEach((error, index) => {
          checkNewPage(20);
          pdf.setFontSize(10);
          pdf.setFont(undefined, 'bold');
          pdf.text(`${index + 1}. ${error.type}:`, margin, yPosition);
          yPosition += 6;
          
          pdf.setFont(undefined, 'normal');
          pdf.setTextColor(239, 68, 68); // Red
          pdf.text(`❌ ${error.original}`, margin + 5, yPosition);
          yPosition += 5;
          
          pdf.setTextColor(34, 197, 94); // Green
          pdf.text(`✅ ${error.corrected}`, margin + 5, yPosition);
          yPosition += 5;
          
          pdf.setTextColor(0, 0, 0);
          const explanationHeight = addWrappedText(error.explanation, margin + 5, yPosition, contentWidth - 5, 9);
          yPosition += explanationHeight + 5;
        });
      }
      
      // Strengths
      checkNewPage(15);
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text('Strengths:', margin, yPosition);
      yPosition += 8;
      
      pdf.setFont(undefined, 'normal');
      analysisResult.feedback.grammar.strengths.forEach(strength => {
        checkNewPage(8);
        pdf.text(`• ${strength}`, margin + 5, yPosition);
        yPosition += 6;
      });

      // Page 4: Vocabulary and Recommendations
      pdf.addPage();
      yPosition = margin;
      
      // Vocabulary Section
      addSectionHeader('Vocabulary Analysis');
      
      pdf.setFontSize(12);
      pdf.text(`Score: ${analysisResult.feedback.vocabulary.score}/100`, margin, yPosition);
      yPosition += 10;
      
      if (analysisResult.feedback.vocabulary.suggestions.length > 0) {
        pdf.setFont(undefined, 'bold');
        pdf.text('Vocabulary Suggestions:', margin, yPosition);
        yPosition += 8;
        
        pdf.setFont(undefined, 'normal');
        analysisResult.feedback.vocabulary.suggestions.forEach((suggestion, index) => {
          checkNewPage(25);
          pdf.setFontSize(10);
          pdf.setFont(undefined, 'bold');
          pdf.text(`${index + 1}. "${suggestion.word}":`, margin, yPosition);
          yPosition += 6;
          
          pdf.setFont(undefined, 'normal');
          pdf.text(`Alternatives: ${suggestion.alternatives.join(', ')}`, margin + 5, yPosition);
          yPosition += 5;
          
          const contextHeight = addWrappedText(suggestion.context, margin + 5, yPosition, contentWidth - 5, 9);
          yPosition += contextHeight + 5;
        });
      }
      
      // Strengths
      checkNewPage(15);
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text('Vocabulary Strengths:', margin, yPosition);
      yPosition += 8;
      
      pdf.setFont(undefined, 'normal');
      analysisResult.feedback.vocabulary.strengths.forEach(strength => {
        checkNewPage(8);
        pdf.text(`• ${strength}`, margin + 5, yPosition);
        yPosition += 6;
      });

      // Page 5: Recommendations
      pdf.addPage();
      yPosition = margin;
      
      addSectionHeader('Recommendations for Improvement');
      
      pdf.setFontSize(12);
      analysisResult.recommendations.forEach((recommendation, index) => {
        checkNewPage(15);
        pdf.setFont(undefined, 'bold');
        pdf.text(`${index + 1}.`, margin, yPosition);
        pdf.setFont(undefined, 'normal');
        const recHeight = addWrappedText(recommendation, margin + 15, yPosition, contentWidth - 15);
        yPosition += Math.max(recHeight, 8);
      });

      // Generate filename
      const date = new Date().toISOString().split('T')[0];
      const filename = `writing-analysis-${date}.pdf`;

      // Download PDF
      pdf.save(filename);

      // Reset button
      if (exportBtn) {
        exportBtn.disabled = false;
        exportBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7,10 12,15 17,10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Export PDF';
      }

    } catch (error) {
      console.error('PDF export error:', error);
      alert('Failed to export PDF. Please try again.');
      
      // Reset button on error
      const exportBtn = document.querySelector('.export-pdf-btn');
      if (exportBtn) {
        exportBtn.disabled = false;
        exportBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7,10 12,15 17,10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Export PDF';
      }
    }
  };

  const scoreToLevel = (score) => {
    if (score >= 90) return { label: 'Excellent', color: '#10b981' };
    if (score >= 80) return { label: 'Good', color: '#3b82f6' };
    if (score >= 70) return { label: 'Fair', color: '#f59e0b' };
    if (score >= 60) return { label: 'Needs Improvement', color: '#ef4444' };
    return { label: 'Poor', color: '#dc2626' };
  };

  const ScoreCard = ({ title, score, maxScore = 100, icon: Icon }) => {
    const percentage = (score / maxScore) * 100;
    const level = scoreToLevel(percentage);
    
    return (
      <div className="score-card">
        <div className="score-header">
          <Icon className="score-icon" />
          <h3>{title}</h3>
        </div>
        <div className="score-value">
          <span className="score-number">{score}</span>
          {maxScore !== 100 && <span className="score-max">/{maxScore}</span>}
        </div>
        <div className="score-bar">
          <div 
            className="score-fill" 
            style={{ 
              width: `${percentage}%`, 
              backgroundColor: level.color 
            }}
          ></div>
        </div>
        <span className="score-label" style={{ color: level.color }}>
          {level.label}
        </span>
      </div>
    );
  };

  const ErrorItem = ({ error }) => (
    <div className="error-item">
      <div className="error-header">
        <XCircle className="error-icon" />
        <span className="error-type">{error.type}</span>
      </div>
      <div className="error-content">
        <div className="error-text">
          <span className="error-original">❌ {error.original}</span>
          <span className="error-corrected">✅ {error.corrected}</span>
        </div>
        <p className="error-explanation">{error.explanation}</p>
      </div>
    </div>
  );

  const SuggestionItem = ({ suggestion }) => (
    <div className="suggestion-item">
      <div className="suggestion-header">
        <AlertTriangle className="suggestion-icon" />
        <span className="suggestion-word">"{suggestion.word}"</span>
      </div>
      <div className="suggestion-content">
        <div className="suggestion-alternatives">
          <strong>Alternatives:</strong> {suggestion.alternatives.join(', ')}
        </div>
        <p className="suggestion-context">{suggestion.context}</p>
      </div>
    </div>
  );

  return (
    <div className="analysis-results-page">
      <div className="container">
        <div className="results-header">
          <button onClick={goBack} className="back-btn">
            <ArrowLeft size={20} />
            Back to Exercise
          </button>
          <div className="header-content">
            <h1>Writing Analysis Results</h1>
            <div className="analysis-meta">
              <span className="meta-item">Level: {level}</span>
              <span className="meta-item">Overall Score: {analysisResult.overallScore}/100</span>
            </div>
          </div>
          <button onClick={exportToPDF} className="export-pdf-btn">
            <Download size={16} />
            Export PDF
          </button>
        </div>

        {/* Original Question and Text */}
        <div className="original-content">
          <div className="question-section">
            <h3>Question</h3>
            <p className="question-text">{question}</p>
          </div>
          <div className="text-section">
            <h3>Your Writing</h3>
            <div className="original-text">{originalText}</div>
          </div>
        </div>

        {/* Scoring Section */}
        <div className="scoring-section">
          <h2>Test Scores</h2>
          <div className="scores-grid">
            <ScoreCard 
              title="IELTS Score" 
              score={analysisResult.scores.ielts} 
              maxScore={9} 
              icon={BookOpen}
            />
            <ScoreCard 
              title="TOEFL Score" 
              score={analysisResult.scores.toefl} 
              maxScore={120} 
              icon={FileText}
            />
            <ScoreCard 
              title="PTE Score" 
              score={analysisResult.scores.pte} 
              maxScore={90} 
              icon={Target}
            />
            <ScoreCard 
              title="Custom Score" 
              score={analysisResult.scores.custom} 
              maxScore={100} 
              icon={CheckCircle}
            />
          </div>
        </div>

        {/* Skills Breakdown */}
        <div className="skills-breakdown">
          <h2>Skills Breakdown</h2>
          <div className="skills-grid">
            
            {/* Grammar Section */}
            <div className="skill-section">
              <div className="skill-header">
                <h3>Grammar & Accuracy</h3>
                <span className="skill-score">{analysisResult.feedback.grammar.score}/100</span>
              </div>
              
              {analysisResult.feedback.grammar.errors.length > 0 && (
                <div className="errors-section">
                  <h4>Errors Found</h4>
                  {analysisResult.feedback.grammar.errors.map((error, index) => (
                    <ErrorItem key={index} error={error} />
                  ))}
                </div>
              )}
              
              <div className="strengths-section">
                <h4>Strengths</h4>
                <ul>
                  {analysisResult.feedback.grammar.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Vocabulary Section */}
            <div className="skill-section">
              <div className="skill-header">
                <h3>Vocabulary</h3>
                <span className="skill-score">{analysisResult.feedback.vocabulary.score}/100</span>
              </div>
              
              {analysisResult.feedback.vocabulary.suggestions.length > 0 && (
                <div className="suggestions-section">
                  <h4>Vocabulary Suggestions</h4>
                  {analysisResult.feedback.vocabulary.suggestions.map((suggestion, index) => (
                    <SuggestionItem key={index} suggestion={suggestion} />
                  ))}
                </div>
              )}
              
              <div className="strengths-section">
                <h4>Strengths</h4>
                <ul>
                  {analysisResult.feedback.vocabulary.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Coherence Section */}
            <div className="skill-section">
              <div className="skill-header">
                <h3>Coherence & Cohesion</h3>
                <span className="skill-score">{analysisResult.feedback.coherence.score}/100</span>
              </div>
              
              <div className="feedback-section">
                <p>{analysisResult.feedback.coherence.feedback}</p>
              </div>
              
              <div className="strengths-improvements">
                <div className="strengths-section">
                  <h4>Strengths</h4>
                  <ul>
                    {analysisResult.feedback.coherence.strengths.map((strength, index) => (
                      <li key={index}>{strength}</li>
                    ))}
                  </ul>
                </div>
                <div className="improvements-section">
                  <h4>Areas for Improvement</h4>
                  <ul>
                    {analysisResult.feedback.coherence.improvements.map((improvement, index) => (
                      <li key={index}>{improvement}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Task Response Section */}
            <div className="skill-section">
              <div className="skill-header">
                <h3>Task Response</h3>
                <span className="skill-score">{analysisResult.feedback.taskResponse.score}/100</span>
              </div>
              
              <div className="feedback-section">
                <p>{analysisResult.feedback.taskResponse.feedback}</p>
              </div>
              
              <div className="strengths-improvements">
                <div className="strengths-section">
                  <h4>Strengths</h4>
                  <ul>
                    {analysisResult.feedback.taskResponse.strengths.map((strength, index) => (
                      <li key={index}>{strength}</li>
                    ))}
                  </ul>
                </div>
                <div className="improvements-section">
                  <h4>Areas for Improvement</h4>
                  <ul>
                    {analysisResult.feedback.taskResponse.improvements.map((improvement, index) => (
                      <li key={index}>{improvement}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Recommendations Section */}
        <div className="recommendations-section">
          <h2>Recommendations for Improvement</h2>
          <div className="recommendations-list">
            {analysisResult.recommendations.map((recommendation, index) => (
              <div key={index} className="recommendation-item">
                <CheckCircle className="rec-icon" />
                <span>{recommendation}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button onClick={goBack} className="btn-secondary">
            Continue Writing
          </button>
          <button onClick={() => navigate('/analysis-history')} className="btn-secondary">
            View History
          </button>
          <button onClick={() => navigate('/exercises')} className="btn-primary">
            New Exercise
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResultsPage; 