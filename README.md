# TheWriterPro - English Writing Exercise Application

A comprehensive web application for improving English writing skills through personalized exercises and AI-powered analysis. WriterPro provides adaptive learning experiences based on individual proficiency levels.

## 🎯 Project Description

WriterPro is an intelligent English writing platform that combines assessment technology with personalized exercise generation. Users complete an initial proficiency assessment, after which the system provides tailored writing exercises with detailed feedback on grammar, vocabulary, coherence, and task response.


## 🛠️ Tech Stack

### Frontend
- **React.js** - User interface framework
- **React Router** - Client-side routing
- **CSS3** - Styling and responsive design
- **Lucide React** - Icon library
- **Recharts** - Data visualization

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Google Gemini AI** - Text analysis and feedback
- **Tesseract.js** - OCR for image text extraction

### Development Tools
- **npm** - Package manager
- **CORS** - Cross-origin resource sharing
- **Rate limiting** - API protection

## 📁 Project Structure

```
writerpro/
├── backend/                 # Node.js/Express API server
│   ├── config/             # Database and AI configurations
│   ├── middleware/         # Authentication & validation
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API endpoints
│   ├── seeders/           # Database seeding
│   └── server.js          # Main server file
├── src/                   # React frontend
│   ├── components/        # Reusable UI components
│   ├── contexts/          # React contexts (Auth)
│   ├── pages/            # Page components
│   ├── styles/           # CSS files
│   └── App.js            # Main app component
├── public/               # Static assets
└── package.json          # Frontend dependencies
```

## ✨ Features

### 🔐 User Management
- Secure user registration and authentication
- JWT-based session management
- User profile and progress tracking

### 📝 Assessment System
- 15-question English proficiency assessment
- Multiple difficulty levels (A1-C2 CEFR)
- Skills breakdown analysis
- Automatic level determination

### ✍️ Writing Exercises
- Personalized exercises based on assessment results
- Real-time writing analysis
- AI-powered feedback on:
  - Grammar and accuracy
  - Vocabulary usage
  - Coherence and cohesion
  - Task response

### 📊 Progress Tracking
- Exercise completion tracking
- Performance analytics
- Historical analysis review
- Skill development monitoring

### 🔍 Advanced Features
- OCR text extraction from images
- PDF export of analysis results
- Rate limiting for API protection
- Responsive design for all devices

## 📚 API Documentation

### Authentication
```
POST /api/auth/register    # Register new user
POST /api/auth/login       # User login
GET  /api/auth/me          # Get current user
```

### Assessment
```
GET  /api/assessment/status     # Check completion status
GET  /api/assessment/questions  # Get assessment questions
POST /api/assessment/submit     # Submit assessment answers
```

### Analysis
```
POST /api/analysis/analyze      # Analyze writing text
GET  /api/analysis/history      # Get analysis history
GET  /api/analysis/:id          # Get specific analysis
DELETE /api/analysis/:id        # Delete analysis
```

### Exercises
```
GET  /api/completed-questions/:level           # Get completed questions
POST /api/completed-questions/:level/:index    # Mark question complete
```

### OCR
```
POST /api/ocr/extract-text     # Extract text from image
GET  /api/ocr/health           # OCR service health check
```

### User Management
```
GET  /api/users/profile        # Get user profile
PUT  /api/users/profile        # Update user profile
```

## 🔧 Environment Setup

Create a `.env` file in the `backend/` directory:
```env
MONGODB_URI=mongodb://sample/sample
JWT_SECRET=your-secret-key-here
FRONTEND_URL=https://thewriterpro.com
NODE_ENV=development
GEMINI_API_KEY=your-gemini-api-key
```

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:
- Email: thewriterpro.official@gmail.com 