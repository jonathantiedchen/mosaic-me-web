# Mosaic-Me Web Application - Technical Specifications

## Project Overview

**Project Name**: Mosaic-Me Web Application
**Version**: 1.0.0
**Last Updated**: December 11, 2025
**Purpose**: Modern web-based application that transforms photographs into LEGO mosaic artwork with building instructions and shopping lists

---

## 1. Executive Summary

This document outlines the technical specifications for developing a modern, full-stack web application that replicates and enhances the functionality of the original Streamlit-based mosaic-me application. The new application will feature a responsive, performant user interface with a robust backend API architecture.

### Key Objectives
- Create a responsive, mobile-friendly web application
- Provide real-time image processing and preview
- Enable seamless file uploads and downloads
- Implement analytics and user feedback systems
- Ensure scalability and performance optimization
- Support future feature enhancements

---

## 2. Technology Stack

### 2.1 Frontend

#### Core Framework
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite or Next.js 14+ (for SSR capabilities)
- **Styling**:
  - Tailwind CSS for utility-first styling
  - shadcn/ui for component library
  - CSS Modules for component-specific styles

#### State Management
- **Global State**: Zustand or Redux Toolkit
- **Server State**: TanStack Query (React Query) for API data caching
- **Form State**: React Hook Form with Zod validation

#### UI Components & Libraries
- **File Upload**: react-dropzone
- **Image Cropping**: react-image-crop or react-easy-crop
- **Zoom/Pan**: react-zoom-pan-pinch
- **Tabs**: Radix UI or Headless UI
- **Toast Notifications**: react-hot-toast or sonner
- **Icons**: Lucide React or Heroicons
- **Charts/Analytics**: Recharts (if analytics dashboard needed)

### 2.2 Backend

#### API Framework
- **Primary Option**: Node.js with Express.js or Fastify
- **Alternative Option**: Python with FastAPI (to leverage existing mosaic-me utilities)
- **Language**: TypeScript (Node.js) or Python 3.11+

#### Image Processing
- **Node.js**: Sharp library for image manipulation
- **Python**: Pillow (PIL), NumPy for color processing
- **Canvas Rendering**: node-canvas or Python PIL for generating instruction images

#### Database
- **Primary Database**: PostgreSQL 15+ for relational data
  - User feedback
  - Analytics data
  - User sessions (optional)

- **Cache Layer**: Redis for:
  - Session management
  - Rate limiting
  - Caching processed mosaics temporarily

#### File Storage
- **Development**: Local file system
- **Production Options**:
  - AWS S3 for scalability
  - Cloudflare R2 (S3-compatible, no egress fees)
  - Google Cloud Storage
  - Supabase Storage (if using Supabase)

### 2.3 Infrastructure & DevOps

#### Hosting & Deployment
- **Frontend Hosting**:
  - Vercel (recommended for Next.js)
  - Netlify
  - Cloudflare Pages

- **Backend Hosting**:
  - Railway
  - Render
  - AWS EC2/ECS
  - Google Cloud Run
  - DigitalOcean App Platform

#### CI/CD
- GitHub Actions for automated testing and deployment
- Pre-commit hooks with Husky and lint-staged
- Automated testing on pull requests

#### Monitoring & Analytics
- **Application Monitoring**: Sentry for error tracking
- **Analytics**:
  - Google Analytics 4 (optional)
  - PostHog for product analytics
  - Custom analytics stored in PostgreSQL
- **Performance Monitoring**: Web Vitals tracking

### 2.4 Development Tools

- **Package Manager**: pnpm or npm
- **Code Quality**:
  - ESLint for linting
  - Prettier for code formatting
  - TypeScript for type safety
- **Testing**:
  - Vitest or Jest for unit tests
  - React Testing Library for component tests
  - Playwright or Cypress for E2E tests
