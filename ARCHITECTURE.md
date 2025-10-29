# Consol - AI-Powered Note Study System
## Complete System Architecture & Documentation

### 📋 **System Overview**
Consol is a Next.js-based study application that uses AI (SimCSE) to evaluate note comprehension through semantic similarity scoring. Users can upload notes, take timed sessions, and track their learning progress through detailed analytics.

---

## 🏗️ **Architecture Diagram**

```
┌─────────────────────────────────────────────────────────────────┐
│                           CONSOL SYSTEM                        │
├─────────────────────────────────────────────────────────────────┤
│                          🖥️ FRONTEND                           │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ User Interface (Next.js 15 + React 19 + Tailwind CSS)      │ │
│  │                                                             │ │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐ │ │
│  │ │  Dashboard  │ │   Profile   │ │   Session   │ │  Users  │ │ │
│  │ │    Page     │ │    Page     │ │    Page     │ │  Page   │ │ │
│  │ └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘ │ │
│  │                                                             │ │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐ │ │
│  │ │   Navbar    │ │  HelpModal  │ │  LineChart  │ │ Calendar│ │ │
│  │ │  Component  │ │  Component  │ │  Component  │ │Component│ │ │
│  │ └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                          🔌 API LAYER                          │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   Next.js API Routes                       │ │
│  │                                                             │ │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐ │ │
│  │ │/api/notes   │ │/api/sessions│ │/api/users   │ │/api/test│ │ │
│  │ │   CRUD      │ │   CRUD      │ │   CRUD      │ │   ENV   │ │ │
│  │ └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘ │ │
│  │                                                             │ │
│  │ ┌─────────────────────────────────┐ ┌─────────────────────┐ │ │
│  │ │     /api/users/upload-profile   │ │   Session Utils     │ │ │
│  │ │      (Cloudinary Integration)   │ │   (Helper Functions)│ │ │
│  │ └─────────────────────────────────┘ └─────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                        🤖 AI/ML API                            │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │            Python Flask Server (SimCSE API)                │ │
│  │                                                             │ │
│  │ ┌─────────────────┐          ┌─────────────────────────────┐ │ │
│  │ │   server.py     │          │        AI Model             │ │ │
│  │ │                 │   Uses   │                             │ │ │
│  │ │ - Receives Text │ ────────▶│ princeton-nlp/              │ │ │
│  │ │ - Processes via │          │ unsup-simcse-bert-base-     │ │ │
│  │ │   Transformer   │          │ uncased                     │ │ │
│  │ │ - Returns Score │          │                             │ │ │
│  │ └─────────────────┘          └─────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                        💾 DATABASE                             │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   PostgreSQL Database                      │ │
│  │                                                             │ │
│  │ ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐   │ │
│  │ │   USERS     │    │    NOTES    │    │    SESSIONS     │   │ │
│  │ │             │    │             │    │                 │   │ │
│  │ │ - id        │    │ - id        │    │ - id            │   │ │
│  │ │ - username  │────│ - user_id   │────│ - user_id       │   │ │
│  │ │ - profile_  │    │ - title     │    │ - note_id       │   │ │
│  │ │   picture_  │    │ - content   │    │ - similarity    │   │ │
│  │ │   url       │    │ - created_at│    │ - stars         │   │ │
│  │ │ - created_at│    │             │    │ - wpm           │   │ │
│  │ └─────────────┘    └─────────────┘    │ - duration_secs │   │ │
│  │                                       │ - created_at    │   │ │
│  │                                       └─────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                      ☁️ EXTERNAL SERVICES                      │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ ┌─────────────────┐            ┌─────────────────────────┐   │ │
│  │ │   Cloudinary    │            │      Hugging Face       │   │ │
│  │ │                 │            │                         │   │ │
│  │ │ - Image Storage │            │ - Model Hosting         │   │ │
│  │ │ - Auto Resize   │            │ - SimCSE Transformers   │   │ │
│  │ │ - Face Detection│            │ - Pre-trained Weights   │   │ │
│  │ │ - URL Generation│            │                         │   │ │
│  │ └─────────────────┘            └─────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗂️ **Project Structure**

```
my-app/
├── 📁 app/                          # Next.js App Router
│   ├── 📁 api/                      # Backend API Routes
│   │   ├── 📁 notes/
│   │   │   ├── route.ts             # CRUD operations for notes
│   │   │   └── 📁 [id]/
│   │   │       └── route.ts         # Individual note operations
│   │   ├── 📁 sessions/
│   │   │   └── route.ts             # Session data management
│   │   ├── 📁 users/
│   │   │   ├── route.ts             # User management
│   │   │   ├── 📁 [id]/
│   │   │   │   └── route.ts         # Individual user operations
│   │   │   └── 📁 upload-profile/
│   │   │       └── route.ts         # Profile picture upload
│   │   ├── 📁 test/
│   │   │   └── route.ts             # Development testing
│   │   └── 📁 test-env/
│   │       └── route.ts             # Environment variable testing
│   │
│   ├── 📁 dashboard/
│   │   ├── page.js                  # Dashboard main page
│   │   ├── dashboard.js             # Dashboard component
│   │   └── notes.js                 # Notes management logic
│   │
│   ├── 📁 profile/
│   │   ├── page.js                  # Profile main page
│   │   └── profile.js               # Profile component
│   │
│   ├── 📁 session/
│   │   ├── page.js                  # Session main page
│   │   ├── session.js               # Session component
│   │   ├── sessionLogic.js          # Session business logic
│   │   └── FinishModal.js           # Session completion modal
│   │
│   ├── 📁 users/
│   │   ├── page.js                  # Users main page
│   │   └── user.js                  # Users component
│   │
│   ├── 📁 test-upload/
│   │   └── page.js                  # Upload testing page
│   │
│   ├── globals.css                  # Global CSS styles
│   ├── layout.js                    # Root layout component
│   └── page.js                      # Landing page
│
├── 📁 components/                   # Reusable React Components
│   ├── Calendar.js                  # Monthly calendar with session data
│   ├── HelpModal.js                 # Tutorial overlay system
│   ├── HistoryTable.js              # Session history display
│   ├── LineChart.js                 # Performance charts (Chart.js)
│   ├── Navbar.js                    # Navigation bar
│   ├── PreviewPanel.js              # Note preview component
│   ├── RadarChart.js                # Radar performance visualization
│   └── StarSlot.js                  # SVG star rating component
│
├── 📁 lib/                          # Utility Libraries
│   ├── cloudinary.js                # Cloudinary configuration
│   ├── db.js                        # PostgreSQL connection pool
│   └── UserContext.js               # React Context for user state
│
├── 📁 utils/                        # Helper Functions
│   ├── computeRadarStats.js         # Performance calculations
│   └── sessionUtils.js              # Session-related utilities
│
├── 📁 database/                     # Database Scripts
│   └── 📁 migrations/
│       └── add_profile_picture.sql  # Database schema updates
│
├── 📁 public/                       # Static Assets
│
├── 📁 prisma/                       # Database Schema (Future)
│   ├── schema.prisma                # Prisma schema definition
│   └── seed.mjs                     # Database seeding script
│
├── .env.local                       # Environment variables
├── .env.example                     # Environment template
├── .gitignore                       # Git ignore rules
├── package.json                     # Dependencies and scripts
├── tailwind.config.js               # Tailwind CSS configuration
├── postcss.config.js                # PostCSS configuration
├── next.config.mjs                  # Next.js configuration
└── README.md                        # Project documentation
```

---

## 🔄 **Data Flow Architecture**

### **1. User Authentication Flow**
```
User Selection → UserContext → localStorage → All Pages
   ↓
