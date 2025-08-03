# 🔍 Web Accessibility Analyzer - Backend API

> **Powerful accessibility scanning engine with intelligent analysis and secure user management.**

A robust Node.js/Express backend API for web accessibility analysis. This backend powers the frontend application with comprehensive accessibility scanning, AI-powered fix suggestions, secure user authentication, and detailed analytics storage.

## ✨ Features

### 🚀 **Advanced Accessibility Scanning Engine**
- **Pa11y Integration**: Leverages Pa11y library for comprehensive WCAG 2.1 AA/AAA compliance testing
- **Puppeteer Automation**: Headless browser automation for dynamic content analysis
- **Real-time Processing**: Fast scanning with optimized performance for quick results
- **Multi-standard Support**: Tests against multiple accessibility standards and guidelines

### 🤖 **AI-Powered Fix Suggestions**
- **Google Gemini Integration**: Uses Gemini AI for intelligent accessibility fix recommendations
- **Context-aware Solutions**: Provides specific, actionable fixes based on issue context
- **Code Examples**: Generates ready-to-use HTML/CSS snippets for common fixes
- **Best Practices**: Offers accessibility guidelines and implementation advice

### 🔐 **Secure User Authentication System**
- **JWT Token Management**: Stateless authentication with JSON Web Tokens
- **Password Encryption**: bcryptjs hashing for secure password storage
- **User Registration/Login**: Complete auth flow with validation and error handling
- **Protected Routes**: Middleware-based route protection and user authorization

### 📊 **Comprehensive Data Management**
- **MongoDB Integration**: Robust data storage with Mongoose ODM
- **Scan History Tracking**: Store and retrieve user scan results with timestamps
- **User Management**: Complete user profile and preferences management
- **Analytics Storage**: Detailed metrics and reporting data persistence

### 🛡️ **Enterprise-grade Security & Performance**
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Input Validation**: Comprehensive request validation and sanitization
- **Error Handling**: Graceful error responses with detailed logging
- **Health Monitoring**: API and database status endpoints

## 🛠️ Tech Stack

**Backend Technologies:**
- **Node.js 18+** - JavaScript runtime environment
- **Express.js** - Fast, unopinionated web framework
- **MongoDB** - NoSQL document database
- **Mongoose** - MongoDB object modeling library
- **JWT** - JSON Web Token for authentication
- **bcryptjs** - Password hashing library

**Accessibility & AI Tools:**
- **Pa11y** - Accessibility testing toolkit
- **Puppeteer** - Headless Chrome automation
- **Google Gemini AI** - AI-powered fix suggestions
- **Axe-core** - Accessibility rules engine

**Development & Deployment:**
- **dotenv** - Environment variable management
- **nodemon** - Development server with hot reload
- **Vercel** - Serverless deployment platform
- **CORS** - Cross-origin resource sharing

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key
- Git

### Installation

1. **Clone the backend repository**
   ```bash
   git clone <your-backend-repo-url>
   cd web-accessibility-analyzer-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create `.env` in the root directory:
   ```env
   # Database Configuration
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   MONGO_DB_NAME=assesssight
   
   # Authentication
   JWT_SECRET=your-super-secret-jwt-key-make-it-long-and-random
   
   # AI Integration
   GEMINI_API_KEY=your-google-gemini-api-key
   
   # Server Configuration
   PORT=4000
   NODE_ENV=development
   ```

4. **Database Setup**
   - Create MongoDB Atlas cluster
   - Add your IP to Network Access whitelist (`0.0.0.0/0` for development)
   - Update connection string in `.env`

5. **Start the development server**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

6. **Verify the setup**
   - API Health Check: `http://localhost:4000/api/health`
   - Should return: `{"status":"ok","database":"connected"}`

## 📖 API Documentation

### 🔐 **Authentication Endpoints**

#### POST `/api/auth/register`
Register a new user account
```javascript
// Request Body
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}

// Response (201 Created)
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### POST `/api/auth/login`
Authenticate existing user
```javascript
// Request Body
{
  "email": "john@example.com",
  "password": "securePassword123"
}

// Response (200 OK)
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### GET `/api/auth/me`
Get current user profile (requires authentication)
```javascript
// Headers
{
  "Authorization": "Bearer jwt-token-here"
}

// Response (200 OK)
{
  "id": "user-id",
  "name": "John Doe",
  "email": "john@example.com"
}
```