- **API Documentation**:
  - OpenAPI/Swagger for API specs
  - Postman collections for testing

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                         │
│  ┌────────────────────────────────────────────────────┐ │
│  │  React Frontend (SPA or SSR with Next.js)          │ │
│  │  - Image Upload Component                          │ │
│  │  - Configuration Panel                             │ │
│  │  - Results Viewer (Tabs: Preview, Instructions,    │ │
│  │    Shopping List)                                  │ │
│  │  - Download Manager                                │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTPS/REST API
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   API Gateway Layer                      │
│  ┌────────────────────────────────────────────────────┐ │
│  │  API Server (Express/FastAPI)                      │ │
│  │  - Authentication Middleware                       │ │
│  │  - Rate Limiting                                   │ │
│  │  - Request Validation                              │ │
│  │  - CORS Configuration                              │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  Application Layer                       │
│  ┌────────────┬──────────────┬─────────────────────────┐│
│  │ Image      │ Mosaic       │ Export                  ││
│  │ Processing │ Generation   │ Service                 ││
│  │ Service    │ Service      │                         ││
│  └────────────┴──────────────┴─────────────────────────┘│
│  ┌────────────┬──────────────┬─────────────────────────┐│
│  │ Analytics  │ Feedback     │ Color Palette           ││
│  │ Service    │ Service      │ Manager                 ││
│  └────────────┴──────────────┴─────────────────────────┘│
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Data Layer                            │
│  ┌──────────────┬──────────────┬────────────────────┐   │
│  │  PostgreSQL  │    Redis     │   File Storage     │   │
│  │  Database    │    Cache     │   (S3/Local)       │   │
│  └──────────────┴──────────────┴────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Data Flow

#### Image Upload & Processing Flow
1. User uploads image via drag-and-drop or file picker
2. Frontend validates file (type, size)
3. Image sent to backend API via multipart/form-data
4. Backend validates and stores original image temporarily
5. Image processing service resizes and converts to target dimensions
6. Mosaic generation service applies color matching algorithm
7. Results stored in cache with unique session ID
8. Response sent to frontend with preview data and session ID

#### Export Generation Flow
1. User requests export (mosaic, instructions, or shopping list)
2. Frontend sends request with session ID and export type
3. Backend retrieves processed mosaic data from cache
4. Export service generates requested file format
5. File stored temporarily in storage service
6. Analytics service logs download event
7. Presigned URL or file stream sent to frontend
8. Frontend triggers browser download

---

## 4. Functional Requirements

### 4.1 User Interface Components

#### 4.1.1 Home/Landing Page
- **Hero Section**:
  - Application title and tagline
  - Brief description of functionality
  - Call-to-action button to start creating
- **Demo Showcase**:
  - Example mosaics in a gallery/carousel
  - Before/after image comparisons
- **Feature Highlights**:
  - Icon-based feature cards
  - Key benefits and use cases
- **Footer**:
  - Links to GitHub, documentation
  - Contact information

#### 4.1.2 Creator/Main Application Page

**Configuration Panel** (Left Sidebar or Top Panel):
- **Image Upload Section**:
  - Drag-and-drop zone with visual feedback
  - File browser button
  - Demo image button
  - Image preview thumbnail
  - Clear/remove image button
  - File validation messaging (max size, supported formats)

- **Mosaic Settings**:
  - Baseplate size selector (dropdown or radio buttons):
    - 32×32 studs
    - 48×48 studs
    - 64×64 studs
    - 96×96 studs
    - 128×128 studs
  - Piece type selector:
    - Round 1×1 Plates
    - Square 1×1 Plates (default)
  - Colors should be official lego colors
  - Info tooltips explaining each option

- **Action Buttons**:
  - "Generate Mosaic" primary button
  - "Reset" secondary button
  - Loading spinner during processing

**Results Display Panel** (Main Content Area):
- **Tab Navigation**:
  - Tab 1: Mosaic Preview
  - Tab 2: Building Instructions
  - Tab 3: Shopping List

- **Tab 1: Mosaic Preview**:
  - High-quality mosaic image display
  - Zoom controls (slider, +/- buttons, or pinch-to-zoom on mobile)
  - Pan functionality for zoomed images
  - Pixel size indicator
  - Download button (PNG format)

- **Tab 2: Building Instructions**:
  - Color-coded grid visualization
  - Numbered color legend panel
  - Option to show/hide grid lines
  - Print-friendly view option
  - Download button (PNG or PDF format)
  - Instructions on how to read the grid

- **Tab 3: Shopping List**:
  - Sortable table display:
    - Color swatch preview
    - Color name
    - Piece type
    - Quantity needed
  - Total piece count
  - Estimated cost (optional future feature)
  - Download buttons:
    - CSV (LEGO Pick-A-Brick compatible)
    - PDF (printable format)
  - Copy to clipboard functionality

#### 4.1.3 Feedback Component
- **Position**: Fixed bottom-right corner or modal
- **Elements**:
  - Thumbs up/down buttons
  - Text area for additional comments
  - Submit button
  - Thank you confirmation message
- **Behavior**:
  - Collapsible/expandable
  - Only show after mosaic generation
  - Optional user email for follow-up

