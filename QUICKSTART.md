# Quick Start Guide

Get Mosaic-Me running in 5 minutes!

## Prerequisites Check

```bash
# Check Node.js (need 18+)
node --version

# Check Python (need 3.11+)
python --version
# or
python3 --version

# Check npm
npm --version
```

## Installation (5 steps)

### 1. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 2. Install Backend Dependencies
```bash
cd ../backend

# Create virtual environment
python -m venv venv

# Activate it
source venv/bin/activate  # On Mac/Linux
# OR
venv\Scripts\activate  # On Windows

# Install packages
pip install -r requirements.txt
```

### 3. Create Environment Files
```bash
# Frontend
cd ../frontend
cp .env.example .env

# Backend
cd ../backend
cp .env.example .env
```

### 4. Start Backend Server
```bash
# Make sure you're in backend/ directory
# Make sure venv is activated
python -m uvicorn src.main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

### 5. Start Frontend (New Terminal)
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

## Access the Application

Open your browser to: **http://localhost:5173**

You should see the Mosaic-Me interface!

## Quick Test

1. Click or drag an image into the upload area
2. Select a baseplate size (try 48×48)
3. Choose piece type (Square is default)
4. Click "Generate Mosaic"
5. Wait a few seconds
6. View your mosaic in the tabs!

## Troubleshooting

### "Port 8000 already in use"
```bash
# Find and kill the process
lsof -ti:8000 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :8000   # Windows (then kill from Task Manager)
```

### "Port 5173 already in use"
```bash
# Kill the process
lsof -ti:5173 | xargs kill -9  # Mac/Linux
```

### "Module not found" errors (Backend)
```bash
# Make sure venv is activated
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows

# Reinstall
pip install -r requirements.txt
```

### "Module not found" errors (Frontend)
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### CORS errors in browser
Make sure:
1. Backend is running on port 8000
2. Frontend is running on port 5173
3. Backend `.env` has: `CORS_ORIGINS=http://localhost:5173`

## Next Steps

- Read [README.md](README.md) for full documentation
- Check [CONSTITUTION.md](CONSTITUTION.md) for project principles
- See [SPECIFICATIONS.md](SPECIFICATIONS.md) for technical details

## Stop the Servers

- Press `Ctrl+C` in both terminal windows
- Deactivate Python venv: `deactivate`

## Development Workflow

**Always run these in separate terminals:**

Terminal 1 (Backend):
```bash
cd backend
source venv/bin/activate
python -m uvicorn src.main:app --reload --port 8000
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

Happy mosaicking! 🧱
