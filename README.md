# Mosaic-Me Web Application

Transform your photographs into LEGO mosaic artwork with building instructions and shopping lists.

**Version**: 2.0.0

## Overview

Mosaic-Me is a modern, lean web application that converts images into LEGO mosaics. It provides:

- **Image Upload**: Drag-and-drop image upload with automatic square cropping
- **Mosaic Generation**: Convert images to LEGO color grids using perceptual color matching
- **Interactive Editor**: Edit generated mosaics with paint brush and fill tools
- **Building Instructions**: Color-coded grids with numbered legends
- **Shopping Lists**: Downloadable CSV files compatible with LEGO Pick-A-Brick
- **Admin Dashboard**: Analytics and visitor tracking with JWT authentication

## Features

### User Features
- Real-time mosaic generation
- **Interactive mosaic editor** with brush and fill tools
- Multiple baseplate sizes (32×32, 48×48, 64×64, 96×96, 128×128 studs)
- Two piece types (Round 1×1 Plates, Square 1×1 Plates)
- All available LEGO colors in editing palette
- Undo/Redo functionality (50-state history)
- PNG exports for mosaics and instructions
- CSV exports for shopping lists
- Responsive design (mobile and desktop)

### Admin Features
- Secure JWT-based authentication
- Analytics dashboard with visitor and download tracking
- Session management
- Anonymous visitor fingerprinting

## Technology Stack

### Frontend
- React 18+ with TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- React Context + Hooks (state management)
- react-dropzone (file upload)
- Lucide React (icons)

### Backend
- FastAPI (Python 3.11+)
- Pillow + NumPy (image processing)
- PostgreSQL (database - required for analytics)
- JWT authentication (python-jose)
- Passlib + bcrypt (password hashing)
- SQLAlchemy (database ORM)
- Asyncpg (async PostgreSQL driver)

## Prerequisites

- Node.js 18+ and npm/pnpm
- Python 3.11+
- PostgreSQL 15+ (required for analytics and admin features)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mosaic-me-web-1
```

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env` and configure your API URL if needed:
```
VITE_API_URL=http://localhost:8000/api/v1
```

### 3. Backend Setup

```bash
cd ../backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env` and configure your settings:
```bash
# Server Configuration
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=http://localhost:5173

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mosaicme

# Security (generate secure random strings)
JWT_SECRET_KEY=your-secret-key-here  # Generate with: openssl rand -hex 32
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Analytics
ANALYTICS_SALT=your-analytics-salt-here  # Generate with: openssl rand -hex 16
```

**Important**: Generate secure random values for `JWT_SECRET_KEY` and `ANALYTICS_SALT`:
```bash
# Generate JWT secret
openssl rand -hex 32

# Generate analytics salt
openssl rand -hex 16
```

### 4. Database Setup

PostgreSQL is required for analytics and admin features:

```bash
# Create database
createdb mosaicme

# Run migrations in order
cd backend
psql -d mosaicme -f migrations/001_initial_schema.sql
psql -d mosaicme -f migrations/002_admin_auth_analytics.sql
psql -d mosaicme -f migrations/003_fix_visitor_count.sql
```

### 5. Create Admin User

Create your first admin user:

```bash
cd backend
python scripts/create_admin.py
```

Follow the prompts to enter email, password, and full name.

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python -m uvicorn src.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

**Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn src.main:app --host 0.0.0.0 --port 8000
```

## Project Structure

```
mosaic-me-web/
├── frontend/                      # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── editor/           # Editor components
│   │   │   │   ├── ColorPalette.tsx
│   │   │   │   ├── EditableGrid.tsx
│   │   │   │   └── EditorToolbar.tsx
│   │   │   ├── dashboard/        # Admin dashboard components
│   │   │   ├── MosaicEditor.tsx  # Main editor component
│   │   │   └── ...
│   │   ├── hooks/                # Custom hooks
│   │   │   ├── useMosaicEditor.ts
│   │   │   ├── useMosaic.tsx
│   │   │   └── ...
│   │   ├── services/             # API services
│   │   │   ├── api.ts
│   │   │   └── analytics.ts
│   │   ├── utils/                # Utility functions
│   │   │   ├── gridUtils.ts      # Grid manipulation
│   │   │   └── canvasUtils.ts    # Canvas rendering
│   │   ├── types/                # TypeScript types
│   │   ├── contexts/             # React contexts
│   │   ├── pages/                # Page components
│   │   ├── App.tsx               # Main app component
│   │   └── main.tsx              # Entry point
│   └── package.json
├── backend/                       # FastAPI backend application
│   ├── src/
│   │   ├── api/                  # API endpoints
│   │   │   ├── upload.py
│   │   │   ├── export.py
│   │   │   ├── auth.py          # Authentication
│   │   │   ├── analytics.py     # Analytics endpoints
│   │   │   └── palettes.py
│   │   ├── services/             # Business logic
│   │   │   ├── mosaic.py
│   │   │   ├── auth.py
│   │   │   └── analytics.py
│   │   ├── db/                   # Database utilities
│   │   ├── middleware/           # Request middleware
│   │   ├── data/                 # Color palettes (JSON)
│   │   ├── config.py             # Configuration
│   │   └── main.py               # FastAPI app
│   ├── migrations/               # Database migrations
│   │   ├── 001_initial_schema.sql
│   │   └── 002_admin_auth_analytics.sql
│   ├── scripts/                  # Utility scripts
│   │   └── create_admin.py
│   └── requirements.txt
├── CONSTITUTION.md               # Project principles
├── SPECIFICATIONS.md             # Technical specifications
└── README.md                     # This file
```

## API Endpoints

### Public Endpoints

#### POST `/api/v1/upload`
Upload an image and generate a mosaic.

**Request:**
- `file`: Image file (multipart/form-data)
- `baseplateSize`: Integer (32, 48, 64, 96, or 128)
- `pieceType`: String ('round' or 'square')

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "mosaic": {
      "previewUrl": "data:image/png;base64,...",
      "grid": [[...]],
      "shoppingList": [...],
      "metadata": {...}
    }
  }
}
```

#### GET `/api/v1/export/{sessionId}/{type}`
Download an export file.

**Parameters:**
- `sessionId`: UUID of the mosaic session
- `type`: Export type ('mosaic-png', 'instructions-png', 'shopping-csv')

**Response:** File download

#### GET `/api/v1/palettes`
Get available color palettes.

#### GET `/api/v1/palettes/{paletteType}/colors`
Get detailed colors for a specific palette ('round' or 'square').

#### GET `/api/v1/health`
Health check endpoint.

### Admin Endpoints (Require Authentication)