#### 4.1.4 Mobile Responsive Design
- **Breakpoints**:
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px
- **Mobile Adaptations**:
  - Vertical layout with stacked sections
  - Bottom sheet for configuration panel
  - Touch-optimized controls
  - Simplified zoom/pan gestures

### 4.2 Core Features

#### 4.2.1 Image Upload & Validation
- **Supported Formats**: JPEG, PNG, WebP
- **Max File Size**: 10MB
- **Validation Rules**:
  - Minimum dimensions: 100×100px
  - Maximum dimensions: 8000×8000px
  - Aspect ratio guidance (square preferred)
- **Preprocessing**:
  - Automatic image cropping to square
  - Optional manual crop adjustment
  - Image rotation correction (EXIF orientation)

#### 4.2.2 Mosaic Generation Engine
- **Color Matching Algorithm**:
  - Convert uploaded image to target grid size
  - For each pixel/grid cell:
    - Extract RGB color values
    - Calculate closest LEGO color using color distance formula (Delta E or Euclidean distance in LAB color space)
    - Map to selected piece type palette
  - Optimize color distribution for visual quality

- **Performance Requirements**:
  - Processing time: < 5 seconds for 64×64 mosaic
  - < 15 seconds for 128×128 mosaic
  - Progress indicator for operations > 2 seconds

- **Output Data Structure**:
```typescript
interface MosaicData {
  sessionId: string;
  config: {
    baseplateSize: number;
    pieceType: 'round' | 'square' | 'comprehensive';
  };
  grid: Array<Array<{
    colorId: string;
    colorName: string;
    rgb: [number, number, number];
    hex: string;
  }>>;
  shoppingList: Array<{
    colorId: string;
    colorName: string;
    quantity: number;
    rgb: [number, number, number];
  }>;
  previewImage: string; // Base64 or URL
  createdAt: string;
}
```

#### 4.2.3 LEGO Color Palettes
- **Data Structure**:
```typescript
interface LegoColor {
  id: string;
  name: string;
  rgb: [number, number, number];
  hex: string;
  legoId?: string; // Official LEGO color ID if available
  pickABrickAvailable: boolean;
}

interface ColorPalette {
  name: string;
  type: 'round' | 'square' | 'comprehensive';
  colors: LegoColor[];
}
```
- **Source**: Port color definitions from existing `lego_colors*.py` files
- **Storage**: JSON files or database table
- **Management**: Admin interface for color palette updates (future enhancement)

#### 4.2.4 Export Functionality

**Mosaic Image Export (PNG)**:
- Render mosaic with configurable pixel size per stud
- High resolution (minimum 2000×2000px for 64×64 mosaic)
- Include watermark/branding (optional)

**Building Instructions Export (PNG/PDF)**:
- Generate color-coded grid with borders
- Create numbered color legend
- Include metadata (dimensions, piece count, creation date)
- Printer-friendly format with good contrast

**Shopping List Export (CSV)**:
- Format compatible with LEGO Pick-A-Brick import
- Columns: Color ID, Color Name, Quantity, Notes
- Include header row
- UTF-8 encoding

**Shopping List Export (PDF)**:
- Formatted table with color swatches
- Total piece count
- Generated date
- Instructions for ordering

#### 4.2.5 Analytics & Tracking
- **Events to Track**:
  - Page views
  - Image uploads (success/failure)
  - Mosaic generations (by baseplate size and piece type)
  - Downloads (by export type)
  - Feedback submissions
  - Errors and exceptions

- **Data Storage**:
  - PostgreSQL database with tables:
    - `analytics_events`
    - `user_feedback`
    - `error_logs`

- **Privacy Considerations**:
  - No personally identifiable information stored without consent
  - IP anonymization
  - GDPR compliance for EU users
  - Clear privacy policy

#### 4.2.6 Session Management
- **Session ID Generation**:
  - UUID v4 for unique session identification
  - Stored in browser localStorage or sessionStorage

- **Session Data**:
  - Mosaic configuration
  - Generated mosaic data (cached server-side)
  - User preferences

- **Cache Expiration**:
  - Server-side cache: 24 hours
  - Client-side: Until browser close (sessionStorage) or 30 days (localStorage)

---

## 5. API Specifications

### 5.1 RESTful API Endpoints

#### Base URL
- Development: `http://localhost:3000/api/v1`
- Production: `https://api.mosaic-me.com/v1`