Users Page → Select User → Dashboard → Profile/Session
```

### **2. Note Management Flow**
```
Dashboard → Create/Edit Note → API → Database
    ↓
Note Selection → Session Page → AI Analysis → Results Storage
```

### **3. Session Execution Flow**
```
Dashboard → Select Note → Configure Session → Start
    ↓
Session Page → User Input → SimCSE API → Similarity Score
    ↓
Results → Database Storage → Analytics Update
```

### **4. AI Processing Flow**
```
User Text Input → Next.js API → Python Flask Server
    ↓
SimCSE Model → Similarity Calculation → Score Return
    ↓
Next.js Backend → Database Storage → Frontend Update
```

---

## 🛠️ **Technology Stack**

### **Frontend**
- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **Charts**: Chart.js
- **Icons**: SVG components
- **State Management**: React Context + localStorage

### **Backend**
- **API**: Next.js API Routes (TypeScript)
- **Database**: PostgreSQL with raw SQL
- **AI/ML**: Python Flask + SimCSE (Hugging Face Transformers)
- **File Upload**: Cloudinary
- **Connection Pooling**: node-postgres (pg)

### **External Services**
- **Image Storage**: Cloudinary
- **AI Models**: Hugging Face (princeton-nlp/unsup-simcse-bert-base-uncased)

---

## 📊 **Database Schema**

```sql
-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    profile_picture_url VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notes Table
CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions Table
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    note_id INTEGER REFERENCES notes(id) ON DELETE CASCADE,
    similarity DECIMAL(5,3) NOT NULL,
    stars INTEGER NOT NULL CHECK (stars >= 0 AND stars <= 3),
    wpm DECIMAL(6,2) DEFAULT NULL,
    duration_secs INTEGER DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚀 **Key Features**

### **Dashboard**
- Note creation and management
- Session configuration (time limits, hints)
- Performance metrics display
- Recent session analytics

### **Session Page**
- Real-time typing interface
- AI-powered similarity scoring
- WPM calculation
- Star rating system (0-3 stars)
- Progress tracking

### **Profile Page**
- Performance analytics
- Calendar view with session history
- Radar charts for comprehensive metrics
- Line charts for progress tracking
- Profile picture management

### **AI Integration**
- SimCSE-based semantic similarity
- Real-time text analysis
- Similarity threshold configuration
- Star rating based on performance

---

## ⚙️ **Environment Setup**

```bash
# .env.local
DATABASE_URL=postgresql://postgres:password@localhost:5432/Consol
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🔧 **Installation & Running**

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start AI server (separate terminal)
cd simcse-api
python server.py

# Access application
# Frontend: http://localhost:3000
# AI API: http://localhost:5000
```

---

## 📈 **Performance Metrics**

### **Similarity Scoring**
- Range: 0.0 to 1.0
- Star Conversion: 
  - 3 stars: similarity ≥ 0.8
  - 2 stars: similarity ≥ 0.6
  - 1 star: similarity ≥ 0.4
  - 0 stars: similarity < 0.4

### **Analytics**
- WPM (Words Per Minute) calculation
- Session duration tracking
- Progress trends over time
- Performance comparison metrics

---

This documentation provides a complete reference for understanding, maintaining, and extending the Consol application system.