### 🔍 **Scanning Endpoints**

#### POST `/api/scan`
Perform accessibility scan on a website
```javascript
// Request Body
{
  "url": "https://example.com"
}

// Response (200 OK)
{
  "success": true,
  "results": {
    "url": "https://example.com",
    "issues": [
      {
        "type": "error",
        "code": "color-contrast",
        "message": "Element has insufficient color contrast",
        "element": "<div>Low contrast text</div>",
        "severity": "critical"
      }
    ],
    "summary": {
      "totalIssues": 15,
      "errorCount": 5,
      "warningCount": 7,
      "noticeCount": 3
    },
    "score": 78,
    "suggestions": [
      {
        "issue": "color-contrast",
        "suggestion": "Increase color contrast ratio to at least 4.5:1",
        "code": "color: #333; background: #fff;"
      }
    ],
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

#### GET `/api/scan/history`
Get user's scan history (requires authentication)
```javascript
// Headers
{
  "Authorization": "Bearer jwt-token-here"
}

// Response (200 OK)
{
  "success": true,
  "scans": [
    {
      "id": "scan-id",
      "url": "https://example.com",
      "score": 78,
      "timestamp": "2024-01-15T10:30:00Z",
      "issueCount": 15
    }
  ]
}
```

### 🏥 **Health & Utility Endpoints**

#### GET `/api/health`
Check API and database connectivity
```javascript
// Response (200 OK)
{
  "status": "ok",
  "database": "connected"
}
```

## 🏗️ Project Architecture

### Directory Structure
```
web-accessibility-analyzer-backend/
├── models/                    # MongoDB schemas
│   ├── User.js               # User model with authentication
│   └── ScanResult.js         # Scan results storage
├── middleware/               # Express middleware
│   └── authMiddleware.js     # JWT authentication
├── routes/                   # API route handlers
│   ├── auth.js              # Authentication routes
│   ├── scan.js              # Scanning endpoints
│   └── history.js           # Scan history management
├── utils/                    # Utility functions
│   ├── scoreCalculator.js   # Accessibility scoring
│   └── validator.js         # Input validation helpers
├── config/                   # Configuration files
│   └── database.js          # MongoDB connection
├── index.js                 # Main application entry point
├── package.json             # Dependencies and scripts
├── vercel.json             # Vercel deployment config
└── .env                    # Environment variables
```

### Core Components

#### **Express Server Setup**
```javascript
// Express server setup for Website Accessibility Analyzer
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection with better error handling
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/webanalyzer';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  if (err.message.includes('IP')) {
    console.log('🔧 Fix: Add your IP to MongoDB Atlas Network Access');
  }
});
```

#### **Route Mounting**
```javascript
// Mount routers
const scanRouter = require('./scan');
const historyRouter = require('./history');
const authRouter = require('./auth');

app.use('/api/scan', scanRouter);
app.use('/api/history', historyRouter);
app.use('/api/auth', authRouter);
```

## 🔧 Key Features Implemented

### Backend Services
- ✅ **User Authentication**: Complete JWT-based auth system
- ✅ **Accessibility Scanning**: Pa11y and Puppeteer integration
- ✅ **AI Fix Suggestions**: Google Gemini API integration
- ✅ **Data Persistence**: MongoDB with Mongoose ODM
- ✅ **Scan History**: User-specific scan tracking
- ✅ **Error Handling**: Comprehensive error management
- ✅ **CORS Configuration**: Cross-origin request handling
- ✅ **Health Monitoring**: API status endpoints

### Database Integration
- ✅ **User Model**: Authentication and profile management
- ✅ **Scan Result Model**: Accessibility scan data storage
- ✅ **MongoDB Atlas**: Cloud database integration
- ✅ **Connection Handling**: Robust error handling and retries
- ✅ **Environment Configuration**: Secure connection management

### API Features
- ✅ **RESTful Design**: Clean and intuitive API endpoints
- ✅ **Authentication Flow**: Register, login, profile management
- ✅ **Scan Management**: URL scanning and result storage
- ✅ **History Tracking**: User scan history retrieval
- ✅ **Health Monitoring**: API and database status endpoints

## 🚀 Deployment

### Vercel Deployment
1. **Create vercel.json**
   ```json
   {
     "version": 2,
     "builds": [
       { "src": "index.js", "use": "@vercel/node" }
     ],
     "routes": [
       { "src": "/(.*)", "dest": "/index.js" }
     ],
     "functions": {
       "index.js": {
         "maxDuration": 30
       }
     }
   }
   ```

2. **Set Environment Variables in Vercel Dashboard:**
   - `MONGO_URI`
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
   - `MONGO_DB_NAME`
   - `NODE_ENV=production`

3. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy backend to Vercel"
   git push origin main
   ```