#### Authentication
- Phase 1: No authentication required (public API with rate limiting)
- Phase 2: Optional API key for analytics and rate limit increases

#### Rate Limiting
- Default: 60 requests per hour per IP
- Upload endpoint: 10 uploads per hour per IP
- Rate limit headers included in responses

### 5.2 Endpoint Details

#### POST `/upload`
Upload an image for mosaic generation.

**Request**:
```
Content-Type: multipart/form-data

{
  file: <binary>,
  baseplateSize: number (32|48|64|96|128),
  pieceType: string ('round'|'square'|'comprehensive')
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "sessionId": "uuid-v4-string",
  "mosaic": {
    "previewUrl": "https://cdn.example.com/previews/session-id.png",
    "grid": [[...]],
    "shoppingList": [...],
    "metadata": {
      "baseplateSize": 64,
      "pieceType": "square",
      "totalPieces": 4096,
      "uniqueColors": 24,
      "createdAt": "2025-12-11T10:30:00Z"
    }
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "File must be JPEG, PNG, or WebP format",
    "details": {}
  }
}
```

#### GET `/demo`
Load a demo mosaic without uploading an image.

**Query Parameters**:
- `baseplateSize` (optional): number (default: 48)
- `pieceType` (optional): string (default: 'square')

**Response** (200 OK):
```json
{
  "success": true,
  "sessionId": "uuid-v4-string",
  "mosaic": { /* same structure as upload response */ }
}
```

#### GET `/mosaic/:sessionId`
Retrieve a previously generated mosaic.

**Response** (200 OK):
```json
{
  "success": true,
  "mosaic": { /* mosaic data */ }
}
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "error": {
    "code": "SESSION_NOT_FOUND",
    "message": "Mosaic session not found or expired"
  }
}
```

#### GET `/export/:sessionId/:type`
Export mosaic in specified format.

**Path Parameters**:
- `sessionId`: string (UUID)
- `type`: string ('mosaic-png'|'instructions-png'|'instructions-pdf'|'shopping-csv'|'shopping-pdf')

**Query Parameters**:
- `pixelSize` (optional for image exports): number (default: 10)

**Response** (200 OK):
```
Content-Type: image/png | application/pdf | text/csv
Content-Disposition: attachment; filename="mosaic-{sessionId}.{ext}"

<binary file data>
```

#### POST `/feedback`
Submit user feedback.

**Request**:
```json
{
  "sessionId": "uuid-v4-string",
  "rating": "positive" | "negative",
  "comment": "string (optional, max 1000 chars)",
  "email": "string (optional)"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Thank you for your feedback!"
}
```

#### GET `/palettes`
Get available color palettes.

**Response** (200 OK):
```json
{
  "success": true,
  "palettes": [
    {
      "id": "round",
      "name": "Round 1×1 Plates",
      "type": "round",
      "colorCount": 42
    },
    {
      "id": "square",
      "name": "Square 1×1 Plates",
      "type": "square",
      "colorCount": 56
    },
    {
      "id": "comprehensive",
      "name": "Comprehensive Colors",
      "type": "comprehensive",
      "colorCount": 89
    }
  ]
}
```

#### GET `/palettes/:type/colors`
Get detailed color information for a specific palette.

**Response** (200 OK):
```json
{
  "success": true,
  "palette": {
    "id": "square",
    "name": "Square 1×1 Plates",
    "colors": [
      {
        "id": "red-001",
        "name": "Bright Red",
        "rgb": [196, 40, 27],
        "hex": "#C4281B",
        "legoId": "21",
        "pickABrickAvailable": true
      },
      // ... more colors
    ]
  }
}
```

#### GET `/health`
Health check endpoint.

**Response** (200 OK):
```json
{
  "status": "healthy",
  "timestamp": "2025-12-11T10:30:00Z",
  "version": "1.0.0"
}
```

---

## 6. Database Schema

### 6.1 PostgreSQL Tables

#### Table: `analytics_events`
```sql
CREATE TABLE analytics_events (
  id BIGSERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  session_id UUID,
  baseplate_size INTEGER,
  piece_type VARCHAR(20),
  export_type VARCHAR(50),
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at);
CREATE INDEX idx_analytics_session_id ON analytics_events(session_id);
```

#### Table: `user_feedback`
```sql
CREATE TABLE user_feedback (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL,
  rating VARCHAR(10) NOT NULL CHECK (rating IN ('positive', 'negative')),
  comment TEXT,
  email VARCHAR(255),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_feedback_session_id ON user_feedback(session_id);
CREATE INDEX idx_feedback_created_at ON user_feedback(created_at);
```

