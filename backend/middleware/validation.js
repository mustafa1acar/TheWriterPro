const { body, param, query, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  
  next();
};

// User validation rules
const validateUserRegistration = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s\-']+$/)
    .withMessage('First name should only contain letters, spaces, hyphens, and apostrophes'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s\-']+$/)
    .withMessage('Last name should only contain letters, spaces, hyphens, and apostrophes'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

const validateUserUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .isAlpha()
    .withMessage('First name should only contain letters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .isAlpha()
    .withMessage('Last name should only contain letters'),
  
  body('level')
    .optional()
    .isIn(['Beginner', 'Elementary', 'Intermediate', 'Upper-Intermediate', 'Advanced', 'Proficient'])
    .withMessage('Invalid level'),
  
  body('preferences.dailyGoal')
    .optional()
    .isInt({ min: 50, max: 5000 })
    .withMessage('Daily goal must be between 50 and 5000 words'),
  
  body('preferences.difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Invalid difficulty preference'),
  
  handleValidationErrors
];

// Exercise validation rules
const validateExerciseCreation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  body('instructions')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Instructions must be between 10 and 2000 characters'),
  
  body('type')
    .isIn(['essay', 'story', 'letter', 'report', 'description', 'dialogue', 'argumentative', 'creative', 'summary', 'grammar', 'vocabulary'])
    .withMessage('Invalid exercise type'),
  
  body('category')
    .isIn(['writing', 'grammar', 'vocabulary', 'comprehension', 'creative', 'business', 'academic'])
    .withMessage('Invalid exercise category'),
  
  body('difficulty')
    .isIn(['beginner', 'elementary', 'intermediate', 'upper-intermediate', 'advanced'])
    .withMessage('Invalid difficulty level'),
  
  body('level')
    .isInt({ min: 1, max: 10 })
    .withMessage('Level must be between 1 and 10'),
  
  body('prompt')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Prompt must be between 10 and 2000 characters'),
  
  body('requirements.minWords')
    .optional()
    .isInt({ min: 10, max: 5000 })
    .withMessage('Minimum words must be between 10 and 5000'),
  
  body('requirements.maxWords')
    .optional()
    .isInt({ min: 50, max: 10000 })
    .withMessage('Maximum words must be between 50 and 10000'),
  
  body('requirements.timeLimit')
    .optional()
    .isInt({ min: 5, max: 300 })
    .withMessage('Time limit must be between 5 and 300 minutes'),
  
  handleValidationErrors
];

// Progress validation rules
const validateProgressSubmission = [
  body('exerciseId')
    .isMongoId()
    .withMessage('Invalid exercise ID'),
  
  body('response.content')
    .trim()
    .isLength({ min: 10, max: 10000 })
    .withMessage('Response must be between 10 and 10000 characters'),
  
  body('response.timeSpent')
    .isInt({ min: 1 })
    .withMessage('Time spent must be at least 1 minute'),
  
  handleValidationErrors
];

const validateProgressGrading = [
  body('scores.grammar.score')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Grammar score must be between 0 and 100'),
  
  body('scores.vocabulary.score')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Vocabulary score must be between 0 and 100'),
  
  body('scores.structure.score')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Structure score must be between 0 and 100'),
  
  body('scores.creativity.score')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Creativity score must be between 0 and 100'),
  
  body('scores.clarity.score')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Clarity score must be between 0 and 100'),
  
  body('feedback.general')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('General feedback cannot exceed 2000 characters'),
  
  handleValidationErrors
];

// Common validation rules
const validateObjectId = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName}`),
  
  handleValidationErrors
];

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sort')
    .optional()
    .isIn(['createdAt', '-createdAt', 'score', '-score', 'title', '-title'])
    .withMessage('Invalid sort parameter'),
  
  handleValidationErrors
];

// Search validation
const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  
  query('type')
    .optional()
    .isIn(['essay', 'story', 'letter', 'report', 'description', 'dialogue', 'argumentative', 'creative', 'summary', 'grammar', 'vocabulary'])
    .withMessage('Invalid exercise type filter'),
  
  query('difficulty')
    .optional()
    .isIn(['beginner', 'elementary', 'intermediate', 'upper-intermediate', 'advanced'])
    .withMessage('Invalid difficulty filter'),
  
  query('category')
    .optional()
    .isIn(['writing', 'grammar', 'vocabulary', 'comprehension', 'creative', 'business', 'academic'])
    .withMessage('Invalid category filter'),
  
  handleValidationErrors
];

// Password validation
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateExerciseCreation,
  validateProgressSubmission,
  validateProgressGrading,
  validateObjectId,
  validatePagination,
  validateSearch,
  validatePasswordChange
}; 