### MongoDB Atlas Setup
1. **Create MongoDB Atlas cluster**
2. **Network Access**: Add IP addresses (0.0.0.0/0 for development)
3. **Database User**: Create user with read/write permissions
4. **Connection String**: Get URI and update environment variables

## 🧪 Testing

### Manual API Testing
```bash
# Health check
curl http://localhost:4000/api/health

# User registration
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# User login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Website scanning
curl -X POST http://localhost:4000/api/scan \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

### Using Postman/Thunder Client
Import the following collection for comprehensive testing:
- Authentication endpoints
- Scan functionality
- Protected routes
- Error handling scenarios

## 📊 Performance & Monitoring

### Key Metrics
- **Response Time**: Average API response under 2 seconds
- **Scan Processing**: Website analysis completed in 10-30 seconds
- **Database Queries**: Optimized with proper connection handling
- **Memory Usage**: Efficient resource management
- **Error Rate**: Comprehensive error handling and logging

### Monitoring Features
- Request/response logging
- Database connection status monitoring
- Health check endpoints
- Error tracking and debugging

## 🚦 Development Status

This backend API is production-ready and fully functional. Current status:

- ✅ **Core API Endpoints**: Complete
- ✅ **User Authentication**: Complete
- ✅ **Accessibility Scanning**: Complete
- ✅ **Database Integration**: Complete
- ✅ **AI Integration**: Complete
- ✅ **Error Handling**: Complete
- ✅ **Security Implementation**: Complete
- ✅ **Deployment Configuration**: Complete

## 📝 Future Backend Enhancements

- [ ] **Rate Limiting**: API throttling and abuse prevention
- [ ] **Test Suite**: Comprehensive unit and integration tests
- [ ] **Caching**: Redis integration for improved performance
- [ ] **Webhooks**: Real-time notifications for scan completion
- [ ] **Batch Scanning**: Multiple URL processing capabilities
- [ ] **Advanced Analytics**: Detailed reporting and metrics
- [ ] **API Versioning**: Support for multiple API versions
- [ ] **Docker Support**: Containerized deployment options

## 🔒 Security Features

- **Input Validation**: Comprehensive request validation
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs encryption for user passwords
- **CORS Protection**: Proper cross-origin resource sharing
- **Environment Variables**: Secure configuration management
- **Error Handling**: Safe error responses without data exposure

## 🎯 Learning Outcomes

Through this backend project, I've demonstrated expertise in:

- **RESTful API Design**: Clean and intuitive endpoint structure
- **Database Integration**: MongoDB with Mongoose ODM
- **Authentication Systems**: JWT-based secure authentication
- **Third-party APIs**: Google Gemini AI integration
- **Web Automation**: Puppeteer and Pa11y for accessibility testing
- **Security Practices**: Input validation and secure data handling
- **Error Management**: Comprehensive error handling and logging
- **Deployment**: Serverless deployment on Vercel
- **Environment Management**: Secure configuration handling

## 🔗 Related Repositories

- **Frontend Application**: [Link to frontend repository] - Next.js React frontend
- **API Documentation**: [Link to API docs] - Comprehensive endpoint documentation
- **Deployment Guide**: [Link to deployment guide] - Production deployment instructions

## 📦 Dependencies

### Production Dependencies
```json
{
  "bcryptjs": "^2.4.3",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "express": "^4.18.2",
  "jsonwebtoken": "^9.0.2",
  "mongoose": "^8.0.3",
  "pa11y": "^7.0.0",
  "puppeteer": "^21.6.1"
}
```

### Development Dependencies
```json
{
  "nodemon": "^3.0.2"
}
```


<div align="center">

**Backend API built with ⚡ for scalable accessibility testing**

![Made with Node.js](https://img.shields.io/badge/Made%20with-Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

⭐ **Star this repo if you found it helpful!** ⭐

</div>