#### Table: `color_palettes` (Optional)
```sql
CREATE TABLE color_palettes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('round', 'square', 'comprehensive')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE palette_colors (
  id SERIAL PRIMARY KEY,
  palette_id INTEGER REFERENCES color_palettes(id) ON DELETE CASCADE,
  color_id VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  rgb_r INTEGER NOT NULL CHECK (rgb_r BETWEEN 0 AND 255),
  rgb_g INTEGER NOT NULL CHECK (rgb_g BETWEEN 0 AND 255),
  rgb_b INTEGER NOT NULL CHECK (rgb_b BETWEEN 0 AND 255),
  hex VARCHAR(7) NOT NULL,
  lego_id VARCHAR(20),
  pick_a_brick_available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX idx_palette_colors_palette_id ON palette_colors(palette_id);
```

### 6.2 Redis Cache Structure

#### Session Data
```
Key: session:{sessionId}
Type: Hash
TTL: 86400 (24 hours)
Fields:
  - config: JSON string of mosaic configuration
  - grid: JSON string of color grid
  - shoppingList: JSON string of shopping list
  - previewUrl: String URL to preview image
  - createdAt: ISO timestamp
```

#### Rate Limiting
```
Key: ratelimit:{endpoint}:{ipAddress}
Type: String (counter)
TTL: 3600 (1 hour)
Value: Request count
```

---

## 7. Non-Functional Requirements

### 7.1 Performance

- **Page Load Time**: < 2 seconds (initial load)
- **Time to Interactive (TTI)**: < 3 seconds
- **API Response Times**:
  - `/upload` endpoint: < 5 seconds for 64×64 mosaic
  - `/export` endpoints: < 2 seconds
  - Other endpoints: < 500ms
- **Image Processing**:
  - Background processing for large mosaics (128×128)
  - Progress updates via WebSocket or polling
- **Frontend Performance**:
  - Lighthouse score > 90 for Performance, Accessibility, Best Practices
  - First Contentful Paint (FCP) < 1.5s
  - Largest Contentful Paint (LCP) < 2.5s
  - Cumulative Layout Shift (CLS) < 0.1

### 7.2 Scalability

- **Concurrent Users**: Support 1000+ simultaneous users
- **Image Processing**: Queue system for handling spikes (Bull, BullMQ, or AWS SQS)
- **Horizontal Scaling**: Stateless API servers for easy scaling
- **CDN**: Serve static assets via CDN (Cloudflare, CloudFront)
- **Database Connection Pooling**: PgBouncer or built-in connection pooling

### 7.3 Security

- **Input Validation**:
  - Strict file type validation (magic number checking)
  - File size limits enforced
  - Image content scanning for malicious payloads
- **API Security**:
  - CORS configuration for trusted domains
  - Rate limiting per IP and per endpoint
  - Request size limits
  - HTTPS only in production
  - Security headers (Helmet.js or equivalent)
- **Data Protection**:
  - Automatic deletion of uploaded images after 24 hours
  - No storage of personal data without consent
  - SQL injection prevention (parameterized queries)
  - XSS prevention (input sanitization, CSP headers)
- **Dependencies**:
  - Regular security audits (npm audit, Snyk)
  - Automated dependency updates (Dependabot)

### 7.4 Reliability

- **Uptime Target**: 99.5% (allows ~3.6 hours downtime per month)
- **Error Handling**:
  - Graceful degradation
  - User-friendly error messages
  - Automatic retry for transient failures
  - Circuit breaker pattern for external services
- **Data Backup**:
  - Daily PostgreSQL backups
  - Point-in-time recovery capability
  - Backup retention: 30 days
- **Monitoring**:
  - Health check endpoints
  - Error rate tracking
  - Response time monitoring
  - Resource utilization alerts

### 7.5 Accessibility

- **WCAG Compliance**: Level AA minimum
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Keyboard Navigation**: Full functionality without mouse
- **Color Contrast**: Minimum 4.5:1 for text
- **Focus Indicators**: Visible focus states
- **Responsive Text**: Support browser zoom up to 200%

### 7.6 Browser Support

- **Modern Browsers**:
  - Chrome/Edge: Last 2 versions
  - Firefox: Last 2 versions
  - Safari: Last 2 versions
  - Mobile Safari (iOS): Last 2 versions
  - Chrome Android: Last 2 versions
