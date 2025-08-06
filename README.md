# WriterPro - English Writing Exercise Application

A comprehensive web application for improving English writing skills through personalized exercises and assessments.

## 🚀 Quick Start

### Option 1: One-Command Startup (Recommended)
```bash
npm run dev
```
This will start both frontend and backend servers automatically with database initialization.

### Option 2: Manual Setup
```bash
# 1. Install dependencies
npm install
cd backend && npm install && cd ..

# 2. Start backend (includes auto-database initialization)
cd backend && npm start

# 3. In a new terminal, start frontend
npm start
```

## 📁 Project Structure

```
writerpro/
├── backend/                 # Node.js/Express API server
│   ├── config/             # Database configuration
│   ├── middleware/         # Authentication & validation
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API endpoints
│   ├── seeders/           # Database seeding scripts
│   ├── scripts/           # Utility scripts
│   └── server.js          # Main server file
├── src/                   # React frontend
│   ├── components/        # Reusable components
│   ├── contexts/          # React contexts
│   ├── pages/            # Page components
│   ├── styles/           # CSS files
│   └── App.js            # Main app component
├── public/               # Static assets
└── package.json          # Frontend dependencies
```

## 🔧 Backend Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)

### Environment Variables
Create a `.env` file in the `backend/` directory:
```env
MONGODB_URI=mongodb://localhost:27017/writerpro
JWT_SECRET=your-secret-key-here
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with auto-restart
- `npm run setup` - Initialize database with required data
- `npm run seed` - Seed assessment data only

## 🎨 Frontend Setup

### Prerequisites
- Node.js (v16 or higher)

### Available Scripts
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run dev` - Start full project (frontend + backend)

## 🗄️ Database

### Automatic Initialization
The backend automatically initializes the database when it starts:
- ✅ Creates assessment questions if none exist
- ✅ Fallback mechanism for missing data
- ✅ No manual setup required

### Manual Initialization
If needed, you can manually initialize the database:
```bash
cd backend
npm run setup
```

## 🔐 Authentication Flow

1. **Registration** → User creates account
2. **Login** → User authenticates
3. **Assessment Check** → System checks if user has completed assessment
4. **Redirect** → User is redirected to appropriate page:
   - Assessment page (if not completed)
   - Exercises page (if completed)

## 📊 Features

### User Management
- User registration and authentication
- JWT-based session management
- User profile management

### Assessment System
- 15-question English proficiency assessment
- Multiple difficulty levels (A1-C2)
- Skills breakdown (grammar, vocabulary, structure, comprehension)
- Automatic level determination

### Exercise System
- Personalized exercises based on assessment results
- Progress tracking
- Skill development focus

## 🛠️ Development

### Starting Development Servers
```bash
# Start both servers with one command
npm run dev

# Or start them separately
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
npm start
```

### Database Management
```bash
# Initialize database
cd backend && npm run setup

# Seed assessment data only
cd backend && npm run seed
```

### API Testing
The backend includes several endpoints for testing:
- `GET /api/health` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/assessment/status` - Check assessment status
- `GET /api/assessment/questions` - Get assessment questions

## 🐛 Troubleshooting

### "No active assessment found" Error
This is automatically resolved by the backend, but if it persists:
```bash
cd backend && npm run seed
```

### Database Connection Issues
1. Ensure MongoDB is running
2. Check `MONGODB_URI` in `.env` file
3. Verify database permissions

### Port Conflicts
- Frontend: Change port in `package.json` or use `PORT=3001 npm start`
- Backend: Set `PORT=5001` in `.env` file

### Proxy Issues
The frontend is configured to proxy API requests to the backend. If you encounter proxy issues:
- Ensure backend is running on port 5000
- Check that both servers are running
- Restart both servers if needed

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Assessment Endpoints
- `GET /api/assessment/status` - Check assessment completion status
- `GET /api/assessment/questions` - Get assessment questions
- `POST /api/assessment/submit` - Submit assessment answers
- `GET /api/assessment/history` - Get user's assessment history

### Health Check
- `GET /api/health` - Check API status

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Run `npm run build` (if applicable)
3. Start with `npm start`

### Frontend Deployment
1. Run `npm run build`
2. Deploy the `build/` folder to your hosting service

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check the backend setup guide in `backend/SETUP.md` 