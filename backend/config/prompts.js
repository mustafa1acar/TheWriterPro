/**
 * Writing Analysis Prompts for Gemini AI
 * These prompts are designed to work with the AnalysisResultsPage.js structure
 */

const ANALYSIS_PROMPT_TEMPLATE = `
You are an expert English language teacher and IELTS/TOEFL examiner analyzing a student's writing. 

STUDENT INFORMATION:
- Question: "{question}"
- Student Level: {level}
- Time Spent: {timeSpent} minutes
- Word Count: {wordCount} words

TEXT TO ANALYZE:
"{text}"

ANALYSIS REQUIREMENTS:
Please provide a comprehensive analysis in the following EXACT JSON format (no additional text, only valid JSON):

{
  "overallScore": number (0-100),
  "scores": {
    "ielts": number (0-9, with one decimal place),
    "toefl": number (0-120, whole number),
    "pte": number (0-90, whole number),
    "custom": number (0-100, whole number)
  },
  "feedback": {
    "grammar": {
      "score": number (0-100),
      "errors": [
        {
          "type": "string (specific error category)",
          "original": "string (exact text from student's writing)",
          "corrected": "string (corrected version)",
          "explanation": "string (clear explanation of the error)"
        }
      ],
      "strengths": ["string (list of grammar strengths)"]
    },
    "vocabulary": {
      "score": number (0-100),
      "suggestions": [
        {
          "word": "string (word from student's text)",
          "alternatives": ["string (list of better alternatives)"],
          "context": "string (explanation of why to change)"
        }
      ],
      "strengths": ["string (list of vocabulary strengths)"]
    },
    "coherence": {
      "score": number (0-100),
      "feedback": "string (detailed feedback on coherence and cohesion)",
      "strengths": ["string (list of coherence strengths)"],
      "improvements": ["string (list of specific improvements needed)"]
    },
    "taskResponse": {
      "score": number (0-100),
      "feedback": "string (detailed feedback on task achievement)",
      "strengths": ["string (list of task response strengths)"],
      "improvements": ["string (list of specific improvements needed)"]
    }
  },
  "recommendations": ["string (list of 4-5 actionable recommendations)"]
}

SCORING GUIDELINES:
- Grammar (25%): Accuracy, sentence structure, verb tenses, articles, prepositions
- Vocabulary (25%): Range, appropriateness, collocations, academic words
- Coherence (25%): Organization, linking words, paragraph structure, logical flow
- Task Response (25%): Relevance, completeness, argument development, examples

LEVEL-SPECIFIC EXPECTATIONS:
- Beginner (A1-A2): Basic sentences, simple vocabulary, clear meaning
- Intermediate (B1): Some complex sentences, varied vocabulary, good organization
- Upper-Intermediate (B2): Complex sentences, academic vocabulary, strong coherence
- Advanced (C1-C2): Sophisticated language, nuanced expression, excellent organization

IMPORTANT:
1. Be specific and actionable in feedback
2. Provide exact text examples from the student's writing
3. Score realistically based on the student's level
4. Ensure all scores are consistent with each other
5. Return ONLY valid JSON, no additional text or explanations
6. Focus on the specific question asked and how well the student addressed it
7. Consider the time spent and word count in your assessment
`;

/**
 * Generate the analysis prompt with student data
 */
function generateAnalysisPrompt(text, question, level, timeSpent) {
  const wordCount = text.trim().split(/\s+/).length;
  const timeSpentMinutes = Math.round(timeSpent / 60);
  
  return ANALYSIS_PROMPT_TEMPLATE
    .replace('{text}', text)
    .replace('{question}', question)
    .replace('{level}', level)
    .replace('{timeSpent}', timeSpentMinutes)
    .replace('{wordCount}', wordCount);
}

/**
 * Error categories for grammar analysis
 */
const GRAMMAR_ERROR_CATEGORIES = [
  'Subject-Verb Agreement',
  'Verb Tense',
  'Article Usage',
  'Preposition Usage',
  'Word Order',
  'Punctuation',
  'Spelling',
  'Plural/Singular Forms',
  'Modal Verbs',
  'Conditional Sentences',
  'Passive Voice',
  'Gerunds and Infinitives'
];

/**
 * Vocabulary improvement suggestions
 */
const VOCABULARY_IMPROVEMENT_TYPES = [
  'Academic Vocabulary',
  'Collocations',
  'Synonyms',
  'Formal vs Informal',
  'Precise Word Choice',
  'Avoiding Repetition',
  'Phrasal Verbs',
  'Idiomatic Expressions'
];

/**
 * Coherence and cohesion elements
 */
const COHERENCE_ELEMENTS = [
  'Linking Words',
  'Paragraph Structure',
  'Topic Sentences',
  'Supporting Details',
  'Logical Flow',
  'Transitions',
  'Conclusion',
  'Unity and Coherence'
];

/**
 * Task response criteria
 */
const TASK_RESPONSE_CRITERIA = [
  'Question Relevance',
  'Argument Development',
  'Example Usage',
  'Counter-arguments',
  'Conclusion Strength',
  'Word Count Adequacy',
  'Content Completeness',
  'Position Clarity'
];

module.exports = {
  generateAnalysisPrompt,
  GRAMMAR_ERROR_CATEGORIES,
  VOCABULARY_IMPROVEMENT_TYPES,
  COHERENCE_ELEMENTS,
  TASK_RESPONSE_CRITERIA
}; 