- **Graceful Degradation**: Basic functionality on older browsers

---

## 8. Project Structure

### 8.1 Frontend Directory Structure (React + Vite)

```
frontend/
├── public/
│   ├── demo-images/
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── assets/
│   │   ├── images/
│   │   └── icons/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── Toast.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Layout.tsx
│   │   ├── upload/
│   │   │   ├── ImageUploader.tsx
│   │   │   ├── DragDropZone.tsx
│   │   │   └── ImagePreview.tsx
│   │   ├── configuration/
│   │   │   ├── ConfigPanel.tsx
│   │   │   ├── BaseplateSelector.tsx
│   │   │   └── PieceTypeSelector.tsx
│   │   ├── results/
│   │   │   ├── ResultsTabs.tsx
│   │   │   ├── MosaicPreview.tsx
│   │   │   ├── BuildingInstructions.tsx
│   │   │   ├── ShoppingList.tsx
│   │   │   └── ZoomControls.tsx
│   │   ├── feedback/
│   │   │   └── FeedbackWidget.tsx
│   │   └── home/
│   │       ├── Hero.tsx
│   │       ├── Features.tsx
│   │       └── Gallery.tsx
│   ├── hooks/
│   │   ├── useImageUpload.ts
│   │   ├── useMosaicGeneration.ts
│   │   ├── useExport.ts
│   │   └── useAnalytics.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── analytics.ts
│   │   └── storage.ts
│   ├── store/
│   │   ├── mosaicStore.ts
│   │   ├── uiStore.ts
│   │   └── index.ts
│   ├── types/
│   │   ├── mosaic.ts
│   │   ├── api.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── imageValidation.ts
│   │   ├── colorConversion.ts
│   │   └── fileDownload.ts
│   ├── styles/
│   │   └── globals.css
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── tests/
│   ├── components/
│   ├── hooks/
│   └── utils/
├── .env.example
├── .eslintrc.json
├── .prettierrc
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

### 8.2 Backend Directory Structure (Node.js/Express)

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   ├── storage.ts
│   │   └── index.ts
│   ├── controllers/
│   │   ├── uploadController.ts
│   │   ├── mosaicController.ts
│   │   ├── exportController.ts
│   │   ├── feedbackController.ts
│   │   └── paletteController.ts
│   ├── services/
│   │   ├── imageProcessor.ts
│   │   ├── mosaicGenerator.ts
│   │   ├── colorMatcher.ts
│   │   ├── exportService.ts
│   │   ├── analyticsService.ts
│   │   └── storageService.ts
│   ├── middleware/
│   │   ├── errorHandler.ts
│   │   ├── validator.ts
│   │   ├── rateLimiter.ts
│   │   ├── fileUpload.ts
│   │   └── cors.ts
│   ├── models/
│   │   ├── AnalyticsEvent.ts
│   │   ├── Feedback.ts
│   │   └── ColorPalette.ts
│   ├── routes/
│   │   ├── upload.ts
│   │   ├── mosaic.ts
│   │   ├── export.ts
│   │   ├── feedback.ts
│   │   ├── palette.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── cache.ts
│   │   ├── colorDistance.ts
│   │   └── fileHelper.ts
│   ├── data/
│   │   ├── palettes/
│   │   │   ├── round.json
│   │   │   ├── square.json
│   │   │   └── comprehensive.json
│   │   └── demo-images/
│   ├── types/
│   │   ├── mosaic.d.ts
│   │   ├── api.d.ts
│   │   └── index.d.ts
│   ├── app.ts
│   └── server.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── migrations/
│   └── 001_initial_schema.sql
├── .env.example
├── .eslintrc.json
├── .prettierrc
├── package.json
├── tsconfig.json
└── nodemon.json
```

---

## 9. Development Phases

### Phase 1: Foundation (Weeks 1-2)
- [ ] Project setup and repository initialization
- [ ] Frontend framework setup (React + Vite/Next.js)
- [ ] Backend API framework setup (Express/FastAPI)
- [ ] Database setup (PostgreSQL + Redis)
- [ ] Basic UI layout and routing
- [ ] API endpoint stubs
- [ ] CI/CD pipeline configuration

### Phase 2: Core Features (Weeks 3-5)
- [ ] Image upload functionality
- [ ] Image validation and preprocessing
- [ ] Color palette data migration from original repo
- [ ] Mosaic generation algorithm implementation
- [ ] Color matching logic
- [ ] Basic mosaic preview display
- [ ] Session management

