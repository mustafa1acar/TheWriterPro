const mongoose = require('mongoose');
const Assessment = require('../models/Assessment');

const assessmentData = {
  title: 'English Level Assessment',
  description: 'Comprehensive assessment to determine your English proficiency level',
  questions: [
    // A1 Level Questions (3 questions)
    {
      id: 1,
      question: 'Choose the correct form: "I ___ from Spain."',
      type: 'multiple_choice',
      category: 'grammar',
      difficulty: 'A1',
      options: [
        { text: 'am', isCorrect: true },
        { text: 'is', isCorrect: false },
        { text: 'are', isCorrect: false },
        { text: 'be', isCorrect: false }
      ],
      explanation: 'Use "am" with "I" in the present tense of "to be".',
      points: 1
    },
    {
      id: 2,
      question: 'What is the plural of "child"?',
      type: 'multiple_choice',
      category: 'vocabulary',
      difficulty: 'A1',
      options: [
        { text: 'childs', isCorrect: false },
        { text: 'children', isCorrect: true },
        { text: 'childes', isCorrect: false },
        { text: 'child', isCorrect: false }
      ],
      explanation: '"Children" is the irregular plural form of "child".',
      points: 1
    },
    {
      id: 3,
      question: 'Which sentence is correct?',
      type: 'multiple_choice',
      category: 'structure',
      difficulty: 'A1',
      options: [
        { text: 'She have a dog.', isCorrect: false },
        { text: 'She has a dog.', isCorrect: true },
        { text: 'She having a dog.', isCorrect: false },
        { text: 'She had have a dog.', isCorrect: false }
      ],
      explanation: 'Use "has" with third person singular subjects in present tense.',
      points: 1
    },
    
    // A2 Level Questions (3 questions)
    {
      id: 4,
      question: 'Choose the correct past tense: "Yesterday I ___ to the store."',
      type: 'multiple_choice',
      category: 'grammar',
      difficulty: 'A2',
      options: [
        { text: 'go', isCorrect: false },
        { text: 'goes', isCorrect: false },
        { text: 'went', isCorrect: true },
        { text: 'going', isCorrect: false }
      ],
      explanation: '"Went" is the past tense of "go".',
      points: 1
    },
    {
      id: 5,
      question: 'Which word means "very big"?',
      type: 'multiple_choice',
      category: 'vocabulary',
      difficulty: 'A2',
      options: [
        { text: 'tiny', isCorrect: false },
        { text: 'huge', isCorrect: true },
        { text: 'small', isCorrect: false },
        { text: 'narrow', isCorrect: false }
      ],
      explanation: '"Huge" means extremely large or big.',
      points: 1
    },
    {
      id: 6,
      question: 'Choose the correct sentence structure:',
      type: 'multiple_choice',
      category: 'structure',
      difficulty: 'A2',
      options: [
        { text: 'Beautiful the girl is.', isCorrect: false },
        { text: 'The girl beautiful is.', isCorrect: false },
        { text: 'The girl is beautiful.', isCorrect: true },
        { text: 'Is beautiful the girl.', isCorrect: false }
      ],
      explanation: 'English follows Subject + Verb + Object/Complement order.',
      points: 1
    },
    
    // B1 Level Questions (3 questions)
    {
      id: 7,
      question: 'If I ___ rich, I would buy a yacht.',
      type: 'multiple_choice',
      category: 'grammar',
      difficulty: 'B1',
      options: [
        { text: 'am', isCorrect: false },
        { text: 'was', isCorrect: false },
        { text: 'were', isCorrect: true },
        { text: 'will be', isCorrect: false }
      ],
      explanation: 'Use "were" in hypothetical conditional sentences (second conditional).',
      points: 1
    },
    {
      id: 8,
      question: 'Which word is closest in meaning to "persevere"?',
      type: 'multiple_choice',
      category: 'vocabulary',
      difficulty: 'B1',
      options: [
        { text: 'give up', isCorrect: false },
        { text: 'continue trying', isCorrect: true },
        { text: 'start over', isCorrect: false },
        { text: 'avoid', isCorrect: false }
      ],
      explanation: '"Persevere" means to continue despite difficulties.',
      points: 1
    },
    {
      id: 9,
      question: 'Read: "Although it was raining, we decided to go for a walk." The word "although" shows:',
      type: 'multiple_choice',
      category: 'comprehension',
      difficulty: 'B1',
      options: [
        { text: 'cause and effect', isCorrect: false },
        { text: 'contrast', isCorrect: true },
        { text: 'time sequence', isCorrect: false },
        { text: 'comparison', isCorrect: false }
      ],
      explanation: '"Although" introduces a contrasting clause.',
      points: 1
    },
    
    // B2 Level Questions (3 questions)
    {
      id: 10,
      question: 'By the time she arrives, we ___ the project.',
      type: 'multiple_choice',
      category: 'grammar',
      difficulty: 'B2',
      options: [
        { text: 'will finish', isCorrect: false },
        { text: 'will have finished', isCorrect: true },
        { text: 'finish', isCorrect: false },
        { text: 'are finishing', isCorrect: false }
      ],
      explanation: 'Future perfect tense shows an action completed before another future action.',
      points: 1
    },
    {
      id: 11,
      question: 'Which word best fits: "The CEO\'s decision was ___; it affected the entire company."',
      type: 'multiple_choice',
      category: 'vocabulary',
      difficulty: 'B2',
      options: [
        { text: 'insignificant', isCorrect: false },
        { text: 'momentous', isCorrect: true },
        { text: 'trivial', isCorrect: false },
        { text: 'routine', isCorrect: false }
      ],
      explanation: '"Momentous" means having great importance or significance.',
      points: 1
    },
    {
      id: 12,
      question: 'In academic writing, which structure is most appropriate for presenting opposing views?',
      type: 'multiple_choice',
      category: 'structure',
      difficulty: 'B2',
      options: [
        { text: 'I think... but others think...', isCorrect: false },
        { text: 'While some argue..., others contend...', isCorrect: true },
        { text: 'Maybe... or maybe not...', isCorrect: false },
        { text: 'People say... but I say...', isCorrect: false }
      ],
      explanation: 'Academic writing uses formal transitions like "while" and "contend".',
      points: 1
    },
    
    // C1 Level Questions (2 questions)
    {
      id: 13,
      question: 'Choose the most sophisticated way to express: "The situation is getting worse."',
      type: 'multiple_choice',
      category: 'vocabulary',
      difficulty: 'C1',
      options: [
        { text: 'Things are bad and getting badder.', isCorrect: false },
        { text: 'The situation is deteriorating.', isCorrect: true },
        { text: 'Everything is going down.', isCorrect: false },
        { text: 'Stuff is getting real bad.', isCorrect: false }
      ],
      explanation: '"Deteriorating" is a more sophisticated and precise term.',
      points: 1
    },
    {
      id: 14,
      question: 'Identify the grammatical function of "having been warned" in: "Having been warned about the risks, she proceeded with caution."',
      type: 'multiple_choice',
      category: 'grammar',
      difficulty: 'C1',
      options: [
        { text: 'present participle', isCorrect: false },
        { text: 'past participle', isCorrect: false },
        { text: 'perfect participle (passive)', isCorrect: true },
        { text: 'gerund', isCorrect: false }
      ],
      explanation: '"Having been warned" is a perfect participle in passive voice, showing completed action before the main verb.',
      points: 1
    },
    
    // C2 Level Question (1 question)
    {
      id: 15,
      question: 'Which sentence demonstrates the most nuanced understanding of formal register?',
      type: 'multiple_choice',
      category: 'comprehension',
      difficulty: 'C2',
      options: [
        { text: 'We should probably think about maybe changing this policy sometime.', isCorrect: false },
        { text: 'It is imperative that we undertake a comprehensive review of the existing policy framework with a view to implementing substantive reforms.', isCorrect: true },
        { text: 'The policy needs to be changed right now because it\'s not working.', isCorrect: false },
        { text: 'I think we need to fix the policy because there are problems.', isCorrect: false }
      ],
      explanation: 'This sentence uses sophisticated vocabulary and complex sentence structure appropriate for formal academic/professional contexts.',
      points: 1
    }
  ],
  
  scoring: {
    totalPoints: 15,
    levelThresholds: {
      A1: { min: 0, max: 3 },
      A2: { min: 4, max: 6 },
      B1: { min: 7, max: 9 },
      B2: { min: 10, max: 12 },
      C1: { min: 13, max: 14 },
      C2: { min: 15, max: 15 }
    }
  },
  
  isActive: true,
  version: '1.0'
};

const seedAssessment = async () => {
  try {
    // Connect to MongoDB if not connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/writerpro');
    }

    // Clear existing assessments
    await Assessment.deleteMany({});
    
    // Create new assessment
    const assessment = new Assessment(assessmentData);
    await assessment.save();
    
    console.log('Assessment seeded successfully!');
    console.log('Total questions:', assessment.questions.length);
    
    // Show breakdown by category and difficulty
    const breakdown = assessment.questions.reduce((acc, q) => {
      if (!acc[q.difficulty]) acc[q.difficulty] = {};
      if (!acc[q.difficulty][q.category]) acc[q.difficulty][q.category] = 0;
      acc[q.difficulty][q.category]++;
      return acc;
    }, {});
    
    console.log('Question breakdown:', breakdown);
    
    return assessment;
  } catch (error) {
    console.error('Error seeding assessment:', error);
    throw error;
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedAssessment()
    .then(() => {
      console.log('Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedAssessment, assessmentData }; 