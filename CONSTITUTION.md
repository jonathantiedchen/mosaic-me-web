# Mosaic-Me Web Application - Constitution

**Version**: 1.0.0
**Last Updated**: December 11, 2025
**Purpose**: Define the core principles and essential features for a lean, functional LEGO mosaic web application

---

## Core Philosophy

This application adheres to minimalist principles:
- **Lean by design**: Use the minimum viable toolset to achieve functionality
- **No redundancy**: Each tool and feature must serve a distinct purpose
- **Functional first**: Prioritize working features over extensive options
- **Simple architecture**: Straightforward data flows and clear separation of concerns

---

## Technology Stack (Minimal)

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (single styling solution)
- **State Management**: React Context + Hooks (no external state library)
- **File Upload**: Native HTML5 + react-dropzone
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI (Python 3.11+) - leverages existing mosaic-me utilities
- **Image Processing**: Pillow + NumPy
- **Database**: PostgreSQL (single database for all persistent data)
- **File Storage**: Local filesystem (MVP), S3-compatible for production

### Infrastructure
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Railway or Render
- **Database**: Managed PostgreSQL service
- **No separate cache layer** (in-memory caching only)
- **No CDN initially** (add when traffic justifies)

---

## Essential Features Only

### 1. Image Upload
- Single drag-and-drop zone
- File validation (JPEG, PNG, WebP)
- Max size: 10MB
- Auto-crop to square
- Clear error messages

### 2. Configuration
- Baseplate size selector: 32×32, 48×48, 64×64, 96×96, 128×128 studs
- Piece type selector: Round 1×1 Plates, Square 1×1 Plates
- Official LEGO colors only
- Generate button

### 3. Mosaic Generation
- Process uploaded image
- Apply color matching (Delta E algorithm for accuracy)
- Generate color grid
- Create shopping list
- Return results in single API response

### 4. Results Display (3 Tabs)
**Tab 1: Mosaic Preview**
- Display generated mosaic
- Basic zoom controls
- Download as PNG

**Tab 2: Building Instructions**
- Color-coded grid
- Numbered color legend
- Download as PNG

**Tab 3: Shopping List**
- Table: color swatch, name, quantity
- Total piece count
- Download as CSV

### 5. Export Functionality
- PNG exports (mosaic + instructions)
- CSV export (shopping list)
- No PDF generation initially

---
## To be added features
- Feedback widget
- Advanced analytics dashboard
- PDF exports
- Image editing/cropping tools
- 3D Preview
- Estimated pricing
- Autmoatic Creation of shopping cart on lego website


---

## Excluded Features (For Lean MVP)

The following are explicitly **NOT** included in the initial version:

- ❌ User authentication/accounts
- ❌ Session persistence across devices
- ❌ Demo images (users upload their own)
- ❌ Redis caching
- ❌ Multiple storage backends
- ❌ Social sharing
- ❌ Custom color palettes
- ❌ Landing page/marketing site (single-page app)
- ❌ Multiple export pixel sizes (one default)

---

## API Endpoints (Minimal Set)

### POST /api/v1/upload
Upload image and generate mosaic in one call
- **Input**: Image file, baseplateSize, pieceType
- **Output**: Session ID, mosaic data, preview URL

### GET /api/v1/export/:sessionId/:type
Download export file
- **Types**: `mosaic-png`, `instructions-png`, `shopping-csv`
- **Output**: File stream

### GET /api/v1/palettes
Get available color palettes
- **Output**: List of available piece types with color counts

### GET /api/v1/health
Health check endpoint

**Total Endpoints**: 4 (versus 8+ in full spec)

---

## Data Storage Strategy

### PostgreSQL Tables (Minimal)
1. **sessions** - Store mosaic data temporarily (24hr TTL)
   - session_id (UUID)
   - mosaic_data (JSONB)
   - created_at (timestamp)

2. **analytics_events** (optional, basic logging only)
   - event_type
   - session_id
   - created_at
   - metadata (JSONB)

**No separate tables for**:
- User feedback (excluded feature)
- Color palettes (use JSON files)
- User accounts (no authentication)

### File Storage
- Original uploads: Temporary directory (auto-delete after 1 hour)
- Generated exports: Temporary directory (auto-delete after 24 hours)
- No permanent file storage initially

---

## Performance Targets (Realistic)

- Page load: < 3 seconds
- Mosaic generation (64×64): < 10 seconds
- Export generation: < 3 seconds
- API response (non-processing): < 1 second

**No complex optimization initially** - profile and optimize only if needed

---

## Security Essentials

Implement only critical security measures:
1. File type validation (magic number checking)
2. File size limits
3. Rate limiting (60 req/hour per IP)
4. HTTPS in production
5. CORS for known frontend domain
6. Basic input sanitization

**Skip initially**:
- Complex authentication
- Advanced threat detection
- Multiple security layers

---

## Development Workflow

### Simple Three-Environment Setup
1. **Local**: Development with local DB
2. **Staging**: Auto-deploy from `develop` branch
3. **Production**: Manual deploy from `main` branch

### Testing Strategy (Lean)
- Unit tests for core algorithms (color matching, mosaic generation)
- Integration tests for API endpoints
- Manual E2E testing initially
- No automated E2E tests until post-MVP

### CI/CD
- GitHub Actions for basic linting and tests
- No complex deployment pipelines initially

---

## Project Structure (Simplified)

### Frontend
```
src/
├── components/
│   ├── ImageUpload.tsx
│   ├── ConfigPanel.tsx
│   ├── ResultsTabs.tsx
│   └── ExportButtons.tsx
├── hooks/
│   ├── useMosaic.ts
│   └── useExport.ts
├── services/
│   └── api.ts
├── types/
│   └── index.ts
├── App.tsx
└── main.tsx
```

### Backend
```
src/
├── api/
│   ├── upload.py
│   ├── export.py
│   └── palette.py
├── services/
│   ├── mosaic_generator.py
│   ├── color_matcher.py
│   └── export_service.py
├── data/
│   ├── palettes/
│   └── demo-image.jpg (single demo)
├── main.py
└── config.py
```

**Total files**: ~20-25 (versus 50+ in full spec)

---

## Success Criteria

An MVP is successful if it:
1. ✅ Accepts image uploads reliably
2. ✅ Generates accurate LEGO color mosaics
3. ✅ Provides downloadable results (PNG + CSV)
4. ✅ Works on desktop and mobile browsers
5. ✅ Handles errors gracefully
6. ✅ Processes 64×64 mosaics in < 10 seconds
7. ✅ Costs < $50/month to operate

**Avoid feature creep** - only add features after MVP validation

---

## Constraints & Boundaries

### Hard Limits
- Maximum baseplate size: 128×128 (prevents resource exhaustion)
- Maximum file upload: 10MB
- Session data retention: 24 hours
- Rate limit: 60 requests/hour per IP
- Export file retention: 24 hours

---

## Conclusion

This constitution serves as a contract to maintain application simplicity. Every line of code, every dependency, every feature must justify its existence by serving the core mission:

> **Transform photographs into LEGO mosaic artwork with building instructions and shopping lists - simply and efficiently.**

Any proposal to deviate from these principles must provide clear evidence that the benefit outweighs the cost of added complexity.

**Simplicity is not just a phase - it's the permanent architecture.**

---

**Approved By**: Project Owner
**Review Date**: Quarterly (or when major features proposed)