### Phase 3: Results & Export (Weeks 6-7)
- [ ] Three-tab results interface
- [ ] Mosaic preview with zoom/pan
- [ ] Building instructions generation and display
- [ ] Shopping list generation and display
- [ ] PNG export functionality
- [ ] CSV export functionality
- [ ] PDF export functionality (optional)

### Phase 4: Enhancement & Polish (Week 8)
- [ ] Feedback widget implementation
- [ ] Analytics tracking integration
- [ ] Error handling and user feedback
- [ ] Loading states and progress indicators
- [ ] Responsive design refinement
- [ ] Accessibility improvements
- [ ] Performance optimization

### Phase 5: Testing & Deployment (Weeks 9-10)
- [ ] Unit testing (frontend + backend)
- [ ] Integration testing
- [ ] E2E testing
- [ ] Performance testing and optimization
- [ ] Security audit
- [ ] Production deployment
- [ ] Monitoring setup
- [ ] Documentation completion

### Phase 6: Launch & Iteration (Week 11+)
- [ ] Soft launch and user testing
- [ ] Bug fixes based on feedback
- [ ] Performance tuning
- [ ] Official launch
- [ ] Continuous monitoring and improvements

---

## 10. Future Enhancements (Post-MVP)

### User Accounts & Features
- User registration and authentication
- Save and manage multiple mosaics
- Project history and gallery
- Social sharing functionality

### Advanced Mosaic Options
- Non-square image support with auto-cropping
- Custom color palette creation
- Advanced dithering options
- Multiple piece sizes (1×1, 2×2, etc.)
- 3D preview rendering

### E-commerce Integration
- Direct integration with LEGO Pick-A-Brick API
- Price estimation
- One-click ordering
- Alternative brick seller integrations (BrickLink, BrickOwl)

### Collaboration Features
- Share mosaic designs with unique URLs
- Collaborative building instructions
- Community gallery of user creations
- Like/favorite system

### Mobile App
- Native iOS and Android apps
- Camera integration for instant mosaic creation
- AR preview of completed mosaic

### Pro Features (Potential Monetization)
- Larger baseplate sizes (256×256, 512×512)
- High-resolution exports (4K, 8K)
- Commercial use license
- Batch processing
- API access for developers
- Priority processing queue

---

## 11. Success Metrics

### Key Performance Indicators (KPIs)

#### User Engagement
- Monthly active users (MAU)
- Average session duration
- Mosaic generation completion rate
- Export download rate
- Return user percentage

#### Technical Performance
- Average page load time
- API response time (P95, P99)
- Error rate (< 1%)
- Uptime percentage
- Successful mosaic generation rate (> 95%)

#### User Satisfaction
- Positive feedback ratio (target: > 70%)
- Net Promoter Score (NPS)
- Average rating (if implemented)
- Support ticket volume

#### Business Metrics (Future)
- Conversion rate (free to paid, if applicable)
- Cost per mosaic generation
- Infrastructure costs vs. usage
- API usage (if opened to developers)

---

## 12. Risk Assessment & Mitigation

### Technical Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Image processing performance issues | High | Medium | Implement background job queue, optimize algorithms, use WebAssembly for client-side processing |
| Storage costs exceed budget | Medium | Medium | Implement aggressive cleanup policies, use compression, consider cheaper storage alternatives |
| Database performance degradation | High | Low | Implement proper indexing, use caching extensively, regular query optimization |
| API rate limiting abuse | Medium | Medium | Implement robust rate limiting, IP-based throttling, CAPTCHA for suspicious activity |
| Browser compatibility issues | Low | Low | Thorough cross-browser testing, progressive enhancement strategy |

### Business Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Low user adoption | High | Medium | Marketing strategy, community engagement, feature differentiation |
| LEGO trademark/IP concerns | High | Low | Clear disclaimers, no official LEGO branding, educational fair use |
| Hosting costs unsustainable | Medium | Low | Start with serverless/affordable hosting, scale as needed, monitor costs closely |
| Competitor launches similar product | Medium | Medium | Focus on unique features, superior UX, community building |

---

## 13. Deployment Strategy

### Development Environment
- Local development with Docker Compose
- Hot module reloading for frontend and backend
- Local PostgreSQL and Redis instances
- Environment variable management with `.env` files

### Staging Environment
- Mirror of production configuration
- Deployed automatically on merge to `develop` branch
- Full testing suite runs before deployment
- Accessible via staging subdomain

