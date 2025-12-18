# Mosaic-Me Web Application

Transform your photographs into LEGO mosaic artwork with building instructions and shopping lists.

**Version**: 1.0.0

## Overview

Mosaic-Me is a modern, lean web application that converts images into LEGO mosaics. It provides:

- **Image Upload**: Drag-and-drop image upload with automatic square cropping
- **Mosaic Generation**: Convert images to LEGO color grids using perceptual color matching
- **Building Instructions**: Color-coded grids with numbered legends
- **Shopping Lists**: Downloadable CSV files compatible with LEGO Pick-A-Brick

## Features

- Real-time mosaic generation
- Multiple baseplate sizes (32×32, 48×48, 64×64, 96×96, 128×128 studs)
- Two piece types (Round 1×1 Plates, Square 1×1 Plates)
- Official LEGO colors
- PNG exports for mosaics and instructions
- CSV exports for shopping lists
- Responsive design (mobile and desktop)

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
- PostgreSQL (database - optional)
- In-memory caching

## Prerequisites

- Node.js 18+ and npm/pnpm
- Python 3.11+
- PostgreSQL 15+ (optional, for persistent storage)

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
```
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=http://localhost:5173
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mosaicme
```

### 4. Database Setup (Optional)

If you want persistent storage:

```bash
# Create database
createdb mosaicme

# Run migrations
psql -d mosaicme -f migrations/001_initial_schema.sql
```

Note: The application works without PostgreSQL using in-memory storage. Sessions will be lost on restart.

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
mosaic-me-web-1/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript types
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   └── package.json
├── backend/                  # FastAPI backend application
│   ├── src/
│   │   ├── api/             # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── data/            # Color palettes
│   │   ├── config.py        # Configuration
│   │   └── main.py          # FastAPI app
│   ├── migrations/          # Database migrations
│   └── requirements.txt
├── CONSTITUTION.md          # Project principles
├── SPECIFICATIONS.md        # Technical specifications
└── README.md               # This file
```

## API Endpoints

### POST `/api/v1/upload`
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

### GET `/api/v1/export/{sessionId}/{type}`
Download an export file.

**Parameters:**
- `sessionId`: UUID of the mosaic session
- `type`: Export type ('mosaic-png', 'instructions-png', 'shopping-csv')

**Response:** File download

### GET `/api/v1/palettes`
Get available color palettes.

### GET `/api/v1/health`
Health check endpoint.

## Usage Guide

1. **Upload an Image**: Drag and drop an image or click to select (JPEG, PNG, WebP, max 10MB)
2. **Configure Settings**: Choose baseplate size and piece type
3. **Generate Mosaic**: Click "Generate Mosaic" button
4. **View Results**: Switch between three tabs:
   - **Mosaic Preview**: Zoom and download the mosaic
   - **Building Instructions**: Color-coded grid with legend
   - **Shopping List**: Table of required pieces
5. **Download**: Export mosaics as PNG or shopping lists as CSV

## Color Matching Algorithm

Mosaic-Me uses the **Delta E (CIE76)** color distance algorithm for perceptually accurate color matching:

1. Convert RGB colors to LAB color space
2. Calculate Euclidean distance in LAB space
3. Select the closest LEGO color from the chosen palette

This provides better visual results than simple RGB distance.

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

## Roadmap

See CONSTITUTION.md section "To be added features" for planned enhancements:
- Feedback widget
- Advanced analytics dashboard
- PDF exports
- 3D Preview
- Estimated pricing
- Automatic shopping cart creation on LEGO website