#### POST `/api/v1/auth/login`
Admin login with email and password.

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "access_token": "jwt-token",
  "refresh_token": "refresh-token",
  "token_type": "bearer"
}
```

#### POST `/api/v1/auth/refresh`
Refresh access token.

#### GET `/api/v1/analytics/metrics`
Get analytics metrics (requires JWT authentication).

**Query Parameters:**
- `days`: Number of days to include (default: 30)

#### GET `/api/v1/analytics/summary`
Get daily analytics summary (requires JWT authentication).

## Usage Guide

### Creating a Mosaic

1. **Upload an Image**: Drag and drop an image or click to select (JPEG, PNG, WebP, max 10MB)
2. **Configure Settings**: Choose baseplate size and piece type
3. **Generate Mosaic**: Click "Generate Mosaic" button
4. **View Results**: Switch between three tabs:
   - **Mosaic Preview**: Zoom and download the mosaic
   - **Building Instructions**: Color-coded grid with legend
   - **Shopping List**: Table of required pieces
5. **Download**: Export mosaics as PNG or shopping lists as CSV

### Editing a Mosaic

1. **Enter Edit Mode**: Click "Edit Mosaic" button in the Preview tab
2. **Select Tool**:
   - **Brush Tool**: Click and drag to select individual pixels
   - **Fill Tool**: Click to select all connected pixels of the same color
3. **Choose Color**: Click any color from the palette to apply to selected pixels
4. **Use Features**:
   - **Undo/Redo**: Ctrl+Z / Ctrl+Y (or use toolbar buttons)
   - **Clear Selection**: ESC key or toolbar button
   - **Reset**: Restore original mosaic
   - **Zoom**: Adjust view from 50% to 300%
5. **Save Changes**: Click "Save Changes" to update the mosaic and shopping list
6. **Cancel**: Discard changes and return to preview

### Admin Dashboard

1. **Login**: Navigate to `/admin` and enter credentials
2. **View Analytics**: See visitor stats, mosaic creations, and downloads
3. **Monitor Activity**: Track popular baseplate sizes and usage trends

## Technical Details

### Interactive Editor

The mosaic editor features:

- **State Management**: Custom React hook with immutable state updates
- **History Stack**: 50-state undo/redo using array-based history
- **Paint Brush Tool**: Mouse event tracking (mousedown, mousemove, mouseup) for pixel selection
- **Fill Tool**: BFS (Breadth-First Search) flood fill algorithm for connected regions
- **Canvas Rendering**: HTML5 Canvas API for generating preview images from grid data
- **Performance**: React.memo for grid cell optimization, preventing unnecessary re-renders
- **Keyboard Shortcuts**: Ctrl+Z (undo), Ctrl+Y (redo), ESC (clear selection)

### Color Matching Algorithm

Mosaic-Me uses the **Delta E (CIE76)** color distance algorithm for perceptually accurate color matching:

1. Convert RGB colors to LAB color space
2. Calculate Euclidean distance in LAB space
3. Select the closest LEGO color from the chosen palette

This provides better visual results than simple RGB distance.

### Security

- **JWT Authentication**: Secure token-based authentication for admin features
- **Password Hashing**: Bcrypt with automatic salt generation
- **Anonymous Analytics**: SHA-256 hashing of visitor fingerprints with salt
- **CORS Protection**: Configurable allowed origins
- **Environment Variables**: Sensitive data stored in `.env` files (not in version control)

## Performance

- Page load: < 3 seconds
- Mosaic generation (64×64): < 10 seconds
- Export generation: < 3 seconds
- Session data retention: 24 hours

## Limitations

- Maximum file size: 10MB
- Maximum baseplate size: 128×128 studs
- Supported formats: JPEG, PNG, WebP
- Sessions expire after 24 hours

## Troubleshooting

### Backend won't start
- Ensure Python 3.11+ is installed
- Activate virtual environment
- Install all requirements: `pip install -r requirements.txt`
- Check port 8000 is not in use

### Frontend won't start
- Ensure Node.js 18+ is installed
- Run `npm install` to install dependencies
- Check port 5173 is not in use

### CORS errors
- Ensure backend CORS_ORIGINS includes your frontend URL
- Check .env file configuration

### Image upload fails
- Check file size (max 10MB)
- Ensure file format is JPEG, PNG, or WebP
- Check backend logs for errors

## Development

### Linting
```bash
# Frontend
cd frontend
npm run lint

# Backend
cd backend
pip install black flake8
black src/
flake8 src/
```

### Type Checking
```bash
# Frontend
cd frontend
npm run type-check

# Backend
cd backend
pip install mypy
mypy src/
```

## Contributing

Please refer to CONSTITUTION.md for project principles and development guidelines.

## License

This project is not affiliated with the LEGO Group. LEGO® is a trademark of the LEGO Group.

## Support

For issues and feature requests, please create an issue on GitHub.

## Recent Updates

### Version 2.0.0 (Latest)
- ✅ Interactive mosaic editor with brush and fill tools
- ✅ Undo/Redo functionality (50-state history)
- ✅ All LEGO colors available in editing palette
- ✅ Admin dashboard with JWT authentication
- ✅ Analytics tracking (visitors, mosaics, downloads)
- ✅ Anonymous visitor fingerprinting
- ✅ Automatic preview updates after editing

## Roadmap

See CONSTITUTION.md section "To be added features" for planned enhancements:
- Feedback widget
- PDF exports with step-by-step instructions
- 3D Preview of completed mosaic
- Estimated pricing calculator
- Automatic shopping cart creation on LEGO website
- Multi-baseplate support for larger mosaics
- Custom color palette creation