### Production Environment
- Deployed on merge to `main` branch (manual approval)
- Blue-green deployment or rolling updates
- Automatic rollback on health check failures
- Database migrations run before application deployment

### Monitoring & Observability
- Application logs aggregated (Logstash, Datadog, or CloudWatch)
- Error tracking (Sentry)
- Performance monitoring (New Relic or Application Insights)
- Uptime monitoring (UptimeRobot or Pingdom)
- Custom dashboards for KPIs

---

## 14. Documentation Requirements

### Developer Documentation
- README with setup instructions
- API documentation (OpenAPI/Swagger)
- Architecture decision records (ADRs)
- Code commenting standards
- Contributing guidelines

### User Documentation
- FAQ section
- How-to guides
- Video tutorials (optional)
- Troubleshooting guide
- Privacy policy and terms of service

### Operational Documentation
- Deployment procedures
- Disaster recovery plan
- Incident response playbook
- Monitoring and alerting setup
- Database backup and restore procedures

---

## 15. Compliance & Legal

### Privacy & Data Protection
- GDPR compliance for EU users
- CCPA compliance for California users
- Clear privacy policy
- Cookie consent mechanism
- Data deletion requests process

### Intellectual Property
- Disclaimers regarding LEGO trademarks
- User-generated content ownership
- Open-source license (if applicable)
- Third-party library attributions

### Terms of Service
- Acceptable use policy
- Content guidelines
- Liability limitations
- Dispute resolution process

---

## 16. Budget Estimates (Monthly, Production)

### Infrastructure Costs
- **Hosting (Frontend)**: $0-20 (Vercel/Netlify free tier or basic plan)
- **Hosting (Backend)**: $20-50 (Railway, Render, or similar)
- **Database (PostgreSQL)**: $15-25 (Managed service)
- **Redis Cache**: $10-20 (Managed service or included with backend hosting)
- **File Storage**: $5-20 (S3 or similar, depends on usage)
- **CDN**: $0-10 (Cloudflare free tier or basic)
- **Domain & SSL**: $1-2 (amortized annual cost)

**Total Estimated Monthly Cost**: $51-147 (can scale down or up based on usage)

### Development Costs (One-time)
- Assumes single developer or small team
- 10-11 weeks of development based on phase plan
- Additional costs for third-party services (if any)

---

## 17. Contact & Maintenance

### Project Owner
- Name: [To be filled]
- Email: [To be filled]
- GitHub: jonathantiedchen

### Maintenance Plan
- Weekly dependency updates
- Monthly security audits
- Quarterly feature reviews
- Continuous bug fixes and improvements
- Community-driven feature requests

---

## Appendix A: Color Distance Algorithms

For accurate LEGO color matching, implement one of these algorithms:

### Option 1: Euclidean Distance in RGB Space
```typescript
function colorDistance(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const [r1, g1, b1] = rgb1;
  const [r2, g2, b2] = rgb2;
  return Math.sqrt(
    Math.pow(r2 - r1, 2) +
    Math.pow(g2 - g1, 2) +
    Math.pow(b2 - b1, 2)
  );
}
```

### Option 2: Delta E (CIE76) - More Perceptually Accurate
```typescript
// Requires RGB to LAB color space conversion first
function deltaE76(lab1: [number, number, number], lab2: [number, number, number]): number {
  const [l1, a1, b1] = lab1;
  const [l2, a2, b2] = lab2;
  return Math.sqrt(
    Math.pow(l2 - l1, 2) +
    Math.pow(a2 - a1, 2) +
    Math.pow(b2 - b1, 2)
  );
}
```

Recommendation: Use Delta E for better perceptual color matching, especially important for LEGO mosaics.

---

## Appendix B: Environment Variables

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Mosaic-Me
VITE_MAX_FILE_SIZE=10485760
VITE_ANALYTICS_ENABLED=true
VITE_SENTRY_DSN=
```

### Backend (.env)
```bash
NODE_ENV=development
PORT=3000
API_VERSION=v1

DATABASE_URL=postgresql://user:password@localhost:5432/mosaicme
REDIS_URL=redis://localhost:6379

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_REGION=us-east-1

CORS_ORIGIN=http://localhost:5173
MAX_FILE_SIZE=10485760
SESSION_TTL=86400

RATE_LIMIT_WINDOW=3600000
RATE_LIMIT_MAX_REQUESTS=60

SENTRY_DSN=
LOG_LEVEL=info
```

---

**End of Specifications Document**

*This document is subject to updates and refinements throughout the development process.*
