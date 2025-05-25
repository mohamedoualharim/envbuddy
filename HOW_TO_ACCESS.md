# How to Access EnvBuddy

You have **TWO separate applications**:

## 1. 🔧 API Server (Backend)
- **URL**: http://localhost:3000
- **Location**: `/envbuddy-api`
- **Purpose**: Handles data, authentication, and CLI requests
- **Status**: ✅ Currently running

### API Endpoints:
- http://localhost:3000/health - Health check (what you just saw)
- http://localhost:3000/api/projects - Project management (requires auth)
- http://localhost:3000/api/env/* - Environment file management (requires auth)

## 2. 🌐 Landing Page (Frontend)
- **URL**: http://localhost:3001 (or http://localhost:3000 if API not running)
- **Location**: `/envbuddy-landing`
- **Purpose**: Marketing website for EnvBuddy
- **Status**: Starting up...

### To access the landing page:

**Option 1 - Open a new terminal:**
```bash
cd envbuddy-landing
npm run dev
```

**Option 2 - If it's already running:**
Just open your browser and go to:
- http://localhost:3001 (if API is on 3000)
- http://localhost:3000 (if running alone)

## What You'll See

### On the Landing Page:
- Hero section with "EnvBuddy — Sync .env Files Like a Pro"
- How it works (3 steps)
- Benefits section
- Features list
- Call-to-action buttons

### On the API:
- JSON responses
- Requires authentication for most endpoints
- Used by the CLI tool, not meant for browser viewing

## Quick Start

1. **Keep the API running** in one terminal (already done ✅)
2. **Start the landing page** in another terminal:
   ```bash
   cd envbuddy-landing
   npm run dev
   ```
3. **Open your browser** to http://localhost:3001

That's it! The landing page should now be visible in your browser. 